-- Fix foreign key constraint issue for deals table
-- This script ensures a user exists and disables RLS for development

BEGIN;

-- First, let's check if any user exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
        -- Insert a demo user without specifying ID (let identity handle it)
        INSERT INTO public.users (email, name, role, points, badges) 
        VALUES ('demo@saleguru.com', 'Demo User', 'admin', 1000, ARRAY['demo_user']);
    END IF;
END $$;

-- Disable RLS for development (optional - comment out if you want to keep RLS)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_mentions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Verify users exist and show the first user
SELECT id, email, name, role FROM public.users ORDER BY id LIMIT 1;

COMMIT; 