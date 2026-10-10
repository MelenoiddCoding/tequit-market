import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
const schema = z.discriminatedUnion("action", [
  z.object({action:z.literal("update"),providerId:z.string().uuid(),id:z.string().uuid(),title:z.string().trim().min(3).max(120),description:z.string().trim().max(500)}),
  z.object({action:z.literal("delete"),providerId:z.string().uuid(),id:z.string().uuid()}),
]);
export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.roles.includes("admin")) return NextResponse.json({error:"No autorizado."},{status:403});
  const parsed = schema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return NextResponse.json({error:"Revisa título y descripción."},{status:400});
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({error:"Servicio no disponible."},{status:503});
  const value = parsed.data;
  const {error} = await admin.rpc("admin_maintain_portfolio", {p_actor:session.user.id,p_provider:value.providerId,p_media:value.id,p_action:value.action,p_title:value.action==="update"?value.title:"",p_description:value.action==="update"?value.description:""});
  if (error) return NextResponse.json({error:"No se pudo guardar el trabajo. Recarga e inténtalo de nuevo."},{status:409});
  return NextResponse.json({ok:true});
}
