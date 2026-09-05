import { redirect } from "next/navigation";
import { WelcomeOffer } from "@/components/welcome-offer";
import { getDashboardContext } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function WelcomePage() {
  const context = await getDashboardContext();
  if (context.kind !== "provider") redirect("/dashboard");
  const assignment = context.planDetails.assignment;
  if (!assignment || assignment.source !== "welcome" || !assignment.endsAt)
    redirect("/dashboard");
  const admin = createAdminClient();
  const { data } = await admin!
    .from("provider_profiles")
    .select("welcome_seen_assignment_id")
    .eq("id", context.entity.id)
    .single();
  if (data?.welcome_seen_assignment_id === assignment.id)
    redirect("/dashboard");
  const start = new Date(assignment.startsAt);
  const end = new Date(assignment.endsAt);
  const months = Math.max(
    1,
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
      end.getUTCMonth() -
      start.getUTCMonth(),
  );
  return (
    <WelcomeOffer
      assignmentId={assignment.id}
      endsAt={assignment.endsAt}
      months={months}
      value={context.planDetails.price * months}
      planName={context.planDetails.name}
      maxServices={context.planDetails.entitlements.maxServices}
      maxPortfolioItems={context.planDetails.entitlements.maxPortfolioItems}
      hasAdvancedAnalytics={
        context.planDetails.entitlements.analyticsLevel === "advanced"
      }
    />
  );
}
