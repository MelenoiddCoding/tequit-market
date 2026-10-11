import {NextResponse} from "next/server";
import {z} from "zod";
import {createClient} from "@/lib/supabase/server";

const schema=z.object({providerId:z.string().uuid(),location:z.object({citySlug:z.enum(["tepic","uruapan"]),coverageCities:z.array(z.enum(["tepic","uruapan"])).min(1).max(2),source:z.enum(["browser","manual","area","existing"]),areaSlug:z.string().max(100).nullable(),lat:z.number().min(-90).max(90).nullable(),lng:z.number().min(-180).max(180).nullable(),accuracy:z.number().int().min(0).max(100000).nullable()})});
export async function POST(request:Request){
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Revisa la ubicación y la cobertura."},{status:400});
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Tu sesión terminó."},{status:401});
  const{providerId,location}=parsed.data;
  const{error}=location.source==="existing"
    ?await supabase.rpc("save_provider_coverage_cities",{p_provider:providerId,p_coverage_cities:location.coverageCities})
    :await supabase.rpc("save_provider_discovery_location",{p_provider:providerId,p_city_slug:location.citySlug,p_area_slug:location.areaSlug,p_lat:location.lat,p_lng:location.lng,p_source:location.source,p_accuracy_m:location.accuracy,p_coverage_cities:location.coverageCities});
  if(error)return NextResponse.json({error:"El punto no corresponde a la ciudad elegida o no tienes acceso al perfil."},{status:409});
  return NextResponse.json({ok:true});
}
