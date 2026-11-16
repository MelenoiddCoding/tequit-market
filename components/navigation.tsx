"use client";

import { useEffect, useState } from "react";

import { DirectoryTracker } from "@/components/directory-tracker";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Heart, Home, MapPin, Search, Store, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CitySuggestion } from "@/components/city-suggestion";
import { LOCATION_COOKIE, parseDiscoveryLocation } from "@/lib/location";
import { cn } from "@/lib/cn";

const publicLinks = [
  { href: "/buscar", label: "Buscar" },
  { href: "/negocios", label: "Negocios" },
  { href: "/solicitar", label: "Publicar necesidad" },
  { href: "/dashboard", label: "Soy prestador" },
] as const;

const bottomItems = [
  { href: "/", Icon: Home, label: "Inicio", matches: (path: string) => path === "/" },
  { href: "/buscar", Icon: Search, label: "Buscar", matches: (path: string) => path.startsWith("/buscar") || path.startsWith("/servicios/") || path.startsWith("/u/") },
  { href: "/negocios", Icon: Store, label: "Negocios", matches: (path: string) => path.startsWith("/negocios") || path.startsWith("/n/") },
  { href: "/guardados", Icon: Heart, label: "Favoritos", matches: (path: string) => path.startsWith("/guardados") },
] as const;

function useMarketArea(pathname: string) {
  const [area, setArea] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      const fromUrl = new URLSearchParams(window.location.search).get("area");
      const saved = parseDiscoveryLocation(document.cookie.split("; ").find((part) => part.startsWith(`${LOCATION_COOKIE}=`))?.split("=")[1]);
      setArea(fromUrl ?? saved?.areaSlug ?? null);
    };
    update(); window.addEventListener("tequit:location-change", update); return () => window.removeEventListener("tequit:location-change", update);
  }, [pathname]);
  return area;
}

function marketHref(href: string, area: string | null) {
  return area && (href === "/" || href === "/buscar" || href === "/negocios") ? `${href}?area=${encodeURIComponent(area)}` : href;
}

export function Header({initialCity="Tepic"}:{initialCity?:"Tepic"|"Uruapan"}) {
  const pathname = usePathname();
  const area = useMarketArea(pathname);
  const [city, setCity] = useState(initialCity);
  useEffect(() => {
    const update = () => {
      const area = new URLSearchParams(window.location.search).get("area");
      const saved = parseDiscoveryLocation(document.cookie.split("; ").find((part) => part.startsWith(`${LOCATION_COOKIE}=`))?.split("=")[1]);
      const slug = area === "tepic" || area === "uruapan" ? area : saved?.areaSlug;
      setCity(slug === "uruapan" || /uruapan/i.test(saved?.label ?? "") ? "Uruapan" : "Tepic");
    };
    update(); window.addEventListener("tequit:location-change", update); return () => window.removeEventListener("tequit:location-change", update);
  }, [pathname]);
  return <header className="site-header"><div className="site-container site-container-content header-inner"><Link className="brand-link" href={marketHref("/",area)} aria-label="Tequit — Inicio"><BrandLogo priority /></Link><nav className="desktop-nav" aria-label="Navegación principal">{publicLinks.map((item) => <Link key={item.href} className={cn(pathname.startsWith(item.href) && "is-active")} href={marketHref(item.href,area)}>{item.label}</Link>)}<span className="nav-location"><MapPin size={18} aria-hidden /> {city}</span></nav><span className="mobile-location"><MapPin size={18} aria-hidden /> <span>{city}</span></span></div></header>;
}

export function BottomNavigation({ accountHref="/cuenta",dashboard=false }: { accountHref?:string;dashboard?:boolean }) {
  const pathname = usePathname();
  const area = useMarketArea(pathname);
  const accountActive=dashboard||pathname.startsWith("/login")||pathname.startsWith("/registro")||pathname.startsWith("/cuenta");
  return <nav className="bottom-nav" aria-label="Navegación móvil">{bottomItems.map(({ href, Icon, label, matches }) => { const active = pathname === "/solicitar" ? false : matches(pathname); return <Link key={href} className={cn(active && "is-active")} href={marketHref(href,area)} aria-current={active ? "page" : undefined}><Icon aria-hidden /><span>{label}</span></Link>; })}<Link className={cn(accountActive&&"is-active")} href={accountHref} aria-current={accountActive?"page":undefined}><UserRound aria-hidden/><span>Cuenta</span></Link></nav>;
}

export function Footer() {
  return <footer className="footer"><div className="site-container site-container-content"><div className="footer-grid"><div className="footer-brand"><Link href="/" aria-label="Tequit — Inicio"><BrandLogo variant="app-dark" /></Link><p>Encuentra personas y negocios en Tepic y Uruapan que puedan hacer el trabajo que necesitas.</p></div><nav aria-label="Explora"><strong>Explora</strong><Link href="/buscar">Buscar servicios</Link><Link href="/negocios">Negocios locales</Link><Link href="/guardados">Guardados</Link></nav><nav aria-label="Para quien le sabe"><strong>Para quien le sabe</strong><Link href="/registro?tipo=prestador">Crear perfil</Link><Link href="/login">Iniciar sesión</Link><Link href="/dashboard/plan">Tequit Pro</Link></nav><nav aria-label="Información legal"><strong>Legal</strong><Link href="/terminos">Términos y Condiciones</Link><Link href="/privacidad">Privacidad</Link></nav></div><div className="footer-note"><BriefcaseBusiness size={16} aria-hidden /> Tequit facilita el contacto. No garantiza resultados ni participa en pagos o acuerdos entre clientes y prestadores.</div></div></footer>;
}

export function PublicChrome({ children, ipCity, initialCity }: { children: React.ReactNode; ipCity: string | null; initialCity: "Tepic" | "Uruapan" }) {
  const pathname = usePathname();
  if(pathname.startsWith("/admin"))return children;
  if(pathname.startsWith("/dashboard"))return children;
  if(pathname.startsWith("/p/") || pathname === "/tu-pagina/ejemplos")return children;
  return <><DirectoryTracker /><Header initialCity={initialCity}/><CitySuggestion ipCity={ipCity}/>{children}<Footer /><BottomNavigation /></>;
}
