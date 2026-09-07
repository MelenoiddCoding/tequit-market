import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrationOtpMatches } from "@/lib/registration-otp";

const schema = z.object({ registrationId: z.string().uuid(), code: z.string().trim().regex(/^\d{6}$/) });

export async function POST(request: Request) {
  if (!(await allowRequest(request, "verify_registration_otp", 10, 900))) return NextResponse.json({ error: "Demasiados intentos. Solicita un código nuevo más tarde." }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Escribe el código de seis dígitos." }, { status: 400 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servicio temporalmente no disponible." }, { status: 503 });
  const { data: pending } = await admin.from("pending_registrations").select("*").eq("id", parsed.data.registrationId).maybeSingle();
  if (!pending) return NextResponse.json({ error: "Este registro ya no está disponible." }, { status: 409 });
  if (!pending.otp_digest || !pending.otp_expires_at || Date.parse(pending.otp_expires_at) < Date.now()) return NextResponse.json({ error: "El código ya venció. Solicita uno nuevo." }, { status: 400 });
  if (pending.otp_attempts >= 10) return NextResponse.json({ error: "Se agotaron los intentos. Solicita un código nuevo." }, { status: 429 });
  if (!registrationOtpMatches(parsed.data.code, pending.otp_digest)) {
    await admin.from("pending_registrations").update({ otp_attempts: pending.otp_attempts + 1 }).eq("id", pending.id);
    return NextResponse.json({ error: "El código no es válido o ya venció." }, { status: 400 });
  }
  await admin.from("pending_registrations").update({ otp_verified_at: new Date().toISOString() }).eq("id", pending.id);
  return NextResponse.json({ verified: true });
}
