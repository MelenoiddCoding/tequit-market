"use client";

import { useState } from "react";
import { dashboardStyles as styles, StatusBadge } from "@/components/dashboard-components";

export function ModerationAction() {
  const [state, setState] = useState<"pending" | "approved" | "rejected">("pending");
  if (state !== "pending") return <StatusBadge tone={state === "approved" ? "default" : "warning"}>{state === "approved" ? "Aprobada" : "Rechazada"}</StatusBadge>;
  return <div className={styles.tableActions}><button className={styles.primary} type="button" onClick={() => setState("approved")}>Aprobar</button><button className={styles.danger} type="button" onClick={() => setState("rejected")}>Rechazar</button></div>;
}

export function PlanAction() {
  const [plan, setPlan] = useState<"free" | "pro">("free");
  return <button className={styles.secondary} type="button" onClick={() => setPlan(plan === "free" ? "pro" : "free")} aria-label={`Cambiar plan actual ${plan.toUpperCase()}`}>{plan.toUpperCase()} · cambiar</button>;
}
