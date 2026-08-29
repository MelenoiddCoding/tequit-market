"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Heart, Home, MapPin, Search, Store, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/cn";

const publicLinks = [
  { href: "/buscar", label: "Buscar" },
  { href: "/negocios", label: "Negocios" },
  { href: "/solicitar", label: "Publicar necesidad" },
  { href: "/dashboard", label: "Soy prestador" },
] as const;

const bottomItems = [
  { href: "/", Icon: Home, label: "Inicio", matches: (path: string) => path === "/" },
  { href: "/buscar", Icon: Search, label: "Buscar", matches: (path: string) => path.startsWith("/buscar") || path.startsWith("/servicios/") || path.startsWith("/p/") },
  { href: "/negocios", Icon: Store, label: "Negocios", matches: (path: string) => path.startsWith("/negocios") || path.startsWith("/n/") },
  { href: "/guardados", Icon: Heart, label: "Guardados", matches: (path: string) => path.startsWith("/guardados") },
] as const;

export function Header() {
  const pathname = usePathname();
  return <header className="site-header"><div className="site-container site-container-content header-inner"><Link className="brand-link" href="/" aria-label="Tequit — Inicio"><BrandLogo priority /></Link><nav className="desktop-nav" aria-label="Navegación principal">{publicLinks.map((item) => <Link key={item.href} className={cn(pathname.startsWith(item.href) && "is-active")} href={item.href}>{item.label}</Link>)}<span className="nav-location"><MapPin size={18} aria-hidden /> Tepic, Nayarit</span></nav><span className="mobile-location"><MapPin size={18} aria-hidden /> <span>Tepic</span></span></div></header>;
}

export function BottomNavigation({ accountHref="/login",dashboard=false }: { accountHref?:string;dashboard?:boolean }) {
  const pathname = usePathname();
  const accountActive=dashboard||pathname.startsWith("/login")||pathname.startsWith("/registro")||pathname.startsWith("/cuenta");
  return <nav className="bottom-nav" aria-label="Navegación móvil">{bottomItems.map(({ href, Icon, label, matches }) => { const active = pathname === "/solicitar" ? false : matches(pathname); return <Link key={href} className={cn(active && "is-active")} href={href} aria-current={active ? "page" : undefined}><Icon aria-hidden /><span>{label}</span></Link>; })}<Link className={cn(accountActive&&"is-active")} href={accountHref} aria-current={accountActive?"page":undefined}><UserRound aria-hidden/><span>Cuenta</span></Link></nav>;
}

export function Footer() {
  return <footer className="footer"><div className="site-container site-container-content"><div className="footer-grid"><div className="footer-brand"><Link href="/" aria-label="Tequit — Inicio"><BrandLogo variant="app-dark" /></Link><p>Encuentra personas y negocios en Tepic que puedan hacer el trabajo que necesitas.</p></div><nav aria-label="Explora"><strong>Explora</strong><Link href="/buscar">Buscar servicios</Link><Link href="/negocios">Negocios locales</Link><Link href="/guardados">Guardados</Link></nav><nav aria-label="Para quien le sabe"><strong>Para quien le sabe</strong><Link href="/registro">Crear perfil</Link><Link href="/login">Iniciar sesión</Link><Link href="/dashboard/plan">Tequit Pro</Link></nav></div><div className="footer-note"><BriefcaseBusiness size={16} aria-hidden /> Tequit facilita el contacto. No garantiza resultados ni participa en pagos o acuerdos.</div></div></footer>;
}

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if(pathname.startsWith("/admin"))return children;
  if(pathname.startsWith("/dashboard"))return <><div className="dashboard-public-mobile"><Header/></div>{children}<div className="dashboard-public-mobile"><BottomNavigation accountHref="/dashboard" dashboard/></div></>;
  return <><Header />{children}<Footer /><BottomNavigation /></>;
}
