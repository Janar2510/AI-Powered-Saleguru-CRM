import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export function useCommercial(orgId?: string, dealId?: string) {
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ['commercial', orgId, dealId],
    enabled: !!orgId && !!dealId,
    queryFn: async () => {
      const { data: quotes } = await supabase.from('quotes').select('*').eq('org_id', orgId!).eq('deal_id', dealId!);
      const { data: orders } = await supabase.from('sales_orders').select('*').eq('org_id', orgId!).eq('deal_id', dealId!);
      const { data: invoices } = await supabase.from('invoices').select('*').eq('org_id', orgId!).eq('deal_id', dealId!);
      return { quotes: quotes||[], orders: orders||[], invoices: invoices||[] };
    }
  });

  const createQuote = useMutation({
    mutationFn: async (payload: { currency?: string; items: Array<{ description: string; qty: number; unit_price_cents: number; product_id?: string | null }> }) => {
      if (!orgId || !dealId) throw new Error('Missing org/deal');
      const { data: qrow, error } = await supabase.from('quotes').insert({ org_id: orgId, deal_id: dealId, currency: payload.currency || 'EUR' }).select('id').single();
      if (error) throw error;
      const rows = payload.items.map(it => ({ quote_id: qrow.id, description: it.description, qty: it.qty, unit_price_cents: it.unit_price_cents, line_total_cents: Math.round(it.qty * it.unit_price_cents) }));
      const { error: e2 } = await supabase.from('quote_items').insert(rows);
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['commercial', orgId, dealId] })
  });

  const quoteToSO = useMutation({
    mutationFn: async (quoteId: string) => {
      if (!orgId || !dealId) throw new Error('Missing org/deal');
      const { data: qitems } = await supabase.from('quote_items').select('*').eq('quote_id', quoteId);
      const { data: soRow, error } = await supabase.from('sales_orders').insert({ org_id: orgId, deal_id: dealId, quote_id: quoteId }).select('id').single();
      if (error) throw error;
      if (qitems && qitems.length) {
        const rows = qitems.map(it => ({ sales_order_id: soRow.id, product_id: it.product_id, description: it.description, qty: it.qty, unit_price_cents: it.unit_price_cents, line_total_cents: it.line_total_cents }));
        const { error: e2 } = await supabase.from('sales_order_items').insert(rows);
        if (e2) throw e2;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['commercial', orgId, dealId] })
  });

  const soToInvoice = useMutation({
    mutationFn: async (soId: string) => {
      if (!orgId || !dealId) throw new Error('Missing org/deal');
      const { data: items } = await supabase.from('sales_order_items').select('*').eq('sales_order_id', soId);
      const { data: invRow, error } = await supabase.from('invoices').insert({ org_id: orgId, deal_id: dealId, sales_order_id: soId }).select('id').single();
      if (error) throw error;
      if (items && items.length) {
        const rows = items.map(it => ({ invoice_id: invRow.id, product_id: it.product_id, description: it.description, qty: it.qty, unit_price_cents: it.unit_price_cents, line_total_cents: it.line_total_cents }));
        const { error: e2 } = await supabase.from('invoice_items').insert(rows);
        if (e2) throw e2;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['commercial', orgId, dealId] })
  });

  return { ...q, createQuote, quoteToSO, soToInvoice } as const;
}
