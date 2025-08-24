import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export function useAutomations(orgId?: string) {
  return useQuery({
    queryKey: ['automations', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from('automations')
        .select('*')
        .eq('org_id', orgId!);
      return data || [];
    }
  });
}

export function useGenerateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ org_id, goal }: { org_id: string; goal: string }) => {
      const { data, error } = await supabase.functions.invoke('automation-generate', { 
        body: { org_id, goal }
      });
      if (error) throw error; 
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] })
  });
}

export function useAutomationRuns(orgId?: string) {
  return useQuery({
    queryKey: ['automation-runs', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from('automation_runs')
        .select('*')
        .eq('org_id', orgId!)
        .order('started_at', { ascending: false })
        .limit(50);
      return data || [];
    }
  });
}

export function useUpdateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('automations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] })
  });
}

export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] })
  });
}
