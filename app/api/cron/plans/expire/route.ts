import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const admin = createAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Servicio no disponible." },
      { status: 503 },
    );
  const { data, error } = await admin
    .from("provider_plan_assignments")
    .select("provider_id")
    .is("revoked_at", null)
    .is("processed_at", null)
    .lte("ends_at", new Date().toISOString());
  if (error)
    return NextResponse.json(
      { error: "No pudimos consultar vencimientos." },
      { status: 500 },
    );
  const ids = [...new Set((data ?? []).map((item) => item.provider_id))];
  for (const id of ids)
    await admin.rpc("reconcile_provider_plan", { p_provider: id });
  return NextResponse.json({ ok: true, reconciled: ids.length });
}
