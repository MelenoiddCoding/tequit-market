import { ClipboardList, Eye, MessageCircle, MousePointerClick } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-shell";
import { DashboardPageHeader, DashboardSection, MetricGrid, MetricItem, dashboardStyles as styles } from "@/components/dashboard-components";

const values = [34, 47, 39, 72, 51, 63, 84, 66, 88, 73, 96, 81];
export default function StatsPage() {
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Rendimiento" title="Estadísticas" description="Entiende cómo encuentran tu perfil y cuántas personas intentan contactarte." action={<div className={styles.period} aria-label="Periodo"><button type="button">7 días</button><button className={styles.periodActive} type="button">30 días</button></div>} />
    <MetricGrid><MetricItem icon={Eye} label="Vistas" value="284" note="18% más que antes" /><MetricItem icon={MessageCircle} label="WhatsApp" value="47" note="Contactos iniciados" /><MetricItem icon={ClipboardList} label="Solicitudes" value="8" note="3 nuevas" /><MetricItem icon={MousePointerClick} label="Conversión" value="16.5%" note="Vistas a WhatsApp" /></MetricGrid>
    <DashboardSection title="Vistas del perfil" description="Tendencia diaria durante los últimos 30 días."><div className={styles.chart} role="img" aria-label="Tendencia de vistas con crecimiento durante el periodo">{values.map((value, index) => <span className={styles.bar} style={{ height: `${value}%` }} key={index} />)}</div></DashboardSection>
    <DashboardSection title="Búsquedas que trajeron visitas" description="Términos escritos antes de abrir tu perfil."><div className={styles.terms}>{[["albañil",82],["pegar piso",61],["enjarre",33],["construcción de muros",19]].map(([term, total]) => <div className={styles.term} key={term}><span>{term}</span><strong>{total} visitas</strong></div>)}</div></DashboardSection>
  </DashboardContent>;
}
