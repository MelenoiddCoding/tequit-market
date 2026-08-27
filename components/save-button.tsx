"use client";
import { Heart } from "lucide-react";
import { useSyncExternalStore } from "react";
const KEY="tequit-saved";
export function readSaved():string[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)??"[]")}catch{return[]}}
export function SaveButton({slug,type}:{slug:string;type:"provider"|"business"}){const key=`${type}:${slug}`;const saved=useSyncExternalStore((callback)=>{window.addEventListener("tequit-saved",callback);return()=>window.removeEventListener("tequit-saved",callback)},()=>readSaved().includes(key),()=>false);function toggle(){const values=readSaved();const next=values.includes(key)?values.filter(v=>v!==key):[...values,key];localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event("tequit-saved"))}return <button type="button" className={`save-btn ${saved?"saved":""}`} onClick={toggle} aria-label={saved?"Quitar de guardados":"Guardar"}><Heart size={19} fill={saved?"currentColor":"none"}/></button>}
