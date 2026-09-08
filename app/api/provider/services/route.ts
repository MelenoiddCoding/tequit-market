import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    name: z.string().trim().min(3).max(100),
    description: z.string().trim().min(10).max(500),
    brands: z.array(z.string().trim().min(1).max(50)).max(10).default([]),
    priceFrom: z.number().min(0).max(99999999).nullable().default(null),
    quoteOnly: z.boolean().default(true),
    kind: z.enum(["provider", "business"]),
    entityId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("toggle"),
    id: z.string().uuid(),
    active: z.boolean(),
    kind: z.enum(["provider", "business"]),
    entityId: z.string().uuid(),
  }),
]);
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Tu sesión terminó." }, { status: 401 });
  const table =
    parsed.data.kind === "provider" ? "provider_services" : "business_services";
  const ownerColumn =
    parsed.data.kind === "provider" ? "provider_id" : "business_id";
  if (parsed.data.action === "toggle") {
    const { data, error } = await supabase
      .from(table)
      .update({ active: parsed.data.active })
      .eq("id", parsed.data.id)
      .eq(ownerColumn, parsed.data.entityId)
      .select("id,active")
      .maybeSingle();
    if (error || !data) {
      const limit = error?.message.match(/PLAN_SERVICE_LIMIT:(\d+)/)?.[1];
      return NextResponse.json(
        {
          error: limit
            ? `Tu plan permite hasta ${limit} servicios activos.`
            : "No pudimos actualizar el servicio.",
        },
        { status: limit ? 409 : 403 },
      );
    }
    return NextResponse.json(data);
  }
  const { data, error } = await supabase
    .from(table)
    .insert({
      [ownerColumn]: parsed.data.entityId,
      canonical_service_id: null,
      title: parsed.data.name,
      description: parsed.data.description,
      ...(parsed.data.kind === "provider" ? { brands: parsed.data.brands, price_from: parsed.data.quoteOnly ? null : parsed.data.priceFrom, quote_only: parsed.data.quoteOnly } : {}),
      active: true,
    })
    .select("id,title,description,active")
    .single();
  if (error) {
    const limit = error.message.match(/PLAN_SERVICE_LIMIT:(\d+)/)?.[1];
    return NextResponse.json(
      {
        error: limit
          ? `Tu plan permite hasta ${limit} servicios activos.`
          : "No pudimos agregar el servicio.",
      },
      { status: 409 },
    );
  }
  return NextResponse.json(
    { id: data.id, name: data.title, description: data.description, brands: parsed.data.brands, priceFrom: parsed.data.quoteOnly ? null : parsed.data.priceFrom, quoteOnly: parsed.data.quoteOnly, active: data.active },
    { status: 201 },
  );
}
