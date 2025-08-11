import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useToast } from './useToast';

export interface Customer {
  id: string;
  user_id: string;
  company_name?: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  industry?: string;
  customer_type: 'prospect' | 'customer' | 'lead' | 'partner';
  status: 'active' | 'inactive' | 'pending';
  credit_limit?: number;
  payment_terms?: string;
  tax_exempt?: boolean;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  company_name?: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  industry?: string;
  customer_type?: 'prospect' | 'customer' | 'lead' | 'partner';
  status?: 'active' | 'inactive' | 'pending';
  credit_limit?: number;
  payment_terms?: string;
  tax_exempt?: boolean;
  notes?: string;
  tags?: string[];
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      showToast('Error fetching customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new customer
  const createCustomer = async (customerData: CreateCustomerData): Promise<Customer | null> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => [data, ...prev]);
      showToast('Customer created successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Update customer
  const updateCustomer = async (customerData: UpdateCustomerData): Promise<Customer | null> => {
    try {
      setError(null);

      const { id, ...updateData } = customerData;

      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => prev.map(customer => 
        customer.id === id ? data : customer
      ));
      showToast('Customer updated successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => prev.filter(customer => customer.id !== id));
      showToast('Customer deleted successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Get customer by ID
  const getCustomer = async (id: string): Promise<Customer | null> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Search customers
  const searchCustomers = async (query: string): Promise<Customer[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`company_name.ilike.%${query}%,contact_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search customers';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Filter customers by status
  const filterCustomersByStatus = async (status: string): Promise<Customer[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter customers';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Filter customers by type
  const filterCustomersByType = async (type: string): Promise<Customer[]> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter customers';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    }
  };

  // Bulk operations
  const bulkDeleteCustomers = async (ids: string[]): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('customers')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setCustomers(prev => prev.filter(customer => !ids.includes(customer.id)));
      showToast(`${ids.length} customers deleted successfully`, 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customers';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  const bulkUpdateCustomerStatus = async (ids: string[], status: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('customers')
        .update({ status })
        .in('id', ids);

      if (error) throw error;

      setCustomers(prev => prev.map(customer => 
        ids.includes(customer.id) ? { ...customer, status: status as any } : customer
      ));
      showToast(`${ids.length} customers updated successfully`, 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customers';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Export customers
  const exportCustomers = async (format: 'csv' | 'json' = 'csv'): Promise<string> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (format === 'csv') {
        const headers = ['Company Name', 'Contact Name', 'Email', 'Phone', 'Status', 'Type', 'Created At'];
        const csvContent = [
          headers.join(','),
          ...(data || []).map(customer => [
            customer.company_name || '',
            customer.contact_name,
            customer.email,
            customer.phone || '',
            customer.status,
            customer.customer_type,
            customer.created_at
          ].join(','))
        ].join('\n');

        return csvContent;
      } else {
        return JSON.stringify(data, null, 2);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export customers';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return '';
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    searchCustomers,
    filterCustomersByStatus,
    filterCustomersByType,
    bulkDeleteCustomers,
    bulkUpdateCustomerStatus,
    exportCustomers,
  };
}; 