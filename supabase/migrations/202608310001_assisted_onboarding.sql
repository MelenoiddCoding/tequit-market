-- Assisted onboarding: Tequit-managed drafts that owners can claim later.

alter table public.provider_profiles alter column owner_profile_id drop not null;

create table public.assisted_onboardings (
  id uuid primary key default gen_random_uuid(),
  kind text not null check(kind in ('provider','business')),
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  status text not null default 'draft' check(status in ('draft','ready','published','claimed')),
  source text not null check(source in ('whatsapp','call','in_person')),
  consent_confirmed boolean not null default false,
  consent_at timestamptz,
  consent_note text not null default '',
  duplicate_reviewed boolean not null default false,
  duplicate_note text not null default '',
  created_by uuid not null references public.profiles(id),
  published_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((provider_id is not null)::int + (business_id is not null)::int = 1),
  check ((kind='provider' and provider_id is not null) or (kind='business' and business_id is not null)),
  check (not consent_confirmed or consent_at is not null)
);

create table public.managed_profile_claims (
  id uuid primary key default gen_random_uuid(),
  onboarding_id uuid not null references public.assisted_onboardings(id) on delete cascade,
  token_hash text not null unique,
  phone_last4 text not null check(phone_last4 ~ '^[0-9]{4}$'),
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  claimed_by uuid references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index assisted_onboardings_status_idx on public.assisted_onboardings(status,created_at desc);
create index assisted_onboardings_provider_idx on public.assisted_onboardings(provider_id);
create index assisted_onboardings_business_idx on public.assisted_onboardings(business_id);
create index managed_claims_onboarding_idx on public.managed_profile_claims(onboarding_id,created_at desc);

alter table public.assisted_onboardings enable row level security;
alter table public.managed_profile_claims enable row level security;
create policy "admin manages assisted onboardings" on public.assisted_onboardings for all using(public.is_admin()) with check(public.is_admin());
create policy "admin manages profile claims" on public.managed_profile_claims for all using(public.is_admin()) with check(public.is_admin());

create trigger assisted_onboardings_touch_updated_at before update on public.assisted_onboardings
for each row execute function public.touch_updated_at();

create or replace function public.claim_managed_entity(p_token text,p_phone_last4 text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare claim_row public.managed_profile_claims%rowtype; onboarding_row public.assisted_onboardings%rowtype; entity_slug text; entity_name text;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select * into claim_row from public.managed_profile_claims
  where token_hash=encode(digest(p_token,'sha256'),'hex') for update;
  if not found or claim_row.revoked_at is not null or claim_row.used_at is not null then raise exception 'invalid claim'; end if;
  if claim_row.expires_at<now() then raise exception 'expired claim'; end if;
  if claim_row.phone_last4<>regexp_replace(p_phone_last4,'\D','','g') then raise exception 'phone mismatch'; end if;
  select * into onboarding_row from public.assisted_onboardings where id=claim_row.onboarding_id for update;
  if onboarding_row.status not in ('published','ready') then raise exception 'entity unavailable'; end if;
  if onboarding_row.kind='provider' then
    if exists(select 1 from public.provider_profiles where id=onboarding_row.provider_id and owner_profile_id is not null) then raise exception 'already claimed'; end if;
    if exists(select 1 from public.provider_profiles where owner_profile_id=auth.uid()) then raise exception 'account already owns provider'; end if;
    update public.provider_profiles set owner_profile_id=auth.uid() where id=onboarding_row.provider_id returning slug,name into entity_slug,entity_name;
    insert into public.profile_roles(profile_id,role) values(auth.uid(),'provider') on conflict do nothing;
  else
    if exists(select 1 from public.business_members where business_id=onboarding_row.business_id and member_role='owner') then raise exception 'already claimed'; end if;
    insert into public.business_members(business_id,profile_id,member_role) values(onboarding_row.business_id,auth.uid(),'owner');
    insert into public.profile_roles(profile_id,role) values(auth.uid(),'business_owner') on conflict do nothing;
    select slug,name into entity_slug,entity_name from public.businesses where id=onboarding_row.business_id;
  end if;
  update public.managed_profile_claims set used_at=now(),claimed_by=auth.uid() where id=claim_row.id;
  update public.assisted_onboardings set status='claimed',claimed_at=now() where id=onboarding_row.id;
  insert into public.admin_audit_logs(action,entity_type,entity_id,metadata)
  values('assisted_claimed',onboarding_row.kind,coalesce(onboarding_row.provider_id,onboarding_row.business_id)::text,jsonb_build_object('claimed_by',auth.uid()));
  return jsonb_build_object('kind',onboarding_row.kind,'slug',entity_slug,'name',entity_name);
end $$;

grant execute on function public.claim_managed_entity(text,text) to authenticated;
revoke execute on function public.claim_managed_entity(text,text) from anon;

-- Claimed owners may manage legacy assisted media stored below an entity UUID.
drop policy if exists "owners update public media" on storage.objects;
create policy "owners update public media" on storage.objects for update to authenticated using(
  (bucket_id in ('avatars','provider-work') and (
    (storage.foldername(name))[1]=auth.uid()::text or
    ((storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' and public.owns_provider(((storage.foldername(name))[1])::uuid))
  )) or
  (bucket_id='business-media' and exists(select 1 from public.business_members bm where bm.business_id::text=(storage.foldername(name))[1] and bm.profile_id=auth.uid()))
);
drop policy if exists "owners delete public media" on storage.objects;
create policy "owners delete public media" on storage.objects for delete to authenticated using(
  (bucket_id in ('avatars','provider-work') and (
    (storage.foldername(name))[1]=auth.uid()::text or
    ((storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' and public.owns_provider(((storage.foldername(name))[1])::uuid))
  )) or
  (bucket_id='business-media' and exists(select 1 from public.business_members bm where bm.business_id::text=(storage.foldername(name))[1] and bm.profile_id=auth.uid()))
);
