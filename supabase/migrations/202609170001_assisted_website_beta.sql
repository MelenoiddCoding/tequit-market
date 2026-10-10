-- Existing websites keep their composition. New templates are assigned by admin only.
alter table public.provider_site_settings add column template_id text not null default 'legacy'
  check(template_id in ('legacy','tecnico','oficio','hogar'));

-- RLS still permits content maintenance and self-onboarding. This invoker trigger
-- also protects direct PostgREST writes, including INSERT and DELETE bypasses.
create function public.protect_website_design() returns trigger language plpgsql set search_path=public as $$
begin
 if current_user in ('anon','authenticated') and not public.is_admin() then
   if TG_OP='DELETE' then raise exception 'ADMIN_REQUIRED'; end if;
   if TG_OP='INSERT' then
     if new.template_id<>'legacy' or new.theme<>'tequit' or new.accent_color<>'#254432' or new.white_label then
       raise exception 'ADMIN_REQUIRED';
     end if;
   elsif row(new.template_id,new.theme,new.accent_color,new.white_label,new.provider_id)
      is distinct from row(old.template_id,old.theme,old.accent_color,old.white_label,old.provider_id) then
     raise exception 'ADMIN_REQUIRED';
   end if;
 end if;
 if TG_OP='DELETE' then return old; end if;
 return new;
end $$;
create trigger protect_website_design before insert or update or delete on public.provider_site_settings
 for each row execute function public.protect_website_design();

-- FAQ writes use the validated, atomic server API; clients retain read access.
revoke insert,update,delete on public.provider_faqs from anon,authenticated;

create or replace function public.save_provider_website_content(p_actor uuid,p_provider uuid,p_admin boolean,p_content jsonb,p_branding boolean)
returns void language plpgsql security definer set search_path=public as $$
declare v_service jsonb;
begin
 if p_admin then
   if not exists(select 1 from public.profile_roles where profile_id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED'; end if;
 else
   if not exists(select 1 from public.provider_profiles where id=p_provider and owner_profile_id=p_actor) then raise exception 'OWNER_REQUIRED'; end if;
 end if;
 perform 1 from public.provider_profiles where id=p_provider for update;
 if coalesce(case when p_admin then p_content->>'templateId' end,
   (select template_id from public.provider_site_settings where provider_id=p_provider),'legacy') <> 'legacy'
   and jsonb_array_length(p_content->'faqs') > 3 then raise exception 'FAQ_LIMIT'; end if;
 insert into public.provider_site_settings(provider_id,headline,intro,years_experience,cover_path,social_links)
 values(p_provider,p_content->>'headline',p_content->>'intro',(p_content->>'yearsExperience')::integer,p_content->>'coverPath',p_content->'socialLinks')
 on conflict(provider_id) do update set headline=excluded.headline,intro=excluded.intro,years_experience=excluded.years_experience,cover_path=excluded.cover_path,social_links=excluded.social_links;
 if p_admin and p_branding then
   update public.provider_site_settings set template_id=coalesce(p_content->>'templateId',template_id),theme=p_content->>'theme',accent_color=p_content->>'accentColor',white_label=(p_content->>'whiteLabel')::boolean where provider_id=p_provider;
 end if;
 update public.provider_profiles set bio=p_content->>'intro',avatar_path=p_content->>'avatarPath' where id=p_provider;
 for v_service in select value from jsonb_array_elements(p_content->'services') loop
   update public.provider_services set description=v_service->>'description' where id=(v_service->>'id')::uuid and provider_id=p_provider;
   if not found then raise exception 'SERVICE_NOT_OWNED'; end if;
 end loop;
 delete from public.provider_faqs where provider_id=p_provider;
 insert into public.provider_faqs(provider_id,question,answer,sort_order,active)
 select p_provider,value->>'question',value->>'answer',(ordinality-1)::integer,true from jsonb_array_elements(p_content->'faqs') with ordinality;
 if p_admin then insert into public.admin_audit_logs(admin_profile_id,action,entity_type,entity_id,metadata)
 values(p_actor,'website_content','provider',p_provider::text,'{"assisted":true}'); end if;
end $$;
revoke all on function public.save_provider_website_content(uuid,uuid,boolean,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.save_provider_website_content(uuid,uuid,boolean,jsonb,boolean) to service_role;

-- A presentation edited from Mi perfil must not leave a stale website intro.
create function public.sync_provider_website_intro() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 update provider_site_settings set intro=coalesce(new.bio,'')
 where provider_id=new.id and intro is distinct from coalesce(new.bio,'');
 return new;
end $$;
create trigger sync_provider_website_intro after update of bio on public.provider_profiles
 for each row when(old.bio is distinct from new.bio) execute function public.sync_provider_website_intro();

-- Beta terms apply only to future orders and future welcome grants.
alter table public.website_orders alter column offer_version set default 'website-beta-699-v1';
update public.welcome_offer_settings set enabled=true,plan_code='pro',duration_months=3 where id=true;
