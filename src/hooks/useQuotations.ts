import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useToast } from './useToast';

export interface QuotationItem {
  id: string;
  quotation_id: string;
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

export interface Quotation {
  id: string;
  user_id: string;
  customer_id: string;
  quotation_number: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until?: string;
  subject?: string;
  terms_conditions?: string;
  notes?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  incoterms?: string;
  delivery_address?: string;
  billing_address?: string;
  created_at: string;
  updated_at: string;
  items?: QuotationItem[];
  customer?: any;
}

export interface CreateQuotationData {
  customer_id: string;
  subject?: string;
  terms_conditions?: string;
  notes?: string;
  valid_until?: string;
  currency?: string;
  incoterms?: string;
  delivery_address?: string;
  billing_address?: string;
  items?: Omit<QuotationItem, 'id' | 'quotation_id' | 'created_at'>[];
}

export interface UpdateQuotationData extends Partial<CreateQuotationData> {
  id: string;
}

export const useQuotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch all quotations with customer and items
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customer:customers(*),
          items:quotation_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuotations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotations');
      showToast('Error fetching quotations', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new quotation
  const createQuotation = async (quotationData: CreateQuotationData): Promise<Quotation | null> => {
    try {
      setError(null);

      // Generate quotation number
      const { data: numberData, error: numberError } = await supabase
        .rpc('generate_quotation_number');

      if (numberError) throw numberError;

      const quotationNumber = numberData;

      // Create quotation
      const { data, error } = await supabase
        .from('quotations')
        .insert([{
          ...quotationData,
          quotation_number: quotationNumber,
          status: 'draft'
        }])
        .select(`
          *,
          customer:customers(*),
          items:quotation_items(*)
        `)
        .single();

      if (error) throw error;

      // Add items if provided
      if (quotationData.items && quotationData.items.length > 0) {
        const items = quotationData.items.map(item => ({
          ...item,
          quotation_id: data.id,
          line_total: item.quantity * item.unit_price * (1 - item.discount_percent / 100)
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      setQuotations(prev => [data, ...prev]);
      showToast('Quotation created successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create quotation';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Update quotation
  const updateQuotation = async (quotationData: UpdateQuotationData): Promise<Quotation | null> => {
    try {
      setError(null);

      const { id, items, ...updateData } = quotationData;

      const { data, error } = await supabase
        .from('quotations')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          customer:customers(*),
          items:quotation_items(*)
        `)
        .single();

      if (error) throw error;

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', id);

        // Insert new items
        const newItems = items.map(item => ({
          ...item,
          quotation_id: id,
          line_total: item.quantity * item.unit_price * (1 - item.discount_percent / 100)
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(newItems);

        if (itemsError) throw itemsError;
      }

      setQuotations(prev => prev.map(quotation => 
        quotation.id === id ? data : quotation
      ));
      showToast('Quotation updated successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quotation';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Delete quotation
  const deleteQuotation = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuotations(prev => prev.filter(quotation => quotation.id !== id));
      showToast('Quotation deleted successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete quotation';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Get quotation by ID
  const getQuotation = async (id: string): Promise<Quotation | null> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customer:customers(*),
          items:quotation_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quotation';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Convert quotation to sales order
  const convertToSalesOrder = async (quotationId: string): Promise<any> => {
    try {
      setError(null);

      const quotation = await getQuotation(quotationId);
      if (!quotation) throw new Error('Quotation not found');

      // Generate sales order number
      const { data: orderNumber, error: numberError } = await supabase
        .rpc('generate_sales_order_number');

      if (numberError) throw numberError;

      // Create sales order
      const { data: salesOrder, error: orderError } = await supabase
        .from('sales_orders')
        .insert([{
          customer_id: quotation.customer_id,
          quotation_id: quotationId,
          order_number: orderNumber,
          status: 'confirmed',
          order_date: new Date().toISOString().split('T')[0],
          subtotal: quotation.subtotal,
          tax_amount: quotation.tax_amount,
          discount_amount: quotation.discount_amount,
          total_amount: quotation.total_amount,
          currency: quotation.currency,
          shipping_address: quotation.delivery_address,
          billing_address: quotation.billing_address,
          notes: `Converted from quotation ${quotation.quotation_number}`
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Convert quotation items to sales order items
      if (quotation.items && quotation.items.length > 0) {
        const orderItems = quotation.items.map(item => ({
          sales_order_id: salesOrder.id,
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
          .from('sales_order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // Update quotation status
      await updateQuotation({ id: quotationId, status: 'accepted' });

      showToast('Quotation converted to sales order successfully', 'success');
      return salesOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert quotation';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Send quotation (update status)
  const sendQuotation = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('quotations')
        .update({ status: 'sent' })
        .eq('id', id);

      if (error) throw error;

      setQuotations(prev => prev.map(quotation => 
        quotation.id === id ? { ...quotation, status: 'sent' } : quotation
      ));
      showToast('Quotation sent successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send quotation';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Filter quotations by status
  const filterQuotationsByStatus = async (status: string): Promise<Quotation[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customer:customers(*),
          items:quotation_items(*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter quotations';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Search quotations
  const searchQuotations = async (query: string): Promise<Quotation[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customer:customers(*),
          items:quotation_items(*)
        `)
        .or(`quotation_number.ilike.%${query}%,subject.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search quotations';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchQuotations();
  }, []);

  return {
    quotations,
    loading,
    error,
    fetchQuotations,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    getQuotation,
    convertToSalesOrder,
    sendQuotation,
    filterQuotationsByStatus,
    searchQuotations,
  };
}; 