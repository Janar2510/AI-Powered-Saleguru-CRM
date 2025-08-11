/*
  # Add developer admin role and permissions

  1. New Columns
    - Add `role` column to auth.users metadata with enum type check
    - Update existing RLS policies to respect developer_admin role

  2. Security
    - Create new RLS policies for developer admin access
    - Add helper functions for permission checking

  3. Developer Tools
    - Create developer_tools table for feature flags and settings
*/

-- Add role enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'manager', 'developer_admin');
  END IF;
END$$;

-- Create function to check if user is a developer admin
CREATE OR REPLACE FUNCTION is_developer_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND (
          raw_user_meta_data->>'role' = 'developer_admin'
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has admin access (including developer_admin)
CREATE OR REPLACE FUNCTION has_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND (
          raw_user_meta_data->>'role' IN ('admin', 'manager', 'developer_admin')
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update leads table RLS policy to include developer_admin access
DROP POLICY IF EXISTS "owner_access_leads" ON leads;
CREATE POLICY "owner_access_leads" ON leads
  FOR ALL USING (
    auth.uid() = created_by OR
    auth.uid() IS NULL OR -- Allow access when no user is authenticated (for development)
    is_developer_admin() OR -- Developer admins can access all leads
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        raw_user_meta_data->>'role' IN ('admin', 'manager') OR
        email LIKE '%@admin.%' -- Fallback for admin detection
      )
    )
  );

-- Create developer_tools table for feature flags and settings
CREATE TABLE IF NOT EXISTS developer_tools (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_developer_tools_updated_at
BEFORE UPDATE ON developer_tools
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on developer_tools
ALTER TABLE developer_tools ENABLE ROW LEVEL SECURITY;

-- Create policy for developer_tools - only developer_admin can modify
CREATE POLICY "developer_admin_access" ON developer_tools
  FOR ALL USING (is_developer_admin());

-- Create policy for read-only access for admins
CREATE POLICY "admin_read_access" ON developer_tools
  FOR SELECT USING (has_admin_access());

-- Insert default feature flags and settings
INSERT INTO developer_tools (name, description, value, category)
VALUES
  ('feature_flags', 'System feature flags', '{
    "ai_guru_enabled": true,
    "lead_scoring_enabled": true,
    "email_integration_enabled": true,
    "calendar_integration_enabled": true,
    "advanced_analytics_enabled": true
  }', 'system'),
  ('plan_restrictions', 'Plan-based feature restrictions', '{
    "free": {
      "max_deals": 10,
      "max_contacts": 100,
      "ai_features": false,
      "email_templates": 5
    },
    "pro": {
      "max_deals": 1000,
      "max_contacts": 10000,
      "ai_features": true,
      "email_templates": 50
    },
    "enterprise": {
      "max_deals": -1,
      "max_contacts": -1,
      "ai_features": true,
      "email_templates": -1
    }
  }', 'billing'),
  ('developer_settings', 'Developer environment settings', '{
    "show_query_inspector": true,
    "log_ai_requests": true,
    "show_performance_metrics": true,
    "debug_mode": false
  }', 'development')
ON CONFLICT (name) DO NOTHING;