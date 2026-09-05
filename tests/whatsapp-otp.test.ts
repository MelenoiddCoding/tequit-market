import {afterEach,describe,expect,it,vi} from "vitest";
import fs from "node:fs";
import path from "node:path";

vi.mock("server-only",()=>({}));

import {sendBirdWhatsAppOtp} from "@/lib/bird";
import {POST as sendSmsHook} from "@/app/api/auth/hooks/send-sms/route";

const originalKey=process.env.BIRD_WHATSAPP_API_KEY;
const originalSecret=process.env.SUPABASE_SEND_SMS_HOOK_SECRET;

afterEach(()=>{
  vi.restoreAllMocks();
  if(originalKey===undefined)delete process.env.BIRD_WHATSAPP_API_KEY;else process.env.BIRD_WHATSAPP_API_KEY=originalKey;
  if(originalSecret===undefined)delete process.env.SUPABASE_SEND_SMS_HOOK_SECRET;else process.env.SUPABASE_SEND_SMS_HOOK_SECRET=originalSecret;
});

describe("Bird WhatsApp OTP",()=>{
  it("envía el mismo código al cuerpo y al botón sin fijar remitente",async()=>{
    process.env.BIRD_WHATSAPP_API_KEY="bird-test-key";
    const request=vi.spyOn(globalThis,"fetch").mockResolvedValue(new Response(JSON.stringify({id:"msg_123",status:"accepted"}),{status:202,headers:{"content-type":"application/json"}}));
    await sendBirdWhatsAppOtp({to:"+523111798614",code:"482917",idempotencyKey:"otp-request-1"});
    const[,options]=request.mock.calls[0];
    const payload=JSON.parse(String(options?.body));
    expect(payload).toBeTruthy();
    expect(payload.from).toBeUndefined();
    expect(payload.template.slug).toBe("bird_otp");
    expect(payload.template.language).toBe("es");
    expect(payload.template.components[0].parameters[0].text).toBe("482917");
    expect(payload.template.components[1].parameters[0].text).toBe("482917");
  });

  it("rechaza llamadas al hook sin firma antes de contactar Bird",async()=>{
    process.env.BIRD_WHATSAPP_API_KEY="bird-test-key";
    process.env.SUPABASE_SEND_SMS_HOOK_SECRET="v1,whsec_dGVzdC1zZWNyZXQtdGVzdC1zZWNyZXQtdGVzdC0=";
    const outbound=vi.spyOn(globalThis,"fetch");
    const response=await sendSmsHook(new Request("http://local/api/auth/hooks/send-sms",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({user:{phone:"+523111798614"},sms:{otp:"482917"}})}));
    expect(response.status).toBe(502);
    expect(outbound).not.toHaveBeenCalled();
  });

  it("mantiene los datos pendientes fuera de las APIs públicas",()=>{
    const sql=fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202609030001_whatsapp_otp_registration.sql"),"utf8");
    expect(sql).toContain("alter table public.pending_registrations enable row level security");
    expect(sql).toContain("revoke all on table public.pending_registrations from public,anon,authenticated");
    expect(sql).toContain("grant all on table public.pending_registrations to service_role");
  });
});
