import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeMexicanPhone } from "@/lib/phone";
import { createRegistrationOtp } from "@/lib/registration-otp";
import { sendBirdWhatsAppOtp } from "@/lib/bird";

const startSchema = z.object({ phone: z.string().trim().max(24), accountType: z.enum(["customer", "provider", "business"]) });

export async function POST(request: Request) {
  if (!(await allowRequest(request, "register", 5, 3600))) return NextResponse.json({ error: "Se alcanzó el límite de registros. Intenta más tarde." }, { status: 429 });
  const parsed = startSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revisa tu número de celular." }, { status: 400 });
  const phone = normalizeMexicanPhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "Escribe un celular mexicano de 10 dígitos." }, { status: 400 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servicio temporalmente no disponible." }, { status: 503 });
  const { data: existing } = await admin.from("profiles").select("id").eq("phone_e164", phone).maybeSingle();
  if (existing) return NextResponse.json({ error: "Ese celular ya tiene una cuenta. Intenta iniciar sesión." }, { status: 409 });
  const otp = createRegistrationOtp();
  const { data: pending, error } = await admin.from("pending_registrations").upsert({
    phone_e164: phone, account_type: parsed.data.accountType, otp_digest: otp.digest, otp_expires_at: otp.expiresAt,
    otp_attempts: 0, otp_last_sent_at: new Date().toISOString(), otp_verified_at: null,
    expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
  }, { onConflict: "phone_e164" }).select("id").single();
  if (error || !pending) return NextResponse.json({ error: "No pudimos preparar el registro. Intenta nuevamente." }, { status: 500 });
  try { await sendBirdWhatsAppOtp({ to: phone, code: otp.code, idempotencyKey: `registration-${pending.id}` }); }
  catch { return NextResponse.json({ error: "No pudimos enviar el código por WhatsApp. Intenta nuevamente." }, { status: 502 }); }
  return NextResponse.json({ registrationId: pending.id, phone }, { status: 202 });
}

const cancelSchema = z.object({ registrationId: z.string().uuid() });
export async function DELETE(request: Request) {
  if (!(await allowRequest(request, "cancel_registration", 10, 3600))) return NextResponse.json({ error: "Intenta nuevamente más tarde." }, { status: 429 });
  const parsed = cancelSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Registro no válido." }, { status: 400 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servicio temporalmente no disponible." }, { status: 503 });
  const { data: pending } = await admin.from("pending_registrations").select("user_id").eq("id", parsed.data.registrationId).maybeSingle();
  if (!pending) return NextResponse.json({ ok: true });
  if (pending.user_id) await admin.auth.admin.deleteUser(pending.user_id);
  else await admin.from("pending_registrations").delete().eq("id", parsed.data.registrationId);
  return NextResponse.json({ ok: true });
}
