"use client";

import { useState } from "react";
import {useAdminUpdate} from "@/components/admin-update-toast";
import {
  dashboardStyles as styles,
  StatusBadge,
} from "@/components/dashboard-components";

async function postAdminAction(value: Record<string, unknown>) {
  try {
    const response = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function ModerationAction({ id }: { id: string }) {
  const showUpdate = useAdminUpdate();
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
    const saved = await postAdminAction({ action: "review", id, status });
    if (saved) {setState(status);showUpdate({mode:"success",title:status==="approved"?"Reseña aprobada":"Reseña rechazada"});}
    else showUpdate({mode:"error",title:"No se actualizó la reseña",message:"Inténtalo de nuevo."});
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
  const showUpdate = useAdminUpdate();
  const [plan, setPlan] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [months, setMonths] = useState("3");
  async function change(next: typeof plan) {
    setBusy(true);
    const saved = await postAdminAction({
      action: "plan", id, plan: next,
      durationMonths: next === "free" || months === "0" ? null : Number(months),
      reason: "Asignación desde el directorio",
    });
    if (saved) {setPlan(next);showUpdate({mode:"success",title:"Plan actualizado",message:"La asignación del prestador ya está guardada."});}
    else showUpdate({mode:"error",title:"No se actualizó el plan",message:"Inténtalo de nuevo."});
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
  const showUpdate = useAdminUpdate();
  const [enabled, setEnabled] = useState(initialEnabled),
    [plan, setPlan] = useState(initialPlan),
    [months, setMonths] = useState(String(initialMonths));
  async function save() {
    const saved = await postAdminAction({
      action: "welcome_settings", enabled, plan, durationMonths: Number(months),
    });
    showUpdate(saved?{mode:"success",title:"Configuración guardada",message:"La oferta de bienvenida ya está actualizada."}:{mode:"error",title:"No se guardó la configuración",message:"Inténtalo de nuevo."});
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
    </div>
  );
}

export function DiscoverySettings({enabled:initialEnabled,freeRadius:initialFree,basicRadius:initialBasic}:{enabled:boolean;freeRadius:number;basicRadius:number}) {
  const showUpdate=useAdminUpdate();const[enabled,setEnabled]=useState(initialEnabled);const[freeRadius,setFreeRadius]=useState(String(initialFree));const[basicRadius,setBasicRadius]=useState(String(initialBasic));const[busy,setBusy]=useState(false);
  async function save(){setBusy(true);const saved=await postAdminAction({action:"discovery_settings",enabled,freeRadiusKm:Number(freeRadius),basicRadiusKm:Number(basicRadius)});showUpdate(saved?{mode:"success",title:"Cobertura actualizada",message:"Los radios ya se aplican al descubrimiento."}:{mode:"error",title:"No se guardó la cobertura",message:"Revisa los valores e inténtalo de nuevo."});setBusy(false)}
  return <div className={styles.form}><label><input type="checkbox" checked={enabled} onChange={(event)=>setEnabled(event.target.checked)}/> Descubrimiento por ubicación activo</label><div className={styles.formGrid}><div className={styles.fieldGroup}><label htmlFor="free-radius">Radio Free (km)</label><input className={styles.field} id="free-radius" type="number" min="0.5" max="100" step="0.5" value={freeRadius} onChange={(event)=>setFreeRadius(event.target.value)}/></div><div className={styles.fieldGroup}><label htmlFor="basic-radius">Radio Básico (km)</label><input className={styles.field} id="basic-radius" type="number" min="0.5" max="100" step="0.5" value={basicRadius} onChange={(event)=>setBasicRadius(event.target.value)}/></div></div><p className={styles.help}>Pro y Premium se muestran por zonas declaradas. El plan no altera artificialmente el orden dentro de una cobertura válida.</p><div><button className={styles.primary} type="button" onClick={save} disabled={busy}>{busy?"Guardando…":"Guardar cobertura"}</button></div></div>
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
  const showUpdate = useAdminUpdate();
  const [status, setStatus] = useState(initial);
  async function change() {
    const next = status === "active" ? "suspended" : "active";
    const saved = await postAdminAction({ action: "status", kind, id, status: next });
    if (saved) {setStatus(next);showUpdate({mode:"success",title:next==="active"?"Ficha reactivada":"Ficha suspendida"});}
    else showUpdate({mode:"error",title:"No se actualizó la ficha",message:"Inténtalo de nuevo."});
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
  const showUpdate = useAdminUpdate();
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
    const saved = await postAdminAction({ action: "plan_request", id, status: next });
    if (saved) {setStatus(next);showUpdate({mode:"success",title:next==="approved"?"Solicitud aprobada":"Solicitud rechazada"});}
    else showUpdate({mode:"error",title:"No se actualizó la solicitud",message:"Inténtalo de nuevo."});
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
