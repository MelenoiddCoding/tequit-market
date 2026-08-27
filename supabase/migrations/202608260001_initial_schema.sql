create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;

create type public.app_role as enum ('provider','business_owner','admin');
create type public.publication_status as enum ('draft','active','suspended');
create type public.plan_type as enum ('free','pro');
create type public.lead_status as enum ('nueva','vista','interesado','no_me_interesa','contactado','cerrada');
create type public.review_status as enum ('pending','approved','rejected');
create type public.verification_type as enum ('phone','identity','references','visited_by_tequit');
create type public.affiliation_status as enum ('pending','active','rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(), primary key(profile_id,role)
);
create table public.service_categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  description text, sort_order int not null default 0, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.canonical_services (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references public.service_categories(id),
  name text not null, slug text not null unique, description text, active boolean not null default true,
  search_document tsvector generated always as (to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(description,''))) stored,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.service_aliases (
  id uuid primary key default gen_random_uuid(), canonical_service_id uuid not null references public.canonical_services(id) on delete cascade,
  alias text not null, normalized_alias text not null, created_at timestamptz not null default now(), unique(canonical_service_id,normalized_alias)
);
create table public.provider_profiles (
  id uuid primary key default gen_random_uuid(), owner_profile_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique, name text not null, profession text not null, bio text not null default '', phone text not null,
  zone text not null default 'Tepic, Nayarit', plan plan_type not null default 'free', status publication_status not null default 'draft',
  avatar_path text, rating numeric(2,1) not null default 0 check(rating between 0 and 5), review_count int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.businesses (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, category_id uuid references public.service_categories(id),
  description text not null default '', phone text not null, zone text not null default 'Tepic, Nayarit', address text,
  logo_path text, cover_path text, status publication_status not null default 'draft', rating numeric(2,1) not null default 0 check(rating between 0 and 5), review_count int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.business_members (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade, member_role text not null default 'owner',
  created_at timestamptz not null default now(), unique(business_id,profile_id)
);
create table public.provider_categories (
  provider_id uuid not null references public.provider_profiles(id) on delete cascade, category_id uuid not null references public.service_categories(id),
  created_at timestamptz not null default now(), primary key(provider_id,category_id)
);
create table public.provider_services (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  canonical_service_id uuid references public.canonical_services(id), title text not null, description text not null default '', active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.business_services (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
  canonical_service_id uuid references public.canonical_services(id), title text not null, description text not null default '', active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.business_products (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null, description text not null default '', image_path text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.provider_business_affiliations (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade, status affiliation_status not null default 'pending',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(provider_id,business_id)
);
create table public.service_areas (
  id uuid primary key default gen_random_uuid(), name text not null unique, city text not null default 'Tepic', state text not null default 'Nayarit', created_at timestamptz not null default now()
);
create table public.provider_service_areas (provider_id uuid references public.provider_profiles(id) on delete cascade, area_id uuid references public.service_areas(id), primary key(provider_id,area_id));
create table public.business_service_areas (business_id uuid references public.businesses(id) on delete cascade, area_id uuid references public.service_areas(id), primary key(business_id,area_id));
create table public.provider_media (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  storage_path text not null, title text not null, description text not null default '', media_role text not null default 'portfolio',
  sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.business_media (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
  storage_path text not null, title text, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.provider_verifications (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  type verification_type not null, verified_at timestamptz not null default now(), note text, created_at timestamptz not null default now(), unique(provider_id,type)
);
create table public.business_verifications (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
  type verification_type not null, verified_at timestamptz not null default now(), note text, created_at timestamptz not null default now(), unique(business_id,type)
);
create table public.leads (
  id uuid primary key default gen_random_uuid(), target_provider_id uuid references public.provider_profiles(id), target_business_id uuid references public.businesses(id),
  canonical_service_id uuid references public.canonical_services(id), requested_service_text text not null, description text not null,
  customer_name text not null, customer_phone text not null, customer_email text, zone text not null, desired_timing text,
  status lead_status not null default 'nueva', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint lead_target check (not (target_provider_id is not null and target_business_id is not null))
);
comment on constraint lead_target on public.leads is 'Null/null represents a general request reviewed by admin; directed requests have exactly one target.';
create table public.lead_media (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete cascade,
  storage_path text not null, content_type text not null, created_at timestamptz not null default now()
);
create table public.review_requests (
  id uuid primary key default gen_random_uuid(), lead_id uuid references public.leads(id), provider_id uuid references public.provider_profiles(id), business_id uuid references public.businesses(id),
  token_hash text not null unique, source text not null check(source in ('tequit_lead','invited_customer')), expires_at timestamptz not null,
  used_at timestamptz, created_at timestamptz not null default now(), check(provider_id is not null or business_id is not null)
);
create table public.reviews (
  id uuid primary key default gen_random_uuid(), review_request_id uuid not null unique references public.review_requests(id), lead_id uuid references public.leads(id),
  provider_id uuid references public.provider_profiles(id), business_id uuid references public.businesses(id), canonical_service_id uuid references public.canonical_services(id),
  customer_name text not null, rating int not null check(rating between 1 and 5), comment text not null, status review_status not null default 'pending',
  moderated_by uuid references public.profiles(id), moderated_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check((provider_id is not null)::int + (business_id is not null)::int = 1)
);
create table public.contact_events (
  id uuid primary key default gen_random_uuid(), event_type text not null check(event_type in ('profile_view','whatsapp_click','request_created','service_view','business_view')),
  provider_id uuid references public.provider_profiles(id), business_id uuid references public.businesses(id), service_id uuid references public.canonical_services(id),
  session_hash text, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

create index provider_services_provider_active_idx on public.provider_services(provider_id,active);
create index business_services_business_active_idx on public.business_services(business_id,active);
create index aliases_trgm_idx on public.service_aliases using gin(normalized_alias gin_trgm_ops);
create index service_search_idx on public.canonical_services using gin(search_document);
create index provider_name_trgm_idx on public.provider_profiles using gin(name gin_trgm_ops);
create index business_name_trgm_idx on public.businesses using gin(name gin_trgm_ops);
create index leads_provider_status_idx on public.leads(target_provider_id,status,created_at desc);
create index leads_business_status_idx on public.leads(target_business_id,status,created_at desc);
create index reviews_public_idx on public.reviews(status,provider_id,business_id,created_at desc);
create index events_provider_date_idx on public.contact_events(provider_id,created_at desc);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profile_roles where profile_id=auth.uid() and role='admin');
$$;
create or replace function public.owns_provider(pid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.provider_profiles where id=pid and owner_profile_id=auth.uid());
$$;
create or replace function public.is_business_member(bid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.business_members where business_id=bid and profile_id=auth.uid());
$$;
create or replace function public.enforce_free_service_limit() returns trigger language plpgsql security definer set search_path=public as $$
declare provider_plan plan_type; active_count int;
begin
  if new.active is not true then return new; end if;
  select plan into provider_plan from public.provider_profiles where id=new.provider_id for update;
  if provider_plan='free' then
    select count(*) into active_count from public.provider_services where provider_id=new.provider_id and active and id<>new.id;
    if active_count>=5 then raise exception 'Free providers can publish at most 5 active services' using errcode='check_violation'; end if;
  end if;
  return new;
end $$;
create trigger provider_free_limit before insert or update of active,provider_id on public.provider_services for each row execute function public.enforce_free_service_limit();

alter table public.provider_profiles enable row level security; alter table public.businesses enable row level security;
alter table public.provider_services enable row level security; alter table public.business_services enable row level security; alter table public.business_products enable row level security;
alter table public.provider_media enable row level security; alter table public.business_media enable row level security;
alter table public.provider_verifications enable row level security; alter table public.business_verifications enable row level security;
alter table public.provider_business_affiliations enable row level security; alter table public.business_members enable row level security;
alter table public.leads enable row level security; alter table public.lead_media enable row level security; alter table public.reviews enable row level security;
alter table public.review_requests enable row level security; alter table public.contact_events enable row level security;

create policy "public active providers" on public.provider_profiles for select using(status='active' or public.owns_provider(id) or public.is_admin());
create policy "owner manages provider" on public.provider_profiles for all using(public.owns_provider(id) or public.is_admin()) with check(owner_profile_id=auth.uid() or public.is_admin());
create policy "public active businesses" on public.businesses for select using(status='active' or public.is_business_member(id) or public.is_admin());
create policy "members manage businesses" on public.businesses for all using(public.is_business_member(id) or public.is_admin()) with check(public.is_business_member(id) or public.is_admin());
create policy "public provider services" on public.provider_services for select using(active and exists(select 1 from public.provider_profiles p where p.id=provider_id and p.status='active'));
create policy "owner provider services" on public.provider_services for all using(public.owns_provider(provider_id) or public.is_admin()) with check(public.owns_provider(provider_id) or public.is_admin());
create policy "public business services" on public.business_services for select using(active and exists(select 1 from public.businesses b where b.id=business_id and b.status='active'));
create policy "members business services" on public.business_services for all using(public.is_business_member(business_id) or public.is_admin()) with check(public.is_business_member(business_id) or public.is_admin());
create policy "public business products" on public.business_products for select using(active and exists(select 1 from public.businesses b where b.id=business_id and b.status='active'));
create policy "members business products" on public.business_products for all using(public.is_business_member(business_id) or public.is_admin()) with check(public.is_business_member(business_id) or public.is_admin());
create policy "public provider verification" on public.provider_verifications for select using(true);
create policy "public business verification" on public.business_verifications for select using(true);
create policy "approved reviews public" on public.reviews for select using(status='approved' or public.is_admin() or public.owns_provider(provider_id) or public.is_business_member(business_id));
create policy "admin moderates reviews" on public.reviews for update using(public.is_admin()) with check(public.is_admin());
create policy "owners read directed leads" on public.leads for select using(public.is_admin() or public.owns_provider(target_provider_id) or public.is_business_member(target_business_id));
create policy "owners update directed leads" on public.leads for update using(public.is_admin() or public.owns_provider(target_provider_id) or public.is_business_member(target_business_id));
create policy "owners read lead media" on public.lead_media for select using(public.is_admin() or exists(select 1 from public.leads l where l.id=lead_id and (public.owns_provider(l.target_provider_id) or public.is_business_member(l.target_business_id))));
create policy "owner reads events" on public.contact_events for select using(public.is_admin() or public.owns_provider(provider_id) or public.is_business_member(business_id));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),
('business-media','business-media',true,8388608,array['image/jpeg','image/png','image/webp']),
('provider-work','provider-work',true,8388608,array['image/jpeg','image/png','image/webp']),
('lead-media','lead-media',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "public media readable" on storage.objects for select using(bucket_id in ('avatars','business-media','provider-work'));
create policy "owners upload provider media" on storage.objects for insert to authenticated with check(bucket_id in ('avatars','provider-work') and (storage.foldername(name))[1]=auth.uid()::text);
create policy "business members upload media" on storage.objects for insert to authenticated with check(bucket_id='business-media');
