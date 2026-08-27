import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProviderProfile } from "@/components/profile-details";
import { providers } from "@/lib/demo-data";
export function generateStaticParams(){return providers.map(p=>({providerSlug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{providerSlug:string}>}):Promise<Metadata>{const{providerSlug}=await params;const p=providers.find(x=>x.slug===providerSlug);return p?{title:`${p.name} — ${p.profession} en Tepic`,description:p.bio}:{title:"Perfil no encontrado"}}
export default async function ProviderPage({params}:{params:Promise<{providerSlug:string}>}){const{providerSlug}=await params;const provider=providers.find(p=>p.slug===providerSlug&&p.status==="active");if(!provider)notFound();return <ProviderProfile provider={provider}/>}
