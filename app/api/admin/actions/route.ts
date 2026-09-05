import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
const planCode = z.enum(["free", "basic", "pro", "premium"]);
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("review"),
    id: z.string().uuid(),
    status: z.enum(["approved", "rejected"]),
  }),
  z.object({
    action: z.literal("plan"),
    id: z.string().uuid(),
    plan: planCode,
    durationMonths: z.number().int().min(1).max(24).nullable().default(null),
    reason: z.string().trim().max(240).default(""),
  }),
  z.object({
    action: z.literal("welcome_settings"),
    enabled: z.boolean(),
    plan: planCode,
    durationMonths: z.number().int().min(1).max(24),
  }),
  z.object({
    action: z.literal("status"),
    kind: z.enum(["provider", "business"]),
    id: z.string().uuid(),
    status: z.enum(["active", "suspended"]),
  }),
  z.object({
    action: z.literal("plan_request"),
    id: z.string().uuid(),
    status: z.enum(["approved", "rejected"]),
  }),
]);
export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.roles.includes("admin"))
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  const value = parsed.data,
    admin = createAdminClient()!;
  let error: unknown;
  async function assign(
    providerId: string,
    plan: "free" | "basic" | "pro" | "premium",
    months: number | null,
    reason: string,
  ) {
    const { error: assignmentError } = await admin.rpc(
      "admin_assign_provider_plan",
      {
        p_admin: session!.user.id,
        p_provider: providerId,
        p_plan: plan,
        p_duration_months: months,
        p_reason: reason,
      },
    );
    return assignmentError;
  }
  if (value.action === "review")
    ({ error } = await admin
      .from("reviews")
      .update({
        status: value.status,
        moderated_by: session.user.id,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", value.id));
  if (value.action === "plan")
    error = await assign(
      value.id,
      value.plan,
      value.durationMonths,
      value.reason,
    );
  if (value.action === "welcome_settings")
    ({ error } = await admin
      .from("welcome_offer_settings")
      .update({
        enabled: value.enabled,
        plan_code: value.plan,
        duration_months: value.durationMonths,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true));
  if (value.action === "status")
    ({ error } = await admin
      .from(value.kind === "provider" ? "provider_profiles" : "businesses")
      .update({ status: value.status })
      .eq("id", value.id));
  if (value.action === "plan_request") {
    ({ error } = await admin.rpc("admin_decide_plan_request", {
      p_admin: session.user.id,
      p_request: value.id,
      p_status: value.status,
    }));
  }
  if (error)
    return NextResponse.json(
      { error: "No pudimos aplicar la acción." },
      { status: 500 },
    );
  if (value.action !== "plan" && value.action !== "plan_request")
    await admin.from("admin_audit_logs").insert({
      admin_profile_id: session.user.id,
      action: value.action,
      entity_type: value.action,
      entity_id: "id" in value ? value.id : session.user.id,
      metadata: value,
    });
  return NextResponse.json({ ok: true });
}
