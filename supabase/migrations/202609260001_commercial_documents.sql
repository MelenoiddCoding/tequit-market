create table public.provider_document_settings (
  provider_id uuid primary key references public.provider_profiles(id) on delete cascade,
  trade_name text not null default '', phone text not null default '', email text not null default '',
  address text not null default '', logo_path text, default_template text not null default 'classic'
    check(default_template in ('classic','modern','compact','editorial','technical')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.provider_document_sequences (
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  document_type text not null check(document_type in ('quote','remission')),
  last_value integer not null default 0,
  primary key(provider_id,document_type)
);

create table public.commercial_documents (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  source_document_id uuid references public.commercial_documents(id) on delete set null,
  document_type text not null check(document_type in ('quote','remission')),
  status text not null default 'draft' check(status in ('draft','final')),
  folio_number integer not null, template_id text not null default 'classic'
    check(template_id in ('classic','modern','compact','editorial','technical')),
  issuer_name text not null, issuer_profession text not null default '', issuer_phone text not null default '',
  issuer_email text not null default '', issuer_address text not null default '', issuer_logo_path text,
  customer_name text not null, customer_phone text not null default '', customer_address text not null default '',
  issue_date date not null default current_date, valid_until date, notes text not null default '',
  subtotal_mxn numeric(12,2) not null default 0 check(subtotal_mxn>=0),
  discount_mxn numeric(12,2) not null default 0 check(discount_mxn>=0),
  total_mxn numeric(12,2) not null default 0 check(total_mxn>=0),
  paid_mxn numeric(12,2) not null default 0 check(paid_mxn>=0),
  payment_method text check(payment_method in ('cash','transfer','card','other')),
  payment_date date, finalized_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(provider_id,document_type,folio_number),
  check(discount_mxn<=subtotal_mxn), check(paid_mxn<=total_mxn)
);

create table public.commercial_document_items (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references public.commercial_documents(id) on delete cascade,
  description text not null check(char_length(trim(description)) between 1 and 200),
  quantity numeric(10,2) not null default 1 check(quantity>0), unit text not null default '',
  unit_price_mxn numeric(12,2) not null check(unit_price_mxn>=0), sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.assign_commercial_document_folio() returns trigger language plpgsql set search_path=public as $$
declare n integer;
begin
 insert into provider_document_sequences(provider_id,document_type,last_value) values(new.provider_id,new.document_type,1)
 on conflict(provider_id,document_type) do update set last_value=provider_document_sequences.last_value+1
 returning last_value into n;
 new.folio_number:=n; return new;
end $$;
create trigger commercial_document_folio before insert on public.commercial_documents for each row execute function public.assign_commercial_document_folio();

create or replace function public.protect_final_commercial_document() returns trigger language plpgsql as $$
begin if old.status='final' then raise exception 'FINAL_DOCUMENT_IMMUTABLE'; end if; return coalesce(new,old); end $$;
create trigger commercial_document_final_update before update on public.commercial_documents for each row execute function public.protect_final_commercial_document();

create or replace function public.protect_commercial_document_items() returns trigger language plpgsql set search_path=public as $$
declare d uuid:=coalesce(new.document_id,old.document_id);
begin if not exists(select 1 from commercial_documents where id=d and status='draft') then raise exception 'FINAL_DOCUMENT_IMMUTABLE'; end if; return coalesce(new,old); end $$;
create trigger commercial_document_items_draft before insert or update on public.commercial_document_items for each row execute function public.protect_commercial_document_items();

alter table public.provider_document_settings enable row level security;
alter table public.provider_document_sequences enable row level security;
alter table public.commercial_documents enable row level security;
alter table public.commercial_document_items enable row level security;
create policy "owners manage document settings" on public.provider_document_settings for all using(public.owns_provider(provider_id)) with check(public.owns_provider(provider_id));
create policy "owners read sequences" on public.provider_document_sequences for select using(public.owns_provider(provider_id));
create policy "owners read commercial documents" on public.commercial_documents for select using(public.owns_provider(provider_id));
create policy "owners insert commercial documents" on public.commercial_documents for insert with check(public.owns_provider(provider_id));
create policy "owners update draft documents" on public.commercial_documents for update using(public.owns_provider(provider_id) and status='draft') with check(public.owns_provider(provider_id));
create policy "owners delete draft documents" on public.commercial_documents for delete using(public.owns_provider(provider_id) and status='draft');
create policy "owners read commercial items" on public.commercial_document_items for select using(exists(select 1 from commercial_documents d where d.id=document_id and public.owns_provider(d.provider_id)));
create policy "owners insert draft items" on public.commercial_document_items for insert with check(exists(select 1 from commercial_documents d where d.id=document_id and d.status='draft' and public.owns_provider(d.provider_id)));
create policy "owners update draft items" on public.commercial_document_items for update using(exists(select 1 from commercial_documents d where d.id=document_id and d.status='draft' and public.owns_provider(d.provider_id))) with check(exists(select 1 from commercial_documents d where d.id=document_id and d.status='draft' and public.owns_provider(d.provider_id)));
create policy "owners delete draft items" on public.commercial_document_items for delete using(exists(select 1 from commercial_documents d where d.id=document_id and d.status='draft' and public.owns_provider(d.provider_id)));
grant select,insert,update,delete on public.provider_document_settings,public.commercial_documents,public.commercial_document_items to authenticated;
grant select on public.provider_document_sequences to authenticated;

update public.plan_entitlements set value='true'::jsonb,availability='active'
where plan_code in ('pro','premium') and feature_key in ('quotes','work_orders_pdf');
