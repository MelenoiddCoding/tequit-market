import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const providerSchema=z.object({kind:z.literal("provider"),action:z.enum(["save","publish"]),step:z.number().int().min(1).max(4),name:z.string().trim().min(2).max(100),profession:z.string().trim().min(2).max(100),phone:z.string().regex(/^[\d\s+()-]{8,20}$/),zone:z.string().trim().min(2).max(120),bio:z.string().trim().max(1200),service:z.string().trim().max(100),serviceDescription:z.string().trim().max(500),avatarPath:z.string().max(300).nullable(),coverPath:z.string().max(300).nullable()});
const businessSchema=z.object({kind:z.literal("business"),name:z.string().trim().min(2).max(100),profession:z.string().trim().min(2).max(100),phone:z.string().regex(/^[\d\s+()-]{8,20}$/),zone:z.string().trim().min(2).max(120),bio:z.string().trim().min(20).max(1000),firstService:z.string().trim().min(2).max(100)});

export async function POST(request:Request){
  const body=await request.json();const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Inicia sesión para crear tu perfil."},{status:401});
  if(body.kind==="business"){
    const parsed=businessSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:"Revisa los datos del negocio."},{status:400});
    const{data:existing}=await supabase.from("business_members").select("id").eq("profile_id",user.id).eq("member_role","owner").maybeSingle();if(existing)return NextResponse.json({destination:"/dashboard"});
    const{error}=await supabase.rpc("complete_business_onboarding",{p_name:parsed.data.name,p_category:parsed.data.profession,p_phone:parsed.data.phone,p_zone:parsed.data.zone,p_description:parsed.data.bio,p_first_service:parsed.data.firstService});
    return error?NextResponse.json({error:"No pudimos crear el negocio."},{status:409}):NextResponse.json({destination:"/dashboard"},{status:201});
  }
  const parsed=providerSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Revisa los datos del perfil."},{status:400});
  const value=parsed.data;const validPath=(path:string|null)=>!path||path.startsWith(`${user.id}/`);if(!validPath(value.avatarPath)||!validPath(value.coverPath))return NextResponse.json({error:"Ruta de imagen inválida."},{status:400});
  let{data:provider}=await supabase.from("provider_profiles").select("id,status").eq("owner_profile_id",user.id).maybeSingle();
  if(!provider){const{data:id,error}=await supabase.rpc("complete_provider_onboarding",{p_name:value.name,p_profession:value.profession,p_phone:value.phone,p_zone:value.zone,p_bio:value.bio||"Perfil profesional en preparación.",p_first_service:""});if(error||!id)return NextResponse.json({error:"No pudimos iniciar tu perfil."},{status:409});provider={id,status:"draft"};}
  if(provider.status==="active")return NextResponse.json({destination:"/dashboard"});
  const{error:profileError}=await supabase.from("provider_profiles").update({name:value.name,profession:value.profession,phone:value.phone,zone:value.zone,bio:value.bio||"Perfil profesional en preparación.",avatar_path:value.avatarPath,onboarding_step:value.step}).eq("id",provider.id).eq("owner_profile_id",user.id);
  if(profileError)return NextResponse.json({error:"No pudimos guardar tu avance."},{status:403});
  await supabase.from("provider_site_settings").upsert({provider_id:provider.id,headline:`${value.profession} en ${value.zone}`,intro:value.bio,cover_path:value.coverPath},{onConflict:"provider_id"});
  const{data:services}=await supabase.from("provider_services").select("id").eq("provider_id",provider.id).limit(1);
  if(value.service){if(services?.[0])await supabase.from("provider_services").update({title:value.service,description:value.serviceDescription,active:true}).eq("id",services[0].id);else await supabase.from("provider_services").insert({provider_id:provider.id,title:value.service,description:value.serviceDescription,active:true});}
  if(value.action==="publish"){
    const{error}=await supabase.rpc("publish_provider_onboarding",{p_provider_id:provider.id});if(error)return NextResponse.json({error:"Completa las fotos, la presentación y la descripción del servicio antes de publicar."},{status:409});
    return NextResponse.json({destination:"/dashboard/bienvenida"});
  }
  return NextResponse.json({ok:true,providerId:provider.id});
}
