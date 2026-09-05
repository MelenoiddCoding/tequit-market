import {NextResponse} from "next/server";
import {z} from "zod";
import {allowRequest} from "@/lib/rate-limit";
import {createAdminClient} from "@/lib/supabase/admin";
import {createRegistrationOtp} from "@/lib/registration-otp";
import {sendBirdWhatsAppOtp} from "@/lib/bird";

const schema=z.object({registrationId:z.string().uuid()});

export async function POST(request:Request){
  if(!await allowRequest(request,"resend_registration_otp",3,900))return NextResponse.json({error:"Espera unos minutos antes de solicitar otro código."},{status:429});
  const parsed=schema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"El registro no es válido."},{status:400});
  const admin=createAdminClient();
  if(!admin)return NextResponse.json({error:"Servicio temporalmente no disponible."},{status:503});
  const{data:pending}=await admin.from("pending_registrations").select("id,phone_e164,otp_last_sent_at").eq("id",parsed.data.registrationId).maybeSingle();
  if(!pending)return NextResponse.json({error:"Este registro ya no está disponible."},{status:409});
  if(pending.otp_last_sent_at&&Date.now()-Date.parse(pending.otp_last_sent_at)<60_000)return NextResponse.json({error:"Espera un minuto antes de solicitar otro código."},{status:429});
  const otp=createRegistrationOtp();
  const{error:updateError}=await admin.from("pending_registrations").update({otp_digest:otp.digest,otp_expires_at:otp.expiresAt,otp_attempts:0,otp_last_sent_at:new Date().toISOString()}).eq("id",pending.id);
  if(updateError)return NextResponse.json({error:"No pudimos preparar otro código."},{status:500});
  try{await sendBirdWhatsAppOtp({to:pending.phone_e164,code:otp.code,idempotencyKey:`registration-resend-${pending.id}-${Date.now()}`})}catch{return NextResponse.json({error:"No pudimos reenviar el código todavía."},{status:502})}
  return NextResponse.json({ok:true});
}
