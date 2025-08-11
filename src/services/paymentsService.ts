import { supabase } from './supabase';

export interface Payment {
  id: string;
  reference: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  user_id?: string;
  invoice_id?: string;
  order_id?: string;
  transaction_id?: string;
  gateway_response?: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'other';
  config: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  config: any;
  created_at: string;
  updated_at: string;
}

class PaymentsService {
  // Payments
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createPaymentMethod(method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(method)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Payment Gateways
  async getPaymentGateways(): Promise<PaymentGateway[]> {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createPaymentGateway(gateway: Omit<PaymentGateway, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentGateway> {
    const { data, error } = await supabase
      .from('payment_gateways')
      .insert(gateway)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePaymentGateway(id: string, updates: Partial<PaymentGateway>): Promise<PaymentGateway> {
    const { data, error } = await supabase
      .from('payment_gateways')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Payment Processing
  async processPayment(amount: number, paymentMethod: string, reference: string, metadata?: any): Promise<Payment> {
    // In a real implementation, this would integrate with payment gateways
    const payment = await this.createPayment({
      reference,
      amount,
      status: 'pending',
      payment_method: paymentMethod,
      gateway_response: metadata
    });

    // Simulate payment processing
    setTimeout(async () => {
      await this.updatePayment(payment.id, {
        status: 'completed',
        transaction_id: `txn_${Date.now()}`
      });
    }, 2000);

    return payment;
  }

  async refundPayment(paymentId: string, amount: number, reason: string): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);
    if (!payment) throw new Error('Payment not found');

    if (payment.status !== 'completed') {
      throw new Error('Payment must be completed to refund');
    }

    // Create refund payment
    const refund = await this.createPayment({
      reference: `REFUND_${payment.reference}`,
      amount: -amount, // Negative amount for refund
      status: 'completed',
      payment_method: payment.payment_method,
      gateway_response: { reason, original_payment_id: paymentId }
    });

    // Update original payment status
    await this.updatePayment(paymentId, {
      status: 'refunded'
    });

    return refund;
  }

  // Analytics
  async getPaymentAnalytics(): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    paymentsByStatus: Record<string, number>;
    paymentsByMethod: Record<string, number>;
    monthlyRevenue: number;
  }> {
    const payments = await this.getPayments();
    
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;
    
    const paymentsByStatus = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentsByMethod = payments.reduce((acc, payment) => {
      acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate monthly revenue (simplified)
    const currentMonth = new Date().getMonth();
    const monthlyPayments = payments.filter(payment => {
      const paymentMonth = new Date(payment.created_at).getMonth();
      return paymentMonth === currentMonth && payment.status === 'completed';
    });
    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalPayments,
      totalAmount,
      averageAmount,
      paymentsByStatus,
      paymentsByMethod,
      monthlyRevenue
    };
  }

  // Gateway Integration
  async testGateway(gatewayId: string): Promise<boolean> {
    // In a real implementation, this would test the payment gateway connection
    console.log(`Testing gateway ${gatewayId}`);
    return true;
  }

  async syncGatewayTransactions(gatewayId: string): Promise<void> {
    // In a real implementation, this would sync transactions from the gateway
    console.log(`Syncing transactions from gateway ${gatewayId}`);
  }
}

export const paymentsService = new PaymentsService(); 