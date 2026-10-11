import "server-only";

import { getMarketplace } from "@/lib/marketplace";
import { searchMarketplaceData } from "@/lib/search";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SearchResult } from "@/types";
import type { DiscoveryLocation } from "@/lib/location";

export async function searchMarketplace(
  query: string,
  type: "all" | "provider" | "business" = "all",
  verified = false,
  location: DiscoveryLocation | null = null,
): Promise<{ results: SearchResult[]; marketplace: Awaited<ReturnType<typeof getMarketplace>> }> {
  const marketplace = await getMarketplace();
  const fallback = searchMarketplaceData(marketplace.providers, marketplace.businesses, query, type, verified);
  const admin = createAdminClient();
  let results = location ? fallback.filter((result) => result.type === "business") : fallback.filter((result) => result.type === "business");

  if (admin && location && type !== "business") {
    const { data } = await admin.rpc("discover_provider_profiles", { p_query: query, p_lat: location.lat ?? null, p_lng: location.lng ?? null, p_area_slug: location.areaSlug ?? null, p_verified: verified, p_limit: 200 });
    if (data) {
      const matches = new Map((data as Array<{ provider_id: string; search_rank: number; match_type: "nearby"|"service_area"|"city"; distance_m: number|null }>).map((row) => [row.provider_id, row]));
      const providerResults = marketplace.providers
        .filter((provider) => matches.has(provider.id))
        .filter((provider) => !verified || provider.verifications.length > 0)
        .map((provider) => { const match=matches.get(provider.id)!; return { type: "provider" as const, provider, score: Number(match.search_rank), discoveryMatch: match.match_type }; });
      const businessResults = type === "provider" ? [] : fallback.filter((result) => result.type === "business");
      results = [...providerResults, ...businessResults].sort((a, b) => b.score - a.score || resultRating(b) - resultRating(a));
    }
  } else if (type === "provider") {
    results=[];
  }

  if (admin && query.trim()) {
    await admin.from("marketplace_search_queries").insert({ query_text: query.slice(0, 200), result_count: results.length, entity_type: type });
  }
  return { results, marketplace };
}

function resultRating(result: SearchResult) {
  return (result.provider ?? result.business)?.rating ?? 0;
}
