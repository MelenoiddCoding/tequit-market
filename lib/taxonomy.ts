import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { MarketplaceCategory } from "@/types";

type CanonicalRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  requires_review: boolean;
  active: boolean;
  canonical_provider_category_aliases?: Array<{ alias: string }>;
};

type MarketplaceRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  canonical_provider_categories: CanonicalRow[];
};

export async function getProviderTaxonomy(options: { includeInactive?: boolean } = {}): Promise<MarketplaceCategory[]> {
  const admin = createAdminClient();
  if (!admin) return [];
  let query = admin
    .from("marketplace_categories")
    .select("id,name,slug,description,active,canonical_provider_categories(id,name,slug,description,requires_review,active,sort_order,canonical_provider_category_aliases(alias))")
    .order("sort_order")
    .order("sort_order", { referencedTable: "canonical_provider_categories" });
  if (!options.includeInactive) query = query.eq("active", true).eq("canonical_provider_categories.active", true);
  const { data, error } = await query;
  if (error) {
    console.error("provider taxonomy query", error.message);
    return [];
  }
  return (data as unknown as MarketplaceRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    active: row.active,
    canonicalCategories: (row.canonical_provider_categories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      requiresReview: category.requires_review,
      active: category.active,
      aliases: category.canonical_provider_category_aliases?.map((item) => item.alias) ?? [],
    })),
  }));
}
