import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

type DemoProvider = {
  number: string;
  name: string;
  category: string;
  parentCategory: string;
  occupation: string;
  services: string[];
  serviceDescription: string;
  projectTitle: string;
  projectDescription: string;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("Faltan las variables administrativas de Supabase.");

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extract(block: string, pattern: RegExp, label: string) {
  const value = block.match(pattern)?.[1]?.trim();
  if (!value) throw new Error(`No se pudo leer ${label}.`);
  return value;
}

function parseProviders(markdown: string): DemoProvider[] {
  const blocks = markdown.split(/(?=^# \d+\. )/m).filter((block) => block.startsWith("# "));
  return blocks.map((block) => {
    const heading = block.match(/^# (\d+)\. (.+)$/m);
    if (!heading) throw new Error("Encabezado de prestador inválido.");
    const servicesBlock = extract(block, /\*\*Servicios:\*\*\s*([\s\S]*?)\s*\*\*Descripción de sus servicios:/, "servicios");
    const services = [...servicesBlock.matchAll(/^\* (.+)$/gm)].map((match) => match[1].trim());
    if (services.length === 0) throw new Error(`No hay servicios para ${heading[2]}.`);

    return {
      number: heading[1].padStart(2, "0"),
      name: heading[2].trim(),
      category: extract(block, /\*\*Categoría:\*\* (.+)/, "categoría"),
      parentCategory: extract(block, /\*\*Categoría principal:\*\* (.+)/, "categoría principal"),
      occupation: extract(block, /\*\*A qué se dedica:\*\*\s*([\s\S]*?)\s*\*\*Servicios:/, "ocupación"),
      services,
      serviceDescription: extract(block, /\*\*Descripción de sus servicios:\*\*\s*([\s\S]*?)\s*\*\*Proyecto realizado:/, "descripción de servicios"),
      projectTitle: extract(block, /\*\*Proyecto realizado:\*\*\s*\*\*(.+?)\*\*/, "proyecto"),
      projectDescription: extract(block, /\*\*Descripción del proyecto:\*\*\s*([\s\S]*?)(?:\s*---|$)/, "descripción del proyecto"),
    };
  });
}

async function uploadWebp(bucket: string, storagePath: string, sourcePath: string, width: number, height: number) {
  const image = await sharp(sourcePath)
    .rotate()
    .resize(width, height, { fit: "cover", position: "attention" })
    .webp({ quality: 84 })
    .toBuffer();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, image, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) throw error;
}

async function main() {
  const demoRoot = path.join(process.cwd(), "public", "images", "demo");
  const markdown = await readFile(path.join(demoRoot, "prestadores.md"), "utf8");
  const providers = parseProviders(markdown);
  if (providers.length !== 20) throw new Error(`Se esperaban 20 perfiles y se encontraron ${providers.length}.`);

  const { data: categories, error: categoryError } = await supabase
    .from("canonical_provider_categories")
    .select("id,name,marketplace_categories(name)")
    .eq("active", true);
  if (categoryError) throw categoryError;

  const categoryByName = new Map(categories.map((category) => [category.name.toLocaleLowerCase("es-MX"), category]));
  const phone = process.env.DEMO_WHATSAPP_NUMBER || "5213110000000";

  for (const provider of providers) {
    const canonical = categoryByName.get(provider.category.toLocaleLowerCase("es-MX"));
    const parent = (canonical?.marketplace_categories as unknown as { name: string } | null)?.name;
    if (!canonical || parent !== provider.parentCategory) {
      throw new Error(`La categoría ${provider.category} no coincide con ${provider.parentCategory}.`);
    }

    const slug = `demo-${slugify(provider.name)}`;
    const avatarPath = `demo/${slug}/avatar.webp`;
    const coverPath = `demo/${slug}/cover.webp`;
    const projectPath = `demo/${slug}/project-01.webp`;
    const avatarSource = path.join(demoRoot, "prestadores_profile_img", `${provider.number}.png`);
    const projectSource = path.join(demoRoot, "proyectos_img", `${provider.number}.png`);

    await Promise.all([
      uploadWebp("avatars", avatarPath, avatarSource, 800, 800),
      uploadWebp("provider-work", coverPath, projectSource, 1600, 900),
      uploadWebp("provider-work", projectPath, projectSource, 1400, 1050),
    ]);

    const { data: saved, error: providerError } = await supabase
      .from("provider_profiles")
      .upsert({
        owner_profile_id: null,
        slug,
        name: provider.name,
        profession: provider.category,
        bio: `${provider.occupation} ${provider.serviceDescription}`,
        phone,
        zone: "Tepic, Nayarit",
        plan: "free",
        status: "active",
        avatar_path: avatarPath,
        rating: 0,
        review_count: 0,
        is_demo: true,
        onboarding_step: 4,
      }, { onConflict: "slug" })
      .select("id")
      .single();
    if (providerError) throw providerError;

    const providerId = saved.id;
    const cleanup = await Promise.all([
      supabase.from("provider_categories").delete().eq("provider_id", providerId),
      supabase.from("provider_services").delete().eq("provider_id", providerId),
      supabase.from("provider_media").delete().eq("provider_id", providerId),
    ]);
    const cleanupError = cleanup.find((result) => result.error)?.error;
    if (cleanupError) throw cleanupError;

    const { error: assignmentError } = await supabase.from("provider_categories").insert({
      provider_id: providerId,
      canonical_category_id: canonical.id,
      assignment_role: "primary",
    });
    if (assignmentError) throw assignmentError;

    const { error: servicesError } = await supabase.from("provider_services").insert(
      provider.services.map((title) => ({
        provider_id: providerId,
        title,
        description: provider.serviceDescription,
        active: true,
        quote_only: true,
      })),
    );
    if (servicesError) throw servicesError;

    const { error: siteError } = await supabase.from("provider_site_settings").upsert({
      provider_id: providerId,
      headline: `${provider.category} en Tepic`,
      intro: provider.occupation,
      cover_path: coverPath,
    });
    if (siteError) throw siteError;

    const { error: mediaError } = await supabase.from("provider_media").insert({
      provider_id: providerId,
      storage_path: projectPath,
      title: provider.projectTitle,
      description: provider.projectDescription,
      media_role: "portfolio",
      sort_order: 0,
    });
    if (mediaError) throw mediaError;

    console.log(`${provider.number}/20 ${provider.name}`);
  }

  const { count, error: countError } = await supabase
    .from("provider_profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", true)
    .eq("status", "active");
  if (countError) throw countError;
  console.log(JSON.stringify({ activeDemoProviders: count }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
