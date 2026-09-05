import "server-only";

type BirdOtpInput={to:string;code:string;idempotencyKey:string};

export class BirdDeliveryError extends Error{
  constructor(public readonly status:number){super("Bird rechazó el envío del código.");this.name="BirdDeliveryError"}
}

export async function sendBirdWhatsAppOtp({to,code,idempotencyKey}:BirdOtpInput){
  const apiKey=process.env.BIRD_WHATSAPP_API_KEY;
  if(!apiKey)throw new Error("Falta BIRD_WHATSAPP_API_KEY.");
  const baseUrl=(process.env.BIRD_API_BASE_URL??"https://us1.platform.bird.com").replace(/\/$/,"");
  const template=process.env.BIRD_WHATSAPP_TEMPLATE??"bird_otp";
  const language=process.env.BIRD_WHATSAPP_LANGUAGE??"es";
  const response=await fetch(`${baseUrl}/v1/whatsapp/messages`,{
    method:"POST",
    headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json","Idempotency-Key":idempotencyKey},
    body:JSON.stringify({to,template:{slug:template,language,components:[
      {type:"body",parameters:[{type:"text",text:code}]},
      {type:"button",parameters:[{type:"text",text:code}]},
    ]}}),
    cache:"no-store",
    signal:AbortSignal.timeout(4000),
  });
  if(!response.ok)throw new BirdDeliveryError(response.status);
  const result=await response.json() as {id?:string;status?:string};
  if(!result.id)throw new BirdDeliveryError(502);
  return{id:result.id,status:result.status??"accepted"};
}
