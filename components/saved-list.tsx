"use client";
import { useEffect, useState } from "react";
import { BusinessCard, ProviderCard } from "@/components/cards";
import { readSaved } from "@/components/save-button";
import { businesses, providers } from "@/lib/demo-data";
export function SavedList(){const[saved,setSaved]=useState<string[]>([]);useEffect(()=>{const sync=()=>setSaved(readSaved());sync();window.addEventListener("tequit-saved",sync);return()=>window.removeEventListener("tequit-saved",sync)},[]);const ps=providers.filter(p=>saved.includes(`provider:${p.slug}`));const bs=businesses.filter(b=>saved.includes(`business:${b.slug}`));if(!saved.length)return <div className="empty"><h2>Aún no guardas opciones</h2><p>Usa el corazón en personas o negocios para compararlos después. Se conservan en este navegador.</p><a className="btn btn-primary" href="/buscar">Explorar servicios</a></div>;return <div className="result-list">{ps.map(p=><ProviderCard key={p.id} provider={p}/>)}{bs.map(b=><BusinessCard key={b.id} business={b}/>)}</div>}
