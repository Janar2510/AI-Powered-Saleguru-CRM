/*
  # Create user profiles and authentication tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, not null)
      - `role` (user_role enum)
      - `avatar_url` (text)
      - `onboarding_completed` (boolean)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for owner access and admin access
    - Create indexes for performance

  3. Functions
    - Update function to check if user has completed onboarding
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  first_name text,
  last_name text,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url text,
  onboarding_completed boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Add trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_profiles - users can read/update their own profiles
CREATE POLICY "users_can_read_own_profiles"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profiles"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy for admins to read all profiles
CREATE POLICY "admins_can_read_all_profiles"
  ON user_profiles
  FOR SELECT
  USING (has_admin_access());

-- Create policy for admins to update all profiles
CREATE POLICY "admins_can_update_all_profiles"
  ON user_profiles
  FOR UPDATE
  USING (has_admin_access());

-- Create function to check if user has completed onboarding
CREATE OR REPLACE FUNCTION has_completed_onboarding(user_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  completed boolean;
BEGIN
  SELECT onboarding_completed INTO completed
  FROM user_profiles
  WHERE id = user_id;
  
  RETURN COALESCE(completed, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user's last login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET last_login = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last login on auth.users insert/update
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();