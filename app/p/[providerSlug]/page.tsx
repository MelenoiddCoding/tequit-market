import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProviderSite } from "@/components/provider-site";
import { getProviderBySlug } from "@/lib/marketplace";
import { providerUrl } from "@/lib/provider-site";
import { getWebsiteAccess } from "@/lib/website-access";
import { getProviderPlan, planFromCode } from "@/lib/plans";
import { websiteTemplate, WEBSITE_OFFER } from "@/lib/website-offer";
import { socialImageMetadata, socialImageUrl, socialImageVersion, socialPreviewAlt } from "@/lib/social-preview";
type Props = {
  params: Promise<{ providerSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ providerSlug }, query] = await Promise.all([params, searchParams]);
  const provider = await getProviderBySlug(providerSlug);
  if (!provider)
    return {
      title: "Sitio no encontrado",
      robots: { index: false, follow: false },
    };
  const access = await getWebsiteAccess(provider.id);
  const canonical = providerUrl(provider.slug),
    title = `${provider.name} · ${provider.profession} en ${provider.zone}`,
    description = (provider.site.intro || provider.bio).slice(0, 158);
  const image = socialImageMetadata(
    socialImageUrl("site", provider.slug, socialImageVersion(provider.name, provider.profession, provider.primaryCategory?.name, provider.zone, provider.site.coverPath ?? provider.site.coverImage, provider.avatarPath ?? provider.avatarImage, provider.site.accentColor)),
    socialPreviewAlt(provider.name, provider.primaryCategory?.name ?? provider.profession),
  );
  return {
    title,
    description,
    alternates: {
      canonical: access.active ? canonical : canonical.replace("/p/", "/u/"),
    },
    robots: {
      index:
        access.active &&
        provider.seo.eligible &&
        !(provider.slug === "soluciones-haro" && query.vista === "panoramica"),
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: provider.name,
      locale: "es_MX",
      type: "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
export default async function Page({ params, searchParams }: Props) {
  const [{ providerSlug }, query] = await Promise.all([params, searchParams]);
  const provider = await getProviderBySlug(providerSlug);
  if (!provider) notFound();
  const [access, plan] = await Promise.all([
    getWebsiteAccess(provider.id),
    provider.isDemo
      ? Promise.resolve(planFromCode(provider.plan, null))
      : getProviderPlan(provider.id),
  ]);
  if (!access.active && !provider.isDemo) {
    const tags = new URLSearchParams();
    for (const key of ["utm_source", "utm_medium", "ref"])
      if (typeof query[key] === "string")
        tags.set(key, query[key].slice(0, 100));
    redirect(`/u/${provider.slug}${tags.size ? `?${tags}` : ""}`);
  }
  const canonical = providerUrl(provider.slug);
  const panoramicPreview =
    provider.slug === "soluciones-haro" && query.vista === "panoramica";
  const displayProvider = panoramicPreview
    ? {
        ...provider,
        site: {
          ...provider.site,
          coverImage: "/providers/soluciones-haro/portada-horizontal.jpg",
        },
      }
    : provider;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: provider.name,
    description: provider.site.intro || provider.bio,
    url: canonical,
    areaServed: [provider.zone, ...provider.areas],
    serviceType: (websiteTemplate(provider.site.templateId) ? provider.services.slice(0, WEBSITE_OFFER.services) : provider.services).map((s) => s.name),
    ...(provider.canContact ? { telephone: provider.phone } : {}),
    ...(provider.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: provider.rating,
            reviewCount: provider.reviewCount,
          },
        }
      : {}),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProviderSite
        provider={displayProvider}
        referrer={typeof query.ref === "string" ? query.ref : undefined}
        customBranding={access.active || plan.entitlements.customSiteBranding}
        coverPresentation={panoramicPreview ? "panoramic" : "standard"}
      />
    </>
  );
}
