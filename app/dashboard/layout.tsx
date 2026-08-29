import { DashboardFrame } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context=await getDashboardContext();const subtitle=context.kind==="provider"?`${context.entity.profession} · Plan ${context.entity.plan}`:`${context.entity.category} · Negocio`;
  return <DashboardFrame name={context.entity.name} subtitle={subtitle} publicHref={context.kind==="provider"?`/p/${context.entity.slug}`:`/n/${context.entity.slug}`} contextLabel={context.kind==="provider"?"Panel de prestador":"Panel de negocio"}>{children}</DashboardFrame>;
}
