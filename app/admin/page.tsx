import Link from "next/link";
import { Building2, ClipboardList, ExternalLink, MessageSquareText, Users } from "lucide-react";
import { ModerationAction, PlanAction } from "@/components/admin-actions";
import { businesses, providers } from "@/lib/demo-data";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/logout-button";
import { DashboardPageHeader, DashboardSection, MetricGrid, MetricItem, StatusBadge, dashboardStyles as styles } from "@/components/dashboard-components";
const metrics=[{Icon:Users,label:"Prestadores",value:providers.length},{Icon:Building2,label:"Negocios",value:businesses.length},{Icon:ClipboardList,label:"Solicitudes",value:8},{Icon:MessageSquareText,label:"Reseñas pendientes",value:1}];
export default function AdminPage() {
  return <div className={styles.adminFrame}>
    <header className={styles.adminHeader}><div className={styles.adminHeaderInner}><Link className={styles.adminBrand} href="/" aria-label="Tequit — Inicio"><BrandLogo variant="horizontal" priority /><span className={styles.adminContext}>Administración Tequit</span></Link><nav className={styles.adminNav} aria-label="Administración"><a href="#resumen">Resumen</a><a href="#prestadores">Prestadores y planes</a><a href="#moderacion">Moderación de reseñas</a><a href="#taxonomia">Taxonomía</a><Link href="/"><ExternalLink size={16} />Ver sitio público</Link><LogoutButton className={styles.ghost} /></nav><LogoutButton className={`${styles.ghost} ${styles.adminMobileLogout}`} /></div></header>
    <main className={styles.adminContent}><div className={styles.stack}>
      <DashboardPageHeader eyebrow="Operación Tequit" title="Panel administrativo" description="Supervisa prestadores, planes, reseñas pendientes y la taxonomía pública." />
      <section id="resumen"><MetricGrid>{metrics.map(({Icon,label,value}) => <MetricItem icon={Icon} label={label} value={value} key={label} />)}</MetricGrid></section>
      <DashboardSection title="Prestadores y planes" description="Cuentas activas y asignación de plan durante el piloto." className={styles.surface}><div id="prestadores"><table className={styles.table}><thead><tr><th>Prestador</th><th>Estado</th><th>Plan</th><th>Verificaciones</th></tr></thead><tbody>{providers.slice(0,6).map((provider) => <tr key={provider.id}><td data-label="Prestador"><Link href={`/p/${provider.slug}`}>{provider.name}</Link><span className={styles.help}>{provider.profession}</span></td><td data-label="Estado"><StatusBadge>{provider.status === "active" ? "Activo" : provider.status}</StatusBadge></td><td data-label="Plan"><PlanAction /></td><td data-label="Verificaciones">{provider.verifications.length}</td></tr>)}</tbody></table></div></DashboardSection>
      <DashboardSection title="Moderación de reseñas" description="Las reseñas pendientes no se muestran públicamente hasta tomar una decisión." className={styles.surface}><article id="moderacion" className={styles.listRow}><div><StatusBadge tone="warning">Pendiente</StatusBadge><h3>Demo pendiente · 1/5</h3><p>Esta reseña permanece oculta mientras se revisa su contenido.</p></div><ModerationAction /></article></DashboardSection>
      <DashboardSection title="Taxonomía" description="Categorías canónicas disponibles para organizar servicios y búsqueda." className={styles.surface}><div id="taxonomia" className={styles.categoryList}>{["Construcción","Plomería","Electricidad","Electrodomésticos","Climatización","Hogar","Eventos"].map((category) => <span className={styles.category} key={category}>{category}</span>)}</div></DashboardSection>
    </div></main>
  </div>;
}
