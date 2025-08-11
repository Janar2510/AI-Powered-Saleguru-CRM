-- Create user_profiles table for authentication and user management
-- This table extends Supabase auth.users with additional profile information

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  onboarding_completed boolean DEFAULT false,
  avatar_url text,
  last_login timestamptz DEFAULT NOW(),
  preferred_language text DEFAULT 'en',
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed ON user_profiles(onboarding_completed);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation
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

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow trigger insert" ON user_profiles
  FOR INSERT TO public WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

