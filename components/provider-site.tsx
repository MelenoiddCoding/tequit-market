import { ProviderSiteCatalog } from "@/components/provider-site-catalog";
import { WEBSITE_TEMPLATES } from "@/lib/website-offer";
import Image from "next/image";
import { ProviderSiteEssential } from "@/components/provider-site-essential";
import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import {
  PortfolioGallery,
  ReviewList,
} from "@/components/identity-redesign";
import { PhoneCallButton } from "@/components/phone-call-button";
import { ProviderShareTools } from "@/components/provider-share-tools";
import {
  ProviderMarketplaceLink,
  ProviderSiteNavigation,
} from "@/components/provider-site-navigation";
import { ViewTracker } from "@/components/view-tracker";
import { WorkGallery } from "@/components/work-gallery";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { ProviderWhatsAppDock } from "@/components/provider-whatsapp-dock";
import { providerMessage } from "@/lib/whatsapp";
import type { Provider } from "@/types";
import { websiteTemplate, WEBSITE_OFFER } from "@/lib/website-offer";
import styles from "@/components/provider-site.module.css";

export function ProviderSite({
  provider,
  referrer,
  customBranding = false,
  preview = false,
}: {
  provider: Provider;
  referrer?: string;
  customBranding?: boolean;
  preview?: boolean;
}) {
  if (WEBSITE_TEMPLATES.some(t=>t.id===provider.site.templateId)) return <ProviderSiteCatalog provider={provider} preview={preview} referrer={referrer}/>;
  if (provider.site.templateId === "esencial") return <ProviderSiteEssential provider={provider} referrer={referrer} preview={preview} />;
  const Wrapper = preview ? "div" : "main";
  const advanced = customBranding;
  const template = websiteTemplate(provider.site.templateId);
  const proBrand = advanced && provider.site.whiteLabel;
  const accent = template?.accent ?? (advanced ? provider.site.accentColor : "#254432");
  return (
    <Wrapper
      className={`${styles.site} ${template ? `${styles.curated} ${styles[`template_${template.id}`]}` : styles[`theme_${advanced ? provider.site.theme : "tequit"}`]} ${preview ? styles.preview : ""}`}
      style={{ "--provider-accent": accent } as React.CSSProperties}
    >
      <ViewTracker
        type="website_view"
        disabled={preview || provider.isDemo}
        target={provider.slug}
        referrer={referrer}
      />
      {!preview && (
        <ProviderSiteNavigation
          name={provider.name}
          avatar={provider.avatarImage}
          slug={provider.slug}
          proBrand={proBrand}
        />
      )}
      <section
        className={`${styles.hero} ${!provider.site.coverImage ? styles.heroWithoutCover : ""}`}
      >
        {provider.site.coverImage && (
          <Image
            className={styles.cover}
            src={provider.site.coverImage}
            alt={`Trabajo de ${provider.name}`}
            fill
            loading="eager"
            sizes="100vw"
          />
        )}
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p>
            {provider.profession} · {provider.zone}
          </p>
          <h1>{template ? provider.name : provider.site.headline || provider.name}</h1>
          {template && <p className={styles.headline}>{provider.site.headline}</p>}
          <p className={styles.heroIntro}>
            {template ? `Atención en ${[provider.zone, ...provider.areas].filter((value, index, array) => array.indexOf(value) === index).join(" · ")}` : provider.site.intro || provider.bio}
          </p>
          <div className={styles.heroActions} id="provider-hero-whatsapp">
            <WhatsAppButton
              disabled={preview || !provider.canContact}
              disabledLabel={preview ? "Escribir por WhatsApp" : undefined}
              phone={provider.phone}
              message={providerMessage(provider.name, provider.profession)}
              label="Escribir por WhatsApp"
              className={styles.whatsapp}
              targetSlug={provider.slug}
              targetType="provider"
            />
            {provider.canContact && !preview && provider.showPhoneCall && (
              <PhoneCallButton
                phone={provider.phone}
                slug={provider.slug}
                className={styles.requestLink}
              />
            )}{" "}
          </div>
        </div>
      </section>
      <section className={styles.trust} aria-label="Señales de confianza">
        <span>
          <Star aria-hidden />
          <strong>
            {provider.reviewCount ? provider.rating.toFixed(1) : "Nuevo"}
          </strong>
          <small>{provider.reviewCount} reseñas</small>
        </span>
        {(!template || provider.verifications.length > 0) && <span>
          <ShieldCheck aria-hidden />
          <strong>{provider.verifications.length}</strong>
          <small>verificaciones</small>
        </span>}
        <span>
          <MapPin aria-hidden />
          <strong>{provider.zone}</strong>
          <small>zona de atención</small>
        </span>
        {provider.site.yearsExperience !== undefined && (
          <span>
            <CalendarDays aria-hidden />
            <strong>{provider.site.yearsExperience}</strong>
            <small>años de experiencia</small>
          </span>
        )}
      </section>
      <div className={styles.content}>
        <section id="servicios" className={styles.section}>
          <p className={styles.eyebrow}>Cómo puedo ayudarte</p>
          <h2>Servicios</h2>
          <div className={styles.services}>
            {(template ? provider.services.slice(0, WEBSITE_OFFER.services) : provider.services).map((service) => (
              <article key={service.id}>
                <BadgeCheck aria-hidden />
                <div>
                  <h3>
                    <span>{service.name}</span>
                  </h3>
                  <p>
                    {service.description ||
                      `Cotiza directamente ${service.name.toLowerCase()} en ${provider.zone}.`}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="trabajos" className={styles.section}>
          <p className={styles.eyebrow}>Trabajo real</p>
          <h2>Proyectos realizados</h2>
          {template ? <WorkGallery works={provider.portfolio.slice(0, WEBSITE_OFFER.photos)} className={styles.workGrid}>{provider.portfolio.slice(0, WEBSITE_OFFER.photos).map((work,index) => <figure key={work.id}><div className={styles.workImage}><button type="button" data-work-index={index} aria-label={`Ampliar foto: ${work.title}`} aria-haspopup="dialog" className={styles.workTrigger}><Image src={work.image} alt={work.title} fill sizes="(max-width: 760px) 100vw, 50vw" /></button></div><figcaption><h3>{work.title}</h3><p>{work.description}</p></figcaption></figure>)}{!provider.portfolio.length && <p>Las fotografías de trabajos se agregarán próximamente. Puedes consultar directamente por el servicio que necesitas.</p>}</WorkGallery> : <PortfolioGallery portfolio={provider.portfolio} />}
        </section>
        <section className={styles.about}>
          <div>
            <p className={styles.eyebrow}>Experiencia local</p>
            <h2>Sobre {provider.name}</h2>
            <p>{provider.site.intro || provider.bio}</p>
          </div>
          <aside>
            <h3>Zonas de atención</h3>
            <div className={styles.tags}>
              {[...provider.areas, provider.zone]
                .filter((value, index, array) => array.indexOf(value) === index)
                .map((area) => (
                  <span key={area}>{area}</span>
                ))}
            </div>
            {provider.businessSlug && provider.businessName && (
              <p>
                <BriefcaseBusiness aria-hidden /> Afiliado a{" "}
                <Link href={`/n/${provider.businessSlug}`}>
                  {provider.businessName}
                </Link>
              </p>
            )}
          </aside>
        </section>
        <section id="resenas" className={styles.section}>
          <p className={styles.eyebrow}>Clientes anteriores</p>
          <h2>Reseñas</h2>
          <ReviewList reviews={provider.reviews} />
        </section>
        {provider.faqs.length > 0 && (
          <section className={styles.section}>
            <p className={styles.eyebrow}>Antes de contactar</p>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqs}>
              {(template ? provider.faqs.slice(0, WEBSITE_OFFER.faqs) : provider.faqs).map((faq) => (
                <details key={faq.id}>
                  <summary>
                    {faq.question}
                    <ChevronDown aria-hidden />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
        <section id="contacto" className={styles.finalCta}>
          <WhatsAppIcon width={24} height={24} />
          <h2>¿Tienes un trabajo en mente?</h2>
          <p>
            Contacta directamente a {provider.name} y cuéntale qué necesitas.
          </p>
          <WhatsAppButton
            disabled={preview || !provider.canContact}
            disabledLabel={preview ? "Contactar por WhatsApp" : undefined}
            phone={provider.phone}
            message={providerMessage(provider.name, provider.profession)}
            label="Escribir por WhatsApp"
            className={styles.whatsapp}
            targetSlug={provider.slug}
            targetType="provider"
          />
          {!preview && <ProviderShareTools
            slug={provider.slug}
            name={provider.name}
            subtitle={provider.profession}
            compact
          />}
          <nav className={styles.socialLinks} aria-label="Redes del prestador">
            {Object.entries(provider.site.socialLinks).filter(([,url]) => url && /^https?:\/\//i.test(url)).map(([key,url]) => preview ? <span key={key}>{key === "website" ? "Sitio externo" : key}</span> : <a key={key} href={url} target="_blank" rel="noopener noreferrer">{key === "website" ? "Sitio externo" : key}</a>)}
          </nav>
        </section>
      </div>
      {!preview && <footer className={styles.footer}>
        <div className={styles.footerIdentity}>
          <BrandLogo variant="symbol" />
          <div>
            <strong>
              {proBrand
                ? `Sitio profesional de ${provider.name}`
                : `${provider.name} · Publicado en Tequit`}
            </strong>
            <p>
              Encuentra personas y negocios en Tepic que puedan hacer el trabajo
              que necesitas.
            </p>
          </div>
        </div>
        <nav aria-label="Continuar en Tequit">
          <ProviderMarketplaceLink
            slug={provider.slug}
            destination="search"
            href="/buscar"
          >
            Buscar servicios
          </ProviderMarketplaceLink>
          <ProviderMarketplaceLink
            slug={provider.slug}
            destination="businesses"
            href="/negocios"
          >
            Ver negocios
          </ProviderMarketplaceLink>
          <ProviderMarketplaceLink
            slug={provider.slug}
            destination="request"
            href="/solicitar"
          >
            Publicar una necesidad
          </ProviderMarketplaceLink>
        </nav>
      </footer>}
      {provider.canContact && !preview && (
        <ProviderWhatsAppDock
          heroId="provider-hero-whatsapp"
          phone={provider.phone}
          message={providerMessage(provider.name, provider.profession)}
          slug={provider.slug}
        />
      )}
    </Wrapper>
  );
}
