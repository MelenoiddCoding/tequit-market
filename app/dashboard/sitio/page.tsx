import {CheckCircle2,Circle,ExternalLink} from "lucide-react";
import {DashboardPageHeader} from "@/components/dashboard-components";
import {DashboardContent} from "@/components/dashboard-shell";
import {ProviderShareTools} from "@/components/provider-share-tools";
import {ProviderSiteEditor} from "@/components/provider-site-editor";
import {getDashboardContext} from "@/lib/dashboard";
import styles from "@/components/dashboard-redesign.module.css";

export default async function ProviderSiteDashboard(){
  const context=await getDashboardContext();
  if(context.kind!=="provider")return <DashboardContent><DashboardPageHeader title="Sitio público" description="Esta función está disponible para perfiles de prestador."/></DashboardContent>;
  const provider=context.entity;const checks=[provider.seo.checks.bio,provider.seo.checks.phone,provider.seo.checks.service,provider.seo.checks.portfolio];const labels=["Presentación de 120 caracteres","WhatsApp válido","Servicio con descripción","Trabajo con foto y descripción"];
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Promoción" title="Mi sitio" description="Completa, comparte y posiciona tu página profesional." action={<a className={styles.secondary} href={`/p/${provider.slug}`} target="_blank">Abrir sitio <ExternalLink size={16}/></a>}/>
    <section className={styles.surface}><h2>Estado de indexación</h2><p className={styles.help}>{provider.seo.eligible?"Tu sitio cumple los mínimos para aparecer en Google.":"Tu sitio funciona y se puede compartir; completa lo pendiente para enviarlo a buscadores."}</p><div className={styles.list}>{labels.map((label,index)=><div className={styles.listRow} key={label}><span>{checks[index]?<CheckCircle2 color="var(--color-success)" aria-hidden/>:<Circle color="var(--color-text-muted)" aria-hidden/>}{label}</span><strong>{checks[index]?"Listo":"Pendiente"}</strong></div>)}</div></section>
    <section className={styles.surface}><h2>Compartir sitio</h2><p className={styles.help}>Comparte una imagen cuadrada con tu QR, nombre, especialidad y enlace. El QR registra las visitas que genera.</p><ProviderShareTools slug={provider.slug} name={provider.name} subtitle={provider.profession}/></section>
    <ProviderSiteEditor provider={provider}/>
  </DashboardContent>;
}
