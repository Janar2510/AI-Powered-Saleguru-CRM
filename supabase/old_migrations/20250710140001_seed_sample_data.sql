-- Seed sample data for Saleguru CRM
-- This provides realistic data for all dashboard widgets

-- Insert sample users (if not exists)
INSERT INTO public.users (id, email, name, role, points, badges) VALUES
    ('00000000-0000-0000-0000-000000000000', 'admin@saleguru.com', 'Admin User', 'admin', 1250, '["top_performer", "deal_closer", "team_player"]'),
    ('11111111-1111-1111-1111-111111111111', 'sarah@saleguru.com', 'Sarah Wilson', 'manager', 890, '["deal_closer", "team_player"]'),
    ('22222222-2222-2222-2222-222222222222', 'mike@saleguru.com', 'Mike Chen', 'user', 650, '["team_player"]'),
    ('33333333-3333-3333-3333-333333333333', 'jessica@saleguru.com', 'Jessica Brown', 'user', 420, '[]')
ON CONFLICT (id) DO NOTHING;

-- Insert sample companies
INSERT INTO public.companies (id, name, website, industry, size, description, phone, status, owner_id) VALUES
    ('44444444-4444-4444-4444-444444444444', 'TechCorp Inc.', 'https://techcorp.com', 'Technology', 'Enterprise', 'Leading software solutions provider', '+1-555-0101', 'active', '00000000-0000-0000-0000-000000000000'),
    ('55555555-5555-5555-5555-555555555555', 'StartupXYZ', 'https://startupxyz.com', 'SaaS', 'Startup', 'Innovative startup in the SaaS space', '+1-555-0102', 'active', '11111111-1111-1111-1111-111111111111'),
    ('66666666-6666-6666-6666-666666666666', 'FinanceCore', 'https://financecore.com', 'Finance', 'Mid-Market', 'Financial services and consulting', '+1-555-0103', 'active', '22222222-2222-2222-2222-222222222222'),
    ('77777777-7777-7777-7777-777777777777', 'HealthTech Solutions', 'https://healthtech.com', 'Healthcare', 'Enterprise', 'Healthcare technology solutions', '+1-555-0104', 'prospect', '33333333-3333-3333-3333-333333333333'),
    ('88888888-8888-8888-8888-888888888888', 'EduTech Pro', 'https://edutechpro.com', 'Education', 'Mid-Market', 'Educational technology platform', '+1-555-0105', 'active', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample contacts
INSERT INTO public.contacts (id, first_name, last_name, email, phone, title, company_id, company_name, lead_score, status, source, owner_id) VALUES
    ('99999999-9999-9999-9999-999999999999', 'John', 'Smith', 'john.smith@techcorp.com', '+1-555-0201', 'CTO', '44444444-4444-4444-4444-444444444444', 'TechCorp Inc.', 85, 'customer', 'website', '00000000-0000-0000-0000-000000000000'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sarah', 'Johnson', 'sarah.j@startupxyz.com', '+1-555-0202', 'CEO', '55555555-5555-5555-5555-555555555555', 'StartupXYZ', 92, 'customer', 'referral', '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mike', 'Davis', 'mike.davis@financecore.com', '+1-555-0203', 'VP of Operations', '66666666-6666-6666-6666-666666666666', 'FinanceCore', 78, 'lead', 'linkedin', '22222222-2222-2222-2222-222222222222'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Lisa', 'Wang', 'lisa.wang@healthtech.com', '+1-555-0204', 'Director of IT', '77777777-7777-7777-7777-777777777777', 'HealthTech Solutions', 65, 'lead', 'cold_outreach', '33333333-3333-3333-3333-333333333333'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'David', 'Brown', 'david.brown@edutechpro.com', '+1-555-0205', 'VP of Technology', '88888888-8888-8888-8888-888888888888', 'EduTech Pro', 88, 'customer', 'website', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads
INSERT INTO public.leads (id, first_name, last_name, email, phone, company, title, source, status, lead_score, ai_insight, owner_id) VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Alex', 'Thompson', 'alex.t@innovateco.com', '+1-555-0301', 'InnovateCo', 'VP of Engineering', 'website', 'qualified', 87, 'High engagement with pricing page. Ready for proposal.', '00000000-0000-0000-0000-000000000000'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Maria', 'Garcia', 'maria.g@globaltech.com', '+1-555-0302', 'GlobalTech', 'CTO', 'linkedin', 'contacted', 72, 'Shows interest in AI features. Schedule demo.', '11111111-1111-1111-1111-111111111111'),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Robert', 'Lee', 'robert.lee@futureinc.com', '+1-555-0303', 'Future Inc', 'CEO', 'referral', 'new', 45, 'Early stage company. Focus on growth potential.', '22222222-2222-2222-2222-222222222222'),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Emma', 'Wilson', 'emma.w@scalestartup.com', '+1-555-0304', 'Scale Startup', 'Founder', 'cold_outreach', 'qualified', 91, 'Perfect fit for enterprise features. High budget.', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Insert sample deals
INSERT INTO public.deals (id, title, description, value, stage_id, probability, expected_close_date, company_id, contact_id, lead_id, owner_id) VALUES
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Enterprise Software Package', 'Complete CRM solution for TechCorp including custom integrations', 75000.00, 'proposal', 75, '2025-08-15', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', NULL, '00000000-0000-0000-0000-000000000000'),
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Cloud Migration Project', 'Migration of StartupXYZ to cloud infrastructure with support', 45000.00, 'negotiation', 90, '2025-07-30', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, '11111111-1111-1111-1111-111111111111'),
    ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Security Audit Package', 'Comprehensive security audit for FinanceCore', 30000.00, 'qualified', 60, '2025-08-20', '66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, '22222222-2222-2222-2222-222222222222'),
    ('llllllll-llll-llll-llll-llllllllllll', 'Healthcare Platform Implementation', 'Full implementation of healthcare management platform', 120000.00, 'lead', 25, '2025-09-15', '77777777-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, '33333333-3333-3333-3333-333333333333'),
    ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'Educational Software License', 'Annual license for EduTech Pro platform', 25000.00, 'closed-won', 100, '2025-07-01', '88888888-8888-8888-8888-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, '00000000-0000-0000-0000-000000000000'),
    ('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'InnovateCo AI Integration', 'AI-powered features integration for InnovateCo', 85000.00, 'proposal', 80, '2025-08-10', NULL, NULL, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000000'),
    ('oooooooo-oooo-oooo-oooo-oooooooooooo', 'GlobalTech Platform Upgrade', 'Platform upgrade and training for GlobalTech', 65000.00, 'qualified', 70, '2025-08-25', NULL, NULL, 'ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO public.tasks (id, title, description, due_date, due_time, priority, status, type, deal_id, contact_id, lead_id, company_id, assigned_to, created_by) VALUES
    ('pppppppp-pppp-pppp-pppp-pppppppppppp', 'Follow up with TechCorp', 'Call John Smith to discuss proposal feedback', CURRENT_DATE, '14:00:00', 'high', 'pending', 'call', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '99999999-9999-9999-9999-999999999999', NULL, NULL, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
    ('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'Prepare proposal for StartupXYZ', 'Create detailed proposal for cloud migration project', CURRENT_DATE, '16:00:00', 'medium', 'pending', 'task', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NULL, '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
    ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'Schedule demo call', 'Schedule demo for FinanceCore security audit', CURRENT_DATE, '10:00:00', 'high', 'completed', 'meeting', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, NULL, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
    ('ssssssss-ssss-ssss-ssss-ssssssssssss', 'Review contract terms', 'Review and finalize contract for HealthTech', CURRENT_DATE - INTERVAL '1 day', '15:00:00', 'urgent', 'pending', 'task', 'llllllll-llll-llll-llll-llllllllllll', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, NULL, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333'),
    ('tttttttt-tttt-tttt-tttt-tttttttttttt', 'Send welcome email', 'Send welcome email to EduTech Pro team', CURRENT_DATE, '09:00:00', 'low', 'completed', 'email', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, NULL, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
    ('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'Research InnovateCo', 'Research InnovateCo company and decision makers', CURRENT_DATE + INTERVAL '1 day', '11:00:00', 'medium', 'pending', 'task', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', NULL, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
    ('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'Prepare GlobalTech presentation', 'Create presentation for GlobalTech platform upgrade', CURRENT_DATE + INTERVAL '2 days', '14:00:00', 'high', 'pending', 'task', 'oooooooo-oooo-oooo-oooo-oooooooooooo', NULL, 'ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert sample social mentions
INSERT INTO public.social_mentions (id, platform, content, author, author_handle, sentiment, engagement_score, likes_count, shares_count, comments_count, published_at, company_mentioned, tags) VALUES
    ('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'twitter', 'Just implemented @SaleguruCRM and our sales team productivity increased by 40%! Amazing platform! #CRM #Sales', 'John Smith', '@johnsmith_tech', 'positive', 85, 45, 12, 8, NOW() - INTERVAL '2 hours', 'TechCorp Inc.', ARRAY['crm', 'sales', 'productivity']),
    ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'linkedin', 'Excited to announce our partnership with Saleguru CRM! Their AI-powered insights are game-changing for our sales process.', 'Sarah Johnson', 'sarah-johnson-ceo', 'positive', 92, 67, 23, 15, NOW() - INTERVAL '4 hours', 'StartupXYZ', ARRAY['partnership', 'ai', 'sales']),
    ('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'twitter', 'Looking for a CRM solution. Any recommendations? Heard good things about @SaleguruCRM', 'Mike Davis', '@mikedavis_fin', 'neutral', 34, 12, 3, 5, NOW() - INTERVAL '6 hours', 'FinanceCore', ARRAY['crm', 'recommendations']),
    ('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'facebook', 'Our team is struggling with our current CRM. Anyone tried Saleguru CRM? Looking for honest reviews.', 'Lisa Wang', 'lisa.wang.health', 'negative', 28, 8, 2, 12, NOW() - INTERVAL '8 hours', 'HealthTech Solutions', ARRAY['crm', 'reviews', 'struggling']),
    ('11111111-2222-3333-4444-555555555555', 'instagram', 'Day 30 of using Saleguru CRM! Our pipeline has never been clearer. The AI insights are spot on! 📈 #SalesSuccess', 'David Brown', 'david_brown_tech', 'positive', 76, 89, 34, 21, NOW() - INTERVAL '12 hours', 'EduTech Pro', ARRAY['sales', 'ai', 'success'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample email templates
INSERT INTO public.email_templates (id, name, subject, body, category, created_by) VALUES
    ('22222222-3333-4444-5555-666666666666', 'Welcome Email', 'Welcome to Saleguru CRM!', 'Hi {{first_name}},\n\nWelcome to Saleguru CRM! We''re excited to help you streamline your sales process.\n\nBest regards,\nThe Saleguru Team', 'onboarding', '00000000-0000-0000-0000-000000000000'),
    ('33333333-4444-5555-6666-777777777777', 'Proposal Follow-up', 'Following up on our proposal', 'Hi {{first_name}},\n\nI wanted to follow up on the proposal we sent for {{deal_title}}.\n\nLet me know if you have any questions!\n\nBest regards,\n{{sender_name}}', 'follow_up', '00000000-0000-0000-0000-000000000000'),
    ('44444444-5555-6666-7777-888888888888', 'Demo Scheduling', 'Schedule your Saleguru CRM demo', 'Hi {{first_name}},\n\nI''d love to show you how Saleguru CRM can transform your sales process.\n\nCan we schedule a 30-minute demo?\n\nBest regards,\n{{sender_name}}', 'demo', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO public.notifications (id, user_id, title, message, type, action_url) VALUES
    ('55555555-6666-7777-8888-999999999999', '00000000-0000-0000-0000-000000000000', 'New Lead Assigned', 'A new high-scoring lead has been assigned to you', 'info', '/leads'),
    ('66666666-7777-8888-9999-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Deal Won!', 'Congratulations! You closed the StartupXYZ deal', 'success', '/deals'),
    ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Task Overdue', 'You have 2 overdue tasks that need attention', 'warning', '/tasks'),
    ('88888888-9999-aaaa-bbbb-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'New Social Mention', 'Your company was mentioned positively on Twitter', 'info', '/social-mentions')
ON CONFLICT (id) DO NOTHING;

-- Insert sample automation rules
INSERT INTO public.automation_rules (id, name, description, trigger_type, trigger_conditions, actions, created_by) VALUES
    ('99999999-aaaa-bbbb-cccc-dddddddddddd', 'Lead Assignment', 'Automatically assign new leads to available team members', 'lead_created', '{"status": "new"}', '[{"type": "assign_lead", "assign_to": "round_robin"}]', '00000000-0000-0000-0000-000000000000'),
    ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Deal Stage Follow-up', 'Send follow-up email when deal moves to proposal stage', 'deal_stage_change', '{"new_stage": "proposal"}', '[{"type": "send_email", "template_id": "33333333-4444-5555-6666-777777777777"}]', '00000000-0000-0000-0000-000000000000'),
    ('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'Task Reminder', 'Send reminder for overdue tasks', 'task_completed', '{"status": "overdue"}', '[{"type": "send_notification", "message": "You have overdue tasks"}]', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING; 