import {ResetPasswordForm} from "@/components/recovery-forms";
import {SiteContainer} from "@/components/layout-primitives";
import styles from "@/components/identity-redesign.module.css";
export const metadata={title:"Nueva contraseña"};
export default function ResetPage(){return <main className={styles.authPage}><SiteContainer size="reading"><header className={styles.authHeader}><p className="eyebrow">Acceso Tequit</p><h1>Define una contraseña nueva</h1></header><div className={styles.formSurface}><ResetPasswordForm/></div></SiteContainer></main>}
