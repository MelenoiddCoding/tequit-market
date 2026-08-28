import { LeadManager } from "@/components/lead-manager";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";

export default function LeadsPage() {
  return <DashboardContent><DashboardPageHeader eyebrow="Contacto directo" title="Solicitudes" description="Revisa cada necesidad, decide si puedes realizarla y contacta por WhatsApp." /><LeadManager /></DashboardContent>;
}
