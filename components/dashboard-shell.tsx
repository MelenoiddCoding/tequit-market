"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3, BriefcaseBusiness, ClipboardList, ExternalLink, Images,
  LayoutDashboard, Menu, MessageSquareText, ShieldCheck, UserRound, Wrench, X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/logout-button";
import styles from "@/components/dashboard-redesign.module.css";
import { cn } from "@/lib/cn";

const navigation = [
  ["/dashboard", LayoutDashboard, "Resumen"],
  ["/dashboard/perfil", UserRound, "Mi perfil"],
  ["/dashboard/servicios", Wrench, "Servicios"],
  ["/dashboard/trabajos", Images, "Trabajos"],
  ["/dashboard/solicitudes", ClipboardList, "Solicitudes"],
  ["/dashboard/resenas", MessageSquareText, "Reseñas"],
  ["/dashboard/estadisticas", BarChart3, "Estadísticas"],
  ["/dashboard/negocios", BriefcaseBusiness, "Negocios"],
  ["/dashboard/plan", ShieldCheck, "Plan"],
] as const;

function DashboardNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav className={styles.nav} aria-label="Panel de prestador">
    {navigation.map(([href, Icon, label]) => {
      const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
      return <Link className={cn(styles.navLink, active && styles.navLinkActive)} href={href} key={href} aria-current={active ? "page" : undefined} onClick={onNavigate}>
        <Icon size={18} aria-hidden="true" />{label}
      </Link>;
    })}
  </nav>;
}

function Identity({name,subtitle}:{name:string;subtitle:string}) {
  const initials=name.split(" ").slice(0,2).map((item)=>item[0]).join("");
  return <div className={styles.identity}><span className={styles.avatar} aria-hidden="true">{initials}</span><div><strong>{name}</strong><span>{subtitle}</span></div></div>;
}

function FooterLinks({publicHref}:{publicHref:string}) {
  return <div className={styles.sidebarFooter}>
    <Link className={styles.utilityLink} href="/"><LayoutDashboard size={17} aria-hidden="true" />Ir al inicio</Link>
    <Link className={styles.utilityLink} href={publicHref}><ExternalLink size={17} aria-hidden="true" />Ver perfil público</Link>
    <LogoutButton className={cn(styles.utilityLink, styles.logout)} />
  </div>;
}

export function DashboardFrame({ children,name,subtitle,publicHref,contextLabel }: { children: React.ReactNode;name:string;subtitle:string;publicHref:string;contextLabel:string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const trigger = menuButtonRef.current;
    const focusable = () => Array.from(drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = focusable(); const first = items[0]; const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKey); trigger?.focus(); };
  }, [open]);
  const currentLabel=navigation.find(([href])=>href==="/dashboard"?pathname===href:pathname.startsWith(href))?.[2]??"Panel";
  return <div className={styles.frame}>
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/" aria-label="Tequit — Inicio"><BrandLogo variant="horizontal" priority /><span className={styles.brandCopy}>{contextLabel}</span></Link>
      <Identity name={name} subtitle={subtitle}/><DashboardNavigation /><FooterLinks publicHref={publicHref}/>
    </aside>
    <header className={styles.mobileHeader}>
      <Link className={styles.mobileBrand} href="/" aria-label="Tequit — Inicio"><BrandLogo variant="horizontal" /></Link>
      <span className={styles.mobileContext}>{currentLabel}</span>
      <button ref={menuButtonRef} className={styles.menuButton} type="button" onClick={() => setOpen(true)} aria-label="Abrir menú del panel" aria-expanded={open} aria-controls="dashboard-mobile-drawer"><span>Menú</span><Menu size={20} aria-hidden="true" /></button>
    </header>
    {open && <div className={styles.drawerOverlay} role="presentation" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}>
      <aside ref={drawerRef} id="dashboard-mobile-drawer" className={styles.drawer} role="dialog" aria-modal="true" aria-label="Navegación del panel">
        <div className={styles.drawerTop}><div><BrandLogo variant="horizontal" /><span className={styles.drawerContext}>{contextLabel}</span></div><button className={styles.closeButton} type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X size={21} /></button></div>
        <Identity name={name} subtitle={subtitle}/><DashboardNavigation onNavigate={() => setOpen(false)} /><FooterLinks publicHref={publicHref}/>
      </aside>
    </div>}
    <div className={styles.main}>{children}</div>
  </div>;
}

export function DashboardContent({ children }: { children: React.ReactNode }) {
  return <main className={styles.content}><div className={styles.stack}>{children}</div></main>;
}
