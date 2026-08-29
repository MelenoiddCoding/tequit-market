import { LeadManager } from "@/components/lead-manager";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { getDashboardContext,getDashboardLeads } from "@/lib/dashboard";

export default async function LeadsPage() {
  const context=await getDashboardContext();const leads=await getDashboardLeads(context);
  return <DashboardContent><DashboardPageHeader eyebrow="Contacto directo" title="Solicitudes" description="Revisa cada necesidad, decide si puedes realizarla y contacta por WhatsApp." /><LeadManager initialLeads={leads} /></DashboardContent>;
}
