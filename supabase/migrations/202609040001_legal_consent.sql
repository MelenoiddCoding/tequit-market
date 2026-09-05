create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('terms','privacy')),
  version text not null check (char_length(version) between 1 and 30),
  title text not null check (char_length(title) between 1 and 160),
  content_sha256 text not null check (content_sha256 ~ '^[0-9a-f]{64}$'),
  effective_at timestamptz not null,
  published_at timestamptz not null default now(),
  active boolean not null default false,
  unique(document_type,version)
);

create unique index legal_documents_one_active_type_idx
  on public.legal_documents(document_type) where active;

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.legal_documents(id) on delete restrict,
  accepted_at timestamptz not null default now(),
  source text not null check (source in ('registration','claim')),
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  user_agent text not null default '' check (char_length(user_agent)<=500),
  unique(user_id,document_id)
);

create index legal_acceptances_user_idx on public.legal_acceptances(user_id,accepted_at desc);

alter table public.legal_documents enable row level security;
alter table public.legal_acceptances enable row level security;

create policy "Active legal documents are public"
  on public.legal_documents for select
  to anon,authenticated
  using(active);

create policy "Users read their own legal acceptances"
  on public.legal_acceptances for select
  to authenticated
  using(auth.uid()=user_id);

revoke all on table public.legal_documents from public,anon,authenticated;
revoke all on table public.legal_acceptances from public,anon,authenticated;
grant select on table public.legal_documents to anon,authenticated;
grant select on table public.legal_acceptances to authenticated;
grant all on table public.legal_documents to service_role;
grant all on table public.legal_acceptances to service_role;

insert into public.legal_documents(document_type,version,title,content_sha256,effective_at,active) values
  ('terms','2026-09-04','Términos y Condiciones','23dd50700aa5284fe66506849cf674d779103763cd8007783763ce985753362b','2026-09-04T00:00:00-06:00',true),
  ('privacy','2026-09-04','Aviso y Política de Privacidad','1e9dfe2372e792203bd960efdfe7285a46ac3ed59006f7cd26dce49b9ff3e3aa','2026-09-04T00:00:00-06:00',true);

comment on table public.legal_documents is 'Versioned legal-document metadata tied to repository content hashes.';
comment on table public.legal_acceptances is 'Immutable server-recorded evidence of legal consent. No client mutation policy exists.';
