import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth";
import { TRAFFIC_SOURCES, TRAFFIC_SURFACES } from "@/lib/traffic";
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
      "website_view",
      "directory_view",
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
    eventId: z.string().min(8).max(300).optional(),
    attribution: z
      .object({
        source: z.enum(TRAFFIC_SOURCES),
        tagged: z.boolean(),
        journeyId: z.string().uuid(),
        surface: z.enum(TRAFFIC_SURFACES),
        entrySurface: z.enum(TRAFFIC_SURFACES),
        previousSurface: z.enum(TRAFFIC_SURFACES).nullable(),
      })
      .strict()
      .optional(),
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
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
  const admin = createAdminClient();
  if (admin && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    const session = await getSessionProfile();
    if (session?.roles.includes("admin"))
      return NextResponse.json({ recorded: false });
    let providerId: string | undefined,
      businessId: string | undefined,
      serviceId: string | undefined;
    const providerEvent =
      [
        "profile_view",
        "website_view",
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
          .select("id,is_demo,owner_profile_id,status")
          .eq("slug", parsed.data.target)
          .maybeSingle()
      ).data;
      if (
        row &&
        !row.is_demo &&
        row.status === "active" &&
        row.owner_profile_id !== session?.user.id
      )
        providerId = row.id;
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
    if (
      !providerId &&
      !businessId &&
      !serviceId &&
      parsed.data.type !== "directory_view"
    )
      return NextResponse.json(
        { recorded: false, at: new Date().toISOString() },
        { status: 201 },
      );
    const { error } = await admin.from("contact_events").insert({
      event_type: parsed.data.type,
      event_key: parsed.data.eventId,
      provider_id: providerId,
      business_id: businessId,
      service_id: serviceId,
      metadata: {
        ...(parsed.data.type !== "directory_view"
          ? { target: parsed.data.target }
          : {}),
        ...(parsed.data.attribution ?? {}),
        ...(parsed.data.destination
          ? { destination: parsed.data.destination }
          : {}),
      },
    });
    if (error && error.code !== "23505")
      return NextResponse.json({ recorded: false }, { status: 503 });
    return NextResponse.json(
      { recorded: !error, duplicate: error?.code === "23505" },
      { status: 201 },
    );
  }
  return NextResponse.json(
    { recorded: false, at: new Date().toISOString() },
    { status: 201 },
  );
}
