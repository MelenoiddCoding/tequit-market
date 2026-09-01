import Link from "next/link";
import { BadgeCheck, Heart, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { SiteContainer } from "@/components/layout-primitives";
import { getSessionProfile } from "@/lib/auth";
import styles from "@/components/identity-redesign.module.css";

export const metadata = {
  title: "Iniciar sesión",
  description: "Accede a Tequit con tu número de celular.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string }> }) {
  const session = await getSessionProfile();
  if (session) {
    if (session.profile?.must_change_password) redirect("/cuenta?password=required");
    if (session.roles.includes("admin")) redirect("/admin");
    redirect("/cuenta");
  }
  const { next, reason } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/cuenta";
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return <main className={styles.authPage}>
    <SiteContainer className={styles.authShell}>
      <div className={styles.authMain}>
        <header className={styles.authHeader}>
          <p className="eyebrow">Tu cuenta Tequit</p>
          <h1>Bienvenido de vuelta</h1>
          <p>Entra con tu celular y contraseña. Si tu cuenta todavía usaba correo, podrás migrarla al acceder.</p>
        </header>
        <div className={styles.formSurface}>
          <LoginForm next={safeNext} demo={demo} sessionExpired={reason === "expired"} />
          {demo && <div className={styles.demoBox}><strong>Modo demo</strong><br />Prestador: provider@tequit.local<br />Negocio: business@tequit.local<br />Administración: admin@tequit.local<br />Contraseña: Tequit123!</div>}
          <div className={styles.exploreBox}>
            <p>¿Todavía no publicas en Tequit?</p>
            <Link className="btn btn-secondary" href="/registro">Crear perfil</Link>
          </div>
        </div>
        <p className={styles.authFooterLink}>¿Sólo buscas ayuda? <Link className="text-link" href="/buscar">Explora sin cuenta</Link></p>
      </div>
      <aside className={styles.authAside} aria-label="Tequit sin cuenta">
        <Search size={30} color="var(--verified)" aria-hidden />
        <h2>Buscar no pide registro</h2>
        <ul className={styles.benefitList}>
          <li><Search size={20} aria-hidden /><span>Explora personas y negocios de Tepic.</span></li>
          <li><Heart size={20} aria-hidden /><span>Guarda opciones en este dispositivo.</span></li>
          <li><BadgeCheck size={20} aria-hidden /><span>Compara verificaciones y reseñas antes de contactar.</span></li>
        </ul>
      </aside>
    </SiteContainer>
  </main>;
}
