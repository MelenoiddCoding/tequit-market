-- Paginated provider directory for administrators. Auth emails remain server-only.
create or replace function public.admin_search_providers(
  p_query text default '',
  p_limit integer default 15,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  name text,
  profession text,
  phone text,
  email text,
  status public.publication_status,
  plan public.plan_type,
  is_demo boolean,
  total_count bigint
)
language sql
stable
security definer
set search_path = public, auth
as $$
  with matching as (
    select
      provider.id,
      provider.slug,
      provider.name,
      provider.profession,
      provider.phone,
      coalesce(users.email, profile.recovery_email, '') as email,
      provider.status,
      provider.plan,
      provider.is_demo
    from public.provider_profiles as provider
    left join public.profiles as profile on profile.id = provider.owner_profile_id
    left join auth.users as users on users.id = provider.owner_profile_id
    where trim(coalesce(p_query, '')) = ''
       or public.unaccent(lower(provider.name)) like '%' || public.unaccent(lower(trim(p_query))) || '%'
       or (
         regexp_replace(trim(p_query), '\D', '', 'g') <> ''
         and regexp_replace(coalesce(provider.phone, ''), '\D', '', 'g') like '%' || regexp_replace(trim(p_query), '\D', '', 'g') || '%'
       )
       or lower(coalesce(users.email, profile.recovery_email, '')) like '%' || lower(trim(p_query)) || '%'
  )
  select matching.*, count(*) over() as total_count
  from matching
  order by matching.name asc, matching.id asc
  limit least(greatest(coalesce(p_limit, 15), 1), 50)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.admin_search_providers(text, integer, integer) from public, anon, authenticated;
grant execute on function public.admin_search_providers(text, integer, integer) to service_role;
