"use client";

import { useState } from "react";
import { dashboardStyles as styles, StatusBadge } from "@/components/dashboard-components";

export function ModerationAction({id}:{id:string}) {
  const [state, setState] = useState<"pending" | "approved" | "rejected">("pending");
  if (state !== "pending") return <StatusBadge tone={state === "approved" ? "default" : "warning"}>{state === "approved" ? "Aprobada" : "Rechazada"}</StatusBadge>;
  async function update(status:"approved"|"rejected"){const response=await fetch("/api/admin/actions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"review",id,status})});if(response.ok)setState(status)}
  return <div className={styles.tableActions}><button className={styles.primary} type="button" onClick={() => update("approved")}>Aprobar</button><button className={styles.danger} type="button" onClick={() => update("rejected")}>Rechazar</button></div>;
}

export function PlanAction({id,initial}:{id:string;initial:"free"|"pro"}) {
  const [plan, setPlan] = useState<"free" | "pro">(initial);
  async function change(){const next=plan==="free"?"pro":"free";const response=await fetch("/api/admin/actions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"plan",id,plan:next})});if(response.ok)setPlan(next)}
  return <button className={styles.secondary} type="button" onClick={change} aria-label={`Cambiar plan actual ${plan.toUpperCase()}`}>{plan.toUpperCase()} · cambiar</button>;
}

export function PublicationAction({id,kind,initial}:{id:string;kind:"provider"|"business";initial:"draft"|"active"|"suspended"}) {
  const [status,setStatus]=useState(initial);
  async function change(){const next=status==="active"?"suspended":"active";const response=await fetch("/api/admin/actions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"status",kind,id,status:next})});if(response.ok)setStatus(next)}
  return <button className={status==="active"?styles.danger:styles.secondary} type="button" onClick={change}>{status==="active"?"Suspender":"Reactivar"}</button>;
}

export function PlanRequestAction({id}:{id:string}) {
  const [status,setStatus]=useState<"pending"|"approved"|"rejected">("pending");
  if(status!=="pending")return <StatusBadge tone={status==="approved"?"default":"warning"}>{status==="approved"?"Aprobada":"Rechazada"}</StatusBadge>;
  async function update(next:"approved"|"rejected"){const response=await fetch("/api/admin/actions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"plan_request",id,status:next})});if(response.ok)setStatus(next)}
  return <div className={styles.tableActions}><button className={styles.primary} type="button" onClick={()=>update("approved")}>Aprobar Pro</button><button className={styles.danger} type="button" onClick={()=>update("rejected")}>Rechazar</button></div>;
}
