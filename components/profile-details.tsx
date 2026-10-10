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
      <SiteContainer className={identityStyles.detailGrid}>
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
            <ServiceList services={provider.services} />
          </DetailSection>

          <DetailSection
            title="Trabajos realizados"
            eyebrow="Evidencia del oficio"
          >
            <PortfolioGallery portfolio={provider.portfolio} />
          </DetailSection>

          <DetailSection title="Sobre mí" eyebrow="Experiencia">
            <p className={identityStyles.bodyCopy}>{provider.bio}</p>
            <div
              className={identityStyles.tagList}
              aria-label="Zonas y capacidades"
            >
              {provider.areas.map((area) => (
                <span className={identityStyles.tag} key={area}>
                  {area}
                </span>
              ))}
              <span className={identityStyles.tag}>{provider.zone}</span>
            </div>
          </DetailSection>

          <DetailSection title="Reseñas" eyebrow="Experiencias aprobadas">
            <ReviewList reviews={provider.reviews} />
          </DetailSection>
        </div>
        <aside
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
        </aside>
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
          />
          {siteActive && (
            <a className="btn btn-secondary" href={"/p/" + provider.slug}>
              Visitar su sitio web
            </a>
          )}
        </DetailSection>
      </SiteContainer>
    </main>
  );
}
