-- Migration: Recreate CRM tables cleanly with sample data
-- This migration drops existing tables and recreates them with proper structure

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.automation_rules CASCADE;
DROP TABLE IF EXISTS public.emails CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.social_mentions CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.deals CASCADE;
DROP TABLE IF EXISTS public.stages CASCADE;
DROP TABLE IF EXISTS public.pipelines CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_user_points(UUID, INTEGER) CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    points INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    size TEXT CHECK (size IN ('Startup', 'SMB', 'Mid-Market', 'Enterprise')),
    description TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    title TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    company_name TEXT,
    lead_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead', 'customer')),
    source TEXT,
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    title TEXT,
    source TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'disqualified', 'converted')),
    lead_score INTEGER DEFAULT 0,
    ai_insight TEXT,
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pipelines table
CREATE TABLE IF NOT EXISTS public.pipelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stages table
CREATE TABLE IF NOT EXISTS public.stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    color TEXT DEFAULT '#6b7280',
    pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    stage_id UUID REFERENCES public.stages(id) ON DELETE SET NULL,
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    due_time TIME,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
    type TEXT DEFAULT 'task' CHECK (type IN ('task', 'call', 'email', 'meeting', 'follow_up')),
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_mentions table
CREATE TABLE IF NOT EXISTS public.social_mentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'youtube')),
    content TEXT NOT NULL,
    author TEXT,
    author_handle TEXT,
    author_avatar TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    engagement_score INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    company_mentioned TEXT,
    tags TEXT[],
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emails table
CREATE TABLE IF NOT EXISTS public.emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    cc_emails TEXT[],
    bcc_emails TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'opened', 'clicked', 'bounced')),
    template_id UUID REFERENCES public.email_templates(id),
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    sent_by UUID REFERENCES public.users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('deal_stage_change', 'task_completed', 'email_opened', 'lead_created', 'contact_created')),
    trigger_conditions JSONB,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pipeline
INSERT INTO public.pipelines (id, name, is_default)
VALUES (gen_random_uuid(), 'Default Sales Pipeline', true)
ON CONFLICT DO NOTHING;

-- Insert default stages
INSERT INTO public.stages (id, name, sort_order, color, pipeline_id)
SELECT
    gen_random_uuid(),
    stage_name,
    sort_order,
    color,
    (SELECT id FROM public.pipelines WHERE is_default = true LIMIT 1)
FROM (
    VALUES
        ('Lead', 1, '#6b7280'),
        ('Qualified', 2, '#3b82f6'),
        ('Proposal', 3, '#eab308'),
        ('Negotiation', 4, '#f97316'),
        ('Closed Won', 5, '#22c55e'),
        ('Closed Lost', 6, '#ef4444')
) AS stages(stage_name, sort_order, color)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_stage_id ON public.deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner_id ON public.deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON public.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON public.contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON public.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_social_mentions_platform ON public.social_mentions(platform);
CREATE INDEX IF NOT EXISTS idx_social_mentions_sentiment ON public.social_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can see their own data and admin can see all)
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own companies" ON public.companies FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own companies" ON public.companies FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own companies" ON public.companies FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own contacts" ON public.contacts FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own contacts" ON public.contacts FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own contacts" ON public.contacts FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own leads" ON public.leads FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own deals" ON public.deals FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own deals" ON public.deals FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own deals" ON public.deals FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (assigned_to = auth.uid() OR created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (assigned_to = auth.uid() OR created_by = auth.uid());
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (assigned_to = auth.uid() OR created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view social mentions" ON public.social_mentions FOR SELECT USING (true);
CREATE POLICY "Users can insert social mentions" ON public.social_mentions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own email templates" ON public.email_templates FOR SELECT USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own email templates" ON public.email_templates FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own email templates" ON public.email_templates FOR UPDATE USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own emails" ON public.emails FOR SELECT USING (sent_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own emails" ON public.emails FOR INSERT WITH CHECK (sent_by = auth.uid());
CREATE POLICY "Users can update own emails" ON public.emails FOR UPDATE USING (sent_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own automation rules" ON public.automation_rules FOR SELECT USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own automation rules" ON public.automation_rules FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own automation rules" ON public.automation_rules FOR UPDATE USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Create functions for common operations with proper security settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = '';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment user points with proper security settings
CREATE OR REPLACE FUNCTION increment_user_points(user_uuid UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET points = points + points_to_add 
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Now insert sample data
-- Insert sample users
INSERT INTO public.users (id, email, name, role, points, badges) VALUES
    ('00000000-0000-0000-0000-000000000000', 'admin@saleguru.com', 'Admin User', 'admin', 1250, ARRAY['top_performer', 'deal_closer', 'team_player']),
    ('11111111-1111-1111-1111-111111111111', 'sarah@saleguru.com', 'Sarah Wilson', 'manager', 890, ARRAY['deal_closer', 'team_player']),
    ('22222222-2222-2222-2222-222222222222', 'mike@saleguru.com', 'Mike Chen', 'user', 650, ARRAY['team_player']),
    ('33333333-3333-3333-3333-333333333333', 'jessica@saleguru.com', 'Jessica Brown', 'user', 420, ARRAY[]::TEXT[])
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
    ('11111111-1111-1111-1111-111111111112', 'Robert', 'Lee', 'robert.lee@futureinc.com', '+1-555-0303', 'Future Inc', 'CEO', 'referral', 'new', 45, 'Early stage company. Focus on growth potential.', '22222222-2222-2222-2222-222222222222'),
    ('22222222-2222-2222-2222-222222222223', 'Emma', 'Wilson', 'emma.w@scalestartup.com', '+1-555-0304', 'Scale Startup', 'Founder', 'cold_outreach', 'qualified', 91, 'Perfect fit for enterprise features. High budget.', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Insert sample deals
INSERT INTO public.deals (id, title, description, value, stage_id, probability, expected_close_date, company_id, contact_id, lead_id, owner_id) VALUES
    ('11111111-1111-1111-1111-111111111113', 'Enterprise Software Package', 'Complete CRM solution for TechCorp including custom integrations', 75000.00, (SELECT id FROM public.stages WHERE name = 'Proposal' LIMIT 1), 75, '2025-08-15', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', NULL, '00000000-0000-0000-0000-000000000000'),
    ('22222222-2222-2222-2222-222222222224', 'Cloud Migration Project', 'Migration of StartupXYZ to cloud infrastructure with support', 45000.00, (SELECT id FROM public.stages WHERE name = 'Negotiation' LIMIT 1), 90, '2025-07-30', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, '11111111-1111-1111-1111-111111111111'),
    ('33333333-3333-3333-3333-333333333334', 'Security Audit Package', 'Comprehensive security audit for FinanceCore', 30000.00, (SELECT id FROM public.stages WHERE name = 'Qualified' LIMIT 1), 60, '2025-08-20', '66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, '22222222-2222-2222-2222-222222222222'),
    ('44444444-4444-4444-4444-444444444445', 'Healthcare Platform Implementation', 'Full implementation of healthcare management platform', 120000.00, (SELECT id FROM public.stages WHERE name = 'Lead' LIMIT 1), 25, '2025-09-15', '77777777-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, '33333333-3333-3333-3333-333333333333'),
    ('55555555-5555-5555-5555-555555555556', 'Educational Software License', 'Annual license for EduTech Pro platform', 25000.00, (SELECT id FROM public.stages WHERE name = 'Closed Won' LIMIT 1), 100, '2025-07-01', '88888888-8888-8888-8888-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, '00000000-0000-0000-0000-000000000000'),
    ('66666666-6666-6666-6666-666666666667', 'InnovateCo AI Integration', 'AI-powered features integration for InnovateCo', 85000.00, (SELECT id FROM public.stages WHERE name = 'Proposal' LIMIT 1), 80, '2025-08-10', NULL, NULL, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000000'),
    ('77777777-7777-7777-7777-777777777778', 'GlobalTech Platform Upgrade', 'Platform upgrade and training for GlobalTech', 65000.00, (SELECT id FROM public.stages WHERE name = 'Qualified' LIMIT 1), 70, '2025-08-25', NULL, NULL, 'ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO public.tasks (id, title, description, due_date, due_time, priority, status, type, deal_id, contact_id, lead_id, company_id, assigned_to, created_by) VALUES
    ('88888888-8888-8888-8888-888888888889', 'Follow up with TechCorp', 'Call John Smith to discuss proposal feedback', CURRENT_DATE, '14:00:00', 'high', 'pending', 'call', '11111111-1111-1111-1111-111111111113', '99999999-9999-9999-9999-999999999999', NULL, NULL, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
    ('99999999-9999-9999-9999-999999999990', 'Prepare proposal for StartupXYZ', 'Create detailed proposal for cloud migration project', CURRENT_DATE, '16:00:00', 'medium', 'pending', 'task', '22222222-2222-2222-2222-222222222224', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NULL, '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab', 'Schedule demo call', 'Schedule demo for FinanceCore security audit', CURRENT_DATE, '10:00:00', 'high', 'completed', 'meeting', '33333333-3333-3333-3333-333333333334', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, NULL, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 'Review contract terms', 'Review and finalize contract for HealthTech', CURRENT_DATE - INTERVAL '1 day', '15:00:00', 'urgent', 'pending', 'task', '44444444-4444-4444-4444-444444444445', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, NULL, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccd', 'Send welcome email', 'Send welcome email to EduTech Pro team', CURRENT_DATE, '09:00:00', 'low', 'completed', 'email', '55555555-5555-5555-5555-555555555556', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, NULL, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
    ('dddddddd-dddd-dddd-dddd-dddddddddde', 'Research InnovateCo', 'Research InnovateCo company and decision makers', CURRENT_DATE + INTERVAL '1 day', '11:00:00', 'medium', 'pending', 'task', '66666666-6666-6666-6666-666666666667', NULL, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeef', 'Prepare GlobalTech presentation', 'Create presentation for GlobalTech platform upgrade', CURRENT_DATE + INTERVAL '2 days', '14:00:00', 'high', 'pending', 'task', '77777777-7777-7777-7777-777777777778', NULL, 'ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert sample social mentions
INSERT INTO public.social_mentions (id, platform, content, author, author_handle, sentiment, engagement_score, likes_count, shares_count, comments_count, published_at, company_mentioned, tags) VALUES
    ('ffffffff-ffff-ffff-ffff-fffffffff0', 'twitter', 'Just implemented @SaleguruCRM and our sales team productivity increased by 40%! Amazing platform! #CRM #Sales', 'John Smith', '@johnsmith_tech', 'positive', 85, 45, 12, 8, NOW() - INTERVAL '2 hours', 'TechCorp Inc.', ARRAY['crm', 'sales', 'productivity']),
    ('11111111-1111-1111-1111-111111111114', 'linkedin', 'Excited to announce our partnership with Saleguru CRM! Their AI-powered insights are game-changing for our sales process.', 'Sarah Johnson', 'sarah-johnson-ceo', 'positive', 92, 67, 23, 15, NOW() - INTERVAL '4 hours', 'StartupXYZ', ARRAY['partnership', 'ai', 'sales']),
    ('22222222-2222-2222-2222-222222222225', 'twitter', 'Looking for a CRM solution. Any recommendations? Heard good things about @SaleguruCRM', 'Mike Davis', '@mikedavis_fin', 'neutral', 34, 12, 3, 5, NOW() - INTERVAL '6 hours', 'FinanceCore', ARRAY['crm', 'recommendations']),
    ('33333333-3333-3333-3333-333333333335', 'facebook', 'Our team is struggling with our current CRM. Anyone tried Saleguru CRM? Looking for honest reviews.', 'Lisa Wang', 'lisa.wang.health', 'negative', 28, 8, 2, 12, NOW() - INTERVAL '8 hours', 'HealthTech Solutions', ARRAY['crm', 'reviews', 'struggling']),
    ('44444444-4444-4444-4444-444444444446', 'instagram', 'Day 30 of using Saleguru CRM! Our pipeline has never been clearer. The AI insights are spot on! 📈 #SalesSuccess', 'David Brown', 'david_brown_tech', 'positive', 76, 89, 34, 21, NOW() - INTERVAL '12 hours', 'EduTech Pro', ARRAY['sales', 'ai', 'success'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample email templates
INSERT INTO public.email_templates (id, name, subject, body, category, created_by) VALUES
    ('55555555-5555-5555-5555-555555555557', 'Welcome Email', 'Welcome to Saleguru CRM!', 'Hi {{first_name}},\n\nWelcome to Saleguru CRM! We''re excited to help you streamline your sales process.\n\nBest regards,\nThe Saleguru Team', 'onboarding', '00000000-0000-0000-0000-000000000000'),
    ('66666666-6666-6666-6666-666666666668', 'Proposal Follow-up', 'Following up on our proposal', 'Hi {{first_name}},\n\nI wanted to follow up on the proposal we sent for {{deal_title}}.\n\nLet me know if you have any questions!\n\nBest regards,\n{{sender_name}}', 'follow_up', '00000000-0000-0000-0000-000000000000'),
    ('77777777-7777-7777-7777-777777777779', 'Demo Scheduling', 'Schedule your Saleguru CRM demo', 'Hi {{first_name}},\n\nI''d love to show you how Saleguru CRM can transform your sales process.\n\nCan we schedule a 30-minute demo?\n\nBest regards,\n{{sender_name}}', 'demo', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO public.notifications (id, user_id, title, message, type, action_url) VALUES
    ('88888888-8888-8888-8888-88888888888a', '00000000-0000-0000-0000-000000000000', 'New Lead Assigned', 'A new high-scoring lead has been assigned to you', 'info', '/leads'),
    ('99999999-9999-9999-9999-99999999999b', '11111111-1111-1111-1111-111111111111', 'Deal Won!', 'Congratulations! You closed the StartupXYZ deal', 'success', '/deals'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac', '22222222-2222-2222-2222-222222222222', 'Task Overdue', 'You have 2 overdue tasks that need attention', 'warning', '/tasks'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbd', '33333333-3333-3333-3333-333333333333', 'New Social Mention', 'Your company was mentioned positively on Twitter', 'info', '/social-mentions')
ON CONFLICT (id) DO NOTHING;

-- Insert sample automation rules
INSERT INTO public.automation_rules (id, name, description, trigger_type, trigger_conditions, actions, created_by) VALUES
    ('cccccccc-cccc-cccc-cccc-ccccccccce', 'Lead Assignment', 'Automatically assign new leads to available team members', 'lead_created', '{"status": "new"}', '[{"type": "assign_lead", "assign_to": "round_robin"}]', '00000000-0000-0000-0000-000000000000'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddf', 'Deal Stage Follow-up', 'Send follow-up email when deal moves to proposal stage', 'deal_stage_change', '{"new_stage": "proposal"}', '[{"type": "send_email", "template_id": "66666666-6666-6666-6666-666666666668"}]', '00000000-0000-0000-0000-000000000000'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeg', 'Task Reminder', 'Send reminder for overdue tasks', 'task_completed', '{"status": "overdue"}', '[{"type": "send_notification", "message": "You have overdue tasks"}]', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING; 