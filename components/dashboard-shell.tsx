"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect,useRef,useState } from "react";
import {
  BarChart3, BriefcaseBusiness, ClipboardList, ExternalLink, Images,
  Globe2,Hammer,Home,LayoutDashboard,MessageSquareText,ShieldCheck,UserRound,Wrench,X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/logout-button";
import styles from "@/components/dashboard-redesign.module.css";
import { cn } from "@/lib/cn";

const navigation = [
  ["/dashboard", LayoutDashboard, "Resumen"],
  ["/dashboard/perfil", UserRound, "Mi perfil"],
  ["/dashboard/sitio", Globe2, "Mi sitio"],
  ["/dashboard/servicios", Wrench, "Servicios"],
  ["/dashboard/trabajos", Images, "Trabajos"],
  ["/dashboard/solicitudes", ClipboardList, "Solicitudes"],
  ["/dashboard/resenas", MessageSquareText, "Reseñas"],
  ["/dashboard/estadisticas", BarChart3, "Estadísticas"],
  ["/dashboard/negocios", BriefcaseBusiness, "Negocios"],
  ["/dashboard/plan", ShieldCheck, "Plan"],
  ["/dashboard/herramientas", Hammer, "Herramientas"],
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

function FooterLinks({publicHref,onNavigate}:{publicHref:string;onNavigate?:()=>void}) {
  return <div className={styles.sidebarFooter}>
    <Link className={styles.utilityLink} href="/" onClick={onNavigate}><Home size={17} aria-hidden="true" />Cambiar a modo Usuario</Link>
    <Link className={styles.utilityLink} href={publicHref} onClick={onNavigate}><ExternalLink size={17} aria-hidden="true" />Ver perfil público</Link>
    <LogoutButton className={cn(styles.utilityLink, styles.logout)} />
  </div>;
}

const mobileNavigation=[
  ["/dashboard",LayoutDashboard,"Inicio"],
  ["/dashboard/servicios",Wrench,"Servicios"],
  ["/dashboard/solicitudes",ClipboardList,"Solicitudes"],
  ["/dashboard/herramientas",Hammer,"Herramientas"],
  ["/dashboard/cuenta",UserRound,"Cuenta"],
] as const;

function ProviderBottomNavigation(){const pathname=usePathname();return <nav className={styles.providerBottomNav} aria-label="Navegación de prestador">{mobileNavigation.map(([href,Icon,label])=>{const active=href==="/dashboard"?pathname===href:pathname.startsWith(href);return <Link href={href} key={href} className={cn(active&&styles.providerBottomActive)} aria-current={active?"page":undefined}><Icon aria-hidden/><span>{label}</span></Link>})}</nav>}

export function DashboardFrame({ children,name,subtitle,publicHref,contextLabel }: { children: React.ReactNode;name:string;subtitle:string;publicHref:string;contextLabel:string }) {
  const[open,setOpen]=useState(false);const triggerRef=useRef<HTMLButtonElement>(null);const drawerRef=useRef<HTMLElement>(null);
  useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;const trigger=triggerRef.current;document.body.style.overflow="hidden";drawerRef.current?.querySelector<HTMLElement>("a,button")?.focus();const close=(event:KeyboardEvent)=>event.key==="Escape"&&setOpen(false);document.addEventListener("keydown",close);return()=>{document.body.style.overflow=previous;document.removeEventListener("keydown",close);trigger?.focus()}},[open]);
  const initials=name.split(" ").slice(0,2).map((item)=>item[0]).join("");
  return <div className={styles.frame}>
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/" aria-label="Tequit — Inicio"><BrandLogo variant="horizontal" priority /><span className={styles.brandCopy}>{contextLabel}</span></Link>
      <Identity name={name} subtitle={subtitle}/><DashboardNavigation /><FooterLinks publicHref={publicHref}/>
    </aside>
    <header className={styles.mobileHeader}><button ref={triggerRef} className={styles.profileTrigger} type="button" onClick={()=>setOpen(true)} aria-label="Abrir menú de prestador" aria-expanded={open}><span className={styles.avatar} aria-hidden>{initials}</span><span><small>Modo Prestador</small><strong>{name.split(" ")[0]}</strong></span></button><Link className={styles.modeSwitch} href="/">Modo Usuario</Link></header>
    {open&&<div className={styles.drawerOverlay} role="presentation" onMouseDown={(event)=>event.target===event.currentTarget&&setOpen(false)}><aside ref={drawerRef} className={styles.drawer} role="dialog" aria-modal="true" aria-label="Menú de prestador"><div className={styles.drawerTop}><Identity name={name} subtitle={subtitle}/><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar menú"><X aria-hidden/></button></div><DashboardNavigation onNavigate={()=>setOpen(false)}/><FooterLinks publicHref={publicHref} onNavigate={()=>setOpen(false)}/></aside></div>}
    <div className={styles.main}>{children}</div>
    <ProviderBottomNavigation/>
  </div>;
}

export function DashboardContent({ children }: { children: React.ReactNode }) {
  return <main className={styles.content}><div className={styles.stack}>{children}</div></main>;
}
