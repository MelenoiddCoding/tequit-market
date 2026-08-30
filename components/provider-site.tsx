import Image from "next/image";
import Link from "next/link";
import {BadgeCheck,BriefcaseBusiness,CalendarDays,ChevronDown,MapPin,MessageCircle,ShieldCheck,Star} from "lucide-react";
import {BrandLogo} from "@/components/brand-logo";
import {DirectedRequest,PortfolioGallery,ReviewList} from "@/components/identity-redesign";
import {ProviderShareTools} from "@/components/provider-share-tools";
import {ViewTracker} from "@/components/view-tracker";
import {WhatsAppButton} from "@/components/whatsapp-button";
import {providerMessage} from "@/lib/whatsapp";
import type {Provider} from "@/types";
import styles from "@/components/provider-site.module.css";

function initials(name:string){return name.split(" ").slice(0,2).map((part)=>part[0]).join("")}
export function ProviderSite({provider,referrer}:{provider:Provider;referrer?:string}){
  const proBrand=provider.plan==="pro"&&provider.site.whiteLabel;const accent=provider.plan==="pro"?provider.site.accentColor:"#254432";
  return <main className={`${styles.site} ${styles[`theme_${provider.plan==="pro"?provider.site.theme:"tequit"}`]}`} style={{"--provider-accent":accent} as React.CSSProperties}>
    <ViewTracker type="profile_view" target={provider.slug} referrer={referrer}/>
    <header className={styles.siteHeader}><Link href={`/p/${provider.slug}`} className={styles.providerBrand}>{provider.avatarImage?<Image src={provider.avatarImage} alt="" width={42} height={42}/>:<span>{initials(provider.name)}</span>}<strong>{provider.name}</strong></Link>{proBrand?<Link className={styles.tequitSeal} href="/">Respaldado por Tequit</Link>:<Link href="/" aria-label="Tequit — Inicio"><BrandLogo/></Link>}</header>
    <section className={styles.hero}>{provider.site.coverImage&&<Image className={styles.cover} src={provider.site.coverImage} alt={`Trabajo de ${provider.name}`} fill priority sizes="100vw"/>}<div className={styles.heroShade}/><div className={styles.heroContent}><p>{provider.profession} · {provider.zone}</p><h1>{provider.site.headline||provider.name}</h1><p className={styles.heroIntro}>{provider.site.intro||provider.bio}</p><div className={styles.heroActions}><WhatsAppButton phone={provider.phone} message={providerMessage(provider.name,provider.profession)} label="Escribir por WhatsApp" className={styles.whatsapp} targetSlug={provider.slug} targetType="provider"/><Link className={styles.requestLink} href="#solicitar">Solicitar trabajo</Link></div></div></section>
    <section className={styles.trust} aria-label="Señales de confianza"><span><Star aria-hidden/><strong>{provider.reviewCount?provider.rating.toFixed(1):"Nuevo"}</strong><small>{provider.reviewCount} reseñas</small></span><span><ShieldCheck aria-hidden/><strong>{provider.verifications.length}</strong><small>verificaciones</small></span><span><MapPin aria-hidden/><strong>{provider.zone}</strong><small>zona de atención</small></span>{provider.site.yearsExperience!==undefined&&<span><CalendarDays aria-hidden/><strong>{provider.site.yearsExperience}</strong><small>años de experiencia</small></span>}</section>
    <div className={styles.content}>
      <section id="servicios" className={styles.section}><p className={styles.eyebrow}>Cómo puedo ayudarte</p><h2>Servicios</h2><div className={styles.services}>{provider.services.map((service)=><article key={service.id}><BadgeCheck aria-hidden/><div><h3><Link href={`/servicios/${service.slug}`}>{service.name}</Link></h3><p>{service.description||`Cotiza directamente ${service.name.toLowerCase()} en ${provider.zone}.`}</p></div></article>)}</div></section>
      <section className={styles.section}><p className={styles.eyebrow}>Trabajo real</p><h2>Proyectos realizados</h2><PortfolioGallery portfolio={provider.portfolio}/></section>
      <section className={styles.about}><div><p className={styles.eyebrow}>Experiencia local</p><h2>Sobre {provider.name}</h2><p>{provider.site.intro||provider.bio}</p></div><aside><h3>Zonas de atención</h3><div className={styles.tags}>{[...provider.areas,provider.zone].filter((value,index,array)=>array.indexOf(value)===index).map((area)=><span key={area}>{area}</span>)}</div>{provider.businessSlug&&provider.businessName&&<p><BriefcaseBusiness aria-hidden/> Afiliado a <Link href={`/n/${provider.businessSlug}`}>{provider.businessName}</Link></p>}</aside></section>
      <section className={styles.section}><p className={styles.eyebrow}>Clientes anteriores</p><h2>Reseñas</h2><ReviewList reviews={provider.reviews}/></section>
      {provider.faqs.length>0&&<section className={styles.section}><p className={styles.eyebrow}>Antes de contactar</p><h2>Preguntas frecuentes</h2><div className={styles.faqs}>{provider.faqs.map((faq)=><details key={faq.id}><summary>{faq.question}<ChevronDown aria-hidden/></summary><p>{faq.answer}</p></details>)}</div></section>}
      <section id="solicitar" className={styles.request}><DirectedRequest entity={provider} kind="provider"/></section>
      <section className={styles.finalCta}><MessageCircle aria-hidden/><h2>¿Tienes un trabajo en mente?</h2><p>Escríbele directamente a {provider.name} y cuéntale qué necesitas.</p><WhatsAppButton phone={provider.phone} message={providerMessage(provider.name,provider.profession)} label="Contactar por WhatsApp" className={styles.whatsapp} targetSlug={provider.slug} targetType="provider"/><ProviderShareTools slug={provider.slug} name={provider.name} compact/></section>
    </div>
    <footer className={styles.footer}><span>{proBrand?`Sitio de ${provider.name}`:"Publicado en Tequit"}</span><Link href="/buscar">Encontrar más servicios en Tepic</Link></footer>
    <div className={styles.mobileDock}><WhatsAppButton phone={provider.phone} message={providerMessage(provider.name,provider.profession)} label="WhatsApp" className={styles.whatsapp} targetSlug={provider.slug} targetType="provider"/></div>
  </main>
}
