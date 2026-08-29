import { SiteContainer } from "@/components/layout-primitives";
import { DiscoveryEmpty, FilterSidebar, MobileFilters, SearchResults } from "@/components/public-redesign";
import styles from "@/components/public-redesign.module.css";
import { SearchBar } from "@/components/search-bar";
import { getMarketplace } from "@/lib/marketplace";
import { searchMarketplaceData } from "@/lib/search";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const type: "all" | "provider" | "business" = params.type === "provider" || params.type === "business" ? params.type : "all";
  const verified = params.verified === "true";
  const marketplace = await getMarketplace();
  const results = searchMarketplaceData(marketplace.providers, marketplace.businesses, query, type, verified);
  const filterProps = { query, type, verified };
  return <main><section className={styles.listingHero}><SiteContainer className={styles.listingHeroInner}><div><p className="eyebrow">Búsqueda en Tepic</p><h1>{query ? <>Resultados para “{query}”</> : "¿Quién puede ayudarte?"}</h1><p>Personas y negocios; compara su reputación y trabajo antes de contactar.</p></div><SearchBar initial={query}/></SiteContainer></section><SiteContainer className={styles.resultsShell}><FilterSidebar {...filterProps}/><section aria-labelledby="results-title"><MobileFilters {...filterProps}/><div className={styles.resultsHeader}><div><strong id="results-title">{results.length} {results.length === 1 ? "opción" : "opciones"}</strong><p>{query ? "Coincidencias por servicio, especialidad y nombre." : "Explora todas las opciones disponibles."}</p></div><span className={styles.sortNote}>Orden: relevancia y reputación</span></div>{results.length ? <SearchResults results={results}/> : <DiscoveryEmpty query={query}/>}</section></SiteContainer></main>;
}
