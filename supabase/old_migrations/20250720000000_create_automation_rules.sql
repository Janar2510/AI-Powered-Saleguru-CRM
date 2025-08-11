-- Migration: Create automation_rules table for Automation Builder
create table if not exists public.automation_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  is_active boolean default true,
  trigger_type text,
  trigger_config jsonb,
  condition_type text,
  condition_config jsonb,
  action_type text,
  action_config jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_executed timestamptz
);

-- Index for fast lookup by created_at
drop index if exists idx_automation_rules_created_at;
create index idx_automation_rules_created_at on public.automation_rules(created_at desc); 