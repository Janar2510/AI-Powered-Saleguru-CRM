-- =====================================================
-- CREATE DEMO USER FOR LOGIN
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- 5. Then try logging in with: demo@saleguru.com / demo123456
-- =====================================================

-- First, create the demo user in Supabase Auth
-- Note: This may not work directly in SQL Editor, but try it first
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'demo@saleguru.com',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Demo", "last_name": "User"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Alternative: If auth insert doesn't work, just create a user_profiles entry
-- and use Supabase Dashboard to manually create the auth user
INSERT INTO public.user_profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  onboarding_completed,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'demo@saleguru.com',
  'Demo',
  'User',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Also create a fallback users table entry if it exists
INSERT INTO public.users (
  email,
  name,
  role,
  points,
  badges
) VALUES (
  'demo@saleguru.com',
  'Demo User',
  'admin',
  1000,
  ARRAY['demo_user']
) ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT 'User created successfully!' as message, email, first_name, last_name 
FROM public.user_profiles 
WHERE email = 'demo@saleguru.com';

