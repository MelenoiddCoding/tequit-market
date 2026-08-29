"use client";
import { useState } from "react";
import { Link2 } from "lucide-react";
import { dashboardStyles as styles } from "@/components/dashboard-components";
export function ReviewLinkButton({kind,entityId}:{kind:"provider"|"business";entityId:string}){const[url,setUrl]=useState("");async function generate(){const response=await fetch("/api/reviews/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,entityId})});const body=await response.json();if(response.ok){setUrl(body.url);await navigator.clipboard.writeText(body.url)}}return <div>{url?<p className={styles.help}>Enlace copiado: {url}</p>:<button className={styles.primary} type="button" onClick={generate}><Link2 size={17}/>Generar y copiar enlace</button>}</div>}
