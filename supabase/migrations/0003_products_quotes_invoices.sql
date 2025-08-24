create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  sku text,
  price_cents bigint not null default 0,
  currency text default 'EUR',
  created_at timestamptz default now()
);

create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete set null,
  total_cents bigint not null default 0,
  currency text default 'EUR',
  status text check (status in ('draft','sent','accepted','rejected')) default 'draft',
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  quote_id uuid references quotes(id) on delete set null,
  total_cents bigint not null default 0,
  currency text default 'EUR',
  status text check (status in ('draft','sent','paid','overdue','void')) default 'draft',
  due_at timestamptz,
  created_at timestamptz default now()
);

