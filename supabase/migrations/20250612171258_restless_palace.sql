/*
  # Fix leads table RLS permissions

  1. Changes:
    - Drop the existing problematic policy that directly accesses auth.users
    - Create a new policy that uses auth.uid() and existing helper functions
    - Ensure proper permissions for all operations
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "owner_access_leads" ON leads;

-- Create a new, simpler policy that doesn't directly access auth.users
CREATE POLICY "leads_access_policy" ON leads
  FOR ALL
  TO public
  USING (
    -- Allow access if user is the creator
    (auth.uid() = created_by) 
    OR 
    -- Allow access if no user (for system operations)
    (auth.uid() IS NULL) 
    OR 
    -- Allow access for developer admins
    is_developer_admin() 
    OR 
    -- Allow access for admins (using the existing function)
    has_admin_access()
  )
  WITH CHECK (
    -- Same conditions for insert/update
    (auth.uid() = created_by) 
    OR 
    (auth.uid() IS NULL) 
    OR 
    is_developer_admin() 
    OR 
    has_admin_access()
  );