export const LOCATION_COOKIE = "tequit_discovery_location";
export const LOCATION_CONSENT_VERSION = "2026-10-09";

export type DiscoveryLocation = {
  source: "browser" | "manual";
  label: string;
  lat?: number;
  lng?: number;
  areaSlug?: string;
};

export type DiscoveryArea = {
  slug: string;
  name: string;
  city: string;
  state: string;
  type: "municipality" | "neighborhood";
};

export function serializeDiscoveryLocation(value: DiscoveryLocation) {
  return encodeURIComponent(JSON.stringify(value));
}

export function parseDiscoveryLocation(value?: string | null): DiscoveryLocation | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<DiscoveryLocation>;
    if (parsed.source === "manual" && typeof parsed.areaSlug === "string" && typeof parsed.label === "string") {
      return { source: "manual", areaSlug: parsed.areaSlug.slice(0, 100), label: parsed.label.slice(0, 120) };
    }
    if (parsed.source === "browser" && typeof parsed.lat === "number" && typeof parsed.lng === "number" && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng) && parsed.lat >= -90 && parsed.lat <= 90 && parsed.lng >= -180 && parsed.lng <= 180) {
      return { source: "browser", lat: parsed.lat, lng: parsed.lng, label: typeof parsed.label === "string" ? parsed.label.slice(0, 120) : "Tu ubicación" };
    }
  } catch {}
  return null;
}
