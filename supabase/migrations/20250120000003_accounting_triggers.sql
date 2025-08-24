-- 0018_accounting_triggers.sql - Auto-posting Triggers

-- AR Invoice → post when status becomes 'sent' or 'paid'
create or replace function trg_post_ar_invoice() returns trigger language plpgsql as $$
begin
  if TG_OP = 'UPDATE' and NEW.status in ('sent', 'paid') and (OLD.status is distinct from NEW.status) then
    perform acc_post_ar_invoice(NEW.id);
  elsif TG_OP = 'INSERT' and NEW.status in ('sent', 'paid') then
    perform acc_post_ar_invoice(NEW.id);
  end if;
  return coalesce(NEW, OLD);
end $$;

drop trigger if exists t_post_ar_invoice on invoices;
create trigger t_post_ar_invoice 
  after insert or update on invoices
  for each row execute function trg_post_ar_invoice();

-- Stock Move → COGS when status becomes 'done'
create or replace function trg_post_cogs() returns trigger language plpgsql as $$
begin
  if TG_OP = 'UPDATE' and NEW.status = 'done' and OLD.status is distinct from 'done' then
    perform acc_post_cogs_for_stock_move(NEW.id);
  elsif TG_OP = 'INSERT' and NEW.status = 'done' then
    perform acc_post_cogs_for_stock_move(NEW.id);
  end if;
  return coalesce(NEW, OLD);
end $$;

drop trigger if exists t_post_cogs on stock_moves;
create trigger t_post_cogs 
  after insert or update on stock_moves
  for each row execute function trg_post_cogs();

-- Payment → AR settle when created or updated to 'completed'
create or replace function trg_post_payment() returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' and NEW.status = 'completed' then
    perform acc_post_ar_payment(NEW.id);
  elsif TG_OP = 'UPDATE' and NEW.status = 'completed' and OLD.status is distinct from 'completed' then
    perform acc_post_ar_payment(NEW.id);
  end if;
  return coalesce(NEW, OLD);
end $$;

drop trigger if exists t_post_payment on payments;
create trigger t_post_payment 
  after insert or update on payments
  for each row execute function trg_post_payment();

-- Placeholder for future purchase order triggers
-- Will be implemented when purchase_orders table is created
