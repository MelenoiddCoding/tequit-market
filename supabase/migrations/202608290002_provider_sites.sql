-- Public provider websites, SEO content and attribution.

create table public.provider_site_settings (
  provider_id uuid primary key references public.provider_profiles(id) on delete cascade,
  headline text not null default '',
  intro text not null default '',
  years_experience smallint check(years_experience between 0 and 80),
  cover_path text,
  theme text not null default 'tequit' check(theme in ('tequit','claro','oscuro','tierra')),
  accent_color text not null default '#254432' check(accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  white_label boolean not null default false,
  social_links jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_faqs (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  question text not null check(length(question) between 8 and 160),
  answer text not null check(length(answer) between 12 and 600),
  sort_order smallint not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index provider_faqs_provider_idx on public.provider_faqs(provider_id,sort_order,id);
alter table public.provider_site_settings enable row level security;
alter table public.provider_faqs enable row level security;

create policy "public reads active provider site settings" on public.provider_site_settings for select using(
  exists(select 1 from public.provider_profiles p where p.id=provider_id and p.status='active')
  or public.owns_provider(provider_id) or public.is_admin()
);
create policy "owner manages provider site settings" on public.provider_site_settings for all using(
  public.owns_provider(provider_id) or public.is_admin()
) with check(public.owns_provider(provider_id) or public.is_admin());

create policy "public reads active provider faqs" on public.provider_faqs for select using(
  active and exists(select 1 from public.provider_profiles p where p.id=provider_id and p.status='active')
  or public.owns_provider(provider_id) or public.is_admin()
);
create policy "owner manages provider faqs" on public.provider_faqs for all using(
  public.owns_provider(provider_id) or public.is_admin()
) with check(public.owns_provider(provider_id) or public.is_admin());

create trigger provider_site_settings_touch_updated_at before update on public.provider_site_settings
for each row execute function public.touch_updated_at();
create trigger provider_faqs_touch_updated_at before update on public.provider_faqs
for each row execute function public.touch_updated_at();

alter table public.contact_events drop constraint if exists contact_events_event_type_check;
alter table public.contact_events add constraint contact_events_event_type_check check(event_type in (
  'profile_view','whatsapp_click','request_created','service_view','business_view','qr_visit','shared_link_visit','share_action'
));

insert into public.provider_site_settings(provider_id,headline,intro)
select id,profession||' en '||zone,bio from public.provider_profiles
on conflict(provider_id) do nothing;
