import "server-only";
import { createClient } from "@/lib/supabase/server";
export async function getTrafficSummary(providerId: string, days: 7 | 30) {
  const client = await createClient();
  return client.rpc("provider_traffic_summary", {
    p_provider: providerId,
    p_since: new Date(Date.now() - days * 86400000).toISOString(),
  });
}
