import {notFound} from "next/navigation";
import {AdminShell} from "@/components/admin-shell";
import {AssistedInitial,AssistedOnboardingWizard} from "@/components/assisted-onboarding-wizard";
import {requireRole} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";

export default async function ResumeAssistedPage({params}:{params:Promise<{id:string}>}){await requireRole(["admin"]);const{id}=await params;const admin=createAdminClient()!;const{data:onboarding}=await admin.from("assisted_onboardings").select("*").eq("id",id).maybeSingle();if(!onboarding)notFound();const entityId=onboarding.provider_id??onboarding.business_id;const kind=onboarding.kind as "provider"|"business";
  const [{data:canonical},{data:entity},{data:serviceRows},{data:areaRows},{data:verificationRows},{data:site}]=await Promise.all([
    admin.from("canonical_services").select("id,name,service_categories(name)").eq("active",true).order("name"),
    kind==="provider"?admin.from("provider_profiles").select("name,phone,profession,zone,bio,slug").eq("id",entityId).single():admin.from("businesses").select("name,phone,zone,address,description,slug,service_categories(name)").eq("id",entityId).single(),
    admin.from(kind==="provider"?"provider_services":"business_services").select("canonical_service_id,title,description").eq(kind==="provider"?"provider_id":"business_id",entityId).order("created_at"),
    admin.from(kind==="provider"?"provider_service_areas":"business_service_areas").select("service_areas(name)").eq(kind==="provider"?"provider_id":"business_id",entityId),
    admin.from(kind==="provider"?"provider_verifications":"business_verifications").select("type,note").eq(kind==="provider"?"provider_id":"business_id",entityId),
    kind==="provider"?admin.from("provider_site_settings").select("headline,years_experience").eq("provider_id",entityId).maybeSingle():Promise.resolve({data:null}),
  ]);
  if(!entity)notFound();const row=entity as unknown as {name:string;phone:string;profession?:string;zone:string;bio?:string;address?:string;description?:string;slug:string;service_categories?:{name:string}[]};
  const initial:AssistedInitial={id:onboarding.id,entityId,slug:row.slug,status:onboarding.status,name:row.name,phone:row.phone,profession:kind==="provider"?row.profession??"":row.service_categories?.[0]?.name??"Servicios",zone:row.zone,address:row.address??"",source:onboarding.source,bio:kind==="provider"?row.bio??"":row.description??"",headline:site?.headline??"",yearsExperience:site?.years_experience??null,areas:(areaRows??[]).map(item=>item.service_areas?.[0]?.name).filter((value):value is string=>Boolean(value)),services:(serviceRows??[]).map(item=>({canonicalId:item.canonical_service_id,title:item.title,description:item.description})),verifications:(verificationRows??[]).map(item=>({type:item.type,note:item.note??"Confirmado durante el alta asistida"})),consentConfirmed:onboarding.consent_confirmed,consentNote:onboarding.consent_note??"",duplicateReviewed:onboarding.duplicate_reviewed,duplicateNote:onboarding.duplicate_note??""};
  const services=(canonical??[]).map(item=>({id:item.id,name:item.name,category:item.service_categories?.[0]?.name??"Servicios"}));return <AdminShell><AssistedOnboardingWizard kind={kind} canonicalServices={services} initial={initial}/></AdminShell>;
}
