import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL??"http://127.0.0.1:54321";
const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!serviceKey)throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY.");
const supabase=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
const generatedPassword=()=>`${randomBytes(18).toString("base64url")}!9a`;
const demoPassword=generatedPassword();
const adminPassword=generatedPassword();
const providerRows=[
  ["juan-perez","Juan Pérez","Albañil","Tepic y Xalisco",["pegado-de-piso","enjarre","construccion-de-muros","banquetas","impermeabilizacion"]],
  ["miguel-ibarra","Miguel Ibarra","Plomero","Centro y Morelos",["plomeria"]],
  ["sofia-ramirez","Sofía Ramírez","Electricista","Tepic",["electricidad"]],
  ["raul-castaneda","Raúl Castañeda","Técnico en electrodomésticos","Tepic",["reparacion-de-lavadoras"]],
  ["gabriela-ortiz","Gabriela Ortiz","Pintora","Ciudad del Valle",["pintura","impermeabilizacion"]],
  ["oscar-medina","Óscar Medina","Técnico en climatización","Tepic y Xalisco",["minisplits"]],
  ["luis-aranza","Luis Aranza","Carpintero","Las Aves",["carpinteria"]],
  ["mario-galvan","Mario Galván","Soldador","Ciudad Industrial",["soldadura"]],
  ["elena-vega","Elena Vega","Jardinera","Tepic",["jardineria"]],
  ["rosa-nava","Rosa Nava","Especialista en limpieza","Tepic",["limpieza"]],
  ["hector-ruiz","Héctor Ruiz","Albañil","Vistas de la Cantera",["albanileria"]],
  ["andrea-flores","Andrea Flores","Decoradora","Tepic",["decoracion-de-bodas","decoracion-de-eventos"]],
] as const;

async function ensureUser(email:string,name:string,role:"provider"|"business_owner"|"admin",password:string,mustChange=false){
  const list=await supabase.auth.admin.listUsers({perPage:1000});
  let user=list.data.users.find((item)=>item.email===email);
  if(!user){const created=await supabase.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:name,role}});if(created.error)throw created.error;user=created.data.user}
  await supabase.from("profiles").upsert({id:user.id,display_name:name,phone:"5213110000000",must_change_password:mustChange});
  await supabase.from("profile_roles").upsert({profile_id:user.id,role},{onConflict:"profile_id,role"});
  return user.id;
}
async function addService(table:"provider_services"|"business_services",ownerColumn:"provider_id"|"business_id",ownerId:string,slug:string){
  const{data:service}=await supabase.from("canonical_services").select("id,name").eq("slug",slug).single();if(!service)return;
  const{data:existing}=await supabase.from(table).select("id").eq(ownerColumn,ownerId).eq("canonical_service_id",service.id).maybeSingle();
  if(!existing)await supabase.from(table).insert({[ownerColumn]:ownerId,canonical_service_id:service.id,title:service.name,active:true});
}
async function main(){
  for(const[slug,name,profession,zone,serviceSlugs]of providerRows){
    const owner=await ensureUser(`${slug}@demo.tequit.local`,name,"provider",demoPassword);
    const{data:provider,error}=await supabase.from("provider_profiles").upsert({owner_profile_id:owner,slug,name,profession,zone,phone:"5213110000000",bio:`Perfil de muestra de ${profession.toLowerCase()} en Tepic.`,plan:slug==="andrea-flores"?"pro":"free",status:"active",rating:0,review_count:0,is_demo:true},{onConflict:"slug"}).select("id").single();
    if(error)throw error;for(const serviceSlug of serviceSlugs)await addService("provider_services","provider_id",provider.id,serviceSlug);
  }
  const owner=await ensureUser("negocios@demo.tequit.local","Catálogo de muestra","business_owner",demoPassword);
  const categories=Object.fromEntries((await supabase.from("service_categories").select("id,slug")).data?.map((item)=>[item.slug,item.id])??[]);
  const rows=[
    {slug:"concretos-estampados-de-nayarit",name:"Concretos Estampados de Nayarit",category_id:categories.construccion,description:"Ficha de muestra de materiales y aplicación de concreto estampado.",zone:"Ciudad Industrial",address:"Zona Ciudad Industrial, Tepic",service:"concreto-estampado"},
    {slug:"floreria-rosario",name:"Florería Rosario",category_id:categories.eventos,description:"Ficha de muestra de flores y decoración para eventos en Tepic.",zone:"Centro",address:"Centro de Tepic",service:"decoracion-de-bodas"},
    {slug:"ferreteria-la-loma",name:"Ferretería La Loma",category_id:categories.hogar,description:"Ficha de muestra de herramientas y materiales para el hogar.",zone:"La Loma",address:"La Loma, Tepic",service:"impermeabilizacion"},
    {slug:"climas-del-valle",name:"Climas del Valle",category_id:categories.climatizacion,description:"Ficha de muestra de venta y mantenimiento de minisplits.",zone:"Ciudad del Valle",address:"Ciudad del Valle, Tepic",service:"minisplits"},
  ];
  for(const row of rows){
    const{service,...businessRow}=row;
    const{data:business,error}=await supabase.from("businesses").upsert({...businessRow,phone:"5213110000000",status:"active",rating:0,review_count:0,is_demo:true},{onConflict:"slug"}).select("id").single();
    if(error)throw error;await supabase.from("business_members").upsert({business_id:business.id,profile_id:owner,member_role:"owner"},{onConflict:"business_id,profile_id"});await addService("business_services","business_id",business.id,service);
  }
  const adminId=await ensureUser("admin@tequit.market","Administrador Tequit","admin",adminPassword,true);
  await supabase.from("profiles").update({must_change_password:true}).eq("id",adminId);
  console.log(JSON.stringify({adminEmail:"admin@tequit.market",temporaryPassword:adminPassword,providers:providerRows.length,businesses:rows.length}));
}
main().catch((error)=>{console.error(error);process.exit(1)});
