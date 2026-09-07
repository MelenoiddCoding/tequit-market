import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { recordLegalAcceptances } from "@/lib/legal-consent";
import { LEGAL_VERSION } from "@/lib/legal-documents";

const schema = z.object({
  registrationId: z.string().uuid(),
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  recoveryEmail: z.union([z.literal(""), z.string().email().max(254)]).optional().default(""),
  password: z.string().min(8).max(128),
  acceptTerms: z.boolean(), acceptPrivacy: z.boolean(),
  termsVersion: z.string().max(30), privacyVersion: z.string().max(30),
});

export async function POST(request: Request) {
  if (!(await allowRequest(request, "complete_registration", 5, 3600))) return NextResponse.json({ error: "Se alcanzó el límite de registros. Intenta más tarde." }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Revisa los datos del registro." }, { status: 400 });
  const value = parsed.data;
  if (!value.acceptTerms || !value.acceptPrivacy) return NextResponse.json({ error: "Debes aceptar los Términos y la Política de Privacidad." }, { status: 400 });
  if (value.termsVersion !== LEGAL_VERSION || value.privacyVersion !== LEGAL_VERSION) return NextResponse.json({ error: "Los documentos legales cambiaron. Recarga la página para revisar la versión vigente." }, { status: 409 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servicio temporalmente no disponible." }, { status: 503 });
  const { data: pending } = await admin.from("pending_registrations").select("*").eq("id", value.registrationId).maybeSingle();
  if (!pending || !pending.otp_verified_at || new Date(pending.expires_at) < new Date()) return NextResponse.json({ error: "La verificación venció. Solicita un código nuevo." }, { status: 409 });
  const { data: existing } = await admin.from("profiles").select("id").eq("phone_e164", pending.phone_e164).maybeSingle();
  if (existing) return NextResponse.json({ error: "Ese celular ya tiene una cuenta. Intenta iniciar sesión." }, { status: 409 });
  const displayName = `${value.firstName} ${value.lastName}`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    phone: pending.phone_e164, password: value.password, phone_confirm: true,
    user_metadata: { display_name: displayName, phone: pending.phone_e164, role: "customer" },
  });
  if (createError || !created.user) return NextResponse.json({ error: "No pudimos crear tu cuenta. Intenta nuevamente." }, { status: 409 });
  const legal = await recordLegalAcceptances({ admin, userId: created.user.id, source: "registration", request, input: value });
  if (!legal.ok) { await admin.auth.admin.deleteUser(created.user.id); return NextResponse.json({ error: legal.error }, { status: legal.status }); }
  await admin.from("profiles").update({ phone_verified_at: new Date().toISOString(), phone_verification_method: "whatsapp_otp" }).eq("id", created.user.id);
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ phone: pending.phone_e164, password: value.password });
  if (value.recoveryEmail && !signInError) {
    const { error: emailError } = await supabase.auth.updateUser({ email: value.recoveryEmail }, { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/auth/callback?next=/cuenta` });
    if (!emailError) await admin.from("profiles").update({ recovery_email: value.recoveryEmail, recovery_email_verified_at: null }).eq("id", created.user.id);
  }
  await admin.from("pending_registrations").delete().eq("id", pending.id);
  const destination = pending.account_type === "provider" ? "/cuenta?onboarding=provider" : pending.account_type === "business" ? "/cuenta?onboarding=business" : "/cuenta";
  return NextResponse.json({ destination, authenticated: !signInError });
}
