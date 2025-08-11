import { supabase } from './supabase';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocument {
  id: string;
  template_id: string;
  data: any;
  generated_at: string;
  download_url?: string;
  preview_url?: string;
  created_at: string;
  updated_at: string;
}

class DocumentTemplatesService {
  // Templates
  async getTemplates(): Promise<DocumentTemplate[]> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTemplatesByType(type: string): Promise<DocumentTemplate[]> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createTemplate(template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTemplate(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('document_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Generated Documents
  async getGeneratedDocuments(): Promise<GeneratedDocument[]> {
    const { data, error } = await supabase
      .from('generated_documents')
      .select(`
        *,
        document_templates(name, type)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createGeneratedDocument(document: Omit<GeneratedDocument, 'id' | 'created_at' | 'updated_at'>): Promise<GeneratedDocument> {
    const { data, error } = await supabase
      .from('generated_documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Document Generation
  async generateDocument(templateId: string, data: any): Promise<GeneratedDocument> {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Generate document content (this would typically involve a document generation service)
    const generatedContent = this.processTemplate(template.content, data);

    // Create generated document record
    const generatedDocument = await this.createGeneratedDocument({
      template_id: templateId,
      data,
      generated_at: new Date().toISOString(),
      download_url: `/api/documents/${templateId}/download`,
      preview_url: `/api/documents/${templateId}/preview`
    });

    return generatedDocument;
  }

  private processTemplate(template: string, data: any): string {
    // Simple template processing - replace {{variable}} with data values
    let processed = template;
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return processed;
  }

  // Template Management
  async activateTemplate(id: string): Promise<void> {
    // Template activation logic can be implemented here
    console.log(`Template ${id} activated`);
  }

  async deactivateTemplate(id: string): Promise<void> {
    // Template deactivation logic can be implemented here
    console.log(`Template ${id} deactivated`);
  }

  // Default Templates
  async createDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        name: 'Invoice Template',
        type: 'invoice',
        content: `
          INVOICE
          
          Invoice Number: {{invoice_number}}
          Date: {{invoice_date}}
          Due Date: {{due_date}}
          
          Bill To:
          {{customer_name}}
          {{customer_address}}
          
          Items:
          {{items}}
          
          Subtotal: {{subtotal}}
          Tax: {{tax_amount}}
          Total: {{total_amount}}
        `
      },
      {
        name: 'Quotation Template',
        type: 'quotation',
        content: `
          QUOTATION
          
          Quote Number: {{quotation_number}}
          Date: {{quotation_date}}
          Valid Until: {{valid_until}}
          
          Customer:
          {{customer_name}}
          {{customer_address}}
          
          Items:
          {{items}}
          
          Subtotal: {{subtotal}}
          Tax: {{tax_amount}}
          Total: {{total_amount}}
        `
      },
      {
        name: 'Sales Order Template',
        type: 'sales_order',
        content: `
          SALES ORDER
          
          Order Number: {{order_number}}
          Date: {{order_date}}
          
          Customer:
          {{customer_name}}
          {{customer_address}}
          
          Items:
          {{items}}
          
          Subtotal: {{subtotal}}
          Tax: {{tax_amount}}
          Total: {{total_amount}}
        `
      }
    ];

    for (const template of defaultTemplates) {
      await this.createTemplate(template);
    }
  }
}

export const documentTemplatesService = new DocumentTemplatesService(); 