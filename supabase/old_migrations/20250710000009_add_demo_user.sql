-- Add demo user for development
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'demo-user-id',
  'demo@saleguru.com',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Demo", "last_name": "User", "role": "admin"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Add demo user to users table if it doesn't exist
INSERT INTO users (
  uuid,
  email,
  first_name,
  last_name,
  role,
  is_owner,
  created_at,
  updated_at
) VALUES (
  'demo-user-id',
  'demo@saleguru.com',
  'Demo',
  'User',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (uuid) DO NOTHING; 