drop trigger if exists provider_free_limit on public.provider_services;
drop function if exists public.enforce_free_service_limit();
drop function if exists public.admin_search_providers(text,integer,integer);
alter table public.provider_profiles alter column plan drop default;
alter table public.provider_profiles alter column plan type text using plan::text;
drop type if exists public.plan_type;
alter table public.provider_profiles alter column plan set default 'free';
alter table public.provider_profiles add constraint provider_plan_code_check check(plan in ('free','basic','pro','premium'));

create table public.plan_catalog (
  code text primary key check(code in ('free','basic','pro','premium')),
  name text not null,
  monthly_price_mxn integer not null check(monthly_price_mxn>=0),
  description text not null,
  sort_order integer not null,
  active boolean not null default true
);

create table public.plan_entitlements (
  plan_code text not null references public.plan_catalog(code) on delete cascade,
  feature_key text not null,
  value jsonb not null,
  availability text not null default 'active' check(availability in ('active','coming_soon')),
  primary key(plan_code,feature_key)
);

create table public.provider_plan_assignments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  plan_code text not null references public.plan_catalog(code),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  source text not null check(source in ('welcome','admin','future_purchase','legacy')),
  reason text not null default '',
  created_by uuid references public.profiles(id),
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  check(ends_at is null or ends_at>starts_at)
);
create unique index provider_plan_one_live_idx on public.provider_plan_assignments(provider_id) where revoked_at is null;
create index provider_plan_effective_idx on public.provider_plan_assignments(provider_id,starts_at desc,ends_at);

create table public.welcome_offer_settings (
  id boolean primary key default true check(id),
  enabled boolean not null default true,
  plan_code text not null references public.plan_catalog(code),
  duration_months integer not null check(duration_months between 1 and 24),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.provider_profiles add column if not exists show_phone_call boolean not null default false;
alter table public.provider_media add column if not exists archived_at timestamptz;
alter table public.provider_profiles add column if not exists welcome_seen_assignment_id uuid references public.provider_plan_assignments(id) on delete set null;

insert into public.plan_catalog(code,name,monthly_price_mxn,description,sort_order) values
 ('free','Free',0,'Presencia profesional para empezar en Tequit.',1),
 ('basic','Básico',99,'Métricas esenciales de visitas y contacto.',2),
 ('pro','Pro',199,'Más capacidad, solicitudes y analítica avanzada.',3),
 ('premium','Premium',299,'Máxima capacidad y herramientas avanzadas.',4)
on conflict(code) do update set name=excluded.name,monthly_price_mxn=excluded.monthly_price_mxn,description=excluded.description,sort_order=excluded.sort_order;

insert into public.plan_entitlements(plan_code,feature_key,value,availability) values
 ('free','max_services','5','active'),('free','max_portfolio_items','5','active'),('free','analytics_level','"none"','active'),('free','directed_request_form','false','active'),('free','lead_inbox','false','active'),('free','custom_site_branding','false','active'),('free','phone_contact','true','active'),
 ('basic','max_services','5','active'),('basic','max_portfolio_items','5','active'),('basic','analytics_level','"basic"','active'),('basic','directed_request_form','false','active'),('basic','lead_inbox','false','active'),('basic','custom_site_branding','false','active'),('basic','phone_contact','true','active'),
 ('pro','max_services','15','active'),('pro','max_portfolio_items','10','active'),('pro','analytics_level','"advanced"','active'),('pro','directed_request_form','true','active'),('pro','lead_inbox','true','active'),('pro','custom_site_branding','true','active'),('pro','phone_contact','true','active'),('pro','quotes','false','coming_soon'),('pro','work_orders_pdf','false','coming_soon'),('pro','customer_crm','false','coming_soon'),('pro','branding_kit','false','coming_soon'),('pro','lead_marketplace_access','false','coming_soon'),
 ('premium','max_services','null','active'),('premium','max_portfolio_items','10','active'),('premium','analytics_level','"advanced"','active'),('premium','directed_request_form','true','active'),('premium','lead_inbox','true','active'),('premium','custom_site_branding','true','active'),('premium','phone_contact','true','active'),('premium','multiple_categories','false','coming_soon'),('premium','sponsored_search','false','coming_soon'),('premium','quotes','false','coming_soon'),('premium','work_orders_pdf','false','coming_soon'),('premium','customer_crm','false','coming_soon'),('premium','branding_kit','false','coming_soon'),('premium','lead_marketplace_access','false','coming_soon')
on conflict(plan_code,feature_key) do update set value=excluded.value,availability=excluded.availability;

insert into public.welcome_offer_settings(id,enabled,plan_code,duration_months) values(true,true,'pro',3) on conflict(id) do nothing;

insert into public.provider_plan_assignments(provider_id,plan_code,source,reason)
select id,'pro','legacy','Plan Pro existente antes del sistema de asignaciones' from public.provider_profiles where plan='pro'
on conflict do nothing;

create or replace function public.current_provider_plan(p_provider uuid, p_at timestamptz default now()) returns text
language sql stable security definer set search_path=public as $$
  select coalesce((select a.plan_code from public.provider_plan_assignments a where a.provider_id=p_provider and a.revoked_at is null and a.starts_at<=p_at and (a.ends_at is null or a.ends_at>p_at) order by a.starts_at desc limit 1),'free');
$$;

create or replace function public.provider_entitlement(p_provider uuid,p_feature text) returns jsonb
language sql stable security definer set search_path=public as $$
  select e.value from public.plan_entitlements e where e.plan_code=public.current_provider_plan(p_provider) and e.feature_key=p_feature and e.availability='active';
$$;

create or replace function public.grant_provider_welcome_offer() returns trigger language plpgsql security definer set search_path=public as $$
declare cfg public.welcome_offer_settings%rowtype;
begin
  if new.owner_profile_id is null or (tg_op='UPDATE' and old.owner_profile_id is not null) then return new; end if;
  if exists(select 1 from public.provider_plan_assignments where provider_id=new.id) then return new; end if;
  select * into cfg from public.welcome_offer_settings where id=true;
  if cfg.enabled then
    insert into public.provider_plan_assignments(provider_id,plan_code,starts_at,ends_at,source,reason)
    values(new.id,cfg.plan_code,now(),now()+make_interval(months=>cfg.duration_months),'welcome','Paquete de bienvenida');
    update public.provider_profiles set plan=cfg.plan_code where id=new.id;
  end if;
  return new;
end $$;
create trigger provider_welcome_offer after insert or update of owner_profile_id on public.provider_profiles for each row execute function public.grant_provider_welcome_offer();

create or replace function public.enforce_provider_service_limit() returns trigger language plpgsql security definer set search_path=public as $$
declare max_items integer; active_count integer;
begin
  if new.active is not true then return new; end if;
  select (public.provider_entitlement(new.provider_id,'max_services')#>>'{}')::integer into max_items;
  if max_items is null then return new; end if;
  select count(*) into active_count from public.provider_services where provider_id=new.provider_id and active and id<>new.id;
  if active_count>=max_items then raise exception 'PLAN_SERVICE_LIMIT:%',max_items using errcode='check_violation'; end if;
  return new;
end $$;
create trigger provider_plan_service_limit before insert or update of active,provider_id on public.provider_services for each row execute function public.enforce_provider_service_limit();

create or replace function public.reconcile_provider_plan(p_provider uuid) returns text language plpgsql security definer set search_path=public as $$
declare effective text; service_limit integer; media_limit integer;
begin
 effective:=public.current_provider_plan(p_provider);
 update public.provider_profiles set plan=effective where id=p_provider and plan<>effective;
 select (public.provider_entitlement(p_provider,'max_services')#>>'{}')::integer into service_limit;
 select (public.provider_entitlement(p_provider,'max_portfolio_items')#>>'{}')::integer into media_limit;
 if service_limit is not null then update public.provider_services s set active=false where s.id in (select id from public.provider_services where provider_id=p_provider and active order by created_at,id offset service_limit); end if;
 if media_limit is not null then update public.provider_media m set archived_at=now() where m.id in (select id from public.provider_media where provider_id=p_provider and media_role='portfolio' and archived_at is null order by created_at,id offset media_limit); end if;
 update public.provider_plan_assignments set processed_at=now() where provider_id=p_provider and revoked_at is null and ends_at<=now() and processed_at is null;
 return effective;
end $$;

alter table public.plan_catalog enable row level security; alter table public.plan_entitlements enable row level security; alter table public.provider_plan_assignments enable row level security; alter table public.welcome_offer_settings enable row level security;
create policy "plans public read" on public.plan_catalog for select using(active);
create policy "entitlements public read" on public.plan_entitlements for select using(true);
create policy "provider assignments own read" on public.provider_plan_assignments for select using(public.owns_provider(provider_id) or public.is_admin());
create policy "welcome settings admin read" on public.welcome_offer_settings for select using(public.is_admin());
revoke all on public.provider_plan_assignments,public.welcome_offer_settings from anon,authenticated;
grant select on public.provider_plan_assignments to authenticated; grant select on public.welcome_offer_settings to authenticated;
grant select on public.plan_catalog,public.plan_entitlements to anon,authenticated;
grant all on public.provider_plan_assignments,public.welcome_offer_settings to service_role;
grant execute on function public.current_provider_plan(uuid,timestamptz),public.provider_entitlement(uuid,text) to anon,authenticated,service_role;
revoke all on function public.reconcile_provider_plan(uuid) from public,anon,authenticated; grant execute on function public.reconcile_provider_plan(uuid) to service_role;

alter table public.contact_events drop constraint if exists contact_events_event_type_check;
alter table public.contact_events add constraint contact_events_event_type_check check(event_type in ('profile_view','whatsapp_click','phone_call_click','request_created','service_view','business_view','qr_visit','shared_link_visit','share_action','marketplace_nav_open','marketplace_nav_click'));

create function public.admin_search_providers(p_query text default '',p_limit integer default 15,p_offset integer default 0)
returns table(id uuid,slug text,name text,profession text,phone text,email text,status public.publication_status,plan text,is_demo boolean,total_count bigint)
language sql stable security definer set search_path=public,auth as $$
with matching as(select provider.id,provider.slug,provider.name,provider.profession,provider.phone,coalesce(users.email,profile.recovery_email,'') email,provider.status,public.current_provider_plan(provider.id) plan,provider.is_demo from public.provider_profiles provider left join public.profiles profile on profile.id=provider.owner_profile_id left join auth.users users on users.id=provider.owner_profile_id where trim(coalesce(p_query,''))='' or public.unaccent(lower(provider.name)) like '%'||public.unaccent(lower(trim(p_query)))||'%' or (regexp_replace(trim(p_query),'\D','','g')<>'' and regexp_replace(coalesce(provider.phone,''),'\D','','g') like '%'||regexp_replace(trim(p_query),'\D','','g')||'%') or lower(coalesce(users.email,profile.recovery_email,'')) like '%'||lower(trim(p_query))||'%') select matching.*,count(*) over() from matching order by matching.name,matching.id limit least(greatest(coalesce(p_limit,15),1),50) offset greatest(coalesce(p_offset,0),0);
$$;
revoke all on function public.admin_search_providers(text,integer,integer) from public,anon,authenticated;grant execute on function public.admin_search_providers(text,integer,integer) to service_role;
