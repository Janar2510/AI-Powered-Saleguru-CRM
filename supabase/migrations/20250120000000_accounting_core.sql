-- 0015_accounting_core.sql - Core Accounting Tables

-- 0) Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1) Periods
create table if not exists acc_periods (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null,
  code text not null,
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('open','closing','closed')) default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (org_id, code)
);

-- 2) Chart of Accounts
create table if not exists acc_accounts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null,
  code text not null,
  name text not null,
  type text not null check (type in ('asset','liability','equity','income','expense','contra-asset','contra-liability')),
  is_postable boolean default true,
  parent_id uuid references acc_accounts(id) on delete set null,
  currency text default 'EUR',
  tax_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (org_id, code)
);

-- Common default accounts seed helper
create table if not exists acc_account_defaults (
  org_id uuid primary key,
  ar_id uuid, 
  ap_id uuid, 
  cash_id uuid, 
  bank_id uuid,
  sales_rev_id uuid, 
  cogs_id uuid, 
  inventory_id uuid,
  vat_output_id uuid, 
  vat_input_id uuid, 
  retained_earnings_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Journal (header) + lines
create table if not exists acc_journals (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null,
  period_id uuid references acc_periods(id) on delete restrict,
  jdate date not null default current_date,
  source text not null,
  source_table text,
  source_id uuid,
  memo text,
  posted boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists acc_journal_lines (
  id uuid primary key default uuid_generate_v4(),
  journal_id uuid not null references acc_journals(id) on delete cascade,
  org_id uuid not null,
  account_id uuid not null references acc_accounts(id) on delete restrict,
  debit_cents bigint not null default 0,
  credit_cents bigint not null default 0,
  currency text default 'EUR',
  description text,
  created_at timestamptz default now()
);

create index if not exists acc_lines_acc_idx on acc_journal_lines(account_id);
create index if not exists acc_journal_src_idx on acc_journals(source_table, source_id);
create index if not exists acc_journals_org_date_idx on acc_journals(org_id, jdate);
create index if not exists acc_lines_org_idx on acc_journal_lines(org_id);

-- 4) Posting guard
create or replace function acc_assert_balanced(p_journal_id uuid)
returns void language plpgsql as $$
declare 
  v_tot_debit bigint; 
  v_tot_credit bigint;
begin
  select coalesce(sum(debit_cents),0), coalesce(sum(credit_cents),0)
  into v_tot_debit, v_tot_credit
  from acc_journal_lines where journal_id = p_journal_id;

  if v_tot_debit <> v_tot_credit then
    raise exception 'Journal % not balanced: debit % credit %', p_journal_id, v_tot_debit, v_tot_credit;
  end if;
end $$;

-- 5) Views: General Ledger, Trial Balance
create or replace view acc_gl_v as
select l.org_id, j.id as journal_id, j.jdate, j.source, j.source_table, j.source_id, j.memo,
       l.account_id, l.debit_cents, l.credit_cents, l.description,
       a.code as account_code, a.name as account_name, a.type as account_type
from acc_journal_lines l
join acc_journals j on j.id = l.journal_id
join acc_accounts a on a.id = l.account_id;

create or replace view acc_trial_balance_v as
select a.org_id, a.id as account_id, a.code, a.name, a.type,
       coalesce(sum(l.debit_cents),0) as total_debit_cents,
       coalesce(sum(l.credit_cents),0) as total_credit_cents,
       coalesce(sum(l.debit_cents - l.credit_cents),0) as balance_cents
from acc_accounts a
left join acc_journal_lines l on l.account_id = a.id
where a.is_postable = true
group by a.org_id, a.id, a.code, a.name, a.type
order by a.code;

-- 6) RLS
alter table acc_periods enable row level security;
alter table acc_accounts enable row level security;
alter table acc_account_defaults enable row level security;
alter table acc_journals enable row level security;
alter table acc_journal_lines enable row level security;

-- RLS Policies
create policy p_acc_periods on acc_periods for all using (
  exists (select 1 from org_members om where om.user_id = auth.uid() and om.org_id = acc_periods.org_id)
);

create policy p_acc_accounts on acc_accounts for all using (
  exists (select 1 from org_members om where om.user_id = auth.uid() and om.org_id = acc_accounts.org_id)
);

create policy p_acc_defaults on acc_account_defaults for all using (
  exists (select 1 from org_members om where om.user_id = auth.uid() and om.org_id = acc_account_defaults.org_id)
);

create policy p_acc_journals on acc_journals for all using (
  exists (select 1 from org_members om where om.user_id = auth.uid() and om.org_id = acc_journals.org_id)
);

create policy p_acc_lines on acc_journal_lines for all using (
  exists (select 1 from org_members om where om.user_id = auth.uid() and om.org_id = acc_journal_lines.org_id)
);

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_acc_periods_updated_at before update on acc_periods
  for each row execute function update_updated_at_column();

create trigger update_acc_accounts_updated_at before update on acc_accounts
  for each row execute function update_updated_at_column();

create trigger update_acc_account_defaults_updated_at before update on acc_account_defaults
  for each row execute function update_updated_at_column();

create trigger update_acc_journals_updated_at before update on acc_journals
  for each row execute function update_updated_at_column();

-- Add foreign key constraints (after tables are created)
-- These will be added only if the orgs table exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'orgs') then
    -- Add org_id foreign keys
    alter table acc_periods add constraint fk_acc_periods_org_id 
      foreign key (org_id) references orgs(id) on delete cascade;
    
    alter table acc_accounts add constraint fk_acc_accounts_org_id 
      foreign key (org_id) references orgs(id) on delete cascade;
    
    alter table acc_account_defaults add constraint fk_acc_defaults_org_id 
      foreign key (org_id) references orgs(id) on delete cascade;
    
    alter table acc_journals add constraint fk_acc_journals_org_id 
      foreign key (org_id) references orgs(id) on delete cascade;
  end if;
exception
  when duplicate_object then null; -- Ignore if constraints already exist
end $$;