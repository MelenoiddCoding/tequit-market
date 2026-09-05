import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowRequest } from "@/lib/rate-limit";
const destinations = [
  "home",
  "search",
  "businesses",
  "request",
  "favorites",
  "account",
] as const;
const eventSchema = z
  .object({
    type: z.enum([
      "profile_view",
      "whatsapp_click",
      "phone_call_click",
      "request_created",
      "service_view",
      "business_view",
      "qr_visit",
      "shared_link_visit",
      "share_action",
      "marketplace_nav_open",
      "marketplace_nav_click",
    ]),
    target: z.string().max(200).optional(),
    targetType: z.enum(["provider", "business"]).optional(),
    destination: z.enum(destinations).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const navigation =
      value.type === "marketplace_nav_open" ||
      value.type === "marketplace_nav_click";
    if (navigation && (!value.target || value.targetType !== "provider"))
      context.addIssue({ code: "custom", message: "Navegación inválida" });
    if (value.type === "marketplace_nav_click" && !value.destination)
      context.addIssue({ code: "custom", message: "Destino requerido" });
    if (value.type === "marketplace_nav_open" && value.destination)
      context.addIssue({ code: "custom", message: "Destino inesperado" });
    if (!navigation && value.destination)
      context.addIssue({ code: "custom", message: "Destino inesperado" });
  });
export async function POST(request: Request) {
  if (!(await allowRequest(request, "event", 60, 60)))
    return NextResponse.json({ recorded: false }, { status: 429 });
  const parsed = eventSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
  const admin = createAdminClient();
  if (admin && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    let providerId: string | undefined,
      businessId: string | undefined,
      serviceId: string | undefined;
    const providerEvent =
      [
        "profile_view",
        "qr_visit",
        "shared_link_visit",
        "share_action",
        "marketplace_nav_open",
        "marketplace_nav_click",
      ].includes(parsed.data.type) ||
      (["whatsapp_click", "phone_call_click"].includes(parsed.data.type) &&
        parsed.data.targetType === "provider");
    if (providerEvent && parsed.data.target) {
      const row = (
        await admin
          .from("provider_profiles")
          .select("id,is_demo")
          .eq("slug", parsed.data.target)
          .maybeSingle()
      ).data;
      if (row && !row.is_demo) providerId = row.id;
    }
    if (
      (parsed.data.type === "business_view" ||
        (parsed.data.type === "whatsapp_click" &&
          parsed.data.targetType === "business")) &&
      parsed.data.target
    ) {
      const row = (
        await admin
          .from("businesses")
          .select("id,is_demo")
          .eq("slug", parsed.data.target)
          .maybeSingle()
      ).data;
      if (row && !row.is_demo) businessId = row.id;
    }
    if (parsed.data.type === "service_view" && parsed.data.target)
      serviceId = (
        await admin
          .from("canonical_services")
          .select("id")
          .eq("slug", parsed.data.target)
          .maybeSingle()
      ).data?.id;
    if (!providerId && !businessId && !serviceId)
      return NextResponse.json(
        { recorded: false, at: new Date().toISOString() },
        { status: 201 },
      );
    await admin
      .from("contact_events")
      .insert({
        event_type: parsed.data.type,
        provider_id: providerId,
        business_id: businessId,
        service_id: serviceId,
        metadata: {
          target: parsed.data.target,
          ...(parsed.data.destination
            ? { destination: parsed.data.destination }
            : {}),
        },
      });
  }
  return NextResponse.json(
    { recorded: true, at: new Date().toISOString() },
    { status: 201 },
  );
}
