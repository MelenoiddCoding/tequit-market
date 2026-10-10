import Link from "next/link";
import {notFound} from "next/navigation";
import {AdminShell} from "@/components/admin-shell";
import {ProviderSiteEditor} from "@/components/provider-site-editor";
import {ProviderSite} from "@/components/provider-site";
import {WebsiteProfileForm} from "@/components/website-profile-form";
import {WebsiteMedia} from "@/components/website-media";
import {WebsiteProfilePublication} from "@/components/website-publication";
import {TrafficReport} from "@/components/traffic-report";
import {WebsiteOrderControls} from "@/components/website-order-controls";
import {AssistedOnboardingActions} from "@/components/assisted-onboarding-actions";
import {dashboardStyles as ui} from "@/components/dashboard-components";
import {requireRole} from "@/lib/auth";
import {getProviders} from "@/lib/marketplace";
import {getProviderTaxonomy} from "@/lib/taxonomy";
import {getSiteProfileInitial} from "@/lib/admin-site";
import {getWebsiteAccess} from "@/lib/website-access";
import {createAdminClient} from "@/lib/supabase/admin";
import styles from "@/components/website-workspace.module.css";
const sections=[['datos','Datos y servicios'],['contenido','Contenido y tema'],['fotos','Fotografías'],['vista','Vista previa'],['publicacion','Publicación y entrega']] as const;
export default async function Page({params,searchParams}:{params:Promise<{providerId:string}>;searchParams:Promise<{seccion?:string}>}) {
 await requireRole(["admin"]);
 const id=(await params).providerId;
 if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 const [provider]=(await getProviders({includeInactive:true,id}));
 if(!provider)notFound();
 const selected=(await searchParams).seccion;
 const section=sections.some(([key])=>key===selected)?selected:'contenido';
 const [initial,categories,access]=await Promise.all([getSiteProfileInitial(provider),getProviderTaxonomy(),getWebsiteAccess(id)]);
 const {data:orders,error}=section==='publicacion'?await createAdminClient()!.from('website_orders').select('id,status,amount_mxn,duration_months,ends_at').eq('provider_id',id).order('created_at',{ascending:false}).limit(30):{data:null,error:null};
 return <AdminShell><div className={styles.workspace}>
  <header className={styles.header}><div><Link href="/admin/sitios">← Páginas</Link><h1>{provider.name}</h1><p>{access.active?'Sitio publicado':'Sitio sin publicación activa'}{access.endsAt?` · Vigencia hasta ${new Date(access.endsAt).toLocaleDateString('es-MX')}`:''}</p></div><div className={styles.actions}>{access.active&&<Link className={ui.secondary} href={`/p/${provider.slug}`} target="_blank">Abrir sitio</Link>}<Link className={ui.ghost} href="/tu-pagina/ejemplos" target="_blank">Ver temas</Link></div></header>
  <nav className={styles.tabs} aria-label="Preparación de la página">{sections.map(([key,label])=><Link key={key} href={`?seccion=${key}`} aria-current={section===key?'page':undefined}>{label}</Link>)}</nav>
  <div className={section==='vista'?styles.preview:styles.body}>
   {section==='datos'&&<WebsiteProfileForm key={provider.updatedAt} initial={initial} categories={categories}/>}
   {section==='contenido'&&<ProviderSiteEditor key={provider.updatedAt} provider={provider} adminMode workspace/>}
   {section==='fotos'&&<WebsiteMedia provider={provider} onboardingId={initial.id} limit={initial.portfolioLimit??5}/>}
   {section==='vista'&&<ProviderSite provider={provider} customBranding preview/>}
   {section==='publicacion'&&<div className={styles.workspace}>
    <section className={styles.section}><h2>Publicación</h2>{provider.status==='draft'?<WebsiteProfilePublication id={initial.id}/>:provider.status==='suspended'?<p>La ficha está suspendida. Revisa su situación antes de publicar.</p>:<p>La ficha ya está publicada en Tequit. El sitio tiene su propia vigencia.</p>}<p className={styles.note}>Guarda el contenido y revisa la vista previa antes de publicar. El periodo del sitio comienza al activar un pedido pagado.</p></section>
    {error?<p role="alert">No se pudieron cargar los pedidos.</p>:<><section className={styles.section}><h2>Pago y vigencia</h2>{!orders?.some(o=>['pending','paid'].includes(o.status))&&<WebsiteOrderControls providerId={id} renewal={access.source==='purchase'}/>}</section>{orders?.map(o=><section className={styles.section} key={o.id}><h3>{{pending:'Pendiente de pago',paid:'Pagado; listo para publicar',published:'Publicado',cancelled:'Cancelado'}[o.status as 'pending']??o.status} · ${o.amount_mxn} MXN</h3><p>{o.duration_months} meses{o.ends_at?` · Vence ${new Date(o.ends_at).toLocaleDateString('es-MX')}`:''}</p><WebsiteOrderControls orderId={o.id} status={o.status}/></section>)}</>}
    <details><summary>Actividad del sitio</summary><TrafficReport providerId={id}/></details>
    <section className={styles.section}><h2>Entrega y acceso</h2>{access.active&&<Link href={`/p/${provider.slug}`} target="_blank">Ver página publicada</Link>}{provider.status==='active'&&<Link href={`/u/${provider.slug}`} target="_blank">Ver ficha en Tequit</Link>}{initial.id&&<AssistedOnboardingActions id={initial.id} status={initial.status} detail/>}</section>
   </div>}
  </div>
 </div></AdminShell>;
}
