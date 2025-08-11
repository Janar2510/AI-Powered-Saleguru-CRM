import { supabase } from './supabase';

export interface Customer {
  id: string;
  company_name?: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  website?: string;
  industry?: string;
  customer_type: 'prospect' | 'customer' | 'lead' | 'partner';
  status: 'active' | 'inactive' | 'pending';
  credit_limit: number;
  payment_terms: string;
  tax_exempt: boolean;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CustomerDocument {
  id: string;
  partner_id: string;
  name: string;
  type: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  customer_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

class CustomerPortalService {
  // Customers
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Customer Documents
  async getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('partner_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async uploadCustomerDocument(customerId: string, file: File, name: string, type: string): Promise<CustomerDocument> {
    // In a real implementation, this would upload to Supabase Storage
    const filePath = `customer-documents/${customerId}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('documents')
      .insert({
        partner_id: customerId,
        name,
        type,
        file_path: filePath
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Support Tickets
  async getSupportTickets(customerId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Customer Analytics
  async getCustomerAnalytics(customerId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: string;
    supportTickets: number;
    openTickets: number;
  }> {
    // Get customer's orders
    const { data: orders } = await supabase
      .from('sales_orders')
      .select('*')
      .eq('customer_id', customerId);

    // Get customer's support tickets
    const tickets = await this.getSupportTickets(customerId);

    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const lastOrderDate = orders?.[0]?.created_at;
    const supportTickets = tickets.length;
    const openTickets = tickets.filter(ticket => ticket.status === 'open').length;

    return {
      totalOrders,
      totalSpent,
      averageOrderValue,
      lastOrderDate,
      supportTickets,
      openTickets
    };
  }

  // Customer Portal Features
  async getCustomerDashboard(customerId: string): Promise<{
    recentOrders: any[];
    recentDocuments: CustomerDocument[];
    recentTickets: SupportTicket[];
    analytics: any;
  }> {
    const [recentOrders, recentDocuments, recentTickets, analytics] = await Promise.all([
      this.getRecentOrders(customerId),
      this.getCustomerDocuments(customerId),
      this.getSupportTickets(customerId),
      this.getCustomerAnalytics(customerId)
    ]);

    return {
      recentOrders: recentOrders.slice(0, 5),
      recentDocuments: recentDocuments.slice(0, 5),
      recentTickets: recentTickets.slice(0, 5),
      analytics
    };
  }

  private async getRecentOrders(customerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  // Customer Self-Service
  async updateCustomerProfile(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    return this.updateCustomer(customerId, updates);
  }

  async downloadDocument(documentId: string): Promise<string> {
    // In a real implementation, this would generate a download URL
    return `/api/documents/${documentId}/download`;
  }

  async viewDocument(documentId: string): Promise<string> {
    // In a real implementation, this would generate a preview URL
    return `/api/documents/${documentId}/preview`;
  }
}

export const customerPortalService = new CustomerPortalService(); 