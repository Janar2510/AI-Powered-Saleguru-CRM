create table if not exists emails (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  subject text,
  body text,
  direction text check (direction in ('outbound','inbound')) default 'outbound',
  status text check (status in ('draft','queued','sent','failed','received')) default 'draft',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  storage_path text not null,
  esign_status text check (esign_status in ('draft','pending','signed','void')) default 'draft',
  created_at timestamptz default now()
);

