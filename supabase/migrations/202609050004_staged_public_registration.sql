-- A public registration now verifies the phone before collecting account data.
-- Pending rows therefore exist briefly without an auth.users record.
alter table public.pending_registrations
  alter column user_id drop not null,
  alter column name drop not null,
  alter column zone drop not null;

alter table public.pending_registrations
  add column if not exists otp_verified_at timestamptz;

comment on column public.pending_registrations.otp_verified_at is
  'Set only after the hashed WhatsApp OTP matches; an account is created later when registration is completed.';
