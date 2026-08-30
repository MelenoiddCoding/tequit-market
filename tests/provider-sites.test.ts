import {describe,expect,it} from "vitest";
import fs from "node:fs";
import path from "node:path";
import {providerSeoEligibility} from "@/lib/provider-site";

const sql=fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202608290002_provider_sites.sql"),"utf8");

describe("sitios de prestadores",()=>{
  const complete={bio:"Una presentación completa ".repeat(7),phone:"5213111234567",services:[{id:"s1",slug:"mantenimiento",name:"Mantenimiento",category:"Hogar",description:"Una descripción útil y específica del servicio ofrecido."}],portfolio:[{id:"w1",image:"/trabajo.webp",title:"Trabajo terminado",description:"Descripción completa del proyecto realizado para un cliente local."}],status:"active" as const};
  it("protege configuración y preguntas con RLS",()=>{expect(sql).toContain("alter table public.provider_site_settings enable row level security");expect(sql).toContain("public.owns_provider(provider_id)");expect(sql).toContain("owner manages provider faqs")});
  it("exige contenido suficiente antes de indexar",()=>{expect(providerSeoEligibility({...complete,isDemo:false}).eligible).toBe(true);expect(providerSeoEligibility({...complete,bio:"Breve",phone:"123",services:[],portfolio:[],isDemo:false}).eligible).toBe(false)});
  it("nunca indexa perfiles demo",()=>{expect(providerSeoEligibility({...complete,isDemo:true}).eligible).toBe(false)});
});
