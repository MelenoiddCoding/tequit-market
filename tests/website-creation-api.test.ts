import { beforeEach, describe, expect, it, vi } from "vitest";
import { WEBSITE_TEMPLATES } from "@/lib/website-offer";
vi.mock("server-only",()=>({}));
const state=vi.hoisted(()=>({roles:["admin"],settings:[] as Record<string,unknown>[],fail:false}));
vi.mock("@/lib/auth",()=>({getSessionProfile:async()=>({user:{id:"admin"},roles:state.roles})}));
vi.mock("@/lib/plans",()=>({getProviderPlan:vi.fn()}));
const id="20000000-0000-4000-8000-000000000001";
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:()=>({
 rpc:async()=>({data:"prestador-prueba",error:null}),
 from:(table:string)=>{
  const category={id:"20000000-0000-4000-8000-000000000001",name:"Mantenimiento",active:true};
  const row=table==="canonical_provider_categories"?category:{id:category.id};
  const query={select:()=>query,eq:()=>query,in:()=>query,delete:()=>query,update:()=>query,insert:()=>query,
   upsert:(values:Record<string,unknown>)=>{state.settings.push(values);return query;},
   maybeSingle:async()=>({data:row,error:null}),single:async()=>({data:row,error:null}),
   then:(resolve:(v:unknown)=>unknown)=>Promise.resolve({data:[category],error:table==="provider_site_settings"&&state.fail?{message:"save failed"}:null}).then(resolve)};
  return query;
 }
})}));
import { POST } from "@/app/api/admin/onboardings/route";
const request=(templateId:string)=>new Request("http://localhost/api/admin/onboardings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"create",kind:"provider",name:"Prestador prueba",phone:"3111234567",profession:"Mantenimiento",zone:"Tepic",primaryCategoryId:id,source:"whatsapp",templateId})});
beforeEach(()=>{state.roles=["admin"];state.settings=[];state.fail=false;});
describe("creación administrativa con los once diseños",()=>{
 it.each(WEBSITE_TEMPLATES)("guarda $name desde la creación",async template=>{
  expect((await POST(request(template.id))).status).toBe(201);
  expect(state.settings).toEqual([expect.objectContaining({template_id:template.id})]);
 });
 it("rechaza diseño desconocido y acceso de propietario",async()=>{
  expect((await POST(request("desconocido"))).status).toBe(400);
  state.roles=["provider"];
  expect((await POST(request("base"))).status).toBe(403);
  expect(state.settings).toEqual([]);
 });
 it("no informa éxito cuando falla el guardado del diseño",async()=>{
  state.fail=true;
  expect((await POST(request("base"))).status).toBe(409);
 });
});
