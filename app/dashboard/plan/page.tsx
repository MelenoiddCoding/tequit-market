import { Check, Clock3, Info, Sparkles } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-shell";
import {
  DashboardPageHeader,
  StatusBadge,
  dashboardStyles as styles,
} from "@/components/dashboard-components";
import { PlanRequestButton } from "@/components/plan-request-button";
import { getDashboardContext } from "@/lib/dashboard";
import { PLAN_NAMES, PLAN_ORDER, PLAN_PRICES, planFromCode } from "@/lib/plans";
const features = {
  free: [
    "Sitio profesional y QR",
    "5 servicios y 5 trabajos",
    "WhatsApp y llamada opcional",
  ],
  basic: [
    "Todo lo de Free",
    "Métricas de vistas y contactos",
    "Resumen de rendimiento",
  ],
  pro: [
    "15 servicios y 10 trabajos",
    "Solicitudes dirigidas",
    "Analítica avanzada y personalización",
  ],
  premium: [
    "Servicios ilimitados",
    "Todo lo de Pro",
    "Capacidades Premium conforme se habiliten",
  ],
};
export default async function PlanPage() {
  const context = await getDashboardContext();
  if (context.kind !== "provider")
    return (
      <DashboardContent>
        <DashboardPageHeader
          eyebrow="Planes"
          title="Planes para prestadores"
          description="Los planes para negocios se definirán más adelante."
        />
      </DashboardContent>
    );
  const current = context.planDetails;
  const end = current.assignment?.endsAt;
  return (
    <DashboardContent>
      <DashboardPageHeader
        eyebrow="Tu plan en Tequit"
        title={`Plan ${current.name}`}
        description="Consulta lo que tienes disponible y la vigencia de cualquier regalo."
      />
      {current.assignment?.source === "welcome" && end && (
        <aside className={styles.alert}>
          <span className={styles.alertIcon}>
            <Sparkles />
          </span>
          <div className={styles.alertCopy}>
            <strong>Tienes {current.name} de regalo</strong>
            <p>
              Disponible hasta{" "}
              {new Intl.DateTimeFormat("es-MX", {
                dateStyle: "long",
                timeZone: "America/Mexico_City",
              }).format(new Date(end))}
              . Después pasarás a Free, sin cobros ni renovación automática.
            </p>
          </div>
        </aside>
      )}
      {!current.assignment && (
        <aside className={styles.alert}>
          <span className={styles.alertIcon}>
            <Info />
          </span>
          <div className={styles.alertCopy}>
            <strong>Plan Free activo</strong>
            <p>
              No hay pagos dentro de Tequit. El equipo puede asignar o regalar
              otros planes durante la beta.
            </p>
          </div>
        </aside>
      )}
      <div className={styles.planGrid}>
        {PLAN_ORDER.map((code) => {
          const plan = planFromCode(code, null),
            active = code === current.code;
          return (
            <section
              className={`${styles.plan} ${code === "pro" ? styles.planFeatured : ""}`}
              key={code}
            >
              <div className={styles.planTop}>
                <div>
                  <p className={styles.eyebrow}>
                    {code === "pro" ? "Más completo" : "Plan"}
                  </p>
                  <h2>{PLAN_NAMES[code]}</h2>
                  <strong>
                    {plan.price ? `$${PLAN_PRICES[code]} MXN/mes` : "Gratis"}
                  </strong>
                </div>
                {active && <StatusBadge>Activo</StatusBadge>}
              </div>
              <ul>
                {features[code].map((item) => (
                  <li key={item}>
                    <Check size={18} />
                    {item}
                  </li>
                ))}
              </ul>
              {active ? (
                <button className={styles.secondary} disabled>
                  Plan actual
                </button>
              ) : code === "free" ? (
                <button className={styles.secondary} disabled>
                  Disponible al finalizar
                </button>
              ) : (
                <PlanRequestButton
                  kind="provider"
                  entityId={context.entity.id}
                  requestedPlan={code}
                />
              )}
            </section>
          );
        })}
      </div>
      <aside className={styles.alert}>
        <span className={styles.alertIcon}>
          <Clock3 />
        </span>
        <div className={styles.alertCopy}>
          <strong>Funciones en preparación</strong>
          <p>
            Cotizaciones, órdenes PDF, clientes, matching de solicitudes
            generales, multicategoría y promociones patrocinadas todavía no
            están activas.
          </p>
        </div>
      </aside>
    </DashboardContent>
  );
}
