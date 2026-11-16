import Link from "next/link";
import { notFound } from "next/navigation";
import { ProviderCard } from "@/components/cards";
import { AutoGrid, SiteContainer } from "@/components/layout-primitives";
import { DiscoveryEmpty } from "@/components/public-redesign";
import styles from "@/components/public-redesign.module.css";
import { SearchBar } from "@/components/search-bar";
import { LocationDiscovery } from "@/components/location-discovery";
import { getDiscoveryAreas, getDiscoveryLocation } from "@/lib/location-server";
import { searchMarketplace } from "@/lib/marketplace-search";
import { getProviderTaxonomy } from "@/lib/taxonomy";

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ area?: string | string[] }> }) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const [taxonomy, areas, location] = await Promise.all([getProviderTaxonomy(), getDiscoveryAreas(), getDiscoveryLocation(typeof queryParams.area === "string" ? queryParams.area : undefined)]);
  const { results } = await searchMarketplace("", "provider", false, location, areas);
  const category = taxonomy.find((item) => item.slug === slug);
  if (!category) notFound();
  const canonicalIds = new Set(category.canonicalCategories.map((item) => item.id));
  const matches = results.filter((result) => result.provider?.categories?.some((item) => canonicalIds.has(item.id)));
  const cityName = location.areaSlug === "uruapan" || /uruapan/i.test(location.label) ? "Uruapan" : "Tepic";
  return <main>
    <SiteContainer>
      <nav className="breadcrumbs" aria-label="Navegación"><Link href="/">Inicio</Link><span>/</span><span aria-current="page">{category.name}</span></nav>
      <header className={styles.serviceIntro}>
        <p className="eyebrow">Categoría en {cityName}</p>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
        <SearchBar initial={category.name} placeholder={`Buscar en ${category.name.toLowerCase()}…`}/>
      </header>
      <section className={styles.serviceResults} aria-labelledby="category-specialties">
        <LocationDiscovery areas={areas} current={location}/>
        <div className={styles.resultsHeader}><div><strong id="category-specialties">Especialidades</strong><p>Perfiles clasificados por lo que saben hacer.</p></div></div>
        <div className={styles.popularServices}>{category.canonicalCategories.map((canonical) => <Link href={`/buscar?q=${encodeURIComponent(canonical.name)}&type=provider${location.areaSlug?`&area=${encodeURIComponent(location.areaSlug)}`:""}`} key={canonical.id}>{canonical.name}</Link>)}</div>
      </section>
      <section className={styles.serviceResults} aria-labelledby="category-results">
        <div className={styles.resultsHeader}><div><strong id="category-results">{matches.length} {matches.length === 1 ? "prestador" : "prestadores"}</strong><p>La categoría principal define su ubicación; las secundarias también pueden traerlos aquí.</p></div></div>
        {matches.length ? <AutoGrid kind="cards">{matches.map((result) => <ProviderCard provider={result.provider!} discoveryMatch={result.discoveryMatch} key={result.provider!.id}/>)}</AutoGrid> : <DiscoveryEmpty query={category.name}/>}
      </section>
    </SiteContainer>
  </main>;
}
