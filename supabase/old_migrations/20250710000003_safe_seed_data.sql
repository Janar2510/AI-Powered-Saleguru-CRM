-- Safe CRM Seed Data Migration
-- This script safely inserts realistic sample data for all CRM tables
-- Uses ON CONFLICT DO NOTHING to avoid errors if data already exists

BEGIN;

-- ============================================================================
-- 1. INSERT SAMPLE USERS (if not exists)
-- ============================================================================

INSERT INTO users (id, uuid, email, name, role, points, badges, created_at, updated_at) VALUES
(1, gen_random_uuid(), 'admin@saleguru.com', 'Admin User', 'admin', 1500, ARRAY['Top Performer', 'Team Leader'], NOW(), NOW()),
(2, gen_random_uuid(), 'manager@saleguru.com', 'Sales Manager', 'manager', 1200, ARRAY['Team Leader'], NOW(), NOW()),
(3, gen_random_uuid(), 'john@saleguru.com', 'John Smith', 'user', 850, ARRAY['Rising Star'], NOW(), NOW()),
(4, gen_random_uuid(), 'sarah@saleguru.com', 'Sarah Johnson', 'user', 920, ARRAY['Top Performer'], NOW(), NOW()),
(5, gen_random_uuid(), 'mike@saleguru.com', 'Mike Wilson', 'user', 650, ARRAY['Newcomer'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. INSERT SAMPLE COMPANIES (if not exists)
-- ============================================================================

INSERT INTO companies (id, uuid, name, website, industry, size, description, phone, status, owner_id, created_at, updated_at) VALUES
(1, gen_random_uuid(), 'TechCorp Solutions', 'https://techcorp.com', 'Technology', 'Mid-Market', 'Leading software solutions provider', '+1-555-0101', 'active', 1, NOW(), NOW()),
(2, gen_random_uuid(), 'Global Industries', 'https://globalind.com', 'Manufacturing', 'Enterprise', 'International manufacturing company', '+1-555-0102', 'active', 2, NOW(), NOW()),
(3, gen_random_uuid(), 'StartupXYZ', 'https://startupxyz.com', 'Technology', 'Startup', 'Innovative startup in AI space', '+1-555-0103', 'prospect', 3, NOW(), NOW()),
(4, gen_random_uuid(), 'Retail Plus', 'https://retailplus.com', 'Retail', 'SMB', 'Growing retail chain', '+1-555-0104', 'active', 4, NOW(), NOW()),
(5, gen_random_uuid(), 'Healthcare Systems', 'https://healthcare-sys.com', 'Healthcare', 'Mid-Market', 'Healthcare technology solutions', '+1-555-0105', 'active', 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. INSERT SAMPLE CONTACTS (if not exists)
-- ============================================================================

INSERT INTO contacts (id, uuid, first_name, last_name, email, phone, title, company_id, company_name, lead_score, status, source, owner_id, created_at, updated_at) VALUES
(1, gen_random_uuid(), 'David', 'Brown', 'david.brown@techcorp.com', '+1-555-0201', 'CTO', 1, 'TechCorp Solutions', 85, 'customer', 'Website', 1, NOW(), NOW()),
(2, gen_random_uuid(), 'Lisa', 'Garcia', 'lisa.garcia@globalind.com', '+1-555-0202', 'VP Sales', 2, 'Global Industries', 92, 'customer', 'Referral', 2, NOW(), NOW()),
(3, gen_random_uuid(), 'Alex', 'Chen', 'alex.chen@startupxyz.com', '+1-555-0203', 'Founder', 3, 'StartupXYZ', 78, 'lead', 'LinkedIn', 3, NOW(), NOW()),
(4, gen_random_uuid(), 'Emma', 'Davis', 'emma.davis@retailplus.com', '+1-555-0204', 'Operations Manager', 4, 'Retail Plus', 88, 'customer', 'Trade Show', 4, NOW(), NOW()),
(5, gen_random_uuid(), 'Robert', 'Taylor', 'robert.taylor@healthcare-sys.com', '+1-555-0205', 'IT Director', 5, 'Healthcare Systems', 95, 'customer', 'Cold Call', 5, NOW(), NOW()),
(6, gen_random_uuid(), 'Maria', 'Rodriguez', 'maria.rodriguez@techcorp.com', '+1-555-0206', 'Sales Manager', 1, 'TechCorp Solutions', 82, 'customer', 'Website', 1, NOW(), NOW()),
(7, gen_random_uuid(), 'James', 'Wilson', 'james.wilson@globalind.com', '+1-555-0207', 'Procurement Manager', 2, 'Global Industries', 79, 'lead', 'Email Campaign', 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. INSERT SAMPLE LEADS (if not exists)
-- ============================================================================

INSERT INTO leads (id, uuid, first_name, last_name, email, phone, company, title, source, status, lead_score, ai_insight, owner_id, created_at, updated_at) VALUES
(1, gen_random_uuid(), 'Jennifer', 'Adams', 'jennifer.adams@newtech.com', '+1-555-0301', 'NewTech Solutions', 'CEO', 'Website', 'qualified', 87, 'High intent based on website activity and company size', 1, NOW(), NOW()),
(2, gen_random_uuid(), 'Michael', 'Thompson', 'michael.thompson@innovate.com', '+1-555-0302', 'Innovate Labs', 'CTO', 'LinkedIn', 'contacted', 75, 'Shows interest in AI solutions, follow up recommended', 2, NOW(), NOW()),
(3, gen_random_uuid(), 'Amanda', 'Lee', 'amanda.lee@futurecorp.com', '+1-555-0303', 'Future Corp', 'VP Technology', 'Trade Show', 'new', 68, 'Early stage company, needs nurturing', 3, NOW(), NOW()),
(4, gen_random_uuid(), 'Chris', 'Martinez', 'chris.martinez@digital.com', '+1-555-0304', 'Digital Dynamics', 'Founder', 'Email Campaign', 'qualified', 91, 'High budget, ready for demo', 4, NOW(), NOW()),
(5, gen_random_uuid(), 'Rachel', 'Green', 'rachel.green@smarttech.com', '+1-555-0305', 'SmartTech', 'Operations Director', 'Referral', 'contacted', 83, 'Good fit for enterprise solution', 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. INSERT SAMPLE PIPELINES (if not exists)
-- ============================================================================

INSERT INTO pipelines (id, uuid, name, is_default, created_at, updated_at) VALUES
(1, gen_random_uuid(), 'Default Sales Pipeline', true, NOW(), NOW()),
(2, gen_random_uuid(), 'Enterprise Pipeline', false, NOW(), NOW()),
(3, gen_random_uuid(), 'Startup Pipeline', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. INSERT SAMPLE STAGES (if not exists)
-- ============================================================================

INSERT INTO stages (id, uuid, name, sort_order, color, pipeline_id, created_at, updated_at) VALUES
-- Default Pipeline Stages
(1, gen_random_uuid(), 'Lead', 1, '#3B82F6', 1, NOW(), NOW()),
(2, gen_random_uuid(), 'Qualified', 2, '#10B981', 1, NOW(), NOW()),
(3, gen_random_uuid(), 'Proposal', 3, '#F59E0B', 1, NOW(), NOW()),
(4, gen_random_uuid(), 'Negotiation', 4, '#EF4444', 1, NOW(), NOW()),
(5, gen_random_uuid(), 'Closed Won', 5, '#059669', 1, NOW(), NOW()),
(6, gen_random_uuid(), 'Closed Lost', 6, '#6B7280', 1, NOW(), NOW()),

-- Enterprise Pipeline Stages
(7, gen_random_uuid(), 'Discovery', 1, '#8B5CF6', 2, NOW(), NOW()),
(8, gen_random_uuid(), 'Evaluation', 2, '#06B6D4', 2, NOW(), NOW()),
(9, gen_random_uuid(), 'Pilot', 3, '#F97316', 2, NOW(), NOW()),
(10, gen_random_uuid(), 'Contract', 4, '#EC4899', 2, NOW(), NOW()),
(11, gen_random_uuid(), 'Implementation', 5, '#84CC16', 2, NOW(), NOW()),

-- Startup Pipeline Stages
(12, gen_random_uuid(), 'Initial Contact', 1, '#6366F1', 3, NOW(), NOW()),
(13, gen_random_uuid(), 'Demo', 2, '#14B8A6', 3, NOW(), NOW()),
(14, gen_random_uuid(), 'Trial', 3, '#F43F5E', 3, NOW(), NOW()),
(15, gen_random_uuid(), 'Purchase', 4, '#22C55E', 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. INSERT SAMPLE DEALS (if not exists)
-- ============================================================================

INSERT INTO deals (id, uuid, title, description, value, stage_id, probability, expected_close_date, company_id, contact_id, lead_id, owner_id, created_at, updated_at) VALUES
(1, gen_random_uuid(), 'Enterprise Software License', 'Multi-year enterprise software license for TechCorp', 150000.00, 5, 100, '2024-01-15', 1, 1, NULL, 1, NOW(), NOW()),
(2, gen_random_uuid(), 'Manufacturing System Upgrade', 'Complete system upgrade for Global Industries', 250000.00, 4, 85, '2024-02-28', 2, 2, NULL, 2, NOW(), NOW()),
(3, gen_random_uuid(), 'Startup AI Platform', 'AI platform implementation for StartupXYZ', 75000.00, 3, 70, '2024-03-15', 3, 3, 3, 3, NOW(), NOW()),
(4, gen_random_uuid(), 'Retail POS System', 'Point of sale system for Retail Plus chain', 45000.00, 2, 60, '2024-04-30', 4, 4, NULL, 4, NOW(), NOW()),
(5, gen_random_uuid(), 'Healthcare Analytics', 'Healthcare analytics solution for Healthcare Systems', 180000.00, 1, 40, '2024-05-15', 5, 5, NULL, 5, NOW(), NOW()),
(6, gen_random_uuid(), 'Cloud Migration Project', 'Cloud migration services for TechCorp', 95000.00, 3, 75, '2024-06-30', 1, 6, NULL, 1, NOW(), NOW()),
(7, gen_random_uuid(), 'Supply Chain Optimization', 'Supply chain optimization for Global Industries', 120000.00, 2, 55, '2024-07-15', 2, 7, 2, 2, NOW(), NOW()),
(8, gen_random_uuid(), 'Digital Transformation', 'Digital transformation initiative for NewTech', 200000.00, 1, 30, '2024-08-30', NULL, NULL, 1, 1, NOW(), NOW()),
(9, gen_random_uuid(), 'AI Integration Services', 'AI integration for Innovate Labs', 85000.00, 2, 65, '2024-09-15', NULL, NULL, 2, 2, NOW(), NOW()),
(10, gen_random_uuid(), 'SaaS Platform License', 'SaaS platform license for Digital Dynamics', 65000.00, 3, 80, '2024-10-30', NULL, NULL, 4, 4, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. INSERT SAMPLE TASKS (if not exists)
-- ============================================================================

INSERT INTO tasks (id, uuid, title, description, due_date, due_time, priority, status, type, deal_id, contact_id, lead_id, company_id, assigned_to, created_by, created_at, updated_at) VALUES
(1, gen_random_uuid(), 'Follow up with TechCorp', 'Schedule follow-up call to discuss implementation timeline', '2024-01-20', '14:00:00', 'high', 'pending', 'call', 1, 1, NULL, 1, 1, 1, NOW(), NOW()),
(2, gen_random_uuid(), 'Prepare proposal for Global Industries', 'Create detailed proposal for manufacturing system upgrade', '2024-01-25', '16:00:00', 'urgent', 'in_progress', 'task', 2, 2, NULL, 2, 2, 2, NOW(), NOW()),
(3, gen_random_uuid(), 'Demo for StartupXYZ', 'Conduct product demo for AI platform', '2024-01-22', '10:00:00', 'medium', 'pending', 'meeting', 3, 3, 3, 3, 3, 3, NOW(), NOW()),
(4, gen_random_uuid(), 'Send contract to Retail Plus', 'Send final contract for POS system', '2024-01-23', '11:00:00', 'high', 'completed', 'email', 4, 4, NULL, 4, 4, 4, NOW(), NOW()),
(5, gen_random_uuid(), 'Research Healthcare Systems', 'Research current systems and requirements', '2024-01-26', '15:00:00', 'medium', 'pending', 'task', 5, 5, NULL, 5, 5, 5, NOW(), NOW()),
(6, gen_random_uuid(), 'Call Jennifer Adams', 'Follow up on NewTech opportunity', '2024-01-21', '13:00:00', 'high', 'pending', 'call', NULL, NULL, 1, NULL, 1, 1, NOW(), NOW()),
(7, gen_random_uuid(), 'Send proposal to Michael Thompson', 'Send AI solution proposal to Innovate Labs', '2024-01-24', '12:00:00', 'medium', 'pending', 'email', NULL, NULL, 2, NULL, 2, 2, NOW(), NOW()),
(8, gen_random_uuid(), 'Schedule demo with Digital Dynamics', 'Arrange product demo for Chris Martinez', '2024-01-27', '14:00:00', 'high', 'pending', 'meeting', NULL, NULL, 4, NULL, 4, 4, NOW(), NOW()),
(9, gen_random_uuid(), 'Review TechCorp requirements', 'Review and document TechCorp requirements', '2024-01-28', '16:00:00', 'medium', 'in_progress', 'task', 6, 6, NULL, 1, 1, 1, NOW(), NOW()),
(10, gen_random_uuid(), 'Prepare presentation for Global Industries', 'Create presentation for supply chain optimization', '2024-01-29', '10:00:00', 'urgent', 'pending', 'task', 7, 7, 2, 2, 2, 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

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