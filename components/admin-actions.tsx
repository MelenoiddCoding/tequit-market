"use client";

import { useState } from "react";
import {
  dashboardStyles as styles,
  StatusBadge,
} from "@/components/dashboard-components";

export function ModerationAction({ id }: { id: string }) {
  const [state, setState] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  if (state !== "pending")
    return (
      <StatusBadge tone={state === "approved" ? "default" : "warning"}>
        {state === "approved" ? "Aprobada" : "Rechazada"}
      </StatusBadge>
    );
  async function update(status: "approved" | "rejected") {
    const response = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review", id, status }),
    });
    if (response.ok) setState(status);
  }
  return (
    <div className={styles.tableActions}>
      <button
        className={styles.primary}
        type="button"
        onClick={() => update("approved")}
      >
        Aprobar
      </button>
      <button
        className={styles.danger}
        type="button"
        onClick={() => update("rejected")}
      >
        Rechazar
      </button>
    </div>
  );
}

export function PlanAction({
  id,
  initial,
}: {
  id: string;
  initial: "free" | "basic" | "pro" | "premium";
}) {
  const [plan, setPlan] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [months, setMonths] = useState("3");
  async function change(next: typeof plan) {
    setBusy(true);
    const response = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "plan",
        id,
        plan: next,
        durationMonths:
          next === "free" || months === "0" ? null : Number(months),
        reason: "Asignación desde el directorio",
      }),
    });
    if (response.ok) setPlan(next);
    setBusy(false);
  }
  return (
    <div className={styles.tableActions}>
      <select
        aria-label="Duración del regalo"
        value={months}
        onChange={(event) => setMonths(event.target.value)}
        disabled={busy}
      >
        <option value="0">Sin vencimiento</option>
        <option value="1">1 mes</option>
        <option value="3">3 meses</option>
        <option value="6">6 meses</option>
        <option value="12">12 meses</option>
      </select>
      <select
        aria-label={`Plan actual ${plan}`}
        value={plan}
        onChange={(event) => change(event.target.value as typeof plan)}
        disabled={busy}
      >
        <option value="free">Free</option>
        <option value="basic">Básico</option>
        <option value="pro">Pro</option>
        <option value="premium">Premium</option>
      </select>
    </div>
  );
}

export function WelcomeOfferSettings({
  enabled: initialEnabled,
  plan: initialPlan,
  months: initialMonths,
}: {
  enabled: boolean;
  plan: "free" | "basic" | "pro" | "premium";
  months: number;
}) {
  const [enabled, setEnabled] = useState(initialEnabled),
    [plan, setPlan] = useState(initialPlan),
    [months, setMonths] = useState(String(initialMonths)),
    [message, setMessage] = useState("");
  async function save() {
    setMessage("Guardando…");
    const response = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "welcome_settings",
        enabled,
        plan,
        durationMonths: Number(months),
      }),
    });
    setMessage(response.ok ? "Configuración guardada." : "No pudimos guardar.");
  }
  return (
    <div className={styles.tableActions}>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
        />{" "}
        Regalo activo
      </label>
      <select
        value={plan}
        onChange={(event) => setPlan(event.target.value as typeof plan)}
      >
        <option value="basic">Básico</option>
        <option value="pro">Pro</option>
        <option value="premium">Premium</option>
      </select>
      <input
        aria-label="Duración en meses"
        type="number"
        min="1"
        max="24"
        value={months}
        onChange={(event) => setMonths(event.target.value)}
      />
      <button className={styles.primary} type="button" onClick={save}>
        Guardar
      </button>
      <span role="status">{message}</span>
    </div>
  );
}

export function PublicationAction({
  id,
  kind,
  initial,
}: {
  id: string;
  kind: "provider" | "business";
  initial: "draft" | "active" | "suspended";
}) {
  const [status, setStatus] = useState(initial);
  async function change() {
    const next = status === "active" ? "suspended" : "active";
    const response = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", kind, id, status: next }),
    });
    if (response.ok) setStatus(next);
  }
  return (
    <button
      className={status === "active" ? styles.danger : styles.secondary}
      type="button"
      onClick={change}
    >
      {status === "active" ? "Suspender" : "Reactivar"}
    </button>
  );
}

export function PlanRequestAction({
  id,
  requestedPlan = "pro",
}: {
  id: string;
  requestedPlan?: "basic" | "pro" | "premium";
}) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  if (status !== "pending")
    return (
      <StatusBadge tone={status === "approved" ? "default" : "warning"}>
        {status === "approved" ? "Aprobada" : "Rechazada"}
      </StatusBadge>
    );
  async function update(next: "approved" | "rejected") {
    const response = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "plan_request", id, status: next }),
    });
    if (response.ok) setStatus(next);
  }
  return (
    <div className={styles.tableActions}>
      <button
        className={styles.primary}
        type="button"
        onClick={() => update("approved")}
      >
        Aprobar{" "}
        {requestedPlan === "basic"
          ? "Básico"
          : requestedPlan === "premium"
            ? "Premium"
            : "Pro"}
      </button>
      <button
        className={styles.danger}
        type="button"
        onClick={() => update("rejected")}
      >
        Rechazar
      </button>
    </div>
  );
}
