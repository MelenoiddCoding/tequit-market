import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProviderProfile } from "@/components/profile-details";
import { getProviderBySlug } from "@/lib/marketplace";
import { providerUrl } from "@/lib/provider-site";
import { getProviderPlan, planFromCode } from "@/lib/plans";
import { getWebsiteAccess } from "@/lib/website-access";
type Props = { params: Promise<{ providerSlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const provider = await getProviderBySlug((await params).providerSlug);
  if (!provider)
    return { title: "Perfil no encontrado", robots: { index: false } };
  return {
    title: `${provider.name} · ${provider.profession}`,
    description: provider.bio.slice(0, 158),
    alternates: { canonical: providerUrl(provider.slug).replace("/p/", "/u/") },
    robots: { index: provider.seo.eligible },
    openGraph: { images: [`${providerUrl(provider.slug)}/opengraph-image`] },
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
