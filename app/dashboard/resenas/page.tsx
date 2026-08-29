import { Link2, Star } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-shell";
import { DashboardPageHeader, DashboardSection, MetricGrid, MetricItem, StatusBadge, dashboardStyles as styles } from "@/components/dashboard-components";
import { ReviewLinkButton } from "@/components/review-link-button";
import { getDashboardContext } from "@/lib/dashboard";

export default async function ReviewsPage() {
  const context=await getDashboardContext();const reviews=context.entity.reviews.filter((review)=>review.status==="approved");
  return <DashboardContent>
    <DashboardPageHeader eyebrow="Reputación" title="Reseñas" description="Consulta las reseñas aprobadas y solicita opinión a clientes anteriores." />
    <MetricGrid><MetricItem icon={Star} label="Rating general" value={context.entity.rating} note="Sólo reseñas aprobadas" /><MetricItem label="Reseñas" value={context.entity.reviewCount} note="Publicadas en tu perfil" /><MetricItem icon={Link2} label="Enlaces" value="—" note="Genera invitaciones de un solo uso" /><MetricItem label="Última reseña" value={reviews[0]?new Intl.DateTimeFormat("es-MX",{day:"numeric",month:"short"}).format(new Date(reviews[0].date)):"—"} note={reviews[0]?.author??"Sin reseñas"} /></MetricGrid>
    <DashboardSection title="Reseñas aprobadas" description="Estas opiniones son visibles en tu perfil público.">
      <div>{reviews.map((review) => <article className={styles.review} key={review.id}><header className={styles.reviewHeader}><div><strong>{review.author}</strong><div className={styles.stars} aria-label={`${review.rating} de 5 estrellas`}>{"★".repeat(review.rating)}</div></div><div><StatusBadge>Aprobada</StatusBadge><br /><time dateTime={review.date}>{new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${review.date}T12:00:00`))}</time></div></header><p>{review.comment}</p></article>)}</div>
    </DashboardSection>
    <DashboardSection title="Pide una reseña" description="Genera un enlace único para una persona a la que ya le hayas realizado un trabajo." action={<ReviewLinkButton kind={context.kind} entityId={context.entity.id}/>}><p className={styles.help}>Tequit revisa las reseñas antes de publicarlas. El enlace no garantiza su aprobación.</p></DashboardSection>
  </DashboardContent>;
}
