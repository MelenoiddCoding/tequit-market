-- Duplicate the 20 controlled demo providers for the Uruapan discovery market.
-- Media objects are intentionally reused: these are visibly labelled sample profiles.
insert into public.service_areas(name,slug,city,state,area_type,gps_match_radius_km,center)
values('Uruapan','uruapan','Uruapan','Michoacán','municipality',25,
  extensions.st_setsrid(extensions.st_makepoint(-102.0642,19.4204),4326)::extensions.geography)
on conflict(name) do update set slug=excluded.slug,city=excluded.city,state=excluded.state,
  area_type=excluded.area_type,gps_match_radius_km=excluded.gps_match_radius_km,
  center=excluded.center,active=true,updated_at=now();

do $$
declare
  source_provider record;
  target_provider_id uuid;
  uruapan_area_id uuid;
  demo_name text;
  item_number integer:=0;
  demo_names text[]:=array[
    'Adrián Cortés Ruiz','Beatriz Mendoza Lara','César Andrade Soto','Daniela Ríos Méndez',
    'Eduardo Valencia Paz','Fernanda Ochoa Silva','Gerardo Villaseñor Cruz','Helena Álvarez Mora',
    'Iván Barragán Torres','Julieta Zamora León','Kevin Márquez Díaz','Laura Calderón Reyes',
    'Mauricio Tapia Flores','Natalia Cárdenas Vega','Óscar Lemus Navarro','Paola Figueroa Solís',
    'Raúl Hurtado Campos','Sofía Villalobos Núñez','Tomás Escalera Gil','Valeria Prado Rosales'
  ];
begin
  if (select count(*) from public.provider_profiles
      where is_demo and slug like 'demo-%' and slug not like 'demo-uruapan-%'
        and avatar_path like 'demo/demo-%/avatar.webp')<>20 then
    raise exception 'EXPECTED_20_CONTROLLED_DEMO_PROVIDERS';
  end if;

  select id into uruapan_area_id from public.service_areas where slug='uruapan' limit 1;

  for source_provider in
    select * from public.provider_profiles
    where is_demo and slug like 'demo-%' and slug not like 'demo-uruapan-%'
      and avatar_path like 'demo/demo-%/avatar.webp'
    order by slug
  loop
    item_number:=item_number+1;
    demo_name:=demo_names[item_number];

    insert into public.provider_profiles(
      owner_profile_id,slug,name,profession,bio,phone,show_phone_call,zone,plan,status,
      avatar_path,rating,review_count,is_demo,onboarding_step
    ) values(
      null,'demo-uruapan-'||substr(source_provider.slug,6),demo_name,source_provider.profession,
      replace(source_provider.bio,'Tepic','Uruapan'),source_provider.phone,false,
      'Uruapan, Michoacán','free','active',source_provider.avatar_path,
      source_provider.rating,source_provider.review_count,true,4
    )
    on conflict(slug) do update set
      owner_profile_id=null,name=excluded.name,profession=excluded.profession,bio=excluded.bio,
      phone=excluded.phone,show_phone_call=false,zone=excluded.zone,plan='free',status='active',
      avatar_path=excluded.avatar_path,rating=excluded.rating,review_count=excluded.review_count,
      is_demo=true,onboarding_step=4,updated_at=now()
    returning id into target_provider_id;

    delete from public.provider_plan_assignments where provider_id=target_provider_id;
    delete from public.provider_categories where provider_id=target_provider_id;
    insert into public.provider_categories(provider_id,canonical_category_id,assignment_role)
    select target_provider_id,canonical_category_id,assignment_role
    from public.provider_categories where provider_id=source_provider.id;

    delete from public.provider_services where provider_id=target_provider_id;
    insert into public.provider_services(provider_id,canonical_service_id,title,description,active,brands,price_from,quote_only)
    select target_provider_id,canonical_service_id,title,description,active,brands,price_from,quote_only
    from public.provider_services where provider_id=source_provider.id;

    delete from public.provider_media where provider_id=target_provider_id;
    insert into public.provider_media(provider_id,storage_path,title,description,media_role,sort_order,archived_at)
    select target_provider_id,storage_path,title,description,media_role,sort_order,archived_at
    from public.provider_media where provider_id=source_provider.id;

    delete from public.provider_faqs where provider_id=target_provider_id;
    insert into public.provider_faqs(provider_id,question,answer,sort_order,active)
    select target_provider_id,question,answer,sort_order,active
    from public.provider_faqs where provider_id=source_provider.id;

    delete from public.provider_verifications where provider_id=target_provider_id;
    insert into public.provider_verifications(provider_id,type,verified_at,note)
    select target_provider_id,type,verified_at,'Verificación copiada para perfil de muestra'
    from public.provider_verifications where provider_id=source_provider.id;

    insert into public.provider_site_settings(
      provider_id,headline,intro,years_experience,cover_path,theme,accent_color,
      white_label,social_links,template_id,details
    )
    select target_provider_id,replace(headline,'Tepic','Uruapan'),replace(intro,'Tepic','Uruapan'),
      years_experience,cover_path,theme,accent_color,false,social_links,template_id,details
    from public.provider_site_settings where provider_id=source_provider.id
    on conflict(provider_id) do update set
      headline=excluded.headline,intro=excluded.intro,years_experience=excluded.years_experience,
      cover_path=excluded.cover_path,theme=excluded.theme,accent_color=excluded.accent_color,
      white_label=false,social_links=excluded.social_links,template_id=excluded.template_id,
      details=excluded.details,updated_at=now();

    delete from public.provider_service_areas where provider_id=target_provider_id;
    insert into public.provider_service_areas(provider_id,area_id) values(target_provider_id,uruapan_area_id);

    insert into public.provider_locations(provider_id,point,area_id,source,accuracy_m,updated_at)
    values(
      target_provider_id,
      extensions.st_setsrid(extensions.st_makepoint(
        -102.0642+(((item_number-1)%5)-2)*0.008,
        19.4204+(floor((item_number-1)/5.0)-1.5)*0.008
      ),4326)::extensions.geography,
      uruapan_area_id,'admin',null,now()
    )
    on conflict(provider_id) do update set point=excluded.point,area_id=excluded.area_id,
      source='admin',accuracy_m=null,updated_at=now();

    perform public.refresh_provider_search_document(target_provider_id);
  end loop;
end $$;
