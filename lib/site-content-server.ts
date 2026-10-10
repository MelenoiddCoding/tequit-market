import { WEBSITE_TEMPLATE_IDS } from "@/lib/website-offer";
import { WEBSITE_DETAIL_FIELDS, normalizeWebsiteDetails } from "@/lib/website-details";
import { WEBSITE_SERVICE_ICON_IDS } from "@/lib/website-service-icons";
import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
const optionalUrl = z.union([
  z.literal(""),
  z
    .string()
    .url()
    .max(300)
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "Usa un enlace http o https.",
    ),
]);
const schema = z.object({
  providerId: z.string().uuid(),
  details: z.object(Object.fromEntries(WEBSITE_DETAIL_FIELDS.map(f=>[f.key,z.string().trim().max(f.max).optional()]))).strict().optional(),
  headline: z.string().trim().min(8).max(120),
  intro: z.string().trim().min(40).max(1200),
  yearsExperience: z.number().int().min(0).max(80).nullable(),
  coverPath: z.string().max(300).nullable(),
  avatarPath: z.string().max(300).nullable(),
  socialLinks: z.object({
    facebook: optionalUrl,
    instagram: optionalUrl,
    tiktok: optionalUrl,
    website: optionalUrl,
  }),
  services: z
    .array(
      z.object({
        id: z.string().uuid(),
        description: z.string().trim().max(500),
      }),
    )
    .max(30),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().min(8).max(160),
        answer: z.string().trim().min(12).max(600),
      }),
    )
    .max(6),
}).strict();
const adminSchema = schema.extend({
  serviceIcons: z.record(z.string().uuid(), z.enum(WEBSITE_SERVICE_ICON_IDS)).refine(value => Object.keys(value).length <= 30).optional(),
  templateId: z.enum(WEBSITE_TEMPLATE_IDS),
  theme: z.enum(["tequit", "claro", "oscuro", "tierra"]),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  whiteLabel: z.boolean(),
});

export async function saveSiteContent(request: Request, adminMode: boolean) {
  const session = await getSessionProfile();
  if (!session || (adminMode && !session.roles.includes("admin")))
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = (adminMode ? adminSchema : schema).safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revisa los datos." },
      { status: 400 },
    );
  const value = parsed.data,
    admin = createAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Servicio no disponible." },
      { status: 503 },
    );
  const { data: provider } = await admin
    .from("provider_profiles")
    .select("id,owner_profile_id,avatar_path")
    .eq("id", value.providerId)
    .maybeSingle();
  if (
    !provider ||
    (!adminMode && provider.owner_profile_id !== session.user.id)
  )
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const { data: current } = await admin
    .from("provider_site_settings")
    .select("cover_path,template_id,details")
    .eq("provider_id", value.providerId)
    .maybeSingle();
  const validPath = (path: string | null, existing: string | null) =>
    !path ||
    (!path.includes("..") &&
      !path.includes("\\") &&
      (path === existing ||
        path.startsWith(`${session.user.id}/`) ||
        path.startsWith(`${provider.id}/`) ||
        (provider.owner_profile_id &&
          path.startsWith(`${provider.owner_profile_id}/`))));
  if (
    !validPath(value.coverPath, current?.cover_path ?? null) ||
    !validPath(value.avatarPath, provider.avatar_path)
  )
    return NextResponse.json(
      { error: "Ruta de imagen inválida." },
      { status: 400 },
    );
  const templateId = "templateId" in value ? value.templateId : current?.template_id;
  if (templateId && templateId !== "legacy" && value.faqs.length > 3)
    return NextResponse.json({error: "La plantilla admite hasta tres preguntas frecuentes."}, {status: 400});
  const existingIcons = normalizeWebsiteDetails(current?.details).serviceIcons ?? {};
  const serviceIcons = "serviceIcons" in value && value.serviceIcons ? value.serviceIcons : existingIcons;
  if (adminMode && Object.keys(serviceIcons).some(id => !value.services.some(service => service.id === id)))
    return NextResponse.json({error: "Un icono corresponde a un servicio que ya no está en la página."}, {status: 400});
  const content = {
    ...value,
    details: { ...value.details, ...(Object.keys(serviceIcons).length ? { serviceIcons } : {}) },
  };
  const { error } = await admin.rpc("save_provider_website_content", {
    p_actor: session.user.id,
    p_provider: provider.id,
    p_admin: adminMode,
    p_content: content,
    p_branding: adminMode,
  });
  if (error)
    return NextResponse.json(
      {
        error: "No se guardó el sitio. Revisa los datos e inténtalo de nuevo.",
      },
      { status: 409 },
    );
  return NextResponse.json({ ok: true });
}
