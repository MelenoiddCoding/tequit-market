import { WEBSITE_TEMPLATES } from "@/lib/website-offer";
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only",()=>({}));
const mocks=vi.hoisted(()=>({session:vi.fn(),client:vi.fn(),rpc:vi.fn()}));
vi.mock("@/lib/auth",()=>({getSessionProfile:mocks.session}));
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:mocks.client}));
import { saveSiteContent } from "@/lib/site-content-server";
const id="20000000-0000-4000-8000-000000000001";
const content={providerId:id,headline:"Pintura para tu casa",intro:"Pintura y mantenimiento con atención directa en la ciudad de Tepic.",yearsExperience:null,coverPath:null,avatarPath:null,socialLinks:{facebook:"",instagram:"",tiktok:"",website:""},services:[],faqs:[]};
function request(body:unknown){return new Request("http://localhost/api/dashboard/site",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});}
beforeEach(()=>{
 vi.clearAllMocks();
 mocks.session.mockResolvedValue({user:{id:"owner"},roles:["provider"]});
 mocks.rpc.mockResolvedValue({error:null});
 mocks.client.mockReturnValue({rpc:mocks.rpc,from:(table:string)=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:table==="provider_profiles"?{id,owner_profile_id:"owner",avatar_path:null}:{cover_path:null,template_id:"hogar"}})})})})});
});
describe("contrato de edición del sitio",()=>{
 it("guarda contenido del titular sin facultades de diseño",async()=>{
   expect((await saveSiteContent(request(content),false)).status).toBe(200);
   expect(mocks.rpc).toHaveBeenCalledWith("save_provider_website_content",expect.objectContaining({p_admin:false,p_branding:false,p_provider:id}));
 });
 it.each([{templateId:"oficio"},{theme:"oscuro"},{accentColor:"#ffffff"},{whiteLabel:true}])("rechaza campos de diseño del titular: %j",async design=>{
   expect((await saveSiteContent(request({...content,...design}),false)).status).toBe(400);
   expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it("rechaza acceso administrativo del titular y contenido ajeno",async()=>{
   expect((await saveSiteContent(request(content),true)).status).toBe(403);
   mocks.session.mockResolvedValue({user:{id:"other"},roles:["provider"]});
   expect((await saveSiteContent(request(content),false)).status).toBe(403);
   expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it("valida tres preguntas en plantillas beta y preserva error de guardado",async()=>{
   expect((await saveSiteContent(request({...content,faqs:Array.from({length:4},()=>({question:"¿Dónde atiendes?",answer:"En toda la ciudad de Tepic."}))}),false)).status).toBe(400);
   mocks.rpc.mockResolvedValue({error:{message:"conflict"}});
   expect((await saveSiteContent(request(content),false)).status).toBe(409);
 });
 it.each(WEBSITE_TEMPLATES)("permite al administrador seleccionar $name",async template=>{
   mocks.session.mockResolvedValue({user:{id:"admin"},roles:["admin"]});
   expect((await saveSiteContent(request({...content,templateId:template.id,details:{address:"Tepic",hours:"Lunes a viernes"},theme:"tequit",accentColor:"#254432",whiteLabel:false}),true)).status).toBe(200);
   expect(mocks.rpc).toHaveBeenCalledWith("save_provider_website_content",expect.objectContaining({p_admin:true,p_branding:true}));
 });
});
