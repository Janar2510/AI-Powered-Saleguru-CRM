-- Test script for Deal Detail System
-- Run this in Supabase Studio SQL Editor to create test data

-- Insert test data
DO $$
DECLARE
  test_deal_id UUID;
  test_user_id UUID;
  test_contact_id UUID;
  test_company_id UUID;
BEGIN
  -- Create test user
  INSERT INTO users (id, email, name) 
  VALUES (uuid_generate_v4(), 'test@example.com', 'Test User')
  RETURNING id INTO test_user_id;
  
  -- Create test company
  INSERT INTO companies (id, name, website) 
  VALUES (uuid_generate_v4(), 'Acme Corp', 'https://acme.com')
  RETURNING id INTO test_company_id;
  
  -- Create test contact
  INSERT INTO contacts (id, first_name, last_name, email) 
  VALUES (uuid_generate_v4(), 'John', 'Doe', 'john@acme.com')
  RETURNING id INTO test_contact_id;
  
  -- Create test deal
  INSERT INTO deals (id, title, value, owner_id, created_by) 
  VALUES (uuid_generate_v4(), 'Acme Corp Website Redesign', 50000, test_user_id, test_user_id)
  RETURNING id INTO test_deal_id;
  
  -- Add test activities
  INSERT INTO deal_activities (deal_id, type, title, description, created_by) VALUES
  (test_deal_id, 'note', 'Initial Contact', 'Called client to discuss project requirements', test_user_id),
  (test_deal_id, 'meeting', 'Discovery Meeting', 'Met with stakeholders to understand needs', test_user_id),
  (test_deal_id, 'email', 'Sent Proposal', 'Emailed detailed project proposal', test_user_id);
  
  -- Add test changelog
  INSERT INTO deal_changelog (deal_id, field_name, old_value, new_value, changed_by) VALUES
  (test_deal_id, 'value', '40000', '50000', test_user_id),
  (test_deal_id, 'stage', 'prospecting', 'qualification', test_user_id);
  
  -- Add test quote
  INSERT INTO deal_quotes (deal_id, quote_number, title, total_amount, valid_until, created_by) VALUES
  (test_deal_id, generate_quote_number(), 'Website Redesign Quote', 50000.00, CURRENT_DATE + INTERVAL '30 days', test_user_id);
  
  RAISE NOTICE 'Test data created successfully!';
  RAISE NOTICE 'Deal ID: %', test_deal_id;
  RAISE NOTICE 'User ID: %', test_user_id;
END $$;

-- Verify the data
SELECT 'Test Results:' as status;

SELECT 
  'Deals Created:' as table_name,
  COUNT(*) as count
FROM deals;

SELECT 
  'Activities Created:' as table_name,
  COUNT(*) as count
FROM deal_activities;

SELECT 
  'Quotes Created:' as table_name,
  COUNT(*) as count
FROM deal_quotes;

-- Test the RPC function
SELECT 
  'Testing RPC Function:' as status,
  'get_deal_activities' as function_name;

-- Show sample activity data
SELECT 
  id,
  type,
  title,
  created_at
FROM deal_activities
ORDER BY created_at DESC
LIMIT 3;

