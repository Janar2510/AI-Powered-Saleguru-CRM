-- Drop existing users table if it exists
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with proper UUID structure
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users USING btree (role) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON public.users USING btree (onboarding_completed) TABLESPACE pg_default;

-- Create trigger for updated_at
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

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role; 