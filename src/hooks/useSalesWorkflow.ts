import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useSalesWorkflow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert Quote to Pro Forma
  const quoteToProforma = useCallback(async (quoteId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('quote_to_proforma', { 
        p_quote: quoteId 
      });

      if (error) throw error;

      return { success: true, proformaId: data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert Pro Forma to Sales Order
  const proformaToSalesOrder = useCallback(async (proformaId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('proforma_to_sales_order', { 
        p_proforma: proformaId 
      });

      if (error) throw error;

      return { success: true, salesOrderId: data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert Sales Order to Invoice
  const salesOrderToInvoice = useCallback(async (salesOrderId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('sales_order_to_invoice', { 
        p_sales_order: salesOrderId 
      });

      if (error) throw error;

      return { success: true, invoiceId: data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    quoteToProforma,
    proformaToSalesOrder,
    salesOrderToInvoice,
    clearError
  };
};

