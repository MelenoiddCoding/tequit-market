import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProviderProfile } from "@/components/profile-details";
import { getProviderBySlug } from "@/lib/marketplace";
export async function generateMetadata({params}:{params:Promise<{providerSlug:string}>}):Promise<Metadata>{const{providerSlug}=await params;const p=await getProviderBySlug(providerSlug);return p?{title:`${p.name} — ${p.profession} en Tepic`,description:p.bio}:{title:"Perfil no encontrado"}}
export default async function ProviderPage({params}:{params:Promise<{providerSlug:string}>}){const{providerSlug}=await params;const provider=await getProviderBySlug(providerSlug);if(!provider)notFound();return <ProviderProfile provider={provider}/>}
