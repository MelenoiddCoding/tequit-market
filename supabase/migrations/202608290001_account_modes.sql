-- One personal account can use Tequit as a customer and optionally as a provider.

insert into public.profile_roles(profile_id,role)
select id,'customer'::public.app_role from public.profiles
on conflict do nothing;

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
  insert into public.profile_roles(profile_id,role) values(new.id,'customer') on conflict do nothing;
  if selected_role<>'customer' then
    insert into public.profile_roles(profile_id,role) values(new.id,selected_role) on conflict do nothing;
  end if;
  return new;
end $$;

create or replace function public.complete_provider_onboarding(
  p_name text,p_profession text,p_phone text,p_zone text,p_bio text,p_first_service text
) returns uuid language plpgsql security definer set search_path=public as $$
declare provider_uuid uuid; service_uuid uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if length(trim(p_name))<2 or length(regexp_replace(p_phone,'\D','','g'))<10 or length(trim(p_profession))<2 or length(trim(p_bio))<20 then raise exception 'invalid onboarding data'; end if;
  update public.profiles set display_name=trim(p_name),phone=trim(p_phone) where id=auth.uid();
  insert into public.profile_roles(profile_id,role) values(auth.uid(),'customer') on conflict do nothing;
  insert into public.profile_roles(profile_id,role) values(auth.uid(),'provider') on conflict do nothing;
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

grant execute on function public.complete_provider_onboarding(text,text,text,text,text,text) to authenticated;
