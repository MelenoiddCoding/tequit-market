import type { MetadataRoute } from "next";
import { getMarketplace } from "@/lib/marketplace";
import { APP_URL } from "@/lib/provider-site";
import { getProviderTaxonomy } from "@/lib/taxonomy";
import { getWebsiteAccess } from "@/lib/website-access";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ providers, businesses, services }, categories] = await Promise.all([
    getMarketplace(),
    getProviderTaxonomy(),
  ]);
  const eligible = providers.filter((p) => p.seo.eligible && !p.isDemo);
  const access = await Promise.all(eligible.map((p) => getWebsiteAccess(p.id)));
  return [
    ...["", "/buscar", "/negocios", "/solicitar"].map((path) => ({
      url: `${APP_URL}${path}`,
      changeFrequency: "weekly" as const,
    })),
    ...eligible.flatMap((p, i) => [
      { url: `${APP_URL}/u/${p.slug}`, lastModified: new Date(p.updatedAt) },
      ...(access[i].active
        ? [
            {
              url: `${APP_URL}/p/${p.slug}`,
              lastModified: new Date(p.updatedAt),
            },
          ]
        : []),
    ]),
    ...businesses
      .filter((b) => !b.isDemo)
      .map((b) => ({ url: `${APP_URL}/n/${b.slug}` })),
    ...categories.map((c) => ({ url: `${APP_URL}/categorias/${c.slug}` })),
    ...services.map((s) => ({ url: `${APP_URL}/servicios/${s.slug}` })),
  ];
}
