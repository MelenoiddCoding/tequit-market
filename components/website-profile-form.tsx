"use client";
import Link from "next/link";
import { WebsiteTemplatePicker } from "@/components/website-template-picker";
import {useAdminUpdate} from "@/components/admin-update-toast";
import type { WebsiteTemplateId } from "@/lib/website-offer";
import {useUnsavedForm} from "@/lib/use-unsaved-form";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ProviderCategorySelector } from "@/components/provider-category-selector";
import type { AssistedInitial, AssistedService } from "@/components/assisted-onboarding-wizard";
import type { MarketplaceCategory } from "@/types";
import { dashboardStyles as ui } from "@/components/dashboard-components";
import styles from "@/components/website-workspace.module.css";

export async function websiteProfileRequest(body:unknown) {
  const response=await fetch("/api/admin/onboardings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error??"No se pudieron guardar los datos.");
  return data;
}

export function WebsiteProfileForm({initial,categories}:{initial?:AssistedInitial;categories:MarketplaceCategory[]}) {
  const router=useRouter();
  const showUpdate=useAdminUpdate();
  const [templateId,setTemplateId]=useState<WebsiteTemplateId>("base");
  const {markChanged,markSaved}=useUnsavedForm();
  const [id,setId]=useState(initial?.id??"");
  const [entityId,setEntityId]=useState(initial?.entityId??"");
  const [primary,setPrimary]=useState(initial?.primaryCategoryId??"");
  const [secondary,setSecondary]=useState(initial?.secondaryCategoryIds??[]);
  const [services,setServices]=useState<AssistedService[]>(initial?.services??[]);
  const [matches,setMatches]=useState<{id:string;name:string}[]>([]);
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);setError("");
    const form=new FormData(event.currentTarget);
    const basics={name:String(form.get("name")??""),phone:String(form.get("phone")??""),zone:String(form.get("zone")??""),
      profession:categories.flatMap(c=>c.canonicalCategories).find(c=>c.id===primary)?.name??initial?.profession??"",
      primaryCategoryId:primary,secondaryCategoryIds:secondary,address:"",source:String(form.get("source")??"whatsapp")};
    try {
      let recordId=id;
      if(!initial && !entityId) {
        const response=await fetch(`/api/admin/onboardings?kind=provider&q=${encodeURIComponent(basics.phone)}`);
        if(!response.ok) throw new Error("No pudimos revisar si este prestador ya existe. Inténtalo de nuevo.");
        const duplicates=await response.json();
        if(duplicates.matches?.length && !form.get("duplicateReviewed")) {setMatches(duplicates.matches);throw new Error("Ya existen perfiles con este teléfono. Puedes abrir uno o confirmar que corresponde crear otro.");}
        const created=await websiteProfileRequest({action:"create",kind:"provider",templateId,...basics});
        setId(created.id);setEntityId(created.entityId);markSaved();
        router.push(`/admin/sitios/${created.entityId}?seccion=datos`);router.refresh();return;
      }
      if(!recordId){const managed=await websiteProfileRequest({action:"manage",providerId:entityId});recordId=managed.id;setId(recordId);}
      const saved=await websiteProfileRequest({action:"save",id:recordId,...basics,
        bio:initial?.bio??"",headline:initial?.headline??"",yearsExperience:initial?.yearsExperience??null,
        areas:String(form.get("areas")??"").split("\n").map(x=>x.trim()).filter(Boolean),services,
        verifications:initial?.verifications??[],consentConfirmed:form.get("consentConfirmed")==="on",consentNote:String(form.get("consentNote")??""),
        duplicateReviewed:initial?.duplicateReviewed??Boolean(form.get("duplicateReviewed")),duplicateNote:initial?.duplicateNote??""});
      markSaved();setServices(saved.services);showUpdate({mode:"success",title:"Datos y servicios guardados",message:"La página y la ficha del directorio usan esta información."});router.refresh();
    }catch(value){setError(value instanceof Error?value.message:"No pudimos guardar.");}finally{setBusy(false);}
  }
  return <form className={ui.form} onSubmit={submit} onChangeCapture={markChanged}>
    {!initial && <section className={styles.section}><WebsiteTemplatePicker value={templateId} onChange={setTemplateId}/></section>}
    <section className={styles.section}><div><h2>{initial?"Datos y contacto":"¿Para quién es la página?"}</h2><p className={styles.note}>{initial?"La página y la ficha del directorio comparten estos datos.":"Crea la página aquí. Su ficha en Tequit se prepara con los mismos datos, sin repetir el registro."}</p></div>
      <div className={styles.grid}>
        <label className={ui.fieldGroup}>Nombre público<input className={ui.field} name="name" defaultValue={initial?.name} minLength={2} maxLength={120} required/></label>
        <label className={ui.fieldGroup}>WhatsApp de contacto<input className={ui.field} name="phone" type="tel" defaultValue={initial?.phone} minLength={10} maxLength={20} required/></label>
        <div className={styles.full}><ProviderCategorySelector categories={categories} primaryId={primary} secondaryIds={secondary} onChange={(p,s)=>{setPrimary(p);setSecondary(s);}} idPrefix="website-category"/></div>
        <label className={ui.fieldGroup}>Ciudad y estado<input className={ui.field} name="zone" defaultValue={initial?.zone??"Tepic, Nayarit"} minLength={2} maxLength={160} required/></label>
        <label className={ui.fieldGroup}>Cómo recibiste la información<select className={ui.select} name="source" defaultValue={initial?.source??"whatsapp"}><option value="whatsapp">WhatsApp</option><option value="in_person">En persona</option><option value="call">Llamada</option></select></label>
        {initial&&<label className={`${ui.fieldGroup} ${styles.full}`}>Zonas de atención (una por línea)<textarea className={ui.textarea} name="areas" defaultValue={initial.areas.join("\n")}/></label>}
      </div>
    </section>
    {initial&&<><section className={styles.section}><div><h2>Servicios</h2><p className={styles.note}>Los primeros cinco aparecen en las plantillas del sitio.</p></div>
      {services.map((service,index)=><div className={styles.row} key={service.id??index}>
        <label className={ui.fieldGroup}>Servicio {index+1}<input className={ui.field} value={service.title} onChange={e=>setServices(rows=>rows.map((r,i)=>i===index?{...r,title:e.target.value}:r))} minLength={3} maxLength={120} required/></label>
        <label className={ui.fieldGroup}>Descripción<textarea className={ui.textarea} value={service.description} onChange={e=>setServices(rows=>rows.map((r,i)=>i===index?{...r,description:e.target.value}:r))} maxLength={500}/></label>
        <div><button type="button" className={ui.ghost} onClick={()=>{markChanged();setServices(rows=>rows.filter((_,i)=>i!==index));}}>Quitar servicio</button></div>
      </div>)}
      {services.length<Math.max(5,initial.services.length)&&<div><button type="button" className={ui.secondary} onClick={()=>{markChanged();setServices(rows=>[...rows,{canonicalId:null,title:"",description:""}]);}}>Agregar servicio</button></div>}
    </section><section className={styles.section}><h2>Autorización</h2><label><input type="checkbox" name="consentConfirmed" defaultChecked={initial.consentConfirmed}/> El titular autorizó publicar sus datos, servicios y fotografías.</label><label className={ui.fieldGroup}>Nota de autorización<textarea className={ui.textarea} name="consentNote" defaultValue={initial.consentNote} maxLength={500}/></label></section></>}
    {matches.length>0&&<section className={styles.section}><h2>Perfiles existentes</h2>{matches.map(m=><Link key={m.id} href={`/admin/sitios/${m.id}`}>Abrir página de {m.name}</Link>)}<label><input type="checkbox" name="duplicateReviewed"/> Revisé los perfiles; esta página corresponde a otro prestador.</label></section>}
    {error&&<p role="alert">{error}</p>}
    <div className={styles.actions}><button className={ui.primary} disabled={busy||!primary}>{busy?"Guardando…":initial?"Guardar datos y servicios":"Crear página y continuar"}</button></div>
  </form>;
}
