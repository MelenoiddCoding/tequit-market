import {NextResponse} from "next/server";
import {z} from "zod";
import {allowRequest} from "@/lib/rate-limit";
import {createAdminClient} from "@/lib/supabase/admin";
import {normalizeMexicanPhone} from "@/lib/phone";
import {createRegistrationOtp} from "@/lib/registration-otp";
import {sendBirdWhatsAppOtp} from "@/lib/bird";
import {recordLegalAcceptances}from "@/lib/legal-consent";
import {LEGAL_VERSION}from "@/lib/legal-documents";

const schema=z.object({accountType:z.enum(["customer","provider","business"]),name:z.string().trim().min(2).max(100),profession:z.string().trim().max(100).optional().default(""),recoveryEmail:z.union([z.literal(""),z.string().email().max(254)]).optional().default(""),phone:z.string().trim().max(24),zone:z.string().trim().max(120).optional().default("Tepic, Nayarit"),password:z.string().min(8).max(128),bio:z.string().trim().max(1000).optional().default(""),firstService:z.string().trim().max(100).optional().default(""),website:z.string().max(0).optional(),acceptTerms:z.boolean(),acceptPrivacy:z.boolean(),termsVersion:z.string().max(30),privacyVersion:z.string().max(30)});

export async function POST(request:Request){
  if(!await allowRequest(request,"register",5,3600))return NextResponse.json({error:"Se alcanzó el límite de registros. Intenta más tarde."},{status:429});
  const parsed=schema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Revisa los datos del registro."},{status:400});
  const value=parsed.data;
  if(!value.acceptTerms||!value.acceptPrivacy)return NextResponse.json({error:"Debes aceptar los Términos y la Política de Privacidad."},{status:400});
  if(value.termsVersion!==LEGAL_VERSION||value.privacyVersion!==LEGAL_VERSION)return NextResponse.json({error:"Los documentos legales cambiaron. Recarga la página para revisar la versión vigente."},{status:409});
  const phone=normalizeMexicanPhone(value.phone);
  if(!phone)return NextResponse.json({error:"Escribe un celular mexicano de 10 dígitos."},{status:400});
  if(value.accountType!=="customer"&&(value.profession.length<2||value.bio.length<20||value.firstService.length<3))return NextResponse.json({error:"Completa profesión, descripción y primer servicio."},{status:400});

  const admin=createAdminClient();
  if(!admin)return NextResponse.json({error:"Servicio temporalmente no disponible."},{status:503});
  const{data:existing}=await admin.from("profiles").select("id").eq("phone_e164",phone).maybeSingle();
  if(existing)return NextResponse.json({error:"Ese celular ya tiene una cuenta. Intenta iniciar sesión."},{status:409});

  const{data:created,error}=await admin.auth.admin.createUser({phone,password:value.password,phone_confirm:false,user_metadata:{display_name:value.name,phone,role:"customer"}});
  if(error||!created.user)return NextResponse.json({error:"No pudimos iniciar el registro. Revisa el número o intenta iniciar sesión."},{status:409});

  const legal=await recordLegalAcceptances({admin,userId:created.user.id,source:"registration",request,input:value});
  if(!legal.ok){await admin.auth.admin.deleteUser(created.user.id);return NextResponse.json({error:legal.error},{status:legal.status});}

  const otp=createRegistrationOtp();
  const{data:pending,error:pendingError}=await admin.from("pending_registrations").insert({
    user_id:created.user.id,phone_e164:phone,account_type:value.accountType,name:value.name,profession:value.profession,
    recovery_email:value.recoveryEmail||null,zone:value.zone,bio:value.bio,first_service:value.firstService,otp_digest:otp.digest,
    otp_expires_at:otp.expiresAt,otp_last_sent_at:new Date().toISOString(),
  }).select("id").single();
  if(pendingError||!pending){
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({error:"No pudimos guardar el registro. Intenta nuevamente."},{status:500});
  }
  try{await sendBirdWhatsAppOtp({to:phone,code:otp.code,idempotencyKey:`registration-${pending.id}`})}catch{
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({error:"No pudimos enviar el código por WhatsApp. Intenta nuevamente."},{status:502});
  }
  return NextResponse.json({verificationRequired:true,registrationId:pending.id,phone,destination:value.accountType==="customer"?"/cuenta":"/dashboard"},{status:202});
}

const cancelSchema=z.object({registrationId:z.string().uuid()});

export async function DELETE(request:Request){
  if(!await allowRequest(request,"cancel_registration",10,3600))return NextResponse.json({error:"Intenta nuevamente más tarde."},{status:429});
  const parsed=cancelSchema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"Registro no válido."},{status:400});
  const admin=createAdminClient();
  if(!admin)return NextResponse.json({error:"Servicio temporalmente no disponible."},{status:503});
  const{data:pending}=await admin.from("pending_registrations").select("user_id").eq("id",parsed.data.registrationId).maybeSingle();
  if(!pending)return NextResponse.json({ok:true});
  const{error}=await admin.auth.admin.deleteUser(pending.user_id);
  if(error)return NextResponse.json({error:"No pudimos cancelar el registro."},{status:500});
  return NextResponse.json({ok:true});
}
