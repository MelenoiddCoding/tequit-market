export const TRAFFIC_SOURCES = [
  "facebook",
  "google",
  "instagram",
  "whatsapp",
  "other",
  "direct_unknown",
] as const;
export const TRAFFIC_SURFACES = [
  "directory",
  "profile",
  "website",
  "business",
  "service",
  "other",
] as const;
export type TrafficSource = (typeof TRAFFIC_SOURCES)[number];
export type TrafficSurface = (typeof TRAFFIC_SURFACES)[number];
export type Journey = {
  id: string;
  source: TrafficSource;
  tagged: boolean;
  entrySurface: TrafficSurface;
  surface: TrafficSurface;
  previousSurface: TrafficSurface | null;
  lastAt: number;
  location: string;
};
export const JOURNEY_TTL = 30 * 60 * 1000;

export function trafficSurface(path: string): TrafficSurface {
  if (path.startsWith("/p/")) return "website";
  if (path.startsWith("/u/")) return "profile";
  if (path.startsWith("/n/")) return "business";
  if (path.startsWith("/servicios/")) return "service";
  if (
    ["/", "/buscar", "/negocios"].includes(path) ||
    path.startsWith("/categorias/")
  )
    return "directory";
  return "other";
}

export function detectSource(
  url: URL,
  referrer: string,
): { source: TrafficSource; tagged: boolean; external: boolean } {
  const tag = url.searchParams.get("utm_source")?.toLowerCase();
  if (tag)
    return {
      source: TRAFFIC_SOURCES.includes(tag as TrafficSource)
        ? (tag as TrafficSource)
        : "other",
      tagged: true,
      external: true,
    };
  let host = "";
  try {
    const ref = new URL(referrer);
    if (ref.origin === url.origin)
      return { source: "direct_unknown", tagged: false, external: false };
    host = ref.hostname;
  } catch {
    /* Referrer is optional. */
  }
  const matches = (domain: string) =>
    host === domain || host.endsWith(`.${domain}`);
  const source: TrafficSource =
    matches("facebook.com") || matches("fb.com")
      ? "facebook"
      : matches("instagram.com")
        ? "instagram"
        : matches("whatsapp.com") || matches("wa.me")
          ? "whatsapp"
          : /(^|\.)google\.(com|com\.mx|[a-z]{2})$/.test(host)
            ? "google"
            : host
              ? "other"
              : "direct_unknown";
  return { source, tagged: false, external: Boolean(host) };
}

export function advanceJourney(
  previous: Journey | null,
  url: URL,
  referrer: string,
  now: number,
  id: () => string,
): Journey {
  const detected = detectSource(url, referrer);
  const surface = trafficSurface(url.pathname);
  // Only retain the path and recognized source; never persist search text, tokens or contact data.
  const location = `${url.pathname}|${detected.tagged ? detected.source : ""}`;
  const expired =
    !previous || now - previous.lastAt >= JOURNEY_TTL || now < previous.lastAt;
  const campaignChanged =
    previous && location !== previous.location && detected.tagged;
  if (expired || campaignChanged || (!detected.tagged && detected.external))
    return {
      id: id(),
      source: detected.source,
      tagged: detected.tagged,
      entrySurface: surface,
      surface,
      previousSurface: null,
      lastAt: now,
      location,
    };
  return {
    ...previous!,
    previousSurface:
      previous!.surface === surface
        ? previous!.previousSurface
        : previous!.surface,
    surface,
    lastAt: now,
    location,
  };
}

export function facebookShareUrl(value: string): string {
  const url = new URL(value);
  url.searchParams.set("utm_source", "facebook");
  url.searchParams.set("utm_medium", "organic_social");
  url.searchParams.delete("ref");
  return url.toString();
}
