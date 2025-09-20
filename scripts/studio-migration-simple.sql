-- STANDALONE DEAL DETAIL MIGRATION FOR SUPABASE STUDIO
-- Copy and paste this entire script into Supabase Studio SQL Editor

-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Check if we have the basic tables we need
DO $$
BEGIN
  -- Create a simple deals table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
    CREATE TABLE deals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      value INTEGER DEFAULT 0,
      owner_id UUID,
      created_by UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
  
  -- Create basic users table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE,
      name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
  
  -- Create basic contacts table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
    CREATE TABLE contacts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
  
  -- Create basic companies table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    CREATE TABLE companies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      website TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Step 3: Create Deal Detail System Tables
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'task', 'stage_change', 'value_change', 'file_upload')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS deal_changelog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS deal_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL,
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
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  tax_percent DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Add Foreign Key Constraints (only if tables exist)
DO $$
BEGIN
  -- Add foreign key to deals if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deal_activities_deal_id_fkey') THEN
      ALTER TABLE deal_activities ADD CONSTRAINT deal_activities_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deal_files_deal_id_fkey') THEN
      ALTER TABLE deal_files ADD CONSTRAINT deal_files_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deal_changelog_deal_id_fkey') THEN
      ALTER TABLE deal_changelog ADD CONSTRAINT deal_changelog_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deal_quotes_deal_id_fkey') THEN
      ALTER TABLE deal_quotes ADD CONSTRAINT deal_quotes_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
    END IF;
  END IF;
  
  -- Add foreign key to quote items
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deal_quote_items_quote_id_fkey') THEN
    ALTER TABLE deal_quote_items ADD CONSTRAINT deal_quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES deal_quotes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 5: Create Indexes
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_type ON deal_activities(type);
CREATE INDEX IF NOT EXISTS idx_deal_activities_created_at ON deal_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_deal_files_deal_id ON deal_files(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_changelog_deal_id ON deal_changelog(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_quotes_deal_id ON deal_quotes(deal_id);

-- Step 6: Create sequences and functions
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QUO-' || LPAD(nextval('quote_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create a simple RPC function for testing
CREATE OR REPLACE FUNCTION get_deal_activities(deal_id_param UUID)
RETURNS TABLE (
  id UUID,
  deal_id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    da.id,
    da.deal_id,
    da.type,
    da.title,
    da.description,
    da.created_at
  FROM deal_activities da
  WHERE da.deal_id = deal_id_param
  ORDER BY da.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 
  'Deal Detail System Successfully Installed!' as message,
  'Tables Created: deal_activities, deal_files, deal_changelog, deal_quotes, deal_quote_items' as tables_created,
  'You can now use the Deal Detail hooks in your React app!' as next_step;


