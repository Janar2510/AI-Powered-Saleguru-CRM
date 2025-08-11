-- Disable Row Level Security on all tables
-- This migration disables RLS to allow full access for development

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on companies table
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Disable RLS on contacts table
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on deals table
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;

-- Disable RLS on tasks table
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Disable RLS on pipeline_stages table
ALTER TABLE pipeline_stages DISABLE ROW LEVEL SECURITY;

-- Disable RLS on leads table
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Disable RLS on emails table
ALTER TABLE emails DISABLE ROW LEVEL SECURITY;

-- Disable RLS on email_templates table
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;

-- Disable RLS on automation_rules table
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;

-- Disable RLS on calendar_events table
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;

-- Disable RLS on social_mentions table
ALTER TABLE social_mentions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on call_logs table
ALTER TABLE call_logs DISABLE ROW LEVEL SECURITY;

-- Disable RLS on offers table
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on analytics_events table
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_preferences table
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Disable RLS on subscription_plans table
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_subscriptions table
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on ai_insights table
ALTER TABLE ai_insights DISABLE ROW LEVEL SECURITY;

-- Disable RLS on enrichment_data table
ALTER TABLE enrichment_data DISABLE ROW LEVEL SECURITY;

-- Disable RLS on notifications table
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Disable RLS on audit_logs table
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon role for development
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Grant full access to authenticated role for development
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant full access to service_role for development
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role; 