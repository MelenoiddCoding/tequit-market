import type { Plan } from "@/types";
export const FREE_SERVICE_LIMIT = 5;
export function canPublishService(plan: Plan, activeCount: number) { return plan === "pro" || activeCount < FREE_SERVICE_LIMIT; }
export function assertCanPublishService(plan: Plan, activeCount: number) {
  if (!canPublishService(plan, activeCount)) throw new Error("Llegaste al límite de 5 servicios del plan Free.");
}
