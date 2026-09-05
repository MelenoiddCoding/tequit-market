import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema = z.object({ assignmentId: z.string().uuid() });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Asignación inválida." },
      { status: 400 },
    );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Tu sesión terminó." }, { status: 401 });
  const { data: assignment } = await supabase
    .from("provider_plan_assignments")
    .select("provider_id,source")
    .eq("id", parsed.data.assignmentId)
    .eq("source", "welcome")
    .maybeSingle();
  if (!assignment)
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const { data, error } = await supabase
    .from("provider_profiles")
    .update({ welcome_seen_assignment_id: parsed.data.assignmentId })
    .eq("id", assignment.provider_id)
    .eq("owner_profile_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
