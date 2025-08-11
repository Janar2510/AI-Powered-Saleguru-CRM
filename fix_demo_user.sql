-- =====================================================
-- FIX DEMO USER - SUPABASE SQL EDITOR
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- 5. This will add a demo user with ID = 1
-- =====================================================

-- Add demo user to the users table
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

-- Verify the user was created
SELECT * FROM public.users WHERE id = 1; 