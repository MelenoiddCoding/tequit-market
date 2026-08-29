import { ClipboardList, Eye, MessageCircle, MousePointerClick } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-shell";
import { DashboardPageHeader, DashboardSection, MetricGrid, MetricItem, dashboardStyles as styles } from "@/components/dashboard-components";
import { getDailyViews,getDashboardContext,getDashboardMetrics } from "@/lib/dashboard";

export default async function StatsPage() {
  const context=await getDashboardContext();const[metrics,values]=await Promise.all([getDashboardMetrics(context),getDailyViews(context)]);
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Rendimiento" title="Estadísticas" description="Entiende cómo encuentran tu perfil y cuántas personas intentan contactarte." action={<div className={styles.period} aria-label="Periodo"><button type="button">7 días</button><button className={styles.periodActive} type="button">30 días</button></div>} />
    <MetricGrid><MetricItem icon={Eye} label="Vistas" value={metrics.views} note="Últimos 30 días" /><MetricItem icon={MessageCircle} label="WhatsApp" value={metrics.whatsapp} note="Contactos iniciados" /><MetricItem icon={ClipboardList} label="Solicitudes" value={metrics.leads} note="Solicitudes recibidas" /><MetricItem icon={MousePointerClick} label="Conversión" value={`${metrics.conversion}%`} note="Vistas a WhatsApp" /></MetricGrid>
    <DashboardSection title="Vistas del perfil" description="Tendencia diaria durante los últimos 30 días."><div className={styles.chart} role="img" aria-label="Tendencia de vistas con crecimiento durante el periodo">{values.map((value, index) => <span className={styles.bar} style={{ height: `${value}%` }} key={index} />)}</div></DashboardSection>
    <DashboardSection title="Búsquedas que trajeron visitas" description="Esta métrica se acumulará conforme las personas encuentren tu perfil."><p className={styles.help}>Todavía no hay términos suficientes para mostrar una tendencia confiable.</p></DashboardSection>
  </DashboardContent>;
}
