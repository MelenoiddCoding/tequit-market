import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { ProfileEditor } from "@/components/profile-editor";
import { getDashboardContext } from "@/lib/dashboard";
import { getDiscoveryAreas } from "@/lib/location-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProviderLocationSettings } from "@/components/provider-location-settings";

export default async function ProfileEditPage() {
  const context=await getDashboardContext();
  const entity=context.entity;
  const profession=context.kind==="provider"?context.entity.profession:context.entity.category;
  const bio=context.kind==="provider"?context.entity.bio:context.entity.description;
  const areas=context.kind==="provider"?await getDiscoveryAreas():[];
  const admin=createAdminClient();
  const location=context.kind==="provider"&&admin?(await admin.from("provider_locations").select("source,service_areas(slug)").eq("provider_id",entity.id).maybeSingle()).data as unknown as {source:string;service_areas:{slug:string}|Array<{slug:string}>|null}|null:null;
  const currentArea=Array.isArray(location?.service_areas)?location.service_areas[0]?.slug:location?.service_areas?.slug;
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Información pública" title="Mi perfil" description="Mantén claros tus datos, zonas de trabajo y forma de contacto." />
    <ProfileEditor kind={context.kind} id={entity.id} name={entity.name} profession={profession} bio={bio} zone={entity.zone} phone={entity.phone} publicHref={context.kind==="provider"?`/u/${entity.slug}`:`/n/${entity.slug}`} rating={entity.rating} reviewCount={entity.reviewCount} locationSettings={context.kind==="provider"?<ProviderLocationSettings providerId={entity.id} areas={areas} currentArea={currentArea} source={location?.source}/>:undefined}/>
  </DashboardContent>;
}
