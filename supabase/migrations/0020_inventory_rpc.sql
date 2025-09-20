-- Inventory: atomic Postgres RPCs
-- Migration — 0020_inventory_rpc.sql

-- Guard: create "reserved" semantic via stock_moves only (we decrease on-hand during reserve)
-- This keeps math simple and avoids double-decrement at shipment time.

-- Upsert helper
create or replace function _stock_touch(p_org text, p_product uuid, p_location uuid)
returns void language plpgsql as $$
begin
  insert into stock_items(org_id, product_id, location_id, qty)
  values (p_org, p_product, p_location, 0)
  on conflict (org_id, product_id, location_id) do nothing;
end $$;

-- Reserve stock atomically for a Sales Order
-- payload lines JSON: [{product_id, location_id, qty}]
create or replace function reserve_stock(
  p_org text,
  p_sales_order uuid,
  p_lines jsonb
) returns void language plpgsql as $$
declare l jsonb; v_prod uuid; v_loc uuid; v_qty numeric(14,3);
begin
  perform pg_advisory_xact_lock(hashtext('reserve_stock')::bigint);

  for l in select * from jsonb_array_elements(p_lines)
  loop
    v_prod := (l->>'product_id')::uuid;
    v_loc  := (l->>'location_id')::uuid;
    v_qty  := (l->>'qty')::numeric;

    perform _stock_touch(p_org, v_prod, v_loc);

    -- lock row
    update stock_items
      set qty = qty - v_qty
      where org_id=p_org and product_id=v_prod and location_id=v_loc
      returning qty into v_qty;

    if v_qty < 0 then
      raise exception 'Insufficient stock for product %, location % (resulting qty %)', v_prod, v_loc, v_qty;
    end if;

    insert into so_reservations(org_id, sales_order_id, product_id, qty, location_id)
    values (p_org, p_sales_order, v_prod, (l->>'qty')::numeric, v_loc);

    insert into stock_moves(org_id, product_id, from_location_id, to_location_id, qty, reason, ref_table, ref_id)
    values (p_org, v_prod, v_loc, null, (l->>'qty')::numeric, 'sale_reservation', 'sales_orders', p_sales_order);
  end loop;
end $$;

-- Ship stock atomically for a Shipment
-- If reservation exists, only writes a movement record (no second decrement).
-- If no reservation exists, decrements now.
-- lines: [{product_id, location_id, qty}]
create or replace function ship_stock(
  p_org text,
  p_shipment uuid,
  p_sales_order uuid,
  p_lines jsonb
) returns void language plpgsql as $$
declare l jsonb; v_prod uuid; v_loc uuid; v_qty numeric(14,3); v_reserved numeric(14,3);
begin
  perform pg_advisory_xact_lock(hashtext('ship_stock')::bigint);

  for l in select * from jsonb_array_elements(p_lines)
  loop
    v_prod := (l->>'product_id')::uuid;
    v_loc  := (l->>'location_id')::uuid;
    v_qty  := (l->>'qty')::numeric;

    select coalesce(sum(qty),0) into v_reserved
    from so_reservations
    where org_id=p_org and sales_order_id=p_sales_order and product_id=v_prod and location_id=v_loc;

    if v_reserved >= v_qty then
      -- consume reservation: reduce reservation rows (simplest: delete & reinsert remainder)
      -- remove rows greedily
      for v_qty in
        with r as (
          select id, qty from so_reservations
          where org_id=p_org and sales_order_id=p_sales_order and product_id=v_prod and location_id=v_loc
          order by created_at
        )
        select qty from r
      loop
        exit when v_qty <= 0;
      end loop;
      -- Simplify: just delete matching reservations; they already reduced stock_items at reserve time.
      delete from so_reservations
      where org_id=p_org and sales_order_id=p_sales_order and product_id=v_prod and location_id=v_loc;

      -- Only movement (documentation)
      insert into stock_moves(org_id, product_id, from_location_id, to_location_id, qty, reason, ref_table, ref_id)
      values (p_org, v_prod, v_loc, null, (l->>'qty')::numeric, 'shipment', 'shipments', p_shipment);
    else
      -- Not enough reserved: decrement remaining now
      perform _stock_touch(p_org, v_prod, v_loc);

      update stock_items
        set qty = qty - ( (l->>'qty')::numeric - v_reserved )
        where org_id=p_org and product_id=v_prod and location_id=v_loc
      returning qty into v_qty;

      if v_qty < 0 then
        raise exception 'Insufficient stock to ship product %, location % (resulting qty %)', v_prod, v_loc, v_qty;
      end if;

      -- clear any reservations for these lines (best-effort)
      delete from so_reservations
      where org_id=p_org and sales_order_id=p_sales_order and product_id=v_prod and location_id=v_loc;

      insert into stock_moves(org_id, product_id, from_location_id, to_location_id, qty, reason, ref_table, ref_id)
      values (p_org, v_prod, v_loc, null, (l->>'qty')::numeric, 'shipment', 'shipments', p_shipment);
    end if;
  end loop;
end $$;

-- Expose as RPC
grant execute on function reserve_stock(text,uuid,jsonb) to anon, authenticated, service_role;
grant execute on function ship_stock(text,uuid,uuid,jsonb) to anon, authenticated, service_role;

