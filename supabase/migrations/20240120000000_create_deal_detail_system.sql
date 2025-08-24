-- Enhanced Deal Detail System
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Deal Activities Table
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'task', 'stage_change', 'value_change', 'file_upload')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL, -- Will reference either users or auth.users depending on your setup
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Files Table
CREATE TABLE IF NOT EXISTS deal_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID NOT NULL -- Will reference either users or auth.users depending on your setup
);

-- Deal Changelog Table
CREATE TABLE IF NOT EXISTS deal_changelog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID NOT NULL -- Will reference either users or auth.users depending on your setup
);

-- Deal Quotes Table
CREATE TABLE IF NOT EXISTS deal_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  quote_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until DATE NOT NULL,
  terms_conditions TEXT,
  notes TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL, -- Will reference either users or auth.users depending on your setup
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Quote Items Table
CREATE TABLE IF NOT EXISTS deal_quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES deal_quotes(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  tax_percent DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Orders Table
CREATE TABLE IF NOT EXISTS deal_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES deal_quotes(id),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(12,2) NOT NULL,
  customer_po_number TEXT,
  shipping_address TEXT,
  billing_address TEXT,
  delivery_date DATE,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL, -- Will reference either users or auth.users depending on your setup
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Invoices Table
CREATE TABLE IF NOT EXISTS deal_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES deal_orders(id),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  total_amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_terms TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL, -- Will reference either users or auth.users depending on your setup
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_type ON deal_activities(type);
CREATE INDEX IF NOT EXISTS idx_deal_activities_created_at ON deal_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_deal_activities_pinned ON deal_activities(is_pinned) WHERE is_pinned = TRUE;

CREATE INDEX IF NOT EXISTS idx_deal_files_deal_id ON deal_files(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_files_category ON deal_files(category);

CREATE INDEX IF NOT EXISTS idx_deal_changelog_deal_id ON deal_changelog(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_changelog_changed_at ON deal_changelog(changed_at);

CREATE INDEX IF NOT EXISTS idx_deal_quotes_deal_id ON deal_quotes(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_quotes_status ON deal_quotes(status);
CREATE INDEX IF NOT EXISTS idx_deal_quotes_valid_until ON deal_quotes(valid_until);

CREATE INDEX IF NOT EXISTS idx_deal_orders_deal_id ON deal_orders(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_orders_quote_id ON deal_orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_deal_orders_status ON deal_orders(status);

CREATE INDEX IF NOT EXISTS idx_deal_invoices_deal_id ON deal_invoices(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_invoices_order_id ON deal_invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_deal_invoices_status ON deal_invoices(status);
CREATE INDEX IF NOT EXISTS idx_deal_invoices_due_date ON deal_invoices(due_date);

-- Sequences for auto-numbering
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 2000;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 3000;

-- Functions for auto-generating numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QUO-' || LPAD(nextval('quote_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

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

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deal_activities_updated_at BEFORE UPDATE ON deal_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_quotes_updated_at BEFORE UPDATE ON deal_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_orders_updated_at BEFORE UPDATE ON deal_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_invoices_updated_at BEFORE UPDATE ON deal_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjusted for your deals table structure)
CREATE POLICY "Users can view deal activities for their deals" ON deal_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = deal_activities.deal_id 
      AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can insert deal activities for their deals" ON deal_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = deal_activities.deal_id 
      AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can update their own deal activities" ON deal_activities
  FOR UPDATE USING (created_by = auth.uid());

-- Similar policies for other tables
CREATE POLICY "Users can view deal files for their deals" ON deal_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = deal_files.deal_id 
      AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage deal files for their deals" ON deal_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = deal_files.deal_id 
      AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can view deal changelog for their deals" ON deal_changelog
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = deal_changelog.deal_id 
      AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can view deal quotes for their deals" ON deal_quotes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = deal_quotes.deal_id 
      AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can view deal quote items for their quotes" ON deal_quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deal_quotes dq
      JOIN deals d ON d.id = dq.deal_id
      WHERE dq.id = deal_quote_items.quote_id 
      AND (d.owner_id = auth.uid() OR d.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can view deal orders for their deals" ON deal_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = deal_orders.deal_id 
      AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can view deal invoices for their deals" ON deal_invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = deal_invoices.deal_id 
      AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
