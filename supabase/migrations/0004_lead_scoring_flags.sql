create table if not exists lead_scores (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  score int not null default 0 check (score between 0 and 100),
  rationale text,
  updated_at timestamptz default now()
);

create table if not exists feature_flags (
  org_id uuid primary key references organizations(id) on delete cascade,
  ai_guru_enabled boolean default true,
  analytics_enabled boolean default true,
  marketplace_enabled boolean default true,
  updated_at timestamptz default now()
);

