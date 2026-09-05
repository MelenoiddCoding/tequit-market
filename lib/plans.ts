import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PlanCode = "free" | "basic" | "pro" | "premium";
export type AnalyticsLevel = "none" | "basic" | "advanced";
export type PlanEntitlements = {
  maxServices: number | null;
  maxPortfolioItems: number | null;
  analyticsLevel: AnalyticsLevel;
  directedRequestForm: boolean;
  leadInbox: boolean;
  customSiteBranding: boolean;
  phoneContact: boolean;
};
export type PlanAssignment = {
  id: string;
  planCode: PlanCode;
  startsAt: string;
  endsAt: string | null;
  source: "welcome" | "admin" | "future_purchase" | "legacy";
  reason: string;
  seenAt: string | null;
};
export type ProviderPlan = {
  code: PlanCode;
  name: string;
  price: number;
  description: string;
  entitlements: PlanEntitlements;
  assignment: PlanAssignment | null;
};

export const PLAN_ORDER: PlanCode[] = ["free", "basic", "pro", "premium"];
export const PLAN_NAMES: Record<PlanCode, string> = {
  free: "Free",
  basic: "Básico",
  pro: "Pro",
  premium: "Premium",
};
export const PLAN_PRICES: Record<PlanCode, number> = {
  free: 0,
  basic: 99,
  pro: 199,
  premium: 299,
};
const defaults: Record<PlanCode, PlanEntitlements> = {
  free: {
    maxServices: 5,
    maxPortfolioItems: 5,
    analyticsLevel: "none",
    directedRequestForm: false,
    leadInbox: false,
    customSiteBranding: false,
    phoneContact: true,
  },
  basic: {
    maxServices: 5,
    maxPortfolioItems: 5,
    analyticsLevel: "basic",
    directedRequestForm: false,
    leadInbox: false,
    customSiteBranding: false,
    phoneContact: true,
  },
  pro: {
    maxServices: 15,
    maxPortfolioItems: 10,
    analyticsLevel: "advanced",
    directedRequestForm: true,
    leadInbox: true,
    customSiteBranding: true,
    phoneContact: true,
  },
  premium: {
    maxServices: null,
    maxPortfolioItems: 10,
    analyticsLevel: "advanced",
    directedRequestForm: true,
    leadInbox: true,
    customSiteBranding: true,
    phoneContact: true,
  },
};
const descriptions: Record<PlanCode, string> = {
  free: "Tu sitio profesional y contacto directo.",
  basic: "Entiende cuántas personas ven y contactan tu perfil.",
  pro: "Más servicios, solicitudes y analítica completa.",
  premium: "Máxima capacidad para hacer crecer tu presencia.",
};

function validPlan(value: unknown): PlanCode {
  return PLAN_ORDER.includes(value as PlanCode) ? (value as PlanCode) : "free";
}
export async function getProviderPlan(
  providerId: string,
): Promise<ProviderPlan> {
  const admin = createAdminClient();
  if (!admin) return planFromCode("free", null);
  const now = new Date().toISOString();
  const { data } = await admin
    .from("provider_plan_assignments")
    .select("id,plan_code,starts_at,ends_at,source,reason")
    .eq("provider_id", providerId)
    .is("revoked_at", null)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const assignment = data
    ? ({
        id: data.id,
        planCode: validPlan(data.plan_code),
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        source: data.source,
        reason: data.reason,
        seenAt: null,
      } as PlanAssignment)
    : null;
  const code = assignment?.planCode ?? "free";
  const [{ data: catalog }, { data: entitlementRows }] = await Promise.all([
    admin
      .from("plan_catalog")
      .select("name,monthly_price_mxn,description")
      .eq("code", code)
      .maybeSingle(),
    admin
      .from("plan_entitlements")
      .select("feature_key,value")
      .eq("plan_code", code)
      .eq("availability", "active"),
  ]);
  const result = planFromCode(code, assignment);
  if (catalog) {
    result.name = catalog.name;
    result.price = catalog.monthly_price_mxn;
    result.description = catalog.description;
  }
  for (const row of entitlementRows ?? []) {
    if (row.feature_key === "max_services")
      result.entitlements.maxServices = row.value as number | null;
    if (row.feature_key === "max_portfolio_items")
      result.entitlements.maxPortfolioItems = row.value as number | null;
    if (row.feature_key === "analytics_level")
      result.entitlements.analyticsLevel = row.value as AnalyticsLevel;
    if (row.feature_key === "directed_request_form")
      result.entitlements.directedRequestForm = Boolean(row.value);
    if (row.feature_key === "lead_inbox")
      result.entitlements.leadInbox = Boolean(row.value);
    if (row.feature_key === "custom_site_branding")
      result.entitlements.customSiteBranding = Boolean(row.value);
    if (row.feature_key === "phone_contact")
      result.entitlements.phoneContact = Boolean(row.value);
  }
  return result;
}
export function planFromCode(
  code: PlanCode,
  assignment: PlanAssignment | null,
): ProviderPlan {
  return {
    code,
    name: PLAN_NAMES[code],
    price: PLAN_PRICES[code],
    description: descriptions[code],
    entitlements: { ...defaults[code] },
    assignment,
  };
}
export function canUse(plan: ProviderPlan, key: keyof PlanEntitlements) {
  return Boolean(plan.entitlements[key]);
}
