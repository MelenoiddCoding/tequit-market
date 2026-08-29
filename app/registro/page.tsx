import Link from "next/link";
import { BadgeCheck, HeartHandshake, MessagesSquare } from "lucide-react";
import { RegisterForm } from "@/components/register-form";
import { SiteContainer } from "@/components/layout-primitives";
import styles from "@/components/identity-redesign.module.css";

export const metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de Tequit y añade un perfil de prestador cuando lo necesites.",
};

export default function RegisterPage() {
  return <main className={styles.authPage}>
    <SiteContainer className={styles.authShell}>
      <div className={styles.authMain}>
        <header className={styles.authHeader}>
          <p className="eyebrow">Tu cuenta Tequit</p>
          <h1>Busca, guarda y solicita</h1>
          <p>La cuenta de Usuario es el punto de partida. Si quieres promocionarte, puedes crear tu perfil de prestador ahora o después.</p>
        </header>
        <RegisterForm />
        <p className={styles.authFooterLink}>¿Ya tienes cuenta? <Link className="text-link" href="/login">Inicia sesión</Link></p>
      </div>
      <aside className={styles.authAside} aria-label="Lo que puedes hacer en Tequit">
        <BadgeCheck size={30} color="var(--verified)" aria-hidden />
        <h2>Tu oficio, bien presentado</h2>
        <ul className={styles.benefitList}>
          <li><BadgeCheck size={20} aria-hidden /><span>Publica servicios y evidencia de trabajos reales.</span></li>
          <li><MessagesSquare size={20} aria-hidden /><span>Recibe solicitudes y responde directamente por WhatsApp.</span></li>
          <li><HeartHandshake size={20} aria-hidden /><span>Construye confianza con información clara y reseñas aprobadas.</span></li>
        </ul>
      </aside>
    </SiteContainer>
  </main>;
}
