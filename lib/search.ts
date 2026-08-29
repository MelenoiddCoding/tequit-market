import type { Business, Provider, SearchResult } from "@/types";

export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9ñ\s]/g, " ").replace(/\s+/g, " ").trim();
}

function entityText(entity: Provider | Business) {
  const serviceText = entity.services.flatMap((s) => [s.name, s.category, ...(s.aliases ?? [])]);
  const common = [entity.name, entity.zone, ...serviceText];
  if ("profession" in entity) common.push(entity.profession, entity.bio, ...entity.areas);
  else common.push(entity.category, ...entity.products.map((p) => p.name));
  return normalizeSearch(common.join(" "));
}

export function searchMarketplaceData(providersData: Provider[], businessesData: Business[], query: string, type: "all" | "provider" | "business" = "all", verified = false): SearchResult[] {
  const terms = normalizeSearch(query).split(" ").filter((t) => t.length > 1);
  const candidates: SearchResult[] = [
    ...providersData.filter((p) => p.status === "active").map((provider) => ({ type: "provider" as const, provider, score: score(entityText(provider), terms, provider.name) })),
    ...businessesData.filter((b) => b.status === "active").map((business) => ({ type: "business" as const, business, score: score(entityText(business), terms, business.name) })),
  ];
  return candidates.filter((r) => (type === "all" || r.type === type) && (!verified || Boolean((r.provider ?? r.business)?.verifications.length)) && (!terms.length || r.score > 0)).sort((a, b) => b.score - a.score || rating(b) - rating(a));
}

function score(text: string, terms: string[], name: string) {
  if (!terms.length) return 1;
  const normalizedName = normalizeSearch(name);
  return terms.reduce((total, term) => total + (normalizedName.includes(term) ? 8 : 0) + (text.includes(term) ? 3 : 0), 0);
}
const rating = (r: SearchResult) => (r.provider ?? r.business)?.rating ?? 0;
