import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { UnifiedDocument, UnifiedDocumentCreateData, UnifiedDocumentUpdateData, CustomerDocument } from '../types/UnifiedDocument';

export const useUnifiedDocuments = (documentType?: 'quote' | 'sales_order' | 'invoice' | 'proforma', customerId?: string) => {
  const [documents, setDocuments] = useState<UnifiedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents with optional filtering
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, return sample data that matches the unified structure
      const sampleDocuments: UnifiedDocument[] = [
        // Quote
        {
          id: 'quote-001',
          document_type: 'quote',
          number: 'QUO-000001',
          title: 'Software License Quote',
          description: 'Annual software licensing proposal',
          org_id: 'temp-org',
          deal_id: 'deal-001',
          company_id: 'company-001',
          contact_id: 'contact-001',
          currency: 'EUR',
          subtotal_cents: 229500,
          tax_rate: 20,
          tax_cents: 45900,
          total_cents: 275400,
          status: 'sent',
          issue_date: '2024-01-15',
          valid_until: '2024-02-15',
          customer_name: 'Tech Solutions OÜ',
          customer_email: 'contact@techsolutions.ee',
          customer_phone: '+372 1234 5678',
          billing_address: 'Tallinn, Estonia',
          signature_required: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          lines: [
            {
              id: 'line-001',
              product_name: 'CRM Software License',
              description: 'Annual license for 10 users',
              qty: 1,
              unit_price_cents: 199500,
              line_total_cents: 199500,
            },
            {
              id: 'line-002',
              product_name: 'Setup & Training',
              description: 'Initial setup and user training',
              qty: 1,
              unit_price_cents: 30000,
              line_total_cents: 30000,
            }
          ]
        },
        
        // Sales Order (generated from quote)
        {
          id: 'order-001',
          document_type: 'sales_order',
          number: 'SO-000001',
          title: 'Software License Order',
          description: 'Annual software licensing order',
          org_id: 'temp-org',
          deal_id: 'deal-001',
          company_id: 'company-001',
          contact_id: 'contact-001',
          quote_id: 'quote-001', // Reference to parent quote
          currency: 'EUR',
          subtotal_cents: 229500,
          tax_rate: 20,
          tax_cents: 45900,
          total_cents: 275400,
          status: 'accepted',
          issue_date: '2024-01-16',
          customer_name: 'Tech Solutions OÜ',
          customer_email: 'contact@techsolutions.ee',
          customer_phone: '+372 1234 5678',
          billing_address: 'Tallinn, Estonia',
          shipping_address: 'Tallinn, Estonia',
          signature_required: false,
          created_at: '2024-01-16T09:00:00Z',
          updated_at: '2024-01-16T09:00:00Z',
          lines: [
            {
              id: 'line-003',
              product_name: 'CRM Software License',
              description: 'Annual license for 10 users',
              qty: 1,
              unit_price_cents: 199500,
              line_total_cents: 199500,
            },
            {
              id: 'line-004',
              product_name: 'Setup & Training',
              description: 'Initial setup and user training',
              qty: 1,
              unit_price_cents: 30000,
              line_total_cents: 30000,
            }
          ]
        },
        
        // Invoice (generated from sales order)
        {
          id: 'invoice-001',
          document_type: 'invoice',
          number: 'INV-000001',
          title: 'Software License Invoice',
          description: 'Annual software licensing invoice',
          org_id: 'temp-org',
          deal_id: 'deal-001',
          company_id: 'company-001',
          contact_id: 'contact-001',
          quote_id: 'quote-001',
          sales_order_id: 'order-001', // Reference to parent order
          currency: 'EUR',
          subtotal_cents: 229500,
          tax_rate: 20,
          tax_cents: 45900,
          total_cents: 275400,
          status: 'sent',
          issue_date: '2024-01-17',
          due_date: '2024-02-17',
          customer_name: 'Tech Solutions OÜ',
          customer_email: 'contact@techsolutions.ee',
          customer_phone: '+372 1234 5678',
          billing_address: 'Tallinn, Estonia',
          signature_required: false,
          created_at: '2024-01-17T08:00:00Z',
          updated_at: '2024-01-17T08:00:00Z',
          lines: [
            {
              id: 'line-005',
              product_name: 'CRM Software License',
              description: 'Annual license for 10 users',
              qty: 1,
              unit_price_cents: 199500,
              line_total_cents: 199500,
            },
            {
              id: 'line-006',
              product_name: 'Setup & Training',
              description: 'Initial setup and user training',
              qty: 1,
              unit_price_cents: 30000,
              line_total_cents: 30000,
            }
          ]
        }
      ];

      // Filter by document type if specified
      let filteredDocs = sampleDocuments;
      if (documentType) {
        filteredDocs = sampleDocuments.filter(doc => doc.document_type === documentType);
      }

      // Filter by customer if specified (for portal)
      if (customerId) {
        filteredDocs = filteredDocs.filter(doc => doc.company_id === customerId || doc.contact_id === customerId);
      }

      setDocuments(filteredDocs);
      return filteredDocs;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [documentType, customerId]);

  // Create new document
  const createDocument = useCallback(async (data: UnifiedDocumentCreateData): Promise<UnifiedDocument | null> => {
    setLoading(true);
    setError(null);

    try {
      // Calculate totals
      const subtotal = data.lines.reduce((sum, line) => sum + line.line_total_cents, 0);
      const discount = data.discount_percent ? Math.round(subtotal * (data.discount_percent / 100)) : 0;
      const taxableAmount = subtotal - discount;
      const tax = Math.round(taxableAmount * (data.tax_rate / 100));
      const total = taxableAmount + tax;

      // Generate document number based on type
      const getNextNumber = (type: string) => {
        const existing = documents.filter(d => d.document_type === type).length;
        const prefix = type === 'quote' ? 'QUO' : type === 'sales_order' ? 'SO' : type === 'invoice' ? 'INV' : 'PF';
        return `${prefix}-${String(existing + 1).padStart(6, '0')}`;
      };

      const newDocument: UnifiedDocument = {
        id: `${data.document_type}-${Date.now()}`,
        ...data,
        number: getNextNumber(data.document_type),
        subtotal_cents: subtotal,
        discount_cents: discount,
        tax_cents: tax,
        total_cents: total,
        status: 'draft',
        org_id: 'temp-org',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lines: data.lines.map((line, index) => ({
          ...line,
          id: `line-${Date.now()}-${index}`
        }))
      };

      // In real implementation, save to database
      console.log('Creating document:', newDocument);
      
      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [documents]);

  // Update document
  const updateDocument = useCallback(async (data: UnifiedDocumentUpdateData): Promise<UnifiedDocument | null> => {
    setLoading(true);
    setError(null);

    try {
      const existingDoc = documents.find(d => d.id === data.id);
      if (!existingDoc) {
        throw new Error('Document not found');
      }

      // Recalculate totals if lines changed
      let updatedDoc = { ...existingDoc, ...data, updated_at: new Date().toISOString() };
      
      if (data.lines) {
        const subtotal = data.lines.reduce((sum, line) => sum + line.line_total_cents, 0);
        const discount = data.discount_percent ? Math.round(subtotal * (data.discount_percent / 100)) : 0;
        const taxableAmount = subtotal - discount;
        const tax = Math.round(taxableAmount * ((data.tax_rate || existingDoc.tax_rate) / 100));
        const total = taxableAmount + tax;

        updatedDoc = {
          ...updatedDoc,
          subtotal_cents: subtotal,
          discount_cents: discount,
          tax_cents: tax,
          total_cents: total,
          lines: data.lines.map((line, index) => ({
            ...line,
            id: line.id || `line-${Date.now()}-${index}`
          }))
        };
      }

      setDocuments(prev => prev.map(d => d.id === data.id ? updatedDoc : d));
      return updatedDoc;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [documents]);

  // Generate next document in workflow (Quote -> Order -> Invoice)
  const generateNextDocument = useCallback(async (sourceDocId: string): Promise<UnifiedDocument | null> => {
    const sourceDoc = documents.find(d => d.id === sourceDocId);
    if (!sourceDoc) {
      setError('Source document not found');
      return null;
    }

    const nextType = sourceDoc.document_type === 'quote' ? 'sales_order' : 
                    sourceDoc.document_type === 'sales_order' ? 'invoice' : null;
    
    if (!nextType) {
      setError('Cannot generate next document from this type');
      return null;
    }

    const createData: UnifiedDocumentCreateData = {
      document_type: nextType,
      title: sourceDoc.title.replace(/Quote|Order/i, nextType === 'sales_order' ? 'Order' : 'Invoice'),
      description: sourceDoc.description,
      deal_id: sourceDoc.deal_id,
      company_id: sourceDoc.company_id,
      contact_id: sourceDoc.contact_id,
      quote_id: sourceDoc.document_type === 'quote' ? sourceDoc.id : sourceDoc.quote_id,
      sales_order_id: sourceDoc.document_type === 'sales_order' ? sourceDoc.id : undefined,
      currency: sourceDoc.currency,
      tax_rate: sourceDoc.tax_rate,
      discount_percent: sourceDoc.discount_percent,
      customer_name: sourceDoc.customer_name,
      customer_email: sourceDoc.customer_email,
      customer_phone: sourceDoc.customer_phone,
      billing_address: sourceDoc.billing_address,
      shipping_address: sourceDoc.shipping_address,
      notes: sourceDoc.notes,
      terms: sourceDoc.terms,
      signature_required: nextType === 'invoice' ? false : sourceDoc.signature_required,
      lines: sourceDoc.lines.map(line => ({
        product_id: line.product_id,
        product_name: line.product_name,
        description: line.description,
        qty: line.qty,
        unit_price_cents: line.unit_price_cents,
        line_total_cents: line.line_total_cents,
        tax_rate: line.tax_rate,
        discount_percent: line.discount_percent,
      }))
    };

    return await createDocument(createData);
  }, [documents, createDocument]);

  // Delete document
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      setDocuments(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert to customer portal format
  const toCustomerDocuments = useCallback((docs: UnifiedDocument[]): CustomerDocument[] => {
    return docs.map(doc => ({
      ...doc,
      can_sign: doc.signature_required && !doc.signature_completed_at && doc.status === 'sent',
      can_download: true,
      can_pay: doc.document_type === 'invoice' && doc.status === 'sent',
      payment_url: doc.document_type === 'invoice' ? `/portal/payment/${doc.id}` : undefined,
    }));
  }, []);

  // Load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    generateNextDocument,
    deleteDocument,
    toCustomerDocuments,
    clearError: () => setError(null),
  };
};

