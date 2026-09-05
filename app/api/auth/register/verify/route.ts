import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { normalizeMexicanPhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { registrationOtpMatches } from "@/lib/registration-otp";

const schema = z.object({
  registrationId: z.string().uuid(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
  password: z.string().min(8).max(128).optional(),
});

export async function POST(request: Request) {
  if (!(await allowRequest(request, "verify_registration_otp", 10, 900)))
    return NextResponse.json(
      { error: "Demasiados intentos. Solicita un código nuevo más tarde." },
      { status: 429 },
    );
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Escribe el código de seis dígitos." },
      { status: 400 },
    );
  const admin = createAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Servicio temporalmente no disponible." },
      { status: 503 },
    );
  const { data: pending } = await admin
    .from("pending_registrations")
    .select("*")
    .eq("id", parsed.data.registrationId)
    .maybeSingle();
  if (!pending)
    return NextResponse.json(
      { error: "Este registro ya no está disponible." },
      { status: 409 },
    );

  if (
    !pending.otp_digest ||
    !pending.otp_expires_at ||
    Date.parse(pending.otp_expires_at) < Date.now()
  )
    return NextResponse.json(
      { error: "El código ya venció. Solicita uno nuevo." },
      { status: 400 },
    );
  if (pending.otp_attempts >= 10)
    return NextResponse.json(
      { error: "Se agotaron los intentos. Solicita un código nuevo." },
      { status: 429 },
    );
  if (!registrationOtpMatches(parsed.data.code, pending.otp_digest)) {
    await admin
      .from("pending_registrations")
      .update({ otp_attempts: pending.otp_attempts + 1 })
      .eq("id", pending.id);
    return NextResponse.json(
      { error: "El código no es válido o ya venció." },
      { status: 400 },
    );
  }
  const { data: confirmed, error: confirmError } =
    await admin.auth.admin.updateUserById(pending.user_id, {
      phone_confirm: true,
    });
  if (confirmError || !confirmed.user)
    return NextResponse.json(
      { error: "No pudimos confirmar el celular. Intenta nuevamente." },
      { status: 500 },
    );
  const user = confirmed.user;
  if (normalizeMexicanPhone(user.phone ?? "") !== pending.phone_e164)
    return NextResponse.json(
      { error: "La cuenta no corresponde a este registro." },
      { status: 403 },
    );
  const supabase = await createClient();
  let authenticated = false;
  if (parsed.data.password) {
    const { error } = await supabase.auth.signInWithPassword({
      phone: pending.phone_e164,
      password: parsed.data.password,
    });
    authenticated = !error;
  }
  if (pending.account_type !== "customer" && !authenticated)
    return NextResponse.json(
      {
        error:
          "El celular quedó verificado. Escribe nuevamente tu contraseña para terminar el perfil.",
      },
      { status: 409 },
    );

  let onboardingError: string | undefined;
  if (pending.account_type === "provider") {
    const { error } = await supabase.rpc("complete_provider_onboarding", {
      p_name: pending.name,
      p_profession: pending.profession,
      p_phone: pending.phone_e164,
      p_zone: pending.zone,
      p_bio: pending.bio,
      p_first_service: pending.first_service,
    });
    onboardingError = error?.message;
  }
  if (pending.account_type === "business") {
    const { error } = await supabase.rpc("complete_business_onboarding", {
      p_name: pending.name,
      p_category: pending.profession,
      p_phone: pending.phone_e164,
      p_zone: pending.zone,
      p_description: pending.bio,
      p_first_service: pending.first_service,
    });
    onboardingError = error?.message;
  }
  if (onboardingError)
    return NextResponse.json(
      {
        error:
          "El celular quedó verificado, pero no pudimos completar el perfil. Intenta continuar nuevamente.",
      },
      { status: 500 },
    );

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      phone_verified_at: new Date().toISOString(),
      phone_verification_method: "whatsapp_otp",
    })
    .eq("id", user.id);
  if (profileError)
    return NextResponse.json(
      { error: "No pudimos guardar la verificación. Intenta nuevamente." },
      { status: 500 },
    );

  const role =
    pending.account_type === "business"
      ? "business_owner"
      : pending.account_type;
  const { error: roleError } = await admin
    .from("profile_roles")
    .upsert({ profile_id: user.id, role }, { onConflict: "profile_id,role" });
  if (roleError)
    return NextResponse.json(
      {
        error:
          "El celular quedó verificado, pero no pudimos activar el tipo de cuenta. Intenta nuevamente.",
      },
      { status: 500 },
    );

  let recoveryPending = false;
  if (pending.recovery_email) {
    const { error } = await supabase.auth.updateUser(
      { email: pending.recovery_email },
      {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/cuenta`,
      },
    );
    if (!error) {
      recoveryPending = true;
      await admin
        .from("profiles")
        .update({
          recovery_email: pending.recovery_email,
          recovery_email_verified_at: null,
        })
        .eq("id", user.id);
    }
  }
  await admin.from("pending_registrations").delete().eq("id", pending.id);
  return NextResponse.json({
    role,
    recoveryPending,
    authenticated,
    destination: authenticated
      ? pending.account_type === "customer"
        ? "/cuenta"
        : pending.account_type === "provider"
          ? "/dashboard/bienvenida"
          : "/dashboard"
      : "/login",
  });
}
