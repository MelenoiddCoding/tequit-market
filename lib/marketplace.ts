import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Business,
  Provider,
  Review,
  Service,
  Verification,
} from "@/types";
import { providerSeoEligibility } from "@/lib/provider-site";

type CategoryRow = { name: string } | null;
type CanonicalRow = {
  id: string;
  slug: string;
  name: string;
  service_categories: CategoryRow;
  service_aliases?: Array<{ alias: string }>;
} | null;
type ServiceRow = {
  id: string;
  title: string;
  description: string;
  active: boolean;
  canonical_services: CanonicalRow;
};
type MediaRow = {
  id: string;
  title: string | null;
  description?: string | null;
  storage_path: string;
  archived_at?: string | null;
};
type VerificationRow = { type: Verification["type"]; verified_at: string };
type ReviewRow = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  status: Review["status"];
  review_requests: { source: Review["source"] } | null;
};
type AreaRow = { service_areas: { name: string } | null };
type ProviderAffiliationRow = {
  status: string;
  businesses: { slug: string; name: string } | null;
};
type ProviderSiteRow = {
  headline: string;
  intro: string;
  years_experience: number | null;
  cover_path: string | null;
  theme: Provider["site"]["theme"];
  accent_color: string;
  white_label: boolean;
  social_links: Provider["site"]["socialLinks"];
} | null;
type ProviderFaqRow = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
};
type PlanAssignmentRow = {
  id: string;
  plan_code: Provider["plan"];
  starts_at: string;
  ends_at: string | null;
  revoked_at: string | null;
};
type ProviderRow = {
  id: string;
  slug: string;
  name: string;
  profession: string;
  bio: string;
  phone: string;
  show_phone_call: boolean;
  zone: string;
  plan: Provider["plan"];
  status: Provider["status"];
  rating: number | string;
  review_count: number;
  avatar_path: string | null;
  is_demo: boolean;
  provider_services: ServiceRow[];
  provider_media: MediaRow[];
  updated_at: string;
  provider_verifications: VerificationRow[];
  reviews: ReviewRow[];
  provider_service_areas: AreaRow[];
  provider_business_affiliations: ProviderAffiliationRow[];
  provider_site_settings: ProviderSiteRow;
  provider_faqs: ProviderFaqRow[];
  provider_plan_assignments: PlanAssignmentRow[];
};
type ProductRow = {
  id: string;
  name: string;
  description: string;
  image_path: string | null;
  active: boolean;
};
type BusinessAffiliationRow = {
  status: string;
  provider_profiles: { slug: string } | null;
};
type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  phone: string;
  zone: string;
  address: string | null;
  status: Business["status"];
  rating: number | string;
  review_count: number;
  logo_path: string | null;
  cover_path: string | null;
  is_demo: boolean;
  service_categories: CategoryRow;
  business_services: ServiceRow[];
  business_products: ProductRow[];
  business_media: MediaRow[];
  business_verifications: VerificationRow[];
  reviews: ReviewRow[];
  provider_business_affiliations: BusinessAffiliationRow[];
};

function storageUrl(bucket: string, path: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base && path
    ? `${base}/storage/v1/object/public/${bucket}/${path}`
    : "/images/tequit-hero.png";
}
function optionalStorageUrl(bucket: string, path: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base && path
    ? `${base}/storage/v1/object/public/${bucket}/${path}`
    : undefined;
}
function mapService(row: ServiceRow): Service {
  const canonical = row.canonical_services;
  return {
    id: row.id,
    slug: canonical?.slug ?? `../buscar?q=${encodeURIComponent(row.title)}`,
    name: row.title,
    description: row.description,
    category: canonical?.service_categories?.name ?? "Otro",
    aliases: canonical?.service_aliases?.map((item) => item.alias) ?? [],
  };
}
function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    author: row.customer_name,
    rating: row.rating,
    comment: row.comment,
    date: row.created_at.slice(0, 10),
    status: row.status,
    source: row.review_requests?.source ?? "invited_customer",
  };
}
function mapProvider(row: ProviderRow): Provider {
  const affiliation = row.provider_business_affiliations.find(
    (item) => item.status === "active",
  )?.businesses;
  const settings = row.provider_site_settings;
  const now = Date.now();
  const assignment = row.provider_plan_assignments
    .filter(
      (item) =>
        !item.revoked_at &&
        Date.parse(item.starts_at) <= now &&
        (!item.ends_at || Date.parse(item.ends_at) > now),
    )
    .sort((a, b) => Date.parse(b.starts_at) - Date.parse(a.starts_at))[0];
  const effectivePlan = assignment?.plan_code ?? "free";
  const provider = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    profession: row.profession,
    bio: row.bio,
    zone: row.zone,
    areas: row.provider_service_areas.flatMap((item) =>
      item.service_areas?.name ? [item.service_areas.name] : [],
    ),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    plan: effectivePlan,
    status: row.status,
    phone: row.phone,
    showPhoneCall: row.show_phone_call,
    services: row.provider_services
      .filter((item) => item.active)
      .map(mapService),
    verifications: row.provider_verifications.map((item) => ({
      type: item.type,
      date: item.verified_at.slice(0, 10),
    })),
    reviews: row.reviews
      .filter((item) => item.status === "approved")
      .map(mapReview),
    portfolio: row.provider_media
      .filter((item) => !item.archived_at)
      .map((item) => ({
        id: item.id,
        title: item.title ?? "Trabajo realizado",
        description: item.description ?? "",
        image: storageUrl("provider-work", item.storage_path),
        path: item.storage_path,
      })),
    businessSlug: affiliation?.slug,
    businessName: affiliation?.name,
    isDemo: row.is_demo,
    canContact: !row.is_demo,
    avatarImage: optionalStorageUrl("avatars", row.avatar_path),
    avatarPath: row.avatar_path ?? undefined,
    updatedAt: row.updated_at ?? new Date(0).toISOString(),
    site: {
      headline: settings?.headline || `${row.profession} en ${row.zone}`,
      intro: settings?.intro || row.bio,
      yearsExperience: settings?.years_experience ?? undefined,
      coverImage: optionalStorageUrl("provider-work", settings?.cover_path),
      coverPath: settings?.cover_path ?? undefined,
      theme: settings?.theme ?? "tequit",
      accentColor: settings?.accent_color ?? "#254432",
      whiteLabel: Boolean(settings?.white_label),
      socialLinks: settings?.social_links ?? {},
    },
    faqs: row.provider_faqs
      .filter((item) => item.active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        sortOrder: item.sort_order,
        active: item.active,
      })),
  } satisfies Omit<Provider, "seo">;
  return { ...provider, seo: providerSeoEligibility(provider) };
}
function mapBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    phone: row.phone,
    zone: row.zone,
    address: row.address ?? row.zone,
    category: row.service_categories?.name ?? "Negocio local",
    rating: Number(row.rating),
    reviewCount: row.review_count,
    status: row.status,
    services: row.business_services
      .filter((item) => item.active)
      .map(mapService),
    products: row.business_products
      .filter((item) => item.active)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
      })),
    verifications: row.business_verifications.map((item) => ({
      type: item.type,
      date: item.verified_at.slice(0, 10),
    })),
    reviews: row.reviews
      .filter((item) => item.status === "approved")
      .map(mapReview),
    providerSlugs: row.provider_business_affiliations.flatMap((item) =>
      item.status === "active" && item.provider_profiles?.slug
        ? [item.provider_profiles.slug]
        : [],
    ),
    isDemo: row.is_demo,
    canContact: !row.is_demo,
    portfolio: row.business_media.map((item) => ({
      id: item.id,
      title: item.title ?? "Trabajo publicado",
      description: "",
      image: storageUrl("business-media", item.storage_path),
      path: item.storage_path,
    })),
  };
}

const providerSelect = `id,slug,name,profession,bio,phone,show_phone_call,zone,plan,status,rating,review_count,avatar_path,is_demo,updated_at,provider_services(id,title,description,active,canonical_services(id,slug,name,service_categories(name),service_aliases(alias))),provider_media(id,title,description,storage_path,archived_at),provider_verifications(type,verified_at),reviews(id,customer_name,rating,comment,created_at,status,review_requests(source)),provider_service_areas(service_areas(name)),provider_business_affiliations(status,businesses(slug,name)),provider_site_settings(headline,intro,years_experience,cover_path,theme,accent_color,white_label,social_links),provider_faqs(id,question,answer,sort_order,active),provider_plan_assignments!provider_plan_assignments_provider_id_fkey(id,plan_code,starts_at,ends_at,revoked_at)`;
const businessSelect = `id,slug,name,description,phone,zone,address,status,rating,review_count,logo_path,cover_path,is_demo,service_categories(name),business_services(id,title,active,canonical_services(id,slug,name,service_categories(name),service_aliases(alias))),business_products(id,name,description,image_path,active),business_media(id,title,storage_path),business_verifications(type,verified_at),reviews(id,customer_name,rating,comment,created_at,status,review_requests(source)),provider_business_affiliations(status,provider_profiles(slug))`;

export async function getProviders(
  options: { includeInactive?: boolean } = {},
): Promise<Provider[]> {
  const client = createAdminClient();
  if (!client) return [];
  let query = client
    .from("provider_profiles")
    .select(providerSelect)
    .order("rating", { ascending: false });
  if (!options.includeInactive) query = query.eq("status", "active");
  const { data, error } = await query;
  if (error) {
    console.error("provider query", error.message);
    return [];
  }
  return (data as unknown as ProviderRow[]).map(mapProvider);
}
export async function getBusinesses(
  options: { includeInactive?: boolean } = {},
): Promise<Business[]> {
  const client = createAdminClient();
  if (!client) return [];
  let query = client
    .from("businesses")
    .select(businessSelect)
    .order("rating", { ascending: false });
  if (!options.includeInactive) query = query.eq("status", "active");
  const { data, error } = await query;
  if (error) {
    console.error("business query", error.message);
    return [];
  }
  return (data as unknown as BusinessRow[]).map(mapBusiness);
}
export async function getProviderBySlug(slug: string) {
  return (await getProviders()).find((item) => item.slug === slug);
}
export async function getBusinessBySlug(slug: string) {
  return (await getBusinesses()).find((item) => item.slug === slug);
}
export async function getServices(): Promise<Service[]> {
  const client = createAdminClient();
  if (!client) return [];
  const { data, error } = await client
    .from("canonical_services")
    .select("id,slug,name,service_categories(name),service_aliases(alias)")
    .eq("active", true)
    .order("name");
  if (error) {
    console.error("services query", error.message);
    return [];
  }
  return (
    data as unknown as Array<{
      id: string;
      slug: string;
      name: string;
      service_categories: CategoryRow;
      service_aliases: Array<{ alias: string }>;
    }>
  ).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.service_categories?.name ?? "Otro",
    aliases: row.service_aliases.map((item) => item.alias),
  }));
}
export async function getMarketplace() {
  const [providers, businesses, services] = await Promise.all([
    getProviders(),
    getBusinesses(),
    getServices(),
  ]);
  return { providers, businesses, services };
}
