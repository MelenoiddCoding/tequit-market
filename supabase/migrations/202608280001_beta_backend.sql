-- Tequit beta: authentication, customer accounts, operational tables and hardened RLS.

alter type public.app_role add value if not exists 'customer';

alter table public.profiles
  add column if not exists must_change_password boolean not null default false;
alter table public.provider_profiles
  add column if not exists is_demo boolean not null default false;
alter table public.businesses
  add column if not exists is_demo boolean not null default false;
alter table public.leads
  add column if not exists customer_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists upload_token_hash text;

create type public.plan_request_status as enum ('pending','approved','rejected');

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((provider_id is not null)::int + (business_id is not null)::int = 1)
);
create unique index favorites_provider_unique on public.favorites(profile_id,provider_id) where provider_id is not null;
create unique index favorites_business_unique on public.favorites(profile_id,business_id) where business_id is not null;

create table public.plan_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  status public.plan_request_status not null default 'pending',
  note text not null default '',
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  check ((provider_id is not null)::int + (business_id is not null)::int = 1)
);

create table public.rate_limits (
  key text primary key,
  action text not null,
  window_started_at timestamptz not null,
  attempts integer not null default 1,
  updated_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_profile_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index favorites_profile_idx on public.favorites(profile_id,created_at desc);
create index leads_customer_idx on public.leads(customer_profile_id,created_at desc);
create index plan_requests_status_idx on public.plan_requests(status,created_at desc);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path=public as $$
begin new.updated_at=now(); return new; end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','service_categories','canonical_services','provider_profiles','businesses','provider_services','business_services','business_products','provider_business_affiliations','provider_media','leads','reviews'] loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I',table_name,table_name);
    execute format('create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',table_name,table_name);
  end loop;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
declare selected_role public.app_role;
begin
  selected_role := case new.raw_user_meta_data->>'role'
    when 'provider' then 'provider'::public.app_role
    when 'business_owner' then 'business_owner'::public.app_role
    else 'customer'::public.app_role
  end;
  insert into public.profiles(id,display_name,phone)
  values(new.id,coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),split_part(coalesce(new.email,''),'@',1)),nullif(trim(new.raw_user_meta_data->>'phone'),''))
  on conflict(id) do nothing;
  insert into public.profile_roles(profile_id,role) values(new.id,selected_role) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.slugify(value text) returns text
language sql immutable set search_path=public as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(value,''))),'[^a-z0-9]+','-','g'));
$$;

create or replace function public.unique_provider_slug(base_name text) returns text
language plpgsql security definer set search_path=public as $$
declare base text:=public.slugify(base_name); candidate text; suffix int:=1;
begin
  if base='' then base:='prestador'; end if; candidate:=base;
  while exists(select 1 from public.provider_profiles where slug=candidate) loop suffix:=suffix+1; candidate:=base||'-'||suffix; end loop;
  return candidate;
end $$;

create or replace function public.unique_business_slug(base_name text) returns text
language plpgsql security definer set search_path=public as $$
declare base text:=public.slugify(base_name); candidate text; suffix int:=1;
begin
  if base='' then base:='negocio'; end if; candidate:=base;
  while exists(select 1 from public.businesses where slug=candidate) loop suffix:=suffix+1; candidate:=base||'-'||suffix; end loop;
  return candidate;
end $$;

create or replace function public.complete_provider_onboarding(
  p_name text,p_profession text,p_phone text,p_zone text,p_bio text,p_first_service text
) returns uuid language plpgsql security definer set search_path=public as $$
declare provider_uuid uuid; service_uuid uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if length(trim(p_name))<2 or length(trim(p_profession))<2 or length(trim(p_phone))<10 or length(trim(p_bio))<20 then raise exception 'invalid onboarding data'; end if;
  insert into public.provider_profiles(owner_profile_id,slug,name,profession,phone,zone,bio,status)
  values(auth.uid(),public.unique_provider_slug(p_name),trim(p_name),trim(p_profession),trim(p_phone),trim(p_zone),trim(p_bio),'active')
  on conflict(owner_profile_id) do update set name=excluded.name,profession=excluded.profession,phone=excluded.phone,zone=excluded.zone,bio=excluded.bio
  returning id into provider_uuid;
  select id into service_uuid from public.canonical_services where slug=public.slugify(p_first_service) or lower(name)=lower(trim(p_first_service)) limit 1;
  if not exists(select 1 from public.provider_services where provider_id=provider_uuid and lower(title)=lower(trim(p_first_service))) then
    insert into public.provider_services(provider_id,canonical_service_id,title,active) values(provider_uuid,service_uuid,trim(p_first_service),true);
  end if;
  return provider_uuid;
end $$;

create or replace function public.complete_business_onboarding(
  p_name text,p_category text,p_phone text,p_zone text,p_description text,p_first_service text
) returns uuid language plpgsql security definer set search_path=public as $$
declare business_uuid uuid; category_uuid uuid; service_uuid uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if length(trim(p_name))<2 or length(trim(p_category))<2 or length(trim(p_phone))<10 or length(trim(p_description))<20 then raise exception 'invalid onboarding data'; end if;
  select id into category_uuid from public.service_categories where slug=public.slugify(p_category) or lower(name)=lower(trim(p_category)) limit 1;
  insert into public.businesses(slug,name,category_id,description,phone,zone,status)
  values(public.unique_business_slug(p_name),trim(p_name),category_uuid,trim(p_description),trim(p_phone),trim(p_zone),'active') returning id into business_uuid;
  insert into public.business_members(business_id,profile_id,member_role) values(business_uuid,auth.uid(),'owner');
  select id into service_uuid from public.canonical_services where slug=public.slugify(p_first_service) or lower(name)=lower(trim(p_first_service)) limit 1;
  insert into public.business_services(business_id,canonical_service_id,title,active) values(business_uuid,service_uuid,trim(p_first_service),true);
  return business_uuid;
end $$;

create or replace function public.consume_rate_limit(p_key text,p_action text,p_limit int,p_window_seconds int)
returns boolean language plpgsql security definer set search_path=public as $$
declare current_row public.rate_limits%rowtype;
begin
  if p_limit<1 or p_window_seconds<1 then return false; end if;
  select * into current_row from public.rate_limits where key=p_key for update;
  if not found or current_row.window_started_at < now()-make_interval(secs=>p_window_seconds) then
    insert into public.rate_limits(key,action,window_started_at,attempts,updated_at) values(p_key,p_action,now(),1,now())
    on conflict(key) do update set action=excluded.action,window_started_at=excluded.window_started_at,attempts=1,updated_at=now();
    return true;
  end if;
  if current_row.attempts>=p_limit then return false; end if;
  update public.rate_limits set attempts=attempts+1,updated_at=now() where key=p_key;
  return true;
end $$;

create or replace function public.recalculate_rating() returns trigger
language plpgsql security definer set search_path=public as $$
declare provider_uuid uuid:=coalesce(new.provider_id,old.provider_id); business_uuid uuid:=coalesce(new.business_id,old.business_id);
begin
  if provider_uuid is not null then update public.provider_profiles set rating=coalesce((select round(avg(rating)::numeric,1) from public.reviews where provider_id=provider_uuid and status='approved'),0),review_count=(select count(*) from public.reviews where provider_id=provider_uuid and status='approved') where id=provider_uuid; end if;
  if business_uuid is not null then update public.businesses set rating=coalesce((select round(avg(rating)::numeric,1) from public.reviews where business_id=business_uuid and status='approved'),0),review_count=(select count(*) from public.reviews where business_id=business_uuid and status='approved') where id=business_uuid; end if;
  return coalesce(new,old);
end $$;
drop trigger if exists reviews_recalculate_rating on public.reviews;
create trigger reviews_recalculate_rating after insert or update or delete on public.reviews for each row execute function public.recalculate_rating();

-- Enable RLS on every application table, including public taxonomy.
alter table public.profiles enable row level security;
alter table public.profile_roles enable row level security;
alter table public.service_categories enable row level security;
alter table public.canonical_services enable row level security;
alter table public.service_aliases enable row level security;
alter table public.provider_categories enable row level security;
alter table public.service_areas enable row level security;
alter table public.provider_service_areas enable row level security;
alter table public.business_service_areas enable row level security;
alter table public.favorites enable row level security;
alter table public.plan_requests enable row level security;
alter table public.rate_limits enable row level security;
alter table public.admin_audit_logs enable row level security;

create policy "public reads categories" on public.service_categories for select using(active);
create policy "public reads canonical services" on public.canonical_services for select using(active);
create policy "public reads service aliases" on public.service_aliases for select using(true);
create policy "public reads service areas" on public.service_areas for select using(true);
create policy "public reads provider categories" on public.provider_categories for select using(true);
create policy "public reads provider areas" on public.provider_service_areas for select using(true);
create policy "public reads business areas" on public.business_service_areas for select using(true);
create policy "profiles read own" on public.profiles for select using(id=auth.uid() or public.is_admin());
create policy "profiles update own" on public.profiles for update using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
create policy "roles read own" on public.profile_roles for select using(profile_id=auth.uid() or public.is_admin());
create policy "admin manages taxonomy categories" on public.service_categories for all using(public.is_admin()) with check(public.is_admin());
create policy "admin manages canonical services" on public.canonical_services for all using(public.is_admin()) with check(public.is_admin());
create policy "admin manages aliases" on public.service_aliases for all using(public.is_admin()) with check(public.is_admin());
create policy "favorites own" on public.favorites for all using(profile_id=auth.uid()) with check(profile_id=auth.uid());
create policy "plan requests own read" on public.plan_requests for select using(profile_id=auth.uid() or public.is_admin());
create policy "plan requests own insert" on public.plan_requests for insert with check(profile_id=auth.uid());
create policy "plan requests admin update" on public.plan_requests for update using(public.is_admin()) with check(public.is_admin());
create policy "audit admin read" on public.admin_audit_logs for select using(public.is_admin());

-- Customer owners can read their own requests and private media.
drop policy if exists "owners read directed leads" on public.leads;
create policy "participants read leads" on public.leads for select using(public.is_admin() or customer_profile_id=auth.uid() or public.owns_provider(target_provider_id) or public.is_business_member(target_business_id));
drop policy if exists "owners update directed leads" on public.leads;
create policy "targets update leads" on public.leads for update using(public.is_admin() or public.owns_provider(target_provider_id) or public.is_business_member(target_business_id)) with check(public.is_admin() or public.owns_provider(target_provider_id) or public.is_business_member(target_business_id));
drop policy if exists "owners read lead media" on public.lead_media;
create policy "participants read lead media" on public.lead_media for select using(public.is_admin() or exists(select 1 from public.leads l where l.id=lead_id and (l.customer_profile_id=auth.uid() or public.owns_provider(l.target_provider_id) or public.is_business_member(l.target_business_id))));

-- Owners need complete CRUD for portfolio, affiliations, areas and media.
create policy "owner manages provider media" on public.provider_media for all using(public.owns_provider(provider_id) or public.is_admin()) with check(public.owns_provider(provider_id) or public.is_admin());
create policy "public reads provider media" on public.provider_media for select using(exists(select 1 from public.provider_profiles p where p.id=provider_id and p.status='active'));
create policy "members manage business media" on public.business_media for all using(public.is_business_member(business_id) or public.is_admin()) with check(public.is_business_member(business_id) or public.is_admin());
create policy "public reads business media" on public.business_media for select using(exists(select 1 from public.businesses b where b.id=business_id and b.status='active'));
create policy "provider manages categories" on public.provider_categories for all using(public.owns_provider(provider_id) or public.is_admin()) with check(public.owns_provider(provider_id) or public.is_admin());
create policy "provider manages areas" on public.provider_service_areas for all using(public.owns_provider(provider_id) or public.is_admin()) with check(public.owns_provider(provider_id) or public.is_admin());
create policy "business manages areas" on public.business_service_areas for all using(public.is_business_member(business_id) or public.is_admin()) with check(public.is_business_member(business_id) or public.is_admin());
create policy "participants read affiliations" on public.provider_business_affiliations for select using(status='active' or public.owns_provider(provider_id) or public.is_business_member(business_id) or public.is_admin());
create policy "participants create affiliations" on public.provider_business_affiliations for insert with check(public.owns_provider(provider_id) or public.is_business_member(business_id) or public.is_admin());
create policy "participants update affiliations" on public.provider_business_affiliations for update using(public.owns_provider(provider_id) or public.is_business_member(business_id) or public.is_admin());

-- Replace permissive Storage rules with ownership-aware paths.
drop policy if exists "business members upload media" on storage.objects;
create policy "business members upload media" on storage.objects for insert to authenticated with check(bucket_id='business-media' and exists(select 1 from public.business_members bm where bm.business_id::text=(storage.foldername(name))[1] and bm.profile_id=auth.uid()));
create policy "owners update public media" on storage.objects for update to authenticated using(
  (bucket_id in ('avatars','provider-work') and (storage.foldername(name))[1]=auth.uid()::text)
  or (bucket_id='business-media' and exists(select 1 from public.business_members bm where bm.business_id::text=(storage.foldername(name))[1] and bm.profile_id=auth.uid()))
);
create policy "owners delete public media" on storage.objects for delete to authenticated using(
  (bucket_id in ('avatars','provider-work') and (storage.foldername(name))[1]=auth.uid()::text)
  or (bucket_id='business-media' and exists(select 1 from public.business_members bm where bm.business_id::text=(storage.foldername(name))[1] and bm.profile_id=auth.uid()))
);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('upload-quarantine','upload-quarantine',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

revoke all on public.rate_limits from anon,authenticated;
revoke all on public.admin_audit_logs from anon,authenticated;
grant execute on function public.complete_provider_onboarding(text,text,text,text,text,text) to authenticated;
grant execute on function public.complete_business_onboarding(text,text,text,text,text,text) to authenticated;
revoke all on function public.consume_rate_limit(text,text,int,int) from public,anon,authenticated;
