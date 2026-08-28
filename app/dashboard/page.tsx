import Link from "next/link";
import { ClipboardList, Eye, MessageCircle, MousePointerClick } from "lucide-react";
import { CompletionAlert, DashboardPageHeader, DashboardSection, MetricGrid, MetricItem, StatusBadge, dashboardStyles as styles } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";

const leads = [
  { title: "Concreto estampado", zone: "Ciudad del Valle", timing: "Esta semana", received: "Hoy, 10:42", status: "Nueva" },
  { title: "Reparar humedad en muro", zone: "Centro", timing: "Este mes", received: "Ayer", status: "Vista" },
];

export default function DashboardPage() {
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Últimos 30 días" title="Hola, Juan" description="Revisa el movimiento reciente de tu perfil y lo que necesita atención." />
    <CompletionAlert title="Tu portafolio puede generar más confianza" description="Agrega al menos dos trabajos recientes para que las personas conozcan la calidad de tu oficio." action={<Link className={styles.primary} href="/dashboard/trabajos">Agregar trabajo</Link>} />
    <MetricGrid><MetricItem icon={Eye} label="Vistas del perfil" value="284" note="18% más que el periodo anterior" /><MetricItem icon={MessageCircle} label="WhatsApp" value="47" note="Contactos iniciados desde Tequit" /><MetricItem icon={ClipboardList} label="Solicitudes" value="8" note="3 nuevas por atender" /><MetricItem icon={MousePointerClick} label="Conversión" value="16.5%" note="Vistas que llegaron a WhatsApp" /></MetricGrid>
    <DashboardSection title="Por atender" description="Solicitudes recientes que requieren una decisión." action={<Link className={styles.ghost} href="/dashboard/solicitudes">Ver todas</Link>}>
      <div className={styles.list}>{leads.map((lead) => <article className={styles.listRow} key={lead.title}><div><StatusBadge tone={lead.status === "Nueva" ? "default" : "muted"}>{lead.status}</StatusBadge><h3>{lead.title}</h3><div className={styles.meta}><span>{lead.zone}</span><span>{lead.timing}</span><span>{lead.received}</span></div></div><Link className={styles.secondary} href="/dashboard/solicitudes">Abrir solicitud</Link></article>)}</div>
    </DashboardSection>
  </DashboardContent>;
}
