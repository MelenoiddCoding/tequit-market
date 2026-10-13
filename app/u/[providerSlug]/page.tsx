import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProviderProfile } from "@/components/profile-details";
import { getProviderBySlug } from "@/lib/marketplace";
import { providerUrl } from "@/lib/provider-site";
import { getProviderPlan, planFromCode } from "@/lib/plans";
import { getWebsiteAccess } from "@/lib/website-access";
import { socialImageMetadata, socialImageUrl, socialImageVersion, socialPreviewAlt } from "@/lib/social-preview";
type Props = { params: Promise<{ providerSlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const provider = await getProviderBySlug((await params).providerSlug);
  if (!provider)
    return { title: "Perfil no encontrado", robots: { index: false } };
  const canonical = providerUrl(provider.slug).replace("/p/", "/u/");
  const title = `${provider.name} · ${provider.profession}`;
  const description = provider.bio.slice(0, 158);
  const image = socialImageMetadata(
    socialImageUrl("profile", provider.slug, socialImageVersion(provider.name, provider.profession, provider.primaryCategory?.name, provider.zone, provider.site.coverPath ?? provider.site.coverImage, provider.avatarPath ?? provider.avatarImage, provider.site.accentColor)),
    socialPreviewAlt(provider.name, provider.primaryCategory?.name ?? provider.profession),
  );
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: provider.seo.eligible },
    openGraph: { title, description, url: canonical, siteName: "Tequit", locale: "es_MX", type: "profile", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
export default async function Page({ params }: Props) {
  const provider = await getProviderBySlug((await params).providerSlug);
  if (!provider) notFound();
  const [access, plan] = await Promise.all([
    getWebsiteAccess(provider.id),
    provider.isDemo
      ? Promise.resolve(planFromCode(provider.plan, null))
      : getProviderPlan(provider.id),
  ]);
  return (
    <ProviderProfile
      provider={provider}
      siteActive={access.active}
      directedRequests={plan.entitlements.directedRequestForm}
    />
  );
}
