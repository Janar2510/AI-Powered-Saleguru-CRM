import { createClient } from '@supabase/supabase-js';
import { config, validateEnvironment, isSupabaseConfigured } from '../utils/config';

// Validate environment variables on import
if (typeof window !== 'undefined') {
  try {
    validateEnvironment();
  } catch (error) {
    console.warn('Environment validation failed:', error);
  }
}

// Create Supabase client with fallback for missing configuration
export const supabase = isSupabaseConfigured()
  ? createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Helper function to check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Helper function to get Supabase client with error handling
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please check your environment variables.'
    );
  }
  return supabase;
};

// Type for Supabase client
export type SupabaseClient = NonNullable<typeof supabase>; 