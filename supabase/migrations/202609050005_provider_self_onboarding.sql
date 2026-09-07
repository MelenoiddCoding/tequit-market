alter table public.provider_profiles add column if not exists onboarding_step smallint not null default 1;

create or replace function public.publish_provider_onboarding(p_provider_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare profile_row public.provider_profiles%rowtype; cover text; service_count int;
begin
  select * into profile_row from public.provider_profiles where id=p_provider_id and owner_profile_id=auth.uid() for update;
  if not found then raise exception 'not authorized'; end if;
  select cover_path into cover from public.provider_site_settings where provider_id=p_provider_id;
  select count(*) into service_count from public.provider_services where provider_id=p_provider_id and active=true and length(trim(coalesce(description,'')))>=10;
  if length(trim(profile_row.name))<2 or length(trim(profile_row.profession))<2 or length(regexp_replace(profile_row.phone,'\D','','g'))<10 or length(trim(profile_row.zone))<2 or length(trim(profile_row.bio))<20 or profile_row.avatar_path is null or cover is null or service_count<1 then raise exception 'incomplete provider profile'; end if;
  update public.provider_profiles set status='active',onboarding_step=4 where id=p_provider_id;
end $$;
grant execute on function public.publish_provider_onboarding(uuid) to authenticated;

create or replace function public.complete_provider_onboarding(p_name text,p_profession text,p_phone text,p_zone text,p_bio text,p_first_service text)
returns uuid language plpgsql security definer set search_path=public as $$
declare provider_uuid uuid; service_uuid uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  update public.profiles set display_name=trim(p_name),phone=trim(p_phone) where id=auth.uid();
  insert into public.profile_roles(profile_id,role) values(auth.uid(),'customer') on conflict do nothing;
  insert into public.profile_roles(profile_id,role) values(auth.uid(),'provider') on conflict do nothing;
  insert into public.provider_profiles(owner_profile_id,slug,name,profession,phone,zone,bio,status,onboarding_step)
  values(auth.uid(),public.unique_provider_slug(p_name),trim(p_name),trim(p_profession),trim(p_phone),trim(p_zone),trim(p_bio),'draft',1)
  on conflict(owner_profile_id) do update set name=excluded.name,profession=excluded.profession,phone=excluded.phone,zone=excluded.zone,bio=excluded.bio returning id into provider_uuid;
  if length(trim(p_first_service))>=2 then
    select id into service_uuid from public.canonical_services where slug=public.slugify(p_first_service) or lower(name)=lower(trim(p_first_service)) limit 1;
    if not exists(select 1 from public.provider_services where provider_id=provider_uuid and lower(title)=lower(trim(p_first_service))) then insert into public.provider_services(provider_id,canonical_service_id,title,description,active) values(provider_uuid,service_uuid,trim(p_first_service),'Describe este servicio para publicarlo.',true); end if;
  end if;
  return provider_uuid;
end $$;
