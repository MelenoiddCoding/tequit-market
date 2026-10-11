import {AdminShell} from "@/components/admin-shell";
import {AssistedOnboardingWizard} from "@/components/assisted-onboarding-wizard";
import {requireRole} from "@/lib/auth";
import {getProviderTaxonomy} from "@/lib/taxonomy";
import {getDiscoveryAreas} from "@/lib/location-server";

export default async function NewProviderPage(){
  await requireRole(["admin"]);const [taxonomy,areas]=await Promise.all([getProviderTaxonomy(),getDiscoveryAreas()]);
  return <AdminShell><AssistedOnboardingWizard kind="provider" canonicalServices={[]} providerCategories={taxonomy} discoveryAreas={areas}/></AdminShell>;
}
