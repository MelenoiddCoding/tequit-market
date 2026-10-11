import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AssistedInitial } from "@/components/assisted-onboarding-wizard";
import type { Provider } from "@/types";
import { getProviderPlan } from "@/lib/plans";
import {cityFromZone,emptyProviderLocation} from "@/lib/provider-location";

export async function getSiteProfileInitial(provider:Provider):Promise<AssistedInitial> {
  const admin=createAdminClient()!;
  const [{data:record,error},{data:verifications,error:verificationError},plan,{data:locationRow}]=await Promise.all([
    admin.from("assisted_onboardings").select("*").eq("provider_id",provider.id).order("created_at").limit(1).maybeSingle(),
    admin.from("provider_verifications").select("type,note").eq("provider_id",provider.id),
    getProviderPlan(provider.id),
    admin.from("provider_locations").select("market_city_slug").eq("provider_id",provider.id).maybeSingle(),
  ]);
  if(error || verificationError) throw new Error("No se pudo cargar la información de la página.");
  return {
    id:record?.id??"",entityId:provider.id,slug:provider.slug,status:record?.status??"claimed",
    name:provider.name,phone:provider.phone,profession:provider.profession,zone:provider.zone,address:"",
    source:record?.source??"whatsapp",bio:provider.bio,headline:provider.site.headline,
    yearsExperience:provider.site.yearsExperience??null,areas:provider.areas,
    services:provider.services.map(s=>({id:s.id,canonicalId:null,title:s.name,description:s.description??""})),
    verifications:(verifications??[]).map(v=>({type:v.type,note:v.note??""})),
    consentConfirmed:record?.consent_confirmed??false,consentNote:record?.consent_note??"",
    duplicateReviewed:record?.duplicate_reviewed??false,duplicateNote:record?.duplicate_note??"",
    primaryCategoryId:provider.primaryCategory?.id,
    location:locationRow?.market_city_slug?{...emptyProviderLocation(locationRow.market_city_slug==="uruapan"?"uruapan":"tepic"),source:"existing",coverageCities:[...new Set([locationRow.market_city_slug==="uruapan"?"uruapan" as const:"tepic" as const,...provider.areas.filter(area=>area==="Tepic"||area==="Uruapan").map(area=>area==="Uruapan"?"uruapan" as const:"tepic" as const)])]}:emptyProviderLocation(cityFromZone(provider.zone)),
    secondaryCategoryIds:provider.categories?.filter(c=>c.role==="secondary").map(c=>c.id)??[],
    portfolioLimit:plan.entitlements.maxPortfolioItems??10,
    media:{avatar:provider.avatarImage,cover:provider.site.coverImage,portfolio:provider.portfolio.map(p=>p.image)},
  };
}
