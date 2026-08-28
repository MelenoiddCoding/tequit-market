import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SiteContainer({ as: Component = "div", size = "content", className, children }: {
  as?: ElementType;
  size?: "reading" | "content" | "wide";
  className?: string;
  children: ReactNode;
}) {
  return <Component className={cn("site-container", `site-container-${size}`, className)}>{children}</Component>;
}

export function PageStack({ as: Component = "div", gap = "default", className, children }: {
  as?: ElementType;
  gap?: "compact" | "default" | "editorial";
  className?: string;
  children: ReactNode;
}) {
  return <Component className={cn("page-stack", `page-stack-${gap}`, className)}>{children}</Component>;
}

export function Section({ id, tone = "canvas", className, children }: {
  id?: string;
  tone?: "canvas" | "muted" | "brand";
  className?: string;
  children: ReactNode;
}) {
  return <section id={id} className={cn("section-block", `section-tone-${tone}`, className)}>{children}</section>;
}

export function SectionHeader({ eyebrow, title, description, action, className }: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return <div className={cn("section-header", className)}><div className="section-heading-copy">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>{action && <div className="section-action">{action}</div>}</div>;
}

export function PageHeader({ eyebrow, title, description, action }: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return <header className="page-header-block"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action && <div className="page-header-action">{action}</div>}</header>;
}

export function AutoGrid({ kind = "cards", className, children }: {
  kind?: "cards" | "metrics" | "services";
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("auto-grid", `auto-grid-${kind}`, className)}>{children}</div>;
}

export function Cluster({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("cluster", className)}>{children}</div>;
}
