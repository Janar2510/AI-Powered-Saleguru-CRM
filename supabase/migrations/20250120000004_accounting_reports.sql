-- 0019_accounting_reports.sql - Financial Reports Views

-- Profit & Loss per period
create or replace view acc_pl_v as
select p.org_id, p.id as period_id, p.code, p.start_date, p.end_date, p.status,
       coalesce(sum(case when a.type = 'income' then (l.credit_cents - l.debit_cents) else 0 end), 0) as revenue_cents,
       coalesce(sum(case when a.type = 'expense' then (l.debit_cents - l.credit_cents) else 0 end), 0) as expense_cents,
       coalesce(sum(case when a.type = 'income' then (l.credit_cents - l.debit_cents) end), 0)
       - coalesce(sum(case when a.type = 'expense' then (l.debit_cents - l.credit_cents) end), 0) as profit_cents
from acc_periods p
left join acc_journals j on j.period_id = p.id
left join acc_journal_lines l on l.journal_id = j.id
left join acc_accounts a on a.id = l.account_id
group by p.org_id, p.id, p.code, p.start_date, p.end_date, p.status
order by p.start_date desc;

-- Balance Sheet at period end (cumulative up to period end)
create or replace view acc_balance_sheet_v as
with account_balances as (
  select j.org_id, j.jdate, l.account_id, l.debit_cents, l.credit_cents, a.type, a.code, a.name
  from acc_journals j 
  join acc_journal_lines l on l.journal_id = j.id
  join acc_accounts a on a.id = l.account_id
)
select p.org_id, p.id as period_id, p.code,
  a.id as account_id, a.code as account_code, a.name as account_name, a.type,
  coalesce(sum(case
    when a.type in ('asset', 'expense', 'contra-liability') then (ab.debit_cents - ab.credit_cents)
    else (ab.credit_cents - ab.debit_cents) 
  end), 0) as balance_cents
from acc_periods p
join acc_accounts a on a.org_id = p.org_id
left join account_balances ab on ab.org_id = p.org_id and ab.account_id = a.id and ab.jdate <= p.end_date
where a.is_postable = true
group by p.org_id, p.id, p.code, a.id, a.code, a.name, a.type
having coalesce(sum(case
  when a.type in ('asset', 'expense', 'contra-liability') then (ab.debit_cents - ab.credit_cents)
  else (ab.credit_cents - ab.debit_cents) 
end), 0) <> 0
order by a.type, a.code;

-- Detailed General Ledger view with period filtering
create or replace view acc_detailed_gl_v as
select l.org_id, 
       j.id as journal_id, 
       j.period_id,
       p.code as period_code,
       j.jdate, 
       j.source, 
       j.source_table, 
       j.source_id, 
       j.memo,
       l.id as line_id,
       l.account_id, 
       a.code as account_code,
       a.name as account_name,
       a.type as account_type,
       l.debit_cents, 
       l.credit_cents, 
       l.description,
       j.created_at
from acc_journal_lines l
join acc_journals j on j.id = l.journal_id
join acc_accounts a on a.id = l.account_id
join acc_periods p on p.id = j.period_id
order by j.jdate desc, j.created_at desc, l.id;

-- Account balances by period
create or replace view acc_account_balances_v as
with running_balances as (
  select 
    l.org_id,
    l.account_id,
    a.code as account_code,
    a.name as account_name,
    a.type as account_type,
    j.period_id,
    p.code as period_code,
    sum(l.debit_cents) as total_debit_cents,
    sum(l.credit_cents) as total_credit_cents,
    sum(case 
      when a.type in ('asset', 'expense', 'contra-liability') then (l.debit_cents - l.credit_cents)
      else (l.credit_cents - l.debit_cents)
    end) as balance_cents
  from acc_journal_lines l
  join acc_journals j on j.id = l.journal_id
  join acc_accounts a on a.id = l.account_id
  join acc_periods p on p.id = j.period_id
  group by l.org_id, l.account_id, a.code, a.name, a.type, j.period_id, p.code
)
select *
from running_balances
where balance_cents <> 0
order by account_code, period_code;

-- Aging analysis for AR/AP
create or replace view acc_aging_v as
with ar_aging as (
  select 
    j.org_id,
    'AR' as account_type,
    j.source_id,
    j.source_table,
    j.jdate,
    j.memo,
    sum(case when l.account_id = d.ar_id then l.debit_cents - l.credit_cents else 0 end) as outstanding_cents,
    current_date - j.jdate as days_outstanding,
    case 
      when current_date - j.jdate <= 30 then '0-30'
      when current_date - j.jdate <= 60 then '31-60'
      when current_date - j.jdate <= 90 then '61-90'
      else '90+'
    end as aging_bucket
  from acc_journals j
  join acc_journal_lines l on l.journal_id = j.id
  join acc_account_defaults d on d.org_id = j.org_id
  where j.source in ('AR Invoice', 'Payment')
  group by j.org_id, j.source_id, j.source_table, j.jdate, j.memo, d.ar_id
  having sum(case when l.account_id = d.ar_id then l.debit_cents - l.credit_cents else 0 end) > 0
),
ap_aging as (
  select 
    j.org_id,
    'AP' as account_type,
    j.source_id,
    j.source_table,
    j.jdate,
    j.memo,
    sum(case when l.account_id = d.ap_id then l.credit_cents - l.debit_cents else 0 end) as outstanding_cents,
    current_date - j.jdate as days_outstanding,
    case 
      when current_date - j.jdate <= 30 then '0-30'
      when current_date - j.jdate <= 60 then '31-60'
      when current_date - j.jdate <= 90 then '61-90'
      else '90+'
    end as aging_bucket
  from acc_journals j
  join acc_journal_lines l on l.journal_id = j.id
  join acc_account_defaults d on d.org_id = j.org_id
  where j.source in ('AP Bill')
  group by j.org_id, j.source_id, j.source_table, j.jdate, j.memo, d.ap_id
  having sum(case when l.account_id = d.ap_id then l.credit_cents - l.debit_cents else 0 end) > 0
)
select * from ar_aging
union all
select * from ap_aging
order by account_type, days_outstanding desc;

-- Tax reporting view (VAT summary)
create or replace view acc_vat_summary_v as
select 
  p.org_id,
  p.id as period_id,
  p.code as period_code,
  p.start_date,
  p.end_date,
  sum(case when l.account_id = d.vat_output_id then l.credit_cents else 0 end) as vat_output_cents,
  sum(case when l.account_id = d.vat_input_id then l.debit_cents else 0 end) as vat_input_cents,
  sum(case when l.account_id = d.vat_output_id then l.credit_cents else 0 end) -
  sum(case when l.account_id = d.vat_input_id then l.debit_cents else 0 end) as net_vat_payable_cents
from acc_periods p
left join acc_journals j on j.period_id = p.id
left join acc_journal_lines l on l.journal_id = j.id
left join acc_account_defaults d on d.org_id = p.org_id
group by p.org_id, p.id, p.code, p.start_date, p.end_date
order by p.start_date desc;
