"use client";

import { useState } from "react";
import { ArrowLeft, ImageIcon, LockKeyhole, MapPin } from "lucide-react";
import type { LeadStatus } from "@/types";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { dashboardStyles as styles, StatusBadge } from "@/components/dashboard-components";
import { cn } from "@/lib/cn";

const allowed: LeadStatus[] = ["vista", "interesado", "no_me_interesa", "contactado", "cerrada"];
const labels: Record<LeadStatus, string> = { nueva: "Nueva", vista: "Vista", interesado: "Me interesa", no_me_interesa: "No hago este trabajo", contactado: "Contactado", cerrada: "Cerrada" };
type LeadRow={id:string;requested_service_text:string;description:string;customer_name:string;customer_phone:string;customer_email:string|null;zone:string;desired_timing:string|null;status:LeadStatus;created_at:string;lead_media:Array<{id:string;storage_path:string}>};

export function LeadManager({initialLeads}:{initialLeads:LeadRow[]}) {
  const [leads,setLeads]=useState(initialLeads);const [selected, setSelected] = useState(leads[0]?.id??"");
  const [detailOpen, setDetailOpen] = useState(false);
  const lead = leads.find((item) => item.id === selected) ?? leads[0];const status=lead?.status??"nueva";
  async function update(next: LeadStatus) { if(!lead)return;const response = await fetch(`/api/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({to: next }) }); if (response.ok) setLeads((current)=>current.map((item)=>item.id===lead.id?{...item,status:next}:item)); }
  function choose(id: string) { setSelected(id); setDetailOpen(true); }
  if(!lead)return <div className={styles.emptyState}><h2>Aún no recibes solicitudes</h2><p>Cuando alguien publique una necesidad dirigida a tu perfil aparecerá aquí.</p></div>;
  return <div className={cn(styles.inbox, detailOpen && styles.inboxDetailOpen)}>
    <section className={styles.leadList} aria-label="Lista de solicitudes"><div className={styles.leadListHeader}><strong>{leads.length} solicitudes recientes</strong><p className={styles.help}>Selecciona una para revisar sus datos.</p></div>{leads.map((item) => <button className={cn(styles.leadItem, selected === item.id && styles.leadItemActive)} type="button" onClick={() => choose(item.id)} key={item.id}><div className={styles.leadItemTop}><strong>{item.requested_service_text}</strong><StatusBadge tone={item.status === "nueva" ? "default" : "muted"}>{labels[item.status]}</StatusBadge></div><h3>{item.zone}</h3><p>{item.desired_timing} · {new Intl.DateTimeFormat("es-MX").format(new Date(item.created_at))}</p></button>)}</section>
    <article className={styles.leadDetail}>
      <button className={`${styles.ghost} ${styles.mobileBack}`} type="button" onClick={() => setDetailOpen(false)}><ArrowLeft size={17} />Volver a Solicitudes</button>
      <header className={styles.leadDetailHeader}><div><p className={styles.eyebrow}>Solicitud {lead.id}</p><h2>{lead.requested_service_text}</h2></div><StatusBadge>{labels[status]}</StatusBadge></header>
      <div className={styles.leadBody}><p>{lead.description}</p></div>
      <div className={styles.meta}><span><MapPin size={15} aria-hidden="true" /> {lead.zone}</span><span>{lead.desired_timing}</span><span><ImageIcon size={15} aria-hidden="true" /> {lead.lead_media.length} fotos privadas</span></div>
      <div><p className={styles.eyebrow}>Cliente</p><strong>{lead.customer_name}</strong><p className={styles.help}>{lead.customer_phone}{lead.customer_email?` · ${lead.customer_email}`:""}</p></div>
      <div><p className={styles.eyebrow}>Estado</p><div className={styles.statusControl}>{allowed.map((item) => <button className={cn(styles.statusButton, status === item && styles.statusButtonActive)} type="button" key={item} onClick={() => update(item)}>{labels[item]}</button>)}</div></div>
      <p className={styles.privateNotice}><LockKeyhole size={17} aria-hidden="true" />Los datos y fotografías de la persona sólo son visibles para ti y el equipo administrador.</p>
      <WhatsAppButton phone={lead.customer_phone} message={`Hola ${lead.customer_name}, te contacto por la solicitud que hiciste en Tequit sobre ${lead.requested_service_text}.`} label="Contactar al cliente por WhatsApp" className={styles.whatsapp} />
    </article>
  </div>;
}
