"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { ProviderLocationDraft } from "@/lib/provider-location";
import { MARKET_CITIES } from "@/lib/provider-location";
import styles from "@/components/provider-location-picker.module.css";

export function ProviderLocationMap({value,onPick}:{value:ProviderLocationDraft;onPick:(lat:number,lng:number)=>void}) {
  const container=useRef<HTMLDivElement>(null);
  const starting=useRef(value);
  const onPickRef=useRef(onPick);
  useEffect(()=>{onPickRef.current=onPick},[onPick]);
  useEffect(()=>{
    let disposed=false;
    let map:import("leaflet").Map|undefined;
    import("leaflet").then(L=>{
      if(disposed||!container.current)return;
      const initial=starting.current;
      const center=MARKET_CITIES[initial.citySlug];
      map=L.map(container.current,{zoomControl:true,scrollWheelZoom:false}).setView([initial.lat??center.lat,initial.lng??center.lng],initial.lat!==null?14:12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
      const marker=L.marker([initial.lat??center.lat,initial.lng??center.lng],{icon:L.divIcon({html:'<span style="display:block;width:20px;height:20px;border:4px solid white;border-radius:50%;background:#254432;box-shadow:0 2px 8px #0005"></span>',className:"",iconSize:[20,20],iconAnchor:[10,10]})}).addTo(map);
      map.on("click",event=>{marker.setLatLng(event.latlng);onPickRef.current(event.latlng.lat,event.latlng.lng)});
    });
    return()=>{disposed=true;map?.remove()};
  },[]);
  return <div className={styles.map} ref={container} role="application" aria-label="Mapa para marcar un punto de trabajo aproximado"/>;
}
