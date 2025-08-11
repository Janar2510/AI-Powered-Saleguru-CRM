-- Comprehensive Database Fix Script
-- Run this in your Supabase Dashboard SQL Editor

-- 1. Drop existing users table if it exists
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Create users table with proper UUID structure
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NULL,
  last_name text NULL,
  role text NULL DEFAULT 'user'::text,
  onboarding_completed boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email)
) TABLESPACE pg_default;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users USING btree (role) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON public.users USING btree (onboarding_completed) TABLESPACE pg_default;

-- 4. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines DISABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- 7. Create a test user for development
INSERT INTO public.users (id, email, first_name, last_name, role, onboarding_completed)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'test@example.com',
  'Test',
  'User',
  'developer',
  true
) ON CONFLICT (email) DO NOTHING;

-- 8. Verify the table was created correctly
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 