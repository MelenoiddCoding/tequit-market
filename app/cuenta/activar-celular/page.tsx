import {redirect} from "next/navigation";
import {Phone,ShieldCheck} from "lucide-react";
import {ActivatePhoneForm} from "@/components/activate-phone-form";
import {SiteContainer} from "@/components/layout-primitives";
import {getSessionProfile} from "@/lib/auth";
import styles from "@/components/identity-redesign.module.css";

export const metadata={title:"Activa tu celular"};
export default async function ActivatePhonePage({searchParams}:{searchParams:Promise<{next?:string}>}){const session=await getSessionProfile();if(!session)redirect("/login");if(session.roles.includes("admin"))redirect("/admin");if(session.profile?.phone_login_enabled_at)redirect("/cuenta");const{next}=await searchParams;return <main className={styles.authPage}><SiteContainer className={styles.authShell}><div className={styles.authMain}><header className={styles.authHeader}><p className="eyebrow">Actualización de acceso</p><h1>Entra con tu celular</h1><p>Tu cuenta y tus datos siguen iguales. Sólo cambiaremos el identificador que usarás al iniciar sesión.</p></header><div className={styles.formSurface}><ActivatePhoneForm defaultPhone={session.profile?.phone??""} next={next}/></div></div><aside className={styles.authAside}><ShieldCheck size={30}/><h2>Tu celular sigue siendo privado</h2><p>No se publicará ni sustituirá el WhatsApp que muestras a clientes. Hasta integrar OTP aparecerá como pendiente de verificar.</p><Phone size={44}/></aside></SiteContainer></main>}
