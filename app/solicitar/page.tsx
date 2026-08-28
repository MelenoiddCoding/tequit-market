import { BadgeCheck } from "lucide-react";
import { SiteContainer } from "@/components/layout-primitives";
import styles from "@/components/public-redesign.module.css";
import { RequestForm } from "@/components/request-form";
import { businesses, providers } from "@/lib/demo-data";

const single=(value:string|string[]|undefined)=>typeof value==="string"?value:undefined;
export default async function RequestPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) { const params=await searchParams; const providerSlug=single(params.provider); const businessSlug=single(params.business); const service=single(params.service); const provider=providers.find(item=>item.slug===providerSlug); const business=businesses.find(item=>item.slug===businessSlug); const target=provider?.name??business?.name; return <main className={styles.requestPage}><SiteContainer><header className={styles.requestIntro}><p className="eyebrow">Sin cuenta y sin costo</p><h1>Publica lo que necesitas</h1><p>Cuéntanos el trabajo. Tequit puede revisar tu solicitud y ayudarte a encontrar opciones en Tepic.</p></header>{target&&<div className={styles.directedContext}><BadgeCheck size={20} aria-hidden/><p>Esta solicitud irá dirigida a <strong>{target}</strong>. Sus datos y reputación son independientes de Tequit.</p></div>}<div className={styles.requestPanel}><RequestForm targetProvider={providerSlug} targetBusiness={businessSlug} defaultService={service}/></div></SiteContainer></main> }
