"use client";

import {useState} from "react";
import {ProviderLocationPicker} from "@/components/provider-location-picker";
import type {DiscoveryArea} from "@/lib/location";
import type {ProviderLocationDraft} from "@/lib/provider-location";
import {dashboardStyles as styles} from "@/components/dashboard-components";

export function ProviderLocationSettings({providerId,areas,initial}:{providerId:string;areas:DiscoveryArea[];initial:ProviderLocationDraft}) {
  const [location,setLocation]=useState(initial);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState(initial.source?"Tu ubicación de trabajo está configurada.":"Completa este dato para aparecer en búsquedas por cercanía.");
  async function save(){if(!location.source){setMessage("Marca una colonia o un punto para actualizar la ubicación.");return}setBusy(true);try{const response=await fetch("/api/dashboard/location",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({providerId,location})});const data=await response.json();if(!response.ok)throw new Error(data.error??"No pudimos guardar la ubicación.");setLocation({...location,source:"existing"});setMessage("Ubicación y cobertura guardadas.")}catch(error){setMessage(error instanceof Error?error.message:"No pudimos guardar la ubicación.")}finally{setBusy(false)}}
  return <section className={styles.formSection}><ProviderLocationPicker areas={areas} value={location} onChange={setLocation}/><div className={styles.tableActions}><button className={styles.secondary} type="button" onClick={save} disabled={busy}>{busy?"Guardando…":"Guardar ubicación y cobertura"}</button><span className={styles.help} role="status">{message}</span></div></section>;
}
