"use client";
import { advanceJourney, type Journey, JOURNEY_TTL } from "@/lib/traffic";
let memory: Journey | null = null;
let entered = false;
const sent = new Map<string, number>();
export function trackEvent(
  event: {
    type: string;
    target?: string;
    targetType?: "provider" | "business";
    destination?: string;
  },
  deduplicate = false,
) {
  if (
    typeof window === "undefined" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  )
    return;
  const url = new URL(window.location.href);
  if (
    /^\/(admin|dashboard)(\/|$)/.test(url.pathname) ||
    url.searchParams.has("preview")
  )
    return;
  try {
    const stored = JSON.parse(
      localStorage.getItem("tequit:journey:v1") ?? "null",
    ) as Journey | null;
    if (
      typeof stored?.id === "string" &&
      /^[0-9a-f-]{36}$/i.test(stored.id) &&
      Number.isFinite(stored.lastAt) &&
      (!memory || stored.lastAt > memory.lastAt)
    )
      memory = stored;
  } catch {
    /* Memory fallback when storage is unavailable. */
  }
  const now = Date.now();
  memory = advanceJourney(
    memory,
    url,
    entered ? "" : document.referrer,
    now,
    () => crypto.randomUUID(),
  );
  entered = true;
  try {
    localStorage.setItem("tequit:journey:v1", JSON.stringify(memory));
  } catch {}
  const key = `${memory.id}:${event.type}:${event.target ?? url.pathname}`;
  if (now - (sent.get(key) ?? 0) < (deduplicate ? JOURNEY_TTL : 1500)) return;
  sent.set(key, now);
  for (const [item, at] of sent) if (now - at >= JOURNEY_TTL) sent.delete(item);
  const eventId = deduplicate ? key : crypto.randomUUID();
  const body = JSON.stringify({
    ...event,
    eventId,
    attribution: {
      source: memory.source,
      tagged: memory.tagged,
      journeyId: memory.id,
      entrySurface: memory.entrySurface,
      surface: memory.surface,
      previousSurface: memory.previousSurface,
    },
  });
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  })
    .then((response) => {
      if (!response.ok) sent.delete(key);
    })
    .catch(() => {
      sent.delete(key);
    });
}
