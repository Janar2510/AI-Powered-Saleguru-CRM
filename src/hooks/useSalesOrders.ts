import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export interface SalesOrderLineItem {
  id?: string;
  sales_order_id?: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  product_description?: string;
  quantity: number;
  unit_price_cents: number;
  discount_percent: number;
  tax_percent: number;
  line_total_cents: number;
  allocated_quantity?: number;
  shipped_quantity?: number;
}

export interface ShippingInfo {
  id?: string;
  sales_order_id?: string;
  carrier: 'dhl' | 'fedex' | 'ups' | 'usps' | 'custom';
  service_type?: string;
  tracking_number?: string;
  label_url?: string;
  dhl_shipment_id?: string;
  dhl_label_id?: string;
  dhl_service_code?: string;
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  package_type?: string;
  shipping_cost_cents: number;
  insurance_cost_cents?: number;
  status: 'pending' | 'label_created' | 'picked_up' | 'in_transit' | 'delivered' | 'exception' | 'returned';
  ship_date?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  special_instructions?: string;
  signature_required?: boolean;
  insurance_value_cents?: number;
}

export interface SalesOrder {
  id?: string;
  org_id?: string;
  order_number?: string;
  quote_reference?: string;
  deal_reference?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  billing_name?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  shipping_name?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  same_as_billing?: boolean;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  shipping_cost_cents: number;
  total_cents: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  order_date?: string;
  required_date?: string;
  shipped_date?: string;
  delivery_date?: string;
  notes?: string;
  terms?: string;
  internal_notes?: string;
  line_items?: SalesOrderLineItem[];
  shipping_info?: ShippingInfo;
  created_at?: string;
  updated_at?: string;
}

// Sample data for fallback
const getSampleSalesOrders = (): SalesOrder[] => [
  {
    id: 'so_001',
    order_number: 'SO-2025-001',
    quote_reference: 'Q-2025-001',
    customer_name: 'Acme Corporation',
    customer_email: 'orders@acme.com',
    customer_phone: '+1 (555) 123-4567',
    billing_address: '123 Business St, New York, NY 10001',
    shipping_address: '123 Business St, New York, NY 10001',
    same_as_billing: true,
    subtotal_cents: 125000,
    discount_cents: 0,
    tax_cents: 12500,
    shipping_cost_cents: 2500,
    total_cents: 140000,
    status: 'processing',
    priority: 'high',
    order_date: '2025-01-21',
    required_date: '2025-01-28',
    notes: 'Expedited processing requested',
    line_items: [
      {
        id: 'soli_001',
        product_name: 'Premium CRM License',
        product_sku: 'CRM-PREM-001',
        quantity: 5,
        unit_price_cents: 25000,
        discount_percent: 0,
        tax_percent: 10,
        line_total_cents: 137500,
        allocated_quantity: 5,
        shipped_quantity: 0
      }
    ],
    shipping_info: {
      id: 'ship_001',
      carrier: 'dhl',
      service_type: 'EXPRESS',
      tracking_number: 'DHL123456789',
      weight_kg: 2.5,
      shipping_cost_cents: 2500,
      status: 'in_transit',
      ship_date: '2025-01-21',
      estimated_delivery_date: '2025-01-23'
    }
  },
  {
    id: 'so_002',
    order_number: 'SO-2025-002',
    customer_name: 'TechStart Inc',
    customer_email: 'purchasing@techstart.com',
    billing_address: '456 Innovation Dr, San Francisco, CA 94105',
    shipping_address: '456 Innovation Dr, San Francisco, CA 94105',
    same_as_billing: true,
    subtotal_cents: 85000,
    discount_cents: 0,
    tax_cents: 8500,
    shipping_cost_cents: 1500,
    total_cents: 95000,
    status: 'confirmed',
    priority: 'normal',
    order_date: '2025-01-21',
    required_date: '2025-02-01',
    notes: 'Standard delivery',
    line_items: [
      {
        id: 'soli_002',
        product_name: 'Standard CRM License',
        product_sku: 'CRM-STD-001',
        quantity: 10,
        unit_price_cents: 8500,
        discount_percent: 0,
        tax_percent: 10,
        line_total_cents: 93500,
        allocated_quantity: 10,
        shipped_quantity: 0
      }
    ],
    shipping_info: {
      id: 'ship_002',
      carrier: 'dhl',
      service_type: 'STANDARD',
      tracking_number: 'DHL987654321',
      weight_kg: 1.8,
      shipping_cost_cents: 1500,
      status: 'label_created',
      ship_date: '2025-01-22',
      estimated_delivery_date: '2025-01-25'
    }
  }
];

export const useSalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('sales_orders')
        .select(`
          *,
          sales_order_line_items(*),
          shipping_management(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Check if it's a table not found error
        if (fetchError.code === 'PGRST200' || 
            fetchError.message.includes('relation') || 
            fetchError.message.includes('does not exist')) {
          console.warn('Sales orders tables not found, using sample data');
          setSalesOrders(getSampleSalesOrders());
          setError('Database tables not found. Using sample data. Please apply the sales orders migration.');
          return;
        }
        throw fetchError;
      }

      // Transform the data to match our interface
      const transformedOrders = data?.map(order => ({
        ...order,
        line_items: order.sales_order_line_items || [],
        shipping_info: order.shipping_management?.[0] || null
      })) || [];

      setSalesOrders(transformedOrders);
    } catch (err) {
      console.error('Error fetching sales orders:', err);
      setSalesOrders(getSampleSalesOrders());
      setError('Failed to load sales orders. Using sample data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateOrderNumber = useCallback(async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('sales_orders')
        .select('order_number')
        .eq('org_id', 'temp-org')
        .order('order_number', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST200') {
        throw error;
      }

      const currentYear = new Date().getFullYear();
      const lastNumber = data?.[0]?.order_number;
      
      if (lastNumber && lastNumber.includes(currentYear.toString())) {
        const numberPart = parseInt(lastNumber.split('-').pop() || '0');
        return `SO-${currentYear}-${String(numberPart + 1).padStart(3, '0')}`;
      } else {
        return `SO-${currentYear}-001`;
      }
    } catch (err) {
      console.error('Error generating order number:', err);
      const currentYear = new Date().getFullYear();
      const randomNumber = Math.floor(Math.random() * 900) + 100;
      return `SO-${currentYear}-${randomNumber}`;
    }
  }, []);

  const createSalesOrder = useCallback(async (orderData: Partial<SalesOrder>): Promise<SalesOrder | null> => {
    setLoading(true);
    setError(null);

    try {
      const orderNumber = await generateOrderNumber();
      
      const newOrder: SalesOrder = {
        org_id: 'temp-org',
        order_number: orderNumber,
        customer_name: orderData.customer_name || '',
        customer_email: orderData.customer_email || '',
        subtotal_cents: orderData.subtotal_cents || 0,
        discount_cents: orderData.discount_cents || 0,
        tax_cents: orderData.tax_cents || 0,
        shipping_cost_cents: orderData.shipping_cost_cents || 0,
        total_cents: orderData.total_cents || 0,
        status: orderData.status || 'pending',
        priority: orderData.priority || 'normal',
        order_date: new Date().toISOString().split('T')[0],
        ...orderData,
      };

      // Try to insert into database
      const { data, error: insertError } = await supabase
        .from('sales_orders')
        .insert([newOrder])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === 'PGRST200' || 
            insertError.message.includes('relation') || 
            insertError.message.includes('does not exist')) {
          // Table doesn't exist, add to sample data
          const orderWithId = { ...newOrder, id: `so_${Date.now()}` };
          setSalesOrders(prev => [orderWithId, ...prev]);
          return orderWithId;
        }
        throw insertError;
      }

      await fetchSalesOrders();
      return data;
    } catch (err) {
      console.error('Error creating sales order:', err);
      setError('Failed to create sales order');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchSalesOrders, generateOrderNumber]);

  const updateSalesOrder = useCallback(async (id: string, updates: Partial<SalesOrder>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('sales_orders')
        .update(updates)
        .eq('id', id)
        .eq('org_id', 'temp-org');

      if (updateError) {
        if (updateError.code === 'PGRST200' || 
            updateError.message.includes('relation') || 
            updateError.message.includes('does not exist')) {
          // Update sample data
          setSalesOrders(prev => 
            prev.map(order => 
              order.id === id ? { ...order, ...updates } : order
            )
          );
          return true;
        }
        throw updateError;
      }

      await fetchSalesOrders();
      return true;
    } catch (err) {
      console.error('Error updating sales order:', err);
      setError('Failed to update sales order');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSalesOrders]);

  const deleteSalesOrder = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', id)
        .eq('org_id', 'temp-org');

      if (deleteError) {
        if (deleteError.code === 'PGRST200' || 
            deleteError.message.includes('relation') || 
            deleteError.message.includes('does not exist')) {
          // Remove from sample data
          setSalesOrders(prev => prev.filter(order => order.id !== id));
          return true;
        }
        throw deleteError;
      }

      await fetchSalesOrders();
      return true;
    } catch (err) {
      console.error('Error deleting sales order:', err);
      setError('Failed to delete sales order');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSalesOrders]);

  const createFromQuote = useCallback(async (quoteId: string): Promise<SalesOrder | null> => {
    try {
      // Fetch quote data
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_line_items(*)
        `)
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;

      // Convert quote to sales order
      const salesOrderData: Partial<SalesOrder> = {
        quote_reference: quoteId,
        customer_name: quoteData.customer_name,
        customer_email: quoteData.customer_email,
        customer_address: quoteData.customer_address,
        subtotal_cents: quoteData.subtotal_cents,
        discount_cents: quoteData.discount_cents,
        tax_cents: quoteData.tax_cents,
        total_cents: quoteData.total_cents,
        notes: quoteData.notes,
        terms: quoteData.terms,
        status: 'pending'
      };

      return await createSalesOrder(salesOrderData);
    } catch (err) {
      console.error('Error creating sales order from quote:', err);
      setError('Failed to create sales order from quote');
      return null;
    }
  }, [createSalesOrder]);

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  return {
    salesOrders,
    loading,
    error,
    fetchSalesOrders,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    createFromQuote,
    generateOrderNumber
  };
};

// DHL Integration Hook
export const useDHLIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShipment = useCallback(async (orderData: SalesOrder, shippingData: Partial<ShippingInfo>) => {
    setLoading(true);
    setError(null);

    try {
      // Mock DHL API integration
      const mockDHLResponse = {
        shipmentId: `DHL${Date.now()}`,
        trackingNumber: `DHL${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        labelUrl: `https://dhl.com/labels/${Date.now()}.pdf`,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      // Update shipping info in database
      const shippingInfo: ShippingInfo = {
        ...shippingData,
        carrier: shippingData.carrier || 'dhl',
        shipping_cost_cents: shippingData.shipping_cost_cents || 0,
        insurance_cost_cents: shippingData.insurance_cost_cents || 0,
        weight_kg: shippingData.weight_kg || 0,
        length_cm: shippingData.length_cm || 0,
        width_cm: shippingData.width_cm || 0,
        height_cm: shippingData.height_cm || 0,
        package_type: shippingData.package_type || 'box',
        dhl_shipment_id: mockDHLResponse.shipmentId,
        tracking_number: mockDHLResponse.trackingNumber,
        label_url: mockDHLResponse.labelUrl,
        estimated_delivery_date: mockDHLResponse.estimatedDelivery,
        status: 'label_created'
      };

      return shippingInfo;
    } catch (err) {
      console.error('Error creating DHL shipment:', err);
      setError('Failed to create DHL shipment');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackShipment = useCallback(async (trackingNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      // Mock DHL tracking API
      const mockTrackingData = {
        trackingNumber,
        status: 'in_transit',
        location: 'Distribution Center - New York',
        estimatedDelivery: '2025-01-23',
        events: [
          { date: '2025-01-21', time: '10:30', location: 'Origin Facility', status: 'Picked up' },
          { date: '2025-01-21', time: '15:45', location: 'Sorting Facility', status: 'In transit' },
          { date: '2025-01-22', time: '08:15', location: 'Distribution Center', status: 'Out for delivery' }
        ]
      };

      return mockTrackingData;
    } catch (err) {
      console.error('Error tracking DHL shipment:', err);
      setError('Failed to track shipment');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createShipment,
    trackShipment
  };
};

export default useSalesOrders;