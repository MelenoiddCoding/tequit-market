import { ServiceManager } from "@/components/service-manager";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";

export default function ServicesDashboard() {
  return <DashboardContent><DashboardPageHeader eyebrow="Catálogo público" title="Servicios" description="Define con precisión qué trabajos realizas y cuáles aparecen en búsqueda." /><ServiceManager /></DashboardContent>;
}
