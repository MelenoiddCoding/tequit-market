-- A provider on an area-based plan can serve the area without disclosing or inventing a work origin.
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
    area.id explicit_area_id,area.center area_center,area.area_type explicit_type
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
    when candidate.plan_code in ('pro','premium') then candidate.area_match
    when candidate.point is null then false
    when candidate.plan_code='basic' then candidate.distance_value<=cfg.basic_radius_km*1000
    else candidate.distance_value<=cfg.free_radius_km*1000
  end
order by search_rank desc,distance_m asc,(select rating from public.provider_profiles where id=candidate.provider_id) desc,candidate.completeness_score desc
limit least(greatest(p_limit,1),200);
$$;
