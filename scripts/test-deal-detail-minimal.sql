-- Minimal test script that works with any deals table structure
-- This only tests our Deal Detail tables, not the base deals table

DO $$
DECLARE
  test_deal_id UUID;
  test_user_id UUID := uuid_generate_v4();
  existing_deal_count INTEGER;
BEGIN
  -- Check if there are any existing deals
  SELECT COUNT(*) INTO existing_deal_count FROM deals;
  
  IF existing_deal_count > 0 THEN
    -- Use an existing deal
    SELECT id INTO test_deal_id FROM deals LIMIT 1;
    RAISE NOTICE 'Using existing deal: %', test_deal_id;
  ELSE
    -- Create a minimal deal that should work with any deals table structure
    -- Only using columns that are likely to exist
    test_deal_id := uuid_generate_v4();
    
    -- Try the most basic insert possible
    INSERT INTO deals (id, title, value) 
    VALUES (test_deal_id, 'Test Website Project', 25000);
    
    RAISE NOTICE 'Created new test deal: %', test_deal_id;
  END IF;
  
  -- Now test our Deal Detail tables (these should work regardless)
  
  -- Add test activities
  INSERT INTO deal_activities (deal_id, type, title, description, created_by) VALUES
  (test_deal_id, 'note', 'Initial Contact', 'Made first contact with the client', test_user_id),
  (test_deal_id, 'meeting', 'Discovery Call', 'Had a 30-minute discovery call', test_user_id),
  (test_deal_id, 'email', 'Proposal Sent', 'Sent detailed project proposal', test_user_id);
  
  -- Add test files
  INSERT INTO deal_files (deal_id, name, type, size, url, category, description, uploaded_by) VALUES
  (test_deal_id, 'requirements.pdf', 'application/pdf', 245760, 'https://example.com/req.pdf', 'documents', 'Requirements document', test_user_id),
  (test_deal_id, 'logo.png', 'image/png', 52480, 'https://example.com/logo.png', 'images', 'Company logo', test_user_id);
  
  -- Add test changelog
  INSERT INTO deal_changelog (deal_id, field_name, old_value, new_value, changed_by) VALUES
  (test_deal_id, 'value', '"20000"', '"25000"', test_user_id),
  (test_deal_id, 'stage', '"prospecting"', '"qualification"', test_user_id);
  
  -- Add test quote
  INSERT INTO deal_quotes (deal_id, quote_number, title, description, total_amount, valid_until, created_by) VALUES
  (test_deal_id, generate_quote_number(), 'Website Development Quote', 'Complete website redesign', 25000.00, CURRENT_DATE + INTERVAL '30 days', test_user_id);
  
  RAISE NOTICE 'Deal Detail test data created successfully!';
  RAISE NOTICE 'Deal ID: %', test_deal_id;
  RAISE NOTICE 'User ID: %', test_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating test data: %', SQLERRM;
    RAISE NOTICE 'Trying alternative approach...';
    
    -- If deals insert fails, at least try to test with a UUID
    test_deal_id := uuid_generate_v4();
    RAISE NOTICE 'Using mock deal ID for testing: %', test_deal_id;
END $$;

-- Verify what was created
SELECT 'Verification:' as section;

SELECT 
  'Deal Activities' as table_name,
  COUNT(*) as count,
  MAX(created_at)::date as latest_entry
FROM deal_activities;

SELECT 
  'Deal Files' as table_name,
  COUNT(*) as count,
  MAX(uploaded_at)::date as latest_entry
FROM deal_files;

SELECT 
  'Deal Changelog' as table_name,
  COUNT(*) as count,
  MAX(changed_at)::date as latest_entry
FROM deal_changelog;

SELECT 
  'Deal Quotes' as table_name,
  COUNT(*) as count,
  MAX(created_at)::date as latest_entry
FROM deal_quotes;

-- Show sample data
SELECT 'Sample Activities:' as section;

SELECT 
  type,
  title,
  LEFT(description, 50) as description_preview
FROM deal_activities
ORDER BY created_at DESC
LIMIT 3;

