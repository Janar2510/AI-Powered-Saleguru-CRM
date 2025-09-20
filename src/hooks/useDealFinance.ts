import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface QuoteItem {
  id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  tax_percent?: number;
  line_total: number;
}

export interface CreateQuoteData {
  deal_id: string;
  quote_number?: string;
  title: string;
  description?: string;
  items: QuoteItem[];
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  valid_until: string;
  terms_conditions?: string;
  notes?: string;
}

export interface CreateOrderData {
  quote_id: string;
  order_number?: string;
  customer_po_number?: string;
  shipping_address?: string;
  billing_address?: string;
  delivery_date?: string;
  special_instructions?: string;
}

export interface CreateInvoiceData {
  order_id: string;
  invoice_number?: string;
  due_date: string;
  payment_terms?: string;
  payment_method?: string;
  notes?: string;
}

export interface QuoteData {
  id: string;
  deal_id: string;
  quote_number: string;
  title: string;
  description?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string;
  created_at: string;
  items: QuoteItem[];
}

export interface OrderData {
  id: string;
  quote_id: string;
  deal_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  customer_po_number?: string;
  delivery_date?: string;
  created_at: string;
}

export interface InvoiceData {
  id: string;
  order_id: string;
  deal_id: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total_amount: number;
  due_date: string;
  paid_at?: string;
  payment_method?: string;
  created_at: string;
}

export const useDealFinance = (dealId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const { showToast } = useToastContext();

  // Load all finance data for the deal
  const loadFinanceData = async () => {
    if (!dealId) return;
    
    setIsLoading(true);
    try {
      // Load quotes
      const { data: quotesData, error: quotesError } = await supabase
        .rpc('get_deal_quotes_with_items', { deal_id_param: dealId });

      if (quotesError) throw quotesError;
      setQuotes(quotesData || []);

      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('deal_orders')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Load invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('deal_invoices')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);

    } catch (error) {
      console.error('Error loading finance data:', error);
      showToast('Failed to load finance data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new quote
  const createQuote = async (quoteData: CreateQuoteData) => {
    setIsLoading(true);
    try {
      const { data: quote, error: quoteError } = await supabase
        .rpc('create_deal_quote', {
          quote_data: quoteData,
        });

      if (quoteError) throw quoteError;

      // Log activity
      await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'quote',
          title: 'Quote Created',
          description: `Created quote: ${quoteData.title} - ${quoteData.total_amount}`,
          metadata: {
            quote_id: quote.id,
            quote_number: quote.quote_number,
            total_amount: quoteData.total_amount,
          },
          created_by: 'current-user-id',
        });

      await loadFinanceData(); // Refresh data
      showToast('Quote created successfully', 'success');
      return quote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create quote';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Convert quote to order
  const convertQuoteToOrder = async (quoteId: string, orderData: CreateOrderData) => {
    setIsLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .rpc('convert_quote_to_order', {
          quote_id_param: quoteId,
          order_data: orderData,
        });

      if (orderError) throw orderError;

      // Update quote status
      await supabase
        .from('deal_quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId);

      // Log activity
      await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'order',
          title: 'Order Created',
          description: `Converted quote to order: ${order.order_number}`,
          metadata: {
            order_id: order.id,
            quote_id: quoteId,
            order_number: order.order_number,
            total_amount: order.total_amount,
          },
          created_by: 'current-user-id',
        });

      await loadFinanceData(); // Refresh data
      showToast('Quote converted to order successfully', 'success');
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert quote to order';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Convert order to invoice
  const convertOrderToInvoice = async (orderId: string, invoiceData: CreateInvoiceData) => {
    setIsLoading(true);
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .rpc('convert_order_to_invoice', {
          order_id_param: orderId,
          invoice_data: invoiceData,
        });

      if (invoiceError) throw invoiceError;

      // Log activity
      await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'invoice',
          title: 'Invoice Created',
          description: `Created invoice: ${invoice.invoice_number}`,
          metadata: {
            invoice_id: invoice.id,
            order_id: orderId,
            invoice_number: invoice.invoice_number,
            total_amount: invoice.total_amount,
            due_date: invoiceData.due_date,
          },
          created_by: 'current-user-id',
        });

      await loadFinanceData(); // Refresh data
      showToast('Invoice created successfully', 'success');
      return invoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create invoice';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Send quote via email
  const sendQuote = async (quoteId: string, emailData: {
    to: string[];
    subject?: string;
    message?: string;
  }) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('send-quote-email', {
        body: {
          quote_id: quoteId,
          ...emailData,
        },
      });

      if (error) throw error;

      // Update quote status
      await supabase
        .from('deal_quotes')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      // Log activity
      await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'email',
          title: 'Quote Sent',
          description: `Quote sent to: ${emailData.to.join(', ')}`,
          metadata: {
            quote_id: quoteId,
            recipients: emailData.to,
            message_id: result?.messageId,
          },
          created_by: 'current-user-id',
        });

      await loadFinanceData(); // Refresh data
      showToast('Quote sent successfully', 'success');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send quote';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update quote status
  const updateQuoteStatus = async (quoteId: string, status: QuoteData['status']) => {
    try {
      const { error } = await supabase
        .from('deal_quotes')
        .update({ status })
        .eq('id', quoteId);

      if (error) throw error;

      await loadFinanceData(); // Refresh data
      showToast(`Quote ${status}`, 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quote status';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Calculate quote totals
  const calculateQuoteTotals = (items: QuoteItem[], discountPercent: number = 0, taxPercent: number = 0) => {
    const subtotal = items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unit_price;
      const lineDiscount = lineTotal * (item.discount_percent || 0) / 100;
      return sum + (lineTotal - lineDiscount);
    }, 0);

    const discountAmount = subtotal * discountPercent / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxPercent / 100;
    const totalAmount = taxableAmount + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  };

  return {
    // Data
    quotes,
    orders,
    invoices,
    isLoading,

    // Actions
    loadFinanceData,
    createQuote,
    convertQuoteToOrder,
    convertOrderToInvoice,
    sendQuote,
    updateQuoteStatus,

    // Utilities
    calculateQuoteTotals,

    // Computed
    totalQuoteValue: quotes.reduce((sum, q) => sum + q.total_amount, 0),
    totalOrderValue: orders.reduce((sum, o) => sum + o.total_amount, 0),
    totalInvoiceValue: invoices.reduce((sum, i) => sum + i.total_amount, 0),
    
    hasActiveQuotes: quotes.some(q => ['draft', 'sent'].includes(q.status)),
    hasPendingOrders: orders.some(o => ['pending', 'confirmed', 'in_progress'].includes(o.status)),
    hasUnpaidInvoices: invoices.some(i => ['sent', 'overdue'].includes(i.status)),
  };
};


