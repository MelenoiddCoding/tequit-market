import {NextResponse} from "next/server";
import {z} from "zod";
import {createClient} from "@/lib/supabase/server";

const optionalUrl=z.union([z.literal(""),z.string().url().max(300)]);
const schema=z.object({providerId:z.string().uuid(),headline:z.string().trim().min(8).max(120),intro:z.string().trim().min(40).max(1200),yearsExperience:z.number().int().min(0).max(80).nullable(),coverPath:z.string().max(300).nullable(),avatarPath:z.string().max(300).nullable(),theme:z.enum(["tequit","claro","oscuro","tierra"]),accentColor:z.string().regex(/^#[0-9A-Fa-f]{6}$/),whiteLabel:z.boolean(),socialLinks:z.object({facebook:optionalUrl,instagram:optionalUrl,tiktok:optionalUrl,website:optionalUrl}),services:z.array(z.object({id:z.string().uuid(),description:z.string().trim().max(500)})).max(30),faqs:z.array(z.object({question:z.string().trim().min(8).max(160),answer:z.string().trim().min(12).max(600)})).max(6)});

export async function POST(request:Request){
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Revisa los datos del sitio."},{status:400});
  const value=parsed.data;const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Tu sesión terminó."},{status:401});
  const{data:provider}=await supabase.from("provider_profiles").select("id,plan").eq("id",value.providerId).eq("owner_profile_id",user.id).maybeSingle();if(!provider)return NextResponse.json({error:"No autorizado."},{status:403});
  const validPath=(path:string|null)=>!path||path.startsWith(`${user.id}/`);if(!validPath(value.coverPath)||!validPath(value.avatarPath))return NextResponse.json({error:"Ruta de imagen inválida."},{status:400});
  const isPro=provider.plan==="pro";const settings={provider_id:value.providerId,headline:value.headline,intro:value.intro,years_experience:value.yearsExperience,cover_path:value.coverPath,theme:isPro?value.theme:"tequit",accent_color:isPro?value.accentColor:"#254432",white_label:isPro?value.whiteLabel:false,social_links:Object.fromEntries(Object.entries(value.socialLinks).filter(([,url])=>url))};
  const{error:settingsError}=await supabase.from("provider_site_settings").upsert(settings,{onConflict:"provider_id"});if(settingsError)return NextResponse.json({error:"No pudimos guardar el sitio."},{status:403});
  const{error:profileError}=await supabase.from("provider_profiles").update({bio:value.intro,avatar_path:value.avatarPath}).eq("id",value.providerId);if(profileError)return NextResponse.json({error:"No pudimos actualizar el perfil."},{status:403});
  for(const service of value.services)await supabase.from("provider_services").update({description:service.description}).eq("id",service.id).eq("provider_id",value.providerId);
  await supabase.from("provider_faqs").delete().eq("provider_id",value.providerId);
  if(value.faqs.length){const{error:faqError}=await supabase.from("provider_faqs").insert(value.faqs.map((faq,index)=>({provider_id:value.providerId,question:faq.question,answer:faq.answer,sort_order:index,active:true})));if(faqError)return NextResponse.json({error:"Guardamos el sitio, pero no las preguntas frecuentes."},{status:500})}
  return NextResponse.json({ok:true,pro:isPro});
}
