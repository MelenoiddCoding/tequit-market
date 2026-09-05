-- Atomic administrative plan operations and explicit plan requests.

alter table public.plan_requests
  add column if not exists requested_plan text
    check (requested_plan in ('basic','pro','premium'));

update public.plan_requests
set requested_plan='pro'
where provider_id is not null and requested_plan is null;

drop policy if exists "plan requests own insert" on public.plan_requests;
create policy "plan requests own insert" on public.plan_requests for insert with check(
  profile_id=auth.uid() and (
    (provider_id is not null and public.owns_provider(provider_id)) or
    (business_id is not null and public.is_business_member(business_id))
  )
);

create or replace function public.admin_assign_provider_plan(
  p_admin uuid,
  p_provider uuid,
  p_plan text,
  p_duration_months integer default null,
  p_reason text default ''
) returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_now timestamptz:=now();
  v_ends timestamptz;
  v_assignment uuid;
  v_previous jsonb;
begin
  if not exists(select 1 from public.profile_roles where profile_id=p_admin and role='admin') then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;
  if p_plan not in ('free','basic','pro','premium') then
    raise exception 'INVALID_PLAN' using errcode='22023';
  end if;
  if p_duration_months is not null and (p_duration_months<1 or p_duration_months>24) then
    raise exception 'INVALID_DURATION' using errcode='22023';
  end if;
  if not exists(select 1 from public.provider_profiles where id=p_provider for update) then
    raise exception 'PROVIDER_NOT_FOUND' using errcode='P0002';
  end if;

  select coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb) into v_previous
  from public.provider_plan_assignments a
  where a.provider_id=p_provider and a.revoked_at is null;

  update public.provider_plan_assignments
  set revoked_at=v_now,revoked_by=p_admin
  where provider_id=p_provider and revoked_at is null;

  if p_plan<>'free' then
    v_ends:=case when p_duration_months is null then null else v_now+make_interval(months=>p_duration_months) end;
    insert into public.provider_plan_assignments(provider_id,plan_code,starts_at,ends_at,source,reason,created_by)
    values(p_provider,p_plan,v_now,v_ends,'admin',left(coalesce(p_reason,''),240),p_admin)
    returning id into v_assignment;
  end if;

  perform public.reconcile_provider_plan(p_provider);
  insert into public.admin_audit_logs(admin_profile_id,action,entity_type,entity_id,metadata)
  values(p_admin,'plan_assignment','provider',p_provider::text,jsonb_build_object(
    'previous',v_previous,'plan',p_plan,'durationMonths',p_duration_months,'endsAt',v_ends,'reason',left(coalesce(p_reason,''),240)
  ));
  return v_assignment;
end $$;

revoke all on function public.admin_assign_provider_plan(uuid,uuid,text,integer,text) from public,anon,authenticated;
grant execute on function public.admin_assign_provider_plan(uuid,uuid,text,integer,text) to service_role;

create or replace function public.admin_decide_plan_request(
  p_admin uuid,
  p_request uuid,
  p_status public.plan_request_status
) returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_request public.plan_requests%rowtype;
begin
  if not exists(select 1 from public.profile_roles where profile_id=p_admin and role='admin') then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;
  select * into v_request from public.plan_requests where id=p_request and status='pending' for update;
  if not found then raise exception 'REQUEST_NOT_PENDING' using errcode='P0002'; end if;
  if p_status='approved' and v_request.provider_id is not null then
    perform public.admin_assign_provider_plan(
      p_admin,v_request.provider_id,coalesce(v_request.requested_plan,'pro'),null,
      'Solicitud '||coalesce(v_request.requested_plan,'pro')||' aprobada'
    );
  end if;
  update public.plan_requests set status=p_status,decided_by=p_admin,decided_at=now() where id=p_request;
  insert into public.admin_audit_logs(admin_profile_id,action,entity_type,entity_id,metadata)
  values(p_admin,'plan_request','plan_request',p_request::text,jsonb_build_object('status',p_status));
end $$;

revoke all on function public.admin_decide_plan_request(uuid,uuid,public.plan_request_status) from public,anon,authenticated;
grant execute on function public.admin_decide_plan_request(uuid,uuid,public.plan_request_status) to service_role;

drop function if exists public.admin_search_providers(text,integer,integer);
create function public.admin_search_providers(p_query text default '',p_limit integer default 15,p_offset integer default 0)
returns table(id uuid,slug text,name text,profession text,phone text,email text,status public.publication_status,plan text,is_demo boolean,assignment_source text,assignment_ends_at timestamptz,total_count bigint)
language sql stable security definer set search_path=public,auth as $$
with matching as(
  select provider.id,provider.slug,provider.name,provider.profession,provider.phone,
    coalesce(users.email,profile.recovery_email,'') email,provider.status,
    public.current_provider_plan(provider.id) plan,provider.is_demo,
    assignment.source assignment_source,assignment.ends_at assignment_ends_at
  from public.provider_profiles provider
  left join public.profiles profile on profile.id=provider.owner_profile_id
  left join auth.users users on users.id=provider.owner_profile_id
  left join lateral (
    select a.source,a.ends_at from public.provider_plan_assignments a
    where a.provider_id=provider.id and a.revoked_at is null and a.starts_at<=now() and (a.ends_at is null or a.ends_at>now())
    order by a.starts_at desc limit 1
  ) assignment on true
  where trim(coalesce(p_query,''))=''
    or public.unaccent(lower(provider.name)) like '%'||public.unaccent(lower(trim(p_query)))||'%'
    or (regexp_replace(trim(p_query),'\D','','g')<>'' and regexp_replace(coalesce(provider.phone,''),'\D','','g') like '%'||regexp_replace(trim(p_query),'\D','','g')||'%')
    or lower(coalesce(users.email,profile.recovery_email,'')) like '%'||lower(trim(p_query))||'%'
)
select matching.*,count(*) over() from matching order by matching.name,matching.id
limit least(greatest(coalesce(p_limit,15),1),50) offset greatest(coalesce(p_offset,0),0);
$$;
revoke all on function public.admin_search_providers(text,integer,integer) from public,anon,authenticated;
grant execute on function public.admin_search_providers(text,integer,integer) to service_role;
