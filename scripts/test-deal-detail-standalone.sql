-- Standalone test for Deal Detail tables only
-- This doesn't depend on the deals table structure at all

DO $$
DECLARE
  test_deal_id UUID := uuid_generate_v4(); -- Just create a test UUID
  test_user_id UUID := uuid_generate_v4();
BEGIN
  RAISE NOTICE 'Creating test data for Deal Detail System...';
  RAISE NOTICE 'Test Deal ID: %', test_deal_id;
  RAISE NOTICE 'Test User ID: %', test_user_id;
  
  -- Test deal_activities table
  INSERT INTO deal_activities (deal_id, type, title, description, created_by) VALUES
  (test_deal_id, 'note', '📝 Initial Contact', 'Made first contact with potential client', test_user_id),
  (test_deal_id, 'call', '📞 Discovery Call', 'Had 30-min call to understand requirements', test_user_id),
  (test_deal_id, 'email', '📧 Proposal Sent', 'Sent detailed project proposal via email', test_user_id),
  (test_deal_id, 'meeting', '🤝 Follow-up Meeting', 'Met to discuss proposal and next steps', test_user_id);
  
  -- Test deal_files table
  INSERT INTO deal_files (deal_id, name, type, size, url, category, description, uploaded_by) VALUES
  (test_deal_id, 'project-brief.pdf', 'application/pdf', 245760, 'https://example.com/brief.pdf', 'documents', 'Project requirements and brief', test_user_id),
  (test_deal_id, 'company-logo.png', 'image/png', 52480, 'https://example.com/logo.png', 'images', 'Client company logo for reference', test_user_id),
  (test_deal_id, 'contract-draft.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 89123, 'https://example.com/contract.docx', 'legal', 'Initial contract draft', test_user_id);
  
  -- Test deal_changelog table
  INSERT INTO deal_changelog (deal_id, field_name, old_value, new_value, changed_by) VALUES
  (test_deal_id, 'value', '"15000"', '"25000"', test_user_id),
  (test_deal_id, 'stage', '"lead"', '"qualified"', test_user_id),
  (test_deal_id, 'probability', '"25"', '"60"', test_user_id),
  (test_deal_id, 'priority', '"medium"', '"high"', test_user_id);
  
  -- Test deal_quotes table
  INSERT INTO deal_quotes (deal_id, quote_number, title, description, subtotal, tax_amount, total_amount, valid_until, terms_conditions, created_by) VALUES
  (test_deal_id, generate_quote_number(), 'Website Development Quote', 'Complete website redesign and development package', 22727.27, 2272.73, 25000.00, CURRENT_DATE + INTERVAL '30 days', 'Payment terms: 50% upfront, 50% on completion', test_user_id);
  
  -- Test deal_quote_items table
  INSERT INTO deal_quote_items (quote_id, product_name, description, quantity, unit_price, line_total, sort_order) 
  SELECT 
    dq.id,
    item.product_name,
    item.description,
    item.quantity,
    item.unit_price,
    item.line_total,
    item.sort_order
  FROM deal_quotes dq,
  (VALUES 
    ('Website Design', 'Custom responsive website design', 1, 8000.00, 8000.00, 1),
    ('Development', 'Frontend and backend development', 1, 12000.00, 12000.00, 2),
    ('Content Migration', 'Migration of existing content', 1, 2000.00, 2000.00, 3),
    ('SEO Setup', 'Basic SEO optimization setup', 1, 727.27, 727.27, 4)
  ) AS item(product_name, description, quantity, unit_price, line_total, sort_order)
  WHERE dq.deal_id = test_deal_id;
  
  RAISE NOTICE 'Test data created successfully!';
  
END $$;

-- Verification queries
SELECT '🎯 Deal Detail System Test Results' as status;

-- Count records in each table
SELECT 
  '📊 Summary' as section,
  (SELECT COUNT(*) FROM deal_activities) as activities,
  (SELECT COUNT(*) FROM deal_files) as files,
  (SELECT COUNT(*) FROM deal_changelog) as changelog_entries,
  (SELECT COUNT(*) FROM deal_quotes) as quotes,
  (SELECT COUNT(*) FROM deal_quote_items) as quote_items;

-- Show sample activities
SELECT '📝 Sample Activities' as section;
SELECT 
  type as "Type",
  title as "Title",
  LEFT(description, 40) || '...' as "Description",
  created_at::date as "Date"
FROM deal_activities
ORDER BY created_at DESC
LIMIT 5;

-- Show quote info
SELECT '💰 Quote Information' as section;
SELECT 
  quote_number as "Quote #",
  title as "Title",
  total_amount as "Total",
  valid_until as "Valid Until"
FROM deal_quotes
ORDER BY created_at DESC;

-- Show quote items
SELECT '📋 Quote Items' as section;
SELECT 
  qi.product_name as "Product",
  qi.quantity as "Qty",
  qi.unit_price as "Unit Price",
  qi.line_total as "Total"
FROM deal_quote_items qi
JOIN deal_quotes q ON q.id = qi.quote_id
ORDER BY qi.sort_order;

SELECT '✅ Test completed! You can now test the React hooks.' as final_message;

