import {NextResponse} from "next/server";
import {Webhook} from "standardwebhooks";
import {z} from "zod";
import {sendBirdWhatsAppOtp} from "@/lib/bird";
import {normalizeMexicanPhone} from "@/lib/phone";

export const runtime="nodejs";

const eventSchema=z.object({
  user:z.object({phone:z.string()}),
  sms:z.object({otp:z.string().regex(/^\d{6}$/)}),
});

function verifyEvent(payload:string,headers:Record<string,string>){
  const configured=process.env.SUPABASE_SEND_SMS_HOOK_SECRET;
  if(!configured)throw new Error("Falta SUPABASE_SEND_SMS_HOOK_SECRET.");
  let lastError:unknown;
  for(const candidate of configured.split("|").map(value=>value.trim()).filter(Boolean)){
    const secret=candidate.replace(/^v1,whsec_/,"");
    try{return eventSchema.parse(new Webhook(secret).verify(payload,headers))}catch(error){lastError=error}
  }
  throw lastError??new Error("Firma inválida.");
}

export async function POST(request:Request){
  try{
    const payload=await request.text();
    const event=verifyEvent(payload,Object.fromEntries(request.headers));
    const phone=normalizeMexicanPhone(event.user.phone);
    if(!phone)return NextResponse.json({error:{http_code:400,message:"El teléfono no es válido."}},{status:400});
    await sendBirdWhatsAppOtp({to:phone,code:event.sms.otp,idempotencyKey:request.headers.get("webhook-id")??crypto.randomUUID()});
    return NextResponse.json({});
  }catch(error){
    const message=error instanceof Error&&error.message.includes("BIRD_WHATSAPP_API_KEY")?"El proveedor de códigos no está configurado.":"No pudimos enviar el código por WhatsApp.";
    return NextResponse.json({error:{http_code:502,message}},{status:502});
  }
}
