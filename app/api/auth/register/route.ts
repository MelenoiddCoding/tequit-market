import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const schema=z.object({accountType:z.enum(["customer","provider","business"]),name:z.string().trim().min(2).max(100),profession:z.string().trim().max(100).optional().default(""),email:z.string().email().max(254),phone:z.string().trim().regex(/^[\d\s+()-]{8,20}$/),zone:z.string().trim().max(120).optional().default("Tepic, Nayarit"),password:z.string().min(8).max(128),bio:z.string().trim().max(1000).optional().default(""),firstService:z.string().trim().max(100).optional().default(""),website:z.string().max(0).optional()});

export async function POST(request:Request){
  if(!await allowRequest(request,"register",5,3600))return NextResponse.json({error:"Se alcanzó el límite de registros. Intenta más tarde."},{status:429});
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Revisa los datos del registro."},{status:400});
  const value=parsed.data;if(value.accountType!=="customer"&&(value.profession.length<2||value.phone.replace(/\D/g,"").length<10||value.bio.length<20||value.firstService.length<3))return NextResponse.json({error:"Completa profesión, WhatsApp, descripción y primer servicio."},{status:400});
  const role=value.accountType==="business"?"business_owner":value.accountType;
  const supabase=await createClient();const{data,error}=await supabase.auth.signUp({email:value.email,password:value.password,options:{data:{display_name:value.name,phone:value.phone,role}}});
  if(error||!data.user)return NextResponse.json({error:error?.message.includes("already")?"Ese correo ya está registrado.":"No pudimos crear la cuenta."},{status:409});
  let onboardingError:string|undefined;
  if(value.accountType==="provider"){const{error:rpcError}=await supabase.rpc("complete_provider_onboarding",{p_name:value.name,p_profession:value.profession,p_phone:value.phone,p_zone:value.zone,p_bio:value.bio,p_first_service:value.firstService});onboardingError=rpcError?.message}
  if(value.accountType==="business"){const{error:rpcError}=await supabase.rpc("complete_business_onboarding",{p_name:value.name,p_category:value.profession,p_phone:value.phone,p_zone:value.zone,p_description:value.bio,p_first_service:value.firstService});onboardingError=rpcError?.message}
  if(onboardingError){await createAdminClient()?.auth.admin.deleteUser(data.user.id);return NextResponse.json({error:"No pudimos completar el perfil. Intenta de nuevo."},{status:500})}
  return NextResponse.json({role,destination:value.accountType==="customer"?"/cuenta":"/dashboard"},{status:201});
}
