-- Phone-first identities for beta. A login-enabled phone is not considered verified
-- until a real OTP succeeds; phone_verified_at intentionally remains null for beta users.

alter table public.profiles
  add column if not exists phone_e164 text,
  add column if not exists phone_login_enabled_at timestamptz,
  add column if not exists phone_verified_at timestamptz,
  add column if not exists phone_verification_method text,
  add column if not exists recovery_email text,
  add column if not exists recovery_email_verified_at timestamptz;

alter table public.profiles
  add constraint profiles_phone_e164_format check(phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{9,14}$'),
  add constraint profiles_phone_verification_consistent check(
    (phone_verified_at is null and phone_verification_method is null) or
    (phone_verified_at is not null and phone_verification_method in ('whatsapp_otp','sms_otp'))
  );

create unique index profiles_phone_e164_unique on public.profiles(phone_e164) where phone_e164 is not null;
create index profiles_phone_migration_idx on public.profiles(phone_login_enabled_at) where phone_login_enabled_at is null;

-- Identity and verification columns are service-controlled. Users cannot self-assert
-- a verified phone or bypass the mandatory migration through PostgREST.
revoke update on table public.profiles from authenticated;
grant update(must_change_password) on table public.profiles to authenticated;

create or replace function public.normalize_mexican_phone(value text) returns text
language plpgsql immutable set search_path=public as $$
declare digits text:=regexp_replace(coalesce(value,''),'\D','','g');
begin
  if length(digits)=10 then return '+52'||digits; end if;
  if length(digits)=12 and left(digits,2)='52' then return '+'||digits; end if;
  if length(digits)=13 and left(digits,3)='521' then return '+52'||right(digits,10); end if;
  return null;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
declare selected_role public.app_role; normalized_phone text;
begin
  selected_role := case new.raw_user_meta_data->>'role'
    when 'provider' then 'provider'::public.app_role
    when 'business_owner' then 'business_owner'::public.app_role
    else 'customer'::public.app_role
  end;
  normalized_phone:=public.normalize_mexican_phone(coalesce(new.phone,new.raw_user_meta_data->>'phone'));
  insert into public.profiles(id,display_name,phone,phone_e164,phone_login_enabled_at,recovery_email,recovery_email_verified_at)
  values(
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),nullif(new.phone,''),split_part(coalesce(new.email,''),'@',1)),
    normalized_phone,
    normalized_phone,
    case when normalized_phone is not null then now() else null end,
    new.email,
    case when new.email_confirmed_at is not null then now() else null end
  ) on conflict(id) do nothing;
  insert into public.profile_roles(profile_id,role) values(new.id,'customer') on conflict do nothing;
  if selected_role<>'customer' then insert into public.profile_roles(profile_id,role) values(new.id,selected_role) on conflict do nothing; end if;
  return new;
end $$;

create or replace function public.sync_auth_identity_to_profile() returns trigger
language plpgsql security definer set search_path=public as $$
declare normalized_phone text:=public.normalize_mexican_phone(new.phone);
begin
  update public.profiles set
    phone_e164=coalesce(normalized_phone,phone_e164),
    phone=coalesce(normalized_phone,phone),
    phone_login_enabled_at=case when normalized_phone is not null then coalesce(phone_login_enabled_at,now()) else phone_login_enabled_at end,
    recovery_email=new.email,
    recovery_email_verified_at=case when new.email_confirmed_at is not null then coalesce(recovery_email_verified_at,now()) else null end
  where id=new.id;
  return new;
end $$;

drop trigger if exists on_auth_user_identity_updated on auth.users;
create trigger on_auth_user_identity_updated after update of phone,email,email_confirmed_at on auth.users
for each row execute function public.sync_auth_identity_to_profile();

create or replace function public.mark_phone_otp_verified(p_method text) returns void
language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_method not in ('whatsapp_otp','sms_otp') then raise exception 'invalid verification method'; end if;
  update public.profiles set phone_verified_at=now(),phone_verification_method=p_method where id=auth.uid() and phone_e164 is not null;
end $$;
revoke all on function public.mark_phone_otp_verified(text) from public,anon,authenticated;

comment on column public.profiles.phone_e164 is 'Private E.164 login identifier; distinct from public provider/business WhatsApp.';
comment on column public.profiles.phone_verified_at is 'Null until a real SMS or WhatsApp OTP succeeds. Password-only beta signup does not verify ownership.';

create or replace function public.claim_managed_entity(p_token text,p_phone_last4 text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare claim_row public.managed_profile_claims%rowtype; onboarding_row public.assisted_onboardings%rowtype; entity_slug text; entity_name text; entity_phone text; account_phone text;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select * into claim_row from public.managed_profile_claims where token_hash=encode(digest(p_token,'sha256'),'hex') for update;
  if not found or claim_row.revoked_at is not null or claim_row.used_at is not null then raise exception 'invalid claim'; end if;
  if claim_row.expires_at<now() then raise exception 'expired claim'; end if;
  select * into onboarding_row from public.assisted_onboardings where id=claim_row.onboarding_id for update;
  select phone_e164 into account_phone from public.profiles where id=auth.uid();
  if onboarding_row.kind='provider' then select phone into entity_phone from public.provider_profiles where id=onboarding_row.provider_id;
  else select phone into entity_phone from public.businesses where id=onboarding_row.business_id; end if;
  if account_phone is null or public.normalize_mexican_phone(entity_phone)<>account_phone or right(regexp_replace(account_phone,'\D','','g'),4)<>regexp_replace(p_phone_last4,'\D','','g') then raise exception 'phone mismatch'; end if;
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
  insert into public.admin_audit_logs(action,entity_type,entity_id,metadata) values('assisted_claimed',onboarding_row.kind,coalesce(onboarding_row.provider_id,onboarding_row.business_id)::text,jsonb_build_object('claimed_by',auth.uid()));
  return jsonb_build_object('kind',onboarding_row.kind,'slug',entity_slug,'name',entity_name);
end $$;
