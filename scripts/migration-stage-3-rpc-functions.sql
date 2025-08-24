-- STAGE 3: Create RPC Functions
-- Run this after Stage 2 completes successfully

-- RPC Function: Get deal quotes with items
CREATE OR REPLACE FUNCTION get_deal_quotes_with_items(deal_id_param UUID)
RETURNS TABLE (
  id UUID,
  deal_id UUID,
  quote_number TEXT,
  title TEXT,
  description TEXT,
  subtotal DECIMAL,
  discount_amount DECIMAL,
  tax_amount DECIMAL,
  total_amount DECIMAL,
  status TEXT,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  items JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.deal_id,
    q.quote_number,
    q.title,
    q.description,
    q.subtotal,
    q.discount_amount,
    q.tax_amount,
    q.total_amount,
    q.status,
    q.valid_until,
    q.created_at,
    COALESCE(
      json_agg(
        json_build_object(
          'id', qi.id,
          'product_name', qi.product_name,
          'description', qi.description,
          'quantity', qi.quantity,
          'unit_price', qi.unit_price,
          'discount_percent', qi.discount_percent,
          'tax_percent', qi.tax_percent,
          'line_total', qi.line_total
        ) ORDER BY qi.sort_order
      ) FILTER (WHERE qi.id IS NOT NULL),
      '[]'::json
    )::jsonb AS items
  FROM deal_quotes q
  LEFT JOIN deal_quote_items qi ON q.id = qi.quote_id
  WHERE q.deal_id = deal_id_param
  GROUP BY q.id, q.deal_id, q.quote_number, q.title, q.description, 
           q.subtotal, q.discount_amount, q.tax_amount, q.total_amount,
           q.status, q.valid_until, q.created_at
  ORDER BY q.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Create deal quote with items
CREATE OR REPLACE FUNCTION create_deal_quote(quote_data JSONB)
RETURNS deal_quotes AS $$
DECLARE
  new_quote deal_quotes;
  quote_item JSONB;
BEGIN
  -- Insert quote
  INSERT INTO deal_quotes (
    deal_id,
    quote_number,
    title,
    description,
    subtotal,
    discount_amount,
    tax_amount,
    total_amount,
    valid_until,
    terms_conditions,
    notes,
    created_by
  ) VALUES (
    (quote_data->>'deal_id')::UUID,
    COALESCE(quote_data->>'quote_number', generate_quote_number()),
    quote_data->>'title',
    quote_data->>'description',
    (quote_data->>'subtotal')::DECIMAL,
    COALESCE((quote_data->>'discount_amount')::DECIMAL, 0),
    COALESCE((quote_data->>'tax_amount')::DECIMAL, 0),
    (quote_data->>'total_amount')::DECIMAL,
    (quote_data->>'valid_until')::DATE,
    quote_data->>'terms_conditions',
    quote_data->>'notes',
    auth.uid()
  ) RETURNING * INTO new_quote;

  -- Insert quote items
  FOR quote_item IN SELECT * FROM jsonb_array_elements(quote_data->'items')
  LOOP
    INSERT INTO deal_quote_items (
      quote_id,
      product_name,
      description,
      quantity,
      unit_price,
      discount_percent,
      tax_percent,
      line_total,
      sort_order
    ) VALUES (
      new_quote.id,
      quote_item->>'product_name',
      quote_item->>'description',
      (quote_item->>'quantity')::INTEGER,
      (quote_item->>'unit_price')::DECIMAL,
      COALESCE((quote_item->>'discount_percent')::DECIMAL, 0),
      COALESCE((quote_item->>'tax_percent')::DECIMAL, 0),
      (quote_item->>'line_total')::DECIMAL,
      COALESCE((quote_item->>'sort_order')::INTEGER, 0)
    );
  END LOOP;

  RETURN new_quote;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Convert quote to order
CREATE OR REPLACE FUNCTION convert_quote_to_order(
  quote_id_param UUID,
  order_data JSONB
)
RETURNS deal_orders AS $$
DECLARE
  quote_record deal_quotes;
  new_order deal_orders;
BEGIN
  -- Get quote details
  SELECT * INTO quote_record FROM deal_quotes WHERE id = quote_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;

  -- Insert order
  INSERT INTO deal_orders (
    quote_id,
    deal_id,
    order_number,
    total_amount,
    customer_po_number,
    shipping_address,
    billing_address,
    delivery_date,
    special_instructions,
    created_by
  ) VALUES (
    quote_id_param,
    quote_record.deal_id,
    COALESCE(order_data->>'order_number', generate_order_number()),
    quote_record.total_amount,
    order_data->>'customer_po_number',
    order_data->>'shipping_address',
    order_data->>'billing_address',
    (order_data->>'delivery_date')::DATE,
    order_data->>'special_instructions',
    auth.uid()
  ) RETURNING * INTO new_order;

  RETURN new_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Convert order to invoice
CREATE OR REPLACE FUNCTION convert_order_to_invoice(
  order_id_param UUID,
  invoice_data JSONB
)
RETURNS deal_invoices AS $$
DECLARE
  order_record deal_orders;
  new_invoice deal_invoices;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM deal_orders WHERE id = order_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Insert invoice
  INSERT INTO deal_invoices (
    order_id,
    deal_id,
    invoice_number,
    total_amount,
    due_date,
    payment_terms,
    payment_method,
    notes,
    created_by
  ) VALUES (
    order_id_param,
    order_record.deal_id,
    COALESCE(invoice_data->>'invoice_number', generate_invoice_number()),
    order_record.total_amount,
    (invoice_data->>'due_date')::DATE,
    invoice_data->>'payment_terms',
    invoice_data->>'payment_method',
    invoice_data->>'notes',
    auth.uid()
  ) RETURNING * INTO new_invoice;

  RETURN new_invoice;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Stage 3 Complete: RPC functions created successfully!' as message;

