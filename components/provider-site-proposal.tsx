import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  Bolt,
  Camera,
  Flame,
  MapPin,
  Sparkles,
  Sun,
  Wrench,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ProposalShareAction } from "@/components/provider-site-proposal-actions";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { Provider, Service } from "@/types";
import styles from "@/components/provider-site-proposal.module.css";

const serviceIcons = [Bolt, Sun, Flame, Sparkles, Wrench];

const faqs = [
  {
    question: "¿Qué necesito para cotizar paneles solares?",
    answer: "Ten a la mano tu recibo de CFE e indica si el proyecto es para casa o negocio. Así podemos dimensionar la solución según tu consumo.",
  },
  {
    question: "¿También instalan calentadores solares?",
    answer: "Sí. Realizamos suministro e instalación de calentadores solares para hogares y negocios.",
  },
  {
    question: "¿Atienden fuera de Tepic?",
    answer: "La cobertura principal es Tepic, Nayarit. Escríbenos para confirmar disponibilidad en otra localidad.",
  },
];

function ProviderLogo({ provider, compact = false }: { provider: Provider; compact?: boolean }) {
  return (
    <span className={compact ? styles.logoCompact : styles.logo}>
      {provider.avatarImage ? (
        <Image src={provider.avatarImage} alt={`Logo de ${provider.name}`} fill sizes={compact ? "44px" : "88px"} />
      ) : (
        <span aria-hidden>SH</span>
      )}
    </span>
  );
}

function ServiceItem({ service, index }: { service: Service; index: number }) {
  const Icon = serviceIcons[index % serviceIcons.length];
  return (
    <article className={styles.serviceItem}>
      <span className={styles.serviceIcon}><Icon aria-hidden /></span>
      <div>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <a href="#contacto">Solicitar cotización <ArrowDown aria-hidden /></a>
      </div>
    </article>
  );
}

export function ProviderSiteProposal({ provider }: { provider: Provider }) {
  const services = provider.services.slice(0, 5);
  const works = provider.portfolio.slice(0, 5);
  const message = "Hola Soluciones Haro. Quiero cotizar una instalación. ¿Me pueden compartir información?";

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <a className={styles.headerBrand} href="#inicio" aria-label={`${provider.name} — inicio`}>
          <ProviderLogo provider={provider} compact />
          <span><strong>{provider.name}</strong><small>Energía solar y soluciones eléctricas</small></span>
        </a>
        <nav className={styles.desktopNav} aria-label="Secciones del sitio">
          <a href="#servicios">Servicios</a>
          <a href="#trabajos">Trabajos</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <WhatsAppButton
          phone={provider.phone}
          message={message}
          label="Cotizar por WhatsApp"
          className={styles.headerCta}
          targetSlug={provider.slug}
          targetType="provider"
        />
      </header>

      <section id="inicio" className={styles.hero}>
        {provider.site.coverImage && (
          <Image
            className={styles.heroImage}
            src={provider.site.coverImage}
            alt={`Instalación realizada por ${provider.name}`}
            width={1280}
            height={480}
            priority
            sizes="100vw"
          />
        )}
        <div className={styles.heroBody}>
          <div className={styles.heroContent}>
            <div className={styles.heroIdentity}>
              <ProviderLogo provider={provider} />
              <p>Energía solar y soluciones integrales</p>
            </div>
            <p className={styles.heroKicker}>Paneles solares · electricidad · climatización</p>
            <h1>{provider.site.headline}</h1>
            <p className={styles.heroCopy}>Soluciones para casas y negocios, dimensionadas de acuerdo con tu consumo, espacio y necesidades.</p>
            <div id="provider-proposal-whatsapp" className={styles.heroActions}>
              <WhatsAppButton
                phone={provider.phone}
                message={message}
                label="Cotizar por WhatsApp"
                className={styles.primaryAction}
                targetSlug={provider.slug}
                targetType="provider"
              />
              <a className={styles.secondaryAction} href="#trabajos"><Camera aria-hidden /> Ver trabajos</a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.trust} aria-label="Información principal">
        <div><MapPin aria-hidden /><span><strong>{provider.zone}</strong><small>Zona de atención</small></span></div>
        <div><BadgeCheck aria-hidden /><span><strong>{services.length} servicios</strong><small>Soluciones disponibles</small></span></div>
        <div><Camera aria-hidden /><span><strong>{works.length} proyectos</strong><small>Trabajos realizados</small></span></div>
      </section>

      <section id="servicios" className={styles.servicesSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Servicios</p>
          <h2>Soluciones para ahorrar energía y mejorar tus espacios</h2>
          <p>Instalación, adecuación y mantenimiento para proyectos residenciales y comerciales.</p>
        </div>
        <div className={styles.serviceList}>
          {services.map((service, index) => <ServiceItem key={service.id} service={service} index={index} />)}
        </div>
      </section>

      {works.length > 0 && (
        <section id="trabajos" className={styles.workSection}>
          <div className={styles.sectionIntroLight}>
            <p className={styles.eyebrow}>Trabajos realizados</p>
            <h2>Instalaciones hechas para durar</h2>
            <p>Conoce algunos de nuestros proyectos de energía solar.</p>
          </div>
          <div className={styles.workGrid}>
            {works.map((work, index) => (
              <figure key={work.id} className={index === 0 ? styles.featuredWork : styles.workItem}>
                <div className={styles.workImage}>
                  <Image src={work.image} alt={work.title} width={1200} height={900} sizes={index === 0 ? "(max-width: 760px) 100vw, 66vw" : "(max-width: 760px) 50vw, 33vw"} />
                </div>
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{work.title}</h3>{work.description && <p>{work.description}</p>}<a href="#contacto">Cotizar algo similar <ArrowUpRight aria-hidden /></a></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section id="nosotros" className={styles.aboutSection}>
        <div className={styles.aboutVisual}>
          <ProviderLogo provider={provider} />
          <strong>{provider.name}</strong>
          <span>Soluciones integrales de energía</span>
        </div>
        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>Quiénes somos</p>
          <h2>Energía solar y soluciones integrales</h2>
          <p>{provider.bio}</p>
          <div className={styles.coverage}><MapPin aria-hidden /><span><strong>Atención en</strong>{provider.zone}</span></div>
        </div>
      </section>

      <section id="preguntas" className={styles.faqSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Preguntas frecuentes</p>
          <h2>Lo que necesitas saber antes de cotizar</h2>
        </div>
        <div className={styles.faqs}>
          {faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}
        </div>
      </section>

      <section id="contacto" className={styles.contactSection}>
        <ProviderLogo provider={provider} />
        <div>
          <p className={styles.eyebrow}>Cotiza tu proyecto</p>
          <h2>Hablemos de lo que necesitas</h2>
          <p>Escríbenos por WhatsApp para revisar tu proyecto de paneles, calentador solar, aire acondicionado, domótica o electricidad.</p>
        </div>
        <WhatsAppButton
          phone={provider.phone}
          message={message}
          label="Escribir por WhatsApp"
          className={styles.contactWhatsApp}
          targetSlug={provider.slug}
          targetType="provider"
        />
        <ProposalShareAction />
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerProvider}><ProviderLogo provider={provider} compact /><span><strong>{provider.name}</strong><small>Paneles y calentadores solares en Tepic</small></span></div>
        <Link className={styles.tequitCredit} href="/" aria-label="Publicado con Tequit">
          <BrandLogo variant="symbol" />
          <span>Publicado con Tequit</span>
        </Link>
      </footer>

      <div className={styles.mobileDock}>
        <WhatsAppButton
          phone={provider.phone}
          message={message}
          label="Cotizar por WhatsApp"
          className={styles.dockWhatsApp}
          targetSlug={provider.slug}
          targetType="provider"
        />
        <ProposalShareAction compact />
      </div>
    </main>
  );
}
