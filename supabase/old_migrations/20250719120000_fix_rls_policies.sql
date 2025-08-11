-- Fix RLS policies for user_profiles table
-- This migration ensures users can update their own profiles

-- First, let's check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Drop existing policies that might be blocking updates
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create proper RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Enable RLS if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Test the policies by checking if the current user can update their profile
-- This will help us debug any remaining issues
SELECT 
    'Current user can update profile' as test,
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid()
    ) as profile_exists,
    auth.uid() as current_user_id; 