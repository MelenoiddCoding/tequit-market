import {
  AffiliationNotice,
  DetailSection,
  DirectedRequest,
  EntityHero,
  identityStyles,
  PortfolioGallery,
  ReviewList,
  ServiceList,
  VerificationPanel,
} from "@/components/identity-redesign";
import { SiteContainer } from "@/components/layout-primitives";
import { ViewTracker } from "@/components/view-tracker";
import { ProviderShareTools } from "@/components/provider-share-tools";
import type { Provider } from "@/types";

export function ProviderProfile({
  provider,
  siteActive = false,
  directedRequests = false,
}: {
  provider: Provider;
  siteActive?: boolean;
  directedRequests?: boolean;
}) {
  const hasReviews = provider.reviews.some((review) => review.status === "approved");
  const hasVerifications = provider.verifications.length > 0;
  const areas = [...new Set([...provider.areas, provider.zone])].filter((area) => area !== provider.zone.split(",")[0]);
  const hasPresentation = Boolean(provider.bio?.trim()) || areas.length > 0;
  return (
    <main className={identityStyles.detailPage}>
      <ViewTracker
        type="profile_view"
        target={provider.slug}
        disabled={provider.isDemo}
      />
      <EntityHero
        entity={provider}
        kind="provider"
        showRequest={directedRequests}
      />
      <SiteContainer className={`${identityStyles.detailGrid} ${!hasVerifications ? identityStyles.detailGridSingle : ""}`}>
        <div className={identityStyles.mainColumn}>
          {provider.businessSlug && provider.businessName && (
            <DetailSection
              title="Afiliación"
              eyebrow="Reputación independiente"
            >
              <AffiliationNotice
                businessSlug={provider.businessSlug}
                businessName={provider.businessName}
              />
            </DetailSection>
          )}

          <DetailSection title="Servicios" eyebrow="Lo que publica">
            <ServiceList services={provider.services} showDescriptions />
          </DetailSection>

          {provider.portfolio.length > 0 && <DetailSection
            title="Trabajos realizados"
            eyebrow="Evidencia del oficio"
          >
            <PortfolioGallery portfolio={provider.portfolio} />
          </DetailSection>}

          {hasPresentation && <DetailSection title="Sobre este prestador" eyebrow="Experiencia">
            {provider.bio?.trim() && <p className={identityStyles.bodyCopy}>{provider.bio}</p>}
            {areas.length > 0 && <div
              className={identityStyles.tagList}
              aria-label="Zonas y capacidades"
            >
              {areas.map((area) => (
                <span className={identityStyles.tag} key={area}>
                  {area}
                </span>
              ))}
            </div>}
          </DetailSection>}

          {hasReviews && <DetailSection title="Reseñas" eyebrow="Experiencias aprobadas">
            <ReviewList reviews={provider.reviews} />
          </DetailSection>}
        </div>
        {hasVerifications && <aside
          className={identityStyles.aside}
          aria-label={`Confianza y contacto de ${provider.name}`}
        >
          <VerificationPanel
            verifications={provider.verifications}
            phone={provider.phone}
            name={provider.name}
            slug={provider.slug}
            kind="provider"
            canContact={provider.canContact}
          />
        </aside>}
      </SiteContainer>
      <SiteContainer size="reading">
        {directedRequests && (
          <DetailSection id="solicitar" title="Solicitar trabajo">
            <DirectedRequest entity={provider} kind="provider" />
          </DetailSection>
        )}
        <DetailSection title="Compartir perfil">
          <ProviderShareTools
            slug={provider.slug}
            name={provider.name}
            subtitle={provider.profession}
            surface="profile"
            compact
            siteHref={siteActive ? `/p/${provider.slug}` : undefined}
          />
        </DetailSection>
      </SiteContainer>
    </main>
  );
}
