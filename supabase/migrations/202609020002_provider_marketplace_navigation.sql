-- Attribution from provider sites into the Tequit marketplace.
alter table public.contact_events drop constraint if exists contact_events_event_type_check;
alter table public.contact_events add constraint contact_events_event_type_check check(event_type in (
  'profile_view','whatsapp_click','request_created','service_view','business_view',
  'qr_visit','shared_link_visit','share_action','marketplace_nav_open','marketplace_nav_click'
));
