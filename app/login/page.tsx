import Link from "next/link";
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
    <SiteContainer size="reading" className={styles.loginShell}>
      <div className={styles.loginMain}>
        <header className={styles.loginHeader}>
          <p className="eyebrow">Tu cuenta Tequit</p>
          <h1>Inicia sesión</h1>
          <p>Ingresa tu celular y contraseña para continuar.</p>
        </header>
        <div className={styles.loginSurface}>
          <LoginForm next={safeNext} demo={demo} sessionExpired={reason === "expired"} />
          {demo && <div className={styles.demoBox}><strong>Modo demo</strong><br />Prestador: provider@tequit.local<br />Negocio: business@tequit.local<br />Administración: admin@tequit.local<br />Contraseña: Tequit123!</div>}
        </div>
        <div className={styles.loginLinks}>
          <p>¿No tienes cuenta? <Link href="/registro">Crear cuenta</Link></p>
          <Link href="/buscar">Explorar sin iniciar sesión</Link>
        </div>
      </div>
    </SiteContainer>
  </main>;
}
