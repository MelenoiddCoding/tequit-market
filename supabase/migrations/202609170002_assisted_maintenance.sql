-- Admin may maintain a profile after it is claimed, without issuing new claims.
create function public.admin_manage_provider(p_actor uuid,p_provider uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_owner uuid;
begin
 if not exists(select 1 from profile_roles where profile_id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED'; end if;
 select owner_profile_id into v_owner from provider_profiles where id=p_provider for update;
 if not found then raise exception 'PROVIDER_REQUIRED'; end if;
 select id into v_id from assisted_onboardings where provider_id=p_provider order by created_at limit 1;
 if v_id is null then
   insert into assisted_onboardings(kind,provider_id,status,source,created_by)
   values('provider',p_provider,case when v_owner is not null then 'claimed' else 'draft' end,'whatsapp',p_actor) returning id into v_id;
   insert into admin_audit_logs(admin_profile_id,action,entity_type,entity_id,metadata)
   values(p_actor,'assisted_maintenance_started','provider',p_provider::text,jsonb_build_object('onboarding_id',v_id));
 end if;
 return v_id;
end $$;
revoke all on function public.admin_manage_provider(uuid,uuid) from public,anon,authenticated;
grant execute on function public.admin_manage_provider(uuid,uuid) to service_role;

-- Preserve IDs and related data. Removed services are deactivated, not deleted.
create function public.admin_replace_assisted_services(p_actor uuid,p_entity uuid,p_kind text,p_services jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_table text; v_column text; v_service jsonb; v_id uuid; v_ids uuid[]:='{}'; v_result jsonb:='[]';
begin
 if not exists(select 1 from profile_roles where profile_id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED'; end if;
 if p_kind='provider' then
   perform 1 from provider_profiles where id=p_entity for update;
   v_table:='provider_services'; v_column:='provider_id';
 elsif p_kind='business' then
   perform 1 from businesses where id=p_entity for update;
   v_table:='business_services'; v_column:='business_id';
 else raise exception 'INVALID_KIND'; end if;
 if not found then raise exception 'ENTITY_REQUIRED'; end if;
 if jsonb_typeof(p_services)<>'array' or jsonb_array_length(p_services)>30 then raise exception 'INVALID_SERVICES'; end if;
 for v_service in select value from jsonb_array_elements(p_services) loop
   if length(trim(v_service->>'title'))<3 then raise exception 'INVALID_SERVICE'; end if;
   if v_service->>'id' is not null then
     v_id:=(v_service->>'id')::uuid;
     if v_id=any(v_ids) then raise exception 'DUPLICATE_SERVICE'; end if;
     execute format('select id from %I where id=$1 and %I=$2',v_table,v_column) into v_id using v_id,p_entity;
     if v_id is null then raise exception 'SERVICE_NOT_OWNED'; end if;
     v_ids:=array_append(v_ids,v_id);
   end if;
 end loop;
 execute format('update %I set active=false where %I=$1 and not(id=any($2))',v_table,v_column) using p_entity,v_ids;
 for v_service in select value from jsonb_array_elements(p_services) loop
   if v_service->>'id' is not null then
     v_id:=(v_service->>'id')::uuid;
     execute format('update %I set title=$1,description=$2,active=true where id=$3 and %I=$4',v_table,v_column)
       using v_service->>'title',v_service->>'description',v_id,p_entity;
   else
     execute format('insert into %I(%I,title,description,canonical_service_id,active) values($1,$2,$3,$4,true) returning id',v_table,v_column)
       into v_id using p_entity,v_service->>'title',v_service->>'description',case when p_kind='business' then (v_service->>'canonicalId')::uuid else null end;
   end if;
   v_result:=v_result||jsonb_build_array(v_service||jsonb_build_object('id',v_id));
 end loop;
 return v_result;
end $$;
revoke all on function public.admin_replace_assisted_services(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.admin_replace_assisted_services(uuid,uuid,text,jsonb) to service_role;

create function public.admin_maintain_portfolio(p_actor uuid,p_provider uuid,p_media uuid,p_action text,p_title text,p_description text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from profile_roles where profile_id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED'; end if;
 perform 1 from provider_media where id=p_media and provider_id=p_provider and media_role='portfolio' for update;
 if not found then raise exception 'MEDIA_NOT_OWNED'; end if;
 if p_action='delete' then
   delete from provider_media where id=p_media and provider_id=p_provider;
 elsif p_action='update' and length(trim(p_title)) between 3 and 120 and length(p_description)<=500 then
   update provider_media set title=p_title,description=p_description where id=p_media and provider_id=p_provider;
 else raise exception 'INVALID_ACTION'; end if;
 insert into admin_audit_logs(admin_profile_id,action,entity_type,entity_id,metadata)
 values(p_actor,'portfolio_'||p_action,'provider',p_provider::text,jsonb_build_object('media_id',p_media));
end $$;
revoke all on function public.admin_maintain_portfolio(uuid,uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.admin_maintain_portfolio(uuid,uuid,uuid,text,text,text) to service_role;

-- All fields of the assisted form are committed together, including services.
create function public.admin_save_assisted_content(p_actor uuid,p_onboarding uuid,p_content jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.assisted_onboardings%rowtype; v_entity uuid; v_category text; v_services jsonb;
 v_area text; v_area_id uuid; v_item jsonb; v_table text; v_column text; v_primary uuid; v_secondary uuid[];
begin
 if not exists(select 1 from profile_roles where profile_id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED'; end if;
 select * into o from assisted_onboardings where id=p_onboarding for update;
 if not found then raise exception 'ONBOARDING_REQUIRED'; end if;
 v_entity:=coalesce(o.provider_id,o.business_id);
 if o.kind='provider' then
   perform 1 from provider_profiles where id=v_entity for update;
   v_primary:=(p_content->>'primaryCategoryId')::uuid;
   select name into v_category from canonical_provider_categories where id=v_primary and active;
   if v_category is null then raise exception 'CATEGORY_REQUIRED'; end if;
   select coalesce(array_agg(value::uuid),'{}') into v_secondary from jsonb_array_elements_text(p_content->'secondaryCategoryIds');
   if cardinality(v_secondary)>2 or v_primary=any(v_secondary)
     or (select count(distinct id) from canonical_provider_categories where id=any(v_secondary) and active)<>cardinality(v_secondary) then raise exception 'INVALID_CATEGORIES'; end if;
   update provider_profiles set name=p_content->>'name',profession=v_category,phone=p_content->>'phone',zone=p_content->>'zone',bio=p_content->>'bio' where id=v_entity;
   insert into provider_site_settings(provider_id,headline,intro,years_experience)
     values(v_entity,coalesce(nullif(p_content->>'headline',''),v_category||' en '||(p_content->>'zone')),p_content->>'bio',(p_content->>'yearsExperience')::integer)
     on conflict(provider_id) do update set headline=excluded.headline,intro=excluded.intro,years_experience=excluded.years_experience;
   delete from provider_categories where provider_id=v_entity;
   insert into provider_categories(provider_id,canonical_category_id,assignment_role) values(v_entity,v_primary,'primary');
   insert into provider_categories(provider_id,canonical_category_id,assignment_role) select v_entity,id,'secondary' from unnest(v_secondary) id;
 else
   perform 1 from businesses where id=v_entity for update;
   update businesses set name=p_content->>'name',phone=p_content->>'phone',zone=p_content->>'zone',address=nullif(p_content->>'address',''),description=p_content->>'bio',
     category_id=(select id from service_categories where lower(name)=lower(p_content->>'profession') limit 1) where id=v_entity;
 end if;
 v_services:=admin_replace_assisted_services(p_actor,v_entity,o.kind,p_content->'services');
 v_table:=case when o.kind='provider' then 'provider_service_areas' else 'business_service_areas' end;
 v_column:=case when o.kind='provider' then 'provider_id' else 'business_id' end;
 execute format('delete from %I where %I=$1',v_table,v_column) using v_entity;
 for v_area in select distinct value from jsonb_array_elements_text(p_content->'areas') loop
   insert into service_areas(name,city,state) values(v_area,'Tepic','Nayarit') on conflict(name) do update set name=excluded.name returning id into v_area_id;
   execute format('insert into %I(%I,area_id) values($1,$2)',v_table,v_column) using v_entity,v_area_id;
 end loop;
 v_table:=case when o.kind='provider' then 'provider_verifications' else 'business_verifications' end;
 -- Keep verification dates when only descriptive content changes.
 execute format('delete from %I where %I=$1 and type::text not in (select value->>''type'' from jsonb_array_elements($2))',v_table,v_column) using v_entity,p_content->'verifications';
 for v_item in select value from jsonb_array_elements(p_content->'verifications') loop
   execute format('insert into %I(%I,type,note) select $2,(jsonb_populate_record(null::%I,$1)).type,$3 on conflict(%I,type) do update set note=excluded.note',v_table,v_column,v_table,v_column)
     using v_item,v_entity,v_item->>'note';
 end loop;
 update assisted_onboardings set source=p_content->>'source',consent_confirmed=(p_content->>'consentConfirmed')::boolean,
   consent_at=case when (p_content->>'consentConfirmed')::boolean then coalesce(consent_at,now()) else null end,
   consent_note=p_content->>'consentNote',duplicate_reviewed=(p_content->>'duplicateReviewed')::boolean,duplicate_note=p_content->>'duplicateNote',
   status=case when o.status in ('claimed','published') then o.status else 'ready' end where id=o.id;
 insert into admin_audit_logs(admin_profile_id,action,entity_type,entity_id,metadata)
   values(p_actor,'assisted_content_updated',o.kind,v_entity::text,jsonb_build_object('onboarding_id',o.id));
 return v_services;
end $$;
revoke all on function public.admin_save_assisted_content(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.admin_save_assisted_content(uuid,uuid,jsonb) to service_role;
