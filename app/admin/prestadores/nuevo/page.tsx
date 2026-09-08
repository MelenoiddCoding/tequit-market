import {AdminShell} from "@/components/admin-shell";
import {AssistedOnboardingWizard} from "@/components/assisted-onboarding-wizard";
import {requireRole} from "@/lib/auth";
import {getProviderTaxonomy} from "@/lib/taxonomy";

export default async function NewProviderPage(){
  await requireRole(["admin"]);const taxonomy=await getProviderTaxonomy();
  return <AdminShell><AssistedOnboardingWizard kind="provider" canonicalServices={[]} providerCategories={taxonomy}/></AdminShell>;
}
