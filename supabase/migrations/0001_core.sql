-- Idempotent core entities
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key,
  org_id uuid references organizations(id) on delete set null,
  email text unique not null,
  first_name text,
  last_name text,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  domain text,
  created_at timestamptz default now()
);

create table if not exists contacts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists pipeline_stages (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  color text default '#6E56CF',
  probability int check (probability between 0 and 100) default 0,
  position int not null default 0
);

create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  value_cents bigint default 0,
  currency text default 'EUR',
  stage_id uuid references pipeline_stages(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  status text default 'open' check (status in ('open','won','lost')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,
  type text not null check (type in ('call','email','meeting','task','note')),
  due_at timestamptz,
  completed_at timestamptz,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- basic indexes
create index if not exists deals_org_stage_idx on deals(org_id, stage_id, status);
create index if not exists activities_org_due_idx on activities(org_id, due_at);

-- RLS enablement (example)
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table companies enable row level security;
alter table contacts enable row level security;
alter table pipeline_stages enable row level security;
alter table deals enable row level security;
alter table activities enable row level security;

-- Replace auth.uid() mapping as needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'org_isolation' AND tablename = 'companies') THEN
    CREATE POLICY org_isolation ON companies
      FOR SELECT USING (org_id in (select org_id from profiles where id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'org_isolation_contacts' AND tablename = 'contacts') THEN
    CREATE POLICY org_isolation_contacts ON contacts
      FOR SELECT USING (org_id in (select org_id from profiles where id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'org_isolation_deals' AND tablename = 'deals') THEN
    CREATE POLICY org_isolation_deals ON deals
      FOR SELECT USING (org_id in (select org_id from profiles where id = auth.uid()));
  END IF;
END $$;

-- View for board
create or replace view deal_with_refs_v as
select d.*, c.first_name, c.last_name, co.name as company_name, ps.name as stage_name, ps.position as stage_position
from deals d
left join contacts c on c.id = d.contact_id
left join companies co on co.id = d.company_id
left join pipeline_stages ps on ps.id = d.stage_id;

