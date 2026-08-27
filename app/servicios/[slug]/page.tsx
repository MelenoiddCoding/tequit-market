import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProviderCard, BusinessCard } from "@/components/cards";
import { SearchBar } from "@/components/search-bar";
import { businesses, providers } from "@/lib/demo-data";
import { normalizeSearch } from "@/lib/search";

function label(slug:string){return slug.split("-").map(w=>w[0]?.toUpperCase()+w.slice(1)).join(" ")}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;return{title:`${label(slug)} en Tepic`,description:`Encuentra opciones de ${label(slug).toLowerCase()} en Tepic.`}}
export default async function ServicePage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const query=normalizeSearch(label(slug));const matchesP=providers.filter(p=>normalizeSearch([p.profession,...p.services.map(s=>`${s.name} ${s.aliases?.join(" ")}`)].join(" ")).includes(query)||p.services.some(s=>query.includes(normalizeSearch(s.name))));const matchesB=businesses.filter(b=>normalizeSearch([b.category,...b.services.map(s=>s.name)].join(" ")).includes(query));if(!matchesP.length&&!matchesB.length)notFound();return <main><div className="search-page-head"><div className="container"><p className="eyebrow">Servicio local</p><h1>{label(slug)} en Tepic</h1><p className="muted">Compara reputación, trabajos y verificaciones antes de contactar.</p><SearchBar initial={label(slug)} dark/></div></div><div className="container page"><h2>{matchesP.length+matchesB.length} opciones encontradas</h2><div className="result-list">{matchesP.map(p=><ProviderCard key={p.id} provider={p}/>)}{matchesB.map(b=><BusinessCard key={b.id} business={b}/>)}</div></div></main>}
