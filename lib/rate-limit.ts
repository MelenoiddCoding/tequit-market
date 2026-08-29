import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function requestIp(request:Request){return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||request.headers.get("x-real-ip")||"unknown"}
export async function allowRequest(request:Request,action:string,limit:number,windowSeconds:number){if(process.env.NEXT_PUBLIC_DEMO_MODE==="true")return true;const salt=process.env.RATE_LIMIT_SALT||process.env.SUPABASE_SERVICE_ROLE_KEY||"tequit-beta";const hash=createHash("sha256").update(`${salt}:${action}:${requestIp(request)}`).digest("hex");const client=createAdminClient();if(!client)return false;const{data,error}=await client.rpc("consume_rate_limit",{p_key:`${action}:${hash}`,p_action:action,p_limit:limit,p_window_seconds:windowSeconds});return !error&&data===true}
