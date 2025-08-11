-- Fix user profile trigger and RLS policies
-- This migration addresses the signup hanging issue

-- First, drop any existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_user_profile();

-- Drop existing policies
DROP POLICY IF EXISTS "users_can_read_own_profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_can_read_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "allow_trigger_insert" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Temporarily disable RLS to test if that's causing the issue
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    onboarding_completed,
    created_at,
    updated_at,
    avatar_url,
    last_login,
    preferred_language,
    preferences
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'user',
    false,
    NOW(),
    NOW(),
    NULL,
    NOW(),
    'en',
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Add missing columns to user_profiles if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS last_login timestamptz DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "allow_trigger_insert" ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role; 