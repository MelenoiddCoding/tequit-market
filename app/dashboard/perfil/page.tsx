import Link from "next/link";
import { providers } from "@/lib/demo-data";
import { DashboardPageHeader, StatusBadge, dashboardStyles as styles } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";

export default function ProfileEditPage() {
  const provider = providers[0];
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Información pública" title="Mi perfil" description="Mantén claros tus datos, zonas de trabajo y forma de contacto." action={<Link className={styles.secondary} href={`/p/${provider.slug}`}>Ver perfil público</Link>} />
    <div className={styles.split}>
      <form className={`${styles.surface} ${styles.form}`}>
        <div className={styles.formSection}><div><StatusBadge>Publicado</StatusBadge><p className={styles.help}>Los cambios se reflejan en tu perfil público después de guardarlos.</p></div></div>
        <section className={styles.formSection}><h2>Identidad y oficio</h2><div className={styles.formGrid}><div className={styles.fieldGroup}><label htmlFor="name">Nombre</label><input className={styles.field} id="name" defaultValue={provider.name} /></div><div className={styles.fieldGroup}><label htmlFor="profession">Profesión</label><input className={styles.field} id="profession" defaultValue={provider.profession} /></div><div className={`${styles.fieldGroup} ${styles.full}`}><label htmlFor="bio">Sobre mí</label><textarea className={styles.textarea} id="bio" defaultValue={provider.bio} maxLength={500} /><span className={styles.help}>Describe tu experiencia y el tipo de trabajos que realizas.</span></div></div></section>
        <section className={styles.formSection}><h2>Zona y contacto</h2><div className={styles.formGrid}><div className={styles.fieldGroup}><label htmlFor="zone">Zonas donde trabajas</label><input className={styles.field} id="zone" defaultValue={provider.zone} /></div><div className={styles.fieldGroup}><label htmlFor="phone">WhatsApp</label><input className={styles.field} id="phone" inputMode="tel" defaultValue="311 000 0000" /><span className={styles.help}>Este número se usa en el botón de contacto.</span></div></div></section>
        <footer className={styles.formFooter}><span className={styles.savedNote}>Sin cambios pendientes</span><button className={styles.primary} type="button">Guardar cambios</button></footer>
      </form>
      <aside className={`${styles.surface} ${styles.preview} ${styles.sticky}`}><span className={styles.previewAvatar}>JP</span><div><p className={styles.eyebrow}>Vista previa</p><h2>{provider.name}</h2><strong>{provider.profession}</strong></div><p>{provider.bio}</p><div className={styles.meta}><span>{provider.zone}</span><span>{provider.rating} · {provider.reviewCount} reseñas</span></div><Link className={styles.secondary} href={`/p/${provider.slug}`}>Abrir perfil completo</Link></aside>
    </div>
  </DashboardContent>;
}
