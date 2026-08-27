"use client";
import { useState } from "react";
export function ModerationAction(){const[state,setState]=useState("pending");return <div className="filters"><span className="status">{state}</span><button className="chip" onClick={()=>setState("approved")}>Aprobar</button><button className="chip" onClick={()=>setState("rejected")}>Rechazar</button></div>}
export function PlanAction(){const[plan,setPlan]=useState("free");return <button className={`chip ${plan==="pro"?"active":""}`} onClick={()=>setPlan(plan==="free"?"pro":"free")}>{plan.toUpperCase()} · cambiar</button>}
