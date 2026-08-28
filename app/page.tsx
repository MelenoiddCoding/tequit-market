import Link from "next/link";
import { BadgeCheck, BrickWall, Droplets, Grid2X2, Hammer, MapPin, PaintRoller, Search, Snowflake, Sparkles, WashingMachine, Zap } from "lucide-react";
import { BusinessCard, ProviderCard } from "@/components/cards";
import { AutoGrid, Section, SectionHeader, SiteContainer } from "@/components/layout-primitives";
import { TrustProof } from "@/components/public-redesign";
import styles from "@/components/public-redesign.module.css";
import { SearchBar } from "@/components/search-bar";
import { businesses, categories, providers, services } from "@/lib/demo-data";

const icons = { BrickWall, Droplets, Zap, Grid2X2, WashingMachine, PaintRoller, Snowflake, Sparkles };
const popular = [services.plomeria, services.piso, services.concreto, services.lavadoras, services.minisplit, services.pintura];

export default function HomePage() {
  return <main>
    <section className={styles.homeHero} aria-labelledby="home-title"><div className={styles.heroInner}><div className={styles.heroCopy}><p className="eyebrow"><MapPin size={14} aria-hidden/> Tepic, Nayarit</p><h1 id="home-title">Encuentra quién le sabe.</h1><p>Personas y negocios que pueden hacer el trabajo que necesitas. Revisa su experiencia, reputación y verificaciones; contáctalos directamente.</p><SearchBar variant="hero" placeholder="¿Qué necesitas resolver?"/><div className={styles.heroSignals}><span><BadgeCheck size={17} aria-hidden/> Perfiles con señales de confianza</span><span><Search size={17} aria-hidden/> Busca como lo dirías normalmente</span></div></div></div></section>
    <TrustProof/>
    <Section><SiteContainer><SectionHeader eyebrow="Accesos rápidos" title="¿Qué hay que resolver?" description="Empieza por una categoría y compara opciones en Tepic." action={<Link className="btn btn-secondary" href="/buscar">Ver todos los servicios</Link>}/><AutoGrid kind="cards" className="category-row">{categories.map(category=>{const Icon=icons[category.icon as keyof typeof icons];return <Link key={category.slug} className="category-link" href={`/servicios/${category.slug}`}><span className="category-icon"><Icon size={22} aria-hidden/></span><strong>{category.name}</strong></Link>})}</AutoGrid></SiteContainer></Section>
    <Section tone="muted"><SiteContainer><SectionHeader eyebrow="Servicios populares" title="Lo que Tepic está buscando" description="Atajos para las necesidades que aparecen todos los días."/><div className={styles.popularServices}>{popular.map(service=><Link key={service.id} href={`/servicios/${service.slug}`}><span><Hammer size={17} aria-hidden/></span>{service.name}</Link>)}</div></SiteContainer></Section>
    <Section><SiteContainer><SectionHeader eyebrow="Confianza local" title="Prestadores verificados" description="Compara servicios, zona, reputación y señales verificadas antes de elegir." action={<Link className="btn btn-secondary" href="/buscar?verified=true">Explorar perfiles</Link>}/><div className={styles.providerRail}>{providers.filter(provider=>provider.featured||provider.rating>=4.9).slice(0,3).map(provider=><ProviderCard key={provider.id} provider={provider}/>)}</div></SiteContainer></Section>
    <Section tone="muted"><SiteContainer><SectionHeader eyebrow="También en Tequit" title="Negocios locales que resuelven" description="Comercios de Tepic que venden productos, prestan servicios o hacen ambas cosas." action={<Link className="btn btn-secondary" href="/negocios">Ver negocios</Link>}/><div className={styles.businessRail}>{businesses.slice(0,3).map(business=><BusinessCard key={business.id} business={business}/>)}</div></SiteContainer></Section>
    <Section><SiteContainer><div className={styles.finalCta}><div><p className="eyebrow">Para quien le sabe</p><h2>Haz que te encuentren cuando alguien necesite lo que tú sabes hacer.</h2><p>Crea tu perfil gratis, muestra tus trabajos y recibe solicitudes directas sin comisiones de Tequit.</p></div><Link className="btn" href="/registro">Crear mi perfil</Link></div></SiteContainer></Section>
  </main>;
}
