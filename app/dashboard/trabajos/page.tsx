import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { WorkManager } from "@/components/work-manager";
import { getDashboardContext } from "@/lib/dashboard";

export default async function WorkPage() {
  const context = await getDashboardContext();
  const initial =
    context.kind === "provider"
      ? context.entity.portfolio
      : (context.entity.portfolio ?? []);
  return (
    <DashboardContent>
      <DashboardPageHeader
        eyebrow="Portafolio público"
        title="Trabajos"
        description="Muestra proyectos terminados que ayuden a entender la calidad y alcance de tu trabajo."
      />
      <WorkManager
        kind={context.kind}
        entityId={context.entity.id}
        initial={initial}
        maxItems={
          context.kind === "provider"
            ? context.planDetails.entitlements.maxPortfolioItems
            : null
        }
      />
    </DashboardContent>
  );
}
