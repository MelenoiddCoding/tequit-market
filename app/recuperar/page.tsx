import {RequestRecoveryForm} from "@/components/recovery-forms";
import {SiteContainer} from "@/components/layout-primitives";
import styles from "@/components/identity-redesign.module.css";
export const metadata={title:"Recuperar acceso"};
export default function RecoveryPage(){return <main className={styles.authPage}><SiteContainer size="reading"><header className={styles.authHeader}><p className="eyebrow">Acceso Tequit</p><h1>Recupera tu contraseña</h1><p>Esta opción funciona únicamente si confirmaste un correo de recuperación.</p></header><div className={styles.formSurface}><RequestRecoveryForm/></div></SiteContainer></main>}
