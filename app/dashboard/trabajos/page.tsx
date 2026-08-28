import Image from "next/image";
import { Camera, ImagePlus } from "lucide-react";
import { DashboardPageHeader, DashboardSection, dashboardStyles as styles } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";

export default function WorkPage() {
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Portafolio público" title="Trabajos" description="Muestra proyectos terminados que ayuden a entender la calidad y alcance de tu trabajo." />
    <DashboardSection title="Galería" description="1 trabajo publicado. Procura usar fotos claras y propias.">
      <div className={styles.portfolioGrid}><article className={styles.workItem}><Image src="/images/tequit-hero.png" alt="Acabado de muro color terracota" width={900} height={600} /><div className={styles.workCopy}><h3>Acabado de muro residencial</h3><p>Textura y pintura exterior en Tepic.</p></div></article></div>
    </DashboardSection>
    <DashboardSection title="Agregar trabajo" description="Completa los datos y revisa la imagen antes de publicar.">
      <form className={`${styles.surface} ${styles.form}`}><div className={styles.formGrid}><div className={`${styles.fieldGroup} ${styles.full}`}><label htmlFor="work-title">Título</label><input className={styles.field} id="work-title" placeholder="Ej. Piso de cochera terminado" /></div><div className={`${styles.fieldGroup} ${styles.full}`}><label htmlFor="work-description">Descripción</label><textarea className={styles.textarea} id="work-description" placeholder="Cuenta brevemente qué trabajo realizaste." /></div><div className={`${styles.fieldGroup} ${styles.full}`}><label className={styles.upload} htmlFor="work-photo"><ImagePlus size={28} aria-hidden="true" /><strong>Seleccionar foto</strong><span className={styles.help}>JPG, PNG o WebP · máximo 8 MB</span></label><input id="work-photo" type="file" accept="image/jpeg,image/png,image/webp" hidden /></div></div><footer className={styles.formFooter}><button className={styles.primary} type="button"><Camera size={18} />Guardar trabajo</button></footer></form>
    </DashboardSection>
  </DashboardContent>;
}
