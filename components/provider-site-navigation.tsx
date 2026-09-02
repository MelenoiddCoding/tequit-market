"use client";

import Image from "next/image";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {BriefcaseBusiness,ChevronRight,Heart,Home,Search,Store,UserRound,X} from "lucide-react";
import {BrandLogo} from "@/components/brand-logo";
import styles from "@/components/provider-site.module.css";

export type MarketplaceDestination="home"|"search"|"businesses"|"request"|"favorites"|"account";
const marketplaceLinks:[MarketplaceDestination,string,typeof Home,string][]=[
  ["home","/",Home,"Inicio"],
  ["search","/buscar",Search,"Buscar servicios"],
  ["businesses","/negocios",Store,"Negocios"],
  ["request","/solicitar",BriefcaseBusiness,"Publicar una necesidad"],
  ["favorites","/guardados",Heart,"Favoritos"],
  ["account","/cuenta",UserRound,"Cuenta"],
];

function initials(name:string){return name.split(" ").slice(0,2).map(part=>part[0]).join("")}
async function track(slug:string,type:"marketplace_nav_open"|"marketplace_nav_click",destination?:MarketplaceDestination){try{await fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,target:slug,targetType:"provider",destination}),keepalive:true})}catch{}}

export function ProviderMarketplaceLink({slug,destination,href,children,className,onClick}:{slug:string;destination:MarketplaceDestination;href:string;children:React.ReactNode;className?:string;onClick?:()=>void}){return <Link className={className} href={href} onClick={()=>{void track(slug,"marketplace_nav_click",destination);onClick?.()}}>{children}</Link>}

export function ProviderSiteNavigation({name,avatar,slug,proBrand}:{name:string;avatar?:string;slug:string;proBrand:boolean}){const[open,setOpen]=useState(false);const triggerRef=useRef<HTMLButtonElement>(null);const drawerRef=useRef<HTMLElement>(null);useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;const trigger=triggerRef.current;document.body.style.overflow="hidden";drawerRef.current?.querySelector<HTMLElement>("a,button")?.focus();const keydown=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false);if(event.key!=="Tab"||!drawerRef.current)return;const focusable=[...drawerRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1)!;if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}};document.addEventListener("keydown",keydown);return()=>{document.body.style.overflow=previous;document.removeEventListener("keydown",keydown);trigger?.focus()}},[open]);function show(){setOpen(true);void track(slug,"marketplace_nav_open")}
  return <><header className={styles.siteHeader}><Link href={`/p/${slug}`} className={styles.providerBrand}>{avatar?<Image src={avatar} alt="" width={42} height={42}/>:<span>{initials(name)}</span>}<span><strong>{name}</strong><small>{proBrand?"Sitio profesional":"Perfil en Tequit"}</small></span></Link><nav className={styles.providerSections} aria-label="Secciones del sitio"><Link href="#servicios">Servicios</Link><Link href="#trabajos">Trabajos</Link><Link href="#resenas">Reseñas</Link><Link href="#solicitar">Contacto</Link></nav><button ref={triggerRef} className={styles.exploreTrigger} type="button" onClick={show} aria-expanded={open} aria-controls="provider-tequit-drawer"><BrandLogo variant="symbol"/><span className={styles.exploreDesktopLabel}>{proBrand?"Respaldado por Tequit":"Explorar Tequit"}</span><span className={styles.exploreMobileLabel}>Explorar</span><ChevronRight aria-hidden/></button></header>{open&&<div className={styles.providerNavOverlay} role="presentation" onMouseDown={event=>event.target===event.currentTarget&&setOpen(false)}><aside ref={drawerRef} id="provider-tequit-drawer" className={styles.providerNavDrawer} role="dialog" aria-modal="true" aria-label="Explorar Tequit"><header><BrandLogo/><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar navegación"><X aria-hidden/></button></header><div className={styles.providerNavIntro}><p className={styles.eyebrow}>Servicios locales en Tepic</p><h2>Encuentra quién le sabe</h2><p>Explora más personas y negocios, o publica lo que necesitas.</p></div><nav aria-label="Explorar Tequit">{marketplaceLinks.map(([destination,href,Icon,label])=><ProviderMarketplaceLink slug={slug} destination={destination} href={href} onClick={()=>setOpen(false)} key={destination}><Icon aria-hidden/><span>{label}</span><ChevronRight aria-hidden/></ProviderMarketplaceLink>)}</nav><p className={styles.providerNavNote}>Estás visitando el sitio profesional de <strong>{name}</strong>.</p></aside></div>}</>}
