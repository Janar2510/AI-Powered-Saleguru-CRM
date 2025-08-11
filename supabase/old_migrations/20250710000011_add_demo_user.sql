-- Add demo user for development
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  1, -- Use ID 1 to match the expected owner_id
  'demo@saleguru.com',
  'Demo',
  'User',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Also add the demo user to auth.users if it doesn't exist
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
  'demo-user-id'::uuid,
  'demo@saleguru.com',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Demo", "last_name": "User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING; 