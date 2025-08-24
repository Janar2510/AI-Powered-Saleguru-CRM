-- 0017_accounting_posting.sql - Accounting Posting Functions

-- Resolve current open period for org
create or replace function acc_current_period(p_org uuid)
returns uuid language sql stable as $$
  select id from acc_periods
  where org_id = p_org and status='open'
  order by start_date desc limit 1
$$;

-- Create balanced journal by lines JSON
-- p_lines: [{account_id, debit_cents, credit_cents, description}]
create or replace function acc_post_journal(
  p_org uuid, p_date date, p_source text, p_source_table text, p_source_id uuid, p_memo text, p_lines jsonb
) returns uuid language plpgsql as $$
declare v_j uuid; v_pid uuid; v sum bigint;
begin
  v_pid := acc_current_period(p_org);
  if v_pid is null then raise exception 'No open period for org %', p_org; end if;

  insert into acc_journals(org_id, period_id, jdate, source, source_table, source_id, memo)
  values (p_org, v_pid, p_date, p_source, p_source_table, p_source_id, p_memo)
  returning id into v_j;

  insert into acc_journal_lines(journal_id, org_id, account_id, debit_cents, credit_cents, currency, description)
  select v_j, p_org,
         (x->>'account_id')::uuid,
         coalesce((x->>'debit_cents')::bigint,0),
         coalesce((x->>'credit_cents')::bigint,0),
         'EUR',
         x->>'description'
  from jsonb_array_elements(p_lines) as x;

  perform acc_assert_balanced(v_j);
  return v_j;
end $$;

-- ========== Business Document Posting ==========

-- 1) AR Invoice: DR AR, CR Revenue, CR VAT; optional: DR COGS, CR Inventory on shipment (see 2)
create or replace function acc_post_ar_invoice(p_invoice_id uuid)
returns uuid language plpgsql as $$
declare inv record; d acc_account_defaults%rowtype; v_lines jsonb := '[]'::jsonb; v_total bigint; v_vat bigint; v_rev bigint;
begin
  -- Get invoice data - adapted for existing schema with totals jsonb field
  select i.*, i.org_id
  into inv
  from invoices i
  where i.id = p_invoice_id;

  if inv.org_id is null then
    raise exception 'Cannot determine org_id for invoice %', p_invoice_id;
  end if;

  select * into d from acc_account_defaults where org_id = inv.org_id;
  if d.org_id is null then
    raise exception 'No account defaults found for org %', inv.org_id;
  end if;

  -- Extract totals from jsonb field, default to 0 if not present
  v_total := coalesce((inv.totals->>'total')::numeric * 100, 0)::bigint;
  v_vat := coalesce((inv.totals->>'tax')::numeric * 100, 0)::bigint;
  v_rev := v_total - v_vat;

  if v_total = 0 then return null; end if;

  v_lines := jsonb_build_array(
    jsonb_build_object('account_id', d.ar_id, 'debit_cents', v_total, 'credit_cents', 0, 'description', 'AR Invoice'),
    jsonb_build_object('account_id', d.sales_rev_id, 'debit_cents', 0, 'credit_cents', v_rev, 'description', 'Revenue'),
    jsonb_build_object('account_id', d.vat_output_id, 'debit_cents', 0, 'credit_cents', v_vat, 'description', 'VAT Output')
  );

  return acc_post_journal(inv.org_id, coalesce(inv.created_at::date, current_date), 'AR Invoice','invoices', inv.id, 
    coalesce('Invoice #' || inv.invoice_number, 'Invoice #' || inv.id::text), v_lines);
end $$;

-- 2) COGS on stock move: DR COGS, CR Inventory (using existing stock_moves table)
create or replace function acc_post_cogs_for_stock_move(p_move_id uuid)
returns uuid language plpgsql as $$
declare sm record; d acc_account_defaults%rowtype; v_cost bigint;
begin
  select sm.*, p.price
  into sm
  from stock_moves sm
  join products p on p.id = sm.product_id
  where sm.id = p_move_id and sm.status = 'done';

  if sm.org_id is null then return null; end if;

  select * into d from acc_account_defaults where org_id = sm.org_id;
  if d.org_id is null then return null; end if;

  -- Calculate cost from product price * quantity
  v_cost := coalesce((sm.qty * sm.price * 100)::bigint, 0);

  if v_cost = 0 then return null; end if;

  return acc_post_journal(sm.org_id, coalesce(sm.created_at::date, current_date), 'COGS','stock_moves', sm.id, 
    'COGS for stock movement', 
    jsonb_build_array(
      jsonb_build_object('account_id', d.cogs_id, 'debit_cents', v_cost, 'credit_cents', 0, 'description', 'COGS'),
      jsonb_build_object('account_id', d.inventory_id, 'debit_cents', 0, 'credit_cents', v_cost, 'description', 'Inventory')
    )
  );
end $$;

-- 3) Cash Receipt (AR payment): DR Bank/Cash, CR AR
create or replace function acc_post_ar_payment(p_payment_id uuid)
returns uuid language plpgsql as $$
declare pay record; d acc_account_defaults%rowtype; acc_bank uuid; v_amount bigint;
begin
  select p.*, p.org_id,
         coalesce(p.amount * 100, 0)::bigint as amount_cents
  into pay
  from payments p
  where p.id = p_payment_id;

  if pay.org_id is null then return null; end if;

  select * into d from acc_account_defaults where org_id = pay.org_id;
  if d.org_id is null then return null; end if;

  acc_bank := coalesce(d.bank_id, d.cash_id);
  v_amount := pay.amount_cents;

  if v_amount = 0 then return null; end if;

  return acc_post_journal(pay.org_id, coalesce(pay.received_at::date, current_date), 'Payment','payments', pay.id, 
    coalesce('Payment #' || pay.id::text),
    jsonb_build_array(
      jsonb_build_object('account_id', acc_bank, 'debit_cents', v_amount, 'credit_cents', 0, 'description', 'Cash received'),
      jsonb_build_object('account_id', d.ar_id, 'debit_cents', 0, 'credit_cents', v_amount, 'description', 'AR settlement')
    )
  );
end $$;

-- 4) Simplified Purchase handling: Create placeholder function for future use
create or replace function acc_post_purchase(p_purchase_id uuid)
returns uuid language plpgsql as $$
begin
  -- Placeholder for purchase order posting
  -- This will be implemented when purchase_orders table is created
  return null;
end $$;

-- 5) Period Close: close income/expense to Retained Earnings; lock period
create or replace function acc_close_period(p_period_id uuid, p_org uuid)
returns uuid language plpgsql as $$
declare 
  d acc_account_defaults%rowtype; 
  v_rev bigint; 
  v_exp bigint; 
  v_delta bigint; 
  v_j uuid; 
  p record;
  v_revenue_entries jsonb;
  v_expense_entries jsonb;
begin
  select * into d from acc_account_defaults where org_id = p_org;
  if d.org_id is null then
    raise exception 'No account defaults found for org %', p_org;
  end if;

  select * into p from acc_periods where id = p_period_id and org_id = p_org;
  if p.id is null then
    raise exception 'Period not found';
  end if;
  
  if p.status <> 'open' then 
    raise exception 'Period % is not open', p.code; 
  end if;

  -- Sum income & expense within period
  select coalesce(sum(l.credit_cents - l.debit_cents), 0) into v_rev
  from acc_journal_lines l 
  join acc_journals j on j.id = l.journal_id
  join acc_accounts a on a.id = l.account_id
  where j.period_id = p_period_id and a.type = 'income';

  select coalesce(sum(l.debit_cents - l.credit_cents), 0) into v_exp
  from acc_journal_lines l 
  join acc_journals j on j.id = l.journal_id
  join acc_accounts a on a.id = l.account_id
  where j.period_id = p_period_id and a.type = 'expense';

  v_delta := v_rev - v_exp; -- profit (>0) or loss (<0)

  -- Build closing entries
  select jsonb_agg(
    jsonb_build_object(
      'account_id', a.id, 
      'debit_cents', coalesce(sum(l.credit_cents - l.debit_cents), 0), 
      'credit_cents', 0, 
      'description', 'Close revenue account'
    )
  ) into v_revenue_entries
  from acc_accounts a
  join acc_journal_lines l on l.account_id = a.id
  join acc_journals j on j.id = l.journal_id
  where j.period_id = p_period_id and a.type = 'income'
  group by a.id
  having sum(l.credit_cents - l.debit_cents) <> 0;

  select jsonb_agg(
    jsonb_build_object(
      'account_id', a.id, 
      'debit_cents', 0,
      'credit_cents', coalesce(sum(l.debit_cents - l.credit_cents), 0), 
      'description', 'Close expense account'
    )
  ) into v_expense_entries
  from acc_accounts a
  join acc_journal_lines l on l.account_id = a.id
  join acc_journals j on j.id = l.journal_id
  where j.period_id = p_period_id and a.type = 'expense'
  group by a.id
  having sum(l.debit_cents - l.credit_cents) <> 0;

  -- Combine entries with retained earnings transfer
  v_j := acc_post_journal(
    p_org, 
    p.end_date, 
    'Closing Entries',
    'period_close', 
    p_period_id, 
    'Close period ' || p.code,
    coalesce(v_revenue_entries, '[]'::jsonb) || 
    coalesce(v_expense_entries, '[]'::jsonb) ||
    jsonb_build_array(
      jsonb_build_object(
        'account_id', d.retained_earnings_id, 
        'debit_cents', case when v_delta < 0 then abs(v_delta) else 0 end, 
        'credit_cents', case when v_delta > 0 then v_delta else 0 end, 
        'description', case when v_delta > 0 then 'Transfer profit to RE' else 'Transfer loss to RE' end
      )
    )
  );

  update acc_periods set status = 'closed' where id = p_period_id;
  return v_j;
end $$;
