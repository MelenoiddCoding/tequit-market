import {beforeEach,describe,expect,it,vi} from "vitest";
vi.mock("server-only",()=>({}));
const state=vi.hoisted(()=>({status:"draft",consent:true,workPoint:true,roles:["admin"],writes:[] as {table:string;values:unknown}[]}));
vi.mock("@/lib/auth",()=>({getSessionProfile:async()=>({user:{id:"admin"},roles:state.roles})}));
vi.mock("@/lib/plans",()=>({getProviderPlan:vi.fn()}));
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:()=>({from:(table:string)=>{
 const entity={name:"Prestador existente",phone:"3110000000",zone:"Tepic",slug:"existente",bio:"Descripción del prestador con servicios para el hogar.",status:state.status};
 const data=table==="assisted_onboardings"?{id:"20000000-0000-4000-8000-000000000001",kind:"provider",provider_id:"20000000-0000-4000-8000-000000000002",status:"claimed",consent_confirmed:state.consent}:table==="provider_locations"?(state.workPoint?{provider_id:"20000000-0000-4000-8000-000000000002",market_city_slug:"tepic"}:null):entity;
 const query={select:()=>query,eq:()=>query,in:()=>query,update:(values:unknown)=>{state.writes.push({table,values});return query;},insert:(values:unknown)=>{state.writes.push({table,values});return query;},maybeSingle:async()=>({data}),single:async()=>({data}),then:(resolve:(value:unknown)=>unknown)=>Promise.resolve({data,count:1,error:null}).then(resolve)};
 return query;
}})}));
import {POST} from "@/app/api/admin/onboardings/route";
const request=()=>new Request("http://localhost/api/admin/onboardings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"publish",id:"20000000-0000-4000-8000-000000000001"})});
beforeEach(()=>{state.status="draft";state.consent=true;state.workPoint=true;state.roles=["admin"];state.writes=[];});
describe("publicación desde Páginas de una ficha con titular",()=>{
 it("publica el borrador autorizado sin transferir la cuenta ni emitir reclamo",async()=>{
  const response=await POST(request());expect(response.status).toBe(200);expect((await response.json()).claimUrl).toBeNull();
  expect(state.writes).toContainEqual({table:"provider_profiles",values:{status:"active"}});
  expect(state.writes.find(w=>w.table==="assisted_onboardings")?.values).toMatchObject({status:"claimed"});
  expect(state.writes.some(w=>w.table==="managed_profile_claims")).toBe(false);
 });
 it("no vuelve a publicar una ficha reclamada que ya está activa",async()=>{state.status="active";expect((await POST(request())).status).toBe(409);expect(state.writes).toEqual([]);});
 it("exige consentimiento guardado",async()=>{state.consent=false;expect((await POST(request())).status).toBe(409);expect(state.writes).toEqual([]);});
 it("no publica sin punto de trabajo validado",async()=>{state.workPoint=false;expect((await POST(request())).status).toBe(409);expect(state.writes).toEqual([]);});
 it("exige rol administrativo",async()=>{state.roles=["provider"];expect((await POST(request())).status).toBe(403);expect(state.writes).toEqual([]);});
});
