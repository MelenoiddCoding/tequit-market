-- Fail the rollout if the requested validation account was not migrated as expected.
do $$
declare validation_provider uuid; validation_status public.publication_status;
begin
  select id,status into validation_provider,validation_status
  from public.provider_profiles
  where right(regexp_replace(phone,'\D','','g'),10)='5649531923'
  limit 1;
  if validation_provider is null then raise exception 'validation provider 5649531923 was not found'; end if;
  if not exists(
    select 1 from public.provider_categories relation
    join public.canonical_provider_categories canonical on canonical.id=relation.canonical_category_id
    where relation.provider_id=validation_provider and relation.assignment_role='primary' and canonical.slug='electricista'
  ) then raise exception 'validation provider was not categorized as electrician'; end if;
  if not exists(
    select 1 from public.provider_services service
    where service.provider_id=validation_provider and public.normalize_search_text(service.title)='instalacion electrica de hogares'
  ) then raise exception 'validation provider free-form service was not preserved'; end if;
  if validation_status='active' and not exists(
    select 1 from public.search_provider_profiles('electricista',200) result where result.provider_id=validation_provider
  ) then raise exception 'validation provider is missing from canonical search'; end if;
end $$;

