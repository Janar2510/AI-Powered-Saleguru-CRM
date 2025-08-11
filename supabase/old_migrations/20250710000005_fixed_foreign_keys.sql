-- Fixed Foreign Key CRM Seed Data Migration
-- This script safely inserts realistic sample data for all CRM tables
-- Properly handles foreign key relationships with identity columns

BEGIN;

-- ============================================================================
-- 1. INSERT SAMPLE USERS (let database generate IDs)
-- ============================================================================

INSERT INTO users (uuid, email, name, role, points, badges, created_at, updated_at) VALUES
(gen_random_uuid(), 'admin@saleguru.com', 'Admin User', 'admin', 1500, ARRAY['Top Performer', 'Team Leader'], NOW(), NOW()),
(gen_random_uuid(), 'manager@saleguru.com', 'Sales Manager', 'manager', 1200, ARRAY['Team Leader'], NOW(), NOW()),
(gen_random_uuid(), 'john@saleguru.com', 'John Smith', 'user', 850, ARRAY['Rising Star'], NOW(), NOW()),
(gen_random_uuid(), 'sarah@saleguru.com', 'Sarah Johnson', 'user', 920, ARRAY['Top Performer'], NOW(), NOW()),
(gen_random_uuid(), 'mike@saleguru.com', 'Mike Wilson', 'user', 650, ARRAY['Newcomer'], NOW(), NOW());

-- ============================================================================
-- 2. INSERT SAMPLE COMPANIES (let database generate IDs)
-- ============================================================================

INSERT INTO companies (uuid, name, website, industry, size, description, phone, status, owner_id, created_at, updated_at) VALUES
(gen_random_uuid(), 'TechCorp Solutions', 'https://techcorp.com', 'Technology', 'Mid-Market', 'Leading software solutions provider', '+1-555-0101', 'active', (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Global Industries', 'https://globalind.com', 'Manufacturing', 'Enterprise', 'International manufacturing company', '+1-555-0102', 'active', (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'StartupXYZ', 'https://startupxyz.com', 'Technology', 'Startup', 'Innovative startup in AI space', '+1-555-0103', 'prospect', (SELECT id FROM users WHERE email = 'john@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Retail Plus', 'https://retailplus.com', 'Retail', 'SMB', 'Growing retail chain', '+1-555-0104', 'active', (SELECT id FROM users WHERE email = 'sarah@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Healthcare Systems', 'https://healthcare-sys.com', 'Healthcare', 'Mid-Market', 'Healthcare technology solutions', '+1-555-0105', 'active', (SELECT id FROM users WHERE email = 'mike@saleguru.com'), NOW(), NOW());

-- ============================================================================
-- 3. INSERT SAMPLE CONTACTS (using subqueries for foreign keys)
-- ============================================================================

INSERT INTO contacts (uuid, first_name, last_name, email, phone, title, company_id, company_name, lead_score, status, source, owner_id, created_at, updated_at) VALUES
(gen_random_uuid(), 'David', 'Brown', 'david.brown@techcorp.com', '+1-555-0201', 'CTO', (SELECT id FROM companies WHERE name = 'TechCorp Solutions'), 'TechCorp Solutions', 85, 'customer', 'Website', (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Lisa', 'Garcia', 'lisa.garcia@globalind.com', '+1-555-0202', 'VP Sales', (SELECT id FROM companies WHERE name = 'Global Industries'), 'Global Industries', 92, 'customer', 'Referral', (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Alex', 'Chen', 'alex.chen@startupxyz.com', '+1-555-0203', 'Founder', (SELECT id FROM companies WHERE name = 'StartupXYZ'), 'StartupXYZ', 78, 'lead', 'LinkedIn', (SELECT id FROM users WHERE email = 'john@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Emma', 'Davis', 'emma.davis@retailplus.com', '+1-555-0204', 'Operations Manager', (SELECT id FROM companies WHERE name = 'Retail Plus'), 'Retail Plus', 88, 'customer', 'Trade Show', (SELECT id FROM users WHERE email = 'sarah@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Robert', 'Taylor', 'robert.taylor@healthcare-sys.com', '+1-555-0205', 'IT Director', (SELECT id FROM companies WHERE name = 'Healthcare Systems'), 'Healthcare Systems', 95, 'customer', 'Cold Call', (SELECT id FROM users WHERE email = 'mike@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Maria', 'Rodriguez', 'maria.rodriguez@techcorp.com', '+1-555-0206', 'Sales Manager', (SELECT id FROM companies WHERE name = 'TechCorp Solutions'), 'TechCorp Solutions', 82, 'customer', 'Website', (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'James', 'Wilson', 'james.wilson@globalind.com', '+1-555-0207', 'Procurement Manager', (SELECT id FROM companies WHERE name = 'Global Industries'), 'Global Industries', 79, 'lead', 'Email Campaign', (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW());

-- ============================================================================
-- 4. INSERT SAMPLE LEADS (using subqueries for foreign keys)
-- ============================================================================

INSERT INTO leads (uuid, first_name, last_name, email, phone, company, title, source, status, lead_score, ai_insight, owner_id, created_at, updated_at) VALUES
(gen_random_uuid(), 'Jennifer', 'Adams', 'jennifer.adams@newtech.com', '+1-555-0301', 'NewTech Solutions', 'CEO', 'Website', 'qualified', 87, 'High intent based on website activity and company size', (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Michael', 'Thompson', 'michael.thompson@innovate.com', '+1-555-0302', 'Innovate Labs', 'CTO', 'LinkedIn', 'contacted', 75, 'Shows interest in AI solutions, follow up recommended', (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Amanda', 'Lee', 'amanda.lee@futurecorp.com', '+1-555-0303', 'Future Corp', 'VP Technology', 'Trade Show', 'new', 68, 'Early stage company, needs nurturing', (SELECT id FROM users WHERE email = 'john@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Chris', 'Martinez', 'chris.martinez@digital.com', '+1-555-0304', 'Digital Dynamics', 'Founder', 'Email Campaign', 'qualified', 91, 'High budget, ready for demo', (SELECT id FROM users WHERE email = 'sarah@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Rachel', 'Green', 'rachel.green@smarttech.com', '+1-555-0305', 'SmartTech', 'Operations Director', 'Referral', 'contacted', 83, 'Good fit for enterprise solution', (SELECT id FROM users WHERE email = 'mike@saleguru.com'), NOW(), NOW());

-- ============================================================================
-- 5. INSERT SAMPLE PIPELINES (let database generate IDs)
-- ============================================================================

INSERT INTO pipelines (uuid, name, is_default, created_at, updated_at) VALUES
(gen_random_uuid(), 'Default Sales Pipeline', true, NOW(), NOW()),
(gen_random_uuid(), 'Enterprise Pipeline', false, NOW(), NOW()),
(gen_random_uuid(), 'Startup Pipeline', false, NOW(), NOW());

-- ============================================================================
-- 6. INSERT SAMPLE STAGES (using subqueries for foreign keys)
-- ============================================================================

INSERT INTO stages (uuid, name, sort_order, color, pipeline_id, created_at, updated_at) VALUES
-- Default Pipeline Stages
(gen_random_uuid(), 'Lead', 1, '#3B82F6', (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Qualified', 2, '#10B981', (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Proposal', 3, '#F59E0B', (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Negotiation', 4, '#EF4444', (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Closed Won', 5, '#059669', (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Closed Lost', 6, '#6B7280', (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline'), NOW(), NOW()),

-- Enterprise Pipeline Stages
(gen_random_uuid(), 'Discovery', 1, '#8B5CF6', (SELECT id FROM pipelines WHERE name = 'Enterprise Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Evaluation', 2, '#06B6D4', (SELECT id FROM pipelines WHERE name = 'Enterprise Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Pilot', 3, '#F97316', (SELECT id FROM pipelines WHERE name = 'Enterprise Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Contract', 4, '#EC4899', (SELECT id FROM pipelines WHERE name = 'Enterprise Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Implementation', 5, '#84CC16', (SELECT id FROM pipelines WHERE name = 'Enterprise Pipeline'), NOW(), NOW()),

-- Startup Pipeline Stages
(gen_random_uuid(), 'Initial Contact', 1, '#6366F1', (SELECT id FROM pipelines WHERE name = 'Startup Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Demo', 2, '#14B8A6', (SELECT id FROM pipelines WHERE name = 'Startup Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Trial', 3, '#F43F5E', (SELECT id FROM pipelines WHERE name = 'Startup Pipeline'), NOW(), NOW()),
(gen_random_uuid(), 'Purchase', 4, '#22C55E', (SELECT id FROM pipelines WHERE name = 'Startup Pipeline'), NOW(), NOW());

-- ============================================================================
-- 7. INSERT SAMPLE DEALS (using subqueries for foreign keys)
-- ============================================================================

INSERT INTO deals (uuid, title, description, value, stage_id, probability, expected_close_date, company_id, contact_id, lead_id, owner_id, created_at, updated_at) VALUES
(gen_random_uuid(), 'Enterprise Software License', 'Multi-year enterprise software license for TechCorp', 150000.00, (SELECT id FROM stages WHERE name = 'Closed Won' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 100, '2024-01-15', (SELECT id FROM companies WHERE name = 'TechCorp Solutions'), (SELECT id FROM contacts WHERE email = 'david.brown@techcorp.com'), NULL, (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Manufacturing System Upgrade', 'Complete system upgrade for Global Industries', 250000.00, (SELECT id FROM stages WHERE name = 'Negotiation' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 85, '2024-02-28', (SELECT id FROM companies WHERE name = 'Global Industries'), (SELECT id FROM contacts WHERE email = 'lisa.garcia@globalind.com'), NULL, (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Startup AI Platform', 'AI platform implementation for StartupXYZ', 75000.00, (SELECT id FROM stages WHERE name = 'Proposal' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 70, '2024-03-15', (SELECT id FROM companies WHERE name = 'StartupXYZ'), (SELECT id FROM contacts WHERE email = 'alex.chen@startupxyz.com'), (SELECT id FROM leads WHERE email = 'alex.chen@startupxyz.com'), (SELECT id FROM users WHERE email = 'john@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Retail POS System', 'Point of sale system for Retail Plus chain', 45000.00, (SELECT id FROM stages WHERE name = 'Qualified' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 60, '2024-04-30', (SELECT id FROM companies WHERE name = 'Retail Plus'), (SELECT id FROM contacts WHERE email = 'emma.davis@retailplus.com'), NULL, (SELECT id FROM users WHERE email = 'sarah@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Healthcare Analytics', 'Healthcare analytics solution for Healthcare Systems', 180000.00, (SELECT id FROM stages WHERE name = 'Lead' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 40, '2024-05-15', (SELECT id FROM companies WHERE name = 'Healthcare Systems'), (SELECT id FROM contacts WHERE email = 'robert.taylor@healthcare-sys.com'), NULL, (SELECT id FROM users WHERE email = 'mike@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Cloud Migration Project', 'Cloud migration services for TechCorp', 95000.00, (SELECT id FROM stages WHERE name = 'Proposal' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 75, '2024-06-30', (SELECT id FROM companies WHERE name = 'TechCorp Solutions'), (SELECT id FROM contacts WHERE email = 'maria.rodriguez@techcorp.com'), NULL, (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Supply Chain Optimization', 'Supply chain optimization for Global Industries', 120000.00, (SELECT id FROM stages WHERE name = 'Qualified' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 55, '2024-07-15', (SELECT id FROM companies WHERE name = 'Global Industries'), (SELECT id FROM contacts WHERE email = 'james.wilson@globalind.com'), (SELECT id FROM leads WHERE email = 'michael.thompson@innovate.com'), (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Digital Transformation', 'Digital transformation initiative for NewTech', 200000.00, (SELECT id FROM stages WHERE name = 'Lead' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 30, '2024-08-30', NULL, NULL, (SELECT id FROM leads WHERE email = 'jennifer.adams@newtech.com'), (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'AI Integration Services', 'AI integration for Innovate Labs', 85000.00, (SELECT id FROM stages WHERE name = 'Qualified' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 65, '2024-09-15', NULL, NULL, (SELECT id FROM leads WHERE email = 'michael.thompson@innovate.com'), (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'SaaS Platform License', 'SaaS platform license for Digital Dynamics', 65000.00, (SELECT id FROM stages WHERE name = 'Proposal' AND pipeline_id = (SELECT id FROM pipelines WHERE name = 'Default Sales Pipeline')), 80, '2024-10-30', NULL, NULL, (SELECT id FROM leads WHERE email = 'chris.martinez@digital.com'), (SELECT id FROM users WHERE email = 'sarah@saleguru.com'), NOW(), NOW());

-- ============================================================================
-- 8. INSERT SAMPLE TASKS (using subqueries for foreign keys)
-- ============================================================================

INSERT INTO tasks (uuid, title, description, due_date, due_time, priority, status, type, deal_id, contact_id, lead_id, company_id, assigned_to, created_by, created_at, updated_at) VALUES
(gen_random_uuid(), 'Follow up with TechCorp', 'Schedule follow-up call to discuss implementation timeline', '2024-01-20', '14:00:00', 'high', 'pending', 'call', (SELECT id FROM deals WHERE title = 'Enterprise Software License'), (SELECT id FROM contacts WHERE email = 'david.brown@techcorp.com'), NULL, (SELECT id FROM companies WHERE name = 'TechCorp Solutions'), (SELECT id FROM users WHERE email = 'admin@saleguru.com'), (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Prepare proposal for Global Industries', 'Create detailed proposal for manufacturing system upgrade', '2024-01-25', '16:00:00', 'urgent', 'in_progress', 'task', (SELECT id FROM deals WHERE title = 'Manufacturing System Upgrade'), (SELECT id FROM contacts WHERE email = 'lisa.garcia@globalind.com'), NULL, (SELECT id FROM companies WHERE name = 'Global Industries'), (SELECT id FROM users WHERE email = 'manager@saleguru.com'), (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Demo for StartupXYZ', 'Conduct product demo for AI platform', '2024-01-22', '10:00:00', 'medium', 'pending', 'meeting', (SELECT id FROM deals WHERE title = 'Startup AI Platform'), (SELECT id FROM contacts WHERE email = 'alex.chen@startupxyz.com'), (SELECT id FROM leads WHERE email = 'alex.chen@startupxyz.com'), (SELECT id FROM companies WHERE name = 'StartupXYZ'), (SELECT id FROM users WHERE email = 'john@saleguru.com'), (SELECT id FROM users WHERE email = 'john@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Send contract to Retail Plus', 'Send final contract for POS system', '2024-01-23', '11:00:00', 'high', 'completed', 'email', (SELECT id FROM deals WHERE title = 'Retail POS System'), (SELECT id FROM contacts WHERE email = 'emma.davis@retailplus.com'), NULL, (SELECT id FROM companies WHERE name = 'Retail Plus'), (SELECT id FROM users WHERE email = 'sarah@saleguru.com'), (SELECT id FROM users WHERE email = 'sarah@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Research Healthcare Systems', 'Research current systems and requirements', '2024-01-26', '15:00:00', 'medium', 'pending', 'task', (SELECT id FROM deals WHERE title = 'Healthcare Analytics'), (SELECT id FROM contacts WHERE email = 'robert.taylor@healthcare-sys.com'), NULL, (SELECT id FROM companies WHERE name = 'Healthcare Systems'), (SELECT id FROM users WHERE email = 'mike@saleguru.com'), (SELECT id FROM users WHERE email = 'mike@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Call Jennifer Adams', 'Follow up on NewTech opportunity', '2024-01-21', '13:00:00', 'high', 'pending', 'call', NULL, NULL, (SELECT id FROM leads WHERE email = 'jennifer.adams@newtech.com'), NULL, (SELECT id FROM users WHERE email = 'admin@saleguru.com'), (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Send proposal to Michael Thompson', 'Send AI solution proposal to Innovate Labs', '2024-01-24', '12:00:00', 'medium', 'pending', 'email', NULL, NULL, (SELECT id FROM leads WHERE email = 'michael.thompson@innovate.com'), NULL, (SELECT id FROM users WHERE email = 'manager@saleguru.com'), (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Schedule demo with Digital Dynamics', 'Arrange product demo for Chris Martinez', '2024-01-27', '14:00:00', 'high', 'pending', 'meeting', NULL, NULL, (SELECT id FROM leads WHERE email = 'chris.martinez@digital.com'), NULL, (SELECT id FROM users WHERE email = 'sarah@saleguru.com'), (SELECT id FROM users WHERE email = 'sarah@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Review TechCorp requirements', 'Review and document TechCorp requirements', '2024-01-28', '16:00:00', 'medium', 'in_progress', 'task', (SELECT id FROM deals WHERE title = 'Cloud Migration Project'), (SELECT id FROM contacts WHERE email = 'maria.rodriguez@techcorp.com'), NULL, (SELECT id FROM companies WHERE name = 'TechCorp Solutions'), (SELECT id FROM users WHERE email = 'admin@saleguru.com'), (SELECT id FROM users WHERE email = 'admin@saleguru.com'), NOW(), NOW()),
(gen_random_uuid(), 'Prepare presentation for Global Industries', 'Create presentation for supply chain optimization', '2024-01-29', '10:00:00', 'urgent', 'pending', 'task', (SELECT id FROM deals WHERE title = 'Supply Chain Optimization'), (SELECT id FROM contacts WHERE email = 'james.wilson@globalind.com'), (SELECT id FROM leads WHERE email = 'michael.thompson@innovate.com'), (SELECT id FROM companies WHERE name = 'Global Industries'), (SELECT id FROM users WHERE email = 'manager@saleguru.com'), (SELECT id FROM users WHERE email = 'manager@saleguru.com'), NOW(), NOW());

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if data was inserted successfully
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Companies', COUNT(*) FROM companies
UNION ALL
SELECT 'Contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'Leads', COUNT(*) FROM leads
UNION ALL
SELECT 'Pipelines', COUNT(*) FROM pipelines
UNION ALL
SELECT 'Stages', COUNT(*) FROM stages
UNION ALL
SELECT 'Deals', COUNT(*) FROM deals
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- 
-- Your CRM now has realistic sample data:
-- ✅ Users, Companies, Contacts, Leads, Pipelines, Stages, Deals, Tasks
-- ✅ All foreign key relationships are properly established
-- ✅ Your dashboard, Kanban board, and all features should now work!
-- ============================================================================ 