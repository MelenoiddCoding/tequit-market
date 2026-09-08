import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ providerId: z.string().uuid(), primaryId: z.string().uuid(), secondaryIds: z.array(z.string().uuid()).max(2) }).superRefine((value, context) => {
  if (value.secondaryIds.includes(value.primaryId) || new Set(value.secondaryIds).size !== value.secondaryIds.length) context.addIssue({ code: "custom", message: "Categorías repetidas" });
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revisa las categorías seleccionadas." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tu sesión terminó." }, { status: 401 });
  const { error } = await supabase.rpc("set_provider_categories", { p_provider_id: parsed.data.providerId, p_primary: parsed.data.primaryId, p_secondary: parsed.data.secondaryIds });
  if (error) return NextResponse.json({ error: "No pudimos guardar tus categorías." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
