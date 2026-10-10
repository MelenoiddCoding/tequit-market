import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    providerId: z.string().uuid(),
    amount: z.number().int().min(0).max(100000),
    months: z.number().int().min(1).max(24),
  }),
  z.object({
    action: z.enum(["pay", "publish", "cancel"]),
    orderId: z.string().uuid(),
    reference: z.string().trim().max(160).optional(),
  }),
]);
export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.roles.includes("admin"))
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Revisa los datos del pedido." },
      { status: 400 },
    );
  const v = parsed.data;
  if (v.action === "pay" && (!v.reference || v.reference.length < 3))
    return NextResponse.json(
      { error: "Anota la referencia del pago recibido." },
      { status: 400 },
    );
  const admin = createAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Servicio no disponible." },
      { status: 503 },
    );
  const { data, error } = await admin.rpc("admin_website_order", {
    p_admin: session.user.id,
    p_action: v.action,
    ...(v.action === "create"
      ? { p_provider: v.providerId, p_amount: v.amount, p_months: v.months }
      : { p_order: v.orderId, p_reference: v.reference ?? "" }),
  });
  if (error)
    return NextResponse.json(
      {
        error: error.message.includes("COMPLETE_SITE")
          ? "Completa frase y presentación antes de publicar."
          : error.message.includes("PUBLISH_PROFILE")
            ? "Publica primero el perfil con consentimiento."
            : "No se pudo completar la acción. Revisa el estado del pedido e inténtalo de nuevo.",
      },
      { status: 409 },
    );
  return NextResponse.json({ ok: true, id: data });
}
