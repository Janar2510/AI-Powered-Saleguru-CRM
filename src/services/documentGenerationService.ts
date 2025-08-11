import { supabase } from './supabase';

export interface DocumentData {
  id?: string;
  number: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: string;
  customer_phone?: string;
  company_name: string;
  company_address?: string;
  company_logo?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
  issue_date: string;
  due_date?: string;
  valid_until?: string;
  items: DocumentItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes?: string;
  terms_conditions?: string;
  status: string;
  payment_terms?: string;
  payment_method?: string;
  shipping_method?: string;
  incoterms?: string;
}

export interface DocumentItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total: number;
  sku?: string;
  category?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'receipt' | 'quotation' | 'purchase_order' | 'delivery_note' | 'proforma';
  style: 'modern' | 'classic' | 'minimal' | 'professional' | 'creative';
  content: string;
  is_active: boolean;
  preview_url?: string;
}

export class DocumentGenerationService {
  // Predefined templates
  static readonly TEMPLATES: DocumentTemplate[] = [
    {
      id: 'invoice-modern',
      name: 'Modern Invoice',
      type: 'invoice',
      style: 'modern',
      content: 'modern-invoice-template',
      is_active: true
    },
    {
      id: 'invoice-classic',
      name: 'Classic Invoice',
      type: 'invoice',
      style: 'classic',
      content: 'classic-invoice-template',
      is_active: true
    },
    {
      id: 'invoice-minimal',
      name: 'Minimal Invoice',
      type: 'invoice',
      style: 'minimal',
      content: 'minimal-invoice-template',
      is_active: true
    },
    {
      id: 'quotation-modern',
      name: 'Modern Quotation',
      type: 'quotation',
      style: 'modern',
      content: 'modern-quotation-template',
      is_active: true
    },
    {
      id: 'quotation-classic',
      name: 'Classic Quotation',
      type: 'quotation',
      style: 'classic',
      content: 'classic-quotation-template',
      is_active: true
    },
    {
      id: 'quotation-minimal',
      name: 'Minimal Quotation',
      type: 'quotation',
      style: 'minimal',
      content: 'minimal-quotation-template',
      is_active: true
    },
    {
      id: 'proforma-modern',
      name: 'Modern Pro Forma',
      type: 'proforma',
      style: 'modern',
      content: 'modern-proforma-template',
      is_active: true
    },
    {
      id: 'receipt-modern',
      name: 'Modern Receipt',
      type: 'receipt',
      style: 'modern',
      content: 'modern-receipt-template',
      is_active: true
    },
    {
      id: 'receipt-classic',
      name: 'Classic Receipt',
      type: 'receipt',
      style: 'classic',
      content: 'classic-receipt-template',
      is_active: true
    }
  ];

  static async getTemplates(documentType?: string): Promise<DocumentTemplate[]> {
    try {
      // Get templates from database
      const { data: dbTemplates, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Merge with predefined templates
      const allTemplates = [...this.TEMPLATES];
      if (dbTemplates) {
        allTemplates.push(...dbTemplates);
      }

      // Filter by document type if specified
      if (documentType) {
        return allTemplates.filter(template => template.type === documentType);
      }

      return allTemplates;
    } catch (error) {
      console.error('Error loading templates:', error);
      return this.TEMPLATES;
    }
  }

  static async generateDocument(templateId: string, data: DocumentData): Promise<string> {
    try {
      const template = this.TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
      const tax_amount = subtotal * (data.tax_rate / 100);
      const discount_amount = data.discount_amount || 0;
      const total = subtotal + tax_amount - discount_amount;

      const dataWithTotals = {
        ...data,
        subtotal,
        tax_amount,
        discount_amount,
        total
      };

      const html = this.renderTemplate(template, dataWithTotals);

      // Save to database if requested
      try {
        await supabase.from('generated_documents').insert({
          template_id: templateId,
          document_data: dataWithTotals,
          html_content: html,
          generated_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error saving document:', error);
      }

      return html;
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }

  private static renderTemplate(template: DocumentTemplate, data: DocumentData): string {
    const itemsHTML = this.generateItemsHTML(data.items);
    const baseTemplate = this.getBaseTemplate(template.style);
    
    return baseTemplate
      .replace('{{COMPANY_NAME}}', data.company_name || 'SaleGuru CRM')
      .replace('{{COMPANY_ADDRESS}}', data.company_address || '123 Business St, City, Country')
      .replace('{{COMPANY_PHONE}}', data.company_phone || '+1-234-567-8900')
      .replace('{{COMPANY_EMAIL}}', data.company_email || 'hello@salesguru.com')
      .replace('{{COMPANY_WEBSITE}}', data.company_website || 'www.salesguru.com')
      .replace('{{COMPANY_LOGO}}', data.company_logo || '')
      .replace('{{DOCUMENT_NUMBER}}', data.number)
      .replace('{{CUSTOMER_NAME}}', data.customer_name)
      .replace('{{CUSTOMER_EMAIL}}', data.customer_email || '')
      .replace('{{CUSTOMER_ADDRESS}}', data.customer_address || '')
      .replace('{{CUSTOMER_PHONE}}', data.customer_phone || '')
      .replace('{{ISSUE_DATE}}', data.issue_date)
      .replace('{{DUE_DATE}}', data.due_date || '')
      .replace('{{VALID_UNTIL}}', data.valid_until || '')
      .replace('{{ITEMS_TABLE}}', itemsHTML)
      .replace('{{SUBTOTAL}}', data.subtotal.toFixed(2))
      .replace('{{TAX_RATE}}', data.tax_rate.toString())
      .replace('{{TAX_AMOUNT}}', data.tax_amount.toFixed(2))
      .replace('{{DISCOUNT_AMOUNT}}', data.discount_amount.toFixed(2))
      .replace('{{TOTAL}}', data.total.toFixed(2))
      .replace('{{NOTES}}', data.notes || '')
      .replace('{{TERMS_CONDITIONS}}', data.terms_conditions || '')
      .replace('{{PAYMENT_TERMS}}', data.payment_terms || 'Payment is required within 14 business days')
      .replace('{{PAYMENT_METHOD}}', data.payment_method || 'Bank Transfer')
      .replace('{{SHIPPING_METHOD}}', data.shipping_method || 'Standard Shipping')
      .replace('{{INCOTERMS}}', data.incoterms || 'FOB')
      .replace('{{DOCUMENT_TYPE}}', template.type.toUpperCase())
      .replace(/\{\{CURRENCY\}\}/g, '$');
  }

  private static generateItemsHTML(items: DocumentItem[]): string {
    return items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">
          <div>
            <div style="font-weight: 600; color: #111827;">${item.description}</div>
            ${item.sku ? `<div style="font-size: 12px; color: #6b7280;">SKU: ${item.sku}</div>` : ''}
            ${item.category ? `<div style="font-size: 12px; color: #6b7280;">Category: ${item.category}</div>` : ''}
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.total.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  private static getBaseTemplate(style: string): string {
    switch (style) {
      case 'modern':
        return this.getModernTemplate();
      case 'classic':
        return this.getClassicTemplate();
      case 'minimal':
        return this.getMinimalTemplate();
      default:
        return this.getModernTemplate();
    }
  }

  private static getModernTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{DOCUMENT_TYPE}} - {{DOCUMENT_NUMBER}}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #111827; background: #ffffff; }
          .container { max-width: 800px; margin: 0 auto; padding: 40px; background: white; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .company-info { flex: 1; }
          .company-logo { width: 120px; height: 60px; background: #1f2937; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-bottom: 16px; }
          .company-name { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 8px; }
          .company-details { font-size: 14px; color: #6b7280; line-height: 1.5; }
          .contact-info { text-align: right; font-size: 14px; color: #6b7280; }
          .document-title { font-size: 48px; font-weight: 900; color: #111827; margin: 40px 0; text-transform: uppercase; }
          .document-bar { height: 8px; background: #111827; margin: 20px 0; }
          .billing-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .bill-to { flex: 1; }
          .document-details { flex: 1; text-align: right; }
          .section-title { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 40px 0; }
          .items-table th { background: #111827; color: white; padding: 16px; text-align: left; font-weight: 600; }
          .items-table td { padding: 16px; border-bottom: 1px solid #e5e7eb; }
          .summary-section { display: flex; justify-content: space-between; margin-top: 40px; }
          .payment-terms { flex: 1; }
          .summary-box { background: #f9fafb; padding: 24px; border-radius: 8px; flex: 1; margin-left: 40px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .summary-total { font-size: 20px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 12px; }
          .design-elements { position: relative; height: 100px; margin-top: 40px; }
          .design-shape { position: absolute; background: #111827; border-radius: 50%; opacity: 0.1; }
          .shape-1 { width: 200px; height: 200px; bottom: -100px; left: -100px; }
          .shape-2 { width: 150px; height: 150px; bottom: -50px; right: 100px; }
          .shape-3 { width: 100px; height: 100px; bottom: 0; right: 50px; }
          .payment-method { margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }
          .payment-method h4 { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #111827; }
          .payment-method p { font-size: 14px; color: #6b7280; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="company-info">
              {{#if COMPANY_LOGO}}
                <img src="{{COMPANY_LOGO}}" alt="Company Logo" style="width: 120px; height: 60px; object-fit: contain; margin-bottom: 16px;">
              {{else}}
                <div class="company-logo">{{COMPANY_NAME}}</div>
              {{/if}}
              <div class="company-name">{{COMPANY_NAME}}</div>
              <div class="company-details">
                {{COMPANY_ADDRESS}}<br>
                Phone: {{COMPANY_PHONE}}<br>
                Email: {{COMPANY_EMAIL}}<br>
                Web: {{COMPANY_WEBSITE}}
              </div>
            </div>
            <div class="contact-info">
              <strong>Contact Information</strong><br>
              Phone: {{COMPANY_PHONE}}<br>
              Email: {{COMPANY_EMAIL}}<br>
              Web: {{COMPANY_WEBSITE}}<br>
              Address: {{COMPANY_ADDRESS}}
            </div>
          </div>

          <!-- Document Title -->
          <div class="document-title">{{DOCUMENT_TYPE}}</div>
          <div class="document-bar"></div>

          <!-- Billing Section -->
          <div class="billing-section">
            <div class="bill-to">
              <div class="section-title">Bill To:</div>
              <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">{{CUSTOMER_NAME}}</div>
              {{#if CUSTOMER_PHONE}}<div style="color: #6b7280;">{{CUSTOMER_PHONE}}</div>{{/if}}
              {{#if CUSTOMER_EMAIL}}<div style="color: #6b7280;">{{CUSTOMER_EMAIL}}</div>{{/if}}
              {{#if CUSTOMER_ADDRESS}}<div style="color: #6b7280;">{{CUSTOMER_ADDRESS}}</div>{{/if}}
            </div>
            <div class="document-details">
              <div class="section-title">Document Details:</div>
              <div style="margin-bottom: 8px;"><strong>Date:</strong> {{ISSUE_DATE}}</div>
              <div style="margin-bottom: 8px;"><strong>{{DOCUMENT_TYPE}} No.:</strong> {{DOCUMENT_NUMBER}}</div>
              {{#if DUE_DATE}}<div style="margin-bottom: 8px;"><strong>Due Date:</strong> {{DUE_DATE}}</div>{{/if}}
              {{#if VALID_UNTIL}}<div style="margin-bottom: 8px;"><strong>Valid Until:</strong> {{VALID_UNTIL}}</div>{{/if}}
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Products</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: center;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              {{ITEMS_TABLE}}
            </tbody>
          </table>

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="payment-terms">
              <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Payment Terms</div>
              <div style="color: #6b7280; margin-bottom: 16px;">{{PAYMENT_TERMS}}</div>
              {{#if PAYMENT_METHOD}}
              <div style="font-size: 14px; color: #6b7280;">
                <strong>Payment Method:</strong> {{PAYMENT_METHOD}}
              </div>
              {{/if}}
              {{#if SHIPPING_METHOD}}
              <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">
                <strong>Shipping:</strong> {{SHIPPING_METHOD}}
              </div>
              {{/if}}
              {{#if INCOTERMS}}
              <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">
                <strong>Incoterms:</strong> {{INCOTERMS}}
              </div>
              {{/if}}
            </div>
            <div class="summary-box">
              <div class="summary-row">
                <span>Sub-total:</span>
                <span>${{SUBTOTAL}}</span>
              </div>
              {{#if DISCOUNT_AMOUNT}}
              <div class="summary-row">
                <span>Discount:</span>
                <span>-${{DISCOUNT_AMOUNT}}</span>
              </div>
              {{/if}}
              <div class="summary-row">
                <span>Tax ({{TAX_RATE}}%):</span>
                <span>${{TAX_AMOUNT}}</span>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span>${{TOTAL}}</span>
              </div>
            </div>
          </div>

          <!-- Payment Method Section -->
          <div class="payment-method">
            <h4>Payment Method</h4>
            <p>Bank Name: Your Company Bank | IBAN: US1234567890</p>
          </div>

          <!-- Notes and Terms -->
          {{#if NOTES}}
          <div style="margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 8px;">Notes:</div>
            <div style="color: #6b7280;">{{NOTES}}</div>
          </div>
          {{/if}}

          {{#if TERMS_CONDITIONS}}
          <div style="margin-top: 20px; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 8px;">Terms & Conditions:</div>
            <div style="color: #6b7280; font-size: 14px;">{{TERMS_CONDITIONS}}</div>
          </div>
          {{/if}}

          <!-- Design Elements -->
          <div class="design-elements">
            <div class="design-shape shape-1"></div>
            <div class="design-shape shape-2"></div>
            <div class="design-shape shape-3"></div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getClassicTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{DOCUMENT_TYPE}} - {{DOCUMENT_NUMBER}}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; background: #ffffff; }
          .container { max-width: 800px; margin: 0 auto; padding: 40px; background: white; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
          .company-details { font-size: 14px; color: #666; }
          .document-title { font-size: 36px; font-weight: bold; text-align: center; margin: 30px 0; text-transform: uppercase; }
          .billing-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .bill-to { flex: 1; }
          .document-details { flex: 1; text-align: right; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #000; padding-bottom: 4px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 40px 0; border: 2px solid #000; }
          .items-table th { background: #000; color: white; padding: 12px; text-align: left; font-weight: bold; }
          .items-table td { padding: 12px; border-bottom: 1px solid #000; }
          .items-table tr:last-child td { border-bottom: none; }
          .summary-section { margin-top: 40px; }
          .summary-box { border: 2px solid #000; padding: 20px; width: 300px; margin-left: auto; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .summary-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 12px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="company-name">{{COMPANY_NAME}}</div>
            <div class="company-details">
              {{COMPANY_ADDRESS}} | Phone: {{COMPANY_PHONE}} | Email: {{COMPANY_EMAIL}}
            </div>
          </div>

          <!-- Document Title -->
          <div class="document-title">{{DOCUMENT_TYPE}}</div>

          <!-- Billing Section -->
          <div class="billing-section">
            <div class="bill-to">
              <div class="section-title">Bill To:</div>
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">{{CUSTOMER_NAME}}</div>
              {{#if CUSTOMER_PHONE}}<div>{{CUSTOMER_PHONE}}</div>{{/if}}
              {{#if CUSTOMER_EMAIL}}<div>{{CUSTOMER_EMAIL}}</div>{{/if}}
              {{#if CUSTOMER_ADDRESS}}<div>{{CUSTOMER_ADDRESS}}</div>{{/if}}
            </div>
            <div class="document-details">
              <div class="section-title">Document Details:</div>
              <div style="margin-bottom: 8px;"><strong>Date:</strong> {{ISSUE_DATE}}</div>
              <div style="margin-bottom: 8px;"><strong>{{DOCUMENT_TYPE}} No.:</strong> {{DOCUMENT_NUMBER}}</div>
              {{#if DUE_DATE}}<div style="margin-bottom: 8px;"><strong>Due Date:</strong> {{DUE_DATE}}</div>{{/if}}
              {{#if VALID_UNTIL}}<div style="margin-bottom: 8px;"><strong>Valid Until:</strong> {{VALID_UNTIL}}</div>{{/if}}
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: center;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              {{ITEMS_TABLE}}
            </tbody>
          </table>

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${{SUBTOTAL}}</span>
              </div>
              {{#if DISCOUNT_AMOUNT}}
              <div class="summary-row">
                <span>Discount:</span>
                <span>-${{DISCOUNT_AMOUNT}}</span>
              </div>
              {{/if}}
              <div class="summary-row">
                <span>Tax ({{TAX_RATE}}%):</span>
                <span>${{TAX_AMOUNT}}</span>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span>${{TOTAL}}</span>
              </div>
            </div>
          </div>

          <!-- Payment Terms -->
          <div style="margin-top: 30px; padding: 20px; border: 1px solid #000;">
            <div style="font-weight: bold; margin-bottom: 8px;">Payment Terms:</div>
            <div>{{PAYMENT_TERMS}}</div>
            {{#if PAYMENT_METHOD}}<div style="margin-top: 8px;"><strong>Payment Method:</strong> {{PAYMENT_METHOD}}</div>{{/if}}
          </div>

          <!-- Notes and Terms -->
          {{#if NOTES}}
          <div style="margin-top: 30px;">
            <div style="font-weight: bold; margin-bottom: 8px;">Notes:</div>
            <div>{{NOTES}}</div>
          </div>
          {{/if}}

          {{#if TERMS_CONDITIONS}}
          <div style="margin-top: 20px;">
            <div style="font-weight: bold; margin-bottom: 8px;">Terms & Conditions:</div>
            <div style="font-size: 14px;">{{TERMS_CONDITIONS}}</div>
          </div>
          {{/if}}
        </div>
      </body>
      </html>
    `;
  }

  private static getMinimalTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{DOCUMENT_TYPE}} - {{DOCUMENT_NUMBER}}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: #ffffff; }
          .container { max-width: 700px; margin: 0 auto; padding: 30px; background: white; }
          .header { margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
          .company-details { font-size: 14px; color: #666; }
          .document-title { font-size: 32px; font-weight: bold; margin: 20px 0; text-transform: uppercase; }
          .billing-section { margin-bottom: 30px; }
          .bill-to { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .items-table th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: bold; }
          .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .summary-section { margin-top: 30px; }
          .summary-box { background: #f9f9f9; padding: 20px; border-radius: 4px; width: 250px; margin-left: auto; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .summary-total { font-size: 16px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 12px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="company-name">{{COMPANY_NAME}}</div>
            <div class="company-details">
              {{COMPANY_ADDRESS}} | {{COMPANY_PHONE}} | {{COMPANY_EMAIL}}
            </div>
          </div>

          <!-- Document Title -->
          <div class="document-title">{{DOCUMENT_TYPE}}</div>

          <!-- Billing Section -->
          <div class="billing-section">
            <div class="bill-to">
              <div class="section-title">Bill To:</div>
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">{{CUSTOMER_NAME}}</div>
              {{#if CUSTOMER_PHONE}}<div>{{CUSTOMER_PHONE}}</div>{{/if}}
              {{#if CUSTOMER_EMAIL}}<div>{{CUSTOMER_EMAIL}}</div>{{/if}}
              {{#if CUSTOMER_ADDRESS}}<div>{{CUSTOMER_ADDRESS}}</div>{{/if}}
            </div>
            <div style="text-align: right;">
              <div style="margin-bottom: 8px;"><strong>Date:</strong> {{ISSUE_DATE}}</div>
              <div style="margin-bottom: 8px;"><strong>{{DOCUMENT_TYPE}} No.:</strong> {{DOCUMENT_NUMBER}}</div>
              {{#if DUE_DATE}}<div style="margin-bottom: 8px;"><strong>Due Date:</strong> {{DUE_DATE}}</div>{{/if}}
              {{#if VALID_UNTIL}}<div style="margin-bottom: 8px;"><strong>Valid Until:</strong> {{VALID_UNTIL}}</div>{{/if}}
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: center;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              {{ITEMS_TABLE}}
            </tbody>
          </table>

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${{SUBTOTAL}}</span>
              </div>
              {{#if DISCOUNT_AMOUNT}}
              <div class="summary-row">
                <span>Discount:</span>
                <span>-${{DISCOUNT_AMOUNT}}</span>
              </div>
              {{/if}}
              <div class="summary-row">
                <span>Tax ({{TAX_RATE}}%):</span>
                <span>${{TAX_AMOUNT}}</span>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span>${{TOTAL}}</span>
              </div>
            </div>
          </div>

          <!-- Payment Terms -->
          <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 4px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Payment Terms:</div>
            <div>{{PAYMENT_TERMS}}</div>
          </div>

          <!-- Notes and Terms -->
          {{#if NOTES}}
          <div style="margin-top: 20px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Notes:</div>
            <div>{{NOTES}}</div>
          </div>
          {{/if}}

          {{#if TERMS_CONDITIONS}}
          <div style="margin-top: 15px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Terms & Conditions:</div>
            <div style="font-size: 14px;">{{TERMS_CONDITIONS}}</div>
          </div>
          {{/if}}
        </div>
      </body>
      </html>
    `;
  }

  static async downloadDocument(html: string, filename: string): Promise<void> {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async previewDocument(html: string): Promise<void> {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  }
} 