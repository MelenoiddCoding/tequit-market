"use client";

import { FormEvent,useState } from "react";
import { ArrowRight,Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProviderOnboardingForm({name,phone}:{name:string;phone:string}){
  const router=useRouter();const[busy,setBusy]=useState(false);const[error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const values=Object.fromEntries(new FormData(event.currentTarget));const response=await fetch("/api/account/provider",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});const body=await response.json();if(!response.ok){setError(body.error??"No pudimos crear tu perfil.");setBusy(false);return}router.push(body.destination);router.refresh()}
  return <form className="account-provider-form" onSubmit={submit}>
    <div><label htmlFor="provider-name">Nombre público</label><input className="field" id="provider-name" name="name" defaultValue={name} required/></div>
    <div><label htmlFor="provider-profession">Oficio o profesión</label><input className="field" id="provider-profession" name="profession" placeholder="Ej. Mantenimiento de bombas" required/></div>
    <div><label htmlFor="provider-phone">WhatsApp</label><input className="field" id="provider-phone" name="phone" inputMode="tel" defaultValue={phone} placeholder="311 000 0000" required/></div>
    <div><label htmlFor="provider-zone">Zona de atención</label><input className="field" id="provider-zone" name="zone" defaultValue="Tepic, Nayarit" required/></div>
    <div className="account-provider-wide"><label htmlFor="provider-bio">Sobre tu trabajo</label><textarea className="field" id="provider-bio" name="bio" minLength={20} required/></div>
    <div className="account-provider-wide"><label htmlFor="provider-service">Primer servicio</label><input className="field" id="provider-service" name="firstService" placeholder="Ej. Mantenimiento preventivo" required/></div>
    {error&&<p className="form-error account-provider-wide" role="alert">{error}</p>}
    <button className="btn btn-primary account-provider-wide" disabled={busy}>{busy?<Loader2 className="animate-spin" aria-hidden/>:<ArrowRight aria-hidden/>}{busy?"Creando perfil…":"Crear perfil de prestador"}</button>
  </form>
}
