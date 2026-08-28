import { BusinessCard } from "@/components/cards";
import { AutoGrid, SiteContainer } from "@/components/layout-primitives";
import { DiscoveryEmpty } from "@/components/public-redesign";
import styles from "@/components/public-redesign.module.css";
import { SearchBar } from "@/components/search-bar";
import { searchMarketplace } from "@/lib/search";

export const metadata={title:"Negocios locales en Tepic"};
export default async function BusinessesPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) { const params=await searchParams; const query=typeof params.q==="string"?params.q.trim():""; const matches=searchMarketplace(query,"business").flatMap(result=>result.business?[result.business]:[]); return <main><section className={styles.businessHero}><SiteContainer><p className="eyebrow">Comercio local</p><h1>Negocios locales</h1><p>Descubre comercios de Tepic que venden productos, prestan servicios o hacen ambas cosas.</p><SearchBar initial={query} destination="/negocios" placeholder="Buscar negocio, oficio o categoría…" label="Buscar negocios"/></SiteContainer></section><SiteContainer className={styles.businessResults}><div className={styles.businessResultsHeader}><h2>{query?`Resultados para “${query}”`:"Explora los negocios"}</h2><p>{matches.length} {matches.length===1?"negocio":"negocios"}</p></div>{matches.length?<AutoGrid kind="cards">{matches.map(business=><BusinessCard key={business.id} business={business}/>)}</AutoGrid>:<DiscoveryEmpty query={query}/>}</SiteContainer></main> }
