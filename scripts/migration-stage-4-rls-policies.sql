-- STAGE 4: Enable RLS and Create Policies
-- Run this after Stage 3 completes successfully

-- Enable Row Level Security (RLS)
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_invoices ENABLE ROW LEVEL SECURITY;

-- Deal Activities Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view deal activities for their deals' AND tablename = 'deal_activities') THEN
    CREATE POLICY "Users can view deal activities for their deals" ON deal_activities
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM deals 
          WHERE deals.id = deal_activities.deal_id 
          AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert deal activities for their deals' AND tablename = 'deal_activities') THEN
    CREATE POLICY "Users can insert deal activities for their deals" ON deal_activities
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM deals 
          WHERE deals.id = deal_activities.deal_id 
          AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own deal activities' AND tablename = 'deal_activities') THEN
    CREATE POLICY "Users can update their own deal activities" ON deal_activities
      FOR UPDATE USING (created_by = auth.uid());
  END IF;
END $$;

-- Deal Files Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage deal files for their deals' AND tablename = 'deal_files') THEN
    CREATE POLICY "Users can manage deal files for their deals" ON deal_files
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM deals 
          WHERE deals.id = deal_files.deal_id 
          AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
        )
      );
  END IF;
END $$;

-- Deal Changelog Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view deal changelog for their deals' AND tablename = 'deal_changelog') THEN
    CREATE POLICY "Users can view deal changelog for their deals" ON deal_changelog
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM deals 
          WHERE deals.id = deal_changelog.deal_id 
          AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
        )
      );
  END IF;
END $$;

-- Deal Quotes Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage deal quotes for their deals' AND tablename = 'deal_quotes') THEN
    CREATE POLICY "Users can manage deal quotes for their deals" ON deal_quotes
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM deals 
          WHERE deals.id = deal_quotes.deal_id 
          AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
        )
      );
  END IF;
END $$;

-- Deal Quote Items Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage deal quote items for their quotes' AND tablename = 'deal_quote_items') THEN
    CREATE POLICY "Users can manage deal quote items for their quotes" ON deal_quote_items
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM deal_quotes dq
          JOIN deals d ON d.id = dq.deal_id
          WHERE dq.id = deal_quote_items.quote_id 
          AND (d.owner_id = auth.uid() OR d.created_by = auth.uid())
        )
      );
  END IF;
END $$;

-- Deal Orders Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage deal orders for their deals' AND tablename = 'deal_orders') THEN
    CREATE POLICY "Users can manage deal orders for their deals" ON deal_orders
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM deals 
          WHERE deals.id = deal_orders.deal_id 
          AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
        )
      );
  END IF;
END $$;

-- Deal Invoices Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage deal invoices for their deals' AND tablename = 'deal_invoices') THEN
    CREATE POLICY "Users can manage deal invoices for their deals" ON deal_invoices
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM deals 
          WHERE deals.id = deal_invoices.deal_id 
          AND (deals.owner_id = auth.uid() OR deals.created_by = auth.uid())
        )
      );
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Stage 4 Complete: RLS policies created successfully!' as message;
SELECT 'All migration stages completed! Your Deal Detail System is ready to use.' as final_message;

