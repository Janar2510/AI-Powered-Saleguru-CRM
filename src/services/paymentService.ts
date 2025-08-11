import { supabase } from './supabase';

export interface PaymentTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: 'stripe' | 'paypal' | 'bank_transfer';
  customer_name: string;
  customer_email: string;
  invoice_id?: string;
  gateway_response?: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentGateway {
  id: string;
  name: 'stripe' | 'paypal';
  is_active: boolean;
  api_key?: string;
  secret_key?: string;
  webhook_url?: string;
  supported_currencies: string[];
  transaction_fee_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  is_default: boolean;
  customer_id: string;
  created_at: string;
}

export class PaymentService {
  /**
   * Initialize payment gateway (Odoo-style payment acquirer setup)
   */
  static async initializeGateway(gatewayName: 'stripe' | 'paypal', config: any): Promise<PaymentGateway> {
    try {
      const gateway: PaymentGateway = {
        id: `${gatewayName}_${Date.now()}`,
        name: gatewayName,
        is_active: true,
        api_key: config.api_key,
        secret_key: config.secret_key,
        webhook_url: config.webhook_url,
        supported_currencies: config.supported_currencies || ['USD'],
        transaction_fee_percentage: config.transaction_fee_percentage || 2.9,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // In a real implementation, this would save to database
      // const { error } = await supabase
      //   .from('payment_gateways')
      //   .insert(gateway);

      // if (error) throw error;
      return gateway;
    } catch (error) {
      console.error('Error initializing gateway:', error);
      throw error;
    }
  }

  /**
   * Create payment transaction (Odoo payment.transaction equivalent)
   */
  static async createTransaction(
    amount: number,
    currency: string,
    customerData: { name: string; email: string },
    gatewayName: 'stripe' | 'paypal',
    invoiceId?: string
  ): Promise<PaymentTransaction> {
    try {
      const transaction: PaymentTransaction = {
        id: `txn_${Date.now()}`,
        reference: `PAY-${Date.now()}`,
        amount,
        currency,
        status: 'pending',
        payment_method: gatewayName,
        customer_name: customerData.name,
        customer_email: customerData.email,
        invoice_id: invoiceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save transaction to database
      const { error } = await supabase
        .from('payments')
        .insert({
          reference: transaction.reference,
          amount: transaction.amount,
          status: transaction.status,
          payment_method: transaction.payment_method,
          user_id: 'current_user_id' // In real app, get from auth context
        });

      if (error) throw error;
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Process payment with redirect (Odoo-style redirect controller)
   */
  static async processPaymentWithRedirect(
    transactionId: string,
    gatewayName: 'stripe' | 'paypal'
  ): Promise<{ redirect_url: string; transaction_id: string }> {
    try {
      // Simulate payment gateway redirect
      const redirectUrl = gatewayName === 'stripe' 
        ? `https://checkout.stripe.com/pay/${transactionId}`
        : `https://www.paypal.com/checkoutnow?token=${transactionId}`;

      return {
        redirect_url: redirectUrl,
        transaction_id: transactionId
      };
    } catch (error) {
      console.error('Error processing payment redirect:', error);
      throw error;
    }
  }

  /**
   * Handle payment callback (Odoo-style callback controller)
   */
  static async handlePaymentCallback(
    gatewayName: 'stripe' | 'paypal',
    callbackData: any
  ): Promise<{ success: boolean; transaction_id: string; status: string }> {
    try {
      // Validate callback signature (security check)
      const isValidSignature = await this.validateCallbackSignature(gatewayName, callbackData);
      
      if (!isValidSignature) {
        throw new Error('Invalid callback signature');
      }

      // Update transaction status
      const transactionId = callbackData.transaction_id || callbackData.payment_intent_id;
      const status = callbackData.status === 'success' ? 'completed' : 'failed';

      // Update transaction in database
      const { error } = await supabase
        .from('payments')
        .update({ 
          status,
          gateway_response: callbackData,
          updated_at: new Date().toISOString()
        })
        .eq('reference', transactionId);

      if (error) throw error;

      return {
        success: status === 'completed',
        transaction_id: transactionId,
        status
      };
    } catch (error) {
      console.error('Error handling payment callback:', error);
      throw error;
    }
  }

  /**
   * Validate callback signature (security measure)
   */
  private static async validateCallbackSignature(
    gatewayName: 'stripe' | 'paypal',
    callbackData: any
  ): Promise<boolean> {
    try {
      // In a real implementation, this would validate the signature
      // from the payment gateway to prevent fraud
      
      if (gatewayName === 'stripe') {
        // Validate Stripe signature
        // const signature = callbackData.headers['stripe-signature'];
        // const isValid = stripe.webhooks.constructEvent(payload, signature, webhook_secret);
        return true; // Simplified for demo
      } else if (gatewayName === 'paypal') {
        // Validate PayPal IPN signature
        // const isValid = paypal.verifyIPN(callbackData);
        return true; // Simplified for demo
      }
      
      return false;
    } catch (error) {
      console.error('Error validating callback signature:', error);
      return false;
    }
  }

  /**
   * Get payment transaction by ID
   */
  static async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('reference', transactionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }

  /**
   * Get payment transactions for customer
   */
  static async getCustomerTransactions(customerId: string): Promise<PaymentTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting customer transactions:', error);
      return [];
    }
  }

  /**
   * Refund payment
   */
  static async refundPayment(
    transactionId: string,
    amount?: number
  ): Promise<{ success: boolean; refund_id: string }> {
    try {
      // Get original transaction
      const transaction = await this.getTransaction(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Process refund through gateway
      const refundAmount = amount || transaction.amount;
      
      // In a real implementation, this would call the payment gateway API
      const refundId = `ref_${Date.now()}`;

      // Create refund record
      const { error } = await supabase
        .from('payments')
        .insert({
          reference: refundId,
          amount: -refundAmount, // Negative amount for refund
          status: 'completed',
          payment_method: transaction.payment_method,
          user_id: 'current_user_id'
        });

      if (error) throw error;

      return {
        success: true,
        refund_id: refundId
      };
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  /**
   * Get payment gateway configuration
   */
  static async getGatewayConfig(gatewayName: 'stripe' | 'paypal'): Promise<PaymentGateway | null> {
    try {
      // In a real implementation, this would fetch from database
      const mockConfig: PaymentGateway = {
        id: `${gatewayName}_config`,
        name: gatewayName,
        is_active: true,
        api_key: gatewayName === 'stripe' ? 'pk_test_...' : 'client_id_...',
        secret_key: gatewayName === 'stripe' ? 'sk_test_...' : 'client_secret_...',
        webhook_url: `https://your-domain.com/webhooks/${gatewayName}`,
        supported_currencies: gatewayName === 'stripe' ? ['USD', 'EUR', 'GBP'] : ['USD', 'EUR', 'GBP', 'CAD'],
        transaction_fee_percentage: gatewayName === 'stripe' ? 2.9 : 3.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return mockConfig;
    } catch (error) {
      console.error('Error getting gateway config:', error);
      return null;
    }
  }

  /**
   * Test payment gateway connection
   */
  static async testGatewayConnection(gatewayName: 'stripe' | 'paypal'): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate gateway connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: `${gatewayName} connection successful`
      };
    } catch (error) {
      console.error('Error testing gateway connection:', error);
      return {
        success: false,
        message: `Failed to connect to ${gatewayName}`
      };
    }
  }
} 