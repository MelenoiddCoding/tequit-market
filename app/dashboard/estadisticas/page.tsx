import {
  ClipboardList,
  Eye,
  MessageCircle,
  MousePointerClick,
  Phone,
  Share2,
} from "lucide-react";
import { DashboardContent } from "@/components/dashboard-shell";
import {
  DashboardPageHeader,
  DashboardSection,
  MetricGrid,
  MetricItem,
  dashboardStyles as styles,
} from "@/components/dashboard-components";
import {
  getDailyViews,
  getDashboardContext,
  getDashboardMetrics,
  getProviderSiteSources,
} from "@/lib/dashboard";
export default async function StatsPage() {
  const context = await getDashboardContext();
  if (
    context.kind === "provider" &&
    context.planDetails.entitlements.analyticsLevel === "none"
  )
    return (
      <DashboardContent>
        <DashboardPageHeader
          eyebrow="Disponible desde Básico"
          title="Estadísticas"
          description="Tu sitio sigue registrando actividad; sube de plan para consultar métricas."
        />
        <DashboardSection
          title="Conoce el rendimiento de tu perfil"
          description="Básico muestra vistas y contactos. Pro añade fuentes, solicitudes y conversión."
        >
          <p className={styles.help}>
            Tu actividad continúa registrándose mientras decides.
          </p>
        </DashboardSection>
      </DashboardContent>
    );
  const [metrics, values, sources] = await Promise.all([
    getDashboardMetrics(context),
    getDailyViews(context),
    getProviderSiteSources(context),
  ]);
  const advanced =
    context.kind !== "provider" ||
    context.planDetails.entitlements.analyticsLevel === "advanced";
  return (
    <DashboardContent>
      <DashboardPageHeader
        eyebrow="Rendimiento"
        title="Estadísticas"
        description="Entiende cómo encuentran tu perfil y cuántas personas intentan contactarte."
        action={
          <div className={styles.period} aria-label="Periodo">
            <button type="button">7 días</button>
            <button className={styles.periodActive} type="button">
              30 días
            </button>
          </div>
        }
      />
      <MetricGrid>
        <MetricItem
          icon={Eye}
          label="Vistas"
          value={metrics.views}
          note="Últimos 30 días"
        />
        <MetricItem
          icon={MessageCircle}
          label="WhatsApp"
          value={metrics.whatsapp}
          note="Contactos iniciados"
        />
        <MetricItem
          icon={Phone}
          label="Llamadas"
          value={metrics.phoneCalls}
          note="Llamadas iniciadas"
        />
        {advanced && (
          <MetricItem
            icon={ClipboardList}
            label="Solicitudes"
            value={metrics.leads}
            note="Solicitudes recibidas"
          />
        )}
        {advanced && (
          <MetricItem
            icon={MousePointerClick}
            label="Conversión"
            value={`${metrics.conversion}%`}
            note="Vistas a WhatsApp"
          />
        )}
      </MetricGrid>
      <DashboardSection
        title="Vistas del perfil"
        description="Tendencia diaria durante los últimos 30 días."
      >
        <div
          className={styles.chart}
          role="img"
          aria-label="Tendencia de vistas durante el periodo"
        >
          {values.map((value, index) => (
            <span
              className={styles.bar}
              style={{ height: `${value}%` }}
              key={index}
            />
          ))}
        </div>
      </DashboardSection>
      {context.kind === "provider" && advanced && (
        <DashboardSection
          title="Fuentes del sitio"
          description="Atribución de los últimos 30 días."
        >
          <MetricGrid>
            <MetricItem
              icon={Eye}
              label="Desde QR"
              value={sources.qr}
              note="Visitas con QR"
            />
            <MetricItem
              icon={MousePointerClick}
              label="Enlaces compartidos"
              value={sources.shared}
              note="Visitas compartidas"
            />
            <MetricItem
              icon={Share2}
              label="Compartir"
              value={sources.shares}
              note="Acciones realizadas"
            />
          </MetricGrid>
        </DashboardSection>
      )}
    </DashboardContent>
  );
}
