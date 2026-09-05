import {NextResponse}from "next/server";
import {z}from "zod";
import {allowRequest}from "@/lib/rate-limit";
import {createClient}from "@/lib/supabase/server";
import {normalizeMexicanPhone}from "@/lib/phone";
import {createAdminClient}from "@/lib/supabase/admin";
import {recordLegalAcceptances}from "@/lib/legal-consent";
import {LEGAL_VERSION}from "@/lib/legal-documents";

const schema=z.object({mode:z.enum(["create","signin"]),token:z.string().min(30).max(200),phone:z.string().trim().max(24),recoveryEmail:z.union([z.literal(""),z.string().email().max(254)]).optional().default(""),password:z.string().min(8).max(128),name:z.string().trim().min(2).max(100).optional().default(""),acceptTerms:z.boolean().optional().default(false),acceptPrivacy:z.boolean().optional().default(false),termsVersion:z.string().max(30).optional().default(""),privacyVersion:z.string().max(30).optional().default("")});

export async function POST(request:Request){
  if(!await allowRequest(request,"managed_claim",10,900))return NextResponse.json({error:"Demasiados intentos. Espera unos minutos."},{status:429});
  const parsed=schema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"Revisa celular, contraseña y los datos solicitados."},{status:400});
  const value=parsed.data,phone=normalizeMexicanPhone(parsed.data.phone),supabase=await createClient();
  if(!phone)return NextResponse.json({error:"Escribe un celular mexicano de 10 dígitos."},{status:400});

  let createdUserId="";
  let creationAdmin:ReturnType<typeof createAdminClient>=null;
  if(value.mode==="create"){
    if(value.name.length<2)return NextResponse.json({error:"Escribe tu nombre."},{status:400});
    if(!value.acceptTerms||!value.acceptPrivacy)return NextResponse.json({error:"Debes aceptar los Términos y la Política de Privacidad."},{status:400});
    if(value.termsVersion!==LEGAL_VERSION||value.privacyVersion!==LEGAL_VERSION)return NextResponse.json({error:"Los documentos legales cambiaron. Recarga la página para revisar la versión vigente."},{status:409});
    const admin=createAdminClient();creationAdmin=admin;
    if(!admin)return NextResponse.json({error:"Servicio temporalmente no disponible."},{status:503});
    const{data:created,error}=await admin.auth.admin.createUser({phone,password:value.password,phone_confirm:true,user_metadata:{display_name:value.name,phone,role:"customer"}});
    if(error||!created.user)return NextResponse.json({error:"No pudimos crear la cuenta. Revisa el número o elige Iniciar sesión."},{status:409});
    createdUserId=created.user.id;
    const legal=await recordLegalAcceptances({admin,userId:created.user.id,source:"claim",request,input:value});
    if(!legal.ok){await admin.auth.admin.deleteUser(created.user.id);return NextResponse.json({error:legal.error},{status:legal.status})}
    const{error:loginError}=await supabase.auth.signInWithPassword({phone,password:value.password});
    if(loginError){await admin.auth.admin.deleteUser(created.user.id);return NextResponse.json({error:"No pudimos iniciar la cuenta."},{status:500})}
    if(value.recoveryEmail){await supabase.auth.updateUser({email:value.recoveryEmail},{emailRedirectTo:`${process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000"}/auth/callback?next=/cuenta`});await admin.from("profiles").update({recovery_email:value.recoveryEmail}).eq("id",created.user.id)}
  }else{
    const{error}=await supabase.auth.signInWithPassword({phone,password:value.password});
    if(error)return NextResponse.json({error:"Número o contraseña incorrectos."},{status:401});
  }

  const{data,error}=await supabase.rpc("claim_managed_entity",{p_token:value.token,p_phone_last4:phone.slice(-4)});
  if(error){if(createdUserId&&creationAdmin){await supabase.auth.signOut();await creationAdmin.auth.admin.deleteUser(createdUserId)}return NextResponse.json({error:error.message.includes("phone")?"Debes usar el mismo celular asociado al perfil.":error.message.includes("owned")?"Esta cuenta ya administra otro perfil de prestador.":"El enlace no es válido, expiró o ya fue utilizado."},{status:409})}
  const claimed=Array.isArray(data)?data[0]:data;
  return NextResponse.json({destination:"/dashboard",kind:claimed?.kind,slug:claimed?.slug});
}
