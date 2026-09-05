import { ServiceManager } from "@/components/service-manager";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

export default async function ServicesDashboard() {
  const context = await getDashboardContext();
  const maxServices =
    context.kind === "provider"
      ? context.planDetails.entitlements.maxServices
      : null;
  return (
    <DashboardContent>
      <DashboardPageHeader
        eyebrow="Catálogo público"
        title="Servicios"
        description="Define con precisión qué trabajos realizas y cuáles aparecen en búsqueda."
      />
      <ServiceManager
        initialServices={context.entity.services}
        entityId={context.entity.id}
        kind={context.kind}
        planName={
          context.kind === "provider" ? context.planDetails.name : "Negocio"
        }
        maxServices={maxServices}
      />
    </DashboardContent>
  );
}
