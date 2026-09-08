import Link from "next/link";
import { notFound } from "next/navigation";
import { ProviderCard } from "@/components/cards";
import { AutoGrid, SiteContainer } from "@/components/layout-primitives";
import { DiscoveryEmpty } from "@/components/public-redesign";
import styles from "@/components/public-redesign.module.css";
import { SearchBar } from "@/components/search-bar";
import { getProviders } from "@/lib/marketplace";
import { getProviderTaxonomy } from "@/lib/taxonomy";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [taxonomy, providers] = await Promise.all([getProviderTaxonomy(), getProviders()]);
  const category = taxonomy.find((item) => item.slug === slug);
  if (!category) notFound();
  const canonicalIds = new Set(category.canonicalCategories.map((item) => item.id));
  const matches = providers.filter((provider) => provider.categories?.some((item) => canonicalIds.has(item.id)));
  return <main>
    <SiteContainer>
      <nav className="breadcrumbs" aria-label="Navegación"><Link href="/">Inicio</Link><span>/</span><span aria-current="page">{category.name}</span></nav>
      <header className={styles.serviceIntro}>
        <p className="eyebrow">Categoría en Tepic</p>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
        <SearchBar initial={category.name} placeholder={`Buscar en ${category.name.toLowerCase()}…`}/>
      </header>
      <section className={styles.serviceResults} aria-labelledby="category-specialties">
        <div className={styles.resultsHeader}><div><strong id="category-specialties">Especialidades</strong><p>Perfiles clasificados por lo que saben hacer.</p></div></div>
        <div className={styles.popularServices}>{category.canonicalCategories.map((canonical) => <Link href={`/buscar?q=${encodeURIComponent(canonical.name)}&type=provider`} key={canonical.id}>{canonical.name}</Link>)}</div>
      </section>
      <section className={styles.serviceResults} aria-labelledby="category-results">
        <div className={styles.resultsHeader}><div><strong id="category-results">{matches.length} {matches.length === 1 ? "prestador" : "prestadores"}</strong><p>La categoría principal define su ubicación; las secundarias también pueden traerlos aquí.</p></div></div>
        {matches.length ? <AutoGrid kind="cards">{matches.map((provider) => <ProviderCard provider={provider} key={provider.id}/>)}</AutoGrid> : <DiscoveryEmpty query={category.name}/>} 
      </section>
    </SiteContainer>
  </main>;
}
