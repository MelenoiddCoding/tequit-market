import { ServiceManager } from "@/components/service-manager";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";
import { ProviderCategoryManager } from "@/components/provider-category-manager";
import { getProviderTaxonomy } from "@/lib/taxonomy";

export default async function ServicesDashboard() {
  const context = await getDashboardContext();
  const taxonomy = context.kind === "provider" ? await getProviderTaxonomy() : [];
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
      {context.kind === "provider" && <ProviderCategoryManager providerId={context.entity.id} categories={taxonomy} initialPrimaryId={context.entity.primaryCategory?.id ?? ""} initialSecondaryIds={(context.entity.categories ?? []).filter((category) => category.role === "secondary").map((category) => category.id)}/>}
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
