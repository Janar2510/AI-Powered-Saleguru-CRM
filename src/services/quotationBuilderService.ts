import { supabase } from './supabase';

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id?: string;
  customer_name: string;
  quotation_date: string;
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  subject?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
}

export interface UpsellSuggestion {
  id: string;
  product_name: string;
  description: string;
  price: number;
  reason: string;
  confidence: number;
}

class QuotationBuilderService {
  // Quotations
  async getQuotations(): Promise<Quotation[]> {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getQuotationById(id: string): Promise<Quotation | null> {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createQuotation(quotation: Omit<Quotation, 'id' | 'created_at' | 'updated_at'>): Promise<Quotation> {
    const { data, error } = await supabase
      .from('quotations')
      .insert(quotation)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation> {
    const { data, error } = await supabase
      .from('quotations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuotation(id: string): Promise<void> {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Quotation Items
  async getQuotationItems(quotationId: string): Promise<QuotationItem[]> {
    const { data, error } = await supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quotationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addQuotationItem(item: Omit<QuotationItem, 'id' | 'created_at'>): Promise<QuotationItem> {
    const { data, error } = await supabase
      .from('quotation_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQuotationItem(id: string, updates: Partial<QuotationItem>): Promise<QuotationItem> {
    const { data, error } = await supabase
      .from('quotation_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeQuotationItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('quotation_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Quotation Operations
  async sendQuotation(id: string): Promise<void> {
    await this.updateQuotation(id, {
      status: 'sent'
    });
  }

  async acceptQuotation(id: string): Promise<void> {
    await this.updateQuotation(id, {
      status: 'accepted'
    });
  }

  async rejectQuotation(id: string): Promise<void> {
    await this.updateQuotation(id, {
      status: 'rejected'
    });
  }

  async expireQuotation(id: string): Promise<void> {
    await this.updateQuotation(id, {
      status: 'expired'
    });
  }

  // Upselling
  async getUpsellSuggestions(quotationId: string): Promise<UpsellSuggestion[]> {
    // This would typically use AI to analyze the quotation and suggest additional products
    const mockSuggestions: UpsellSuggestion[] = [
      {
        id: '1',
        product_name: 'Extended Warranty',
        description: 'Additional 2 years warranty coverage',
        price: 299.99,
        reason: 'Based on your equipment selection',
        confidence: 0.85
      },
      {
        id: '2',
        product_name: 'Installation Service',
        description: 'Professional installation and setup',
        price: 199.99,
        reason: 'Complex equipment requires expert installation',
        confidence: 0.92
      },
      {
        id: '3',
        product_name: 'Training Package',
        description: 'Staff training and documentation',
        price: 499.99,
        reason: 'New system implementation',
        confidence: 0.78
      }
    ];

    return mockSuggestions;
  }

  // Analytics
  async getQuotationAnalytics(): Promise<{
    totalQuotations: number;
    totalValue: number;
    averageValue: number;
    quotationsByStatus: Record<string, number>;
    conversionRate: number;
  }> {
    const quotations = await this.getQuotations();
    
    const totalQuotations = quotations.length;
    const totalValue = quotations.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
    const averageValue = totalQuotations > 0 ? totalValue / totalQuotations : 0;
    
    const quotationsByStatus = quotations.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const acceptedQuotations = quotations.filter(q => q.status === 'accepted').length;
    const conversionRate = totalQuotations > 0 ? (acceptedQuotations / totalQuotations) * 100 : 0;

    return {
      totalQuotations,
      totalValue,
      averageValue,
      quotationsByStatus,
      conversionRate
    };
  }

  // Convert to Sales Order
  async convertToSalesOrder(quotationId: string): Promise<any> {
    const quotation = await this.getQuotationById(quotationId);
    if (!quotation) throw new Error('Quotation not found');

    // This would create a sales order from the quotation
    // For now, we'll just update the quotation status
    await this.updateQuotation(quotationId, {
      status: 'accepted'
    });

    return { success: true, message: 'Quotation converted to sales order' };
  }

  // Generate PDF
  async generatePDF(quotationId: string): Promise<string> {
    // This would generate a PDF of the quotation
    // For now, return a mock URL
    return `/api/quotations/${quotationId}/pdf`;
  }

  // Send to Customer
  async sendToCustomer(quotationId: string, email: string): Promise<void> {
    await this.updateQuotation(quotationId, {
      status: 'sent'
    });

    // In a real implementation, this would send an email with the quotation
    console.log(`Sending quotation ${quotationId} to ${email}`);
  }
}

export const quotationBuilderService = new QuotationBuilderService(); 