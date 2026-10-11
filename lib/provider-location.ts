export const MARKET_CITIES = {
  tepic: { label: "Tepic, Nayarit", city: "Tepic", lat: 21.5095, lng: -104.8957 },
  uruapan: { label: "Uruapan, Michoacán", city: "Uruapan", lat: 19.4163, lng: -102.0528 },
} as const;

export type MarketCity = keyof typeof MARKET_CITIES;
export function isMarketCity(value:string):value is MarketCity {return value==="tepic"||value==="uruapan"}
export type ProviderLocationDraft = {
  citySlug: MarketCity;
  coverageCities: MarketCity[];
  source: "browser" | "manual" | "area" | "existing" | null;
  areaSlug: string | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
};

export function cityFromZone(zone: string): MarketCity {
  return /uruapan/i.test(zone) ? "uruapan" : "tepic";
}

export function emptyProviderLocation(citySlug: MarketCity = "tepic"): ProviderLocationDraft {
  return { citySlug, coverageCities: [citySlug], source: null, areaSlug: null, lat: null, lng: null, accuracy: null };
}
