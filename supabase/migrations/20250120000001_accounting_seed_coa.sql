-- 0016_accounting_seed_coa.sql - Seed Chart of Accounts

-- Minimal COA with common accounts
insert into acc_accounts (org_id, code, name, type, is_postable) 
select o.id, x.code, x.name, x.type, true
from orgs o
cross join (values
 ('1000','Cash','asset'),
 ('1010','Bank','asset'),
 ('1100','Accounts Receivable','asset'),
 ('1200','Inventory','asset'),
 ('1300','Fixed Assets','asset'),
 ('1400','Accumulated Depreciation','contra-asset'),
 ('2000','Accounts Payable','liability'),
 ('2100','VAT Output (Sales Tax)','liability'),
 ('2200','VAT Input (Purchase Tax)','asset'),
 ('2300','Accrued Expenses','liability'),
 ('2400','Short-term Debt','liability'),
 ('3000','Retained Earnings','equity'),
 ('3100','Owner''s Equity','equity'),
 ('4000','Sales Revenue','income'),
 ('4100','Service Revenue','income'),
 ('4200','Other Income','income'),
 ('5000','COGS','expense'),
 ('5100','Direct Labor','expense'),
 ('6100','Rent Expense','expense'),
 ('6200','Salaries Expense','expense'),
 ('6300','Office Supplies','expense'),
 ('6400','Marketing Expense','expense'),
 ('6500','Travel Expense','expense'),
 ('6600','Professional Services','expense'),
 ('6700','Insurance','expense'),
 ('6800','Utilities','expense'),
 ('6900','Depreciation Expense','expense'),
 ('7000','Interest Expense','expense')
) as x(code,name,type)
on conflict (org_id, code) do nothing;

-- Link defaults (first-come by code)
do $$
declare r record;
begin
  for r in select id as org_id from orgs loop
    insert into acc_account_defaults(org_id,
      ar_id, ap_id, cash_id, bank_id, sales_rev_id, cogs_id, inventory_id, 
      vat_output_id, vat_input_id, retained_earnings_id)
    select r.org_id,
      (select id from acc_accounts where org_id=r.org_id and code='1100'),
      (select id from acc_accounts where org_id=r.org_id and code='2000'),
      (select id from acc_accounts where org_id=r.org_id and code='1000'),
      (select id from acc_accounts where org_id=r.org_id and code='1010'),
      (select id from acc_accounts where org_id=r.org_id and code='4000'),
      (select id from acc_accounts where org_id=r.org_id and code='5000'),
      (select id from acc_accounts where org_id=r.org_id and code='1200'),
      (select id from acc_accounts where org_id=r.org_id and code='2100'),
      (select id from acc_accounts where org_id=r.org_id and code='2200'),
      (select id from acc_accounts where org_id=r.org_id and code='3000')
    on conflict (org_id) do nothing;
  end loop;
end $$;

-- Current period helper (monthly)
insert into acc_periods (org_id, code, start_date, end_date, status)
select o.id, 
       to_char(current_date, 'YYYY-MM'), 
       date_trunc('month',current_date)::date, 
       (date_trunc('month',current_date) + interval '1 month - 1 day')::date, 
       'open'
from orgs o
on conflict (org_id, code) do nothing;

-- Create next period as well for seamless operation
insert into acc_periods (org_id, code, start_date, end_date, status)
select o.id, 
       to_char(current_date + interval '1 month', 'YYYY-MM'), 
       (date_trunc('month',current_date) + interval '1 month')::date, 
       (date_trunc('month',current_date) + interval '2 months - 1 day')::date, 
       'open'
from orgs o
on conflict (org_id, code) do nothing;
