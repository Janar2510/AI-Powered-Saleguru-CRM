import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export type FeatureFlags = {
  ai_guru_enabled: boolean;
  analytics_enabled: boolean;
  marketplace_enabled: boolean;
};

export function useFeatureFlags(orgId?: string) {
  const [flags, setFlags] = useState<FeatureFlags>({
    ai_guru_enabled: true,
    analytics_enabled: true,
    marketplace_enabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!orgId) {
          const saved = localStorage.getItem('feature_flags');
          if (saved) setFlags(JSON.parse(saved));
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('feature_flags')
          .select('ai_guru_enabled, analytics_enabled, marketplace_enabled')
          .eq('org_id', orgId)
          .maybeSingle();
        if (error) throw error;
        if (data) setFlags(data as FeatureFlags);
      } catch (e) {
        console.warn('useFeatureFlags fallback', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [orgId]);

  return { flags, loading } as const;
}

