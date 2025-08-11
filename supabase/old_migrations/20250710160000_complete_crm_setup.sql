-- Migration: Complete CRM Setup with Tables and Sample Data
-- This migration creates all CRM tables and populates them with realistic sample data

-- Wrap everything in a transaction for atomicity
BEGIN;

-- Create schema for security definer functions
CREATE SCHEMA IF NOT EXISTS private;

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
DROP FUNCTION IF EXISTS private.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS private.increment_user_points(UUID, INTEGER) CASCADE;

-- Create updated_at trigger function in private schema with proper security settings
CREATE OR REPLACE FUNCTION private.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create users table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    points INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create companies table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.companies (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    size TEXT CHECK (size IN ('Startup', 'SMB', 'Mid-Market', 'Enterprise')),
    description TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
    owner_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create contacts table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    title TEXT,
    company_id BIGINT REFERENCES public.companies(id) ON DELETE SET NULL,
    company_name TEXT,
    lead_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead', 'customer')),
    source TEXT,
    owner_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create leads table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.leads (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
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
    owner_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create pipelines table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.pipelines (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on pipelines table
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Create stages table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.stages (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    color TEXT DEFAULT '#6b7280',
    pipeline_id BIGINT REFERENCES public.pipelines(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on stages table
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

-- Create deals table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.deals (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    stage_id BIGINT REFERENCES public.stages(id) ON DELETE SET NULL,
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    company_id BIGINT REFERENCES public.companies(id) ON DELETE SET NULL,
    contact_id BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE SET NULL,
    owner_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on deals table
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create tasks table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.tasks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    due_time TIME,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
    type TEXT DEFAULT 'task' CHECK (type IN ('task', 'call', 'email', 'meeting', 'follow_up')),
    deal_id BIGINT REFERENCES public.deals(id) ON DELETE SET NULL,
    contact_id BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE SET NULL,
    company_id BIGINT REFERENCES public.companies(id) ON DELETE SET NULL,
    assigned_to BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create social_mentions table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.social_mentions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
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

-- Enable RLS on social_mentions table
ALTER TABLE public.social_mentions ENABLE ROW LEVEL SECURITY;

-- Create email_templates table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.email_templates (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on email_templates table
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create emails table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.emails (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    cc_emails TEXT[],
    bcc_emails TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'opened', 'clicked', 'bounced')),
    template_id BIGINT REFERENCES public.email_templates(id) ON DELETE SET NULL,
    deal_id BIGINT REFERENCES public.deals(id) ON DELETE SET NULL,
    contact_id BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE SET NULL,
    sent_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on emails table
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Create automation_rules table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('deal_stage_change', 'task_completed', 'email_opened', 'lead_created', 'contact_created')),
    trigger_conditions JSONB,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on automation_rules table
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- Create notifications table with identity column and RLS
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
-- Use INCLUDE for covering indexes where appropriate
CREATE INDEX IF NOT EXISTS idx_deals_stage_id ON public.deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner_id ON public.deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON public.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON public.deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON public.contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON public.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_mentions_platform ON public.social_mentions(platform);
CREATE INDEX IF NOT EXISTS idx_social_mentions_sentiment ON public.social_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_social_mentions_published_at ON public.social_mentions(published_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_emails_status ON public.emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON public.emails(sent_at);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON public.pipelines FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON public.stages FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Create gamification function with proper security settings
CREATE OR REPLACE FUNCTION private.increment_user_points(user_id BIGINT, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET points = points + points_to_add 
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create basic RLS policies
-- Users table policy
CREATE POLICY "Users can view their own data" ON public.users
    USING (id = (SELECT id FROM public.users WHERE uuid = auth.uid()));

-- Companies table policy
CREATE POLICY "Users can view companies they own" ON public.companies
    USING (owner_id = (SELECT id FROM public.users WHERE uuid = auth.uid()));

-- Contacts table policy
CREATE POLICY "Users can view contacts they own" ON public.contacts
    USING (owner_id = (SELECT id FROM public.users WHERE uuid = auth.uid()));

-- Leads table policy
CREATE POLICY "Users can view leads they own" ON public.leads
    USING (owner_id = (SELECT id FROM public.users WHERE uuid = auth.uid()));

-- Deals table policy
CREATE POLICY "Users can view deals they own" ON public.deals
    USING (owner_id = (SELECT id FROM public.users WHERE uuid = auth.uid()));

-- Tasks table policy
CREATE POLICY "Users can view tasks assigned to them" ON public.tasks
    USING (assigned_to = (SELECT id FROM public.users WHERE uuid = auth.uid()));

-- Notifications table policy
CREATE POLICY "Users can view their own notifications" ON public.notifications
    USING (user_id = (SELECT id FROM public.users WHERE uuid = auth.uid()));

-- Insert default pipeline and stages
INSERT INTO public.pipelines (name, is_default) VALUES
    ('Default Sales Pipeline', true);

-- Get the ID of the default pipeline
DO $$
DECLARE
    default_pipeline_id BIGINT;
BEGIN
    SELECT id INTO default_pipeline_id FROM public.pipelines WHERE is_default = true LIMIT 1;
    
    INSERT INTO public.stages (name, sort_order, color, pipeline_id) VALUES
        ('Lead', 1, '#6b7280', default_pipeline_id),
        ('Qualified', 2, '#3b82f6', default_pipeline_id),
        ('Proposal', 3, '#f59e0b', default_pipeline_id),
        ('Negotiation', 4, '#8b5cf6', default_pipeline_id),
        ('Closed Won', 5, '#10b981', default_pipeline_id),
        ('Closed Lost', 6, '#ef4444', default_pipeline_id);
END $$;

-- Insert sample users
INSERT INTO public.users (email, name, role, points, badges) VALUES
    ('admin@saleguru.com', 'Admin User', 'admin', 1250, ARRAY['top_performer', 'deal_closer', 'team_player']),
    ('sarah@saleguru.com', 'Sarah Wilson', 'manager', 890, ARRAY['deal_closer', 'team_player']),
    ('mike@saleguru.com', 'Mike Chen', 'user', 650, ARRAY['team_player']),
    ('jessica@saleguru.com', 'Jessica Brown', 'user', 420, ARRAY[]::TEXT[]);

-- Insert sample companies
INSERT INTO public.companies (name, website, industry, size, description, phone, status, owner_id) VALUES
    ('TechCorp Inc.', 'https://techcorp.com', 'Technology', 'Enterprise', 'Leading software solutions provider', '+1-555-0101', 'active', 1),
    ('StartupXYZ', 'https://startupxyz.com', 'SaaS', 'Startup', 'Innovative startup in the SaaS space', '+1-555-0102', 'active', 2),
    ('FinanceCore', 'https://financecore.com', 'Finance', 'Mid-Market', 'Financial services and consulting', '+1-555-0103', 'active', 3),
    ('HealthTech Solutions', 'https://healthtech.com', 'Healthcare', 'Enterprise', 'Healthcare technology solutions', '+1-555-0104', 'prospect', 4),
    ('EduTech Pro', 'https://edutechpro.com', 'Education', 'Mid-Market', 'Educational technology platform', '+1-555-0105', 'active', 1);

-- Insert sample contacts
INSERT INTO public.contacts (first_name, last_name, email, phone, title, company_id, company_name, lead_score, status, source, owner_id) VALUES
    ('John', 'Smith', 'john.smith@techcorp.com', '+1-555-0201', 'CTO', 1, 'TechCorp Inc.', 85, 'customer', 'website', 1),
    ('Sarah', 'Johnson', 'sarah.j@startupxyz.com', '+1-555-0202', 'CEO', 2, 'StartupXYZ', 92, 'customer', 'referral', 2),
    ('Mike', 'Davis', 'mike.davis@financecore.com', '+1-555-0203', 'VP of Operations', 3, 'FinanceCore', 78, 'lead', 'linkedin', 3),
    ('Lisa', 'Wang', 'lisa.wang@healthtech.com', '+1-555-0204', 'Director of IT', 4, 'HealthTech Solutions', 65, 'lead', 'cold_outreach', 4),
    ('David', 'Brown', 'david.brown@edutechpro.com', '+1-555-0205', 'VP of Technology', 5, 'EduTech Pro', 88, 'customer', 'website', 1);

-- Insert sample leads
INSERT INTO public.leads (first_name, last_name, email, phone, company, title, source, status, lead_score, ai_insight, owner_id) VALUES
    ('Alex', 'Thompson', 'alex.t@innovateco.com', '+1-555-0301', 'InnovateCo', 'VP of Engineering', 'website', 'qualified', 87, 'High engagement with pricing page. Ready for proposal.', 1),
    ('Maria', 'Garcia', 'maria.g@globaltech.com', '+1-555-0302', 'GlobalTech', 'CTO', 'linkedin', 'contacted', 72, 'Shows interest in AI features. Schedule demo.', 2),
    ('Robert', 'Lee', 'robert.lee@futureinc.com', '+1-555-0303', 'Future Inc', 'CEO', 'referral', 'new', 45, 'Early stage company. Focus on growth potential.', 3),
    ('Emma', 'Wilson', 'emma.w@scalestartup.com', '+1-555-0304', 'Scale Startup', 'Founder', 'cold_outreach', 'qualified', 91, 'Perfect fit for enterprise features. High budget.', 4);

-- Insert sample deals
INSERT INTO public.deals (title, description, value, stage_id, probability, expected_close_date, company_id, contact_id, lead_id, owner_id) VALUES
    ('Enterprise Software Package', 'Complete CRM solution for TechCorp including custom integrations', 75000.00, 3, 75, '2025-08-15', 1, 1, NULL, 1),
    ('Cloud Migration Project', 'Migration of StartupXYZ to cloud infrastructure with support', 45000.00, 4, 90, '2025-07-30', 2, 2, NULL, 2),
    ('Security Audit Package', 'Comprehensive security audit for FinanceCore', 30000.00, 2, 60, '2025-08-20', 3, 3, NULL, 3),
    ('Healthcare Platform Implementation', 'Full implementation of healthcare management platform', 120000.00, 1, 25, '2025-09-15', 4, 4, NULL, 4),
    ('Educational Software License', 'Annual license for EduTech Pro platform', 25000.00, 5, 100, '2025-07-01', 5, 5, NULL, 1),
    ('InnovateCo AI Integration', 'AI-powered features integration for InnovateCo', 85000.00, 3, 80, '2025-08-10', NULL, NULL, 1, 1),
    ('GlobalTech Platform Upgrade', 'Platform upgrade and training for GlobalTech', 65000.00, 2, 70, '2025-08-25', NULL, NULL, 2, 2);

-- Insert sample tasks
INSERT INTO public.tasks (title, description, due_date, due_time, priority, status, type, deal_id, contact_id, lead_id, company_id, assigned_to, created_by) VALUES
    ('Follow up with TechCorp', 'Call John Smith to discuss proposal feedback', CURRENT_DATE, '14:00:00', 'high', 'pending', 'call', 1, 1, NULL, NULL, 1, 1),
    ('Prepare proposal for StartupXYZ', 'Create detailed proposal for cloud migration project', CURRENT_DATE, '16:00:00', 'medium', 'pending', 'task', 2, 2, NULL, NULL, 2, 2),
    ('Schedule demo call', 'Schedule demo for FinanceCore security audit', CURRENT_DATE, '10:00:00', 'high', 'completed', 'meeting', 3, 3, NULL, NULL, 3, 3),
    ('Review contract terms', 'Review and finalize contract for HealthTech', CURRENT_DATE - INTERVAL '1 day', '15:00:00', 'urgent', 'pending', 'task', 4, 4, NULL, NULL, 4, 4),
    ('Send welcome email', 'Send welcome email to EduTech Pro team', CURRENT_DATE, '09:00:00', 'low', 'completed', 'email', 5, 5, NULL, NULL, 1, 1),
    ('Research InnovateCo', 'Research InnovateCo company and decision makers', CURRENT_DATE + INTERVAL '1 day', '11:00:00', 'medium', 'pending', 'task', 6, NULL, 1, NULL, 1, 1),
    ('Prepare GlobalTech presentation', 'Create presentation for GlobalTech platform upgrade', CURRENT_DATE + INTERVAL '2 days', '14:00:00', 'high', 'pending', 'task', 7, NULL, 2, NULL, 2, 2);

-- Insert sample social mentions
INSERT INTO public.social_mentions (platform, content, author, author_handle, sentiment, engagement_score, likes_count, shares_count, comments_count, published_at, company_mentioned, tags) VALUES
    ('twitter', 'Just implemented @SaleguruCRM and our sales team productivity increased by 40%! Amazing platform! #CRM #Sales', 'John Smith', '@johnsmith_tech', 'positive', 85, 45, 12, 8, NOW() - INTERVAL '2 hours', 'TechCorp Inc.', ARRAY['crm', 'sales', 'productivity']),
    ('linkedin', 'Excited to announce our partnership with Saleguru CRM! Their AI-powered insights are game-changing for our sales process.', 'Sarah Johnson', 'sarah-johnson-ceo', 'positive', 92, 67, 23, 15, NOW() - INTERVAL '4 hours', 'StartupXYZ', ARRAY['partnership', 'ai', 'sales']),
    ('twitter', 'Looking for a CRM solution. Any recommendations? Heard good things about @SaleguruCRM', 'Mike Davis', '@mikedavis_fin', 'neutral', 34, 12, 3, 5, NOW() - INTERVAL '6 hours', 'FinanceCore', ARRAY['crm', 'recommendations']),
    ('facebook', 'Our team is struggling with our current CRM. Anyone tried Saleguru CRM? Looking for honest reviews.', 'Lisa Wang', 'lisa.wang.health', 'negative', 28, 8, 2, 12, NOW() - INTERVAL '8 hours', 'HealthTech Solutions', ARRAY['crm', 'reviews', 'struggling']),
    ('instagram', 'Day 30 of using Saleguru CRM! Our pipeline has never been clearer. The AI insights are spot on! 📈 #SalesSuccess', 'David Brown', 'david_brown_tech', 'positive', 76, 89, 34, 21, NOW() - INTERVAL '12 hours', 'EduTech Pro', ARRAY['sales', 'ai', 'success']);

-- Insert sample email templates
INSERT INTO public.email_templates (name, subject, body, category, created_by) VALUES
    ('Welcome Email', 'Welcome to Saleguru CRM!', 'Hi {{first_name}},\n\nWelcome to Saleguru CRM! We''re excited to help you streamline your sales process.\n\nBest regards,\nThe Saleguru Team', 'onboarding', 1),
    ('Proposal Follow-up', 'Following up on our proposal', 'Hi {{first_name}},\n\nI wanted to follow up on the proposal we sent for {{deal_title}}.\n\nLet me know if you have any questions!\n\nBest regards,\n{{sender_name}}', 'follow_up', 1),
    ('Demo Scheduling', 'Schedule your Saleguru CRM demo', 'Hi {{first_name}},\n\nI''d love to show you how Saleguru CRM can transform your sales process.\n\nCan we schedule a 30-minute demo?\n\nBest regards,\n{{sender_name}}', 'demo', 2);

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type, action_url) VALUES
    (1, 'New Lead Assigned', 'A new high-scoring lead has been assigned to you', 'info', '/leads'),
    (2, 'Deal Won!', 'Congratulations! You closed the StartupXYZ deal', 'success', '/deals'),
    (3, 'Task Overdue', 'You have 2 overdue tasks that need attention', 'warning', '/tasks'),
    (4, 'New Social Mention', 'Your company was mentioned positively on Twitter', 'info', '/social-mentions');

-- Insert sample automation rules
INSERT INTO public.automation_rules (name, description, trigger_type, trigger_conditions, actions, created_by) VALUES
    ('Lead Assignment', 'Automatically assign new leads to available team members', 'lead_created', '{"status": "new"}', '[{"type": "assign_lead", "assign_to": "round_robin"}]', 1),
    ('Deal Stage Follow-up', 'Send follow-up email when deal moves to proposal stage', 'deal_stage_change', '{"new_stage": "proposal"}', '[{"type": "send_email", "template_id": 2}]', 1),
    ('Task Reminder', 'Send reminder for overdue tasks', 'task_completed', '{"status": "overdue"}', '[{"type": "send_notification", "message": "You have overdue tasks"}]', 2);

COMMIT; 