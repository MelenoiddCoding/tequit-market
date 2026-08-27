import { createClient } from "@supabase/supabase-js";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL??"http://127.0.0.1:54321";
const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!serviceKey)throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY. Copia la clave local mostrada por `supabase status`.");
const supabase=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
const password="Tequit123!";
const providerRows=[
  ["provider@tequit.local","Juan Pérez","juan-perez","Albañil","Tepic y Xalisco"],
  ["miguel@tequit.local","Miguel Ibarra","miguel-ibarra","Plomero","Centro y Morelos"],
  ["sofia@tequit.local","Sofía Ramírez","sofia-ramirez","Electricista","Tepic"],
  ["raul@tequit.local","Raúl Castañeda","raul-castaneda","Técnico en electrodomésticos","Tepic"],
  ["gabriela@tequit.local","Gabriela Ortiz","gabriela-ortiz","Pintora","Ciudad del Valle"],
  ["oscar@tequit.local","Óscar Medina","oscar-medina","Técnico en climatización","Tepic y Xalisco"],
  ["luis@tequit.local","Luis Aranza","luis-aranza","Carpintero","Las Aves"],
  ["mario@tequit.local","Mario Galván","mario-galvan","Soldador","Ciudad Industrial"],
  ["elena@tequit.local","Elena Vega","elena-vega","Jardinera","Tepic"],
  ["rosa@tequit.local","Rosa Nava","rosa-nava","Especialista en limpieza","Tepic"],
  ["hector@tequit.local","Héctor Ruiz","hector-ruiz","Albañil","Vistas de la Cantera"],
  ["andrea@tequit.local","Andrea Flores","andrea-flores","Decoradora","Tepic"],
] as const;

async function ensureUser(email:string,name:string,role:"provider"|"business_owner"|"admin"){
  const list=await supabase.auth.admin.listUsers({perPage:1000});
  let user=list.data.users.find(u=>u.email===email);
  if(!user){const created=await supabase.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:name}});if(created.error)throw created.error;user=created.data.user}
  const {error:pError}=await supabase.from("profiles").upsert({id:user.id,display_name:name,phone:"5213110000000"});if(pError)throw pError;
  const {error:rError}=await supabase.from("profile_roles").upsert({profile_id:user.id,role},{onConflict:"profile_id,role"});if(rError)throw rError;
  return user.id;
}

async function main(){
  for(const [email,name,slug,profession,zone] of providerRows){const owner=await ensureUser(email,name,"provider");const {error}=await supabase.from("provider_profiles").upsert({owner_profile_id:owner,slug,name,profession,zone,phone:"5213110000000",bio:`Perfil demo de ${profession} en Tepic.`,plan:slug==="andrea-flores"?"pro":"free",status:"active",rating:slug==="juan-perez"?4.8:4.7,review_count:slug==="juan-perez"?23:8},{onConflict:"slug"});if(error)throw error}
  const businessOwner=await ensureUser("business@tequit.local","Dueño Demo","business_owner");
  await ensureUser("admin@tequit.local","Admin Tequit","admin");
  const construction=(await supabase.from("service_categories").select("id").eq("slug","construccion").single()).data?.id;
  const events=(await supabase.from("service_categories").select("id").eq("slug","eventos").single()).data?.id;
  const rows=[
    {slug:"concretos-estampados-de-nayarit",name:"Concretos Estampados de Nayarit",category_id:construction,description:"Materiales y aplicación profesional para concreto estampado.",zone:"Ciudad Industrial",address:"Dirección demo, Tepic"},
    {slug:"floreria-rosario",name:"Florería Rosario",category_id:events,description:"Flores y decoración de eventos en Tepic.",zone:"Centro",address:"Dirección demo, Tepic"},
    {slug:"ferreteria-la-loma",name:"Ferretería La Loma",category_id:construction,description:"Herramientas y materiales para el hogar.",zone:"La Loma",address:"Dirección demo, Tepic"},
    {slug:"climas-del-valle",name:"Climas del Valle",category_id:construction,description:"Venta y mantenimiento de minisplits.",zone:"Ciudad del Valle",address:"Dirección demo, Tepic"},
  ].map(r=>({...r,phone:"5213110000000",status:"active",rating:4.8,review_count:12}));
  const {data:businesses,error:bError}=await supabase.from("businesses").upsert(rows,{onConflict:"slug"}).select("id");if(bError)throw bError;
  for(const business of businesses??[]){const{error}=await supabase.from("business_members").upsert({business_id:business.id,profile_id:businessOwner,member_role:"owner"},{onConflict:"business_id,profile_id"});if(error)throw error}
  console.log(`Seed completo: ${providerRows.length} prestadores, ${rows.length} negocios y usuarios demo. Contraseña local: ${password}`);
}
main().catch((error)=>{console.error(error);process.exit(1)});
