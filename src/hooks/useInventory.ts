import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

interface StockItem {
  id: string;
  org_id: string;
  product_id: string;
  location_id: string;
  qty: number;
  product_name?: string;
  location_name?: string;
}

interface StockMove {
  id: string;
  org_id: string;
  product_id: string;
  from_location_id: string | null;
  to_location_id: string | null;
  qty: number;
  reason: string;
  ref_table: string;
  ref_id: string;
  created_at: string;
}

interface Reservation {
  id: string;
  org_id: string;
  sales_order_id: string;
  product_id: string;
  qty: number;
  location_id: string;
  created_at: string;
}

export const useInventory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reserve stock for a sales order
  const reserveStock = useCallback(async (
    orgId: string,
    salesOrderId: string,
    lines: Array<{ product_id: string; location_id: string; qty: number }>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('reserve_stock', {
        p_org: orgId,
        p_sales_order: salesOrderId,
        p_lines: lines
      });

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Ship stock for a shipment
  const shipStock = useCallback(async (
    orgId: string,
    shipmentId: string,
    salesOrderId: string,
    lines: Array<{ product_id: string; location_id: string; qty: number }>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('ship_stock', {
        p_org: orgId,
        p_shipment: shipmentId,
        p_sales_order: salesOrderId,
        p_lines: lines
      });

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get stock items for a location
  const getStockItems = useCallback(async (orgId: string, locationId?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('stock_items')
        .select(`
          *,
          products:product_id(name),
          locations:location_id(name)
        `)
        .eq('org_id', orgId);

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(item => ({
        ...item,
        product_name: (item.products as any)?.name,
        location_name: (item.locations as any)?.name
      })) || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get stock moves for tracking
  const getStockMoves = useCallback(async (orgId: string, productId?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('stock_moves')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get reservations for a sales order
  const getReservations = useCallback(async (orgId: string, salesOrderId?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('so_reservations')
        .select('*')
        .eq('org_id', orgId);

      if (salesOrderId) {
        query = query.eq('sales_order_id', salesOrderId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
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
    reserveStock,
    shipStock,
    getStockItems,
    getStockMoves,
    getReservations,
    clearError
  };
};

