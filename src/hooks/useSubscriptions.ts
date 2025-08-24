import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface SubscriptionInvoice {
  id: string;
  subscription_id: string;
  invoice_id?: string;
  period_start: string;
  period_end: string;
  billing_date: string;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'invoiced' | 'paid' | 'failed';
  created_at: string;
}

export interface SubscriptionChange {
  id: string;
  subscription_id: string;
  change_type: 'created' | 'updated' | 'paused' | 'resumed' | 'cancelled' | 'renewed';
  old_values?: any;
  new_values?: any;
  reason?: string;
  created_at: string;
  created_by?: string;
}

export interface Subscription {
  id: string;
  subscription_number: string;
  contact_id?: string;
  organization_id?: string;
  product_id?: string;
  deal_id?: string;
  
  // Subscription details
  plan_name: string;
  plan_description?: string;
  start_date: string;
  end_date?: string;
  trial_end_date?: string;
  
  // Billing details
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  billing_cycle_day: number;
  next_billing_date?: string;
  last_billing_date?: string;
  
  // Financial details
  amount_cents: number;
  setup_fee_cents: number;
  currency: string;
  discount_percent: number;
  tax_percent: number;
  
  // Status and lifecycle
  status: 'active' | 'trial' | 'paused' | 'cancelled' | 'expired' | 'past_due';
  cancellation_reason?: string;
  cancelled_at?: string;
  
  // Metadata
  notes?: string;
  metadata?: any;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations
  contact?: any;
  organization?: any;
  product?: any;
  deal?: any;
  invoices?: SubscriptionInvoice[];
  changes?: SubscriptionChange[];
}

export interface CreateSubscriptionData {
  contact_id?: string;
  organization_id?: string;
  product_id?: string;
  deal_id?: string;
  plan_name: string;
  plan_description?: string;
  start_date: string;
  end_date?: string;
  trial_end_date?: string;
  frequency: Subscription['frequency'];
  billing_cycle_day?: number;
  amount_cents: number;
  setup_fee_cents?: number;
  currency?: string;
  discount_percent?: number;
  tax_percent?: number;
  notes?: string;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastContext();

  // Fetch all subscriptions
  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          invoices:subscription_invoices(*),
          changes:subscription_changes(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSubscriptions(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscriptions';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      
      // Fallback to sample data
      setSubscriptions([
        {
          id: 'sub_001',
          subscription_number: 'SUB-1001',
          plan_name: 'CRM Premium Plan',
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          frequency: 'monthly',
          billing_cycle_day: 1,
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount_cents: 2999,
          setup_fee_cents: 0,
          currency: 'EUR',
          discount_percent: 0,
          tax_percent: 10,
          status: 'active',
          notes: 'Premium CRM subscription',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'sub_002',
          subscription_number: 'SUB-1002',
          plan_name: 'CRM Enterprise Plan',
          start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          frequency: 'yearly',
          billing_cycle_day: 1,
          next_billing_date: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount_cents: 29999,
          setup_fee_cents: 0,
          currency: 'EUR',
          discount_percent: 0,
          tax_percent: 10,
          status: 'active',
          notes: 'Enterprise CRM subscription',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create new subscription
  const createSubscription = async (subscriptionData: CreateSubscriptionData): Promise<Subscription | null> => {
    try {
      setError(null);

      // Generate subscription number
      const { data: numberData, error: numberError } = await supabase
        .rpc('generate_subscription_number');

      if (numberError) throw numberError;

      const subscriptionNumber = numberData;

      // Calculate next billing date
      const { data: nextBillingData, error: billingError } = await supabase
        .rpc('calculate_next_billing_date', {
          start_date: subscriptionData.start_date,
          frequency: subscriptionData.frequency,
          billing_cycle_day: subscriptionData.billing_cycle_day || 1
        });

      if (billingError) throw billingError;

      // Create subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          ...subscriptionData,
          subscription_number: subscriptionNumber,
          next_billing_date: nextBillingData,
          status: subscriptionData.trial_end_date ? 'trial' : 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      // Log creation change
      await supabase
        .from('subscription_changes')
        .insert({
          subscription_id: data.id,
          change_type: 'created',
          new_values: data,
          reason: 'Subscription created'
        });

      setSubscriptions(prev => [data, ...prev]);
      showToast('Subscription created successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Update subscription status
  const updateSubscriptionStatus = async (subscriptionId: string, status: Subscription['status'], reason?: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('id', subscriptionId);

      if (error) throw error;

      // Log status change
      await supabase
        .from('subscription_changes')
        .insert({
          subscription_id: subscriptionId,
          change_type: 'updated',
          new_values: { status },
          reason: reason || `Status changed to ${status}`
        });

      setSubscriptions(prev => prev.map(subscription => 
        subscription.id === subscriptionId ? { ...subscription, status } : subscription
      ));

      showToast(`Subscription ${status}`, 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subscription status';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Pause subscription
  const pauseSubscription = async (subscriptionId: string, reason?: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .rpc('pause_subscription', { 
          subscription_id_param: subscriptionId,
          reason: reason 
        });

      if (error) throw error;

      setSubscriptions(prev => prev.map(subscription => 
        subscription.id === subscriptionId ? { ...subscription, status: 'paused' } : subscription
      ));

      showToast('Subscription paused successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause subscription';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Cancel subscription
  const cancelSubscription = async (
    subscriptionId: string, 
    reason?: string, 
    cancelImmediately: boolean = false
  ): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .rpc('cancel_subscription', { 
          subscription_id_param: subscriptionId,
          reason: reason,
          cancel_immediately: cancelImmediately
        });

      if (error) throw error;

      setSubscriptions(prev => prev.map(subscription => 
        subscription.id === subscriptionId ? { 
          ...subscription, 
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString()
        } : subscription
      ));

      showToast('Subscription cancelled successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Delete subscription
  const deleteSubscription = async (subscriptionId: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;

      setSubscriptions(prev => prev.filter(subscription => subscription.id !== subscriptionId));
      showToast('Subscription deleted successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete subscription';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscriptionStatus,
    pauseSubscription,
    cancelSubscription,
    deleteSubscription
  };
};
