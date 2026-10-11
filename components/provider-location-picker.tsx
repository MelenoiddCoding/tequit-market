"use client";

import { useState } from "react";
import { ProviderLocationMap } from "@/components/provider-location-map";
import { MARKET_CITIES, type ProviderLocationDraft, type MarketCity } from "@/lib/provider-location";
import type { DiscoveryArea } from "@/lib/location";
import styles from "@/components/provider-location-picker.module.css";

export function ProviderLocationPicker({value,onChange,areas}:{value:ProviderLocationDraft;onChange:(value:ProviderLocationDraft)=>void;areas:DiscoveryArea[]}) {
  const [showMap,setShowMap]=useState(false);
  const [message,setMessage]=useState("");
  const neighborhoods=areas.filter(area=>area.city===MARKET_CITIES[value.citySlug].city&&area.type==="neighborhood");
  function cityChanged(citySlug:MarketCity){onChange({citySlug,coverageCities:[citySlug],source:null,areaSlug:null,lat:null,lng:null,accuracy:null});setShowMap(false);setMessage("")}
  function locate(){if(!navigator.geolocation){setMessage("El navegador no permite ubicación. Puedes elegir colonia o marcar un punto.");return}setMessage("Obteniendo ubicación…");navigator.geolocation.getCurrentPosition(position=>{onChange({...value,source:"browser",areaSlug:null,lat:position.coords.latitude,lng:position.coords.longitude,accuracy:Math.round(position.coords.accuracy)});setMessage("Ubicación recibida. Se guardará de forma privada.")},()=>setMessage("No pudimos acceder a tu ubicación. Elige colonia o marca un punto."),{enableHighAccuracy:false,timeout:10000,maximumAge:300000})}
  return <div className={styles.picker}>
    <div><h3>Ubicación para aparecer en búsquedas</h3><p>Elige dónde trabajas habitualmente. Tu punto exacto no se muestra en tu perfil.</p></div>
    <label className={styles.field}>Ciudad<select value={value.citySlug} onChange={event=>cityChanged(event.target.value as MarketCity)}><option value="tepic">Tepic, Nayarit</option><option value="uruapan">Uruapan, Michoacán</option></select></label>
    <div className={styles.choices}><button type="button" onClick={locate}>Usar mi ubicación</button><button type="button" onClick={()=>setShowMap(current=>!current)}>{showMap?"Cerrar mapa":"Marcar punto aproximado"}</button></div>
    {neighborhoods.length>0&&<label className={styles.field}>O elige una colonia<select value={value.source==="area"?value.areaSlug??"":""} onChange={event=>{const slug=event.target.value;onChange({...value,source:"area",areaSlug:slug,lat:null,lng:null,accuracy:null});setMessage("Usaremos el centro aproximado de la colonia.")}}><option value="">Selecciona colonia</option>{neighborhoods.map(area=><option value={area.slug} key={area.slug}>{area.name}</option>)}</select></label>}
    {showMap&&<><ProviderLocationMap key={value.citySlug} value={value} onPick={(lat,lng)=>{onChange({...value,source:"manual",areaSlug:null,lat,lng,accuracy:null});setMessage("Punto aproximado marcado.")}}/><p>La marca puede ser aproximada; no necesitas indicar tu casa.</p></>}
    <div><strong className={styles.status}>{value.source?"Punto de trabajo listo":"Falta elegir un punto de trabajo"}</strong>{message&&<p role="status">{message}</p>}</div>
    <div><h3>Ciudades donde atiendes</h3><p>La cobertura declarada se usa para los planes que la incluyen.</p><div className={styles.coverage}>{(Object.keys(MARKET_CITIES) as MarketCity[]).map(city=><label key={city}><input type="checkbox" checked={value.coverageCities.includes(city)} onChange={event=>{const next=event.target.checked?[...value.coverageCities,city]:value.coverageCities.filter(item=>item!==city);onChange({...value,coverageCities:next})}}/>{MARKET_CITIES[city].city}</label>)}</div></div>
  </div>;
}
