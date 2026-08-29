import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteContainer } from "@/components/layout-primitives";
import { Breadcrumbs, DiscoveryEmpty, SearchResults } from "@/components/public-redesign";
import styles from "@/components/public-redesign.module.css";
import { SearchBar } from "@/components/search-bar";
import { getMarketplace } from "@/lib/marketplace";
import { searchMarketplaceData } from "@/lib/search";

export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> { const {slug}=await params; const service=(await getMarketplace()).services.find(item=>item.slug===slug); return service ? {title:`${service.name} en Tepic`,description:`Encuentra opciones de ${service.name.toLowerCase()} en Tepic.`} : {title:"Servicio no encontrado"}; }
export default async function ServicePage({ params }: { params: Promise<{slug:string}> }) { const {slug}=await params; const marketplace=await getMarketplace(); const service=marketplace.services.find(item=>item.slug===slug); if(!service) notFound(); const results=searchMarketplaceData(marketplace.providers,marketplace.businesses,[service.name,...(service.aliases??[])].join(" ")); return <main><SiteContainer><Breadcrumbs current={service.name}/><header className={styles.serviceIntro}><p className="eyebrow">Servicio local</p><h1>{service.name} en Tepic</h1><p>Compara reputación, servicios, zona y verificaciones antes de contactar. El acuerdo y el pago son directos con quien elijas.</p><SearchBar initial={service.name} placeholder="Buscar por especialidad o nombre…"/></header><section className={styles.serviceResults} aria-labelledby="service-results"><div className={styles.resultsHeader}><div><strong id="service-results">{results.length} {results.length===1?"opción encontrada":"opciones encontradas"}</strong><p>Personas y negocios relacionados con {service.name.toLowerCase()}.</p></div></div>{results.length?<SearchResults results={results}/>:<DiscoveryEmpty query={service.name}/>}</section></SiteContainer></main>; }
