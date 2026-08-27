import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
const eventSchema=z.object({type:z.enum(["profile_view","whatsapp_click","request_created","service_view","business_view"]),target:z.string().max(200).optional()});
export async function POST(request:Request){const parsed=eventSchema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Evento inválido"},{status:400});const admin=createAdminClient();if(admin&&process.env.NEXT_PUBLIC_DEMO_MODE!=="true")await admin.from("contact_events").insert({event_type:parsed.data.type,metadata:{target:parsed.data.target}});return NextResponse.json({recorded:true,at:new Date().toISOString()},{status:201})}
