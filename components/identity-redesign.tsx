import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  MapPin,
  Package,
  ShieldCheck,
  Star,
} from "lucide-react";
import { ProviderCard, Rating } from "@/components/cards";
import { SiteContainer } from "@/components/layout-primitives";
import { RequestForm } from "@/components/request-form";
import { SaveButton } from "@/components/save-button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { providerMessage } from "@/lib/whatsapp";
import type { Business, Provider, Review, Service, Verification } from "@/types";
import styles from "@/components/identity-redesign.module.css";

const verificationLabels: Record<Verification["type"], { title: string; detail: string }> = {
  phone: { title: "Teléfono verificado", detail: "El número de contacto fue confirmado." },
  identity: { title: "Identidad verificada", detail: "La identidad fue revisada por Tequit." },
  references: { title: "Referencias revisadas", detail: "Se revisaron referencias proporcionadas." },
  visited_by_tequit: { title: "Visitado por Tequit", detail: "El equipo de Tequit realizó una visita." },
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(`${date}T12:00:00`));
}

export function EntityHero({ entity, kind }: { entity: Provider | Business; kind: "provider" | "business" }) {
  const isProvider = kind === "provider";
  const title = entity.name;
  const eyebrow = isProvider ? `${(entity as Provider).profession} en Tepic` : `${(entity as Business).category} · Negocio local`;
  const location = isProvider ? entity.zone : (entity as Business).address;

  return <section className={styles.entityHero} aria-labelledby="entity-name">
    <SiteContainer className={styles.heroGrid}>
      <div className={`${styles.heroMark} ${!isProvider ? styles.businessMark : ""}`} aria-hidden>
        {isProvider ? initials(title) : <Building2 size={46} />}
      </div>
      <div>
        <p className={styles.heroEyebrow}>{eyebrow}</p>
        <h1 id="entity-name" className={styles.heroTitle}>{title}</h1>
        <div className={styles.heroMeta}>
          <Rating value={entity.rating} count={entity.reviewCount} />
          <span className={styles.trustLine}><BadgeCheck size={17} aria-hidden /> {entity.verifications.length} verificaciones</span>
        </div>
        <p className={styles.heroLocation}><MapPin size={17} aria-hidden /> {location}</p>
      </div>
      <div className={styles.heroActions}>
        <div className={styles.saveHero}><SaveButton slug={entity.slug} type={kind} /></div>
        <WhatsAppButton
          phone={entity.phone}
          message={providerMessage(title, isProvider ? (entity as Provider).profession : "sus productos o servicios")}
          label={`Contactar a ${title} por WhatsApp`}
          className={`btn btn-block ${styles.whatsappButton}`}
        />
        <Link className="btn btn-secondary" href="#solicitar">Solicitar trabajo</Link>
      </div>
    </SiteContainer>
  </section>;
}

export function DetailSection({ eyebrow, title, description, children, id }: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return <section id={id} className={styles.detailSection} aria-labelledby={headingId}>
    <header className={styles.sectionIntro}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={headingId}>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </header>
    {children}
  </section>;
}

export function ServiceList({ services }: { services: Service[] }) {
  if (!services.length) return <p className="muted">Este negocio todavía no publica servicios.</p>;
  return <div className={styles.serviceGrid}>
    {services.map((service) => <div className={styles.serviceItem} key={service.id}>
      <div className={styles.serviceTitle}><Check size={18} aria-hidden /><strong>{service.name}</strong></div>
      <span className="help">{service.category} · Cotización directa</span>
    </div>)}
  </div>;
}

export function PortfolioGallery({ portfolio }: { portfolio: Provider["portfolio"] }) {
  if (!portfolio.length) return <p className="muted">Todavía no hay trabajos publicados.</p>;
  return <div className={styles.portfolioGrid}>
    {portfolio.map((work) => <figure className={styles.portfolioItem} key={work.id}>
      <Image className={styles.portfolioImage} src={work.image} alt={work.title} width={900} height={600} />
      <figcaption><strong>{work.title}</strong><p>{work.description}</p></figcaption>
    </figure>)}
  </div>;
}

export function ProductList({ business }: { business: Business }) {
  if (!business.products.length) return <p className="muted">Este negocio todavía no publica productos.</p>;
  return <div className={styles.productGrid}>
    {business.products.map((product) => <article className={styles.productItem} key={product.id}>
      <div className={styles.serviceTitle}><Package size={19} aria-hidden /><strong>{product.name}</strong></div>
      <p>{product.description}</p>
      <WhatsAppButton
        phone={business.phone}
        message={providerMessage(business.name, product.name)}
        label={`Preguntar por ${product.name} en WhatsApp`}
        className={`btn ${styles.whatsappButton}`}
      />
    </article>)}
  </div>;
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const approved = reviews.filter((review) => review.status === "approved");
  if (!approved.length) return <p className="muted">Aún no hay reseñas aprobadas.</p>;
  return <div className={styles.reviewList}>
    {approved.map((review) => <article className={styles.reviewItem} key={review.id}>
      <div className={styles.reviewAvatar} aria-hidden>{initials(review.author)}</div>
      <div>
        <div className={styles.reviewHead}><strong>{review.author}</strong><span>{formatDate(review.date)}</span></div>
        <div className={styles.stars} aria-label={`${review.rating} de 5 estrellas`}>
          {Array.from({ length: review.rating }, (_, index) => <Star key={index} size={14} aria-hidden />)}
        </div>
        <p>“{review.comment}”</p>
        <span className={styles.reviewSource}>{review.source === "tequit_lead" ? "Trabajo solicitado en Tequit" : "Cliente invitado"}</span>
      </div>
    </article>)}
  </div>;
}

export function VerificationPanel({ verifications, phone, name }: { verifications: Verification[]; phone: string; name: string }) {
  return <div className={styles.verificationPanel}>
    <ShieldCheck size={30} color="var(--verified)" aria-hidden />
    <h2>Verificaciones</h2>
    <div className={styles.verificationList}>
      {verifications.map((verification) => {
        const content = verificationLabels[verification.type];
        return <div className={styles.verificationItem} key={verification.type}>
          <span className={styles.verificationIcon}><BadgeCheck size={18} aria-hidden /></span>
          <div><strong>{content.title}</strong><p>{content.detail}</p>{verification.date && <p><CalendarDays size={13} aria-hidden /> {formatDate(verification.date)}</p>}</div>
        </div>;
      })}
    </div>
    <p className={styles.verificationNote}>Estas señales confirman datos específicos; no garantizan el resultado de un trabajo ni sustituyen un acuerdo directo.</p>
    <WhatsAppButton phone={phone} message={providerMessage(name)} label={`Contactar a ${name} por WhatsApp`} className={`btn btn-block ${styles.whatsappButton}`} />
  </div>;
}

export function AffiliationNotice({ businessSlug, businessName }: { businessSlug: string; businessName: string }) {
  return <div className={styles.affiliation}>
    <BriefcaseBusiness size={20} aria-hidden />
    <div><strong>Trabaja con <Link className="text-link" href={`/n/${businessSlug}`}>{businessName}</Link></strong><p>La relación laboral y la reputación de cada perfil se muestran de manera independiente.</p></div>
  </div>;
}

export function DirectedRequest({ entity, kind }: { entity: Provider | Business; kind: "provider" | "business" }) {
  return <div className={styles.requestSurface}>
    <p className="eyebrow">Solicitud directa</p>
    <h2>Cuéntale qué necesitas</h2>
    <p className="section-description">Describe el trabajo para que {entity.name} pueda revisar tu solicitud. No necesitas crear una cuenta.</p>
    <RequestForm {...(kind === "provider" ? { targetProvider: entity.slug } : { targetBusiness: entity.slug })} />
  </div>;
}

export function BusinessTeam({ providers }: { providers: Provider[] }) {
  if (!providers.length) return <p className="muted">Este negocio todavía no tiene perfiles afiliados publicados.</p>;
  return <div className="provider-grid">{providers.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div>;
}

export { styles as identityStyles };
