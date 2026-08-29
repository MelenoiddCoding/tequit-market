import type { MetadataRoute } from "next";
import { getMarketplace } from "@/lib/marketplace";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const{providers,businesses,services}=await getMarketplace();const base=process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000";return["","/buscar","/negocios","/solicitar",...providers.map(p=>`/p/${p.slug}`),...businesses.map(b=>`/n/${b.slug}`),...services.map(s=>`/servicios/${s.slug}`)].map(path=>({url:`${base}${path}`,lastModified:new Date(),changeFrequency:path===""?"daily":"weekly"}))}
