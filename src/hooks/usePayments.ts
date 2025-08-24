import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { AppPayment } from '../types/Marketplace';

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}

export interface SubscriptionPlan {
  id: string;
  app_id: string;
  name: string;
  description: string;
  amount_cents: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  trial_days?: number;
  features: string[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Get sample payment methods
  const getSamplePaymentMethods = (): PaymentMethod[] => [
    {
      id: 'pm_1234',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      exp_month: 12,
      exp_year: 2025,
      is_default: true
    },
    {
      id: 'pm_5678',
      type: 'card',
      last4: '0005',
      brand: 'mastercard',
      exp_month: 6,
      exp_year: 2026,
      is_default: false
    }
  ];

  // Create payment intent for app purchase
  const createPaymentIntent = useCallback(async (
    appId: string, 
    planId: string, 
    billingPeriod: 'monthly' | 'yearly'
  ): Promise<PaymentIntent | null> => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, call backend to create Stripe PaymentIntent
      const mockPaymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        client_secret: `pi_${Date.now()}_secret_mock`,
        amount: billingPeriod === 'yearly' ? 24000 : 2000, // $240/year or $20/month
        currency: 'eur',
        metadata: {
          app_id: appId,
          plan_id: planId,
          billing_period: billingPeriod,
          org_id: 'temp-org'
        }
      };

      console.log('Created payment intent:', mockPaymentIntent);
      return mockPaymentIntent;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create subscription for app
  const createSubscription = useCallback(async (
    appId: string,
    planId: string,
    paymentMethodId: string,
    trialDays?: number
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, call backend to create Stripe Subscription
      const subscriptionId = `sub_${Date.now()}`;
      
      // Save subscription to database
      const payment: AppPayment = {
        id: `pay_${Date.now()}`,
        app_id: appId,
        org_id: 'temp-org',
        subscription_id: subscriptionId,
        amount_cents: 2000, // $20
        currency: 'EUR',
        billing_period: 'monthly',
        payment_method: paymentMethodId,
        status: 'completed',
        created_at: new Date().toISOString(),
        stripe_subscription_id: subscriptionId
      };

      console.log('Created subscription:', payment);
      return subscriptionId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async (subscriptionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, call backend to cancel Stripe Subscription
      console.log('Cancelling subscription:', subscriptionId);
      
      // Update subscription status in database
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment methods for organization
  const fetchPaymentMethods = useCallback(async (): Promise<PaymentMethod[]> => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, fetch from Stripe/backend
      const methods = getSamplePaymentMethods();
      setPaymentMethods(methods);
      return methods;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add payment method
  const addPaymentMethod = useCallback(async (
    token: string,
    setAsDefault: boolean = false
  ): Promise<PaymentMethod | null> => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, save to Stripe and backend
      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        last4: '1234',
        brand: 'visa',
        exp_month: 12,
        exp_year: 2027,
        is_default: setAsDefault
      };

      if (setAsDefault) {
        setPaymentMethods(prev => prev.map(pm => ({ ...pm, is_default: false })));
      }

      setPaymentMethods(prev => [...prev, newMethod]);
      return newMethod;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, remove from Stripe and backend
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, update in Stripe and backend
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        is_default: pm.id === paymentMethodId
      })));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment history
  const getPaymentHistory = useCallback(async (): Promise<AppPayment[]> => {
    setLoading(true);
    setError(null);

    try {
      // Sample payment history
      const payments: AppPayment[] = [
        {
          id: 'pay_001',
          app_id: 'slack-integration',
          org_id: 'temp-org',
          subscription_id: 'sub_001',
          amount_cents: 0, // Free app
          currency: 'EUR',
          billing_period: 'monthly',
          payment_method: 'pm_1234',
          status: 'completed',
          created_at: '2024-01-05T00:00:00Z'
        }
      ];

      return payments;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Process one-time payment
  const processOneTimePayment = useCallback(async (
    appId: string,
    amount: number,
    paymentMethodId: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, process payment via Stripe
      const payment: AppPayment = {
        id: `pay_${Date.now()}`,
        app_id: appId,
        org_id: 'temp-org',
        amount_cents: amount,
        currency: 'EUR',
        billing_period: 'one_time',
        payment_method: paymentMethodId,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      console.log('Processed one-time payment:', payment);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    paymentMethods,
    createPaymentIntent,
    createSubscription,
    cancelSubscription,
    fetchPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getPaymentHistory,
    processOneTimePayment,
    clearError: () => setError(null)
  };
};
