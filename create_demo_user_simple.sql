-- =====================================================
-- SIMPLE DEMO USER CREATION (NO CONFLICTS)
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- 5. Then try logging in with: demo@saleguru.com / demo123456
-- =====================================================

-- Method 1: Check what tables exist first
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_profiles', 'profiles');

-- Method 2: Try to insert into user_profiles without conflict handling
DO $$
BEGIN
  -- Check if user_profiles table exists and try to insert
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    -- Try to insert the demo user
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'demo@saleguru.com') THEN
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
      );
      RAISE NOTICE 'Demo user created in user_profiles table';
    ELSE
      RAISE NOTICE 'Demo user already exists in user_profiles table';
    END IF;
  END IF;

  -- Check if users table exists and try to insert
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'demo@saleguru.com') THEN
      INSERT INTO public.users (
        email,
        name,
        role
      ) VALUES (
        'demo@saleguru.com',
        'Demo User',
        'admin'
      );
      RAISE NOTICE 'Demo user created in users table';
    ELSE
      RAISE NOTICE 'Demo user already exists in users table';
    END IF;
  END IF;

  -- Check if profiles table exists and try to insert
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'demo@saleguru.com') THEN
      INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        'demo@saleguru.com',
        'Demo',
        'User',
        'admin',
        now(),
        now()
      );
      RAISE NOTICE 'Demo user created in profiles table';
    ELSE
      RAISE NOTICE 'Demo user already exists in profiles table';
    END IF;
  END IF;

END $$;

-- Show what was created
SELECT 'Results:' as info;

-- Check user_profiles
SELECT 'user_profiles' as table_name, email, first_name, last_name, role
FROM public.user_profiles 
WHERE email = 'demo@saleguru.com'
UNION ALL
-- Check users
SELECT 'users' as table_name, email, name as first_name, '' as last_name, role
FROM public.users 
WHERE email = 'demo@saleguru.com'
UNION ALL
-- Check profiles
SELECT 'profiles' as table_name, email, first_name, last_name, role
FROM public.profiles 
WHERE email = 'demo@saleguru.com';

