import {redirect} from "next/navigation";
import {BrandLogo} from "@/components/brand-logo";
import {LoginForm} from "@/components/login-form";
import {SiteContainer} from "@/components/layout-primitives";
import {getSessionProfile} from "@/lib/auth";
import styles from "@/components/identity-redesign.module.css";
export const metadata={title:"Acceso administrativo"};
export default async function AdminLoginPage(){const session=await getSessionProfile();if(session?.roles.includes("admin"))redirect("/admin");return <main className={styles.authPage}><SiteContainer size="reading"><header className={styles.authHeader}><BrandLogo/><p className="eyebrow">Administración Tequit</p><h1>Acceso operativo</h1><p>Las cuentas administrativas conservan acceso mediante correo y contraseña.</p></header><div className={styles.formSurface}><LoginForm next="/admin" admin/></div></SiteContainer></main>}
