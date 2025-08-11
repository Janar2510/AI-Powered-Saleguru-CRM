import { supabase } from './supabase';

export interface Invoice {
  id: string;
  number: string;
  customer_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  date: string;
  partner_name?: string;
  partner_id?: string;
  ai_analysis?: any;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  reference: string;
  amount: number;
  status: string;
  payment_method?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

class AccountingService {
  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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

  // Financial Operations
  async recordPayment(invoiceId: string, amount: number, paymentMethod: string, reference: string): Promise<void> {
    // Create payment record
    await this.createPayment({
      reference,
      amount,
      status: 'completed',
      payment_method: paymentMethod
    });

    // Update invoice status
    const invoice = await this.getInvoiceById(invoiceId);
    if (invoice) {
      const newStatus = amount >= invoice.amount ? 'paid' : 'partial';
      await this.updateInvoice(invoiceId, { status: newStatus });
    }
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics
  async getFinancialSummary(): Promise<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    overdueAmount: number;
  }> {
    const invoices = await this.getInvoices();
    
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const outstandingAmount = invoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);

    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      outstandingAmount,
      overdueAmount
    };
  }
}

export const accountingService = new AccountingService(); 