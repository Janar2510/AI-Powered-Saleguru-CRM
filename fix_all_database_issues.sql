-- Fix All Database Issues (2025-08-07)
-- This script fixes all remaining database schema problems

-- 1. Fix sales_orders table - add missing columns and fix constraints
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS number TEXT;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Net 30';
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing records to have a number if they don't have one
UPDATE sales_orders SET number = order_number WHERE number IS NULL;

-- 2. Fix payments table - add missing columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank_transfer';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_response JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;

-- 3. Fix customers table - add missing columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Net 30';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 4. Fix documents table - add missing columns
ALTER TABLE documents ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS partner_id UUID;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'general';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signer_email TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 5. Fix user_profiles table - add missing columns for leaderboard
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;

-- 6. Create missing indexes
CREATE INDEX IF NOT EXISTS idx_sales_orders_number ON sales_orders(number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_id ON payments(gateway_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_partner_id ON documents(partner_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON user_profiles(points);

-- 7. Update RLS policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON sales_orders;
CREATE POLICY "Enable all access for authenticated users" ON sales_orders
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON payments;
CREATE POLICY "Enable all access for authenticated users" ON payments
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON documents;
CREATE POLICY "Enable all access for authenticated users" ON documents
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. Insert sample data for testing
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user ID from auth.users
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;
    
    -- If no user exists, create a sample user
    IF current_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
          (gen_random_uuid(), 'sample@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW())
        RETURNING id INTO current_user_id;
    END IF;
    
    -- Insert sample customers with user_id
    IF NOT EXISTS (SELECT 1 FROM customers WHERE email = 'john@samplecorp.com') THEN
        INSERT INTO customers (user_id, company_name, contact_name, email, phone, address, city, state, postal_code, country, credit_limit, payment_terms) VALUES
          (current_user_id, 'Sample Corp', 'John Doe', 'john@samplecorp.com', '+1234567890', '123 Business St', 'New York', 'NY', '10001', 'USA', 10000.00, 'Net 30');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM customers WHERE email = 'jane@testcompany.com') THEN
        INSERT INTO customers (user_id, company_name, contact_name, email, phone, address, city, state, postal_code, country, credit_limit, payment_terms) VALUES
          (current_user_id, 'Test Company', 'Jane Smith', 'jane@testcompany.com', '+0987654321', '456 Test Ave', 'Los Angeles', 'CA', '90210', 'USA', 5000.00, 'Net 15');
    END IF;
END $$;

-- Insert sample sales orders with customer_name and customer_email
DO $$
DECLARE
    sample_customer_id UUID;
    sample_customer_name TEXT;
    sample_customer_email TEXT;
BEGIN
    -- Get a sample customer ID and details
    SELECT id, contact_name, email INTO sample_customer_id, sample_customer_name, sample_customer_email FROM customers LIMIT 1;
    
    IF NOT EXISTS (SELECT 1 FROM sales_orders WHERE order_number = 'SO000001') THEN
        INSERT INTO sales_orders (order_number, number, customer_id, customer_name, customer_email, order_date, status, total_amount, currency) VALUES
          ('SO000001', 'SO000001', sample_customer_id, sample_customer_name, sample_customer_email, CURRENT_DATE, 'pending', 1500.00, 'EUR');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM sales_orders WHERE order_number = 'SO000002') THEN
        INSERT INTO sales_orders (order_number, number, customer_id, customer_name, customer_email, order_date, status, total_amount, currency) VALUES
          ('SO000002', 'SO000002', sample_customer_id, sample_customer_name, sample_customer_email, CURRENT_DATE, 'confirmed', 2500.00, 'EUR');
    END IF;
END $$;

-- Insert sample payments
DO $$
DECLARE
    sample_customer_id UUID;
BEGIN
    -- Get a sample customer ID
    SELECT id INTO sample_customer_id FROM customers LIMIT 1;
    
    IF NOT EXISTS (SELECT 1 FROM payments WHERE reference = 'PAY000001') THEN
        INSERT INTO payments (reference, transaction_id, amount, status, payment_method, customer_id) VALUES
          ('PAY000001', 'TXN001', 1500.00, 'completed', 'bank_transfer', sample_customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM payments WHERE reference = 'PAY000002') THEN
        INSERT INTO payments (reference, transaction_id, amount, status, payment_method, customer_id) VALUES
          ('PAY000002', 'TXN002', 2500.00, 'pending', 'credit_card', sample_customer_id);
    END IF;
END $$;

-- Insert sample documents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM documents WHERE name = 'Sample Contract') THEN
        INSERT INTO documents (name, document_type, status, content, signer_email, signer_name) VALUES
          ('Sample Contract', 'contract', 'draft', 'This is a sample contract content...', 'signer@example.com', 'John Signer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM documents WHERE name = 'Service Agreement') THEN
        INSERT INTO documents (name, document_type, status, content, signer_email, signer_name) VALUES
          ('Service Agreement', 'agreement', 'sent', 'This is a service agreement content...', 'client@example.com', 'Jane Client');
    END IF;
END $$;

-- 9. Update existing user profiles with points
UPDATE user_profiles SET points = 100, badges = ARRAY['first_deal', 'active_user'], level = 2, experience = 150
WHERE email = 'kuusk.janar@icloud.com';

-- 10. Add sample user profiles for leaderboard (create users first, then profiles)
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    user4_id UUID;
BEGIN
    -- Create users in auth.users first
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user1@example.com') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
          (gen_random_uuid(), 'user1@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW())
        RETURNING id INTO user1_id;
    ELSE
        SELECT id INTO user1_id FROM auth.users WHERE email = 'user1@example.com';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user2@example.com') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
          (gen_random_uuid(), 'user2@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW())
        RETURNING id INTO user2_id;
    ELSE
        SELECT id INTO user2_id FROM auth.users WHERE email = 'user2@example.com';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user3@example.com') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
          (gen_random_uuid(), 'user3@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW())
        RETURNING id INTO user3_id;
    ELSE
        SELECT id INTO user3_id FROM auth.users WHERE email = 'user3@example.com';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user4@example.com') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
          (gen_random_uuid(), 'user4@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW())
        RETURNING id INTO user4_id;
    ELSE
        SELECT id INTO user4_id FROM auth.users WHERE email = 'user4@example.com';
    END IF;
    
    -- Now create user profiles with the correct user IDs
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'user1@example.com') THEN
        INSERT INTO user_profiles (id, email, first_name, last_name, points, badges, level, experience) VALUES
          (user1_id, 'user1@example.com', 'Alice', 'Johnson', 250, ARRAY['top_seller', 'deal_closer'], 3, 300);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'user2@example.com') THEN
        INSERT INTO user_profiles (id, email, first_name, last_name, points, badges, level, experience) VALUES
          (user2_id, 'user2@example.com', 'Bob', 'Wilson', 180, ARRAY['consistent', 'team_player'], 2, 200);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'user3@example.com') THEN
        INSERT INTO user_profiles (id, email, first_name, last_name, points, badges, level, experience) VALUES
          (user3_id, 'user3@example.com', 'Carol', 'Brown', 320, ARRAY['expert', 'mentor'], 4, 450);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'user4@example.com') THEN
        INSERT INTO user_profiles (id, email, first_name, last_name, points, badges, level, experience) VALUES
          (user4_id, 'user4@example.com', 'David', 'Davis', 95, ARRAY['newcomer'], 1, 50);
    END IF;
END $$;

SELECT 'All database issues fixed successfully!' as status; 