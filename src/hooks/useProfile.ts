import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export interface Profile {
  id: string;
  org_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return { profile, isLoading, error };
}
