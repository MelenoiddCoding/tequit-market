import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { ProfileEditor } from "@/components/profile-editor";
import { getDashboardContext } from "@/lib/dashboard";
import { getDiscoveryAreas } from "@/lib/location-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProviderLocationSettings } from "@/components/provider-location-settings";
import {cityFromZone,emptyProviderLocation,isMarketCity} from "@/lib/provider-location";

export default async function ProfileEditPage() {
  const context=await getDashboardContext();
  const entity=context.entity;
  const profession=context.kind==="provider"?context.entity.profession:context.entity.category;
  const bio=context.kind==="provider"?context.entity.bio:context.entity.description;
  const areas=context.kind==="provider"?await getDiscoveryAreas():[];
  const admin=createAdminClient();
  const location=context.kind==="provider"&&admin?(await admin.from("provider_locations").select("market_city_slug").eq("provider_id",entity.id).maybeSingle()).data:null;
  const city=location?.market_city_slug==="uruapan"?"uruapan":cityFromZone(entity.zone);
  const coverageRows=context.kind==="provider"&&admin?(await admin.from("provider_service_areas").select("service_areas(slug,area_type)").eq("provider_id",entity.id)).data:[];
  const coverage=(coverageRows??[]).flatMap(item=>{const area=item.service_areas as unknown as {slug:string;area_type:string}|null;return area?.area_type==="municipality"&&isMarketCity(area.slug)?[area.slug]:[]});
  const locationInitial=location?.market_city_slug?{...emptyProviderLocation(city),source:"existing" as const,coverageCities:[...new Set([city,...coverage])]}:emptyProviderLocation(city);
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Información pública" title="Mi perfil" description="Mantén claros tus datos, zonas de trabajo y forma de contacto." />
    <ProfileEditor kind={context.kind} id={entity.id} name={entity.name} profession={profession} bio={bio} zone={entity.zone} phone={entity.phone} publicHref={context.kind==="provider"?`/u/${entity.slug}`:`/n/${entity.slug}`} rating={entity.rating} reviewCount={entity.reviewCount} locationSettings={context.kind==="provider"?<ProviderLocationSettings providerId={entity.id} areas={areas} initial={locationInitial}/>:undefined}/>
  </DashboardContent>;
}
