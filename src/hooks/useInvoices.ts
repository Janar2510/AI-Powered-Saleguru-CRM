import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price_cents: number;
  discount_percent: number;
  tax_percent: number;
  line_total_cents: number;
  created_at: string;
  updated_at: string;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount_cents: number;
  currency: string;
  payment_method: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'other';
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  contact_id?: string;
  organization_id?: string;
  deal_id?: string;
  quote_id?: string;
  
  // Legacy fields (from existing schema)
  number?: string;
  amount?: number;
  date?: string;
  partner_name?: string;
  partner_id?: string;
  customer_name?: string;
  customer_id?: string;
  
  // Invoice details
  invoice_date: string;
  due_date?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  
  // Financial details (cents)
  subtotal_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  paid_cents: number;
  
  // Financial details (legacy decimal)
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  currency: string;
  
  // Additional info
  notes?: string;
  terms_conditions?: string;
  payment_terms?: string;
  billing_address?: string;
  shipping_address?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations
  contact?: any;
  organization?: any;
  deal?: any;
  quote?: any;
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
}

export interface CreateInvoiceData {
  contact_id?: string;
  organization_id?: string;
  deal_id?: string;
  quote_id?: string;
  invoice_date?: string;
  due_date?: string;
  currency?: string;
  notes?: string;
  terms_conditions?: string;
  payment_terms?: string;
  billing_address?: string;
  shipping_address?: string;
  items: {
    product_id?: string;
    product_name: string;
    product_sku?: string;
    description?: string;
    quantity: number;
    unit_price_cents: number;
    discount_percent?: number;
    tax_percent?: number;
  }[];
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastContext();

  // Fetch all invoices
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Calculate balance for each invoice
      const invoicesWithBalance = (data || []).map(invoice => ({
        ...invoice,
        balance_cents: invoice.total_cents - invoice.paid_cents
      }));

      setInvoices(invoicesWithBalance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      
      // Fallback to sample data
      setInvoices([
        {
          id: 'inv_001',
          invoice_number: 'INV-1001',
          contact_id: 'contact_001',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'sent' as const,
          subtotal_cents: 100000,
          tax_cents: 10000,
          discount_cents: 0,
          total_cents: 110000,
          paid_cents: 0,
          currency: 'EUR',
          notes: 'Sample invoice',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          contact: { id: 'contact_001', name: 'John Doe', email: 'john@example.com', company: 'Acme Corp' },
          items: [
            {
              id: 'item_001',
              invoice_id: 'inv_001',
              product_name: 'CRM License',
              quantity: 1,
              unit_price_cents: 100000,
              discount_percent: 0,
              tax_percent: 10,
              line_total_cents: 100000,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          payments: []
        }
      ]);
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

      // Calculate totals
      const subtotalCents = invoiceData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price_cents * (1 - (item.discount_percent || 0) / 100)), 0
      );
      
      const taxCents = invoiceData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price_cents * (1 - (item.discount_percent || 0) / 100) * (item.tax_percent || 0) / 100), 0
      );

      const totalCents = subtotalCents + taxCents;

      // Create invoice
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          invoice_number: invoiceNumber,
          subtotal_cents: Math.round(subtotalCents),
          tax_cents: Math.round(taxCents),
          total_cents: Math.round(totalCents),
          status: 'draft'
        }])
        .select(`
          *,
          contact:contacts(id, name, email, company),
          organization:organizations(id, name, email),
          deal:deals(id, title, value),
          quote:quotes(id, quote_number)
        `)
        .single();

      if (error) throw error;

      // Add items
      if (invoiceData.items && invoiceData.items.length > 0) {
        const items = invoiceData.items.map(item => ({
          ...item,
          invoice_id: data.id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      setInvoices(prev => [{ ...data, items: invoiceData.items, payments: [] }, ...prev]);
      showToast('Invoice created successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Update invoice status
  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId);

      if (error) throw error;

      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId ? { ...invoice, status } : invoice
      ));

      showToast(`Invoice marked as ${status}`, 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice status';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Record payment
  const recordPayment = async (
    invoiceId: string, 
    paymentData: {
      amount_cents: number;
      payment_date?: string;
      payment_method?: InvoicePayment['payment_method'];
      reference_number?: string;
      notes?: string;
    }
  ): Promise<boolean> => {
    try {
      setError(null);

      // Record payment
      const { error: paymentError } = await supabase
        .from('invoice_payments')
        .insert([{
          invoice_id: invoiceId,
          ...paymentData,
          payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0]
        }]);

      if (paymentError) throw paymentError;

      // Update invoice paid amount
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        const newPaidCents = invoice.paid_cents + paymentData.amount_cents;
        let newStatus: Invoice['status'] = 'partially_paid';
        
        if (newPaidCents >= invoice.total_cents) {
          newStatus = 'paid';
        }

        const { error: updateError } = await supabase
          .from('invoices')
          .update({ 
            paid_cents: newPaidCents,
            status: newStatus
          })
          .eq('id', invoiceId);

        if (updateError) throw updateError;
      }

      await fetchInvoices(); // Refresh to get updated data
      showToast('Payment recorded successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record payment';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Convert quote to invoice
  const convertQuoteToInvoice = async (quoteId: string): Promise<Invoice | null> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .rpc('convert_quote_to_invoice', { quote_id_param: quoteId });

      if (error) throw error;

      await fetchInvoices(); // Refresh to get the new invoice
      showToast('Quote converted to invoice successfully', 'success');
      
      // Return the created invoice
      const newInvoice = invoices.find(inv => inv.id === data);
      return newInvoice || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert quote to invoice';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      showToast('Invoice deleted successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoiceStatus,
    recordPayment,
    convertQuoteToInvoice,
    deleteInvoice
  };
};