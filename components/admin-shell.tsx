import Link from "next/link";
import {ExternalLink} from "lucide-react";
import {BrandLogo} from "@/components/brand-logo";
import {LogoutButton} from "@/components/logout-button";
import {dashboardStyles as styles} from "@/components/dashboard-components";

export function AdminShell({children}:{children:React.ReactNode}){return <div className={styles.adminFrame}><header className={styles.adminHeader}><div className={styles.adminHeaderInner}><Link className={styles.adminBrand} href="/admin" aria-label="Administración Tequit"><BrandLogo variant="horizontal" priority/><span className={styles.adminContext}>Administración Tequit</span></Link><nav className={styles.adminNav} aria-label="Administración"><Link href="/admin">Resumen</Link><Link href="/admin/altas">Altas asistidas</Link><Link href="/admin/prestadores/nuevo">Nuevo prestador</Link><Link href="/admin/negocios/nuevo">Nuevo negocio</Link><Link href="/"><ExternalLink size={16}/>Ver sitio</Link><LogoutButton className={styles.ghost}/></nav><LogoutButton className={`${styles.ghost} ${styles.adminMobileLogout}`}/></div></header><main className={styles.adminContent}>{children}</main></div>}
