import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import styles from "@/components/dashboard-redesign.module.css";
import { cn } from "@/lib/cn";

export { styles as dashboardStyles };

export function DashboardPageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <header className={styles.pageHeader}><div>{eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}<h1>{title}</h1>{description && <p className={styles.description}>{description}</p>}</div>{action && <div className={styles.actions}>{action}</div>}</header>;
}

export function CompletionAlert({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <aside className={styles.alert}><span className={styles.alertIcon}><AlertTriangle size={21} aria-hidden="true" /></span><div className={styles.alertCopy}><strong>{title}</strong><p>{description}</p></div>{action}</aside>;
}

export function MetricGrid({ children }: { children: React.ReactNode }) { return <div className={styles.metricGrid}>{children}</div>; }
export function MetricItem({ icon: Icon, label, value, note }: { icon?: LucideIcon; label: string; value: string | number; note?: string }) {
  return <div className={styles.metric}><div className={styles.metricTop}><span>{label}</span>{Icon && <Icon className={styles.metricIcon} size={18} aria-hidden="true" />}</div><strong className={styles.metricValue}>{value}</strong>{note && <span className={styles.metricNote}>{note}</span>}</div>;
}

export function DashboardSection({ title, description, action, children, className }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cn(styles.section, className)}><header className={styles.sectionHeader}><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>{children}</section>;
}

export function StatusBadge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "warning" | "muted" }) {
  return <span className={cn(styles.status, tone === "warning" && styles.statusWarning, tone === "muted" && styles.statusMuted)}>{children}</span>;
}
