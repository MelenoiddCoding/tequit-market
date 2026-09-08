import "server-only";

import { getMarketplace } from "@/lib/marketplace";
import { searchMarketplaceData } from "@/lib/search";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SearchResult } from "@/types";

export async function searchMarketplace(
  query: string,
  type: "all" | "provider" | "business" = "all",
  verified = false,
): Promise<{ results: SearchResult[]; marketplace: Awaited<ReturnType<typeof getMarketplace>> }> {
  const marketplace = await getMarketplace();
  const fallback = searchMarketplaceData(marketplace.providers, marketplace.businesses, query, type, verified);
  const admin = createAdminClient();
  let results = fallback;

  if (admin && query.trim() && type !== "business") {
    const { data } = await admin.rpc("search_provider_profiles", { p_query: query, p_limit: 200 });
    if (data) {
      const ranks = new Map((data as Array<{ provider_id: string; rank: number }>).map((row) => [row.provider_id, Number(row.rank)]));
      const providerResults = marketplace.providers
        .filter((provider) => ranks.has(provider.id))
        .filter((provider) => !verified || provider.verifications.length > 0)
        .map((provider) => ({ type: "provider" as const, provider, score: ranks.get(provider.id) ?? 0 }));
      const businessResults = type === "provider" ? [] : fallback.filter((result) => result.type === "business");
      results = [...providerResults, ...businessResults].sort((a, b) => b.score - a.score || resultRating(b) - resultRating(a));
    }
  }

  if (admin && query.trim()) {
    await admin.from("marketplace_search_queries").insert({ query_text: query.slice(0, 200), result_count: results.length, entity_type: type });
  }
  return { results, marketplace };
}

function resultRating(result: SearchResult) {
  return (result.provider ?? result.business)?.rating ?? 0;
}
