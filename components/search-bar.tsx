"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({ initial = "", dark = false }: { initial?: string; dark?: boolean }) {
  const router = useRouter(); const [query,setQuery]=useState(initial);
  function submit(e:FormEvent){e.preventDefault();router.push(`/buscar?q=${encodeURIComponent(query)}`)}
  return <form className="search-shell" onSubmit={submit} role="search"><label className="sr-only" htmlFor="market-search">¿Qué necesitas?</label><input id="market-search" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Plomero, albañil, reparar lavadora..."/><button className={`btn ${dark?"btn-dark":"btn-primary"}`} type="submit"><Search size={19}/>Buscar</button></form>
}
