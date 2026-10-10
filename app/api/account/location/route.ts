import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { LOCATION_CONSENT_VERSION } from "@/lib/location";

const schema=z.object({source:z.enum(["browser","manual"]),label:z.string().trim().min(1).max(120),lat:z.number().min(-90).max(90).optional(),lng:z.number().min(-180).max(180).optional(),areaSlug:z.string().trim().min(1).max(100).optional(),consentVersion:z.literal(LOCATION_CONSENT_VERSION)}).refine((value)=>value.areaSlug||(value.lat!==undefined&&value.lng!==undefined));

export async function POST(request:Request){const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Ubicación inválida."},{status:400});const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({ok:true,saved:false});const value=parsed.data;const{error}=await supabase.rpc("save_customer_location",{p_lat:value.lat??null,p_lng:value.lng??null,p_area_slug:value.areaSlug??null,p_label:value.label,p_source:value.source,p_consent_version:value.consentVersion});if(error)return NextResponse.json({error:"No pudimos guardar tu ubicación."},{status:400});return NextResponse.json({ok:true,saved:true})}
export async function DELETE(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({ok:true});const{error}=await supabase.from("customer_location_preferences").delete().eq("profile_id",user.id);return error?NextResponse.json({error:"No pudimos quitar tu ubicación."},{status:400}):NextResponse.json({ok:true})}
