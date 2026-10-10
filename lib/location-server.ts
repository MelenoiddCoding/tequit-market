import "server-only";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { LOCATION_COOKIE, parseDiscoveryLocation, type DiscoveryArea } from "@/lib/location";

const fallbackAreas:DiscoveryArea[]=[
  {slug:"tepic",name:"Tepic",city:"Tepic",state:"Nayarit",type:"municipality"},
  {slug:"centro",name:"Centro",city:"Tepic",state:"Nayarit",type:"neighborhood"},
  {slug:"ciudad-del-valle",name:"Ciudad del Valle",city:"Tepic",state:"Nayarit",type:"neighborhood"},
  {slug:"las-canteras",name:"Las Canteras",city:"Tepic",state:"Nayarit",type:"neighborhood"},
  {slug:"lomas-de-la-cruz",name:"Lomas de la Cruz",city:"Tepic",state:"Nayarit",type:"neighborhood"},
  {slug:"mololoa",name:"Mololoa",city:"Tepic",state:"Nayarit",type:"neighborhood"},
  {slug:"valle-de-matatipac",name:"Valle de Matatipac",city:"Tepic",state:"Nayarit",type:"neighborhood"},
  {slug:"xalisco",name:"Xalisco",city:"Xalisco",state:"Nayarit",type:"municipality"},
  {slug:"uruapan",name:"Uruapan",city:"Uruapan",state:"Michoacán",type:"municipality"},
];

export async function getDiscoveryLocation(areaSlug?: string) {
  if (areaSlug) return { source: "manual" as const, areaSlug, label: areaSlug.split("-").map((part)=>part.charAt(0).toUpperCase()+part.slice(1)).join(" ") };
  const store = await cookies();
  return parseDiscoveryLocation(store.get(LOCATION_COOKIE)?.value);
}

export async function getDiscoveryAreas(): Promise<DiscoveryArea[]> {
  const admin = createAdminClient();
  if (!admin) return fallbackAreas;
  const { data } = await admin.from("service_areas").select("slug,name,city,state,area_type").eq("active", true).order("city").order("area_type").order("name");
  const areas=(data ?? []).map((area) => ({ slug: area.slug, name: area.name, city: area.city, state: area.state, type: area.area_type as DiscoveryArea["type"] }));
  return areas.length?areas:fallbackAreas;
}
