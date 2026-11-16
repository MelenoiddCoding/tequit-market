export const LOCATION_COOKIE = "tequit_discovery_location";
export const LOCATION_CONSENT_VERSION = "2026-10-09";

export type DiscoveryLocation = {
  source: "browser" | "manual" | "default";
  label: string;
  lat?: number;
  lng?: number;
  areaSlug?: string;
};

export const DEFAULT_DISCOVERY_LOCATION: DiscoveryLocation = { source: "default", areaSlug: "tepic", label: "Tepic" };

export function ipCitySuggestion(value: string | null): "none" | "uruapan" | "elsewhere" {
  if (!value) return "none";
  try {
    const city = decodeURIComponent(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    if (!city || city === "tepic") return "none";
    return city === "uruapan" ? "uruapan" : "elsewhere";
  } catch { return "none"; }
}

export type DiscoveryArea = {
  slug: string;
  name: string;
  city: string;
  state: string;
  type: "municipality" | "neighborhood";
};

export function marketCityForDiscovery(location: DiscoveryLocation, areas: DiscoveryArea[]): "tepic" | "uruapan" | null {
  if (location.source === "browser" && location.lat !== undefined && location.lng !== undefined) {
    const near = (lat: number, lng: number) => {
      const deltaLat = (location.lat! - lat) * Math.PI / 180;
      const deltaLng = (location.lng! - lng) * Math.PI / 180;
      const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(location.lat! * Math.PI / 180) * Math.sin(deltaLng / 2) ** 2;
      return 12742 * Math.asin(Math.sqrt(a));
    };
    if (near(21.5095, -104.8957) <= 35) return "tepic";
    if (near(19.4163, -102.0528) <= 35) return "uruapan";
    return null;
  }
  if (location.areaSlug === "tepic" || location.areaSlug === "uruapan") return location.areaSlug;
  const area = areas.find((item) => item.slug === location.areaSlug);
  return area?.city === "Tepic" ? "tepic" : area?.city === "Uruapan" ? "uruapan" : null;
}

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
