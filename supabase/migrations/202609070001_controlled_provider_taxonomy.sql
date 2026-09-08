-- Controlled provider taxonomy with free-form services and indexed marketplace search.

do $$ begin
  create type public.provider_category_role as enum ('primary','secondary');
exception when duplicate_object then null;
end $$;

create or replace function public.normalize_search_text(value text)
returns text language sql immutable parallel safe set search_path=public as $$
  select trim(regexp_replace(lower(public.unaccent(coalesce(value,''))), '[^a-z0-9ñ]+', ' ', 'g'));
$$;

create table public.marketplace_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.canonical_provider_categories (
  id uuid primary key default gen_random_uuid(),
  marketplace_category_id uuid not null references public.marketplace_categories(id),
  name text not null,
  slug text not null unique,
  description text not null default '',
  requires_review boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.canonical_provider_category_aliases (
  id uuid primary key default gen_random_uuid(),
  canonical_category_id uuid not null references public.canonical_provider_categories(id) on delete cascade,
  alias text not null,
  normalized_alias text generated always as (public.normalize_search_text(alias)) stored,
  created_at timestamptz not null default now(),
  unique(canonical_category_id, normalized_alias)
);

insert into public.marketplace_categories(name,slug,description,sort_order) values
  ('Construcción y obra','construccion-y-obra','Construcción, acabados y fabricación para obra.',10),
  ('Hogar e instalaciones','hogar-e-instalaciones','Mantenimiento, instalaciones y reparaciones para el hogar.',20),
  ('Automotriz','automotriz','Mantenimiento, reparación y asistencia para vehículos.',30),
  ('Mudanzas y logística','mudanzas-y-logistica','Traslados, fletes, mensajería y apoyo logístico.',40),
  ('Eventos','eventos','Personas que producen, ambientan y atienden eventos.',50),
  ('Alimentos y bebidas','alimentos-y-bebidas','Preparación y venta de alimentos fuera del contexto exclusivo de eventos.',60),
  ('Belleza y cuidado personal','belleza-y-cuidado-personal','Imagen, arreglo y bienestar personal.',70),
  ('Salud y bienestar','salud-y-bienestar','Atención y acompañamiento profesional para la salud.',80),
  ('Educación y clases','educacion-y-clases','Clases, asesorías y formación práctica.',90),
  ('Tecnología y seguridad','tecnologia-y-seguridad','Soporte técnico, conectividad y seguridad electrónica.',100),
  ('Servicios profesionales y creativos','servicios-profesionales-y-creativos','Asesoría, diseño y servicios especializados.',110),
  ('Mascotas','mascotas','Cuidado, entrenamiento y salud animal.',120),
  ('Costura y reparaciones','costura-y-reparaciones','Confección, ajustes y restauración de artículos.',130)
on conflict(slug) do update set name=excluded.name,description=excluded.description,sort_order=excluded.sort_order;

with rows(parent_slug,name,slug,description,requires_review,sort_order) as (values
  ('construccion-y-obra','Albañil','albanil','Construcción y reparación general de obra.',false,10),
  ('construccion-y-obra','Contratista de obra','contratista-de-obra','Coordinación y ejecución integral de obra.',false,20),
  ('construccion-y-obra','Pintor','pintor','Pintura y recubrimientos para interiores y exteriores.',false,30),
  ('construccion-y-obra','Impermeabilizador','impermeabilizador','Protección y reparación contra humedad.',false,40),
  ('construccion-y-obra','Yesero y tablaroquero','yesero-y-tablaroquero','Yeso, plafones y sistemas de tablaroca.',false,50),
  ('construccion-y-obra','Instalador de pisos','instalador-de-pisos','Colocación y reparación de pisos y recubrimientos.',false,60),
  ('construccion-y-obra','Carpintero','carpintero','Carpintería, muebles y fabricación en madera.',false,70),
  ('construccion-y-obra','Herrero y soldador','herrero-y-soldador','Herrería, estructuras y trabajos de soldadura.',false,80),
  ('construccion-y-obra','Aluminiero y vidriero','aluminiero-y-vidriero','Fabricación e instalación de aluminio y vidrio.',false,90),
  ('hogar-e-instalaciones','Electricista','electricista','Instalaciones, diagnóstico y reparación eléctrica.',false,10),
  ('hogar-e-instalaciones','Plomero','plomero','Tuberías, fugas, sanitarios y sistemas de agua.',false,20),
  ('hogar-e-instalaciones','Técnico en bombas','tecnico-en-bombas','Instalación, mantenimiento y reparación de sistemas de bombeo.',false,30),
  ('hogar-e-instalaciones','Técnico en electrodomésticos','tecnico-en-electrodomesticos','Diagnóstico y reparación de aparatos domésticos.',false,40),
  ('hogar-e-instalaciones','Técnico en climatización','tecnico-en-climatizacion','Instalación y servicio de aire acondicionado y refrigeración.',false,50),
  ('hogar-e-instalaciones','Técnico en boilers','tecnico-en-boilers','Instalación y reparación de calentadores de agua.',false,60),
  ('hogar-e-instalaciones','Instalador de energía solar','instalador-de-energia-solar','Instalación y mantenimiento de soluciones solares.',false,70),
  ('hogar-e-instalaciones','Cerrajero','cerrajero','Apertura, cambio y reparación de cerraduras.',false,80),
  ('hogar-e-instalaciones','Profesional de limpieza','profesional-de-limpieza','Limpieza doméstica, profunda y de espacios de trabajo.',false,90),
  ('hogar-e-instalaciones','Fumigador','fumigador','Control preventivo y correctivo de plagas.',false,100),
  ('hogar-e-instalaciones','Jardinero','jardinero','Mantenimiento de jardines, poda y exteriores.',false,110),
  ('hogar-e-instalaciones','Técnico en albercas','tecnico-en-albercas','Limpieza, mantenimiento y reparación de albercas.',false,120),
  ('automotriz','Mecánico automotriz','mecanico-automotriz','Diagnóstico, mantenimiento y reparación mecánica.',false,10),
  ('automotriz','Eléctrico automotriz','electrico-automotriz','Diagnóstico y reparación de sistemas eléctricos automotrices.',false,20),
  ('automotriz','Carrocero y pintor automotriz','carrocero-y-pintor-automotriz','Hojalatería, carrocería y pintura.',false,30),
  ('automotriz','Técnico en llantas','tecnico-en-llantas','Montaje, reparación y servicio de llantas.',false,40),
  ('automotriz','Detallador automotriz','detallador-automotriz','Lavado y detallado interior y exterior.',false,50),
  ('automotriz','Operador de grúa','operador-de-grua','Traslado y asistencia vial con grúa.',false,60),
  ('mudanzas-y-logistica','Profesional de mudanzas','profesional-de-mudanzas','Mudanzas residenciales y comerciales.',false,10),
  ('mudanzas-y-logistica','Transportista de carga','transportista-de-carga','Fletes y traslado de mercancías.',false,20),
  ('mudanzas-y-logistica','Mensajero','mensajero','Mensajería y entregas locales.',false,30),
  ('mudanzas-y-logistica','Recolector de escombro','recolector-de-escombro','Retiro de escombro y materiales.',false,40),
  ('eventos','Músico','musico','Música en vivo para eventos.',false,10),
  ('eventos','DJ','dj','Música grabada y ambientación para eventos.',false,20),
  ('eventos','Decorador de eventos','decorador-de-eventos','Diseño, decoración y montaje de eventos.',false,30),
  ('eventos','Florista','florista','Arreglos florales y ambientación.',false,40),
  ('eventos','Fotógrafo de eventos','fotografo-de-eventos','Cobertura fotográfica de eventos.',false,50),
  ('eventos','Videógrafo de eventos','videografo-de-eventos','Grabación y producción audiovisual de eventos.',false,60),
  ('eventos','Organizador de eventos','organizador-de-eventos','Planeación y coordinación de eventos.',false,70),
  ('eventos','Técnico de audio e iluminación','tecnico-de-audio-e-iluminacion','Audio, iluminación y producción técnica.',false,80),
  ('eventos','Proveedor de mobiliario y carpas','proveedor-de-mobiliario-y-carpas','Renta e instalación de mobiliario y carpas.',false,90),
  ('eventos','Taquizas','taquizas','Preparación y servicio de taquizas para eventos.',false,100),
  ('eventos','Catering','catering','Alimentos y atención para eventos.',false,110),
  ('eventos','Repostero para eventos','repostero-para-eventos','Pasteles, postres y mesas dulces para eventos.',false,120),
  ('alimentos-y-bebidas','Cocinero','cocinero','Preparación de alimentos y comida por encargo.',false,10),
  ('alimentos-y-bebidas','Repostero','repostero','Pasteles, pan y postres.',false,20),
  ('alimentos-y-bebidas','Bartender','bartender','Preparación y servicio de bebidas.',false,30),
  ('belleza-y-cuidado-personal','Barbero','barbero','Corte, arreglo de barba e imagen masculina.',false,10),
  ('belleza-y-cuidado-personal','Estilista','estilista','Corte, color y peinado.',false,20),
  ('belleza-y-cuidado-personal','Maquillista','maquillista','Maquillaje social y profesional.',false,30),
  ('belleza-y-cuidado-personal','Técnico de uñas','tecnico-de-unas','Manicure, pedicure y aplicación de uñas.',false,40),
  ('belleza-y-cuidado-personal','Masajista','masajista','Masaje de relajación y bienestar no clínico.',false,50),
  ('salud-y-bienestar','Enfermero','enfermero','Cuidados de enfermería.',true,10),
  ('salud-y-bienestar','Cuidador','cuidador','Acompañamiento y cuidado de personas.',false,20),
  ('salud-y-bienestar','Fisioterapeuta','fisioterapeuta','Valoración y terapia física.',true,30),
  ('salud-y-bienestar','Nutriólogo','nutriologo','Orientación y seguimiento nutricional.',true,40),
  ('salud-y-bienestar','Psicólogo','psicologo','Atención y acompañamiento psicológico.',true,50),
  ('educacion-y-clases','Tutor académico','tutor-academico','Regularización y apoyo académico.',false,10),
  ('educacion-y-clases','Profesor de idiomas','profesor-de-idiomas','Clases y práctica de idiomas.',false,20),
  ('educacion-y-clases','Profesor de música','profesor-de-musica','Clases de música e instrumentos.',false,30),
  ('educacion-y-clases','Profesor de computación','profesor-de-computacion','Clases de computación y herramientas digitales.',false,40),
  ('educacion-y-clases','Entrenador deportivo','entrenador-deportivo','Entrenamiento físico o deportivo.',false,50),
  ('tecnologia-y-seguridad','Técnico en computadoras','tecnico-en-computadoras','Soporte y reparación de computadoras.',false,10),
  ('tecnologia-y-seguridad','Técnico en celulares','tecnico-en-celulares','Reparación y configuración de celulares.',false,20),
  ('tecnologia-y-seguridad','Técnico en redes','tecnico-en-redes','Instalación y soporte de redes y Wi-Fi.',false,30),
  ('tecnologia-y-seguridad','Instalador de cámaras y alarmas','instalador-de-camaras-y-alarmas','CCTV, alarmas y seguridad electrónica.',false,40),
  ('tecnologia-y-seguridad','Técnico en electrónica','tecnico-en-electronica','Diagnóstico y reparación electrónica.',false,50),
  ('servicios-profesionales-y-creativos','Contador','contador','Contabilidad, impuestos y administración.',true,10),
  ('servicios-profesionales-y-creativos','Abogado','abogado','Asesoría y representación legal.',true,20),
  ('servicios-profesionales-y-creativos','Arquitecto','arquitecto','Diseño, proyecto y supervisión arquitectónica.',true,30),
  ('servicios-profesionales-y-creativos','Diseñador gráfico','disenador-grafico','Diseño visual y materiales de comunicación.',false,40),
  ('servicios-profesionales-y-creativos','Fotógrafo comercial','fotografo-comercial','Fotografía de producto, negocio y marca.',false,50),
  ('servicios-profesionales-y-creativos','Especialista en marketing','especialista-en-marketing','Promoción, contenido y estrategia comercial.',false,60),
  ('servicios-profesionales-y-creativos','Desarrollador web','desarrollador-web','Diseño y desarrollo de sitios y sistemas web.',false,70),
  ('mascotas','Estilista de mascotas','estilista-de-mascotas','Baño, corte y cuidado estético de mascotas.',false,10),
  ('mascotas','Paseador de perros','paseador-de-perros','Paseo y actividad para perros.',false,20),
  ('mascotas','Entrenador de mascotas','entrenador-de-mascotas','Entrenamiento y modificación de conducta.',false,30),
  ('mascotas','Cuidador de mascotas','cuidador-de-mascotas','Cuidado temporal de mascotas.',false,40),
  ('mascotas','Veterinario','veterinario','Atención médica veterinaria.',true,50),
  ('costura-y-reparaciones','Costurero','costurero','Costura, composturas y ajustes de ropa.',false,10),
  ('costura-y-reparaciones','Sastre','sastre','Confección y ajuste especializado de prendas.',false,20),
  ('costura-y-reparaciones','Zapatero','zapatero','Reparación y restauración de calzado.',false,30),
  ('costura-y-reparaciones','Restaurador','restaurador','Restauración de muebles y objetos.',false,40)
)
insert into public.canonical_provider_categories(marketplace_category_id,name,slug,description,requires_review,sort_order)
select parent.id,rows.name,rows.slug,rows.description,rows.requires_review,rows.sort_order
from rows join public.marketplace_categories parent on parent.slug=rows.parent_slug
on conflict(slug) do update set marketplace_category_id=excluded.marketplace_category_id,name=excluded.name,description=excluded.description,requires_review=excluded.requires_review,sort_order=excluded.sort_order;

with rows(category_slug,alias) as (values
  ('electricista','eléctrico'),('electricista','instalaciones eléctricas'),('electricista','electricidad'),
  ('plomero','fontanero'),('plomero','fontanería'),('plomero','plomería'),
  ('tecnico-en-bombas','bombas de agua'),('tecnico-en-bombas','bombas eléctricas'),('tecnico-en-bombas','sistemas de bombeo'),
  ('tecnico-en-electrodomesticos','reparación de lavadoras'),('tecnico-en-electrodomesticos','línea blanca'),
  ('tecnico-en-climatizacion','minisplit'),('tecnico-en-climatizacion','aire acondicionado'),('tecnico-en-climatizacion','refrigeración'),
  ('albanil','albañilería'),('albanil','construcción'),('pintor','pintura'),
  ('herrero-y-soldador','soldador'),('herrero-y-soldador','herrería'),
  ('decorador-de-eventos','decoración de bodas'),('decorador-de-eventos','decoración de xv años'),
  ('musico','grupo musical'),('taquizas','taquiza'),('profesional-de-limpieza','limpieza'),
  ('jardinero','jardinería'),('mecanico-automotriz','mecánico'),('tecnico-en-computadoras','reparación de computadoras')
)
insert into public.canonical_provider_category_aliases(canonical_category_id,alias)
select category.id,rows.alias from rows join public.canonical_provider_categories category on category.slug=rows.category_slug
on conflict(canonical_category_id,normalized_alias) do nothing;

-- provider_categories was unused by the application; convert it into the provider/canonical join.
alter table public.provider_categories drop constraint if exists provider_categories_pkey;
alter table public.provider_categories rename column category_id to legacy_category_id;
alter table public.provider_categories add column canonical_category_id uuid references public.canonical_provider_categories(id);
alter table public.provider_categories add column assignment_role public.provider_category_role not null default 'primary';

update public.provider_categories relation
set canonical_category_id=canonical.id
from public.service_categories legacy, public.canonical_provider_categories canonical
where relation.legacy_category_id=legacy.id
  and canonical.slug=case legacy.slug
    when 'construccion' then 'albanil'
    when 'plomeria' then 'plomero'
    when 'electricidad' then 'electricista'
    when 'electrodomesticos' then 'tecnico-en-electrodomesticos'
    when 'climatizacion' then 'tecnico-en-climatizacion'
    when 'hogar' then 'profesional-de-limpieza'
    when 'eventos' then 'decorador-de-eventos'
  end;

delete from public.provider_categories where canonical_category_id is null;
alter table public.provider_categories alter column canonical_category_id set not null;
alter table public.provider_categories drop column legacy_category_id;
alter table public.provider_categories add primary key(provider_id,canonical_category_id);
create unique index provider_one_primary_category_idx on public.provider_categories(provider_id) where assignment_role='primary';
create index provider_categories_canonical_idx on public.provider_categories(canonical_category_id,assignment_role);

create or replace function public.enforce_provider_category_limit()
returns trigger language plpgsql security definer set search_path=public as $$
declare role_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.provider_id::text,0));
  select count(*) into role_count from public.provider_categories
  where provider_id=new.provider_id and assignment_role=new.assignment_role
    and canonical_category_id<>new.canonical_category_id;
  if new.assignment_role='primary' and role_count>=1 then
    raise exception 'PROVIDER_PRIMARY_CATEGORY_LIMIT' using errcode='check_violation';
  end if;
  if new.assignment_role='secondary' and role_count>=2 then
    raise exception 'PROVIDER_SECONDARY_CATEGORY_LIMIT' using errcode='check_violation';
  end if;
  return new;
end $$;
create trigger provider_category_limit before insert or update on public.provider_categories
for each row execute function public.enforce_provider_category_limit();

alter table public.provider_services
  add column brands text[] not null default '{}',
  add column price_from numeric(10,2),
  add column quote_only boolean not null default true,
  add constraint provider_services_price_nonnegative check(price_from is null or price_from>=0),
  add constraint provider_services_brand_limit check(cardinality(brands)<=10);

create table public.provider_search_documents (
  provider_id uuid primary key references public.provider_profiles(id) on delete cascade,
  category_text text not null default '',
  service_text text not null default '',
  body_text text not null default '',
  normalized_text text generated always as (public.normalize_search_text(category_text||' '||service_text||' '||body_text)) stored,
  search_document tsvector generated always as (
    setweight(to_tsvector('spanish',public.normalize_search_text(category_text)),'A') ||
    setweight(to_tsvector('spanish',public.normalize_search_text(service_text)),'B') ||
    setweight(to_tsvector('spanish',public.normalize_search_text(body_text)),'C')
  ) stored,
  updated_at timestamptz not null default now()
);
create index provider_search_document_idx on public.provider_search_documents using gin(search_document);
create index provider_search_normalized_trgm_idx on public.provider_search_documents using gin(normalized_text gin_trgm_ops);

create table public.marketplace_search_queries (
  id uuid primary key default gen_random_uuid(),
  query_text text not null,
  normalized_query text generated always as (public.normalize_search_text(query_text)) stored,
  result_count integer not null check(result_count>=0),
  entity_type text not null default 'all' check(entity_type in ('all','provider','business')),
  session_hash text,
  created_at timestamptz not null default now()
);
create index marketplace_search_queries_normalized_idx on public.marketplace_search_queries(normalized_query,created_at desc);
create index marketplace_search_queries_zero_idx on public.marketplace_search_queries(created_at desc) where result_count=0;

create or replace function public.refresh_provider_search_document(p_provider_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare category_value text; service_value text; body_value text;
begin
  select string_agg(concat_ws(' ',canonical.name,parent.name,
    (select string_agg(alias.alias,' ') from public.canonical_provider_category_aliases alias where alias.canonical_category_id=canonical.id)
  ),' ') into category_value
  from public.provider_categories relation
  join public.canonical_provider_categories canonical on canonical.id=relation.canonical_category_id
  join public.marketplace_categories parent on parent.id=canonical.marketplace_category_id
  where relation.provider_id=p_provider_id;

  select string_agg(concat_ws(' ',title,description,array_to_string(brands,' ')),' ')
  into service_value from public.provider_services where provider_id=p_provider_id and active=true;

  select concat_ws(' ',name,profession,bio,zone) into body_value
  from public.provider_profiles where id=p_provider_id;

  if body_value is null then delete from public.provider_search_documents where provider_id=p_provider_id; return; end if;
  insert into public.provider_search_documents(provider_id,category_text,service_text,body_text,updated_at)
  values(p_provider_id,coalesce(category_value,''),coalesce(service_value,''),body_value,now())
  on conflict(provider_id) do update set category_text=excluded.category_text,service_text=excluded.service_text,body_text=excluded.body_text,updated_at=now();
end $$;

create or replace function public.refresh_provider_search_trigger()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  perform public.refresh_provider_search_document(coalesce(new.provider_id,old.provider_id));
  return coalesce(new,old);
end $$;

create or replace function public.refresh_provider_profile_search_trigger()
returns trigger language plpgsql security definer set search_path=public as $$
begin perform public.refresh_provider_search_document(coalesce(new.id,old.id)); return coalesce(new,old); end $$;

create trigger provider_profile_search_refresh after insert or update of name,profession,bio,zone,status on public.provider_profiles
for each row execute function public.refresh_provider_profile_search_trigger();
create trigger provider_service_search_refresh after insert or update or delete on public.provider_services
for each row execute function public.refresh_provider_search_trigger();
create trigger provider_category_search_refresh after insert or update or delete on public.provider_categories
for each row execute function public.refresh_provider_search_trigger();

create or replace function public.refresh_canonical_provider_search_trigger()
returns trigger language plpgsql security definer set search_path=public as $$
declare provider_uuid uuid; category_uuid uuid;
begin
  category_uuid=case when tg_table_name='canonical_provider_category_aliases' then coalesce(new.canonical_category_id,old.canonical_category_id) else coalesce(new.id,old.id) end;
  for provider_uuid in select provider_id from public.provider_categories where canonical_category_id=category_uuid loop
    perform public.refresh_provider_search_document(provider_uuid);
  end loop;
  return coalesce(new,old);
end $$;
create trigger canonical_provider_search_refresh after update or delete on public.canonical_provider_categories
for each row execute function public.refresh_canonical_provider_search_trigger();
create trigger canonical_alias_search_refresh after insert or update or delete on public.canonical_provider_category_aliases
for each row execute function public.refresh_canonical_provider_search_trigger();

create or replace function public.refresh_marketplace_category_search_trigger()
returns trigger language plpgsql security definer set search_path=public as $$
declare provider_uuid uuid;
begin
  for provider_uuid in
    select distinct relation.provider_id from public.provider_categories relation
    join public.canonical_provider_categories canonical on canonical.id=relation.canonical_category_id
    where canonical.marketplace_category_id=coalesce(new.id,old.id)
  loop perform public.refresh_provider_search_document(provider_uuid); end loop;
  return coalesce(new,old);
end $$;
create trigger marketplace_category_search_refresh after update or delete on public.marketplace_categories
for each row execute function public.refresh_marketplace_category_search_trigger();

create or replace function public.set_provider_categories(p_provider_id uuid,p_primary uuid,p_secondary uuid[] default '{}')
returns void language plpgsql security definer set search_path=public as $$
declare primary_name text; secondary_id uuid;
begin
  if not (public.owns_provider(p_provider_id) or public.is_admin()) then raise exception 'not authorized'; end if;
  if p_primary is null or cardinality(coalesce(p_secondary,'{}'))>2 or p_primary=any(coalesce(p_secondary,'{}')) then raise exception 'invalid provider categories'; end if;
  if cardinality(p_secondary)<>cardinality(array(select distinct unnest(p_secondary))) then raise exception 'duplicate provider categories'; end if;
  select name into primary_name from public.canonical_provider_categories where id=p_primary and active=true;
  if primary_name is null then raise exception 'invalid primary category'; end if;
  foreach secondary_id in array coalesce(p_secondary,'{}') loop
    if not exists(select 1 from public.canonical_provider_categories where id=secondary_id and active=true) then raise exception 'invalid secondary category'; end if;
  end loop;
  perform pg_advisory_xact_lock(hashtextextended(p_provider_id::text,0));
  delete from public.provider_categories where provider_id=p_provider_id;
  insert into public.provider_categories(provider_id,canonical_category_id,assignment_role) values(p_provider_id,p_primary,'primary');
  insert into public.provider_categories(provider_id,canonical_category_id,assignment_role)
  select p_provider_id,value,'secondary'::public.provider_category_role from unnest(coalesce(p_secondary,'{}')) value;
  update public.provider_profiles set profession=primary_name where id=p_provider_id;
end $$;
grant execute on function public.set_provider_categories(uuid,uuid,uuid[]) to authenticated;

create or replace function public.search_provider_profiles(p_query text,p_limit integer default 100)
returns table(provider_id uuid,rank real) language sql stable security definer set search_path=public as $$
  with input as (
    select public.normalize_search_text(p_query) normalized,
      websearch_to_tsquery('spanish',public.normalize_search_text(p_query)) parsed
  )
  select document.provider_id,
    (ts_rank_cd(document.search_document,input.parsed)*12
      + similarity(document.normalized_text,input.normalized)*4
      + case when document.normalized_text like '%'||input.normalized||'%' then 3 else 0 end)::real rank
  from public.provider_search_documents document
  join public.provider_profiles provider on provider.id=document.provider_id and provider.status='active'
  cross join input
  where input.normalized<>'' and (
    document.search_document@@input.parsed
    or document.normalized_text % input.normalized
    or document.normalized_text like '%'||input.normalized||'%'
  )
  order by rank desc,provider.rating desc
  limit least(greatest(p_limit,1),200);
$$;
grant execute on function public.search_provider_profiles(text,integer) to anon,authenticated;

-- Infer a primary category for existing profiles without changing publication state.
with inferred as (
  select provider.id provider_id,
    case
      when public.normalize_search_text(provider.profession) similar to '%(electric|electrico)%' then 'electricista'
      when public.normalize_search_text(provider.profession) similar to '%(plomer|fontaner)%' then 'plomero'
      when public.normalize_search_text(provider.profession) like '%bomba%' then 'tecnico-en-bombas'
      when public.normalize_search_text(provider.profession) similar to '%(lavadora|electrodomest)%' then 'tecnico-en-electrodomesticos'
      when public.normalize_search_text(provider.profession) similar to '%(clima|minisplit|refriger)%' then 'tecnico-en-climatizacion'
      when public.normalize_search_text(provider.profession) like '%alban%' then 'albanil'
      when public.normalize_search_text(provider.profession) like '%carpint%' then 'carpintero'
      when public.normalize_search_text(provider.profession) similar to '%(soldad|herrer)%' then 'herrero-y-soldador'
      when public.normalize_search_text(provider.profession) like '%pintor%' then 'pintor'
      when public.normalize_search_text(provider.profession) like '%jardin%' then 'jardinero'
      when public.normalize_search_text(provider.profession) like '%limpieza%' then 'profesional-de-limpieza'
      when public.normalize_search_text(provider.profession) similar to '%(decor|flor)%' then 'decorador-de-eventos'
      else null
    end slug
  from public.provider_profiles provider
)
insert into public.provider_categories(provider_id,canonical_category_id,assignment_role)
select inferred.provider_id,canonical.id,'primary'
from inferred join public.canonical_provider_categories canonical on canonical.slug=inferred.slug
where not exists(select 1 from public.provider_categories existing where existing.provider_id=inferred.provider_id)
on conflict do nothing;

-- Explicit validation account requested for the rollout.
delete from public.provider_categories relation using public.provider_profiles provider
where relation.provider_id=provider.id and relation.assignment_role='primary'
  and right(regexp_replace(provider.phone,'\D','','g'),10)='5649531923';
insert into public.provider_categories(provider_id,canonical_category_id,assignment_role)
select provider.id,canonical.id,'primary'
from public.provider_profiles provider cross join public.canonical_provider_categories canonical
where right(regexp_replace(provider.phone,'\D','','g'),10)='5649531923' and canonical.slug='electricista'
on conflict do nothing;
update public.provider_profiles set profession='Electricista'
where right(regexp_replace(phone,'\D','','g'),10)='5649531923';

select public.refresh_provider_search_document(id) from public.provider_profiles;

alter table public.marketplace_categories enable row level security;
alter table public.canonical_provider_categories enable row level security;
alter table public.canonical_provider_category_aliases enable row level security;
alter table public.provider_search_documents enable row level security;
alter table public.marketplace_search_queries enable row level security;

create policy "public reads marketplace categories" on public.marketplace_categories for select using(active or public.is_admin());
create policy "admin manages marketplace categories" on public.marketplace_categories for all using(public.is_admin()) with check(public.is_admin());
create policy "public reads canonical provider categories" on public.canonical_provider_categories for select using(active or public.is_admin());
create policy "admin manages canonical provider categories" on public.canonical_provider_categories for all using(public.is_admin()) with check(public.is_admin());
create policy "public reads canonical provider aliases" on public.canonical_provider_category_aliases for select using(true);
create policy "admin manages canonical provider aliases" on public.canonical_provider_category_aliases for all using(public.is_admin()) with check(public.is_admin());
create policy "public reads active provider search" on public.provider_search_documents for select using(
  exists(select 1 from public.provider_profiles provider where provider.id=provider_id and (provider.status='active' or public.owns_provider(provider.id) or public.is_admin()))
);
create policy "admin reads marketplace searches" on public.marketplace_search_queries for select using(public.is_admin());

create trigger marketplace_categories_touch_updated_at before update on public.marketplace_categories
for each row execute function public.touch_updated_at();
create trigger canonical_provider_categories_touch_updated_at before update on public.canonical_provider_categories
for each row execute function public.touch_updated_at();

create or replace function public.publish_provider_onboarding(p_provider_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare profile_row public.provider_profiles%rowtype; cover text; service_count int; primary_count int;
begin
  select * into profile_row from public.provider_profiles where id=p_provider_id and owner_profile_id=auth.uid() for update;
  if not found then raise exception 'not authorized'; end if;
  select cover_path into cover from public.provider_site_settings where provider_id=p_provider_id;
  select count(*) into service_count from public.provider_services where provider_id=p_provider_id and active=true and length(trim(coalesce(description,'')))>=10;
  select count(*) into primary_count from public.provider_categories where provider_id=p_provider_id and assignment_role='primary';
  if length(trim(profile_row.name))<2 or primary_count<>1 or length(regexp_replace(profile_row.phone,'\D','','g'))<10 or length(trim(profile_row.zone))<2 or length(trim(profile_row.bio))<20 or profile_row.avatar_path is null or cover is null or service_count<1 then raise exception 'incomplete provider profile'; end if;
  update public.provider_profiles set status='active',onboarding_step=4 where id=p_provider_id;
end $$;
