import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema = z.object({
  providerId: z.string().uuid(),
  showPhoneCall: z.boolean(),
});
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Preferencia inválida." },
      { status: 400 },
    );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Tu sesión terminó." }, { status: 401 });
  const { data, error } = await supabase
    .from("provider_profiles")
    .update({ show_phone_call: parsed.data.showPhoneCall })
    .eq("id", parsed.data.providerId)
    .eq("owner_profile_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
