"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { LOCATION_COOKIE, ipCitySuggestion, parseDiscoveryLocation, serializeDiscoveryLocation } from "@/lib/location";

const dismissalKey = "tequit_city_suggestion_dismissed";

export function CitySuggestion({ ipCity }: { ipCity: string | null }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const hint = ipCitySuggestion(ipCity);
  useEffect(() => {
    const saved = parseDiscoveryLocation(document.cookie.split("; ").find((part) => part.startsWith(`${LOCATION_COOKIE}=`))?.split("=")[1]);
    const area = new URLSearchParams(window.location.search).get("area");
    queueMicrotask(() => setShow(Boolean(hint !== "none" && !saved && !area && !sessionStorage.getItem(dismissalKey))));
  }, [hint]);
  if (!show) return null;

  function dismiss() { sessionStorage.setItem(dismissalKey, "1"); setShow(false); }
  function choose(next: "tepic" | "uruapan") {
    const label = next === "tepic" ? "Tepic" : "Uruapan";
    document.cookie = `${LOCATION_COOKIE}=${serializeDiscoveryLocation({ source: "manual", areaSlug: next, label })}; Path=/; Max-Age=15552000; SameSite=Lax; Secure`;
    window.dispatchEvent(new Event("tequit:location-change"));
    dismiss();
    const url = new URL(window.location.href);
    if (url.pathname === "/" || url.pathname === "/buscar" || url.pathname === "/negocios" || url.pathname.startsWith("/servicios/") || url.pathname.startsWith("/categorias/")) {
      url.searchParams.set("area", next);
      router.replace(`${url.pathname}${url.search}`, { scroll: false });
    }
    router.refresh();
  }

  return <aside className="city-suggestion" aria-label="Sugerencia de ciudad"><p>{hint === "uruapan" ? "Parece que estás en Uruapan. ¿Quieres buscar allí?" : "Estamos mostrando servicios en Tepic. ¿Buscas aquí o prefieres Uruapan?"}</p><div><button type="button" onClick={() => choose("tepic")}>Buscar en Tepic</button><button type="button" onClick={() => choose("uruapan")}>Buscar en Uruapan</button><button type="button" onClick={dismiss} aria-label="Cerrar sugerencia"><X size={18} aria-hidden /></button></div></aside>;
}
