import { Check, Info } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-shell";
import { DashboardPageHeader, StatusBadge, dashboardStyles as styles } from "@/components/dashboard-components";

const free = ["Hasta 5 servicios publicados", "Presencia en resultados de búsqueda", "Recepción de solicitudes", "Sistema de reseñas", "Métricas básicas"];
const pro = ["Servicios ilimitados", "Galería ampliada", "Estadísticas con más detalle", "Herramientas de promoción", "Más zonas de cobertura"];
export default function PlanPage() {
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Tu plan en Tequit" title="Plan Free" description="Consulta los límites actuales y las funciones previstas para Tequit Pro." />
    <aside className={styles.alert}><span className={styles.alertIcon}><Info size={21} /></span><div className={styles.alertCopy}><strong>Etapa piloto</strong><p>No hay pagos ni cobros en el producto actual. El equipo puede habilitar Pro a cuentas seleccionadas durante las pruebas.</p></div></aside>
    <div className={styles.planGrid}><section className={styles.plan}><div className={styles.planTop}><div><p className={styles.eyebrow}>Plan actual</p><h2>Free</h2></div><StatusBadge>Activo</StatusBadge></div><ul>{free.map((item) => <li key={item}><Check size={18} />{item}</li>)}</ul><button className={styles.secondary} type="button" disabled>Plan activo</button></section><section className={`${styles.plan} ${styles.planFeatured}`}><div className={styles.planTop}><div><p className={styles.eyebrow}>En preparación</p><h2>Tequit Pro</h2></div><StatusBadge tone="warning">Próximamente</StatusBadge></div><ul>{pro.map((item) => <li key={item}><Check size={18} />{item}</li>)}</ul><button className={styles.primary} type="button">Solicitar Pro</button><p className={styles.help}>Esta acción registra interés; no inicia un pago ni una suscripción.</p></section></div>
  </DashboardContent>;
}
