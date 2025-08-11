-- Create core CRM tables for Saleguru CRM
-- This migration creates all essential tables needed for dashboard functionality

-- Enable UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    points INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    size TEXT,
    description TEXT,
    phone TEXT,
    address JSONB,
    social_media JSONB,
    tags TEXT[],
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
    tags TEXT[],
    notes TEXT,
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
    notes TEXT,
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pipelines table
CREATE TABLE IF NOT EXISTS public.pipelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stages table (sales pipeline stages) - Fixed: stages.id is now UUID
CREATE TABLE IF NOT EXISTS public.stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    color TEXT DEFAULT '#7c3aed',
    pipeline_id UUID NOT NULL REFERENCES public.pipelines(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table - Fixed: stage_id is now UUID to match stages.id
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(15,2),
    currency TEXT DEFAULT 'USD',
    stage_id UUID REFERENCES public.stages(id),
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    actual_close_date DATE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES public.users(id),
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table - Fixed: Removed CASCADE deletions for better data integrity
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

-- Insert default pipeline using gen_random_uuid()
INSERT INTO public.pipelines (id, name, is_default)
VALUES (gen_random_uuid(), 'Default Sales Pipeline', true)
ON CONFLICT DO NOTHING;

-- Insert default stages with the pipeline_id from the default pipeline
-- Note: We need to use stage slugs for the frontend compatibility
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