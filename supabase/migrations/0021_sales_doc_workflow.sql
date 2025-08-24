-- Deal toolbar flow (Quote → Pro Forma → SO → Invoice)
-- Conversion helpers — 0021_sales_doc_workflow.sql

-- Create from QUOTE -> PRO FORMA
create or replace function quote_to_proforma(p_quote uuid)
returns uuid language plpgsql as $$
declare q record; pf uuid;
begin
  select * into q from quotes where id=p_quote;
  insert into proformas (org_id, deal_id, sales_order_id, currency, subtotal_cents, tax_rate, tax_cents, total_cents, valid_until)
  values (q.org_id, q.deal_id, null, coalesce(q.currency,'EUR'), q.subtotal_cents, q.tax_rate, q.tax_cents, q.total_cents, (current_date + interval '14 days'))
  returning id into pf;

  insert into proforma_items (proforma_id, product_id, description, qty, unit_price_cents, line_total_cents)
  select pf, qi.product_id, qi.description, qi.qty, qi.unit_price_cents, qi.line_total_cents
  from quote_items qi where qi.quote_id = p_quote;

  update proformas set number = coalesce(number, next_number(org_id,'document')) where id=pf;
  return pf;
end $$;

-- PRO FORMA -> SALES ORDER
create or replace function proforma_to_sales_order(p_proforma uuid)
returns uuid language plpgsql as $$
declare p record; so uuid;
begin
  select * into p from proformas where id=p_proforma;
  insert into sales_orders (org_id, deal_id, customer_id, currency, subtotal_cents, tax_rate, tax_cents, total_cents, status)
  values (p.org_id, p.deal_id, (select company_id from deals where id=p.deal_id), coalesce(p.currency,'EUR'), p.subtotal_cents, p.tax_rate, p.tax_cents, p.total_cents, 'draft')
  returning id into so;

  insert into sales_order_lines (sales_order_id, product_id, description, qty, unit_price_cents, line_total_cents)
  select so, pi.product_id, pi.description, pi.qty, pi.unit_price_cents, pi.line_total_cents
  from proforma_items pi where pi.proforma_id = p_proforma;

  update sales_orders set number = coalesce(number, next_number(org_id,'document')) where id=so;
  update proformas set sales_order_id = so where id=p_proforma;
  return so;
end $$;

-- SALES ORDER -> INVOICE
create or replace function sales_order_to_invoice(p_sales_order uuid)
returns uuid language plpgsql as $$
declare s record; inv uuid;
begin
  select * into s from sales_orders where id=p_sales_order;
  insert into invoices (org_id, deal_id, company_id, currency, subtotal_cents, tax_rate, tax_cents, total_cents, status, issue_date, due_date)
  values (s.org_id, s.deal_id, s.customer_id, coalesce(s.currency,'EUR'), s.subtotal_cents, s.tax_rate, s.tax_cents, s.total_cents, 'draft', current_date, current_date + interval '14 days')
  returning id into inv;

  insert into invoice_items (invoice_id, product_id, description, qty, unit_price_cents, line_total_cents)
  select inv, sol.product_id, sol.description, sol.qty, sol.unit_price_cents, sol.line_total_cents
  from sales_order_lines sol where sol.sales_order_id = p_sales_order;

  update invoices set number = coalesce(number, next_number(org_id,'document')) where id=inv;

  return inv;
end $$;

grant execute on function quote_to_proforma(uuid) to authenticated, service_role;
grant execute on function proforma_to_sales_order(uuid) to authenticated, service_role;
grant execute on function sales_order_to_invoice(uuid) to authenticated, service_role;
