import { WEBSITE_TEMPLATES } from "@/lib/website-offer";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import {
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  describe,
  it,
  expect,
} from "vitest";
const admin = "10000000-0000-4000-8000-000000000001",
  owner = "10000000-0000-4000-8000-000000000002",
  other = "10000000-0000-4000-8000-000000000003";
const legacy = "20000000-0000-4000-8000-000000000001";
let db: PGlite;
async function row<T = Record<string, unknown>>(
  sql: string,
  args: unknown[] = [],
) {
  return (await db.query<T>(sql, args)).rows[0];
}
async function reject(sql: string, args: unknown[] = []) {
  await db.exec("savepoint expected_failure");
  let failed = false;
  try {
    await db.query(sql, args);
  } catch {
    failed = true;
  }
  await db.exec("rollback to expected_failure; release expected_failure");
  expect(failed).toBe(true);
}
async function provider() {
  const p = await row<{ id: string }>(
    "insert into provider_profiles(owner_profile_id) values($1) returning id",
    [owner],
  );
  await db.query(
    "insert into provider_site_settings(provider_id,headline,intro) values($1,'Mi sitio profesional','Una presentación completa para clientes locales con servicios reales.')",
    [p.id],
  );
  return p.id;
}
async function order(p: string) {
  return (
    await row<{ id: string }>(
      "select admin_website_order($1,'create',$2,null,799,6) id",
      [admin, p],
    )
  ).id;
}
async function action(id: string, act: string) {
  return db.query(
    "select admin_website_order($1,$2,null,$3,699,12,'transferencia verificada')",
    [admin, act, id],
  );
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync("tests/fixtures/website-baseline.sql", "utf8"));
  for (const f of [
    "202609090001_websites_and_attribution.sql",
    "202609090002_atomic_site_content.sql",
    "202609090003_traffic_summary.sql",
    "202609170001_assisted_website_beta.sql",
    "202609170002_assisted_maintenance.sql",
    "202609280001_essential_website_template.sql",
    "202609280002_website_design_catalog.sql",
    "202609050003_restore_plan_archives.sql",
  ])
    await db.exec(readFileSync("supabase/migrations/" + f, "utf8"));
}, 30000);
afterAll(async () => {
  await db?.close();
});
beforeEach(async () => {
  await db.exec("begin");
});
afterEach(async () => {
  await db.exec("rollback");
});

describe("beta asistida y permisos", () => {
  it.each(WEBSITE_TEMPLATES)("guarda $name por RPC administrativo y conserva diseño y datos opcionales", async template => {
    const p = await provider();
    const content = { headline: "Servicio local", intro: "Una presentación clara del servicio para clientes de Tepic.", yearsExperience: null, coverPath: null, avatarPath: null, socialLinks: {}, services: [], faqs: [], templateId: template.id, details: {address:"Dirección autorizada",notice:"Atención con cita"}, theme: "tequit", accentColor: "#0f2942", whiteLabel: false };
    await db.query("select save_provider_website_content($1,$2,true,$3,true)", [admin, p, JSON.stringify(content)]);
    expect(await row("select template_id from provider_site_settings where provider_id=$1", [p])).toEqual({ template_id: template.id });
    await db.query("select save_provider_website_content($1,$2,false,$3,false)", [owner, p, JSON.stringify({ ...content, templateId: "hogar" })]);
    expect(await row("select template_id from provider_site_settings where provider_id=$1", [p])).toEqual({ template_id: template.id });
    expect(await row("select details from provider_site_settings where provider_id=$1", [p])).toEqual({details:content.details});
    await reject("update provider_site_settings set template_id='inexistente' where provider_id=$1", [p]);
  });
  it("bloquea diseño por escritura directa y permite contenido del propietario", async () => {
    const p=await provider();
    await db.exec("set local role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,true)",[owner]);
    await db.query("update provider_site_settings set headline='Mi presentación actualizada' where provider_id=$1",[p]);
    await reject("update provider_site_settings set template_id='esencial' where provider_id=$1",[p]);
    await reject("update provider_site_settings set accent_color='#ffffff' where provider_id=$1",[p]);
    await reject("update provider_site_settings set white_label=true where provider_id=$1",[p]);
    await reject("delete from provider_site_settings where provider_id=$1",[p]);
    await reject("insert into provider_faqs(provider_id,question,answer) values($1,'Pregunta directa','Una respuesta suficiente')",[p]);
    await db.query("select set_config('request.jwt.claim.sub',$1,true)",[other]);
    expect((await db.query("update provider_site_settings set headline='Contenido ajeno' where provider_id=$1 returning provider_id",[p])).rows).toHaveLength(0);
  });

  it("el RPC del propietario no concede diseño aunque reciba p_branding=true",async()=>{
    const p=await provider();
    await db.query("update provider_site_settings set template_id='tecnico' where provider_id=$1",[p]);
    const content={headline:"Atención de mantenimiento",intro:"Presentación suficientemente larga para describir servicios locales.",yearsExperience:null,coverPath:null,avatarPath:null,socialLinks:{},services:[],faqs:[],templateId:"hogar",theme:"oscuro",accentColor:"#ffffff",whiteLabel:true};
    await db.query("select save_provider_website_content($1,$2,false,$3,true)",[owner,p,JSON.stringify(content)]);
    expect(await row("select template_id,white_label from provider_site_settings where provider_id=$1",[p])).toEqual({template_id:"tecnico",white_label:false});
    await reject("select save_provider_website_content($1,$2,false,$3,true)",[other,p,JSON.stringify(content)]);
    await reject("select save_provider_website_content($1,$2,false,$3,false)",[owner,p,JSON.stringify({...content,faqs:Array.from({length:4},()=>({question:"¿Dónde atiendes?",answer:"En toda la ciudad de Tepic."}))})]);
  });

  it("mantiene las cinco entradas incluidas cuando termina Pro",async()=>{
    const p=await provider();
    await db.query("update provider_profiles set status='active' where id=$1",[p]);
    await db.query("update provider_site_settings set template_id='hogar' where provider_id=$1",[p]);
    const id=await order(p);await action(id,"pay");await action(id,"publish");
    await db.query("insert into provider_services(provider_id,title,created_at) select $1,'Servicio '||i,now()+i*interval '1 second' from generate_series(1,15) i",[p]);
    await db.query("insert into provider_media(provider_id,title,created_at) select $1,'Trabajo '||i,now()+i*interval '1 second' from generate_series(1,10) i",[p]);
    const before=(await db.query("select id from provider_services where provider_id=$1 order by created_at,id limit 5",[p])).rows;
    const photos=(await db.query("select id from provider_media where provider_id=$1 order by created_at,id limit 5",[p])).rows;
    await db.query("update provider_plan_assignments set ends_at=now()-interval '1 second' where provider_id=$1",[p]);
    await db.query("select reconcile_provider_plan($1)",[p]);
    expect((await db.query("select id from provider_services where provider_id=$1 and active order by created_at,id",[p])).rows).toEqual(before);
    expect((await db.query("select id from provider_media where provider_id=$1 and archived_at is null order by created_at,id",[p])).rows).toEqual(photos);
    expect(await row("select template_id from provider_site_settings where provider_id=$1",[p])).toEqual({template_id:"hogar"});
    expect(await row("select ends_at>now() active from provider_website_access where provider_id=$1",[p])).toEqual({active:true});
  });

  it("mantiene identidad de servicios y revierte un intento de modificar servicios ajenos",async()=>{
    const p=await provider(),otherProvider=await provider();
    const service=await row<{id:string}>("insert into provider_services(provider_id,title) values($1,'Servicio existente') returning id",[p]);
    const foreign=await row<{id:string}>("insert into provider_services(provider_id,title) values($1,'Servicio ajeno') returning id",[otherProvider]);
    await db.query("select admin_replace_assisted_services($1,$2,'provider',$3)",[admin,p,JSON.stringify([{id:service.id,title:"Servicio corregido",description:"Descripción actualizada"}])]);
    expect(await row("select id,title from provider_services where provider_id=$1 and active",[p])).toEqual({id:service.id,title:"Servicio corregido"});
    await reject("select admin_replace_assisted_services($1,$2,'provider',$3)",[admin,p,JSON.stringify([{id:foreign.id,title:"No permitido",description:"No debe cambiar"}])]);
    expect(await row("select active from provider_services where id=$1",[service.id])).toEqual({active:true});
    await reject("select admin_replace_assisted_services($1,$2,'provider','[]')",[owner,p]);
  });

  it("mantiene un perfil reclamado sin volverlo a publicar y guarda todo de forma atómica",async()=>{
    const p=await provider();
    const onboarding=await row<{id:string}>("select admin_manage_provider($1,$2) id",[admin,p]);
    expect(await row("select admin_manage_provider($1,$2) id",[admin,p])).toEqual(onboarding);
    const category=await row<{id:string}>("insert into canonical_provider_categories(name) values('Electricidad') returning id");
    const content={name:"Nombre actualizado",phone:"523111234567",zone:"Tepic",bio:"Información compartida entre sitio y perfil.",headline:"Electricidad en Tepic",yearsExperience:4,primaryCategoryId:category.id,secondaryCategoryIds:[],source:"in_person",services:[{title:"Revisión eléctrica",description:"Revisión de instalaciones en casa."}],areas:["Tepic"],verifications:[{type:"visited_by_tequit",note:"Visita realizada con autorización."}],consentConfirmed:true,consentNote:"Autorizó cambios en persona.",duplicateReviewed:true,duplicateNote:"Es el mismo perfil."};
    await db.query("select admin_save_assisted_content($1,$2,$3)",[admin,onboarding.id,JSON.stringify(content)]);
    expect(await row("select status from assisted_onboardings where id=$1",[onboarding.id])).toEqual({status:"claimed"});
    expect(await row("select name from provider_profiles where id=$1",[p])).toEqual({name:content.name});
    expect(await row("select count(*)::int n from provider_verifications where provider_id=$1",[p])).toEqual({n:1});
    await reject("select admin_save_assisted_content($1,$2,$3)",[admin,onboarding.id,JSON.stringify({...content,name:"Debe revertirse",services:[{id:"99999999-0000-4000-8000-000000000000",title:"Servicio ajeno",description:"No existe"}]})]);
    expect(await row("select name from provider_profiles where id=$1",[p])).toEqual({name:content.name});
    await db.query("update provider_profiles set bio='Presentación desde Mi perfil' where id=$1",[p]);
    expect(await row("select intro from provider_site_settings where provider_id=$1",[p])).toEqual({intro:"Presentación desde Mi perfil"});
  });

  it("permite mantener fotos sólo al administrador y al prestador indicado",async()=>{
    const p=await provider(),otherProvider=await provider();
    const media=await row<{id:string}>("insert into provider_media(provider_id,title) values($1,'Trabajo original') returning id",[p]);
    await reject("select admin_maintain_portfolio($1,$2,$3,'delete','','')",[owner,p,media.id]);
    await reject("select admin_maintain_portfolio($1,$2,$3,'delete','','')",[admin,otherProvider,media.id]);
    await db.query("select admin_maintain_portfolio($1,$2,$3,'update','Trabajo corregido','Descripción completa.')",[admin,p,media.id]);
    expect(await row("select title from provider_media where id=$1",[media.id])).toEqual({title:"Trabajo corregido"});
    await db.query("select admin_maintain_portfolio($1,$2,$3,'delete','','')",[admin,p,media.id]);
    expect(await row("select count(*)::int n from provider_media where id=$1",[media.id])).toEqual({n:0});
  });
});
describe("pedidos y publicación en PostgreSQL", () => {
  it("conserva acceso anterior sin inventar un pago", async () => {
    expect(
      await row(
        "select source,ends_at from provider_website_access where provider_id=$1",
        [legacy],
      ),
    ).toEqual({ source: "legacy", ends_at: null });
    expect(await row("select count(*)::int n from website_orders")).toEqual({
      n: 0,
    });
  });
  it("no publica sin pago y sólo activa después de publicar el perfil", async () => {
    const p = await provider(),
      id = await order(p);
    await reject("select admin_website_order($1,'publish',null,$2)", [
      admin,
      id,
    ]);
    await action(id, "pay");
    await reject("select admin_website_order($1,'publish',null,$2)", [
      admin,
      id,
    ]);
    await db.query("update provider_profiles set status='active' where id=$1", [
      p,
    ]);
    await action(id, "publish");
    expect(
      await row(
        "select amount_mxn,duration_months,status from website_orders where id=$1",
        [id],
      ),
    ).toEqual({ amount_mxn: 799, duration_months: 6, status: "published" });
    expect(
      await row(
        "select ends_at>now() active from provider_website_access where provider_id=$1",
        [p],
      ),
    ).toEqual({ active: true });
  });
  it("publicación repetida no extiende vigencia y renovación suma sólo una vez", async () => {
    const p = await provider(),
      id = await order(p);
    await db.query("update provider_profiles set status='active' where id=$1", [
      p,
    ]);
    await action(id, "pay");
    await action(id, "publish");
    const before = await row(
      "select ends_at from provider_website_access where provider_id=$1",
      [p],
    );
    await action(id, "publish");
    expect(
      await row(
        "select ends_at from provider_website_access where provider_id=$1",
        [p],
      ),
    ).toEqual(before);
    const renewal = await order(p);
    await action(renewal, "pay");
    await action(renewal, "publish");
    expect(
      await row(
        "select a.ends_at=o.ends_at+interval '6 months' extended from provider_website_access a join website_orders o on o.provider_id=a.provider_id where o.id=$1",
        [id],
      ),
    ).toEqual({ extended: true });
  });
  it("rechaza actores sin rol y cambios directos del propietario", async () => {
    const p = await provider();
    await reject("select admin_website_order($1,'create',$2)", [owner, p]);
    await db.exec("set local role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
      owner,
    ]);
    await reject(
      "insert into provider_website_access(provider_id,source) values($1,'purchase')",
      [p],
    );
    await reject("select admin_website_order($1,'create',$2)", [admin, p]);
  });
  it("inicia bienvenida una vez al publicar, también sin cuenta", async () => {
    const p = await provider();
    await db.query(
      "update provider_profiles set owner_profile_id=null where id=$1",
      [p],
    );
    expect(
      await row(
        "select count(*)::int n from provider_plan_assignments where provider_id=$1",
        [p],
      ),
    ).toEqual({ n: 0 });
    await db.query("update provider_profiles set status='active' where id=$1", [
      p,
    ]);
    const assignment = await row(
      "select id,starts_at,ends_at from provider_plan_assignments where provider_id=$1",
      [p],
    );
    await db.query(
      "update provider_profiles set status='suspended' where id=$1",
      [p],
    );
    await db.query(
      "update provider_profiles set status='active',owner_profile_id=$2 where id=$1",
      [p, owner],
    );
    expect(
      await row(
        "select id,starts_at,ends_at from provider_plan_assignments where provider_id=$1",
        [p],
      ),
    ).toEqual(assignment);
  });
  it("no transforma un pedido cancelado o pagado en otro estado inválido", async () => {
    const p = await provider(),
      id = await order(p);
    await action(id, "cancel");
    await reject(
      "select admin_website_order($1,'pay',null,$2,699,12,'recibido')",
      [admin, id],
    );
    const second = await order(p);
    await action(second, "pay");
    await reject("select admin_website_order($1,'cancel',null,$2)", [
      admin,
      second,
    ]);
  });
  it("edición es atómica y conserva diseño cuando vence el acceso", async () => {
    const p = await provider();
    const original = await row(
      "select intro from provider_site_settings where provider_id=$1",
      [p],
    );
    const content = {
      headline: "Nuevo sitio",
      intro: "Una presentación completamente nueva para clientes del negocio.",
      yearsExperience: 5,
      coverPath: null,
      avatarPath: null,
      theme: "tierra",
      accentColor: "#254432",
      whiteLabel: true,
      socialLinks: {},
      services: [],
      faqs: [
        {
          question: "¿Dónde trabajas?",
          answer: "Atendemos toda la zona de Tepic.",
        },
      ],
    };
    await reject("select save_provider_website_content($1,$2,true,$3,true)", [
      admin,
      p,
      JSON.stringify({
        ...content,
        services: [
          { id: "30000000-0000-4000-8000-000000000001", description: "ajeno" },
        ],
      }),
    ]);
    expect(
      await row(
        "select intro from provider_site_settings where provider_id=$1",
        [p],
      ),
    ).toEqual(original);
    await db.query("select save_provider_website_content($1,$2,true,$3,true)", [
      admin,
      p,
      JSON.stringify(content),
    ]);
    await db.query(
      "select save_provider_website_content($1,$2,false,$3,false)",
      [
        owner,
        p,
        JSON.stringify({ ...content, theme: "tequit", whiteLabel: false }),
      ],
    );
    expect(
      await row(
        "select theme,white_label from provider_site_settings where provider_id=$1",
        [p],
      ),
    ).toEqual({ theme: "tierra", white_label: true });
  });
  it("deduplica eventos y agrupa Facebook sin exponer otro prestador", async () => {
    const p = await provider();
    await db.query(
      'insert into contact_events(provider_id,event_type,event_key,metadata) values($1,\'whatsapp_click\',\'same\',\'{"source":"facebook","surface":"website","entrySurface":"directory"}\')',
      [p],
    );
    await reject(
      "insert into contact_events(provider_id,event_type,event_key) values($1,'whatsapp_click','same')",
      [p],
    );
    await db.exec("set local role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
      owner,
    ]);
    expect(
      (
        await db.query(
          "select * from provider_traffic_summary($1,now()-interval '1 day')",
          [p],
        )
      ).rows,
    ).toHaveLength(3);
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
      other,
    ]);
    expect(
      (
        await db.query(
          "select * from provider_traffic_summary($1,now()-interval '1 day')",
          [p],
        )
      ).rows,
    ).toHaveLength(0);
  });
});
