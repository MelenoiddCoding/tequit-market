import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeMexicanPhone } from "@/lib/phone";

const schema=z.object({accountType:z.enum(["customer","provider","business"]),name:z.string().trim().min(2).max(100),profession:z.string().trim().max(100).optional().default(""),recoveryEmail:z.union([z.literal(""),z.string().email().max(254)]).optional().default(""),phone:z.string().trim().max(24),zone:z.string().trim().max(120).optional().default("Tepic, Nayarit"),password:z.string().min(8).max(128),bio:z.string().trim().max(1000).optional().default(""),firstService:z.string().trim().max(100).optional().default(""),website:z.string().max(0).optional()});

export async function POST(request:Request){
  if(!await allowRequest(request,"register",5,3600))return NextResponse.json({error:"Se alcanzó el límite de registros. Intenta más tarde."},{status:429});
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Revisa los datos del registro."},{status:400});
  const value=parsed.data;const phone=normalizeMexicanPhone(value.phone);if(!phone)return NextResponse.json({error:"Escribe un celular mexicano de 10 dígitos."},{status:400});if(value.accountType!=="customer"&&(value.profession.length<2||value.bio.length<20||value.firstService.length<3))return NextResponse.json({error:"Completa profesión, descripción y primer servicio."},{status:400});
  const role=value.accountType==="business"?"business_owner":value.accountType;
  const admin=createAdminClient();if(!admin)return NextResponse.json({error:"Servicio temporalmente no disponible."},{status:503});const{data:created,error}=await admin.auth.admin.createUser({phone,password:value.password,phone_confirm:true,user_metadata:{display_name:value.name,phone,role}});
  if(error||!created.user)return NextResponse.json({error:"No pudimos crear la cuenta. Revisa el número o intenta iniciar sesión."},{status:409});
  const supabase=await createClient();const{data,error:loginError}=await supabase.auth.signInWithPassword({phone,password:value.password});if(loginError||!data.user){await admin.auth.admin.deleteUser(created.user.id);return NextResponse.json({error:"No pudimos iniciar la cuenta."},{status:500})}
  let onboardingError:string|undefined;
  if(value.accountType==="provider"){const{error:rpcError}=await supabase.rpc("complete_provider_onboarding",{p_name:value.name,p_profession:value.profession,p_phone:phone,p_zone:value.zone,p_bio:value.bio,p_first_service:value.firstService});onboardingError=rpcError?.message}
  if(value.accountType==="business"){const{error:rpcError}=await supabase.rpc("complete_business_onboarding",{p_name:value.name,p_category:value.profession,p_phone:phone,p_zone:value.zone,p_description:value.bio,p_first_service:value.firstService});onboardingError=rpcError?.message}
  if(onboardingError){await admin.auth.admin.deleteUser(data.user.id);return NextResponse.json({error:"No pudimos completar el perfil. Intenta de nuevo."},{status:500})}
  let recoveryPending=false;if(value.recoveryEmail){const{error:emailError}=await supabase.auth.updateUser({email:value.recoveryEmail},{emailRedirectTo:`${process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000"}/auth/callback?next=/cuenta`});if(!emailError){recoveryPending=true;await admin.from("profiles").update({recovery_email:value.recoveryEmail,recovery_email_verified_at:null}).eq("id",data.user.id)}}
  return NextResponse.json({role,recoveryPending,destination:value.accountType==="customer"?"/cuenta":"/dashboard"},{status:201});
}
