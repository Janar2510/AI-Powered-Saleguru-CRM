import { supabase } from './supabase';

// QWeb-style template interface (simulating Odoo's QWeb templates)
interface QWebTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'quotation' | 'contract' | 'receipt' | 'delivery_note';
  template: string;
  variables: string[];
  is_default: boolean;
}

// Document data interface
interface DocumentData {
  id: string;
  name: string;
  type: string;
  date: string;
  due_date?: string;
  amount?: number;
  currency?: string;
  customer: {
    name: string;
    email: string;
    address: string;
    phone?: string;
  };
  company: {
    name: string;
    address: string;
    logo?: string;
    tax_id?: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
    description?: string;
  }>;
  totals?: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

// QWeb Template Engine (simulating Odoo's QWeb)
class QWebEngine {
  private templates: Map<string, QWebTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    // Invoice Template - Modern
    this.templates.set('invoice_modern', {
      id: 'invoice_modern',
      name: 'Modern Invoice',
      type: 'invoice',
      template: 
        '<div class="invoice-modern">' +
          '<header>' +
            '<div class="company-info">' +
              '<img src="{{company.logo}}" alt="{{company.name}}" class="logo" />' +
              '<h1>{{company.name}}</h1>' +
              '<p>{{company.address}}</p>' +
              '<p>Tax ID: {{company.tax_id}}</p>' +
            '</div>' +
            '<div class="invoice-details">' +
              '<h2>INVOICE</h2>' +
              '<p><strong>Invoice #:</strong> {{name}}</p>' +
              '<p><strong>Date:</strong> {{date}}</p>' +
              '<p><strong>Due Date:</strong> {{due_date}}</p>' +
            '</div>' +
          '</header>' +
          
          '<div class="customer-info">' +
            '<h3>Bill To:</h3>' +
            '<p><strong>{{customer.name}}</strong></p>' +
            '<p>{{customer.address}}</p>' +
            '<p>Email: {{customer.email}}</p>' +
            '<p>Phone: {{customer.phone}}</p>' +
          '</div>' +
          
          '<table class="items-table">' +
            '<thead>' +
              '<tr>' +
                '<th>Item</th>' +
                '<th>Description</th>' +
                '<th>Qty</th>' +
                '<th>Unit Price</th>' +
                '<th>Total</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '{{items}}' +
            '</tbody>' +
          '</table>' +
          
          '<div class="totals">' +
            '<div class="total-row">' +
              '<span>Subtotal:</span>' +
              '<span>${{totals.subtotal}}</span>' +
            '</div>' +
            '<div class="total-row">' +
              '<span>Tax:</span>' +
              '<span>${{totals.tax}}</span>' +
            '</div>' +
            '<div class="total-row total">' +
              '<span>Total:</span>' +
              '<span>${{totals.total}}</span>' +
            '</div>' +
          '</div>' +
        '</div>',
      variables: ['name', 'date', 'due_date', 'customer', 'company', 'items', 'totals'],
      is_default: true
    });

    // Invoice Template - Classic
    this.templates.set('invoice_classic', {
      id: 'invoice_classic',
      name: 'Classic Invoice',
      type: 'invoice',
      template: 
        '<div class="invoice-classic">' +
          '<div class="header">' +
            '<h1>INVOICE</h1>' +
            '<div class="invoice-meta">' +
              '<p><strong>Invoice #:</strong> {{name}}</p>' +
              '<p><strong>Date:</strong> {{date}}</p>' +
              '<p><strong>Due Date:</strong> {{due_date}}</p>' +
            '</div>' +
          '</div>' +
          
          '<div class="company-section">' +
            '<h2>{{company.name}}</h2>' +
            '<p>{{company.address}}</p>' +
          '</div>' +
          
          '<div class="customer-section">' +
            '<h3>Customer Information</h3>' +
            '<p><strong>{{customer.name}}</strong></p>' +
            '<p>{{customer.address}}</p>' +
            '<p>Email: {{customer.email}}</p>' +
          '</div>' +
          
          '<table class="items">' +
            '<thead>' +
              '<tr>' +
                '<th>Item</th>' +
                '<th>Qty</th>' +
                '<th>Price</th>' +
                '<th>Total</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '{{items}}' +
            '</tbody>' +
          '</table>' +
          
          '<div class="summary">' +
            '<p><strong>Subtotal:</strong> ${{totals.subtotal}}</p>' +
            '<p><strong>Tax:</strong> ${{totals.tax}}</p>' +
            '<p><strong>Total:</strong> ${{totals.total}}</p>' +
          '</div>' +
        '</div>',
      variables: ['name', 'date', 'due_date', 'customer', 'company', 'items', 'totals'],
      is_default: false
    });

    // Quotation Template
    this.templates.set('quotation_standard', {
      id: 'quotation_standard',
      name: 'Standard Quotation',
      type: 'quotation',
      template: 
        '<div class="quotation">' +
          '<header>' +
            '<h1>QUOTATION</h1>' +
            '<div class="quotation-meta">' +
              '<p><strong>Quote #:</strong> {{name}}</p>' +
              '<p><strong>Date:</strong> {{date}}</p>' +
              '<p><strong>Valid Until:</strong> {{due_date}}</p>' +
            '</div>' +
          '</header>' +
          
          '<div class="company-info">' +
            '<h2>{{company.name}}</h2>' +
            '<p>{{company.address}}</p>' +
          '</div>' +
          
          '<div class="customer-info">' +
            '<h3>Proposal For:</h3>' +
            '<p><strong>{{customer.name}}</strong></p>' +
            '<p>{{customer.address}}</p>' +
          '</div>' +
          
          '<div class="proposal-items">' +
            '<h3>Proposed Items</h3>' +
            '<table>' +
              '<thead>' +
                '<tr>' +
                  '<th>Item</th>' +
                  '<th>Description</th>' +
                  '<th>Qty</th>' +
                  '<th>Unit Price</th>' +
                  '<th>Total</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                '{{items}}' +
              '</tbody>' +
            '</table>' +
          '</div>' +
          
          '<div class="total">' +
            '<p><strong>Total Amount:</strong> ${{totals.total}}</p>' +
          '</div>' +
        '</div>',
      variables: ['name', 'date', 'due_date', 'customer', 'company', 'items', 'totals'],
      is_default: true
    });

    // Contract Template
    this.templates.set('contract_standard', {
      id: 'contract_standard',
      name: 'Standard Contract',
      type: 'contract',
      template: 
        '<div class="contract">' +
          '<header>' +
            '<h1>SERVICE AGREEMENT</h1>' +
            '<p><strong>Contract #:</strong> {{name}}</p>' +
            '<p><strong>Date:</strong> {{date}}</p>' +
          '</header>' +
          
          '<div class="parties">' +
            '<div class="company">' +
              '<h3>Service Provider</h3>' +
              '<p><strong>{{company.name}}</strong></p>' +
              '<p>{{company.address}}</p>' +
            '</div>' +
            
            '<div class="customer">' +
              '<h3>Client</h3>' +
              '<p><strong>{{customer.name}}</strong></p>' +
              '<p>{{customer.address}}</p>' +
            '</div>' +
          '</div>' +
          
          '<div class="terms">' +
            '<h3>Terms and Conditions</h3>' +
            '<p>This agreement is entered into on {{date}} between {{company.name}} and {{customer.name}}.</p>' +
            '<p>The total contract value is ${{totals.total}}.</p>' +
          '</div>' +
        '</div>',
      variables: ['name', 'date', 'customer', 'company', 'totals'],
      is_default: true
    });
  }

  // Render template with data (simulating QWeb rendering)
  async renderTemplate(templateId: string, data: DocumentData): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Simple template rendering (in a real implementation, this would use a proper template engine)
    let rendered = template.template;
    
    // Replace variables with actual data
    rendered = rendered.replace(/\{\{name\}\}/g, data.name);
    rendered = rendered.replace(/\{\{date\}\}/g, data.date);
    rendered = rendered.replace(/\{\{due_date\}\}/g, data.due_date || '');
    rendered = rendered.replace(/\{\{customer\.name\}\}/g, data.customer.name);
    rendered = rendered.replace(/\{\{customer\.email\}\}/g, data.customer.email);
    rendered = rendered.replace(/\{\{customer\.address\}\}/g, data.customer.address);
    rendered = rendered.replace(/\{\{customer\.phone\}\}/g, data.customer.phone || '');
    rendered = rendered.replace(/\{\{company\.name\}\}/g, data.company.name);
    rendered = rendered.replace(/\{\{company\.address\}\}/g, data.company.address);
    rendered = rendered.replace(/\{\{company\.logo\}\}/g, data.company.logo || '');
    rendered = rendered.replace(/\{\{company\.tax_id\}\}/g, data.company.tax_id || '');
    
    if (data.totals) {
      rendered = rendered.replace(/\{\{totals\.subtotal\}\}/g, data.totals.subtotal.toString());
      rendered = rendered.replace(/\{\{totals\.tax\}\}/g, data.totals.tax.toString());
      rendered = rendered.replace(/\{\{totals\.total\}\}/g, data.totals.total.toString());
    }

    // Handle items array (simplified)
    if (data.items && data.items.length > 0) {
      const itemsHtml = data.items.map(item => 
        '<tr>' +
          '<td>' + item.name + '</td>' +
          '<td>' + (item.description || '') + '</td>' +
          '<td>' + item.quantity + '</td>' +
          '<td>$' + item.unit_price.toFixed(2) + '</td>' +
          '<td>$' + item.total.toFixed(2) + '</td>' +
        '</tr>'
      ).join('');
      
      rendered = rendered.replace(/\{\{items\}\}/g, itemsHtml);
    }

    return rendered;
  }

  // Get available templates
  getTemplates(type?: string): QWebTemplate[] {
    const templates = Array.from(this.templates.values());
    if (type) {
      return templates.filter(t => t.type === type);
    }
    return templates;
  }

  // Get default template for a type
  getDefaultTemplate(type: string): QWebTemplate | null {
    const templates = this.getTemplates(type);
    return templates.find(t => t.is_default) || templates[0] || null;
  }
}

// Portal Document Service
class PortalDocumentService {
  private qwebEngine: QWebEngine;

  constructor() {
    this.qwebEngine = new QWebEngine();
  }

  // Generate PDF document (simulating Odoo's PDF generation)
  async generatePDF(templateId: string, data: DocumentData): Promise<Blob> {
    try {
      // Render the template
      const htmlContent = await this.qwebEngine.renderTemplate(templateId, data);
      
      // In a real implementation, this would use a PDF generation library
      // like jsPDF, puppeteer, or a server-side PDF service
      const fullHtml = 
        '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
          '<meta charset="UTF-8">' +
          '<title>' + data.name + '</title>' +
          '<style>' +
            'body { font-family: Arial, sans-serif; margin: 20px; }' +
            '.invoice-modern, .invoice-classic, .quotation, .contract { max-width: 800px; margin: 0 auto; }' +
            'table { width: 100%; border-collapse: collapse; margin: 20px 0; }' +
            'th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }' +
            'th { background-color: #f2f2f2; }' +
            '.totals { margin-top: 20px; text-align: right; }' +
            '.total-row { margin: 5px 0; }' +
            '.total { font-weight: bold; font-size: 1.2em; }' +
            'header { display: flex; justify-content: space-between; margin-bottom: 30px; }' +
            '.company-info, .customer-info { margin: 20px 0; }' +
          '</style>' +
        '</head>' +
        '<body>' +
          htmlContent +
        '</body>' +
        '</html>';

      // For now, return a mock PDF blob
      // In production, this would convert HTML to PDF
      const blob = new Blob([fullHtml], { type: 'text/html' });
      return blob;
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error}`);
    }
  }

  // Download document
  async downloadDocument(templateId: string, data: DocumentData, filename?: string): Promise<void> {
    try {
      const blob = await this.generatePDF(templateId, data);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${data.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to download document: ${error}`);
    }
  }

  // Preview document
  async previewDocument(templateId: string, data: DocumentData): Promise<string> {
    try {
      const htmlContent = await this.qwebEngine.renderTemplate(templateId, data);
      return htmlContent;
    } catch (error) {
      throw new Error(`Failed to preview document: ${error}`);
    }
  }

  // Get available templates
  getTemplates(type?: string): QWebTemplate[] {
    return this.qwebEngine.getTemplates(type);
  }

  // Get default template for a type
  getDefaultTemplate(type: string): QWebTemplate | null {
    return this.qwebEngine.getDefaultTemplate(type);
  }

  // Save generated document to database
  async saveGeneratedDocument(documentData: {
    template_id: string;
    document_data: DocumentData;
    generated_at: string;
    user_id: string;
    filename: string;
  }): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .insert([documentData]);

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to save generated document: ${error}`);
    }
  }

  // Get document history for a user
  async getDocumentHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to get document history: ${error}`);
    }
  }

  // Create sample document data
  createSampleDocumentData(type: string): DocumentData {
    const baseData: DocumentData = {
      id: `doc_${Date.now()}`,
      name: `${type.toUpperCase()}-${Date.now()}`,
      type: type,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        address: '123 Business St, Tech City, TC 12345',
        phone: '+1 (555) 123-4567'
      },
      company: {
        name: 'TechCorp Inc.',
        address: '456 Innovation Ave, Tech Hub, TH 67890',
        logo: 'https://via.placeholder.com/150x50',
        tax_id: 'TAX-123456789'
      },
      items: [
        {
          name: 'Web Development Services',
          quantity: 1,
          unit_price: 5000.00,
          total: 5000.00,
          description: 'Custom website development and implementation'
        },
        {
          name: 'SEO Optimization',
          quantity: 1,
          unit_price: 1500.00,
          total: 1500.00,
          description: 'Search engine optimization services'
        }
      ],
      totals: {
        subtotal: 6500.00,
        tax: 650.00,
        total: 7150.00
      }
    };

    return baseData;
  }
}

// Export singleton instance
export const portalDocumentService = new PortalDocumentService();
export type { QWebTemplate, DocumentData }; 