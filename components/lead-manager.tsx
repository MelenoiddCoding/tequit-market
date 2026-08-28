"use client";

import { useState } from "react";
import { ArrowLeft, ImageIcon, LockKeyhole, MapPin } from "lucide-react";
import type { LeadStatus } from "@/types";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { dashboardStyles as styles, StatusBadge } from "@/components/dashboard-components";
import { cn } from "@/lib/cn";

const allowed: LeadStatus[] = ["vista", "interesado", "no_me_interesa", "contactado", "cerrada"];
const labels: Record<LeadStatus, string> = { nueva: "Nueva", vista: "Vista", interesado: "Me interesa", no_me_interesa: "No hago este trabajo", contactado: "Contactado", cerrada: "Cerrada" };
const leads = [
  { id: "TQ-DEMO", title: "Concreto estampado", zone: "Ciudad del Valle", timing: "Esta semana", status: "nueva" as LeadStatus },
  { id: "TQ-DEMO-2", title: "Reparar humedad en muro", zone: "Centro", timing: "Este mes", status: "vista" as LeadStatus },
];

export function LeadManager() {
  const [selected, setSelected] = useState(leads[0].id);
  const [status, setStatus] = useState<LeadStatus>("nueva");
  const [detailOpen, setDetailOpen] = useState(false);
  const lead = leads.find((item) => item.id === selected) ?? leads[0];
  async function update(next: LeadStatus) { const response = await fetch(`/api/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: status, to: next }) }); if (response.ok) setStatus(next); }
  function choose(id: string) { setSelected(id); setStatus(leads.find((item) => item.id === id)?.status ?? "nueva"); setDetailOpen(true); }
  return <div className={cn(styles.inbox, detailOpen && styles.inboxDetailOpen)}>
    <section className={styles.leadList} aria-label="Lista de solicitudes"><div className={styles.leadListHeader}><strong>2 solicitudes recientes</strong><p className={styles.help}>Selecciona una para revisar sus datos.</p></div>{leads.map((item) => <button className={cn(styles.leadItem, selected === item.id && styles.leadItemActive)} type="button" onClick={() => choose(item.id)} key={item.id}><div className={styles.leadItemTop}><strong>{item.title}</strong><StatusBadge tone={item.status === "nueva" ? "default" : "muted"}>{labels[item.status]}</StatusBadge></div><h3>{item.zone}</h3><p>{item.timing} · Recibida recientemente</p></button>)}</section>
    <article className={styles.leadDetail}>
      <button className={`${styles.ghost} ${styles.mobileBack}`} type="button" onClick={() => setDetailOpen(false)}><ArrowLeft size={17} />Volver a Solicitudes</button>
      <header className={styles.leadDetailHeader}><div><p className={styles.eyebrow}>Solicitud {lead.id}</p><h2>{lead.title}</h2></div><StatusBadge>{labels[status]}</StatusBadge></header>
      <div className={styles.leadBody}><p>Quiero hacer una cochera de aproximadamente 35 m². Ya tiene firme, pero necesito revisar si soporta el acabado.</p></div>
      <div className={styles.meta}><span><MapPin size={15} aria-hidden="true" /> {lead.zone}</span><span>{lead.timing}</span><span><ImageIcon size={15} aria-hidden="true" /> 3 fotos privadas</span></div>
      <div><p className={styles.eyebrow}>Cliente</p><strong>Mariana López</strong><p className={styles.help}>311 000 0000</p></div>
      <div><p className={styles.eyebrow}>Estado</p><div className={styles.statusControl}>{allowed.map((item) => <button className={cn(styles.statusButton, status === item && styles.statusButtonActive)} type="button" key={item} onClick={() => update(item)}>{labels[item]}</button>)}</div></div>
      <p className={styles.privateNotice}><LockKeyhole size={17} aria-hidden="true" />Los datos y fotografías de la persona sólo son visibles para ti y el equipo administrador.</p>
      <WhatsAppButton phone="5213110000000" message="Hola Mariana, te contacto por la solicitud que hiciste en Tequit sobre concreto estampado." label="Contactar al cliente por WhatsApp" className={styles.whatsapp} />
    </article>
  </div>;
}
