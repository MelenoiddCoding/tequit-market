-- Work origins are private. City coverage and work origin are independent.
alter table public.provider_locations add column if not exists market_city_slug text
  check (market_city_slug in ('tepic','uruapan'));

-- Initial Uruapan neighborhoods; centroids are approximate public landmarks, not home addresses.
insert into public.service_areas(name,slug,city,state,area_type,gps_match_radius_km,center) values
  ('Uruapan Centro','uruapan-centro','Uruapan','Michoacán','neighborhood',6,extensions.st_setsrid(extensions.st_makepoint(-102.07095286,19.42413976),4326)::extensions.geography),
  ('La Magdalena','la-magdalena','Uruapan','Michoacán','neighborhood',6,extensions.st_setsrid(extensions.st_makepoint(-102.05904633,19.40770322),4326)::extensions.geography),
  ('Los Riyitos','los-riyitos','Uruapan','Michoacán','neighborhood',6,extensions.st_setsrid(extensions.st_makepoint(-102.07601391,19.43413064),4326)::extensions.geography)
on conflict(name) do update set slug=excluded.slug,city=excluded.city,state=excluded.state,area_type=excluded.area_type,
  gps_match_radius_km=excluded.gps_match_radius_km,center=excluded.center,active=true,updated_at=now();

create or replace function public.save_provider_discovery_location(
  p_provider uuid, p_city_slug text, p_area_slug text, p_lat double precision,
  p_lng double precision, p_source text, p_accuracy_m integer,
  p_coverage_cities text[], p_actor uuid default null
) returns void language plpgsql security definer set search_path=public,extensions as $$
declare city_area public.service_areas%rowtype; selected_area public.service_areas%rowtype;
  selected_point extensions.geography; coverage text;
begin
  if not (public.owns_provider(p_provider) or public.is_admin() or
    (auth.role()='service_role' and exists(select 1 from public.profile_roles where profile_id=p_actor and role='admin')))
  then raise exception 'not authorized'; end if;
  if p_city_slug not in ('tepic','uruapan') or p_source not in ('browser','manual','area') then raise exception 'invalid market'; end if;
  select * into city_area from public.service_areas where slug=p_city_slug and area_type='municipality' and active limit 1;
  if not found or city_area.center is null then raise exception 'market not available'; end if;
  if p_source='area' then
    select * into selected_area from public.service_areas
      where slug=p_area_slug and city=city_area.city and area_type='neighborhood' and active limit 1;
    if not found or selected_area.center is null then raise exception 'invalid neighborhood'; end if;
    selected_point:=selected_area.center;
  else
    if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
      raise exception 'invalid coordinates'; end if;
    selected_point:=st_setsrid(st_makepoint(p_lng,p_lat),4326)::geography;
    if not st_dwithin(selected_point,city_area.center,city_area.gps_match_radius_km*1000) then
      raise exception 'point outside selected market'; end if;
  end if;
  if p_accuracy_m is not null and p_accuracy_m not between 0 and 100000 then raise exception 'invalid accuracy'; end if;
  if p_coverage_cities is null or cardinality(p_coverage_cities) not between 1 and 2
    or not p_city_slug=any(p_coverage_cities)
    or exists(select 1 from unnest(p_coverage_cities) value where value not in ('tepic','uruapan'))
    or cardinality(array(select distinct unnest(p_coverage_cities)))<>cardinality(p_coverage_cities)
  then raise exception 'invalid coverage'; end if;
  insert into public.provider_locations(provider_id,point,area_id,source,accuracy_m,market_city_slug,updated_at)
  values(p_provider,selected_point,coalesce(selected_area.id,city_area.id),
    case when p_source='area' then 'area_centroid' else p_source end,p_accuracy_m,p_city_slug,now())
  on conflict(provider_id) do update set point=excluded.point,area_id=excluded.area_id,
    source=excluded.source,accuracy_m=excluded.accuracy_m,market_city_slug=excluded.market_city_slug,updated_at=now();
  delete from public.provider_service_areas where provider_id=p_provider;
  foreach coverage in array p_coverage_cities loop
    insert into public.provider_service_areas(provider_id,area_id)
    select p_provider,id from public.service_areas where slug=coverage and area_type='municipality' and active
    on conflict do nothing;
  end loop;
  if selected_area.id is not null then
    insert into public.provider_service_areas(provider_id,area_id) values(p_provider,selected_area.id) on conflict do nothing;
  end if;
  update public.provider_profiles set zone=city_area.city||', '||city_area.state where id=p_provider;
end $$;
revoke all on function public.save_provider_discovery_location(uuid,text,text,double precision,double precision,text,integer,text[],uuid) from public,anon;
grant execute on function public.save_provider_discovery_location(uuid,text,text,double precision,double precision,text,integer,text[],uuid) to authenticated,service_role;

create or replace function public.save_provider_coverage_cities(
  p_provider uuid,p_coverage_cities text[],p_actor uuid default null
) returns void language plpgsql security definer set search_path=public as $$
declare home_city text; coverage text;
begin
  if not (public.owns_provider(p_provider) or public.is_admin() or
    (auth.role()='service_role' and exists(select 1 from public.profile_roles where profile_id=p_actor and role='admin')))
  then raise exception 'not authorized'; end if;
  select market_city_slug into home_city from public.provider_locations where provider_id=p_provider;
  if home_city is null or p_coverage_cities is null or cardinality(p_coverage_cities) not between 1 and 2
    or not home_city=any(p_coverage_cities)
    or exists(select 1 from unnest(p_coverage_cities) value where value not in ('tepic','uruapan'))
    or cardinality(array(select distinct unnest(p_coverage_cities)))<>cardinality(p_coverage_cities)
  then raise exception 'invalid coverage'; end if;
  delete from public.provider_service_areas relation using public.service_areas area
  where relation.area_id=area.id and relation.provider_id=p_provider and area.area_type='municipality' and area.slug in ('tepic','uruapan');
  foreach coverage in array p_coverage_cities loop
    insert into public.provider_service_areas(provider_id,area_id)
    select p_provider,id from public.service_areas where slug=coverage and area_type='municipality' and active
    on conflict do nothing;
  end loop;
end $$;
revoke all on function public.save_provider_coverage_cities(uuid,text[],uuid) from public,anon;
grant execute on function public.save_provider_coverage_cities(uuid,text[],uuid) to authenticated,service_role;

-- New self-onboardings need a work origin; already published profiles stay online.
create or replace function public.publish_provider_onboarding(p_provider_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare profile_row public.provider_profiles%rowtype; cover text; service_count int;
begin
  select * into profile_row from public.provider_profiles where id=p_provider_id and owner_profile_id=auth.uid() for update;
  if not found then raise exception 'not authorized'; end if;
  select cover_path into cover from public.provider_site_settings where provider_id=p_provider_id;
  select count(*) into service_count from public.provider_services where provider_id=p_provider_id and active=true and length(trim(coalesce(description,'')))>=10;
  if length(trim(profile_row.name))<2 or length(trim(profile_row.profession))<2 or length(regexp_replace(profile_row.phone,'\D','','g'))<10
    or length(trim(profile_row.zone))<2 or length(trim(profile_row.bio))<20 or profile_row.avatar_path is null
    or cover is null or service_count<1 or not exists(select 1 from public.provider_locations where provider_id=p_provider_id and market_city_slug in ('tepic','uruapan'))
  then raise exception 'incomplete provider profile'; end if;
  update public.provider_profiles set status='active',onboarding_step=4 where id=p_provider_id;
end $$;

-- A municipality-only choice is a city browse. Radius starts when a customer provides a neighborhood or GPS.
create or replace function public.discover_provider_profiles(
  p_query text default '',p_lat double precision default null,p_lng double precision default null,
  p_area_slug text default null,p_verified boolean default false,p_limit integer default 200
) returns table(provider_id uuid,search_rank real,match_type text,distance_m integer)
language sql stable security definer set search_path=public,extensions as $$
with cfg as (select * from public.marketplace_discovery_settings where id=true and enabled),
raw_input as (
  select public.normalize_search_text(p_query) normalized,
    case when public.normalize_search_text(p_query)<>'' then websearch_to_tsquery('spanish',public.normalize_search_text(p_query)) end parsed,
    case when p_lat between -90 and 90 and p_lng between -180 and 180 then st_setsrid(st_makepoint(p_lng,p_lat),4326)::geography end gps_point,
    area.id explicit_area_id,area.center area_center,area.area_type explicit_type,area.city explicit_city
  from (select 1) seed left join public.service_areas area on area.slug=p_area_slug and area.active
), input as (
  select raw_input.normalized,raw_input.parsed,coalesce(raw_input.gps_point,raw_input.area_center) client_point,
    coalesce(raw_input.explicit_area_id,nearest.id) area_id,
    raw_input.gps_point is null and raw_input.explicit_type='municipality' city_only
  from raw_input left join lateral (
    select area.id from public.service_areas area where area.active and raw_input.gps_point is not null
      and st_dwithin(area.center,raw_input.gps_point,area.gps_match_radius_km*1000)
    order by case when area.area_type='neighborhood' then 0 else 1 end,area.center <-> raw_input.gps_point limit 1
  ) nearest on true
), candidates as (
  select provider.id provider_id,public.current_provider_plan(provider.id) plan_code,location.point,
    input.client_point,input.area_id,input.city_only,document.normalized_text,document.search_document,input.normalized,input.parsed,
    case when location.point is not null and input.client_point is not null then st_distance(location.point,input.client_point) end distance_value,
    exists(select 1 from public.provider_service_areas relation join public.service_areas covered on covered.id=relation.area_id
      join public.service_areas requested on requested.id=input.area_id
      where relation.provider_id=provider.id and (covered.id=requested.id or
        (covered.area_type='municipality' and public.normalize_search_text(covered.name)=public.normalize_search_text(requested.city)))) area_match,
    exists(select 1 from public.provider_service_areas relation join public.service_areas covered on covered.id=relation.area_id
      join public.service_areas requested on requested.id=input.area_id
      where relation.provider_id=provider.id and covered.city=requested.city) city_match,
    exists(select 1 from public.provider_verifications verification where verification.provider_id=provider.id) verified,
    (case when length(trim(provider.bio))>=120 then 2 else 0 end
      + case when provider.avatar_path is not null then 1 else 0 end
      + least((select count(*) from public.provider_services service where service.provider_id=provider.id and service.active),3)
      + least((select count(*) from public.provider_media media where media.provider_id=provider.id and media.archived_at is null),3)) completeness_score
  from cfg cross join input join public.provider_profiles provider on provider.status='active'
  left join public.provider_locations location on location.provider_id=provider.id
  left join public.provider_search_documents document on document.provider_id=provider.id
  where input.area_id is not null
)
select candidate.provider_id,
  (case when candidate.normalized='' then 0 else
    ts_rank_cd(candidate.search_document,candidate.parsed)*12 + similarity(candidate.normalized_text,candidate.normalized)*4
    + case when candidate.normalized_text like '%'||candidate.normalized||'%' then 3 else 0 end end)::real search_rank,
  case when candidate.city_only then 'city' when candidate.plan_code in ('pro','premium') then 'service_area' else 'nearby' end match_type,
  case when candidate.city_only then null else round(candidate.distance_value)::integer end distance_m
from candidates candidate cross join cfg
where (not p_verified or candidate.verified)
  and (candidate.normalized='' or candidate.search_document@@candidate.parsed or candidate.normalized_text % candidate.normalized or candidate.normalized_text like '%'||candidate.normalized||'%')
  and case
    when candidate.city_only then candidate.city_match
    when candidate.point is null then false
    when candidate.plan_code in ('pro','premium') then candidate.area_match
    when candidate.plan_code='basic' then candidate.distance_value<=cfg.basic_radius_km*1000
    else candidate.distance_value<=cfg.free_radius_km*1000
  end
order by search_rank desc,distance_m asc,(select rating from public.provider_profiles where id=candidate.provider_id) desc,candidate.completeness_score desc
limit least(greatest(p_limit,1),200);
$$;

-- Existing Uruapan/Tepic profiles get city browse membership only; no coordinate is invented.
insert into public.provider_service_areas(provider_id,area_id)
select provider.id,city.id from public.provider_profiles provider
join public.service_areas city on city.area_type='municipality' and city.slug in ('tepic','uruapan')
  and lower(provider.zone) like lower(city.city)||'%'
where provider.status='active'
on conflict do nothing;

-- Administrative content edits keep provider coverage; location uses the validated RPC.
create or replace function public.admin_save_assisted_content(p_actor uuid,p_onboarding uuid,p_content jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.assisted_onboardings%rowtype; v_entity uuid; v_category text; v_services jsonb;
 v_area text; v_area_id uuid; v_item jsonb; v_table text; v_column text; v_primary uuid; v_secondary uuid[];
begin
 if not exists(select 1 from profile_roles where profile_id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED'; end if;
 select * into o from assisted_onboardings where id=p_onboarding for update;
 if not found then raise exception 'ONBOARDING_REQUIRED'; end if;
 v_entity:=coalesce(o.provider_id,o.business_id);
 if o.kind='provider' then
   perform 1 from provider_profiles where id=v_entity for update;
   v_primary:=(p_content->>'primaryCategoryId')::uuid;
   select name into v_category from canonical_provider_categories where id=v_primary and active;
   if v_category is null then raise exception 'CATEGORY_REQUIRED'; end if;
   select coalesce(array_agg(value::uuid),'{}') into v_secondary from jsonb_array_elements_text(p_content->'secondaryCategoryIds');
   if cardinality(v_secondary)>2 or v_primary=any(v_secondary)
     or (select count(distinct id) from canonical_provider_categories where id=any(v_secondary) and active)<>cardinality(v_secondary) then raise exception 'INVALID_CATEGORIES'; end if;
   update provider_profiles set name=p_content->>'name',profession=v_category,phone=p_content->>'phone',zone=p_content->>'zone',bio=p_content->>'bio' where id=v_entity;
   insert into provider_site_settings(provider_id,headline,intro,years_experience)
     values(v_entity,coalesce(nullif(p_content->>'headline',''),v_category||' en '||(p_content->>'zone')),p_content->>'bio',(p_content->>'yearsExperience')::integer)
     on conflict(provider_id) do update set headline=excluded.headline,intro=excluded.intro,years_experience=excluded.years_experience;
   delete from provider_categories where provider_id=v_entity;
   insert into provider_categories(provider_id,canonical_category_id,assignment_role) values(v_entity,v_primary,'primary');
   insert into provider_categories(provider_id,canonical_category_id,assignment_role) select v_entity,id,'secondary' from unnest(v_secondary) id;
 else
   perform 1 from businesses where id=v_entity for update;
   update businesses set name=p_content->>'name',phone=p_content->>'phone',zone=p_content->>'zone',address=nullif(p_content->>'address',''),description=p_content->>'bio',
     category_id=(select id from service_categories where lower(name)=lower(p_content->>'profession') limit 1) where id=v_entity;
 end if;
 v_services:=admin_replace_assisted_services(p_actor,v_entity,o.kind,p_content->'services');
 v_table:=case when o.kind='provider' then 'provider_service_areas' else 'business_service_areas' end;
 v_column:=case when o.kind='provider' then 'provider_id' else 'business_id' end;
 if o.kind='business' then
   execute format('delete from %I where %I=$1',v_table,v_column) using v_entity;
   for v_area in select distinct value from jsonb_array_elements_text(p_content->'areas') loop
     select id into v_area_id from service_areas where name=v_area and city=split_part(p_content->>'zone',',',1) limit 1;
     if v_area_id is not null then
       execute format('insert into %I(%I,area_id) values($1,$2)',v_table,v_column) using v_entity,v_area_id;
     end if;
   end loop;
 end if;
 v_table:=case when o.kind='provider' then 'provider_verifications' else 'business_verifications' end;
 -- Keep verification dates when only descriptive content changes.
 execute format('delete from %I where %I=$1 and type::text not in (select value->>''type'' from jsonb_array_elements($2))',v_table,v_column) using v_entity,p_content->'verifications';
 for v_item in select value from jsonb_array_elements(p_content->'verifications') loop
   execute format('insert into %I(%I,type,note) select $2,(jsonb_populate_record(null::%I,$1)).type,$3 on conflict(%I,type) do update set note=excluded.note',v_table,v_column,v_table,v_column)
     using v_item,v_entity,v_item->>'note';
 end loop;
 update assisted_onboardings set source=p_content->>'source',consent_confirmed=(p_content->>'consentConfirmed')::boolean,
   consent_at=case when (p_content->>'consentConfirmed')::boolean then coalesce(consent_at,now()) else null end,
   consent_note=p_content->>'consentNote',duplicate_reviewed=(p_content->>'duplicateReviewed')::boolean,duplicate_note=p_content->>'duplicateNote',
   status=case when o.status in ('claimed','published') then o.status else 'ready' end where id=o.id;
 insert into admin_audit_logs(admin_profile_id,action,entity_type,entity_id,metadata)
   values(p_actor,'assisted_content_updated',o.kind,v_entity::text,jsonb_build_object('onboarding_id',o.id));
 return v_services;
end $$;
