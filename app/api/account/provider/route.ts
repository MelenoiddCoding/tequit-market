import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  profession: z.string().trim().min(2).max(100),
  phone: z.string().regex(/^[\d\s+()-]{8,20}$/),
  zone: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(20).max(1000),
  firstService: z.string().trim().min(3).max(100),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revisa los datos." },
      { status: 400 },
    );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "Inicia sesión para crear tu perfil." },
      { status: 401 },
    );
  const { data: existing } = await supabase
    .from("provider_profiles")
    .select("id")
    .eq("owner_profile_id", user.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ destination: "/dashboard" });
  const { error } = await supabase.rpc("complete_provider_onboarding", {
    p_name: parsed.data.name,
    p_profession: parsed.data.profession,
    p_phone: parsed.data.phone,
    p_zone: parsed.data.zone,
    p_bio: parsed.data.bio,
    p_first_service: parsed.data.firstService,
  });
  if (error)
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "Ese teléfono ya está asociado a otra cuenta."
            : "No pudimos crear el perfil de prestador.",
      },
      { status: 409 },
    );
  return NextResponse.json(
    { destination: "/dashboard/bienvenida" },
    { status: 201 },
  );
}
