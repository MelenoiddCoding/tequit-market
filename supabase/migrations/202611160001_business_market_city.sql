-- City is a confirmed marketplace attribute, separate from the display zone/address.
alter table public.businesses add column if not exists market_city_slug text
  check (market_city_slug in ('tepic', 'uruapan'));
create index if not exists businesses_market_city_active_idx
  on public.businesses (market_city_slug, status) where market_city_slug is not null;

-- Only explicit, non-conflicting city names are safe to migrate automatically.
with evidence as (
  select id,
    (coalesce(zone, '') || ' ' || coalesce(address, '')) ~* '(^|[^[:alpha:]])tepic([^[:alpha:]]|$)' as tepic,
    (coalesce(zone, '') || ' ' || coalesce(address, '')) ~* '(^|[^[:alpha:]])uruapan([^[:alpha:]]|$)' as uruapan
  from public.businesses where market_city_slug is null
)
update public.businesses b set market_city_slug = case when e.tepic then 'tepic' else 'uruapan' end
from evidence e where b.id=e.id and e.tepic <> e.uruapan;

-- A single declared municipality is also unambiguous when the text did not conflict.
with coverage as (
  select b.id, min(a.slug) as city_slug
  from public.businesses b
  join public.business_service_areas ba on ba.business_id=b.id
  join public.service_areas a on a.id=ba.area_id
  where b.market_city_slug is null and a.area_type='municipality' and a.slug in ('tepic','uruapan')
  group by b.id having count(distinct a.slug)=1
)
update public.businesses b set market_city_slug=c.city_slug
from coverage c
where b.id=c.id
  and (coalesce(b.zone,'')||' '||coalesce(b.address,'')) !~* '(^|[^[:alpha:]])(tepic|uruapan)([^[:alpha:]]|$)';

-- Keep the original implementation for the wrapper but disallow legacy public calls without city.
create or replace function public.complete_business_onboarding(
  p_name text, p_category text, p_phone text, p_zone text,
  p_description text, p_first_service text, p_market_city_slug text
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if p_market_city_slug not in ('tepic', 'uruapan') then raise exception 'CITY_REQUIRED'; end if;
  v_id := public.complete_business_onboarding(p_name,p_category,p_phone,p_zone,p_description,p_first_service);
  update public.businesses set market_city_slug=p_market_city_slug where id=v_id;
  return v_id;
end $$;
revoke all on function public.complete_business_onboarding(text,text,text,text,text,text,text) from public, anon;
grant execute on function public.complete_business_onboarding(text,text,text,text,text,text,text) to authenticated, service_role;
revoke execute on function public.complete_business_onboarding(text,text,text,text,text,text) from public, anon, authenticated;
