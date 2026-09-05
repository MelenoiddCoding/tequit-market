import { LeadManager } from "@/components/lead-manager";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { getDashboardContext, getDashboardLeads } from "@/lib/dashboard";
import Link from "next/link";
import {
  DashboardSection,
  dashboardStyles as styles,
} from "@/components/dashboard-components";

export default async function LeadsPage() {
  const context = await getDashboardContext();
  if (
    context.kind === "provider" &&
    !context.planDetails.entitlements.leadInbox
  )
    return (
      <DashboardContent>
        <DashboardPageHeader
          eyebrow="Función Pro"
          title="Solicitudes dirigidas"
          description="El contacto por WhatsApp o llamada sigue disponible en tu sitio."
        />
        <DashboardSection
          title="Activa la bandeja de solicitudes"
          description="Con Pro, tus visitantes pueden enviarte una necesidad detallada y tú responder fuera de Tequit."
        >
          <Link className={styles.primary} href="/dashboard/plan">
            Ver planes
          </Link>
        </DashboardSection>
      </DashboardContent>
    );
  const leads = await getDashboardLeads(context);
  return (
    <DashboardContent>
      <DashboardPageHeader
        eyebrow="Contacto directo"
        title="Solicitudes"
        description="Revisa cada necesidad, decide si puedes realizarla y contacta por WhatsApp."
      />
      <LeadManager initialLeads={leads} />
    </DashboardContent>
  );
}
