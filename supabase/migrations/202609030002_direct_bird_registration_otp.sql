alter table public.pending_registrations
  add column if not exists otp_digest text,
  add column if not exists otp_expires_at timestamptz,
  add column if not exists otp_attempts smallint not null default 0,
  add column if not exists otp_last_sent_at timestamptz;

alter table public.pending_registrations
  add constraint pending_registrations_otp_attempts_check check (otp_attempts between 0 and 10);

comment on column public.pending_registrations.otp_digest is
  'HMAC-SHA256 del OTP; el código en texto plano nunca se persiste.';
