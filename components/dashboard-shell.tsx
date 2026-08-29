"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, BriefcaseBusiness, ClipboardList, ExternalLink, Images,
  LayoutDashboard, MessageSquareText, ShieldCheck, UserRound, Wrench,
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
  const pathname = usePathname();
  const router=useRouter();
  const currentHref=navigation.find(([href])=>href==="/dashboard"?pathname===href:pathname.startsWith(href))?.[0]??"/dashboard";
  return <div className={styles.frame}>
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/" aria-label="Tequit — Inicio"><BrandLogo variant="horizontal" priority /><span className={styles.brandCopy}>{contextLabel}</span></Link>
      <Identity name={name} subtitle={subtitle}/><DashboardNavigation /><FooterLinks publicHref={publicHref}/>
    </aside>
    <header className={styles.mobileHeader}>
      <div><span className={styles.mobileEyebrow}>Tu cuenta</span><strong>{name.split(" ")[0]}</strong></div>
      <label className={styles.mobileSectionPicker}><span>Sección</span><select aria-label="Sección del panel" value={currentHref} onChange={(event)=>router.push(event.target.value)}>{navigation.map(([href,,label])=><option value={href} key={href}>{label}</option>)}</select></label>
    </header>
    <div className={styles.main}>{children}</div>
  </div>;
}

export function DashboardContent({ children }: { children: React.ReactNode }) {
  return <main className={styles.content}><div className={styles.stack}>{children}</div></main>;
}
