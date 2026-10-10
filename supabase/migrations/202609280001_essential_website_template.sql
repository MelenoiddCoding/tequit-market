-- Add a fixed presentation option without changing existing sites or design permissions.
alter table public.provider_site_settings
  drop constraint provider_site_settings_template_id_check;
alter table public.provider_site_settings
  add constraint provider_site_settings_template_id_check
  check (template_id in ('legacy', 'tecnico', 'oficio', 'hogar', 'esencial'));
