import Link from "next/link";
import { Building2,ClipboardList,ExternalLink,MessageSquareText,Users } from "lucide-react";
import { ModerationAction,PlanAction,PlanRequestAction,PublicationAction } from "@/components/admin-actions";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/logout-button";
import { DashboardPageHeader,DashboardSection,MetricGrid,MetricItem,StatusBadge,dashboardStyles as styles } from "@/components/dashboard-components";
import { requireRole } from "@/lib/auth";
import { getBusinesses,getProviders } from "@/lib/marketplace";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage(){
  await requireRole(["admin"]);
  const [providers,businesses]=await Promise.all([getProviders({includeInactive:true}),getBusinesses({includeInactive:true})]);
  const admin=createAdminClient()!;
  const [{count:leadCount},{data:pendingReviews},{data:planRequests}]=await Promise.all([
    admin.from("leads").select("id",{count:"exact",head:true}),
    admin.from("reviews").select("id,customer_name,rating,comment").eq("status","pending").order("created_at"),
    admin.from("plan_requests").select("id,note,created_at,provider_profiles(name),businesses(name)").eq("status","pending").order("created_at"),
  ]);
  const metrics=[{Icon:Users,label:"Prestadores",value:providers.length},{Icon:Building2,label:"Negocios",value:businesses.length},{Icon:ClipboardList,label:"Solicitudes",value:leadCount??0},{Icon:MessageSquareText,label:"Reseñas pendientes",value:pendingReviews?.length??0}];
  return <div className={styles.adminFrame}>
    <header className={styles.adminHeader}><div className={styles.adminHeaderInner}><Link className={styles.adminBrand} href="/" aria-label="Tequit — Inicio"><BrandLogo variant="horizontal" priority/><span className={styles.adminContext}>Administración Tequit</span></Link><nav className={styles.adminNav} aria-label="Administración"><a href="#resumen">Resumen</a><a href="#prestadores">Prestadores</a><a href="#negocios">Negocios</a><a href="#moderacion">Moderación</a><Link href="/"><ExternalLink size={16}/>Ver sitio público</Link><LogoutButton className={styles.ghost}/></nav><LogoutButton className={`${styles.ghost} ${styles.adminMobileLogout}`}/></div></header>
    <main className={styles.adminContent}><div className={styles.stack}>
      <DashboardPageHeader eyebrow="Operación Tequit" title="Panel administrativo" description="Supervisa publicaciones, planes, solicitudes Pro y reseñas pendientes."/>
      <section id="resumen"><MetricGrid>{metrics.map(({Icon,label,value})=><MetricItem icon={Icon} label={label} value={value} key={label}/>)}</MetricGrid></section>
      <DashboardSection title="Prestadores y planes" description="Suspensión rápida y asignación manual de plan durante la beta." className={styles.surface}><div id="prestadores"><table className={styles.table}><thead><tr><th>Prestador</th><th>Estado</th><th>Plan</th><th>Acción</th></tr></thead><tbody>{providers.map(provider=><tr key={provider.id}><td data-label="Prestador"><Link href={`/p/${provider.slug}`}>{provider.name}</Link><span className={styles.help}>{provider.profession}{provider.isDemo?" · Muestra":""}</span></td><td data-label="Estado"><StatusBadge>{provider.status}</StatusBadge></td><td data-label="Plan"><PlanAction id={provider.id} initial={provider.plan}/></td><td data-label="Acción"><PublicationAction id={provider.id} kind="provider" initial={provider.status}/></td></tr>)}</tbody></table></div></DashboardSection>
      <DashboardSection title="Negocios" description="Publicación y suspensión de fichas comerciales." className={styles.surface}><div id="negocios"><table className={styles.table}><thead><tr><th>Negocio</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{businesses.map(business=><tr key={business.id}><td data-label="Negocio"><Link href={`/n/${business.slug}`}>{business.name}</Link><span className={styles.help}>{business.category}{business.isDemo?" · Muestra":""}</span></td><td data-label="Estado"><StatusBadge>{business.status}</StatusBadge></td><td data-label="Acción"><PublicationAction id={business.id} kind="business" initial={business.status}/></td></tr>)}</tbody></table></div></DashboardSection>
      <DashboardSection title="Solicitudes Pro" description="No hay cobros: el administrador decide manualmente." className={styles.surface}>{planRequests?.length?planRequests.map(request=><article className={styles.listRow} key={request.id}><div><StatusBadge tone="warning">Pendiente</StatusBadge><h3>{request.provider_profiles?.[0]?.name??request.businesses?.[0]?.name??"Perfil"}</h3><p>{request.note||"Sin nota adicional."}</p></div><PlanRequestAction id={request.id}/></article>):<p className={styles.help}>No hay solicitudes Pro pendientes.</p>}</DashboardSection>
      <DashboardSection title="Moderación de reseñas" description="Las reseñas pendientes no se muestran públicamente hasta tomar una decisión." className={styles.surface}><div id="moderacion">{pendingReviews?.length?pendingReviews.map(review=><article className={styles.listRow} key={review.id}><div><StatusBadge tone="warning">Pendiente</StatusBadge><h3>{review.customer_name} · {review.rating}/5</h3><p>{review.comment}</p></div><ModerationAction id={review.id}/></article>):<p className={styles.help}>No hay reseñas pendientes.</p>}</div></DashboardSection>
      <DashboardSection title="Taxonomía" description="Categorías canónicas disponibles para servicios y búsqueda." className={styles.surface}><div id="taxonomia" className={styles.categoryList}>{["Construcción","Plomería","Electricidad","Electrodomésticos","Climatización","Hogar","Eventos"].map(category=><span className={styles.category} key={category}>{category}</span>)}</div></DashboardSection>
    </div></main>
  </div>;
}
