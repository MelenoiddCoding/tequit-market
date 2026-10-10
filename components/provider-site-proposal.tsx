import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  Bolt,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Flame,
  Home,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Sun,
  Wrench,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ProposalShareAction } from "@/components/provider-site-proposal-actions";
import type { Provider, Service } from "@/types";
import styles from "@/components/provider-site-proposal.module.css";

const serviceIcons = [Bolt, Sun, Flame, Sparkles, Wrench];

function ProposalMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? styles.markCompact : styles.mark} aria-hidden>
      <svg viewBox="0 0 64 64" role="img">
        <path d="M12 34 32 14l20 20" />
        <path d="M20 29v23h24V29" />
        <path d="m36 24-10 15h8l-5 12 12-17h-8l3-10Z" />
        <circle cx="49" cy="15" r="6" />
      </svg>
    </span>
  );
}

function ServiceItem({ service, index }: { service: Service; index: number }) {
  const Icon = serviceIcons[index % serviceIcons.length];
  return (
    <article className={styles.serviceItem}>
      <span className={styles.serviceNumber}>0{index + 1}</span>
      <span className={styles.serviceIcon}><Icon aria-hidden /></span>
      <div>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <a href="#contacto">Cotizar este servicio <ArrowDown aria-hidden /></a>
      </div>
    </article>
  );
}

const proposalFaqs = [
  {
    question: "¿Qué necesito para cotizar paneles solares?",
    answer: "Ten a la mano tu recibo de CFE y cuéntanos si el proyecto es para casa o negocio. Con eso se puede preparar una propuesta según tu consumo.",
  },
  {
    question: "¿También instalan calentadores solares?",
    answer: "Sí. Soluciones Haro contempla suministro e instalación de calentadores solares para hogares y negocios.",
  },
  {
    question: "¿Qué garantía y marcas manejan?",
    answer: "Las marcas, garantías y condiciones se confirman en cada cotización. Pregunta por ellas antes de aprobar la instalación.",
  },
  {
    question: "¿Atienden fuera de Tepic?",
    answer: "La cobertura publicada es Tepic, Nayarit. Para otra localidad, confirma disponibilidad directamente al solicitar tu cotización.",
  },
];

export function ProviderSiteProposal({ provider }: { provider: Provider }) {
  const services = provider.services.slice(0, 5);
  const works = provider.portfolio.slice(0, 5);
  const projectCount = works.length;

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <a className={styles.headerBrand} href="#inicio" aria-label="Soluciones Haro — inicio">
          <ProposalMark compact />
          <span><strong>Soluciones Haro</strong><small>Propuesta profesional</small></span>
        </a>
        <nav className={styles.desktopNav} aria-label="Secciones del sitio">
          <a href="#servicios">Servicios</a>
          <a href="#trabajos">Trabajos</a>
          <a href="#proceso">Proceso</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <Link className={styles.tequitLink} href="/">
          <BrandLogo variant="symbol" />
          <span>Explorar Tequit</span>
          <ArrowUpRight aria-hidden />
        </Link>
      </header>

      <section id="inicio" className={styles.hero}>
        {provider.site.coverImage && (
          <Image
            className={styles.heroImage}
            src={provider.site.coverImage}
            alt="Instalación de paneles solares realizada por Soluciones Haro"
            fill
            priority
            sizes="100vw"
          />
        )}
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <div className={styles.proposalLabel}>Propuesta de diseño · datos de muestra</div>
          <div className={styles.heroIdentity}>
            <ProposalMark />
            <p>Soluciones Haro</p>
          </div>
          <h1>Paneles y calentadores solares en Tepic</h1>
          <p className={styles.heroCopy}>Soluciones de energía y electricidad para casas y negocios, dimensionadas para las necesidades de cada proyecto.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#contacto"><MessageCircle aria-hidden /> Cotizar mi proyecto</a>
            <a className={styles.secondaryAction} href="#trabajos"><Camera aria-hidden /> Ver trabajos</a>
          </div>
          <div className={styles.tequitTrust}><BrandLogo variant="symbol" /><span>Sitio profesional creado con Tequit</span></div>
        </div>
      </section>

      <section className={styles.trust} aria-label="Información principal">
        <div><MapPin aria-hidden /><span><strong>Tepic, Nayarit</strong><small>Zona publicada</small></span></div>
        <div><BadgeCheck aria-hidden /><span><strong>{services.length} servicios</strong><small>Con descripción</small></span></div>
        <div><Camera aria-hidden /><span><strong>{projectCount} proyectos</strong><small>Trabajo documentado</small></span></div>
        <div><MessageCircle aria-hidden /><span><strong>Cotización directa</strong><small>Por WhatsApp</small></span></div>
      </section>

      <section id="servicios" className={styles.servicesSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Servicios</p>
          <h2>Una solución clara para cada proyecto</h2>
          <p>Selecciona lo que necesitas y llega al contacto con el contexto correcto.</p>
        </div>
        <div className={styles.serviceList}>
          {services.map((service, index) => <ServiceItem key={service.id} service={service} index={index} />)}
        </div>
      </section>

      {works.length > 0 && (
        <section id="trabajos" className={styles.workSection}>
          <div className={styles.sectionIntroLight}>
            <p className={styles.eyebrow}>Trabajo real</p>
            <h2>Proyectos que hablan por el equipo</h2>
            <p>Fotografías y contexto para evaluar el tipo de instalaciones que realizan.</p>
          </div>
          <div className={styles.workGrid}>
            {works.map((work, index) => (
              <figure key={work.id} className={index === 0 ? styles.featuredWork : styles.workItem}>
                <div className={styles.workImage}>
                  <Image src={work.image} alt={work.title} fill sizes={index === 0 ? "(max-width: 760px) 100vw, 66vw" : "(max-width: 760px) 50vw, 33vw"} />
                </div>
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{work.title}</h3>{work.description && <p>{work.description}</p>}<a href="#contacto">Quiero algo similar <ArrowUpRight aria-hidden /></a></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section id="proceso" className={styles.processSection}>
        <div className={styles.processIntro}>
          <p className={styles.eyebrow}>Cómo empezar</p>
          <h2>De tu recibo de CFE a una propuesta clara</h2>
          <p>El sitio prepara mejor la conversación para evitar mensajes sin contexto y cotizaciones incompletas.</p>
        </div>
        <ol className={styles.steps}>
          <li><span>01</span><FileText aria-hidden /><div><h3>Comparte tu consumo</h3><p>Ten a la mano tu recibo de CFE y explica si es casa o negocio.</p></div></li>
          <li><span>02</span><Home aria-hidden /><div><h3>Describe el espacio</h3><p>Indica ubicación, tipo de techo y qué solución necesitas.</p></div></li>
          <li><span>03</span><ClipboardCheck aria-hidden /><div><h3>Recibe una propuesta</h3><p>El proyecto se cotiza de acuerdo con consumo, espacio y alcance.</p></div></li>
          <li><span>04</span><CheckCircle2 aria-hidden /><div><h3>Confirma condiciones</h3><p>Revisa equipos, garantía, tiempos y alcance antes de autorizar.</p></div></li>
        </ol>
      </section>

      <section className={styles.aboutSection}>
        <div className={styles.aboutVisual}>
          <div className={styles.proposalIdentityPanel}>
            <ProposalMark />
            <span>Soluciones</span>
            <strong>Haro</strong>
            <small>Energía solar y soluciones integrales</small>
          </div>
        </div>
        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>Experiencia local</p>
          <h2>Energía solar y soluciones integrales</h2>
          <p>{provider.site.intro || provider.bio}</p>
          <div className={styles.coverage}><MapPin aria-hidden /><span><strong>Cobertura publicada</strong>Tepic, Nayarit</span></div>
          <div className={styles.disclosure}><ShieldCheck aria-hidden /><p>La información y fotografías son proporcionadas por el prestador. Tequit facilita el contacto y no participa en pagos o acuerdos.</p></div>
        </div>
      </section>

      <section id="preguntas" className={styles.faqSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Antes de contactar</p>
          <h2>Respuestas para tomar el siguiente paso</h2>
        </div>
        <div className={styles.faqs}>
          {proposalFaqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}
        </div>
      </section>

      <section id="contacto" className={styles.contactSection}>
        <div>
          <p className={styles.eyebrow}>Contacto directo</p>
          <h2>Cuéntanos qué quieres instalar</h2>
          <p>El mensaje puede llegar preparado con el servicio elegido para que la conversación empiece con contexto.</p>
        </div>
        <div className={styles.messagePreview}>
          <span>Mensaje sugerido</span>
          <p>Hola Soluciones Haro, los encontré en Tequit. Busco instalar paneles y un calentador solar en mi casa. Tengo disponible mi recibo de CFE y quisiera solicitar una cotización.</p>
        </div>
        <button className={styles.disabledWhatsApp} type="button" disabled title="Contacto desactivado en esta propuesta">
          <MessageCircle aria-hidden /> WhatsApp desactivado en esta propuesta
        </button>
        <ProposalShareAction />
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerProvider}><ProposalMark compact /><span><strong>Soluciones Haro</strong><small>Paneles y calentadores solares en Tepic</small></span></div>
        <div className={styles.footerTequit}><BrandLogo variant="app-dark" /><p>Propuesta demostrativa creada con Tequit. El perfil original permanece sin cambios.</p></div>
        <nav aria-label="Continuar en Tequit"><Link href="/buscar">Buscar servicios</Link><Link href="/negocios">Ver negocios</Link><Link href="/solicitar">Publicar una necesidad</Link></nav>
      </footer>

      <div className={styles.mobileDock}>
        <a href="#contacto"><MessageCircle aria-hidden /> Ver contacto</a>
        <ProposalShareAction compact />
      </div>
    </main>
  );
}
