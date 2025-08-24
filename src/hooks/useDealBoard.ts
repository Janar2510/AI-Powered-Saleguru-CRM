import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../services/supabase";

export function daysSince(dateIso: string | null | undefined): number {
  if (!dateIso) return 0;
  const date = new Date(dateIso);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function useDealBoard(orgId: string) {
  const qc = useQueryClient();

  const { data: stages = [] } = useQuery({
    queryKey: ['stages', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('org_id', orgId)
        .order('position');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_with_refs_v')
        .select('*')
        .eq('org_id', orgId);
      if (error) throw error;
      return data || [];
    },
  });

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, toStageId }: { dealId: string; toStageId: string }) => {
      const { error } = await supabase
        .from('deals')
        .update({ stage_id: toStageId })
        .eq('id', dealId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals', orgId] });
    },
  });

  const createDeal = useMutation({
    mutationFn: async (dealData: any) => {
      const { data, error } = await supabase
        .from('deals')
        .insert([{ ...dealData, org_id: orgId }])
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals', orgId] });
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ dealId, status }: { dealId: string; status: string }) => {
      const { error } = await supabase
        .from('deals')
        .update({ status })
        .eq('id', dealId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals', orgId] });
    },
  });

  return {
    stages,
    deals,
    moveDeal,
    createDeal,
    setStatus,
  };
}
