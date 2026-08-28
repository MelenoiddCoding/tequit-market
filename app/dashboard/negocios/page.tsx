import Link from "next/link";
import { Building2, Link2 } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-shell";
import { DashboardPageHeader, DashboardSection, StatusBadge, dashboardStyles as styles } from "@/components/dashboard-components";

export default function BusinessMembershipPage() {
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Relaciones opcionales" title="Negocios" description="Administra afiliaciones visibles y consulta el estado de negocios relacionados contigo." />
    <DashboardSection title="Afiliaciones" description="Una afiliación muestra que colaboras con un negocio; cada perfil conserva su reputación.">
      <article className={`${styles.surface} ${styles.businessBlock}`}><span className={styles.businessIcon}><Link2 size={23} aria-hidden="true" /></span><div><StatusBadge>Activa</StatusBadge><h3>Concretos Estampados de Nayarit</h3><p className={styles.help}>Aparece en tu perfil como afiliación. Sus reseñas y rating no se transfieren al tuyo.</p></div><Link className={styles.secondary} href="/n/concretos-estampados-de-nayarit">Ver negocio público</Link></article>
    </DashboardSection>
    <DashboardSection title="Mis negocios" description="Todavía no tienes un negocio registrado con esta cuenta.">
      <article className={`${styles.surface} ${styles.businessBlock}`}><span className={styles.businessIcon}><Building2 size={23} aria-hidden="true" /></span><div><h3>Registra un negocio local</h3><p className={styles.help}>El registro de negocios se habilitará en una siguiente etapa. Puedes dejarnos tu interés desde ahora.</p></div><button className={styles.primary} type="button">Comenzar registro</button></article>
    </DashboardSection>
  </DashboardContent>;
}
