import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MapPin, Wrench } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ReviewList } from "@/components/identity-redesign";
import { PhoneCallButton } from "@/components/phone-call-button";
import { ViewTracker } from "@/components/view-tracker";
import { WorkGallery } from "@/components/work-gallery";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { providerMessage } from "@/lib/whatsapp";
import { WEBSITE_OFFER } from "@/lib/website-offer";
import type { Provider } from "@/types";
import styles from "./provider-site-essential.module.css";

/** Fixed one-page composition; all content comes from the shared provider record. */
export function ProviderSiteEssential({ provider, preview = false, referrer }: {
  provider: Provider; preview?: boolean; referrer?: string;
}) {
  const Wrapper = preview ? "div" : "main";
  const contactEnabled = !preview && !provider.isDemo && !!provider.canContact;
  const areas = [...new Set([provider.zone, ...provider.areas].filter(Boolean))];
  const whatsapp = <WhatsAppButton phone={provider.phone}
    message={providerMessage(provider.name, provider.profession)} label="Escribir por WhatsApp"
    disabled={!contactEnabled} disabledLabel={preview ? "Escribir por WhatsApp" : undefined}
    targetSlug={provider.slug} targetType="provider" className={styles.whatsapp} />;
  return <Wrapper className={styles.site}>
    <ViewTracker type="website_view" target={provider.slug} referrer={referrer} disabled={preview || provider.isDemo} />
    {provider.site.coverImage && <div className={styles.cover}>
      <Image src={provider.site.coverImage} alt={`Portada de ${provider.name}`} fill sizes="100vw" loading="eager" />
    </div>}
    <div className={styles.content}>
      <header className={styles.intro}>
        {provider.avatarImage && <div className={`${styles.avatar} ${provider.site.coverImage ? styles.overlap : ""}`}>
          <Image src={provider.avatarImage} alt={provider.name} fill sizes="96px" />
        </div>}
        <h1>{provider.name}</h1>
        <p className={styles.specialty}>{provider.site.headline || provider.profession}</p>
        {(provider.site.intro || provider.bio) && <p className={styles.description}>{provider.site.intro || provider.bio}</p>}
        {provider.zone && <p className={styles.location}><MapPin size={16} aria-hidden />{provider.zone}</p>}
        {whatsapp}
      </header>
      {provider.services.length > 0 && <section className={styles.section} id="servicios">
        <h2>Servicios</h2>
        <div className={styles.services}>{provider.services.slice(0, WEBSITE_OFFER.services).map(service =>
          <article key={service.id}><span className={styles.serviceIcon}><Wrench size={20} aria-hidden /></span><div>
            <h3>{service.name}</h3>{service.description && <p>{service.description}</p>}
          </div></article>)}</div>
      </section>}
      {provider.portfolio.length > 0 && <section className={styles.section} id="trabajos">
        <h2>Trabajos realizados</h2>
        <WorkGallery works={provider.portfolio.slice(0, WEBSITE_OFFER.photos)} className={styles.gallery}>{provider.portfolio.slice(0, WEBSITE_OFFER.photos).map((work,index) =>
          <figure key={work.id}><div className={styles.workImage}><button type="button" data-work-index={index} aria-label={`Ampliar foto: ${work.title}`} aria-haspopup="dialog" className={styles.workTrigger}><Image src={work.image} alt={work.title} fill sizes="(max-width: 768px) 50vw, 420px" /></button></div>
            <figcaption><h3>{work.title}</h3>{work.description && <p>{work.description}</p>}</figcaption>
          </figure>)}</WorkGallery>
      </section>}
      {provider.reviews.length > 0 && <section className={styles.section} id="resenas"><h2>Reseñas</h2><ReviewList reviews={provider.reviews} /></section>}
      {provider.faqs.length > 0 && <section className={styles.section}>
        <h2>Preguntas frecuentes</h2>
        {provider.faqs.slice(0, WEBSITE_OFFER.faqs).map(faq => <details className={styles.faq} key={faq.id}>
          <summary>{faq.question}<ChevronDown size={18} aria-hidden /></summary><p>{faq.answer}</p>
        </details>)}
      </section>}
      <section className={styles.contact} id="contacto">
        <h2>¿En qué podemos ayudarte?</h2><p>Cuéntanos qué necesitas y dónde sería el trabajo.</p>
        <div className={styles.actions}>{whatsapp}{contactEnabled && provider.showPhoneCall && <PhoneCallButton phone={provider.phone} slug={provider.slug} className={styles.call} />}</div>
      </section>
      <footer className={styles.footer}>
        <strong>{provider.name}</strong>
        {areas.length > 0 && <div className={styles.coverage}><h2>Zonas de atención</h2><ul>{areas.map(area => <li key={area}>{area}</li>)}</ul></div>}
        {provider.businessSlug && provider.businessName && <p>Afiliado a {preview ? provider.businessName : <Link href={`/n/${provider.businessSlug}`}>{provider.businessName}</Link>}</p>}
        <nav className={styles.social} aria-label="Redes del prestador">
          {Object.entries(provider.site.socialLinks).filter(([, url]) => url && /^https?:\/\//i.test(url)).map(([key, url]) => preview
            ? <span key={key}>{key === "website" ? "Sitio externo" : key}</span>
            : <a key={key} href={url} target="_blank" rel="noopener noreferrer">{key === "website" ? "Sitio externo" : key}</a>)}
        </nav>
        {!preview && <div className={styles.brand}><BrandLogo variant="symbol" /><Link href={`/u/${provider.slug}`}>Ver perfil en Tequit</Link><Link href="/buscar">Buscar servicios</Link></div>}
      </footer>
    </div>
  </Wrapper>;
}
