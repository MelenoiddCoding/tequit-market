-- Private provider/customer location and plan-aware marketplace discovery.
create extension if not exists postgis with schema extensions;

alter table public.service_areas
  add column if not exists slug text,
  add column if not exists area_type text not null default 'neighborhood',
  add column if not exists active boolean not null default true,
  add column if not exists gps_match_radius_km numeric(5,2) not null default 8 check(gps_match_radius_km between .5 and 100),
  add column if not exists center extensions.geography(point,4326),
  add column if not exists updated_at timestamptz not null default now();

update public.service_areas
set slug=trim(both '-' from regexp_replace(public.normalize_search_text(name), '\s+', '-', 'g'))
where slug is null;
alter table public.service_areas alter column slug set not null;
alter table public.service_areas add constraint service_areas_type_check
  check(area_type in ('municipality','neighborhood')) not valid;
alter table public.service_areas validate constraint service_areas_type_check;
create unique index if not exists service_areas_city_slug_idx on public.service_areas(city,slug);
create index if not exists service_areas_center_gix on public.service_areas using gist(center);

insert into public.service_areas(name,slug,city,state,area_type,center) values
  ('Tepic','tepic','Tepic','Nayarit','municipality',extensions.st_setsrid(extensions.st_makepoint(-104.8957,21.5095),4326)::extensions.geography),
  ('Centro','centro','Tepic','Nayarit','neighborhood',extensions.st_setsrid(extensions.st_makepoint(-104.8950,21.5114),4326)::extensions.geography),
  ('Ciudad del Valle','ciudad-del-valle','Tepic','Nayarit','neighborhood',extensions.st_setsrid(extensions.st_makepoint(-104.8910,21.4939),4326)::extensions.geography),
  ('Las Canteras','las-canteras','Tepic','Nayarit','neighborhood',extensions.st_setsrid(extensions.st_makepoint(-104.8500,21.4770),4326)::extensions.geography),
  ('Lomas de la Cruz','lomas-de-la-cruz','Tepic','Nayarit','neighborhood',extensions.st_setsrid(extensions.st_makepoint(-104.9060,21.5200),4326)::extensions.geography),
  ('Mololoa','mololoa','Tepic','Nayarit','neighborhood',extensions.st_setsrid(extensions.st_makepoint(-104.8810,21.5150),4326)::extensions.geography),
  ('Valle de Matatipac','valle-de-matatipac','Tepic','Nayarit','neighborhood',extensions.st_setsrid(extensions.st_makepoint(-104.8760,21.4920),4326)::extensions.geography),
  ('Xalisco','xalisco','Xalisco','Nayarit','municipality',extensions.st_setsrid(extensions.st_makepoint(-104.8980,21.4517),4326)::extensions.geography)
on conflict(name) do update set slug=excluded.slug,city=excluded.city,state=excluded.state,area_type=excluded.area_type,center=excluded.center,active=true,updated_at=now();

-- Legacy areas get an approximate city centroid until an administrator refines them.
update public.service_areas set center=case
  when lower(city)='xalisco' then extensions.st_setsrid(extensions.st_makepoint(-104.8980,21.4517),4326)::extensions.geography
  else extensions.st_setsrid(extensions.st_makepoint(-104.8957,21.5095),4326)::extensions.geography
end where center is null;
update public.service_areas set gps_match_radius_km=case when area_type='municipality' then 25 else 6 end;

create table public.provider_locations (
  provider_id uuid primary key references public.provider_profiles(id) on delete cascade,
  point extensions.geography(point,4326) not null,
  area_id uuid references public.service_areas(id),
  source text not null check(source in ('browser','manual','area_centroid','admin')),
  accuracy_m integer check(accuracy_m is null or accuracy_m between 0 and 100000),
  updated_at timestamptz not null default now()
);
create index provider_locations_point_gix on public.provider_locations using gist(point);

create table public.customer_location_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  point extensions.geography(point,4326),
  area_id uuid references public.service_areas(id),
  source text not null check(source in ('browser','manual')),
  label text not null check(char_length(label) between 1 and 120),
  consent_version text not null,
  consented_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(point is not null or area_id is not null)
);

create table public.marketplace_discovery_settings (
  id boolean primary key default true check(id),
  enabled boolean not null default true,
  free_radius_km numeric(5,2) not null default 3 check(free_radius_km between .5 and 100),
  basic_radius_km numeric(5,2) not null default 5 check(basic_radius_km between .5 and 100),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);
insert into public.marketplace_discovery_settings(id) values(true) on conflict(id) do nothing;

insert into public.plan_entitlements(plan_code,feature_key,value,availability) values
  ('free','discovery_mode','"radius"','active'),('free','discovery_radius_km','3','active'),
  ('basic','discovery_mode','"radius"','active'),('basic','discovery_radius_km','5','active'),
  ('pro','discovery_mode','"service_area"','active'),('pro','discovery_radius_km','null','active'),
  ('premium','discovery_mode','"service_area"','active'),('premium','discovery_radius_km','null','active')
on conflict(plan_code,feature_key) do update set value=excluded.value,availability=excluded.availability;

-- Transitional coverage: use the primary service-area centroid or Tepic until it is refined.
insert into public.provider_locations(provider_id,point,area_id,source)
select provider.id,coalesce(area.center,tepic.center),coalesce(area.id,tepic.id),'area_centroid'
from public.provider_profiles provider
cross join lateral (select id,center from public.service_areas where slug='tepic' and city='Tepic' limit 1) tepic
left join lateral (
  select service_area.id,service_area.center from public.provider_service_areas relation
  join public.service_areas service_area on service_area.id=relation.area_id
  where relation.provider_id=provider.id order by service_area.area_type desc,service_area.name limit 1
) area on true
on conflict(provider_id) do nothing;

insert into public.provider_service_areas(provider_id,area_id)
select provider.id,area.id from public.provider_profiles provider
cross join public.service_areas area
where area.slug='tepic' and area.city='Tepic'
  and not exists(select 1 from public.provider_service_areas relation where relation.provider_id=provider.id)
on conflict do nothing;

create or replace function public.save_customer_location(
  p_lat double precision,p_lng double precision,p_area_slug text,p_label text,p_source text,p_consent_version text
) returns void language plpgsql security definer set search_path=public,extensions as $$
declare selected_area uuid; selected_point extensions.geography;
begin
  if auth.uid() is null then raise exception 'not authorized'; end if;
  if p_source not in ('browser','manual') or p_consent_version<>'2026-10-09' then raise exception 'invalid location consent'; end if;
  if p_area_slug is not null then
    select id,center into selected_area,selected_point from public.service_areas where slug=p_area_slug and active limit 1;
    if selected_area is null then raise exception 'invalid service area'; end if;
  elsif p_lat between -90 and 90 and p_lng between -180 and 180 then
    selected_point:=st_setsrid(st_makepoint(p_lng,p_lat),4326)::geography;
  else raise exception 'invalid coordinates'; end if;
  insert into public.customer_location_preferences(profile_id,point,area_id,source,label,consent_version,consented_at,updated_at)
  values(auth.uid(),selected_point,selected_area,p_source,left(trim(p_label),120),p_consent_version,now(),now())
  on conflict(profile_id) do update set point=excluded.point,area_id=excluded.area_id,source=excluded.source,label=excluded.label,
    consent_version=excluded.consent_version,consented_at=excluded.consented_at,updated_at=now();
end $$;

create or replace function public.save_provider_location(
  p_provider uuid,p_lat double precision,p_lng double precision,p_area_slug text,p_source text,p_accuracy_m integer default null
) returns void language plpgsql security definer set search_path=public,extensions as $$
declare selected_area uuid; selected_point extensions.geography;
begin
  if not (public.owns_provider(p_provider) or public.is_admin()) then raise exception 'not authorized'; end if;
  if p_source not in ('browser','manual','admin') then raise exception 'invalid source'; end if;
  if p_area_slug is not null then
    select id,center into selected_area,selected_point from public.service_areas where slug=p_area_slug and active limit 1;
    if selected_area is null then raise exception 'invalid service area'; end if;
  end if;
  if p_lat between -90 and 90 and p_lng between -180 and 180 then selected_point:=st_setsrid(st_makepoint(p_lng,p_lat),4326)::geography; end if;
  if selected_point is null then raise exception 'invalid coordinates'; end if;
  insert into public.provider_locations(provider_id,point,area_id,source,accuracy_m,updated_at)
  values(p_provider,selected_point,selected_area,p_source,p_accuracy_m,now())
  on conflict(provider_id) do update set point=excluded.point,area_id=excluded.area_id,source=excluded.source,accuracy_m=excluded.accuracy_m,updated_at=now();
  if selected_area is not null then insert into public.provider_service_areas(provider_id,area_id) values(p_provider,selected_area) on conflict do nothing; end if;
end $$;

create or replace function public.discover_provider_profiles(
  p_query text default '',p_lat double precision default null,p_lng double precision default null,
  p_area_slug text default null,p_verified boolean default false,p_limit integer default 200
) returns table(provider_id uuid,search_rank real,match_type text,distance_m integer)
language sql stable security definer set search_path=public,extensions as $$
with cfg as (
  select * from public.marketplace_discovery_settings where id=true and enabled
), raw_input as (
  select public.normalize_search_text(p_query) normalized,
    case when public.normalize_search_text(p_query)<>'' then websearch_to_tsquery('spanish',public.normalize_search_text(p_query)) end parsed,
    case when p_lat between -90 and 90 and p_lng between -180 and 180 then st_setsrid(st_makepoint(p_lng,p_lat),4326)::geography end gps_point,
    area.id explicit_area_id,area.center area_center
  from (select 1) seed left join public.service_areas area on area.slug=p_area_slug and area.active
), input as (
  select raw_input.normalized,raw_input.parsed,coalesce(raw_input.gps_point,raw_input.area_center) client_point,
    coalesce(raw_input.explicit_area_id,nearest.id) area_id
  from raw_input left join lateral (
    select area.id from public.service_areas area
    where area.active and raw_input.gps_point is not null
      and st_dwithin(area.center,raw_input.gps_point,area.gps_match_radius_km*1000)
    order by case when area.area_type='neighborhood' then 0 else 1 end,area.center <-> raw_input.gps_point limit 1
  ) nearest on true
), candidates as (
  select provider.id provider_id,public.current_provider_plan(provider.id) plan_code,location.point,
    input.client_point,input.area_id,document.normalized_text,document.search_document,input.normalized,input.parsed,
    case when input.client_point is not null then st_distance(location.point,input.client_point) end distance_value,
    exists(
      select 1 from public.provider_service_areas relation
      join public.service_areas covered on covered.id=relation.area_id
      join public.service_areas requested on requested.id=input.area_id
      where relation.provider_id=provider.id and (
        covered.id=requested.id or
        (covered.area_type='municipality' and public.normalize_search_text(covered.name)=public.normalize_search_text(requested.city))
      )
    ) area_match,
    exists(select 1 from public.provider_verifications verification where verification.provider_id=provider.id) verified,
    (case when length(trim(provider.bio))>=120 then 2 else 0 end
      + case when provider.avatar_path is not null then 1 else 0 end
      + least((select count(*) from public.provider_services service where service.provider_id=provider.id and service.active),3)
      + least((select count(*) from public.provider_media media where media.provider_id=provider.id and media.archived_at is null),3)) completeness_score
  from cfg cross join input
  join public.provider_profiles provider on provider.status='active'
  join public.provider_locations location on location.provider_id=provider.id
  left join public.provider_search_documents document on document.provider_id=provider.id
  where input.client_point is not null
)
select candidate.provider_id,
  (case when candidate.normalized='' then 0 else
    ts_rank_cd(candidate.search_document,candidate.parsed)*12 + similarity(candidate.normalized_text,candidate.normalized)*4
    + case when candidate.normalized_text like '%'||candidate.normalized||'%' then 3 else 0 end end)::real search_rank,
  case when candidate.plan_code in ('pro','premium') then 'service_area' else 'nearby' end match_type,
  round(candidate.distance_value)::integer distance_m
from candidates candidate cross join cfg
where (not p_verified or candidate.verified)
  and (candidate.normalized='' or candidate.search_document@@candidate.parsed or candidate.normalized_text % candidate.normalized or candidate.normalized_text like '%'||candidate.normalized||'%')
  and case
    when candidate.plan_code in ('pro','premium') then candidate.area_id is not null and candidate.area_match
    when candidate.plan_code='basic' then candidate.distance_value<=cfg.basic_radius_km*1000
    else candidate.distance_value<=cfg.free_radius_km*1000
  end
order by search_rank desc,distance_m asc,(select rating from public.provider_profiles where id=candidate.provider_id) desc,candidate.completeness_score desc
limit least(greatest(p_limit,1),200);
$$;

alter table public.provider_locations enable row level security;
alter table public.customer_location_preferences enable row level security;
alter table public.marketplace_discovery_settings enable row level security;
create policy "Provider owners read location" on public.provider_locations for select to authenticated using(public.owns_provider(provider_id) or public.is_admin());
create policy "Customers read own location" on public.customer_location_preferences for select to authenticated using(auth.uid()=profile_id);
create policy "Customers delete own location" on public.customer_location_preferences for delete to authenticated using(auth.uid()=profile_id);
create policy "Discovery settings public read" on public.marketplace_discovery_settings for select using(true);
create policy "Discovery settings admin update" on public.marketplace_discovery_settings for update to authenticated using(public.is_admin()) with check(public.is_admin());

revoke all on public.provider_locations,public.customer_location_preferences from public,anon,authenticated;
grant select on public.provider_locations to authenticated;
grant select,delete on public.customer_location_preferences to authenticated;
grant select on public.marketplace_discovery_settings to anon,authenticated;
grant all on public.provider_locations,public.customer_location_preferences,public.marketplace_discovery_settings to service_role;
grant execute on function public.save_customer_location(double precision,double precision,text,text,text,text) to authenticated;
grant execute on function public.save_provider_location(uuid,double precision,double precision,text,text,integer) to authenticated;
grant execute on function public.discover_provider_profiles(text,double precision,double precision,text,boolean,integer) to anon,authenticated;

comment on table public.provider_locations is 'Private approximate work origin used for radius discovery; never expose through public profile queries.';
comment on table public.customer_location_preferences is 'Private, consented discovery location for authenticated customers.';

-- Privacy notice revision covering approximate location discovery.
update public.legal_documents set active=false where document_type='privacy' and active;
insert into public.legal_documents(document_type,version,title,content_sha256,effective_at,active)
values('privacy','2026-10-09','Aviso y Política de Privacidad','6660702284c8540acd3226d27000c668c05488f62dda0bc9eff30ec338bada33','2026-10-09T00:00:00-06:00',true)
on conflict(document_type,version) do update set title=excluded.title,content_sha256=excluded.content_sha256,effective_at=excluded.effective_at,active=true;
