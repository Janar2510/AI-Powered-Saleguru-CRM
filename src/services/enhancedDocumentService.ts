import { supabase } from './supabase';

export interface DocumentItem {
  id: string;
  document_id: string;
  product_id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  user_id: string;
  type: 'quote' | 'proforma' | 'invoice' | 'receipt';
  title: string;
  contact_id?: string;
  company_id?: string;
  deal_id?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'delivered' | 'paid';
  notes?: string;
  terms?: string;
  due_date?: string;
  sent_date?: string;
  accepted_date?: string;
  delivered_date?: string;
  paid_date?: string;
  document_number?: string;
  created_at?: string;
  updated_at?: string;
  items?: DocumentItem[];
  contact?: any;
  company?: any;
}

export interface CreateDocumentData {
  type: Document['type'];
  title: string;
  contact_id?: string;
  company_id?: string;
  deal_id?: string;
  tax_rate?: number;
  notes?: string;
  terms?: string;
  due_date?: string;
}

export interface CreateDocumentItemData {
  document_id: string;
  product_id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

class EnhancedDocumentService {
  // Get all documents for current user
  async getDocuments(): Promise<Document[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        items:document_items(*),
        contact:contacts(*),
        company:companies(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get single document with items
  async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        items:document_items(*),
        contact:contacts(*),
        company:companies(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Create new document
  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate document number
    const documentNumber = await this.generateDocumentNumber(documentData.type);

    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...documentData,
        user_id: user.id,
        document_number: documentNumber,
        status: 'draft',
        subtotal: 0,
        tax_amount: 0,
        total: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update document
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete document
  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Add item to document
  async addDocumentItem(itemData: CreateDocumentItemData): Promise<DocumentItem> {
    const total = itemData.quantity * itemData.unit_price;

    const { data, error } = await supabase
      .from('document_items')
      .insert({
        ...itemData,
        total
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update document item
  async updateDocumentItem(id: string, updates: Partial<DocumentItem>): Promise<DocumentItem> {
    // Recalculate total if quantity or unit_price changed
    if (updates.quantity !== undefined || updates.unit_price !== undefined) {
      const currentItem = await this.getDocumentItem(id);
      if (currentItem) {
        const newQuantity = updates.quantity ?? currentItem.quantity;
        const newUnitPrice = updates.unit_price ?? currentItem.unit_price;
        updates.total = newQuantity * newUnitPrice;
      }
    }

    const { data, error } = await supabase
      .from('document_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete document item
  async deleteDocumentItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('document_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get single document item
  async getDocumentItem(id: string): Promise<DocumentItem | null> {
    const { data, error } = await supabase
      .from('document_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Change document status
  async changeDocumentStatus(id: string, status: Document['status']): Promise<Document> {
    const updateData: Partial<Document> = { status };

    // Set appropriate date based on status
    switch (status) {
      case 'sent':
        updateData.sent_date = new Date().toISOString();
        break;
      case 'accepted':
        updateData.accepted_date = new Date().toISOString();
        break;
      case 'delivered':
        updateData.delivered_date = new Date().toISOString();
        break;
      case 'paid':
        updateData.paid_date = new Date().toISOString();
        break;
    }

    return this.updateDocument(id, updateData);
  }

  // Generate document number
  async generateDocumentNumber(type: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `${type}${year}-`;
    
    // Get the last document number for this type and year
    const { data } = await supabase
      .from('documents')
      .select('document_number')
      .like('document_number', `${prefix}%`)
      .order('document_number', { ascending: false })
      .limit(1);

    let sequence = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].document_number;
      const lastSequence = parseInt(lastNumber.replace(prefix, ''));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  // Get documents by contact
  async getDocumentsByContact(contactId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        items:document_items(*),
        contact:contacts(*),
        company:companies(*)
      `)
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get documents by company
  async getDocumentsByCompany(companyId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        items:document_items(*),
        contact:contacts(*),
        company:companies(*)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get documents by deal
  async getDocumentsByDeal(dealId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        items:document_items(*),
        contact:contacts(*),
        company:companies(*)
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create document from template
  async createFromTemplate(templateType: string, contactId?: string, companyId?: string, dealId?: string): Promise<Document> {
    const templateData = this.getTemplateData(templateType);
    
    const documentData: CreateDocumentData = {
      type: templateData.type as any,
      title: templateData.title,
      contact_id: contactId,
      company_id: companyId,
      deal_id: dealId,
      tax_rate: templateData.tax_rate,
      notes: templateData.notes,
      terms: templateData.terms
    };

    const document = await this.createDocument(documentData);

    // Add template items
    for (const item of templateData.items) {
      await this.addDocumentItem({
        document_id: document.id,
        product_id: item.product_id,
        product_name: item.product_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
      });
    }

    return this.getDocument(document.id) as Promise<Document>;
  }

  // Get template data
  private getTemplateData(templateType: string) {
    const templates = {
      quote: {
        type: 'quote',
        title: 'New Quote',
        tax_rate: 20,
        notes: 'Thank you for your interest in our services.',
        terms: 'Payment terms: 30 days from invoice date',
        items: [
          {
            product_id: undefined,
            product_name: 'Service Item',
            description: 'Professional service',
            quantity: 1,
            unit_price: 0
          }
        ]
      },
      invoice: {
        type: 'invoice',
        title: 'New Invoice',
        tax_rate: 20,
        notes: 'Please pay within the specified terms.',
        terms: 'Payment due: 30 days from invoice date',
        items: [
          {
            product_id: undefined,
            product_name: 'Service Item',
            description: 'Professional service',
            quantity: 1,
            unit_price: 0
          }
        ]
      },
      proforma: {
        type: 'proforma',
        title: 'Pro Forma Invoice',
        tax_rate: 20,
        notes: 'This is a pro forma invoice for your reference.',
        terms: 'This is not a tax invoice',
        items: [
          {
            product_id: undefined,
            product_name: 'Service Item',
            description: 'Professional service',
            quantity: 1,
            unit_price: 0
          }
        ]
      },
      receipt: {
        type: 'receipt',
        title: 'Receipt',
        tax_rate: 20,
        notes: 'Thank you for your payment.',
        terms: 'Payment received',
        items: [
          {
            product_id: undefined,
            product_name: 'Service Item',
            description: 'Professional service',
            quantity: 1,
            unit_price: 0
          }
        ]
      }
    };

    return templates[templateType as keyof typeof templates] || templates.quote;
  }
}

export const enhancedDocumentService = new EnhancedDocumentService();
