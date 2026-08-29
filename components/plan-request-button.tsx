"use client";
import { useState } from "react";
import { dashboardStyles as styles } from "@/components/dashboard-components";
export function PlanRequestButton({kind,entityId}:{kind:"provider"|"business";entityId:string}){const[pending,setPending]=useState(false);async function request(){const response=await fetch("/api/plan-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,entityId})});if(response.ok)setPending(true)}return <button className={styles.primary} type="button" disabled={pending} onClick={request}>{pending?"Interés registrado":"Solicitar Pro"}</button>}
