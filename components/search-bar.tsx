"use client";

import { FormEvent, useId, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import styles from "@/components/public-redesign.module.css";
import { LOCATION_COOKIE, parseDiscoveryLocation } from "@/lib/location";

type MarketplaceSearchProps = {
  initial?: string;
  variant?: "hero" | "compact";
  destination?: "/buscar" | "/negocios";
  placeholder?: string;
  label?: string;
  buttonLabel?: string;
  dark?: boolean;
};

export function SearchBar({ initial = "", variant = "compact", destination = "/buscar", placeholder = "Plomero, albañil, reparar lavadora…", label = "¿Qué necesitas resolver?", buttonLabel = "Buscar" }: MarketplaceSearchProps) {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState(initial);
  const [loading, setLoading] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    setLoading(true);
    const source = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();
    const saved = parseDiscoveryLocation(document.cookie.split("; ").find((part) => part.startsWith(`${LOCATION_COOKIE}=`))?.split("=")[1]);
    const area = source.get("area") ?? saved?.areaSlug;
    if (area) params.set("area", area);
    if (destination === "/buscar") for (const key of ["type", "verified"]) { const value = source.get(key); if (value) params.set(key, value); }
    if (normalized) params.set("q", normalized);
    router.push(`${destination}${params.size ? `?${params}` : ""}`);
  }

  return <form className={cn(styles.marketplaceSearch, styles[variant])} onSubmit={submit} role="search"><label className="sr-only" htmlFor={inputId}>{label}</label><Search size={21} aria-hidden /><input id={inputId} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} autoComplete="off"/><button className="btn btn-primary" type="submit" disabled={loading}><span className={styles.searchButtonText}>{loading ? "Buscando…" : buttonLabel}</span><ArrowRight className={styles.searchButtonIcon} size={19} aria-hidden /></button></form>;
}
