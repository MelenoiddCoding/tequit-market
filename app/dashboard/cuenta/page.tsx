import Link from "next/link";
import { AccountManager } from "@/components/account-manager";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { ProfileEditor } from "@/components/profile-editor";
import { ContactPreferences } from "@/components/contact-preferences";
import styles from "@/components/dashboard-redesign.module.css";
import { requireSession } from "@/lib/auth";
import { getDashboardContext } from "@/lib/dashboard";

export default async function ProviderAccountPage() {
  const [session, context] = await Promise.all([
    requireSession(),
    getDashboardContext(),
  ]);
  const entity = context.entity;
  const profession =
    context.kind === "provider"
      ? context.entity.profession
      : context.entity.category;
  const bio =
    context.kind === "provider"
      ? context.entity.bio
      : context.entity.description;
  const publicHref =
    context.kind === "provider" ? `/p/${entity.slug}` : `/n/${entity.slug}`;
  return (
    <DashboardContent>
      <DashboardPageHeader
        eyebrow="Modo Prestador"
        title="Cuenta"
        description="Administra tu identidad, perfil público y acceso desde un solo lugar."
        action={
          <Link className={styles.secondary} href="/">
            Cambiar a modo Usuario
          </Link>
        }
      />
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Datos de la cuenta</h2>
            <p>Estos datos identifican tu acceso a Tequit.</p>
          </div>
        </div>
        <div className={styles.surface}>
          <p>
            <strong>Correo:</strong> {session.user.email}
          </p>
          <p>
            <strong>Celular:</strong> {session.profile?.phone ?? entity.phone}
          </p>
        </div>
      </section>
      {context.kind === "provider" && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Contacto público</h2>
              <p>Decide cómo pueden contactarte desde tu sitio.</p>
            </div>
          </div>
          <div className={styles.surface}>
            <ContactPreferences
              providerId={context.entity.id}
              initial={Boolean(context.entity.showPhoneCall)}
            />
          </div>
        </section>
      )}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Mi perfil público</h2>
            <p>La información que verán quienes buscan tus servicios.</p>
          </div>
        </div>
        <ProfileEditor
          kind={context.kind}
          id={entity.id}
          name={entity.name}
          profession={profession}
          bio={bio}
          zone={entity.zone}
          phone={entity.phone}
          publicHref={publicHref}
          rating={entity.rating}
          reviewCount={entity.reviewCount}
        />
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Seguridad</h2>
            <p>Cambia tu contraseña o elimina tu cuenta.</p>
          </div>
        </div>
        <div className={styles.surface}>
          <AccountManager />
        </div>
      </section>
    </DashboardContent>
  );
}
