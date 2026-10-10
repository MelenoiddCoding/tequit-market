-- Security invoker: existing contact_events RLS limits results to the owner/admin.
create function public.provider_traffic_summary(p_provider uuid,p_since timestamptz)
returns table(dimension text,bucket text,views bigint,whatsapp bigint,phone bigint)
language sql stable security invoker set search_path=public as $$
 with events as (
  select event_type,metadata from public.contact_events
  where provider_id=p_provider and created_at>=p_since
    and event_type in ('profile_view','website_view','whatsapp_click','phone_call_click')
 ), facets as (
  select 'source'::text dimension,coalesce(metadata->>'source','historical_unknown') bucket,event_type from events
  union all
  select 'surface',coalesce(metadata->>'surface','historical_unknown'),event_type from events
  union all
  select 'entry',coalesce(metadata->>'entrySurface','historical_unknown'),event_type from events
 )
 select dimension,bucket,count(*) filter(where event_type in ('profile_view','website_view')),
 count(*) filter(where event_type='whatsapp_click'),count(*) filter(where event_type='phone_call_click')
 from facets group by dimension,bucket order by dimension,bucket;
$$;
revoke all on function public.provider_traffic_summary(uuid,timestamptz) from public,anon;
grant execute on function public.provider_traffic_summary(uuid,timestamptz) to authenticated,service_role;
