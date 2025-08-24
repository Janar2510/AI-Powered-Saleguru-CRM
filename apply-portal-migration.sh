#!/bin/bash

echo "🚀 Applying Customer Portal Migration..."
echo "📋 This creates the complete portal system"
echo ""

# Copy the SQL content
cat << 'EOF'
-- Portal System Migration
-- Creates portal users, tokens, and related functionality

-- Create portal_users table
CREATE TABLE IF NOT EXISTS public.portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL DEFAULT 'temp-org',
  company_id UUID,
  contact_id UUID,
  email TEXT NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  UNIQUE (org_id, email)
);

-- Create portal_tokens table for lightweight session tokens
CREATE TABLE IF NOT EXISTS public.portal_tokens (
  token TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT 'temp-org',
  portal_user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create portal_invitations table for managing invites
CREATE TABLE IF NOT EXISTS public.portal_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL DEFAULT 'temp-org',
  company_id UUID,
  contact_id UUID,
  email TEXT NOT NULL,
  invited_by UUID,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token TEXT UNIQUE NOT NULL,
  UNIQUE (org_id, email)
);

-- Create portal_access_logs for audit trail
CREATE TABLE IF NOT EXISTS public.portal_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL DEFAULT 'temp-org',
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_access_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY portal_users_org_policy ON portal_users
  FOR ALL TO authenticated
  USING (org_id = 'temp-org');

CREATE POLICY portal_users_org_policy_anon ON portal_users
  FOR ALL TO anon
  USING (org_id = 'temp-org');

CREATE POLICY portal_tokens_org_policy ON portal_tokens
  FOR ALL TO authenticated
  USING (org_id = 'temp-org');

CREATE POLICY portal_tokens_org_policy_anon ON portal_tokens
  FOR ALL TO anon
  USING (org_id = 'temp-org');

CREATE POLICY portal_invitations_org_policy ON portal_invitations
  FOR ALL TO authenticated
  USING (org_id = 'temp-org');

CREATE POLICY portal_invitations_org_policy_anon ON portal_invitations
  FOR ALL TO anon
  USING (org_id = 'temp-org');

CREATE POLICY portal_access_logs_org_policy ON portal_access_logs
  FOR ALL TO authenticated
  USING (org_id = 'temp-org');

CREATE POLICY portal_access_logs_org_policy_anon ON portal_access_logs
  FOR ALL TO anon
  USING (org_id = 'temp-org');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_tokens TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_invitations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_access_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_access_logs TO anon;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portal_users_org_email ON portal_users(org_id, email);
CREATE INDEX IF NOT EXISTS idx_portal_users_company ON portal_users(company_id);
CREATE INDEX IF NOT EXISTS idx_portal_users_contact ON portal_users(contact_id);
CREATE INDEX IF NOT EXISTS idx_portal_tokens_expires ON portal_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_portal_tokens_user ON portal_tokens(portal_user_id);
CREATE INDEX IF NOT EXISTS idx_portal_invitations_token ON portal_invitations(token);
CREATE INDEX IF NOT EXISTS idx_portal_invitations_expires ON portal_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_portal_access_logs_user ON portal_access_logs(portal_user_id);

-- Create function to clean expired tokens
CREATE OR REPLACE FUNCTION clean_expired_portal_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM portal_tokens WHERE expires_at < NOW();
  DELETE FROM portal_invitations WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to generate portal invitation
CREATE OR REPLACE FUNCTION generate_portal_invitation(
  p_org_id TEXT,
  p_company_id UUID DEFAULT NULL,
  p_contact_id UUID DEFAULT NULL,
  p_email TEXT,
  p_invited_by UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_invitation_id UUID;
BEGIN
  -- Generate unique token
  v_token := encode(gen_random_bytes(32), 'base64');
  
  -- Create invitation
  INSERT INTO portal_invitations (org_id, company_id, contact_id, email, invited_by, token)
  VALUES (p_org_id, p_company_id, p_contact_id, p_email, p_invited_by, v_token)
  RETURNING id INTO v_invitation_id;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- Insert sample portal users for testing
INSERT INTO portal_users (id, org_id, company_id, contact_id, email, status) VALUES
  ('pu_001', 'temp-org', NULL, NULL, 'customer@acme.com', 'active'),
  ('pu_002', 'temp-org', NULL, NULL, 'client@techstart.com', 'active')
ON CONFLICT (org_id, email) DO NOTHING;

-- Success message
SELECT 'Portal system migration completed successfully!' as status;
EOF

echo ""
echo "✅ Portal migration script ready!"
echo "📝 Copy the above SQL and paste it into Supabase SQL Editor"
echo "🚀 Then click 'Run' to create your Customer Portal system!"
echo ""
echo "🎯 This will create:"
echo "   • portal_users table"
echo "   • portal_tokens table"
echo "   • portal_invitations table"
echo "   • portal_access_logs table"
echo "   • All necessary indexes and functions"
echo "   • Sample portal users for testing"
echo ""
echo "✨ Your Customer Portal will be ready to use!"
echo ""
echo "🔗 Portal URLs:"
echo "   • Login: /portal/login"
echo "   • Dashboard: /portal"
echo "   • Orders: /portal/orders"
echo "   • Invoices: /portal/invoices"
echo "   • Quotes: /portal/quotes"
echo "   • Documents: /portal/documents"
echo "   • Profile: /portal/profile"
