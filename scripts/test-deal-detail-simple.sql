-- Simple test script that works with our Deal Detail tables only
-- Run this in Supabase Studio SQL Editor

-- First, let's create a simple test deal directly
DO $$
DECLARE
  test_deal_id UUID := uuid_generate_v4();
  test_user_id UUID := uuid_generate_v4();
BEGIN
  -- Create a test deal (minimal version)
  INSERT INTO deals (id, title, value, owner_id, created_by) 
  VALUES (test_deal_id, 'Test Website Project', 25000, test_user_id, test_user_id);
  
  -- Add test activities
  INSERT INTO deal_activities (deal_id, type, title, description, created_by) VALUES
  (test_deal_id, 'note', 'Initial Contact', 'Made first contact with the client', test_user_id),
  (test_deal_id, 'meeting', 'Discovery Call', 'Had a 30-minute discovery call to understand requirements', test_user_id),
  (test_deal_id, 'email', 'Proposal Sent', 'Sent detailed project proposal via email', test_user_id),
  (test_deal_id, 'call', 'Follow-up Call', 'Called to discuss the proposal and answer questions', test_user_id);
  
  -- Add test changelog entries
  INSERT INTO deal_changelog (deal_id, field_name, old_value, new_value, changed_by) VALUES
  (test_deal_id, 'value', '"20000"', '"25000"', test_user_id),
  (test_deal_id, 'stage', '"prospecting"', '"qualification"', test_user_id),
  (test_deal_id, 'probability', '"25"', '"50"', test_user_id);
  
  -- Add test files
  INSERT INTO deal_files (deal_id, name, type, size, url, category, description, uploaded_by) VALUES
  (test_deal_id, 'project-requirements.pdf', 'application/pdf', 245760, 'https://example.com/files/requirements.pdf', 'documents', 'Initial project requirements document', test_user_id),
  (test_deal_id, 'company-logo.png', 'image/png', 52480, 'https://example.com/files/logo.png', 'images', 'Client company logo for branding', test_user_id);
  
  -- Add test quote
  INSERT INTO deal_quotes (deal_id, quote_number, title, description, total_amount, valid_until, created_by) VALUES
  (test_deal_id, generate_quote_number(), 'Website Development Quote', 'Complete website redesign and development', 25000.00, CURRENT_DATE + INTERVAL '30 days', test_user_id);
  
  RAISE NOTICE 'Test data created successfully!';
  RAISE NOTICE 'Test Deal ID: %', test_deal_id;
  RAISE NOTICE 'Test User ID: %', test_user_id;
END $$;

-- Verify the test data was created
SELECT 'Verification Results:' as status;

SELECT 
  'Deals:' as item,
  COUNT(*) as count
FROM deals;

SELECT 
  'Activities:' as item,
  COUNT(*) as count
FROM deal_activities;

SELECT 
  'Files:' as item,
  COUNT(*) as count
FROM deal_files;

SELECT 
  'Changelog:' as item,
  COUNT(*) as count
FROM deal_changelog;

SELECT 
  'Quotes:' as item,
  COUNT(*) as count
FROM deal_quotes;

-- Show some sample data
SELECT 
  'Sample Activities:' as section;

SELECT 
  type,
  title,
  description,
  created_at::date as date_created
FROM deal_activities
ORDER BY created_at DESC
LIMIT 3;

SELECT 
  'Sample Quote Numbers:' as section;

SELECT 
  quote_number,
  title,
  total_amount
FROM deal_quotes
ORDER BY created_at DESC
LIMIT 2;


