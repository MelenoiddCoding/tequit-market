import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { ProfileEditor } from "@/components/profile-editor";
import { getDashboardContext } from "@/lib/dashboard";

export default async function ProfileEditPage() {
  const context=await getDashboardContext();const entity=context.entity;const profession=context.kind==="provider"?context.entity.profession:context.entity.category;const bio=context.kind==="provider"?context.entity.bio:context.entity.description;
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Información pública" title="Mi perfil" description="Mantén claros tus datos, zonas de trabajo y forma de contacto." />
    <ProfileEditor kind={context.kind} id={entity.id} name={entity.name} profession={profession} bio={bio} zone={entity.zone} phone={entity.phone} publicHref={context.kind==="provider"?`/p/${entity.slug}`:`/n/${entity.slug}`} rating={entity.rating} reviewCount={entity.reviewCount}/>
  </DashboardContent>;
}
