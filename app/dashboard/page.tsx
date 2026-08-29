import Link from "next/link";
import { ClipboardList, Eye, MessageCircle, MousePointerClick } from "lucide-react";
import { CompletionAlert, DashboardPageHeader, DashboardSection, MetricGrid, MetricItem, StatusBadge, dashboardStyles as styles } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { getDashboardContext,getDashboardLeads,getDashboardMetrics } from "@/lib/dashboard";

export default async function DashboardPage() {
  const context=await getDashboardContext();const[leads,metrics]=await Promise.all([getDashboardLeads(context),getDashboardMetrics(context)]);
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Últimos 30 días" title={`Hola, ${context.entity.name.split(" ")[0]}`} description="Revisa el movimiento reciente de tu perfil y lo que necesita atención." />
    <CompletionAlert title="Tu portafolio puede generar más confianza" description="Agrega al menos dos trabajos recientes para que las personas conozcan la calidad de tu oficio." action={<Link className={styles.primary} href="/dashboard/trabajos">Agregar trabajo</Link>} />
    <MetricGrid><MetricItem icon={Eye} label="Vistas del perfil" value={metrics.views} note="Últimos 30 días" /><MetricItem icon={MessageCircle} label="WhatsApp" value={metrics.whatsapp} note="Contactos iniciados desde Tequit" /><MetricItem icon={ClipboardList} label="Solicitudes" value={metrics.leads} note={`${leads.filter((lead)=>lead.status==="nueva").length} nuevas por atender`} /><MetricItem icon={MousePointerClick} label="Conversión" value={`${metrics.conversion}%`} note="Vistas que llegaron a WhatsApp" /></MetricGrid>
    <DashboardSection title="Por atender" description="Solicitudes recientes que requieren una decisión." action={<Link className={styles.ghost} href="/dashboard/solicitudes">Ver todas</Link>}>
      <div className={styles.list}>{leads.slice(0,3).map((lead) => <article className={styles.listRow} key={lead.id}><div><StatusBadge tone={lead.status === "nueva" ? "default" : "muted"}>{lead.status}</StatusBadge><h3>{lead.requested_service_text}</h3><div className={styles.meta}><span>{lead.zone}</span><span>{lead.desired_timing}</span><span>{new Intl.DateTimeFormat("es-MX").format(new Date(lead.created_at))}</span></div></div><Link className={styles.secondary} href="/dashboard/solicitudes">Abrir solicitud</Link></article>)}</div>
    </DashboardSection>
  </DashboardContent>;
}
