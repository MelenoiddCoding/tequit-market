import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import { ProviderShareTools } from "@/components/provider-share-tools";
import { ProviderSiteEditor } from "@/components/provider-site-editor";
import { getDashboardContext } from "@/lib/dashboard";
import { getWebsiteAccess } from "@/lib/website-access";
import styles from "@/components/dashboard-redesign.module.css";
export default async function Page() {
  const context = await getDashboardContext();
  if (context.kind !== "provider")
    return (
      <DashboardContent>
        <DashboardPageHeader
          title="Mi sitio"
          description="Disponible para prestadores."
        />
      </DashboardContent>
    );
  const provider = context.entity,
    access = await getWebsiteAccess(provider.id);
  return (
    <DashboardContent>
      <DashboardPageHeader
        title="Mi sitio"
        description="Tu página para compartir tus servicios. Su vigencia es independiente de Pro."
      />
      <section className={styles.surface}>
        <h2>
          {access.active ? "Sitio activo" : "Sitio sin publicación activa"}
        </h2>
        <p>
          {access.endsAt
            ? `Vigencia: ${new Date(access.endsAt).toLocaleDateString("es-MX")}`
            : access.active
              ? "Acceso existente sin vencimiento"
              : "Tu información sigue guardada y tu perfil gratuito permanece disponible."}
        </p>
        <Link className={styles.secondary} href={`/u/${provider.slug}`}>
          Ver perfil gratuito
        </Link>
        {access.active ? (
          <a
            className={styles.primary}
            href={`/p/${provider.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir sitio
          </a>
        ) : (
          <p>Tequit administra la preparación y publicación de tu sitio.</p>
        )}
      </section>
      {access.active && (
        <>
          <section className={styles.surface}>
            <h2>Compartir sitio</h2>
            <ProviderShareTools
              slug={provider.slug}
              name={provider.name}
              subtitle={provider.profession}
            />
          </section>
          <section className={styles.surface}>
            <h2>Información para buscadores</h2>
            <p>
              {provider.seo.eligible
                ? "El contenido cumple los mínimos técnicos de indexación. Google decide si lo muestra y en qué posición."
                : "El sitio puede compartirse. Completa estos datos para permitir su indexación:"}
            </p>
            <ul>
              {provider.seo.missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </>
      )}
      <ProviderSiteEditor
        provider={provider}
      />
    </DashboardContent>
  );
}
