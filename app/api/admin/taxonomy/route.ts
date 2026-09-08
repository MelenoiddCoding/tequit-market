import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const common = { id: z.string().uuid().nullable(), name: z.string().trim().min(2).max(100), description: z.string().trim().max(300), active: z.boolean() };
const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("parent"), ...common }),
  z.object({ kind: z.literal("canonical"), ...common, parentId: z.string().uuid(), aliases: z.array(z.string().trim().min(2).max(80)).max(20), requiresReview: z.boolean() }),
]);

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.roles.includes("admin")) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos de la categoría." }, { status: 400 });
  const value = parsed.data;
  const admin = createAdminClient()!;
  const table = value.kind === "parent" ? "marketplace_categories" : "canonical_provider_categories";
  const payload = value.kind === "parent"
    ? { name: value.name, description: value.description, active: value.active }
    : { name: value.name, description: value.description, active: value.active, marketplace_category_id: value.parentId, requires_review: value.requiresReview };
  let id = value.id;
  let error;
  if (id) ({ error } = await admin.from(table).update(payload).eq("id", id));
  else {
    const result = await admin.from(table).insert({ ...payload, slug: slugify(value.name) }).select("id").single();
    id = result.data?.id ?? null; error = result.error;
  }
  if (error || !id) return NextResponse.json({ error: error?.code === "23505" ? "Ya existe una categoría con ese nombre." : "No pudimos guardar la categoría." }, { status: 409 });
  if (value.kind === "canonical") {
    await admin.from("canonical_provider_category_aliases").delete().eq("canonical_category_id", id);
    const aliases = [...new Set(value.aliases.map((alias) => alias.trim()).filter(Boolean))];
    if (aliases.length) {
      const { error: aliasError } = await admin.from("canonical_provider_category_aliases").insert(aliases.map((alias) => ({ canonical_category_id: id, alias })));
      if (aliasError) return NextResponse.json({ error: "La categoría se guardó, pero no pudimos guardar sus alias." }, { status: 409 });
    }
  }
  await admin.from("admin_audit_logs").insert({ admin_profile_id: session.user.id, action: "taxonomy_saved", entity_type: value.kind === "parent" ? "marketplace_category" : "canonical_provider_category", entity_id: id, metadata: value });
  return NextResponse.json({ ok: true, id });
}
