import Link from "next/link";
import { Building2, Link2 } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-shell";
import { DashboardPageHeader, DashboardSection, StatusBadge, dashboardStyles as styles } from "@/components/dashboard-components";
import { getDashboardContext } from "@/lib/dashboard";

export default async function BusinessMembershipPage() {
  const context=await getDashboardContext();const isProvider=context.kind==="provider";
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Relaciones opcionales" title="Negocios" description="Administra afiliaciones visibles y consulta el estado de negocios relacionados contigo." />
    <DashboardSection title="Afiliaciones" description="Una afiliación muestra que colaboras con un negocio; cada perfil conserva su reputación.">
      {isProvider&&context.entity.businessSlug?<article className={`${styles.surface} ${styles.businessBlock}`}><span className={styles.businessIcon}><Link2 size={23} aria-hidden="true" /></span><div><StatusBadge>Activa</StatusBadge><h3>{context.entity.businessName}</h3><p className={styles.help}>Aparece en tu perfil como afiliación. Sus reseñas y rating no se transfieren al tuyo.</p></div><Link className={styles.secondary} href={`/n/${context.entity.businessSlug}`}>Ver negocio público</Link></article>:<p className={styles.help}>No hay afiliaciones activas.</p>}
    </DashboardSection>
    <DashboardSection title="Mis negocios" description="Todavía no tienes un negocio registrado con esta cuenta.">
      {!isProvider?<article className={`${styles.surface} ${styles.businessBlock}`}><span className={styles.businessIcon}><Building2 size={23} aria-hidden="true" /></span><div><StatusBadge>Publicado</StatusBadge><h3>{context.entity.name}</h3><p className={styles.help}>Administra su ficha desde Mi perfil y sus servicios desde Catálogo.</p></div><Link className={styles.secondary} href={`/n/${context.entity.slug}`}>Ver negocio público</Link></article>:<article className={`${styles.surface} ${styles.businessBlock}`}><span className={styles.businessIcon}><Building2 size={23} aria-hidden="true" /></span><div><h3>¿También administras un negocio?</h3><p className={styles.help}>Crea una cuenta separada de negocio para mantener miembros y permisos claros.</p></div><Link className={styles.primary} href="/registro">Registrar negocio</Link></article>}
    </DashboardSection>
  </DashboardContent>;
}
