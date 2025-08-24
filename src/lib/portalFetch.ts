// Portal Fetch Utilities
// Provides authenticated data fetching for portal users

import { supabase } from '../services/supabase';
import { getPortalToken, logPortalAction } from './portalAuth';

export interface PortalFilters {
  [key: string]: string | number | boolean | null;
}

/**
 * Fetch data from portal-accessible tables with authentication
 */
export async function portalSelect(
  table: string, 
  filters: PortalFilters = {},
  select: string = '*'
) {
  const token = getPortalToken();
  
  if (!token) {
    throw new Error('No portal token found. Please log in.');
  }

  try {
    // Log the data access for audit (skip for dev bypass)
    if (token !== 'dev-bypass-token') {
      await logPortalAction('data_access', table);
    }
    
    // For development bypass, return sample data
    if (token === 'dev-bypass-token' || process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return getSampleData(table);
    }
    
    // Build the query with portal token header
    const query = supabase
      .from(table)
      .select(select)
      .headers({ 'x-portal-token': token });
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'boolean') {
          query.eq(key, value);
        } else if (typeof value === 'number') {
          query.eq(key, value);
        } else {
          query.eq(key, value);
        }
      }
    });
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Portal fetch error for ${table}:`, error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Portal fetch failed for ${table}:`, error);
    return { data: null, error };
  }
}

// Sample data for development bypass
function getSampleData(table: string) {
  const sampleData: { [key: string]: any[] } = {
    sales_orders: [
      {
        id: 'so_dev_001',
        order_number: 'SO-DEV-001',
        customer_name: 'Demo Customer',
        customer_email: 'demo@example.com',
        status: 'confirmed',
        order_date: '2025-01-21',
        required_date: '2025-01-28',
        subtotal_cents: 125000,
        tax_cents: 12500,
        shipping_cost_cents: 2500,
        total_cents: 140000,
        notes: 'Development sample order',
        created_at: '2025-01-21T10:00:00Z'
      },
      {
        id: 'so_dev_002',
        order_number: 'SO-DEV-002',
        customer_name: 'Test Company',
        customer_email: 'test@company.com',
        status: 'processing',
        order_date: '2025-01-20',
        required_date: '2025-01-27',
        subtotal_cents: 85000,
        tax_cents: 8500,
        shipping_cost_cents: 1500,
        total_cents: 95000,
        notes: 'Another sample order',
        created_at: '2025-01-20T14:30:00Z'
      }
    ],
    invoices: [
      {
        id: 'inv_dev_001',
        invoice_number: 'INV-DEV-001',
        customer_name: 'Demo Customer',
        customer_email: 'demo@example.com',
        status: 'open',
        issue_date: '2025-01-21',
        due_date: '2025-02-21',
        subtotal_cents: 125000,
        tax_cents: 12500,
        total_cents: 137500,
        currency: 'EUR',
        notes: 'Development sample invoice',
        created_at: '2025-01-21T10:00:00Z'
      }
    ],
    quotes: [
      {
        id: 'q_dev_001',
        quote_number: 'Q-DEV-001',
        customer_name: 'Demo Customer',
        customer_email: 'demo@example.com',
        status: 'active',
        valid_until: '2025-02-21',
        subtotal_cents: 125000,
        tax_cents: 12500,
        total_cents: 137500,
        notes: 'Development sample quote',
        created_at: '2025-01-21T10:00:00Z'
      }
    ],
    documents: [
      {
        id: 'doc_dev_001',
        name: 'Sample Contract',
        document_number: 'DOC-DEV-001',
        type: 'contract',
        status: 'active',
        esign_status: 'pending',
        portal_url: '#',
        portal_path: '/docs/sample-contract.pdf',
        created_at: '2025-01-21T10:00:00Z',
        updated_at: '2025-01-21T10:00:00Z'
      }
    ],
    subscriptions: [
      {
        id: 'sub_dev_001',
        subscription_number: 'SUB-DEV-001',
        plan_name: 'CRM Premium Plan',
        plan_description: 'Premium CRM subscription with full features',
        start_date: '2024-01-01',
        frequency: 'monthly',
        billing_cycle_day: 1,
        next_billing_date: '2025-02-01',
        amount_cents: 2999,
        setup_fee_cents: 0,
        currency: 'EUR',
        discount_percent: 0,
        tax_percent: 10,
        status: 'active',
        notes: 'Premium CRM subscription for demo user',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'sub_dev_002',
        subscription_number: 'SUB-DEV-002',
        plan_name: 'CRM Enterprise Plan',
        plan_description: 'Enterprise CRM subscription with unlimited users',
        start_date: '2023-12-01',
        frequency: 'yearly',
        billing_cycle_day: 1,
        next_billing_date: '2024-12-01',
        amount_cents: 29999,
        setup_fee_cents: 0,
        currency: 'EUR',
        discount_percent: 10,
        tax_percent: 10,
        status: 'active',
        notes: 'Enterprise CRM subscription with 10% discount',
        created_at: '2023-12-01T00:00:00Z',
        updated_at: '2023-12-01T00:00:00Z'
      }
    ]
  };

  return { data: sampleData[table] || [], error: null };
}

/**
 * Fetch sales orders for portal user
 */
export async function fetchPortalOrders(filters: PortalFilters = {}) {
  return portalSelect('sales_orders', filters, `
    id,
    order_number,
    customer_name,
    customer_email,
    status,
    order_date,
    required_date,
    subtotal_cents,
    tax_cents,
    shipping_cost_cents,
    total_cents,
    notes,
    created_at
  `);
}

/**
 * Fetch invoices for portal user
 */
export async function fetchPortalInvoices(filters: PortalFilters = {}) {
  return portalSelect('invoices', filters, `
    id,
    invoice_number,
    customer_name,
    customer_email,
    status,
    issue_date,
    due_date,
    subtotal_cents,
    tax_cents,
    total_cents,
    currency,
    notes,
    created_at
  `);
}

/**
 * Fetch quotes for portal user
 */
export async function fetchPortalQuotes(filters: PortalFilters = {}) {
  return portalSelect('quotes', filters, `
    id,
    quote_number,
    customer_name,
    customer_email,
    status,
    valid_until,
    subtotal_cents,
    tax_cents,
    total_cents,
    notes,
    created_at
  `);
}

/**
 * Fetch documents for portal user
 */
export async function fetchPortalDocuments(filters: PortalFilters = {}) {
  return portalSelect('documents', filters, `
    id,
    name,
    document_number,
    type,
    status,
    esign_status,
    portal_url,
    portal_path,
    created_at,
    updated_at
  `);
}

/**
 * Fetch subscriptions for portal user
 */
export async function fetchPortalSubscriptions(filters: PortalFilters = {}) {
  return portalSelect('subscriptions', filters, `
    id,
    subscription_number,
    plan_name,
    plan_description,
    start_date,
    end_date,
    trial_end_date,
    frequency,
    billing_cycle_day,
    next_billing_date,
    last_billing_date,
    amount_cents,
    setup_fee_cents,
    currency,
    discount_percent,
    tax_percent,
    status,
    cancellation_reason,
    cancelled_at,
    notes,
    created_at,
    updated_at
  `);
}

/**
 * Fetch shipping information for orders
 */
export async function fetchPortalShipping(orderId: string) {
  return portalSelect('shipping_management', { sales_order_id: orderId }, `
    id,
    carrier,
    service_type,
    tracking_number,
    status,
    ship_date,
    estimated_delivery_date,
    actual_delivery_date,
    shipping_cost_cents
  `);
}

/**
 * Update order status (e.g., confirm order)
 */
export async function updatePortalOrderStatus(orderId: string, status: string) {
  const token = getPortalToken();
  
  if (!token) {
    throw new Error('No portal token found. Please log in.');
  }

  try {
    await logPortalAction('order_update', 'sales_orders', orderId);
    
    const { data, error } = await supabase
      .from('sales_orders')
      .update({ status })
      .eq('id', orderId)
      .headers({ 'x-portal-token': token });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return { success: false, error };
  }
}

/**
 * Get portal user profile information
 */
export async function fetchPortalUserProfile() {
  const token = getPortalToken();
  
  if (!token) {
    throw new Error('No portal token found. Please log in.');
  }

  try {
    const { data, error } = await supabase
      .from('portal_users')
      .select(`
        id,
        email,
        company_id,
        contact_id,
        invited_at,
        last_login_at,
        status
      `)
      .headers({ 'x-portal-token': token })
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Failed to fetch portal user profile:', error);
    return { data: null, error };
  }
}

/**
 * Update portal user profile
 */
export async function updatePortalUserProfile(updates: Partial<{
  email: string;
  status: string;
}>) {
  const token = getPortalToken();
  
  if (!token) {
    throw new Error('No portal token found. Please log in.');
  }

  try {
    await logPortalAction('profile_update', 'portal_users');
    
    const { data, error } = await supabase
      .from('portal_users')
      .update(updates)
      .headers({ 'x-portal-token': token });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to update portal user profile:', error);
    return { success: false, error };
  }
}
