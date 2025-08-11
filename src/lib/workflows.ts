import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

// Types for workflow entities
export interface WorkflowLead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  source: string;
  status: 'new' | 'working' | 'qualified' | 'lost' | 'converted';
  score: number;
  notes?: string;
  created_at: string;
}

export interface WorkflowContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  company_id?: string;
  created_at: string;
}

export interface WorkflowCompany {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  created_at: string;
}

export interface WorkflowDeal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  probability: number;
  status: 'open' | 'won' | 'lost';
  stage_id: string;
  contact_id?: string;
  company_id?: string;
  expected_close_date?: string;
  created_at: string;
}

export interface WorkflowQuote {
  id: string;
  quote_number: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'confirmed';
  contact_id?: string;
  company_id?: string;
  deal_id?: string;
  currency: string;
  valid_until: string;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  created_at: string;
}

export interface WorkflowSalesOrder {
  id: string;
  so_number: string;
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled';
  quote_id?: string;
  contact_id?: string;
  company_id?: string;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  created_at: string;
}

export interface WorkflowInvoice {
  id: string;
  invoice_number: string;
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  so_id?: string;
  contact_id?: string;
  company_id?: string;
  currency: string;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  due_date: string;
  created_at: string;
}

export interface WorkflowPayment {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  received_at: string;
}

// Workflow Service Class
export class WorkflowService {
  private static instance: WorkflowService;
  private toast: any;

  constructor() {
    // Initialize toast context
    this.toast = null;
  }

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  setToast(toast: any) {
    this.toast = toast;
  }

  // LEAD → CONTACT/COMPANY → DEAL WORKFLOW
  async convertLeadToDeal(leadId: string, conversionData: {
    dealTitle?: string;
    estimatedValue?: number;
    pipeline?: string;
    stage?: string;
    expectedCloseDate?: string;
    createContact?: boolean;
    createCompany?: boolean;
  }): Promise<{ dealId: string; contactId?: string; companyId?: string }> {
    try {
      // 1. Get lead data
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;

      let contactId: string | undefined;
      let companyId: string | undefined;

      // 2. Create or update company
      if (conversionData.createCompany && lead.company) {
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('name', lead.company)
          .maybeSingle();

        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: lead.company,
              domain: lead.email?.split('@')[1] || null,
              metadata: {
                source: lead.source,
                industry: lead.industry,
                size: lead.company_size
              }
            })
            .select()
            .single();

          if (companyError) throw companyError;
          companyId = newCompany.id;
        }
      }

      // 3. Create or update contact
      if (conversionData.createContact) {
        const [firstName, ...lastNameParts] = lead.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id, company_id')
          .eq('email', lead.email)
          .maybeSingle();

        if (existingContact) {
          contactId = existingContact.id;
          // Update contact with company if not set
          if (companyId && !existingContact.company_id) {
            await supabase
              .from('contacts')
              .update({ company_id: companyId })
              .eq('id', contactId);
          }
        } else {
          const { data: newContact, error: contactError } = await supabase
            .from('contacts')
            .insert({
              first_name: firstName,
              last_name: lastName,
              email: lead.email,
              phone: lead.phone,
              company_id: companyId,
              metadata: {
                source: lead.source,
                title: lead.title
              }
            })
            .select()
            .single();

          if (contactError) throw contactError;
          contactId = newContact.id;
        }
      }

      // 4. Create deal
      const dealTitle = conversionData.dealTitle || `${lead.company} - ${lead.name}`;
      
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          title: dealTitle,
          description: `Converted from lead: ${lead.name} (${lead.email})\nSource: ${lead.source}\nLead Score: ${lead.score}`,
          value: conversionData.estimatedValue || 50000,
          currency: 'EUR',
          probability: 25,
          status: 'open',
          stage_id: conversionData.stage || 'qualified',
          contact_id: contactId,
          company_id: companyId,
          expected_close_date: conversionData.expectedCloseDate,
          metadata: {
            converted_from_lead: leadId,
            lead_source: lead.source,
            lead_score: lead.score
          }
        })
        .select()
        .single();

      if (dealError) throw dealError;

      // 5. Update lead status
      await supabase
        .from('leads')
        .update({
          status: 'converted',
          metadata: {
            ...lead.metadata,
            converted_to_deal_id: deal.id,
            converted_at: new Date().toISOString()
          }
        })
        .eq('id', leadId);

      // 6. Create activity log entry
      await this.createActivityLog({
        entity_type: 'deal',
        entity_id: deal.id,
        action: 'created',
        description: `Deal created from lead conversion: ${lead.name}`,
        metadata: {
          lead_id: leadId,
          contact_id: contactId,
          company_id: companyId
        }
      });

      if (this.toast) {
        this.toast.showToast({
          type: 'success',
          title: 'Lead Converted',
          description: `Successfully converted ${lead.name} to deal ${deal.title}`
        });
      }

      return {
        dealId: deal.id,
        contactId,
        companyId
      };

    } catch (error) {
      console.error('Error converting lead to deal:', error);
      if (this.toast) {
        this.toast.showToast({
          type: 'error',
          title: 'Conversion Failed',
          description: error instanceof Error ? error.message : 'Failed to convert lead'
        });
      }
      throw error;
    }
  }

  // QUOTE → SALES ORDER WORKFLOW
  async confirmQuoteToSalesOrder(quoteId: string): Promise<{ salesOrderId: string }> {
    try {
      // 1. Get quote data
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_items (*)
        `)
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;

      // 2. Generate sales order number
      const soNumber = `SO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      // 3. Create sales order
      const { data: salesOrder, error: soError } = await supabase
        .from('sales_orders')
        .insert({
          so_number: soNumber,
          status: 'confirmed',
          quote_id: quoteId,
          contact_id: quote.contact_id,
          company_id: quote.company_id,
          totals: quote.totals,
          metadata: {
            converted_from_quote: quoteId,
            quote_number: quote.quote_number
          }
        })
        .select()
        .single();

      if (soError) throw soError;

      // 4. Create sales order items
      if (quote.quote_items && quote.quote_items.length > 0) {
        const orderItems = quote.quote_items.map((item: any) => ({
          so_id: salesOrder.id,
          product_id: item.product_id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          tax_rate: item.tax_rate
        }));

        const { error: itemsError } = await supabase
          .from('sales_order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // 5. Update quote status
      await supabase
        .from('quotes')
        .update({ status: 'confirmed' })
        .eq('id', quoteId);

      // 6. Create activity log entry
      await this.createActivityLog({
        entity_type: 'sales_order',
        entity_id: salesOrder.id,
        action: 'created',
        description: `Sales order created from quote ${quote.quote_number}`,
        metadata: {
          quote_id: quoteId,
          quote_number: quote.quote_number
        }
      });

      if (this.toast) {
        this.toast.showToast({
          type: 'success',
          title: 'Quote Confirmed',
          description: `Sales order ${soNumber} created from quote ${quote.quote_number}`
        });
      }

      return { salesOrderId: salesOrder.id };

    } catch (error) {
      console.error('Error confirming quote to sales order:', error);
      if (this.toast) {
        this.toast.showToast({
          type: 'error',
          title: 'Confirmation Failed',
          description: error instanceof Error ? error.message : 'Failed to confirm quote'
        });
      }
      throw error;
    }
  }

  // SALES ORDER → DELIVERY → INVOICE WORKFLOW
  async createInvoiceFromSalesOrder(salesOrderId: string): Promise<{ invoiceId: string }> {
    try {
      // 1. Get sales order data
      const { data: salesOrder, error: soError } = await supabase
        .from('sales_orders')
        .select(`
          *,
          sales_order_items (*)
        `)
        .eq('id', salesOrderId)
        .single();

      if (soError) throw soError;

      // 2. Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      // 3. Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          status: 'posted',
          so_id: salesOrderId,
          contact_id: salesOrder.contact_id,
          company_id: salesOrder.company_id,
          currency: 'EUR',
          totals: salesOrder.totals,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          metadata: {
            created_from_so: salesOrderId,
            so_number: salesOrder.so_number
          }
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 4. Create invoice items
      if (salesOrder.sales_order_items && salesOrder.sales_order_items.length > 0) {
        const invoiceItems = salesOrder.sales_order_items.map((item: any) => ({
          invoice_id: invoice.id,
          product_id: item.product_id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          tax_rate: item.tax_rate
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      // 5. Update sales order status
      await supabase
        .from('sales_orders')
        .update({ status: 'fulfilled' })
        .eq('id', salesOrderId);

      // 6. Create activity log entry
      await this.createActivityLog({
        entity_type: 'invoice',
        entity_id: invoice.id,
        action: 'created',
        description: `Invoice created from sales order ${salesOrder.so_number}`,
        metadata: {
          sales_order_id: salesOrderId,
          so_number: salesOrder.so_number
        }
      });

      if (this.toast) {
        this.toast.showToast({
          type: 'success',
          title: 'Invoice Created',
          description: `Invoice ${invoiceNumber} created from sales order ${salesOrder.so_number}`
        });
      }

      return { invoiceId: invoice.id };

    } catch (error) {
      console.error('Error creating invoice from sales order:', error);
      if (this.toast) {
        this.toast.showToast({
          type: 'error',
          title: 'Invoice Creation Failed',
          description: error instanceof Error ? error.message : 'Failed to create invoice'
        });
      }
      throw error;
    }
  }

  // PAYMENT → RECONCILE → LEDGER WORKFLOW
  async recordPayment(paymentData: {
    invoice_id: string;
    amount: number;
    currency: string;
    method: string;
    provider_ref?: string;
  }): Promise<{ paymentId: string }> {
    try {
      // 1. Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: paymentData.invoice_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          method: paymentData.method,
          provider_ref: paymentData.provider_ref,
          status: 'succeeded',
          received_at: new Date().toISOString()
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 2. Update invoice status if fully paid
      const { data: invoice } = await supabase
        .from('invoices')
        .select('totals, status')
        .eq('id', paymentData.invoice_id)
        .single();

      if (invoice) {
        const totalPaid = await this.getTotalPaidForInvoice(paymentData.invoice_id);
        const invoiceTotal = invoice.totals?.total || 0;

        if (totalPaid >= invoiceTotal) {
          await supabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', paymentData.invoice_id);
        }
      }

      // 3. Create ledger entries
      await this.createLedgerEntries(payment.id, paymentData);

      // 4. Create activity log entry
      await this.createActivityLog({
        entity_type: 'payment',
        entity_id: payment.id,
        action: 'received',
        description: `Payment of ${paymentData.amount} ${paymentData.currency} received for invoice`,
        metadata: {
          invoice_id: paymentData.invoice_id,
          method: paymentData.method,
          provider_ref: paymentData.provider_ref
        }
      });

      if (this.toast) {
        this.toast.showToast({
          type: 'success',
          title: 'Payment Recorded',
          description: `Payment of ${paymentData.amount} ${paymentData.currency} recorded successfully`
        });
      }

      return { paymentId: payment.id };

    } catch (error) {
      console.error('Error recording payment:', error);
      if (this.toast) {
        this.toast.showToast({
          type: 'error',
          title: 'Payment Recording Failed',
          description: error instanceof Error ? error.message : 'Failed to record payment'
        });
      }
      throw error;
    }
  }

  // Helper methods
  private async createActivityLog(data: {
    entity_type: string;
    entity_id: string;
    action: string;
    description: string;
    metadata?: any;
  }) {
    try {
      await supabase
        .from('activities')
        .insert({
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          action: data.action,
          description: data.description,
          metadata: data.metadata || {},
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.warn('Failed to create activity log:', error);
    }
  }

  private async getTotalPaidForInvoice(invoiceId: string): Promise<number> {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId)
      .eq('status', 'succeeded');

    return payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  }

  private async createLedgerEntries(paymentId: string, paymentData: any) {
    try {
      // Get default accounts for the organization
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id, code')
        .in('code', ['1010', '1100']) // Bank and A/R accounts
        .limit(2);

      if (accounts && accounts.length >= 2) {
        const bankAccount = accounts.find(a => a.code === '1010');
        const arAccount = accounts.find(a => a.code === '1100');

        if (bankAccount && arAccount) {
          // Debit Bank, Credit A/R
          await supabase
            .from('ledger_entries')
            .insert([
              {
                account_id: bankAccount.id,
                ref_type: 'payment',
                ref_id: paymentId,
                debit: paymentData.amount,
                credit: 0,
                memo: `Payment received via ${paymentData.method}`
              },
              {
                account_id: arAccount.id,
                ref_type: 'payment',
                ref_id: paymentId,
                debit: 0,
                credit: paymentData.amount,
                memo: 'Payment received'
              }
            ]);
        }
      }
    } catch (error) {
      console.warn('Failed to create ledger entries:', error);
    }
  }
}

// Export singleton instance
export const workflowService = WorkflowService.getInstance();
