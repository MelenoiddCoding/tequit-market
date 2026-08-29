import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessTeam, DetailSection, DirectedRequest, EntityHero, identityStyles, ProductList, ReviewList, ServiceList, VerificationPanel } from "@/components/identity-redesign";
import { SiteContainer } from "@/components/layout-primitives";
import { ViewTracker } from "@/components/view-tracker";
import { getBusinessBySlug, getProviders } from "@/lib/marketplace";

export async function generateMetadata({ params }: { params: Promise<{ businessSlug: string }> }): Promise<Metadata> {
  const { businessSlug } = await params;
  const business = await getBusinessBySlug(businessSlug);
  return business ? { title: business.name, description: business.description } : { title: "Negocio no encontrado" };
}

export default async function BusinessPage({ params }: { params: Promise<{ businessSlug: string }> }) {
  const { businessSlug } = await params;
  const business = await getBusinessBySlug(businessSlug);
  if (!business) notFound();
  const team = (await getProviders()).filter((provider) => business.providerSlugs.includes(provider.slug));

  return <main className={identityStyles.detailPage}>
    <ViewTracker type="business_view" target={business.slug} />
    <EntityHero entity={business} kind="business" />
    <SiteContainer className={identityStyles.detailGrid}>
      <div className={identityStyles.mainColumn}>
        <DetailSection title="Sobre el negocio" eyebrow="Oficio local">
          <p className={identityStyles.bodyCopy}>{business.description}</p>
          <div className={identityStyles.tagList} aria-label="Zona y categoría">
            <span className={identityStyles.tag}>{business.category}</span>
            <span className={identityStyles.tag}>{business.zone}</span>
          </div>
        </DetailSection>

        <DetailSection title="Servicios" eyebrow="Lo que hacen">
          <ServiceList services={business.services} />
        </DetailSection>

        <DetailSection title="Productos" eyebrow="Cotización directa" description="Pregunta disponibilidad y detalles por WhatsApp. Tequit no procesa compras ni pagos.">
          <ProductList business={business} />
        </DetailSection>

        <DetailSection title="Equipo afiliado" eyebrow="Perfiles independientes" description="Cada persona conserva sus propias verificaciones y reseñas.">
          <BusinessTeam providers={team} />
        </DetailSection>

        <DetailSection title="Reseñas" eyebrow="Experiencias aprobadas">
          <ReviewList reviews={business.reviews} />
        </DetailSection>
      </div>
      <aside className={identityStyles.aside} aria-label={`Confianza y contacto de ${business.name}`}>
        <VerificationPanel verifications={business.verifications} phone={business.phone} name={business.name} slug={business.slug} kind="business" canContact={business.canContact} />
      </aside>
    </SiteContainer>
    <SiteContainer size="reading">
      <DetailSection id="solicitar" title="Solicitar trabajo">
        <DirectedRequest entity={business} kind="business" />
      </DetailSection>
    </SiteContainer>
  </main>;
}
