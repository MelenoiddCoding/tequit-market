import { Link2, Star } from "lucide-react";
import { providers } from "@/lib/demo-data";
import { DashboardContent } from "@/components/dashboard-shell";
import { DashboardPageHeader, DashboardSection, MetricGrid, MetricItem, StatusBadge, dashboardStyles as styles } from "@/components/dashboard-components";

export default function ReviewsPage() {
  const reviews = providers[0].reviews.filter((review) => review.status === "approved");
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Reputación" title="Reseñas" description="Consulta las reseñas aprobadas y solicita opinión a clientes anteriores." />
    <MetricGrid><MetricItem icon={Star} label="Rating general" value="4.8" note="Sólo reseñas aprobadas" /><MetricItem label="Reseñas" value="23" note="Publicadas en tu perfil" /><MetricItem icon={Link2} label="Enlaces pendientes" value="1" note="Aún no utilizado" /><MetricItem label="Última reseña" value="4 ago" note="María G. · 5 estrellas" /></MetricGrid>
    <DashboardSection title="Reseñas aprobadas" description="Estas opiniones son visibles en tu perfil público.">
      <div>{reviews.map((review) => <article className={styles.review} key={review.id}><header className={styles.reviewHeader}><div><strong>{review.author}</strong><div className={styles.stars} aria-label={`${review.rating} de 5 estrellas`}>{"★".repeat(review.rating)}</div></div><div><StatusBadge>Aprobada</StatusBadge><br /><time dateTime={review.date}>{new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${review.date}T12:00:00`))}</time></div></header><p>{review.comment}</p></article>)}</div>
    </DashboardSection>
    <DashboardSection title="Pide una reseña" description="Genera un enlace único para una persona a la que ya le hayas realizado un trabajo." action={<button className={styles.primary} type="button"><Link2 size={17} />Generar enlace</button>}><p className={styles.help}>Tequit revisa las reseñas antes de publicarlas. El enlace no garantiza su aprobación.</p></DashboardSection>
  </DashboardContent>;
}
