"use client";

import Link from "next/link";
import { Heart, Store, UserRound } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BusinessCard, ProviderCard } from "@/components/cards";
import type { Business, Provider } from "@/types";
import styles from "@/components/identity-redesign.module.css";

const STORAGE_KEY = "tequit-saved";

function subscribe(callback: () => void) {
  window.addEventListener("tequit-saved", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("tequit-saved", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "storage-error";
  }
}

function parseSaved(raw: string) {
  if (raw === "storage-error") return { values: [] as string[], error: true };
  try {
    const value: unknown = JSON.parse(raw);
    return { values: Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [], error: !Array.isArray(value) };
  } catch {
    return { values: [] as string[], error: true };
  }
}

export function SavedList({providers,businesses}:{providers:Provider[];businesses:Business[]}) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const { values: saved, error } = parseSaved(raw);
  const people = providers.filter((provider) => saved.includes(`provider:${provider.slug}`));
  const localBusinesses = businesses.filter((business) => saved.includes(`business:${business.slug}`));
  const previousRaw = useRef(typeof window === "undefined" ? raw : getSnapshot());
  const suppressNotice = useRef(false);
  const [notice, setNotice] = useState<{ text: string; undoRaw: string } | null>(null);

  useEffect(()=>{void fetch("/api/favorites").then((response)=>response.json()).then((data:{authenticated?:boolean;items?:string[]})=>{if(!data.authenticated||!Array.isArray(data.items))return;const merged=Array.from(new Set([...parseSaved(getSnapshot()).values,...data.items]));localStorage.setItem(STORAGE_KEY,JSON.stringify(merged));window.dispatchEvent(new Event("tequit-saved"))}).catch(()=>undefined)},[]);

  useEffect(() => {
    if (raw === previousRaw.current) return;
    const before = parseSaved(previousRaw.current).values.length;
    const after = parseSaved(raw).values.length;
    if (!suppressNotice.current && raw !== "storage-error") {
      setNotice({ text: after < before ? "Se quitó de tus guardados." : "Se guardó en este dispositivo.", undoRaw: previousRaw.current });
    }
    suppressNotice.current = false;
    previousRaw.current = raw;
  }, [raw]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function undo() {
    if (!notice) return;
    try {
      suppressNotice.current = true;
      localStorage.setItem(STORAGE_KEY, notice.undoRaw);
      window.dispatchEvent(new Event("tequit-saved"));
      setNotice(null);
    } catch {
      setNotice({ text: "No pudimos restaurar el guardado.", undoRaw: notice.undoRaw });
    }
  }

  if (error) return <div className={styles.emptyState} role="alert">
    <span className={styles.emptyIcon}><Heart aria-hidden /></span>
    <h2>No pudimos leer tus guardados</h2>
    <p>El navegador bloqueó el almacenamiento o los datos locales no tienen un formato válido. Puedes seguir explorando y volver a intentarlo.</p>
    <Link className="btn btn-primary" href="/buscar">Explorar servicios</Link>
  </div>;

  if (!people.length && !localBusinesses.length) return <div className={styles.emptyState}>
    <span className={styles.emptyIcon}><Heart aria-hidden /></span>
    <h2>Aún no guardas opciones</h2>
    <p>Usa el corazón en personas o negocios para tenerlos a la mano después. Se conservan sólo en este navegador.</p>
    <Link className="btn btn-primary" href="/buscar">Explorar servicios</Link>
  </div>;

  return <>
    <div className={styles.savedGrid}>
      <section aria-labelledby="saved-people">
        <header className={styles.savedSectionHeader}><UserRound aria-hidden /><h2 id="saved-people">Personas</h2><span className={styles.savedCount}>{people.length}</span></header>
        {people.length ? <div className={styles.savedList}>{people.map((provider) => <ProviderCard key={provider.id} provider={provider} variant="list" />)}</div> : <p className="muted">No tienes personas guardadas.</p>}
      </section>
      <section aria-labelledby="saved-businesses">
        <header className={styles.savedSectionHeader}><Store aria-hidden /><h2 id="saved-businesses">Negocios</h2><span className={styles.savedCount}>{localBusinesses.length}</span></header>
        {localBusinesses.length ? <div className={styles.savedList}>{localBusinesses.map((business) => <BusinessCard key={business.id} business={business} variant="list" />)}</div> : <p className="muted">No tienes negocios guardados.</p>}
      </section>
    </div>
    {notice && <div className={styles.snackbar} role="status"><span>{notice.text}</span><button type="button" onClick={undo}>Deshacer</button></div>}
  </>;
}
