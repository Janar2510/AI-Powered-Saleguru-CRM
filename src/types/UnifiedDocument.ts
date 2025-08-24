// Unified Document Types for Quote/Order/Invoice workflow
export interface UnifiedDocumentLine {
  id: string;
  product_id?: string;
  product_name: string;
  description: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
  tax_rate?: number;
  discount_percent?: number;
}

export interface UnifiedDocument {
  id: string;
  document_type: 'quote' | 'sales_order' | 'invoice' | 'proforma';
  number: string;
  title: string;
  description?: string;
  
  // Relationships
  org_id: string;
  deal_id?: string;
  company_id?: string;
  contact_id?: string;
  
  // Parent document references (for workflow)
  quote_id?: string;      // For orders/invoices generated from quotes
  sales_order_id?: string; // For invoices generated from orders
  proforma_id?: string;   // For orders generated from proforma
  
  // Financial data
  currency: string;
  subtotal_cents: number;
  tax_rate: number;
  tax_cents: number;
  discount_percent?: number;
  discount_cents?: number;
  total_cents: number;
  
  // Status and dates
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'paid' | 'cancelled';
  issue_date?: string;
  valid_until?: string;
  due_date?: string;
  sent_at?: string;
  viewed_at?: string;
  accepted_at?: string;
  paid_at?: string;
  
  // Customer information
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  billing_address?: string;
  shipping_address?: string;
  
  // Additional fields
  notes?: string;
  terms?: string;
  signature_required: boolean;
  signature_completed_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Line items
  lines: UnifiedDocumentLine[];
}

export interface UnifiedDocumentCreateData {
  document_type: 'quote' | 'sales_order' | 'invoice' | 'proforma';
  title: string;
  description?: string;
  deal_id?: string;
  company_id?: string;
  contact_id?: string;
  quote_id?: string;
  sales_order_id?: string;
  proforma_id?: string;
  currency: string;
  tax_rate: number;
  discount_percent?: number;
  issue_date?: string;
  valid_until?: string;
  due_date?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  billing_address?: string;
  shipping_address?: string;
  notes?: string;
  terms?: string;
  signature_required: boolean;
  lines: Omit<UnifiedDocumentLine, 'id'>[];
}

export interface UnifiedDocumentUpdateData extends Partial<UnifiedDocumentCreateData> {
  id: string;
  status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'paid' | 'cancelled';
}

// Document workflow states
export interface DocumentWorkflowState {
  quote?: UnifiedDocument;
  proforma?: UnifiedDocument;
  sales_order?: UnifiedDocument;
  invoice?: UnifiedDocument;
  canGenerateProforma: boolean;
  canGenerateOrder: boolean;
  canGenerateInvoice: boolean;
}

// Customer Portal specific interface
export interface CustomerDocument extends UnifiedDocument {
  // Additional portal-specific fields
  can_sign: boolean;
  can_download: boolean;
  can_pay: boolean;
  payment_url?: string;
}
