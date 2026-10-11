"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LocateFixed, MapPin, X } from "lucide-react";
import { LOCATION_CONSENT_VERSION, LOCATION_COOKIE, serializeDiscoveryLocation, type DiscoveryArea, type DiscoveryLocation } from "@/lib/location";
import styles from "@/components/public-redesign.module.css";

type Props = { areas: DiscoveryArea[]; current: DiscoveryLocation | null; compact?: boolean };

export function LocationDiscovery({ areas, current, compact = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selectableAreas = areas.filter((area) => area.city === "Tepic" || area.city === "Uruapan");

  async function persist(value: DiscoveryLocation) {
    document.cookie = `${LOCATION_COOKIE}=${serializeDiscoveryLocation(value)}; Path=/; Max-Age=15552000; SameSite=Lax; Secure`;
    void fetch("/api/account/location", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...value, consentVersion: LOCATION_CONSENT_VERSION }) }).catch(()=>undefined);
    const params = new URLSearchParams(searchParams.toString());
    if (value.areaSlug) params.set("area", value.areaSlug); else params.delete("area");
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
    router.refresh();
    setOpen(false);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) { setMessage("Tu navegador no permite compartir ubicación. Elige una zona."); return; }
    setBusy(true); setMessage("Buscando tu ubicación…");
    navigator.geolocation.getCurrentPosition(
      (position) => { void persist({ source: "browser", lat: position.coords.latitude, lng: position.coords.longitude, label: "Cerca de ti" }); setBusy(false); },
      () => { setBusy(false); setMessage("No pudimos usar tu ubicación. Elige tu colonia o zona."); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  function clearLocation() {
    document.cookie = `${LOCATION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
    void fetch("/api/account/location", { method: "DELETE" }).catch(()=>undefined);
    const params = new URLSearchParams(searchParams.toString()); params.delete("area");
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false }); router.refresh(); setOpen(true);
  }

  return <section className={`${styles.locationPanel} ${compact ? styles.locationPanelCompact : ""}`} aria-labelledby="location-title">
    <div className={styles.locationPanelLead}><MapPin size={20} aria-hidden/><div><strong id="location-title">{current ? current.label : "¿En qué zona necesitas ayuda?"}</strong><p>{current ? "Te mostramos prestadores que pueden atenderte ahí." : "Tu ubicación sólo se usa para encontrar cobertura; nunca mostramos tu punto exacto."}</p></div></div>
    <div className={styles.locationActions}>
      {current ? <><button className="btn btn-secondary" type="button" onClick={() => setOpen((value) => !value)}>Cambiar ubicación</button><button className={styles.locationClear} type="button" onClick={clearLocation} aria-label="Quitar ubicación"><X size={18}/></button></> : <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>Elegir ubicación</button>}
    </div>
    {open && <div className={styles.locationChooser}>
      <button className="btn btn-primary" type="button" onClick={useCurrentLocation} disabled={busy}><LocateFixed size={18}/>{busy ? "Ubicando…" : "Usar mi ubicación"}</button>
      <span>o elige una zona</span>
      <label><span className="sr-only">Municipio, colonia o zona</span><select defaultValue="" onChange={(event) => { const area=areas.find((item)=>item.slug===event.target.value); if(area) void persist({source:"manual",areaSlug:area.slug,label:area.type==="municipality"?`Municipio de ${area.name}`:`${area.name}, ${area.city}`}); }}><option value="" disabled>Municipio y colonia</option>{selectableAreas.map((area)=><option value={area.slug} key={`${area.city}-${area.slug}`}>{area.type==="municipality"?`Municipio · ${area.name}`:`${area.city} · ${area.name}`}</option>)}</select></label>
      {message && <p className={styles.locationMessage} role="status">{message}</p>}
    </div>}
  </section>;
}
