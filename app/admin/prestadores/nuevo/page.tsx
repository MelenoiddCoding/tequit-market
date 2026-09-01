import {AdminShell} from "@/components/admin-shell";
import {AssistedOnboardingWizard} from "@/components/assisted-onboarding-wizard";
import {requireRole} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";

export default async function NewProviderPage(){
  await requireRole(["admin"]);const admin=createAdminClient()!;
  const{data}=await admin.from("canonical_services").select("id,name,service_categories(name)").eq("active",true).order("name");
  const services=(data??[]).map(item=>({id:item.id,name:item.name,category:item.service_categories?.[0]?.name??"Servicios"}));
  return <AdminShell><AssistedOnboardingWizard kind="provider" canonicalServices={services}/></AdminShell>;
}
