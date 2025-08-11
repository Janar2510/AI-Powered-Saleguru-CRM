-- Fix RLS policies and table structure issues
-- This migration addresses the infinite recursion in RLS policies and missing columns

BEGIN;

-- First, disable RLS on all tables to stop the infinite recursion
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_mentions DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean slate
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON deals;
DROP POLICY IF EXISTS "Users can manage their own deals" ON deals;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can manage their own leads" ON leads;
DROP POLICY IF EXISTS "Users can view their own social mentions" ON social_mentions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON deals;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contacts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON social_mentions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON companies;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON stages;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON pipelines;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON email_templates;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON automation_rules;

-- Fix social_mentions table structure - add missing columns that the frontend expects
ALTER TABLE social_mentions 
ADD COLUMN IF NOT EXISTS mention_time TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'twitter',
ADD COLUMN IF NOT EXISTS sentiment TEXT DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS author TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL;

-- Re-enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive RLS policies
-- Users table policies
CREATE POLICY "Enable read access for authenticated users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (auth.uid()::text = uuid::text);

-- Deals table policies (using owner_id, not user_id)
CREATE POLICY "Enable read access for authenticated users" ON deals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON deals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for deal owners" ON deals
    FOR UPDATE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

CREATE POLICY "Enable delete for deal owners" ON deals
    FOR DELETE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

-- Tasks table policies (using assigned_to, not user_id)
CREATE POLICY "Enable read access for authenticated users" ON tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON tasks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for task assignees" ON tasks
    FOR UPDATE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = assigned_to)::text);

CREATE POLICY "Enable delete for task assignees" ON tasks
    FOR DELETE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = assigned_to)::text);

-- Contacts table policies (using owner_id)
CREATE POLICY "Enable read access for authenticated users" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON contacts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for contact owners" ON contacts
    FOR UPDATE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

CREATE POLICY "Enable delete for contact owners" ON contacts
    FOR DELETE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

-- Leads table policies (using owner_id)
CREATE POLICY "Enable read access for authenticated users" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON leads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for lead owners" ON leads
    FOR UPDATE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

CREATE POLICY "Enable delete for lead owners" ON leads
    FOR DELETE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

-- Social mentions table policies (using owner_id)
CREATE POLICY "Enable read access for authenticated users" ON social_mentions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON social_mentions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for mention owners" ON social_mentions
    FOR UPDATE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

CREATE POLICY "Enable delete for mention owners" ON social_mentions
    FOR DELETE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

-- Companies table policies (using owner_id)
CREATE POLICY "Enable read access for authenticated users" ON companies
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON companies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for company owners" ON companies
    FOR UPDATE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

CREATE POLICY "Enable delete for company owners" ON companies
    FOR DELETE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

-- Stages table policies (read-only for all authenticated users)
CREATE POLICY "Enable read access for authenticated users" ON stages
    FOR SELECT USING (auth.role() = 'authenticated');

-- Pipelines table policies (read-only for all authenticated users)
CREATE POLICY "Enable read access for authenticated users" ON pipelines
    FOR SELECT USING (auth.role() = 'authenticated');

-- Email templates table policies (using owner_id)
CREATE POLICY "Enable read access for authenticated users" ON email_templates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON email_templates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for template owners" ON email_templates
    FOR UPDATE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

CREATE POLICY "Enable delete for template owners" ON email_templates
    FOR DELETE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

-- Notifications table policies (using user_id)
CREATE POLICY "Enable read access for authenticated users" ON notifications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for notification owners" ON notifications
    FOR UPDATE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = user_id)::text);

CREATE POLICY "Enable delete for notification owners" ON notifications
    FOR DELETE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = user_id)::text);

-- Automation rules table policies (using owner_id)
CREATE POLICY "Enable read access for authenticated users" ON automation_rules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON automation_rules
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for rule owners" ON automation_rules
    FOR UPDATE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

CREATE POLICY "Enable delete for rule owners" ON automation_rules
    FOR DELETE USING (auth.uid()::text = (SELECT uuid FROM users WHERE id = owner_id)::text);

-- Update sample data to include the new columns
UPDATE social_mentions SET 
    mention_time = created_at,
    source = CASE 
        WHEN id % 4 = 0 THEN 'twitter'
        WHEN id % 4 = 1 THEN 'linkedin'
        WHEN id % 4 = 2 THEN 'facebook'
        ELSE 'instagram'
    END,
    sentiment = CASE 
        WHEN id % 3 = 0 THEN 'positive'
        WHEN id % 3 = 1 THEN 'neutral'
        ELSE 'negative'
    END,
    author = CASE 
        WHEN id = 1 THEN 'john_doe'
        WHEN id = 2 THEN 'sarah_wilson'
        WHEN id = 3 THEN 'mike_chen'
        WHEN id = 4 THEN 'emma_davis'
        WHEN id = 5 THEN 'alex_smith'
        ELSE 'user_' || id
    END,
    content = CASE 
        WHEN id = 1 THEN 'Great experience with @SaleGuruCRM! The AI insights are game-changing.'
        WHEN id = 2 THEN 'Just started using @SaleGuruCRM for our sales team. So far so good!'
        WHEN id = 3 THEN 'The automation features in @SaleGuruCRM have saved us hours every week.'
        WHEN id = 4 THEN 'Love the gamification aspect of @SaleGuruCRM. Team engagement is up!'
        WHEN id = 5 THEN 'Customer support from @SaleGuruCRM is excellent. Highly recommend!'
        ELSE 'Sample social mention content for ID ' || id
    END,
    url = 'https://example.com/mention/' || id
WHERE mention_time IS NULL OR source IS NULL;

COMMIT; 