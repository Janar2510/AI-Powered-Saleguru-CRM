-- Add Role-Based Permissions System
-- This migration sets up role-based permissions for warehouse, accounting, and document management

-- Update user_profiles table to include role and permissions
ALTER TABLE IF EXISTS user_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user'));
ALTER TABLE IF EXISTS user_profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]';

-- Create permissions table for granular control
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission VARCHAR(50) NOT NULL,
  granted_by UUID REFERENCES user_profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table for audit trail
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES user_profiles(id),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_permissions' AND policyname = 'Users can view their own permissions') THEN
    CREATE POLICY "Users can view their own permissions" ON user_permissions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_permissions' AND policyname = 'Admins can manage all permissions') THEN
    CREATE POLICY "Admins can manage all permissions" ON user_permissions FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_actions' AND policyname = 'Admins can view admin actions') THEN
    CREATE POLICY "Admins can view admin actions" ON admin_actions FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_actions' AND policyname = 'Admins can insert admin actions') THEN
    CREATE POLICY "Admins can insert admin actions" ON admin_actions FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update existing users to have default roles and permissions
UPDATE user_profiles 
SET 
  role = 'user',
  permissions = '["warehouse.create", "accounting.create", "documents.create", "payments.create"]'::jsonb
WHERE role IS NULL;

-- Create function to check permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  user_uuid UUID,
  permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_permissions JSONB;
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Get user role and permissions
  SELECT role, permissions INTO user_role, user_permissions
  FROM user_profiles
  WHERE id = user_uuid;
  
  -- Check if user has the permission in their role
  IF user_role = 'admin' THEN
    has_permission := TRUE;
  ELSIF user_role = 'manager' THEN
    has_permission := permission_name IN (
      'warehouse.edit', 'warehouse.create',
      'accounting.edit', 'accounting.create',
      'documents.edit', 'documents.create',
      'payments.edit', 'payments.create'
    );
  ELSIF user_role = 'user' THEN
    has_permission := permission_name IN (
      'warehouse.create', 'accounting.create',
      'documents.create', 'payments.create'
    );
  END IF;
  
  -- Check additional permissions from user_permissions table
  IF NOT has_permission THEN
    SELECT EXISTS(
      SELECT 1 FROM user_permissions
      WHERE user_id = user_uuid
      AND permission = permission_name
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO has_permission;
  END IF;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type TEXT,
  target_type TEXT,
  target_id UUID DEFAULT NULL,
  details JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
  VALUES (auth.uid(), action_type, target_type, target_id, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for warehouse tables that check permissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_products' AND policyname = 'Users can delete products with permission') THEN
    CREATE POLICY "Users can delete products with permission" ON warehouse_products FOR DELETE USING (
      check_user_permission(auth.uid(), 'warehouse.delete')
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_locations' AND policyname = 'Users can delete locations with permission') THEN
    CREATE POLICY "Users can delete locations with permission" ON warehouse_locations FOR DELETE USING (
      check_user_permission(auth.uid(), 'warehouse.delete')
    );
  END IF;
END $$;

-- Create RLS policies for accounting tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can delete invoices with permission') THEN
    CREATE POLICY "Users can delete invoices with permission" ON invoices FOR DELETE USING (
      check_user_permission(auth.uid(), 'accounting.delete')
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotations' AND policyname = 'Users can delete quotations with permission') THEN
    CREATE POLICY "Users can delete quotations with permission" ON quotations FOR DELETE USING (
      check_user_permission(auth.uid(), 'accounting.delete')
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can delete orders with permission') THEN
    CREATE POLICY "Users can delete orders with permission" ON orders FOR DELETE USING (
      check_user_permission(auth.uid(), 'accounting.delete')
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proforma_invoices' AND policyname = 'Users can delete proforma invoices with permission') THEN
    CREATE POLICY "Users can delete proforma invoices with permission" ON proforma_invoices FOR DELETE USING (
      check_user_permission(auth.uid(), 'accounting.delete')
    );
  END IF;
END $$; 