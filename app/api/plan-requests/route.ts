import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema = z.object({
  kind: z.enum(["provider", "business"]),
  entityId: z.string().uuid(),
  requestedPlan: z.enum(["basic", "pro", "premium"]).default("pro"),
  note: z.string().max(500).optional().default(""),
});
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Tu sesión terminó." }, { status: 401 });
  if (parsed.data.kind === "provider") {
    const { data: owned } = await supabase
      .from("provider_profiles")
      .select("id")
      .eq("id", parsed.data.entityId)
      .eq("owner_profile_id", user.id)
      .maybeSingle();
    if (!owned)
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  } else {
    const { data: membership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("business_id", parsed.data.entityId)
      .eq("profile_id", user.id)
      .maybeSingle();
    if (!membership)
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  const { data: existing } = await supabase
    .from("plan_requests")
    .select("id")
    .eq("profile_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return NextResponse.json({ pending: true });
  const { error } = await supabase.from("plan_requests").insert({
    profile_id: user.id,
    provider_id: parsed.data.kind === "provider" ? parsed.data.entityId : null,
    business_id: parsed.data.kind === "business" ? parsed.data.entityId : null,
    note: parsed.data.note,
    requested_plan:
      parsed.data.kind === "provider" ? parsed.data.requestedPlan : null,
  });
  if (error)
    return NextResponse.json(
      { error: "No pudimos registrar tu interés." },
      { status: 403 },
    );
  return NextResponse.json({ pending: true }, { status: 201 });
}
