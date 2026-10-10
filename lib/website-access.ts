import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
export type WebsiteAccess = {
  active: boolean;
  endsAt: string | null;
  source: string | null;
};
export async function getWebsiteAccess(
  providerId: string,
): Promise<WebsiteAccess> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true")
    return { active: true, endsAt: null, source: "demo" };
  const admin = createAdminClient();
  if (!admin) return { active: false, endsAt: null, source: null };
  const { data, error } = await admin
    .from("provider_website_access")
    .select("enabled,starts_at,ends_at,source")
    .eq("provider_id", providerId)
    .maybeSingle();
  if (error) throw new Error("No se pudo consultar la vigencia del sitio.");
  const now = Date.now();
  return {
    active: Boolean(
      data?.enabled &&
      Date.parse(data.starts_at) <= now &&
      (!data.ends_at || Date.parse(data.ends_at) > now),
    ),
    endsAt: data?.ends_at ?? null,
    source: data?.source ?? null,
  };
}
