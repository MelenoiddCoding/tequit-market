import type { Plan } from "@/types";
export const FREE_SERVICE_LIMIT = 5;
export function serviceLimit(plan: Plan) {
  return plan === "premium" ? null : plan === "pro" ? 15 : 5;
}
export function canPublishService(plan: Plan, activeCount: number) {
  const limit = serviceLimit(plan);
  return limit === null || activeCount < limit;
}
export function assertCanPublishService(plan: Plan, activeCount: number) {
  if (!canPublishService(plan, activeCount))
    throw new Error(
      `Llegaste al límite de ${serviceLimit(plan)} servicios del plan.`,
    );
}
