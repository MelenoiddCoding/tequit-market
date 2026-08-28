"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { providers } from "@/lib/demo-data";
import { dashboardStyles as styles, DashboardSection } from "@/components/dashboard-components";

type ManagedService = (typeof providers)[number]["services"][number] & { active?: boolean };

export function ServiceManager() {
  const [items, setItems] = useState<ManagedService[]>(providers[0].services.map((service) => ({ ...service, active: true })));
  const [error, setError] = useState("");
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (items.length >= 5) { setError("Llegaste al límite de 5 servicios del plan Free."); return; }
    const form = event.currentTarget; const name = String(new FormData(form).get("name") ?? "").trim();
    const response = await fetch("/api/provider/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, plan: "free", activeCount: items.length }) });
    const body = await response.json(); if (!response.ok) { setError(body.error); return; }
    setItems([...items, { id: body.id, slug: body.id, name, category: "Otro", active: true }]); form.reset();
  }
  function toggle(id: string) { setItems((current) => current.map((item) => item.id === id ? { ...item, active: !item.active } : item)); }
  return <>
    <div className={styles.counter}><div><strong>{items.length} de 5 servicios usados</strong><p>El plan Free permite publicar hasta cinco servicios.</p></div><div className={styles.progress} aria-label={`${items.length} de 5 servicios usados`}><span style={{ width: `${Math.min(items.length / 5 * 100, 100)}%` }} /></div></div>
    <DashboardSection title="Servicios publicados" description="Desactiva temporalmente un servicio sin eliminarlo.">
      <div>{items.map((service) => <article className={styles.serviceRow} key={service.id}><div><h3>{service.name}</h3><div className={styles.meta}><span>{service.category}</span><span>{service.active ? "Visible en búsqueda" : "Oculto del perfil"}</span></div></div><div className={styles.serviceActions}><span className={styles.help}>{service.active ? "Activo" : "Inactivo"}</span><button className={`${styles.toggle} ${service.active ? "" : styles.toggleOff}`} type="button" onClick={() => toggle(service.id)} aria-label={`${service.active ? "Desactivar" : "Activar"} ${service.name}`} aria-pressed={service.active} /></div></article>)}</div>
    </DashboardSection>
    <DashboardSection title="Agregar servicio" description="Usa un nombre que una persona buscaría, por ejemplo “Concreto estampado”.">
      <form className={`${styles.surface} ${styles.form}`} onSubmit={add}><div className={styles.fieldGroup}><label htmlFor="service-name">Nombre del servicio</label><input className={styles.field} id="service-name" name="name" placeholder="Ej. Concreto estampado" minLength={3} required /></div><footer className={styles.formFooter}><button className={styles.primary} type="submit"><Plus size={18} />Agregar servicio</button></footer>{error && <aside className={styles.alert} role="alert"><div className={styles.alertCopy}><strong>{error}</strong><p>Tu profesión y capacidades continúan visibles.</p></div><Link className={styles.secondary} href="/dashboard/plan">Conocer el plan</Link></aside>}</form>
    </DashboardSection>
  </>;
}
