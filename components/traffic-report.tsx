import { getTrafficSummary } from "@/lib/traffic-report";
import {
  DashboardSection,
  dashboardStyles as styles,
} from "@/components/dashboard-components";
const labels: Record<string, string> = {
  facebook: "Facebook",
  google: "Google",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  other: "Otro",
  direct_unknown: "Directo / desconocido",
  historical_unknown: "Sin atribución (histórico)",
  directory: "Directorio Tequit",
  profile: "Perfil gratuito",
  website: "Sitio web",
  business: "Negocio",
  service: "Página de servicio",
};
export async function TrafficReport({
  providerId,
  days = 30,
}: {
  providerId: string;
  days?: 7 | 30;
}) {
  const { data, error } = await getTrafficSummary(providerId, days);
  const rows = (data ?? []) as Array<{
    dimension: string;
    bucket: string;
    views: number;
    whatsapp: number;
    phone: number;
  }>;
  return (
    <DashboardSection
      title="De dónde vienen los contactos"
      description={`Últimos ${days} días. Son visitas y clics; no trabajos ni ingresos confirmados.`}
    >
      {error ? (
        <p role="alert">
          No se pudo cargar la atribución. Intenta recargar la página.
        </p>
      ) : !rows.length ? (
        <p>Aún no hay actividad en este periodo.</p>
      ) : (
        (["source", "surface", "entry"] as const).map((dimension) => (
          <section key={dimension}>
            <h3>
              {dimension === "source"
                ? "Origen externo"
                : dimension === "surface"
                  ? "Dónde ocurrió la interacción"
                  : "Dónde comenzó la visita en Tequit"}
            </h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{dimension === "source" ? "Origen" : "Página"}</th>
                  <th>Vistas</th>
                  <th>Clics WhatsApp</th>
                  <th>Clics llamar</th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((r) => r.dimension === dimension)
                  .map((r) => (
                    <tr key={r.bucket}>
                      <td data-label="Origen / página">
                        {labels[r.bucket] ?? "Desconocido"}
                      </td>
                      <td data-label="Vistas">{r.views}</td>
                      <td data-label="Clics WhatsApp">{r.whatsapp}</td>
                      <td data-label="Clics llamar">{r.phone}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        ))
      )}
      <p className={styles.help}>
        Las tablas describen la misma actividad desde perspectivas distintas: no
        sumes sus totales. Facebook se identifica por enlace etiquetado o
        referencia del navegador. Un enlace reenviado conserva su etiqueta;
        Google sólo se reconoce si el navegador informa el origen.
      </p>
    </DashboardSection>
  );
}
