-- ==============================
-- Enhanced Deal Lifecycle: Quote → Sales Order → Invoice + Linked Emails & Documents + Custom Fields + Guru AI Integration
-- ==============================

-- Helpers: slugs and year
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Org & company slugs (for portal paths)
alter table organizations add column if not exists slug text;
update organizations set slug = coalesce(slug, regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'));
create index if not exists organizations_slug_idx on organizations(slug);

alter table companies add column if not exists slug text;
update companies set slug = coalesce(slug, regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'));
create index if not exists companies_slug_idx on companies(org_id, slug);

-- Numbering sequence table (per org + type + year)
create table if not exists numbering_counters (
  org_id uuid not null references organizations(id) on delete cascade,
  kind text not null check (kind in ('deal','quote','so','invoice','document')),
  year int not null,
  last_value int not null default 0,
  primary key(org_id, kind, year)
);

create or replace function next_number(p_org uuid, p_kind text) returns text as $$
declare
  y int := extract(year from now());
  v int;
  prefix text := case p_kind when 'deal' then 'DL' when 'quote' then 'Q' when 'so' then 'SO' when 'invoice' then 'INV' when 'document' then 'DOC' else 'X' end;
begin
  insert into numbering_counters(org_id, kind, year, last_value)
  values (p_org, p_kind, y, 1)
  on conflict (org_id, kind, year)
  do update set last_value = numbering_counters.last_value + 1
  returning last_value into v;
  return prefix || '-' || y::text || '-' || lpad(v::text, 5, '0');
end; $$ language plpgsql;

-- Deals: unique number + custom fields
alter table deals add column if not exists number text unique;
alter table deals add column if not exists custom jsonb default '{}'::jsonb;

create or replace function set_deal_number() returns trigger as $$
begin
  if new.number is null then
    new.number := next_number(new.org_id, 'deal');
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_deals_number on deals;
create trigger trg_deals_number before insert on deals
for each row execute function set_deal_number();

-- Quotes
create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete set null,
  number text unique,
  status text check (status in ('draft','sent','accepted','rejected','expired')) default 'draft',
  currency text default 'EUR',
  subtotal_cents bigint default 0,
  tax_rate numeric(5,2) default 0,
  tax_cents bigint default 0,
  total_cents bigint default 0,
  valid_until date,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references quotes(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text,
  qty numeric(12,2) not null default 1,
  unit_price_cents bigint not null default 0,
  line_total_cents bigint not null default 0
);

create or replace function set_quote_number() returns trigger as $$
begin
  if new.number is null then new.number := next_number(new.org_id, 'quote'); end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_quotes_number on quotes;
create trigger trg_quotes_number before insert on quotes for each row execute function set_quote_number();

-- Sales Orders
create table if not exists sales_orders (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete set null,
  quote_id uuid references quotes(id) on delete set null,
  number text unique,
  status text check (status in ('draft','confirmed','fulfilled','cancelled')) default 'draft',
  currency text default 'EUR',
  subtotal_cents bigint default 0,
  tax_rate numeric(5,2) default 0,
  tax_cents bigint default 0,
  total_cents bigint default 0,
  created_at timestamptz default now()
);

create table if not exists sales_order_items (
  id uuid primary key default uuid_generate_v4(),
  sales_order_id uuid not null references sales_orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text,
  qty numeric(12,2) not null default 1,
  unit_price_cents bigint not null default 0,
  line_total_cents bigint not null default 0
);

create or replace function set_so_number() returns trigger as $$
begin
  if new.number is null then new.number := next_number(new.org_id, 'so'); end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_so_number on sales_orders;
create trigger trg_so_number before insert on sales_orders for each row execute function set_so_number();

-- Invoices
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete set null,
  quote_id uuid references quotes(id) on delete set null,
  sales_order_id uuid references sales_orders(id) on delete set null,
  number text unique,
  status text check (status in ('draft','sent','paid','overdue','void')) default 'draft',
  currency text default 'EUR',
  subtotal_cents bigint default 0,
  tax_rate numeric(5,2) default 0,
  tax_cents bigint default 0,
  total_cents bigint default 0,
  due_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text,
  qty numeric(12,2) not null default 1,
  unit_price_cents bigint not null default 0,
  line_total_cents bigint not null default 0
);

create or replace function set_inv_number() returns trigger as $$
begin
  if new.number is null then new.number := next_number(new.org_id, 'invoice'); end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_inv_number on invoices;
create trigger trg_inv_number before insert on invoices for each row execute function set_inv_number();

-- Link emails to deals and threads
alter table emails add column if not exists deal_id uuid references deals(id) on delete set null;
alter table emails add column if not exists thread_id text;
create index if not exists emails_org_deal_idx on emails(org_id, deal_id);

-- Documents: link to deal/contact/company + numbering + portal path
alter table documents add column if not exists deal_id uuid references deals(id) on delete set null;
alter table documents add column if not exists contact_id uuid references contacts(id) on delete set null;
alter table documents add column if not exists company_id uuid references companies(id) on delete set null;
alter table documents add column if not exists number text unique;
alter table documents add column if not exists portal_path text;

create or replace function set_document_number_and_path() returns trigger as $$
declare org_slug text; company_slug text;
begin
  if new.number is null then new.number := next_number(new.org_id, 'document'); end if;
  select slug into org_slug from organizations where id = new.org_id;
  if new.company_id is not null then select slug into company_slug from companies where id = new.company_id; end if;
  if new.portal_path is null then
    new.portal_path := '/' || coalesce(org_slug,'org') || '/' || coalesce(company_slug,'general') || '/docs/' || new.number;
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_docs_number on documents;
create trigger trg_docs_number before insert on documents for each row execute function set_document_number_and_path();

-- Customer portal table (branding + base url)
create table if not exists portals (
  org_id uuid primary key references organizations(id) on delete cascade,
  base_url text, -- e.g., https://portal.saletoru.com/acme
  branding jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- View: document + computed URL
create or replace view document_portal_url_v as
select d.*, p.base_url,
  case when p.base_url is not null then rtrim(p.base_url,'/') || d.portal_path else d.portal_path end as portal_url
from documents d
left join portals p on p.org_id = d.org_id;

-- RLS samples (adjust to your policy model)
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table sales_orders enable row level security;
alter table sales_order_items enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'quotes_org' AND tablename = 'quotes') THEN
    CREATE POLICY quotes_org ON quotes FOR ALL USING (org_id in (select org_id from profiles where id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'so_org' AND tablename = 'sales_orders') THEN
    CREATE POLICY so_org ON sales_orders FOR ALL USING (org_id in (select org_id from profiles where id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'inv_org' AND tablename = 'invoices') THEN
    CREATE POLICY inv_org ON invoices FOR ALL USING (org_id in (select org_id from profiles where id = auth.uid()));
  END IF;
END $$;

-- Convenience views
-- Note: Commented out until invoice table structure is finalized
-- create or replace view deal_commercial_v as
-- select d.id as deal_id, d.number as deal_number, d.title,
--   q.id as quote_id, q.number as quote_number, q.status as quote_status,
--   so.id as so_id, so.number as so_number, so.status as so_status,
--   i.id as invoice_id, i.number as invoice_number, i.status as invoice_status
-- from deals d
-- left join quotes q on q.deal_id = d.id
-- left join sales_orders so on so.deal_id = d.id
-- left join invoices i on i.deal_id = d.id;
