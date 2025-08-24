-- STAGE 2: Create Indexes and Sequences
-- Run this after Stage 1 completes successfully

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

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deal_activities_updated_at') THEN
    CREATE TRIGGER update_deal_activities_updated_at 
    BEFORE UPDATE ON deal_activities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deal_quotes_updated_at') THEN
    CREATE TRIGGER update_deal_quotes_updated_at 
    BEFORE UPDATE ON deal_quotes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deal_orders_updated_at') THEN
    CREATE TRIGGER update_deal_orders_updated_at 
    BEFORE UPDATE ON deal_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deal_invoices_updated_at') THEN
    CREATE TRIGGER update_deal_invoices_updated_at 
    BEFORE UPDATE ON deal_invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Success message
SELECT 'Stage 2 Complete: Indexes, sequences, and triggers created successfully!' as message;

