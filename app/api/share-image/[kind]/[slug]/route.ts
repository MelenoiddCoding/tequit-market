import { getBusinessBySlug, getProviderBySlug } from "@/lib/marketplace";
import { renderSocialPreview, type SocialImageKind } from "@/lib/social-preview";
import { websiteDemoProvider } from "@/lib/website-demo-provider";
import { WEBSITE_TEMPLATES } from "@/lib/website-offer";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params;
  if (!/^[a-z0-9-]{1,90}$/.test(slug)) return new Response("No encontrado", { status: 404 });

  if (kind === "demo") {
    const template = WEBSITE_TEMPLATES.find((item) => item.id === slug);
    if (!template) return new Response("No encontrado", { status: 404 });
    const sparse = new URL(request.url).searchParams.get("contenido") === "breve";
    const provider = websiteDemoProvider(template.id, template.accent, sparse);
    return renderSocialPreview({
      kind: "demo", name: provider.name, category: provider.profession,
      cover: provider.site.coverImage, logo: provider.avatarImage,
      accent: template.accent, label: `EJEMPLO · ${template.name.toUpperCase()}`,
    });
  }

  if (kind === "business") {
    const business = await getBusinessBySlug(slug);
    if (!business) return new Response("No encontrado", { status: 404 });
    return renderSocialPreview({
      kind: "business", name: business.name, category: business.category, zone: business.zone,
      cover: business.coverImage, logo: business.logoImage,
    });
  }

  if (!["site", "profile", "proposal"].includes(kind)) return new Response("No encontrado", { status: 404 });
  const provider = await getProviderBySlug(slug);
  if (!provider) return new Response("No encontrado", { status: 404 });
  const proposal = kind === "proposal" && slug === "soluciones-haro";
  if (kind === "proposal" && !proposal) return new Response("No encontrado", { status: 404 });
  return renderSocialPreview({
    kind: kind as SocialImageKind,
    name: provider.name, category: provider.primaryCategory?.name ?? provider.profession,
    zone: provider.zone,
    cover: proposal ? "/providers/soluciones-haro/portada-horizontal.jpg" : provider.site.coverImage,
    logo: provider.avatarImage,
    accent: provider.site.accentColor,
  });
}
