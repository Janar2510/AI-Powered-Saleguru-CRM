-- Fix All Remaining Schema Issues (2025-08-07)
-- This script fixes all the remaining database schema problems

-- 1. Fix customers table - add missing columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Net 30';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Fix documents table - add missing columns
ALTER TABLE documents ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS partner_id UUID;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'general';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signer_email TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 3. Fix sales_orders table - add missing columns
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Net 30';
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Fix user_profiles table - add missing columns for leaderboard
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;

-- 5. Create missing indexes
CREATE INDEX IF NOT EXISTS idx_documents_partner_id ON documents(partner_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON user_profiles(points);

-- 6. Update RLS policies for new columns
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON documents;
CREATE POLICY "Enable all access for authenticated users" ON documents
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON sales_orders;
CREATE POLICY "Enable all access for authenticated users" ON sales_orders
  FOR ALL USING (auth.role() = 'authenticated');

-- 7. Insert sample data for testing
INSERT INTO customers (company_name, contact_name, email, phone, address, city, state, postal_code, country, credit_limit, payment_terms) VALUES
  ('Sample Corp', 'John Doe', 'john@samplecorp.com', '+1234567890', '123 Business St', 'New York', 'NY', '10001', 'USA', 10000.00, 'Net 30'),
  ('Test Company', 'Jane Smith', 'jane@testcompany.com', '+0987654321', '456 Test Ave', 'Los Angeles', 'CA', '90210', 'USA', 5000.00, 'Net 15')
ON CONFLICT (email) DO NOTHING;

INSERT INTO documents (name, document_type, status, partner_id, signer_email) VALUES
  ('Sample Contract', 'contract', 'draft', (SELECT id FROM customers LIMIT 1), 'signer@example.com'),
  ('Service Agreement', 'agreement', 'sent', (SELECT id FROM customers LIMIT 1), 'client@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO sales_orders (order_number, customer_id, order_date, status, total_amount, currency) VALUES
  ('SO000001', (SELECT id FROM customers LIMIT 1), CURRENT_DATE, 'pending', 1500.00, 'EUR'),
  ('SO000002', (SELECT id FROM customers LIMIT 1), CURRENT_DATE, 'confirmed', 2500.00, 'EUR')
ON CONFLICT (order_number) DO NOTHING;

-- 8. Update existing user profiles with points
UPDATE user_profiles SET points = 100, badges = ARRAY['first_deal', 'active_user'], level = 2, experience = 150
WHERE email = 'kuusk.janar@icloud.com';

-- 9. Add sample user profiles for leaderboard
INSERT INTO user_profiles (email, first_name, last_name, points, badges, level, experience) VALUES
  ('user1@example.com', 'Alice', 'Johnson', 250, ARRAY['top_seller', 'deal_closer'], 3, 300),
  ('user2@example.com', 'Bob', 'Wilson', 180, ARRAY['consistent', 'team_player'], 2, 200),
  ('user3@example.com', 'Carol', 'Brown', 320, ARRAY['expert', 'mentor'], 4, 450),
  ('user4@example.com', 'David', 'Davis', 95, ARRAY['newcomer'], 1, 50)
ON CONFLICT (email) DO NOTHING;

SELECT 'All schema issues fixed successfully!' as status; 