-- Restore portfolio items retained during a previous downgrade when capacity returns.

create or replace function public.reconcile_provider_plan(p_provider uuid) returns text
language plpgsql security definer set search_path=public as $$
declare
  effective text;
  service_limit integer;
  media_limit integer;
  active_media integer;
  restore_slots integer;
begin
  effective:=public.current_provider_plan(p_provider);
  update public.provider_profiles set plan=effective where id=p_provider and plan<>effective;
  select (public.provider_entitlement(p_provider,'max_services')#>>'{}')::integer into service_limit;
  select (public.provider_entitlement(p_provider,'max_portfolio_items')#>>'{}')::integer into media_limit;

  if service_limit is not null then
    update public.provider_services s set active=false where s.id in (
      select id from public.provider_services where provider_id=p_provider and active
      order by created_at,id offset service_limit
    );
  end if;

  if media_limit is null then
    update public.provider_media set archived_at=null
    where provider_id=p_provider and media_role='portfolio' and archived_at is not null;
  else
    select count(*) into active_media from public.provider_media
    where provider_id=p_provider and media_role='portfolio' and archived_at is null;
    restore_slots:=greatest(media_limit-active_media,0);
    if restore_slots>0 then
      update public.provider_media m set archived_at=null where m.id in (
        select id from public.provider_media where provider_id=p_provider
          and media_role='portfolio' and archived_at is not null
        order by created_at,id limit restore_slots
      );
    end if;
    update public.provider_media m set archived_at=now() where m.id in (
      select id from public.provider_media where provider_id=p_provider
        and media_role='portfolio' and archived_at is null
      order by created_at,id offset media_limit
    );
  end if;

  update public.provider_plan_assignments set processed_at=now()
  where provider_id=p_provider and revoked_at is null and ends_at<=now() and processed_at is null;
  return effective;
end $$;

revoke all on function public.reconcile_provider_plan(uuid) from public,anon,authenticated;
grant execute on function public.reconcile_provider_plan(uuid) to service_role;
