import Link from "next/link";import { Calculator,FileText,TicketCheck } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import styles from "@/components/dashboard-redesign.module.css";

const tools=[
  {Icon:FileText,name:"Cotizaciones",description:"Crea cotizaciones y notas de remisión.",href:"/dashboard/herramientas/documentos"},
  {Icon:TicketCheck,name:"Órdenes de trabajo",description:"Organiza trabajos, avances y entregas.",href:null},
  {Icon:Calculator,name:"Calculadoras",description:"Guarda cálculos frecuentes de materiales y mano de obra.",href:null},
];

export default function ProviderToolsPage(){return <DashboardContent><DashboardPageHeader eyebrow="Modo Prestador" title="Herramientas" description="Utilidades para operar mejor tu trabajo."/><section className={styles.section}><div className={styles.list}>{tools.map(({Icon,name,description,href})=><article className={styles.listRow} key={name}><div><Icon size={21} aria-hidden/><h3>{name}</h3><p className={styles.help}>{description}</p></div>{href?<Link href={href}>Abrir</Link>:<span className={styles.statusMuted}>Próximamente</span>}</article>)}</div></section></DashboardContent>}
