import { FacebookShare } from "@/components/facebook-share";
import { SiteContainer } from "@/components/layout-primitives";
import { DiscoveryEmpty, FilterSidebar, MobileFilters, SearchResults } from "@/components/public-redesign";
import styles from "@/components/public-redesign.module.css";
import { SearchBar } from "@/components/search-bar";
import { searchMarketplace } from "@/lib/marketplace-search";
import { LocationDiscovery } from "@/components/location-discovery";
import { getDiscoveryAreas, getDiscoveryLocation } from "@/lib/location-server";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const type: "all" | "provider" | "business" = params.type === "provider" || params.type === "business" ? params.type : "all";
  const verified = params.verified === "true";
  const area=typeof params.area==="string"?params.area:undefined;
  const [location,areas]=await Promise.all([getDiscoveryLocation(area),getDiscoveryAreas()]);
  const { results } = await searchMarketplace(query, type, verified,location);
  const cityOnly=location?.source==="manual"&&areas.some(item=>item.slug===location.areaSlug&&item.type==="municipality");
  const filterProps = { query, type, verified,area };
  return <main><section className={styles.listingHero}><SiteContainer className={styles.listingHeroInner}><div><p className="eyebrow">Búsqueda local</p><h1>{query ? <>Resultados para “{query}”</> : "¿Quién puede ayudarte?"}</h1><p>Personas y negocios; compara su reputación y trabajo antes de contactar.</p></div><SearchBar initial={query}/></SiteContainer></section><SiteContainer className={styles.resultsShell}><FilterSidebar {...filterProps}/><section aria-labelledby="results-title"><LocationDiscovery areas={areas} current={location}/><FacebookShare /><MobileFilters {...filterProps}/><div className={styles.resultsHeader}><div><strong id="results-title">{results.length} {results.length === 1 ? "opción" : "opciones"}</strong><p>{location?query ? "Coincidencias por servicio, cobertura y reputación." : "Opciones que pueden atender tu ubicación.":"Elige tu ubicación para ver prestadores con cobertura."}</p></div><span className={styles.sortNote}>{location?cityOnly?"Orden: relevancia y reputación":query?"Orden: relevancia y cercanía":"Orden: cercanía y reputación":"Ubicación pendiente"}</span></div>{results.length ? <SearchResults results={results}/> : <DiscoveryEmpty query={query} needsLocation={!location&&type!=="business"}/>}</section></SiteContainer></main>;
}
