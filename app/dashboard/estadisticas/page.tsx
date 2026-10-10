import Link from "next/link";
import { Eye, MessageCircle, Phone } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-shell";
import {
  DashboardPageHeader,
  DashboardSection,
  MetricGrid,
  MetricItem,
  dashboardStyles as styles,
} from "@/components/dashboard-components";
import { TrafficReport } from "@/components/traffic-report";
import {
  getDashboardContext,
  getDashboardMetrics,
  getDailyViews,
} from "@/lib/dashboard";
import { getWebsiteAccess } from "@/lib/website-access";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const context = await getDashboardContext(),
    days = (await searchParams).days === "7" ? 7 : 30;
  const website =
    context.kind === "provider"
      ? await getWebsiteAccess(context.entity.id)
      : null;
  if (
    context.kind === "provider" &&
    context.planDetails.entitlements.analyticsLevel === "none" &&
    !website?.active
  )
    return (
      <DashboardContent>
        <DashboardPageHeader
          title="Estadísticas"
          description="La actividad continúa registrándose. Las métricas están incluidas con un sitio activo o un plan desde Básico."
        />
        <Link className={styles.primary} href="/dashboard/plan">
          Ver mi plan
        </Link>
      </DashboardContent>
    );
  const [metrics, trend] = await Promise.all([
    getDashboardMetrics(context, days),
    getDailyViews(context, days),
  ]);
  const attribution =
    website?.active ||
    (context.kind === "provider" &&
      context.planDetails.entitlements.analyticsLevel === "advanced");
  return (
    <DashboardContent>
      <DashboardPageHeader
        title="Estadísticas"
        description="Visitas y clics de contacto; no representan ventas ni ganancias confirmadas."
        action={
          <div className={styles.period}>
            <Link
              aria-current={days === 7 ? "page" : undefined}
              className={days === 7 ? styles.periodActive : undefined}
              href="?days=7"
            >
              7 días
            </Link>
            <Link
              aria-current={days === 30 ? "page" : undefined}
              className={days === 30 ? styles.periodActive : undefined}
              href="?days=30"
            >
              30 días
            </Link>
          </div>
        }
      />
      <MetricGrid>
        <MetricItem
          icon={Eye}
          label="Vistas de páginas"
          value={metrics.views}
          note={`Últimos ${days} días`}
        />
        <MetricItem
          icon={MessageCircle}
          label="Clics WhatsApp"
          value={metrics.whatsapp}
          note="Intentos de contacto"
        />
        <MetricItem
          icon={Phone}
          label="Clics llamar"
          value={metrics.phoneCalls}
          note="Intentos de llamada"
        />
      </MetricGrid>
      <DashboardSection
        title="Visitas por día"
        description={`Actividad durante los últimos ${days} días.`}
      >
        <div
          className={styles.chart}
          role="img"
          aria-label={`Tendencia de visitas de ${days} días`}
        >
          {trend.map((value, index) => (
            <span
              className={styles.bar}
              style={{ height: `${value}%` }}
              key={index}
            />
          ))}
        </div>
      </DashboardSection>
      {context.kind === "provider" && attribution && (
        <TrafficReport providerId={context.entity.id} days={days} />
      )}
    </DashboardContent>
  );
}
