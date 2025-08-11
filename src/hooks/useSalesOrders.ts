import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useToast } from './useToast';

export interface SalesOrderItem {
  id: string;
  sales_order_id: string;
  product_id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  delivered_quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent: number;
  line_total: number;
  variant_id?: string;
  variant_attributes?: any;
  sort_order: number;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  user_id: string;
  customer_id: string;
  quotation_id?: string;
  order_number: string;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  order_date: string;
  delivery_date?: string;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  payment_method?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: SalesOrderItem[];
  customer?: any;
  quotation?: any;
}

export interface CreateSalesOrderData {
  customer_id: string;
  quotation_id?: string;
  delivery_date?: string;
  payment_method?: string;
  shipping_amount?: number;
  discount_amount?: number;
  currency?: string;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  items?: Omit<SalesOrderItem, 'id' | 'sales_order_id' | 'created_at'>[];
}

export interface UpdateSalesOrderData extends Partial<CreateSalesOrderData> {
  id: string;
}

export const useSalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch all sales orders with customer, quotation and items
  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customer:customers(*),
          quotation:quotations(*),
          items:sales_order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSalesOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales orders');
      showToast('Error fetching sales orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new sales order
  const createSalesOrder = async (orderData: CreateSalesOrderData): Promise<SalesOrder | null> => {
    try {
      setError(null);

      // Generate sales order number
      const { data: numberData, error: numberError } = await supabase
        .rpc('generate_sales_order_number');

      if (numberError) throw numberError;

      const orderNumber = numberData;

      // Create sales order
      const { data, error } = await supabase
        .from('sales_orders')
        .insert([{
          ...orderData,
          order_number: orderNumber,
          status: 'draft',
          order_date: new Date().toISOString().split('T')[0],
          payment_status: 'pending'
        }])
        .select(`
          *,
          customer:customers(*),
          quotation:quotations(*),
          items:sales_order_items(*)
        `)
        .single();

      if (error) throw error;

      // Add items if provided
      if (orderData.items && orderData.items.length > 0) {
        const items = orderData.items.map(item => ({
          ...item,
          sales_order_id: data.id,
          line_total: item.quantity * item.unit_price * (1 - item.discount_percent / 100)
        }));

        const { error: itemsError } = await supabase
          .from('sales_order_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      setSalesOrders(prev => [data, ...prev]);
      showToast('Sales order created successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sales order';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Update sales order
  const updateSalesOrder = async (orderData: UpdateSalesOrderData): Promise<SalesOrder | null> => {
    try {
      setError(null);

      const { id, items, ...updateData } = orderData;

      const { data, error } = await supabase
        .from('sales_orders')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          customer:customers(*),
          quotation:quotations(*),
          items:sales_order_items(*)
        `)
        .single();

      if (error) throw error;

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('sales_order_items')
          .delete()
          .eq('sales_order_id', id);

        // Insert new items
        const newItems = items.map(item => ({
          ...item,
          sales_order_id: id,
          line_total: item.quantity * item.unit_price * (1 - item.discount_percent / 100)
        }));

        const { error: itemsError } = await supabase
          .from('sales_order_items')
          .insert(newItems);

        if (itemsError) throw itemsError;
      }

      setSalesOrders(prev => prev.map(order => 
        order.id === id ? data : order
      ));
      showToast('Sales order updated successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update sales order';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Delete sales order
  const deleteSalesOrder = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSalesOrders(prev => prev.filter(order => order.id !== id));
      showToast('Sales order deleted successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sales order';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Get sales order by ID
  const getSalesOrder = async (id: string): Promise<SalesOrder | null> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customer:customers(*),
          quotation:quotations(*),
          items:sales_order_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales order';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Update order status
  const updateOrderStatus = async (id: string, status: SalesOrder['status']): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('sales_orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setSalesOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status } : order
      ));
      showToast(`Order status updated to ${status}`, 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Update payment status
  const updatePaymentStatus = async (id: string, paymentStatus: SalesOrder['payment_status']): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('sales_orders')
        .update({ payment_status: paymentStatus })
        .eq('id', id);

      if (error) throw error;

      setSalesOrders(prev => prev.map(order => 
        order.id === id ? { ...order, payment_status: paymentStatus } : order
      ));
      showToast(`Payment status updated to ${paymentStatus}`, 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment status';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Update delivered quantities
  const updateDeliveredQuantities = async (orderId: string, itemUpdates: { id: string; delivered_quantity: number }[]): Promise<boolean> => {
    try {
      setError(null);

      for (const update of itemUpdates) {
        const { error } = await supabase
          .from('sales_order_items')
          .update({ delivered_quantity: update.delivered_quantity })
          .eq('id', update.id);

        if (error) throw error;
      }

      // Refresh the order data
      await fetchSalesOrders();
      showToast('Delivered quantities updated successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update delivered quantities';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Filter orders by status
  const filterOrdersByStatus = async (status: string): Promise<SalesOrder[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customer:customers(*),
          quotation:quotations(*),
          items:sales_order_items(*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter orders';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Filter orders by payment status
  const filterOrdersByPaymentStatus = async (paymentStatus: string): Promise<SalesOrder[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customer:customers(*),
          quotation:quotations(*),
          items:sales_order_items(*)
        `)
        .eq('payment_status', paymentStatus)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter orders';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Search orders
  const searchOrders = async (query: string): Promise<SalesOrder[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customer:customers(*),
          quotation:quotations(*),
          items:sales_order_items(*)
        `)
        .or(`order_number.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search orders';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Bulk operations
  const bulkUpdateOrderStatus = async (ids: string[], status: SalesOrder['status']): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('sales_orders')
        .update({ status })
        .in('id', ids);

      if (error) throw error;

      setSalesOrders(prev => prev.map(order => 
        ids.includes(order.id) ? { ...order, status } : order
      ));
      showToast(`${ids.length} orders updated to ${status}`, 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update orders';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchSalesOrders();
  }, []);

  return {
    salesOrders,
    loading,
    error,
    fetchSalesOrders,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    getSalesOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateDeliveredQuantities,
    filterOrdersByStatus,
    filterOrdersByPaymentStatus,
    searchOrders,
    bulkUpdateOrderStatus,
  };
}; 