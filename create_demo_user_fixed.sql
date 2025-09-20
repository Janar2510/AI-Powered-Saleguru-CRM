-- =====================================================
-- FIXED DEMO USER CREATION (HANDLES FOREIGN KEYS)
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- 5. Then try logging in with: demo@saleguru.com / demo123456
-- =====================================================

DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Generate a UUID that we'll use consistently
  user_uuid := gen_random_uuid();
  
  RAISE NOTICE 'Creating demo user with UUID: %', user_uuid;

  -- First, create the user in the users table (parent table)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'demo@saleguru.com') THEN
      INSERT INTO public.users (
        id,
        email,
        name,
        role,
        created_at,
        updated_at
      ) VALUES (
        user_uuid,
        'demo@saleguru.com',
        'Demo User',
        'admin',
        now(),
        now()
      );
      RAISE NOTICE 'Demo user created in users table with ID: %', user_uuid;
    ELSE
      -- Get existing user UUID
      SELECT id INTO user_uuid FROM public.users WHERE email = 'demo@saleguru.com' LIMIT 1;
      RAISE NOTICE 'Demo user already exists in users table with ID: %', user_uuid;
    END IF;
  END IF;

  -- Now create the user_profiles entry using the same UUID
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
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
        user_uuid,  -- Use the same UUID from users table
        'demo@saleguru.com',
        'Demo',
        'User',
        'admin',
        true,
        now(),
        now()
      );
      RAISE NOTICE 'Demo user profile created with ID: %', user_uuid;
    ELSE
      RAISE NOTICE 'Demo user profile already exists';
    END IF;
  END IF;

  -- Also handle profiles table if it exists
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
        user_uuid,  -- Use the same UUID
        'demo@saleguru.com',
        'Demo',
        'User',
        'admin',
        now(),
        now()
      );
      RAISE NOTICE 'Demo user created in profiles table with ID: %', user_uuid;
    ELSE
      RAISE NOTICE 'Demo user already exists in profiles table';
    END IF;
  END IF;

END $$;

-- Verify what was created
SELECT 'Verification Results:' as info;

-- Show the created user
SELECT 
  'users' as table_name, 
  id,
  email, 
  name,
  role,
  created_at
FROM public.users 
WHERE email = 'demo@saleguru.com'

UNION ALL

SELECT 
  'user_profiles' as table_name,
  id,
  email,
  first_name || ' ' || last_name as name,
  role,
  created_at
FROM public.user_profiles 
WHERE email = 'demo@saleguru.com';


