-- Registration data waits server-side until Supabase confirms ownership of the phone.
create table public.pending_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  phone_e164 text not null unique check(phone_e164 ~ '^\+[1-9][0-9]{9,14}$'),
  account_type text not null check(account_type in ('customer','provider','business')),
  name text not null,
  profession text not null default '',
  recovery_email text,
  zone text not null,
  bio text not null default '',
  first_service text not null default '',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now()+interval '15 minutes'
);

create index pending_registrations_expiry_idx on public.pending_registrations(expires_at);
alter table public.pending_registrations enable row level security;
revoke all on table public.pending_registrations from public,anon,authenticated;
grant all on table public.pending_registrations to service_role;

comment on table public.pending_registrations is 'Server-only registration payload deleted after a successful Supabase phone OTP.';
