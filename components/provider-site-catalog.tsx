/* eslint-disable @next/next/no-img-element -- Provider media keeps the admin-selected crop. */
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ReviewList } from "@/components/identity-redesign";
import { PhoneCallButton } from "@/components/phone-call-button";
import { ProviderSocialLinks } from "@/components/provider-social-links";
import { ViewTracker } from "@/components/view-tracker";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { WorkGallery } from "@/components/work-gallery";
import { providerMessage } from "@/lib/whatsapp";
import { WEBSITE_TEMPLATES } from "@/lib/website-offer";
import { suggestedWebsiteServiceIcon } from "@/lib/website-service-icons";
import type { Provider } from "@/types";
import "@/components/provider-site-catalog.css";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden>{name}</span>;
}

function phoneLabel(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 12 && digits.startsWith("52") ? digits.slice(2) : digits;
  return national.length === 10 ? `${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}` : phone;
}

export function ProviderSiteCatalog({ provider, preview = false, referrer, coverPresentation = "standard" }: {
  provider: Provider;
  preview?: boolean;
  referrer?: string;
  coverPresentation?: "standard" | "panoramic";
}) {
  const template = WEBSITE_TEMPLATES.find(item => item.id === provider.site.templateId) ?? WEBSITE_TEMPLATES[0];
  const details = provider.site.details ?? {};
  const enabled = !preview && !provider.isDemo && !!provider.canContact;
  const Wrapper = preview ? "div" : "main";
  const areas = [...new Set([provider.zone, ...provider.areas].filter(Boolean))];
  const works = provider.portfolio.slice(0, 5);
  const message = providerMessage(provider.name, provider.profession);
  const quickActionCount = 1 + Number(provider.showPhoneCall) + Number(!!details.address);

  return <Wrapper className={`provider-sheet design-${template.design} cover-presentation-${coverPresentation} ${provider.site.coverImage ? "" : "sheet-no-cover"}`}>
    <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${template.fonts}&family=Material+Symbols+Outlined:wght@400&display=swap`} precedence="provider-font" />
    <ViewTracker type="website_view" target={provider.slug} referrer={referrer} disabled={preview || provider.isDemo} />
    <div className="sheet-content"><div className="flex flex-col w-full">
      <section className="demo-hero w-full">
        <div className="sheet-cover w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-surface-container" hidden={!provider.site.coverImage}>
          {provider.site.coverImage && <img src={provider.site.coverImage} alt={`Portada de ${provider.name}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
        </div>
        <div className="px-margin-mobile pt-space-md pb-space-lg flex flex-col gap-space-md max-w-4xl mx-auto w-full">
          <div className={`sheet-identity flex items-center gap-space-md mb-1 z-10 ${provider.site.coverImage ? "-mt-12 sm:-mt-14" : ""}`}>
            <div className="sheet-avatar w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-surface bg-surface-container-lowest overflow-hidden shadow-md flex-shrink-0">
              {provider.avatarImage ? <img src={provider.avatarImage} alt={provider.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span aria-hidden>{provider.name.trim().charAt(0)}</span>}
            </div>
            <div className="flex flex-col pt-6 justify-center">
              {details.contactName && <span className="font-headline-sm text-headline-sm sm:text-headline-md font-bold text-primary tracking-tight leading-snug">{details.contactName}</span>}
              <span className="font-label-sm text-label-sm text-secondary font-semibold mt-0.5">{details.contactRole || provider.profession}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">{provider.name}</h1>
            <h2 className="font-headline-sm text-headline-sm text-secondary font-semibold">{provider.site.headline || provider.profession}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mt-1">{provider.site.intro || provider.bio}</p>
          </div>
          <div className="sheet-notice rounded-xl p-space-md bg-[#ebf5fb] border border-[#bdd7f5] text-[#0f2942] flex items-start gap-space-sm shadow-sm" hidden={!details.notice}>
            <MaterialIcon name="info" className="text-[#1e4b85] text-headline-sm flex-shrink-0 mt-0.5" />
            <p className="font-body-sm text-body-sm text-[#0f2942] font-medium leading-snug">{details.notice}</p>
          </div>
          <div className="pt-space-xs w-full"><WhatsAppButton phone={provider.phone} message={message} label="Escribir por WhatsApp" disabled={!enabled} disabledLabel="Escribir por WhatsApp" className="sheet-whatsapp" targetSlug={provider.slug} targetType="provider" /></div>
        </div>
      </section>

      {provider.services.length > 0 && <section className="demo-services px-margin-mobile py-space-lg bg-surface-container-low max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-1 mb-space-md"><h2 className="font-headline-md text-headline-md text-primary tracking-tight">Servicios</h2>{details.servicesIntro && <p className="font-body-sm text-body-sm text-on-surface-variant">{details.servicesIntro}</p>}</div>
        <div className="flex flex-col gap-space-sm">{provider.services.slice(0, 5).map(service => <div key={service.id} className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-start gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0"><MaterialIcon name={details.serviceIcons?.[service.id] ?? suggestedWebsiteServiceIcon(service.name)} className="text-headline-sm" /></div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1"><div className="flex items-center justify-between"><h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{service.name}</h3></div><p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{service.description}</p></div>
        </div>)}</div>
      </section>}

      {works.length > 0 && <section className="demo-gallery px-margin-mobile py-space-lg flex flex-col gap-space-md max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-0.5"><h2 className="font-headline-md text-headline-md text-primary tracking-tight">Trabajos Realizados</h2>{details.workIntro && <p className="font-body-sm text-body-sm text-on-surface-variant">{details.workIntro}</p>}</div>
        <WorkGallery works={works} className="grid grid-cols-2 gap-space-sm sm:gap-space-md">{works.map((work, index) => <div key={work.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden"><button type="button" data-work-index={index} aria-label={`Ampliar foto: ${work.title}`} aria-haspopup="dialog" className="work-photo-trigger"><img src={work.image} alt={work.title} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" /></button></div>
          <div className="p-space-sm flex flex-col flex-1 justify-between bg-surface-container-lowest"><p className="font-label-md text-label-md text-on-surface font-semibold line-clamp-2">{work.title}</p></div>
        </div>)}</WorkGallery>
      </section>}

      {(provider.reviews.length > 0 || provider.faqs.length > 0) && <section className="sheet-additional">
        {provider.reviews.length > 0 && <><h2>Reseñas</h2><ReviewList reviews={provider.reviews} /></>}
        {provider.faqs.length > 0 && <><h2>Preguntas frecuentes</h2>{provider.faqs.slice(0, 3).map(faq => <details key={faq.id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</>}
      </section>}

      <section id="contacto" className="demo-contact px-margin-mobile py-space-md max-w-4xl mx-auto w-full">
        <div className="rounded-xl p-space-lg bg-primary text-on-primary flex flex-col gap-space-md shadow-sm">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider font-bold">Contacto directo</span>
            <h2 className="font-headline-md text-headline-md text-on-primary font-bold leading-tight">{details.contactTitle || "¿En qué podemos ayudarte?"}</h2>
            <p className="font-body-md text-body-md text-on-primary-container">{details.contactIntro || "Cuéntanos qué necesitas y dónde sería el trabajo."}</p>
          </div>
          <div className="sheet-contact-actions flex flex-col sm:flex-row gap-space-sm pt-space-xs">
            <WhatsAppButton phone={provider.phone} message={message} label="Escribir por WhatsApp" disabled={!enabled} disabledLabel="Escribir por WhatsApp" className="sheet-whatsapp" targetSlug={provider.slug} targetType="provider" />
            {provider.showPhoneCall && (enabled ? <PhoneCallButton phone={provider.phone} slug={provider.slug} label="Llamar por teléfono" materialIcon className="sheet-call" /> : <button className="sheet-call" type="button" disabled><MaterialIcon name="call" />Llamar por teléfono</button>)}
          </div>
        </div>
      </section>

      <footer className="demo-footer px-margin-mobile pt-space-lg pb-space-lg mt-space-md bg-surface-container-high text-on-surface max-w-4xl mx-auto w-full rounded-xl">
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between gap-space-sm"><div className="flex items-center gap-space-sm">
            <div className="sheet-footer-avatar w-12 h-12 rounded-full overflow-hidden border-2 border-outline-variant bg-surface-container-lowest flex-shrink-0">
              {provider.avatarImage ? <img src={provider.avatarImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span aria-hidden>{provider.name.trim().charAt(0)}</span>}
            </div>
            <div className="flex flex-col"><span className="font-headline-sm text-headline-sm text-primary font-bold">{provider.name}</span><span className="font-body-sm text-body-sm text-secondary font-semibold">{details.contactName ? `${details.contactName} · ` : ""}{details.contactRole || provider.profession}</span></div>
          </div>{provider.verifications.length > 0 && <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0" title="Verificaciones publicadas"><MaterialIcon name="verified" className="text-[18px]" /></div>}</div>

          <div className="sheet-facts flex flex-col gap-space-sm font-body-sm text-body-sm">
            {details.address && <div className="flex items-center gap-space-sm text-on-surface-variant"><MaterialIcon name="location_on" className="text-secondary text-[20px] flex-shrink-0" /><span>{details.address}</span></div>}
            {provider.phone && <div className="flex items-center gap-space-sm text-on-surface-variant"><MaterialIcon name="phone_iphone" className="text-secondary text-[20px] flex-shrink-0" /><span>Teléfono / WhatsApp: <strong className="text-on-surface">{phoneLabel(provider.phone)}</strong></span></div>}
            {details.hours && <div className="flex items-center gap-space-sm text-on-surface-variant"><MaterialIcon name="schedule" className="text-secondary text-[20px] flex-shrink-0" /><span>{details.hours}</span></div>}
            <ProviderSocialLinks provider={provider} preview={preview} />
          </div>
          {areas.length > 0 && <div className="sheet-areas"><h2>Zonas de atención</h2><p>{areas.join(" · ")}</p></div>}
          <div className="sheet-quick-actions grid gap-space-xs pt-space-xs" style={{ gridTemplateColumns: `repeat(${quickActionCount}, minmax(0, 1fr))` }}>
            <WhatsAppButton phone={provider.phone} message={message} label="WhatsApp" disabled={!enabled} disabledLabel="WhatsApp" className="sheet-quick sheet-quick-whatsapp" targetSlug={provider.slug} targetType="provider" />
            {provider.showPhoneCall && (enabled ? <PhoneCallButton phone={provider.phone} slug={provider.slug} materialIcon className="sheet-quick" /> : <button className="sheet-quick" type="button" disabled><MaterialIcon name="call" />Llamar</button>)}
            {details.address && (enabled ? <a className="sheet-quick" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.address)}`} target="_blank" rel="noopener noreferrer"><MaterialIcon name="location_on" />Ubicación</a> : <button className="sheet-quick" type="button" disabled><MaterialIcon name="location_on" />Ubicación</button>)}
          </div>
          <div className="sheet-copyright pt-space-xs border-none flex flex-col items-center text-center"><span className="font-label-sm text-label-sm text-on-surface-variant">© {new Date().getFullYear()} {provider.name}.</span></div>
          <div className="sheet-brand">{preview ? <span>Demo · {template.name}</span> : <><BrandLogo variant={template.id === "digital" ? "app-dark" : "symbol"} /><Link href={`/u/${provider.slug}`}>Ver perfil en Tequit</Link><Link href="/buscar">Buscar servicios</Link></>}</div>
        </div>
      </footer>
    </div></div>
  </Wrapper>;
}
