import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useToast } from './useToast';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent: number;
  line_total: number;
  variant_id?: string;
  variant_attributes?: any;
  sort_order: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  customer_id: string;
  sales_order_id?: string;
  invoice_number: string;
  invoice_type: 'standard' | 'proforma' | 'credit_note';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date?: string;
  payment_terms?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  exchange_rate: number;
  billing_address?: string;
  shipping_address?: string;
  notes?: string;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
  customer?: any;
  sales_order?: any;
}

export interface CreateInvoiceData {
  customer_id: string;
  sales_order_id?: string;
  invoice_type?: 'standard' | 'proforma' | 'credit_note';
  invoice_date?: string;
  due_date?: string;
  payment_terms?: string;
  shipping_amount?: number;
  discount_amount?: number;
  currency?: string;
  exchange_rate?: number;
  billing_address?: string;
  shipping_address?: string;
  notes?: string;
  terms_conditions?: string;
  items?: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[];
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  id: string;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch all invoices with customer, sales order and items
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*),
          sales_order:sales_orders(*),
          items:invoice_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      showToast('Error fetching invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new invoice
  const createInvoice = async (invoiceData: CreateInvoiceData): Promise<Invoice | null> => {
    try {
      setError(null);

      // Generate invoice number
      const { data: numberData, error: numberError } = await supabase
        .rpc('generate_invoice_number');

      if (numberError) throw numberError;

      const invoiceNumber = numberData;

      // Create invoice
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          invoice_number: invoiceNumber,
          status: 'draft',
          invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
          paid_amount: 0
        }])
        .select(`
          *,
          customer:customers(*),
          sales_order:sales_orders(*),
          items:invoice_items(*)
        `)
        .single();

      if (error) throw error;

      // Add items if provided
      if (invoiceData.items && invoiceData.items.length > 0) {
        const items = invoiceData.items.map(item => ({
          ...item,
          invoice_id: data.id,
          line_total: item.quantity * item.unit_price * (1 - item.discount_percent / 100)
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      setInvoices(prev => [data, ...prev]);
      showToast('Invoice created successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Create invoice from sales order
  const createInvoiceFromSalesOrder = async (salesOrderId: string): Promise<Invoice | null> => {
    try {
      setError(null);

      // Get sales order data
      const { data: salesOrder, error: orderError } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customer:customers(*),
          items:sales_order_items(*)
        `)
        .eq('id', salesOrderId)
        .single();

      if (orderError) throw orderError;

      // Generate invoice number
      const { data: numberData, error: numberError } = await supabase
        .rpc('generate_invoice_number');

      if (numberError) throw numberError;

      const invoiceNumber = numberData;

      // Create invoice from sales order
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          customer_id: salesOrder.customer_id,
          sales_order_id: salesOrderId,
          invoice_number: invoiceNumber,
          invoice_type: 'standard',
          status: 'draft',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: salesOrder.delivery_date,
          subtotal: salesOrder.subtotal,
          tax_amount: salesOrder.tax_amount,
          shipping_amount: salesOrder.shipping_amount,
          discount_amount: salesOrder.discount_amount,
          total_amount: salesOrder.total_amount,
          currency: salesOrder.currency,
          shipping_address: salesOrder.shipping_address,
          billing_address: salesOrder.billing_address,
          paid_amount: 0
        }])
        .select(`
          *,
          customer:customers(*),
          sales_order:sales_orders(*),
          items:invoice_items(*)
        `)
        .single();

      if (error) throw error;

      // Convert sales order items to invoice items
      if (salesOrder.items && salesOrder.items.length > 0) {
        const invoiceItems = salesOrder.items.map(item => ({
          invoice_id: data.id,
          product_id: item.product_id,
          product_name: item.product_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          discount_percent: item.discount_percent,
          line_total: item.line_total,
          variant_id: item.variant_id,
          variant_attributes: item.variant_attributes,
          sort_order: item.sort_order
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      setInvoices(prev => [data, ...prev]);
      showToast('Invoice created from sales order successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice from sales order';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Update invoice
  const updateInvoice = async (invoiceData: UpdateInvoiceData): Promise<Invoice | null> => {
    try {
      setError(null);

      const { id, items, ...updateData } = invoiceData;

      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          customer:customers(*),
          sales_order:sales_orders(*),
          items:invoice_items(*)
        `)
        .single();

      if (error) throw error;

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);

        // Insert new items
        const newItems = items.map(item => ({
          ...item,
          invoice_id: id,
          line_total: item.quantity * item.unit_price * (1 - item.discount_percent / 100)
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(newItems);

        if (itemsError) throw itemsError;
      }

      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? data : invoice
      ));
      showToast('Invoice updated successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Delete invoice
  const deleteInvoice = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      showToast('Invoice deleted successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Get invoice by ID
  const getInvoice = async (id: string): Promise<Invoice | null> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*),
          sales_order:sales_orders(*),
          items:invoice_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoice';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Update invoice status
  const updateInvoiceStatus = async (id: string, status: Invoice['status']): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { ...invoice, status } : invoice
      ));
      showToast(`Invoice status updated to ${status}`, 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice status';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Record payment
  const recordPayment = async (id: string, amount: number): Promise<boolean> => {
    try {
      setError(null);

      const invoice = await getInvoice(id);
      if (!invoice) throw new Error('Invoice not found');

      const newPaidAmount = invoice.paid_amount + amount;
      const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 'partial';

      const { error } = await supabase
        .from('invoices')
        .update({ 
          paid_amount: newPaidAmount,
          status: newStatus
        })
        .eq('id', id);

      if (error) throw error;

      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { 
          ...invoice, 
          paid_amount: newPaidAmount,
          status: newStatus
        } : invoice
      ));
      showToast(`Payment of ${amount} recorded successfully`, 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record payment';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Filter invoices by status
  const filterInvoicesByStatus = async (status: string): Promise<Invoice[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*),
          sales_order:sales_orders(*),
          items:invoice_items(*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter invoices';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Filter invoices by type
  const filterInvoicesByType = async (type: string): Promise<Invoice[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*),
          sales_order:sales_orders(*),
          items:invoice_items(*)
        `)
        .eq('invoice_type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter invoices';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Search invoices
  const searchInvoices = async (query: string): Promise<Invoice[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*),
          sales_order:sales_orders(*),
          items:invoice_items(*)
        `)
        .or(`invoice_number.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search invoices';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Get overdue invoices
  const getOverdueInvoices = async (): Promise<Invoice[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*),
          sales_order:sales_orders(*),
          items:invoice_items(*)
        `)
        .lt('due_date', new Date().toISOString().split('T')[0])
        .neq('status', 'paid')
        .neq('status', 'cancelled')
        .order('due_date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch overdue invoices';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    createInvoiceFromSalesOrder,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    updateInvoiceStatus,
    recordPayment,
    filterInvoicesByStatus,
    filterInvoicesByType,
    searchInvoices,
    getOverdueInvoices,
  };
}; 