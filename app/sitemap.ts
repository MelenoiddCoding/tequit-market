import type { MetadataRoute } from "next";
import { businesses, providers, services } from "@/lib/demo-data";
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000";return["","/buscar","/negocios","/solicitar",...providers.map(p=>`/p/${p.slug}`),...businesses.map(b=>`/n/${b.slug}`),...Object.values(services).map(s=>`/servicios/${s.slug}`)].map(path=>({url:`${base}${path}`,lastModified:new Date(),changeFrequency:path===""?"daily":"weekly"}))}
