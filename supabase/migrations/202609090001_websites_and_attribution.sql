-- Website sales are independent of marketplace plans. Apply before deploying the app.
create table public.provider_website_access (
 provider_id uuid primary key references public.provider_profiles(id) on delete cascade,
 starts_at timestamptz not null default now(),
 ends_at timestamptz,
 source text not null check(source in ('legacy','purchase','admin')),
 enabled boolean not null default true,
 updated_at timestamptz not null default now(),
 check(ends_at is null or ends_at>starts_at)
);
-- Preserve already published URLs without inventing a sale or expiry.
insert into public.provider_website_access(provider_id,source)
select id,'legacy' from public.provider_profiles where status='active' and not is_demo;

create table public.website_orders (
 id uuid primary key default gen_random_uuid(),
 provider_id uuid not null references public.provider_profiles(id),
 amount_mxn integer not null check(amount_mxn between 0 and 100000),
 duration_months integer not null check(duration_months between 1 and 24),
 offer_version text not null default 'website-v1',
 status text not null default 'pending' check(status in ('pending','paid','published','cancelled')),
 payment_reference text,
 paid_at timestamptz,
 published_at timestamptz,
 starts_at timestamptz,
 ends_at timestamptz,
 created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now()
);
create unique index website_order_one_pending on public.website_orders(provider_id) where status in ('pending','paid');
alter table public.provider_website_access enable row level security;
alter table public.website_orders enable row level security;
create policy "website access own read" on public.provider_website_access for select to authenticated using(public.owns_provider(provider_id) or public.is_admin());
create policy "website orders own read" on public.website_orders for select to authenticated using(public.owns_provider(provider_id) or public.is_admin());
revoke all on public.provider_website_access, public.website_orders from anon,authenticated;
grant select on public.provider_website_access, public.website_orders to authenticated;
grant all on public.provider_website_access, public.website_orders to service_role;

create function public.admin_website_order(p_admin uuid,p_action text,p_provider uuid default null,p_order uuid default null,p_amount integer default 699,p_months integer default 12,p_reference text default '')
returns uuid language plpgsql security definer set search_path=public as $$
declare o public.website_orders%rowtype; v_id uuid; v_start timestamptz; v_end timestamptz; v_access public.provider_website_access%rowtype;
begin
 if not exists(select 1 from public.profile_roles where profile_id=p_admin and role='admin') then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
 if p_action='create' then
   perform 1 from public.provider_profiles where id=p_provider and not is_demo for update;
   if not found then raise exception 'PROVIDER_NOT_FOUND'; end if;
   insert into public.website_orders(provider_id,amount_mxn,duration_months,created_by)
    values(p_provider,p_amount,p_months,p_admin) returning id into v_id;
 else
   -- Lock provider before order, consistently with creation/publication.
   select provider_id into p_provider from public.website_orders where id=p_order;
   perform 1 from public.provider_profiles where id=p_provider for update;
   select * into o from public.website_orders where id=p_order for update;
   if not found then raise exception 'ORDER_NOT_FOUND'; end if;
   v_id:=o.id;
   if p_action='pay' then
     if o.status='paid' then return o.id; end if;
     if o.status<>'pending' or length(trim(p_reference))<3 then raise exception 'PAYMENT_REFERENCE_REQUIRED'; end if;
     update public.website_orders set status='paid',paid_at=now(),payment_reference=left(trim(p_reference),160) where id=o.id;
   elsif p_action='publish' then
     if o.status='published' then return o.id; end if;
     if o.status<>'paid' then raise exception 'PAYMENT_REQUIRED'; end if;
     if not exists(select 1 from public.provider_profiles where id=o.provider_id and status='active' and not is_demo) then raise exception 'PUBLISH_PROFILE_FIRST'; end if;
     if not exists(select 1 from public.provider_site_settings where provider_id=o.provider_id and length(trim(headline))>=8 and length(trim(intro))>=40) then raise exception 'COMPLETE_SITE_FIRST'; end if;
     select * into v_access from public.provider_website_access where provider_id=o.provider_id;
     v_start:=now();
     v_end:=greatest(now(),coalesce(v_access.ends_at,now()))+make_interval(months=>o.duration_months);
     -- Legacy indefinite grants must never be shortened by a purchase.
     if v_access.enabled and v_access.ends_at is null and v_access.provider_id is not null then v_end:=null; end if;
     insert into public.provider_website_access(provider_id,starts_at,ends_at,source)
     values(o.provider_id,v_start,v_end,'purchase')
     on conflict(provider_id) do update set ends_at=excluded.ends_at,enabled=true,source=excluded.source,updated_at=now();
     update public.website_orders set status='published',published_at=now(),starts_at=v_start,ends_at=v_end where id=o.id;
   elsif p_action='cancel' then
     if o.status='cancelled' then return o.id; end if;
     if o.status<>'pending' then raise exception 'ONLY_UNPAID_CANCELLABLE'; end if;
     update public.website_orders set status='cancelled' where id=o.id;
   else raise exception 'INVALID_ACTION';
   end if;
 end if;
 insert into public.admin_audit_logs(admin_profile_id,action,entity_type,entity_id,metadata)
 values(p_admin,'website_'||p_action,'website_order',v_id::text,(select jsonb_build_object('providerId',provider_id,'amountMxn',amount_mxn,'durationMonths',duration_months,'endsAt',ends_at) from public.website_orders where id=v_id));
 return v_id;
end $$;
revoke all on function public.admin_website_order(uuid,text,uuid,uuid,integer,integer,text) from public,anon,authenticated;
grant execute on function public.admin_website_order(uuid,text,uuid,uuid,integer,integer,text) to service_role;

-- Welcome starts once, on first public activation, including assisted profiles.
alter table public.provider_profiles add column welcome_considered_at timestamptz;
update public.provider_profiles set welcome_considered_at=now() where status='active';
create or replace function public.grant_provider_welcome_offer() returns trigger language plpgsql security definer set search_path=public as $$
declare cfg public.welcome_offer_settings%rowtype;
begin
 if new.status<>'active' or new.is_demo or new.welcome_considered_at is not null then return new; end if;
 update public.provider_profiles set welcome_considered_at=now() where id=new.id;
 if exists(select 1 from public.provider_plan_assignments where provider_id=new.id) then return new; end if;
 select * into cfg from public.welcome_offer_settings where id=true;
 if cfg.enabled then
  insert into public.provider_plan_assignments(provider_id,plan_code,starts_at,ends_at,source,reason)
  values(new.id,cfg.plan_code,now(),now()+make_interval(months=>cfg.duration_months),'welcome','Bienvenida desde primera publicación');
  update public.provider_profiles set plan=cfg.plan_code where id=new.id;
 end if;
 return new;
end $$;
drop trigger provider_welcome_offer on public.provider_profiles;
create trigger provider_welcome_offer after insert or update of status on public.provider_profiles for each row execute function public.grant_provider_welcome_offer();

alter table public.contact_events add column event_key text;
create unique index contact_events_event_key_unique on public.contact_events(event_key) where event_key is not null;
alter table public.contact_events drop constraint if exists contact_events_event_type_check;
alter table public.contact_events add constraint contact_events_event_type_check check(event_type in ('profile_view','website_view','directory_view','whatsapp_click','phone_call_click','request_created','service_view','business_view','qr_visit','shared_link_visit','share_action','marketplace_nav_open','marketplace_nav_click'));
