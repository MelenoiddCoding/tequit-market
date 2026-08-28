"use client";

import { FormEvent, useState } from "react";
import { Camera, CheckCircle2, Loader2, LockKeyhole, Send } from "lucide-react";
import styles from "@/components/public-redesign.module.css";

type RequestFormProps = { targetProvider?: string; targetBusiness?: string; defaultService?: string };

export function RequestForm({ targetProvider, targetBusiness, defaultService = "" }: RequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string>();
  const [error, setError] = useState<string>();
  const [fileCount, setFileCount] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(undefined);
    const form = new FormData(event.currentTarget);
    if (targetProvider) form.set("targetProvider", targetProvider);
    if (targetBusiness) form.set("targetBusiness", targetBusiness);
    try { const response = await fetch("/api/leads", { method: "POST", body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "No pudimos enviar tu solicitud."); setSuccess(data.id); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Ocurrió un error."); }
    finally { setLoading(false); }
  }

  if (success) return <div className={styles.requestSuccess} role="status"><CheckCircle2 size={36} aria-hidden /><p className="eyebrow">Listo</p><h2>Recibimos tu solicitud</h2><p>Tu folio es <strong>{success}</strong>. No necesitas una cuenta; Tequit la revisará y la persona indicada podrá contactarte.</p></div>;

  return <form onSubmit={submit} className={styles.requestForm}>
    <fieldset className={styles.formSection}><legend><span>01</span> Necesidad</legend><div className={styles.fieldGroup}><label htmlFor="requestedService">¿Qué servicio buscas?</label><input className="field" id="requestedService" name="requestedService" defaultValue={defaultService} placeholder="Ej. Plomero para una tubería rota" required minLength={3}/></div><div className={styles.fieldGroup}><label htmlFor="description">Describe lo que necesitas</label><textarea className="field" id="description" name="description" placeholder="Incluye medidas, el problema o el resultado que buscas" required minLength={10}/><p className="help">No incluyas datos sensibles en la descripción.</p></div></fieldset>
    <fieldset className={styles.formSection}><legend><span>02</span> Ubicación y tiempo</legend><div className={styles.twoColumns}><div className={styles.fieldGroup}><label htmlFor="zone">Zona en Tepic</label><input className="field" id="zone" name="zone" placeholder="Ej. Ciudad del Valle" required/></div><div className={styles.fieldGroup}><label htmlFor="timing">¿Cuándo lo necesitas?</label><select className="field" id="timing" name="timing" defaultValue="Esta semana"><option>Lo antes posible</option><option>Esta semana</option><option>Este mes</option><option>Estoy cotizando</option></select></div></div></fieldset>
    <fieldset className={styles.formSection}><legend><span>03</span> Evidencia <small>Opcional</small></legend><label className={styles.fileDropzone} htmlFor="photos"><Camera size={28} aria-hidden /><strong>{fileCount ? `${fileCount} ${fileCount === 1 ? "foto seleccionada" : "fotos seleccionadas"}` : "Agrega hasta 4 fotos"}</strong><span>JPG, PNG o WebP; máximo 5 MB cada una</span></label><input className={styles.visuallyHiddenInput} id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFileCount(Math.min(event.target.files?.length ?? 0, 4))}/></fieldset>
    <fieldset className={styles.formSection}><legend><span>04</span> Contacto</legend><div className={styles.twoColumns}><div className={styles.fieldGroup}><label htmlFor="customerName">Nombre completo</label><input className="field" id="customerName" name="customerName" autoComplete="name" required/></div><div className={styles.fieldGroup}><label htmlFor="customerPhone">WhatsApp o teléfono</label><input className="field" id="customerPhone" name="customerPhone" inputMode="tel" autoComplete="tel" placeholder="311 000 0000" required/></div></div><div className={styles.fieldGroup}><label htmlFor="customerEmail">Correo <span className="muted">(opcional)</span></label><input className="field" id="customerEmail" name="customerEmail" type="email" autoComplete="email"/></div></fieldset>
    <div className={styles.privacyNotice}><LockKeyhole size={20} aria-hidden /><p><strong>Tu información no es pública.</strong> Tequit la comparte sólo con la persona o negocio indicado, o la revisa para ayudarte a encontrar opciones.</p></div>{error&&<p className="error" role="alert">{error} Conservamos tus datos para que puedas intentar de nuevo.</p>}<button className="btn btn-primary btn-block" disabled={loading} type="submit">{loading?<Loader2 className="animate-spin" aria-hidden/>:<Send size={18} aria-hidden/>}{loading?"Enviando…":"Enviar solicitud"}</button>
  </form>;
}
