import { Calculator,FileText,TicketCheck } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard-components";
import { DashboardContent } from "@/components/dashboard-shell";
import styles from "@/components/dashboard-redesign.module.css";

const tools=[
  {Icon:FileText,name:"Cotizaciones",description:"Prepara propuestas claras para tus clientes."},
  {Icon:TicketCheck,name:"Órdenes de trabajo",description:"Organiza trabajos, avances y entregas."},
  {Icon:Calculator,name:"Calculadoras",description:"Guarda cálculos frecuentes de materiales y mano de obra."},
];

export default function ProviderToolsPage(){return <DashboardContent><DashboardPageHeader eyebrow="Modo Prestador" title="Herramientas" description="Aquí reuniremos utilidades para operar mejor tu trabajo."/><section className={styles.section}><div className={styles.list}>{tools.map(({Icon,name,description})=><article className={styles.listRow} key={name}><div><Icon size={21} aria-hidden/><h3>{name}</h3><p className={styles.help}>{description}</p></div><span className={styles.statusMuted}>Próximamente</span></article>)}</div></section></DashboardContent>}
