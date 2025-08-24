import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface QuoteLineItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price_cents: number;
  discount_percent: number;
  tax_percent: number;
  line_total_cents: number;
}

export interface Quote {
  id: string;
  quote_number: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_address?: string;
  quote_date: string;
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  notes?: string;
  terms?: string;
  line_items: QuoteLineItem[];
  created_at: string;
  updated_at: string;
  created_by: string;
  org_id: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  price_cents: number;
  tax_rate: number;
  category?: string;
  description?: string;
}

const getSampleQuotes = (): Quote[] => {
  return [
    {
      id: 'sample-1',
      quote_number: 'QUO-2025-0001',
      customer_name: 'Acme Corporation',
      customer_email: 'contact@acme.com',
      customer_address: '123 Business Street, New York, NY 10001',
      quote_date: '2025-01-20',
      valid_until: '2025-02-19',
      status: 'sent',
      subtotal_cents: 12000,
      discount_cents: 600,
      tax_cents: 2280,
      total_cents: 13680,
      notes: 'Initial consultation and setup included',
      terms: 'Payment due within 30 days of acceptance',
      line_items: [
        {
          id: 'line-1',
          product_id: '1',
          product_name: 'CRM Software License',
          product_sku: 'CRM-LIC-001',
          quantity: 1,
          unit_price_cents: 9900,
          discount_percent: 10,
          tax_percent: 20,
          line_total_cents: 10692
        },
        {
          id: 'line-2',
          product_name: 'Setup & Training',
          product_id: '2',
          product_sku: 'SERV-001',
          quantity: 1,
          unit_price_cents: 2100,
          discount_percent: 0,
          tax_percent: 20,
          line_total_cents: 2520
        }
      ],
      created_at: '2025-01-20T10:00:00Z',
      updated_at: '2025-01-20T10:00:00Z',
      created_by: 'sample-user',
      org_id: 'sample-org'
    },
    {
      id: 'sample-2',
      quote_number: 'QUO-2025-0002',
      customer_name: 'TechStart Inc',
      customer_email: 'hello@techstart.com',
      customer_address: '456 Innovation Drive, San Francisco, CA 94105',
      quote_date: '2025-01-21',
      valid_until: '2025-02-20',
      status: 'draft',
      subtotal_cents: 25000,
      discount_cents: 1250,
      tax_cents: 4750,
      total_cents: 28500,
      notes: 'Custom integration requirements discussed',
      terms: 'Payment due within 30 days of acceptance',
      line_items: [
        {
          id: 'line-3',
          product_id: '3',
          product_name: 'Enterprise CRM License',
          product_sku: 'CRM-ENT-001',
          quantity: 1,
          unit_price_cents: 19900,
          discount_percent: 5,
          tax_percent: 20,
          line_total_cents: 22704
        },
        {
          id: 'line-4',
          product_name: 'Data Migration Service',
          product_id: '4',
          product_sku: 'MIGR-001',
          quantity: 1,
          unit_price_cents: 5100,
          discount_percent: 0,
          tax_percent: 20,
          line_total_cents: 6120
        }
      ],
      created_at: '2025-01-21T14:30:00Z',
      updated_at: '2025-01-21T14:30:00Z',
      created_by: 'sample-user',
      org_id: 'sample-org'
    }
  ];
};

export const useQuotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    if (!user?.org_id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_line_items (
            id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price_cents,
            discount_percent,
            tax_percent,
            line_total_cents
          )
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false });

      if (error) {
        // Check if tables don't exist yet
        if (error.code === 'PGRST200' || error.message.includes('relationship') || error.message.includes('does not exist')) {
          console.log('Quotes tables not found, using sample data. Please apply the quotes migration.');
          setQuotes(getSampleQuotes());
          setError('Quote system not initialized. Please contact your administrator to apply the database migration.');
          return;
        }
        throw error;
      }

      const formattedQuotes = data?.map(quote => ({
        ...quote,
        line_items: quote.quote_line_items || []
      })) || [];

      setQuotes(formattedQuotes);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
      
      // Fallback to sample data
      setQuotes(getSampleQuotes());
    } finally {
      setLoading(false);
    }
  };

  const generateQuoteNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const { data, error } = await supabase
      .from('quotes')
      .select('quote_number')
      .eq('org_id', user?.org_id)
      .like('quote_number', `QUO-${year}-%`)
      .order('quote_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error generating quote number:', error);
      return `QUO-${year}-0001`;
    }

    if (data && data.length > 0) {
      const lastNumber = data[0].quote_number;
      const numberPart = parseInt(lastNumber.split('-').pop() || '0');
      const nextNumber = (numberPart + 1).toString().padStart(4, '0');
      return `QUO-${year}-${nextNumber}`;
    }

    return `QUO-${year}-0001`;
  };

  const createQuote = async (quoteData: Partial<Quote>): Promise<Quote | null> => {
    if (!user?.org_id) {
      setError('User organization not found');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if we're in demo mode (tables don't exist)
      if (error && error.includes('not initialized')) {
        // Create a mock quote for demo purposes
        const mockQuote: Quote = {
          id: `demo-${Date.now()}`,
          quote_number: `QUO-2025-${String(quotes.length + 1).padStart(4, '0')}`,
          customer_name: quoteData.customer_name || '',
          customer_email: quoteData.customer_email || '',
          customer_address: quoteData.customer_address,
          quote_date: quoteData.quote_date || new Date().toISOString().split('T')[0],
          valid_until: quoteData.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: quoteData.status || 'draft',
          subtotal_cents: quoteData.subtotal_cents || 0,
          discount_cents: quoteData.discount_cents || 0,
          tax_cents: quoteData.tax_cents || 0,
          total_cents: quoteData.total_cents || 0,
          notes: quoteData.notes,
          terms: quoteData.terms,
          line_items: quoteData.line_items || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user.id,
          org_id: user.org_id
        };
        
        setQuotes(prev => [mockQuote, ...prev]);
        setError('Demo mode: Quote created locally. Please apply database migration for full functionality.');
        return mockQuote;
      }

      const quoteNumber = await generateQuoteNumber();
      
      const newQuote = {
        ...quoteData,
        quote_number: quoteNumber,
        org_id: user.org_id,
        created_by: user.id,
        status: quoteData.status || 'draft',
        quote_date: quoteData.quote_date || new Date().toISOString().split('T')[0],
        valid_until: quoteData.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const { data, error: insertError } = await supabase
        .from('quotes')
        .insert([newQuote])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === 'PGRST200' || insertError.message.includes('does not exist')) {
          // Tables don't exist, create mock quote
          const mockQuote: Quote = {
            id: `demo-${Date.now()}`,
            quote_number: `QUO-2025-${String(quotes.length + 1).padStart(4, '0')}`,
            ...quoteData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user.id,
            org_id: user.org_id
          } as Quote;
          
          setQuotes(prev => [mockQuote, ...prev]);
          setError('Demo mode: Quote created locally. Please apply database migration for full functionality.');
          return mockQuote;
        }
        throw insertError;
      }

      // Create line items if provided
      if (quoteData.line_items && quoteData.line_items.length > 0) {
        const lineItems = quoteData.line_items.map(item => ({
          ...item,
          quote_id: data.id,
          org_id: user.org_id
        }));

        const { error: lineItemsError } = await supabase
          .from('quote_line_items')
          .insert(lineItems);

        if (lineItemsError) throw lineItemsError;
      }

      const createdQuote = { ...data, line_items: quoteData.line_items || [] };
      setQuotes(prev => [createdQuote, ...prev]);
      
      return createdQuote;
    } catch (err) {
      console.error('Error creating quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to create quote');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)
        .eq('org_id', user?.org_id);

      if (error) throw error;

      setQuotes(prev => prev.map(quote => 
        quote.id === id ? { ...quote, ...updates } : quote
      ));

      return true;
    } catch (err) {
      console.error('Error updating quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to update quote');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteQuote = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Delete line items first
      await supabase
        .from('quote_line_items')
        .delete()
        .eq('quote_id', id);

      // Delete quote
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id)
        .eq('org_id', user?.org_id);

      if (error) throw error;

      setQuotes(prev => prev.filter(quote => quote.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete quote');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const duplicateQuote = async (quoteId: string): Promise<Quote | null> => {
    const originalQuote = quotes.find(q => q.id === quoteId);
    if (!originalQuote) return null;

    const duplicatedQuote = {
      ...originalQuote,
      customer_name: `${originalQuote.customer_name} (Copy)`,
      status: 'draft' as const,
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    delete (duplicatedQuote as any).id;
    delete (duplicatedQuote as any).quote_number;
    delete (duplicatedQuote as any).created_at;
    delete (duplicatedQuote as any).updated_at;

    return await createQuote(duplicatedQuote);
  };

  const convertToInvoice = async (quoteId: string): Promise<boolean> => {
    // This will be implemented when invoice system is ready
    try {
      setLoading(true);
      setError(null);

      // Update quote status to accepted
      await updateQuote(quoteId, { status: 'accepted' });
      
      // TODO: Create invoice from quote
      console.log('Converting quote to invoice:', quoteId);
      
      return true;
    } catch (err) {
      console.error('Error converting to invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert to invoice');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.org_id) {
      fetchQuotes();
    }
  }, [user?.org_id]);

  return {
    quotes,
    loading,
    error,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    duplicateQuote,
    convertToInvoice,
    generateQuoteNumber,
    setError
  };
};

export const useProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!user?.org_id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('org_id', user.org_id)
        .order('name');

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      
      // Fallback to mock data
      setProducts([
        {
          id: '1',
          name: 'CRM Software License',
          sku: 'CRM-LIC-001',
          price_cents: 9900,
          tax_rate: 20,
          category: 'Software',
          description: 'Monthly CRM software license'
        },
        {
          id: '2',
          name: 'Consulting Services',
          sku: 'CONS-001',
          price_cents: 15000,
          tax_rate: 20,
          category: 'Services',
          description: 'Professional consulting per hour'
        },
        {
          id: '3',
          name: 'Data Migration',
          sku: 'MIGR-001',
          price_cents: 50000,
          tax_rate: 20,
          category: 'Services',
          description: 'One-time data migration service'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.org_id) {
      fetchProducts();
    }
  }, [user?.org_id]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    setError
  };
};
