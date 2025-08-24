import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface Document {
  id: string;
  org_id: string;
  document_number: string;
  title: string;
  description?: string;
  document_type: 'quote' | 'sales_order' | 'invoice' | 'proforma' | 'receipt' | 
                 'contract' | 'nda' | 'agreement' | 'warranty' | 'manual' | 
                 'certificate' | 'report' | 'other';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  content?: string;
  status: 'draft' | 'pending_review' | 'approved' | 'sent' | 'viewed' | 
          'signed' | 'completed' | 'expired' | 'cancelled' | 'archived';
  signature_required: boolean;
  signature_deadline?: string;
  signature_completed_at?: string;
  signature_data: any;
  contact_id?: string;
  organization_id?: string;
  deal_id?: string;
  quote_id?: string;
  sales_order_id?: string;
  invoice_id?: string;
  total_amount_cents: number;
  currency: string;
  is_public: boolean;
  password_protected: boolean;
  access_password?: string;
  created_by?: string;
  updated_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  tags: string[];
  metadata: any;
  version: number;
  parent_document_id?: string;
}

export interface DocumentSignature {
  id: string;
  document_id: string;
  org_id: string;
  signer_name: string;
  signer_email: string;
  signer_role: 'internal' | 'customer' | 'vendor' | 'partner';
  signer_title?: string;
  company_name?: string;
  signature_type: 'digital' | 'drawn' | 'typed' | 'uploaded';
  signature_data: any;
  signature_image_url?: string;
  ip_address?: string;
  user_agent?: string;
  location_data: any;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  signed_at?: string;
  declined_reason?: string;
  created_at: string;
  updated_at: string;
  invitation_sent_at?: string;
  reminder_sent_at?: string;
  reminder_count: number;
}

export interface WarrantyClaim {
  id: string;
  org_id: string;
  claim_number: string;
  warranty_type: 'product' | 'service' | 'extended' | 'manufacturer';
  product_name: string;
  product_serial?: string;
  product_model?: string;
  purchase_date?: string;
  warranty_start_date?: string;
  warranty_end_date?: string;
  customer_contact_id?: string;
  customer_organization_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  issue_description: string;
  issue_type?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 
          'in_progress' | 'parts_ordered' | 'resolved' | 'closed';
  resolution_description?: string;
  resolution_cost_cents: number;
  attachments: any[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  related_sales_order_id?: string;
  related_invoice_id?: string;
  assigned_to?: string;
}

export interface CreateDocumentData {
  title: string;
  description?: string;
  document_type: Document['document_type'];
  content?: string;
  file_url?: string;
  file_name?: string;
  signature_required?: boolean;
  signature_deadline?: string;
  contact_id?: string;
  organization_id?: string;
  deal_id?: string;
  quote_id?: string;
  sales_order_id?: string;
  invoice_id?: string;
  total_amount_cents?: number;
  currency?: string;
  tags?: string[];
  metadata?: any;
}

export interface CreateWarrantyClaimData {
  warranty_type: WarrantyClaim['warranty_type'];
  product_name: string;
  product_serial?: string;
  product_model?: string;
  purchase_date?: string;
  warranty_start_date?: string;
  warranty_end_date?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  issue_description: string;
  issue_type?: string;
  severity: WarrantyClaim['severity'];
  attachments?: any[];
}

export const useDocumentsComprehensive = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signatures, setSignatures] = useState<DocumentSignature[]>([]);
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastContext();

  // Load all documents
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching documents...');
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('org_id', 'temp-org')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Documents fetch error:', error);
        throw error;
      }

      console.log('📄 Fetched documents:', data?.length || 0);
      let safeData = data || [];
      
      // For development, add sample documents if none exist
      if (safeData.length === 0) {
        safeData = [
          {
            id: 'doc_001',
            title: 'Service Agreement Contract',
            document_number: 'CON-000001',
            document_type: 'contract',
            status: 'draft',
            total_amount_cents: 500000,
            currency: 'EUR',
            signature_required: true,
            created_at: '2025-01-20T10:00:00Z',
            updated_at: '2025-01-20T10:00:00Z',
            org_id: 'temp-org'
          },
          {
            id: 'doc_002',
            title: 'NDA Agreement',
            document_number: 'NDA-000001',
            document_type: 'nda',
            status: 'sent',
            total_amount_cents: 0,
            currency: 'EUR',
            signature_required: true,
            created_at: '2025-01-19T14:30:00Z',
            updated_at: '2025-01-19T14:30:00Z',
            org_id: 'temp-org'
          },
          {
            id: 'doc_003',
            title: 'Invoice #INV-001',
            document_number: 'INV-000001',
            document_type: 'invoice',
            status: 'sent',
            total_amount_cents: 250000,
            currency: 'EUR',
            signature_required: false,
            created_at: '2025-01-18T09:15:00Z',
            updated_at: '2025-01-18T09:15:00Z',
            org_id: 'temp-org'
          },
          {
            id: 'doc_004',
            title: 'Quote for Web Development',
            document_number: 'QUO-000001',
            document_type: 'quote',
            status: 'pending_review',
            total_amount_cents: 750000,
            currency: 'EUR',
            signature_required: true,
            created_at: '2025-01-17T16:45:00Z',
            updated_at: '2025-01-17T16:45:00Z',
            org_id: 'temp-org'
          }
        ];
      }
      
      setDocuments(safeData);
      return safeData;
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
      showToast({
        title: 'Error',
        description: 'Failed to load documents',
        type: 'error'
      });
      setDocuments([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Load document signatures
  const fetchSignatures = useCallback(async (documentId?: string) => {
    try {
      let query = supabase
        .from('document_signatures')
        .select('*')
        .eq('org_id', 'temp-org');

      if (documentId) {
        query = query.eq('document_id', documentId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const safeData = data || [];
      setSignatures(safeData);
      return safeData;
    } catch (err) {
      console.error('Error loading signatures:', err);
      setSignatures([]);
      return [];
    }
  }, []);

  // Load warranty claims
  const fetchWarrantyClaims = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('warranty_claims')
        .select('*')
        .eq('org_id', 'temp-org')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let safeData = data || [];
      
      // For development, add sample warranty claims if none exist
      if (safeData.length === 0) {
        safeData = [
          {
            id: 'wc_001',
            claim_number: 'WAR-000001',
            customer_name: 'John Doe',
            customer_email: 'john@example.com',
            product_name: 'Premium Laptop',
            issue_description: 'Battery not charging properly',
            status: 'submitted',
            severity: 'medium',
            resolution_cost_cents: 50000,
            created_at: '2025-01-20T11:00:00Z',
            updated_at: '2025-01-20T11:00:00Z',
            org_id: 'temp-org'
          },
          {
            id: 'wc_002',
            claim_number: 'WAR-000002',
            customer_name: 'Jane Smith',
            customer_email: 'jane@company.com',
            product_name: 'Wireless Headphones',
            issue_description: 'Audio cutting out intermittently',
            status: 'under_review',
            severity: 'low',
            resolution_cost_cents: 25000,
            created_at: '2025-01-19T15:30:00Z',
            updated_at: '2025-01-19T15:30:00Z',
            org_id: 'temp-org'
          }
        ];
      }
      
      setWarrantyClaims(safeData);
      return safeData;
    } catch (err) {
      console.error('Error loading warranty claims:', err);
      setWarrantyClaims([]);
      return [];
    }
  }, []);

  // Create new document
  const createDocument = useCallback(async (documentData: CreateDocumentData) => {
    try {
      setSaving(true);
      setError(null);

      const newDocument = {
        ...documentData,
        org_id: 'temp-org',
        status: 'draft',
        signature_data: {},
        total_amount_cents: documentData.total_amount_cents || 0,
        currency: documentData.currency || 'EUR',
        is_public: false,
        password_protected: false,
        tags: documentData.tags || [],
        metadata: documentData.metadata || {},
        version: 1
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(newDocument)
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => [data, ...(prev || [])]);
      
      showToast({
        title: 'Success',
        description: 'Document created successfully',
        type: 'success'
      });

      return data;
    } catch (err) {
      console.error('Error creating document:', err);
      setError(err instanceof Error ? err.message : 'Failed to create document');
      showToast({
        title: 'Error',
        description: 'Failed to create document',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // Update document
  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    try {
      setSaving(true);
      setError(null);

      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('org_id', 'temp-org')
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => 
        (prev || []).map(doc => doc.id === id ? data : doc)
      );

      showToast({
        title: 'Success',
        description: 'Document updated successfully',
        type: 'success'
      });

      return data;
    } catch (err) {
      console.error('Error updating document:', err);
      setError(err instanceof Error ? err.message : 'Failed to update document');
      showToast({
        title: 'Error',
        description: 'Failed to update document',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // Delete document
  const deleteDocument = useCallback(async (id: string) => {
    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('org_id', 'temp-org');

      if (error) throw error;

      setDocuments(prev => (prev || []).filter(doc => doc.id !== id));

      showToast({
        title: 'Success',
        description: 'Document deleted successfully',
        type: 'success'
      });
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      showToast({
        title: 'Error',
        description: 'Failed to delete document',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // Send document for signature
  const sendForSignature = useCallback(async (documentId: string, signers: Array<{
    name: string;
    email: string;
    role: DocumentSignature['signer_role'];
    title?: string;
    company?: string;
  }>) => {
    try {
      setSaving(true);

      // Create signature requests for each signer
      const signatureRequests = signers.map(signer => ({
        document_id: documentId,
        org_id: 'temp-org',
        signer_name: signer.name,
        signer_email: signer.email,
        signer_role: signer.role,
        signer_title: signer.title,
        company_name: signer.company,
        signature_type: 'digital' as const,
        signature_data: {},
        location_data: {},
        status: 'pending' as const,
        reminder_count: 0,
        invitation_sent_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('document_signatures')
        .insert(signatureRequests)
        .select();

      if (error) throw error;

      // Update document status
      await updateDocument(documentId, { status: 'sent' });

      showToast({
        title: 'Success',
        description: `Document sent to ${signers.length} signer(s) for signature`,
        type: 'success'
      });

      return data;
    } catch (err) {
      console.error('Error sending for signature:', err);
      showToast({
        title: 'Error',
        description: 'Failed to send document for signature',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [updateDocument, showToast]);

  // Create warranty claim
  const createWarrantyClaim = useCallback(async (claimData: CreateWarrantyClaimData) => {
    try {
      setSaving(true);

      const newClaim = {
        ...claimData,
        org_id: 'temp-org',
        status: 'submitted' as const,
        resolution_cost_cents: 0,
        attachments: claimData.attachments || []
      };

      const { data, error } = await supabase
        .from('warranty_claims')
        .insert(newClaim)
        .select()
        .single();

      if (error) throw error;

      setWarrantyClaims(prev => [data, ...prev]);

      showToast({
        title: 'Success',
        description: 'Warranty claim submitted successfully',
        type: 'success'
      });

      return data;
    } catch (err) {
      console.error('Error creating warranty claim:', err);
      showToast({
        title: 'Error',
        description: 'Failed to create warranty claim',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // Get documents by relationship
  const getDocumentsByContact = useCallback((contactId: string) => {
    return (documents || []).filter(doc => doc && doc.contact_id === contactId);
  }, [documents]);

  const getDocumentsByOrganization = useCallback((organizationId: string) => {
    return (documents || []).filter(doc => doc && doc.organization_id === organizationId);
  }, [documents]);

  const getDocumentsByDeal = useCallback((dealId: string) => {
    return (documents || []).filter(doc => doc && doc.deal_id === dealId);
  }, [documents]);

  // Calculate statistics
  const getDocumentStats = useCallback(() => {
    // For development, return sample stats if no documents exist
    if (!documents || documents.length === 0) {
      return {
        total: 12,
        draft: 3,
        pending: 2,
        sent: 4,
        signed: 2,
        expired: 1,
        totalValue: 450000, // 4500 EUR in cents
        requiresSignature: 6,
        completedSignatures: 2
      };
    }

    const stats = {
      total: documents.length,
      draft: documents.filter(d => d && d.status === 'draft').length,
      pending: documents.filter(d => d && d.status === 'pending_review').length,
      sent: documents.filter(d => d && d.status === 'sent').length,
      signed: documents.filter(d => d && d.status === 'signed').length,
      expired: documents.filter(d => d && d.status === 'expired').length,
      totalValue: documents.reduce((sum, d) => sum + (d?.total_amount_cents || 0), 0),
      requiresSignature: documents.filter(d => d && d.signature_required).length,
      completedSignatures: documents.filter(d => d && d.signature_required && d.status === 'signed').length
    };

    return stats;
  }, [documents]);

  const getWarrantyStats = useCallback(() => {
    // For development, return sample stats if no warranty claims exist
    if (!warrantyClaims || warrantyClaims.length === 0) {
      return {
        total: 5,
        submitted: 2,
        underReview: 1,
        inProgress: 1,
        resolved: 1,
        totalCost: 125000 // 1250 EUR in cents
      };
    }

    const stats = {
      total: warrantyClaims.length,
      submitted: warrantyClaims.filter(c => c && c.status === 'submitted').length,
      underReview: warrantyClaims.filter(c => c && c.status === 'under_review').length,
      inProgress: warrantyClaims.filter(c => c && c.status === 'in_progress').length,
      resolved: warrantyClaims.filter(c => c && c.status === 'resolved').length,
      totalCost: warrantyClaims.reduce((sum, c) => sum + (c?.resolution_cost_cents || 0), 0)
    };

    return stats;
  }, [warrantyClaims]);

  // Load data on mount
  useEffect(() => {
    fetchDocuments();
    fetchWarrantyClaims();
  }, [fetchDocuments, fetchWarrantyClaims]);

  return {
    // Data
    documents,
    signatures,
    warrantyClaims,
    
    // Loading states
    loading,
    saving,
    error,
    
    // Document operations
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    sendForSignature,
    
    // Signature operations
    fetchSignatures,
    
    // Warranty operations
    fetchWarrantyClaims,
    createWarrantyClaim,
    
    // Relationship queries
    getDocumentsByContact,
    getDocumentsByOrganization,
    getDocumentsByDeal,
    
    // Statistics
    getDocumentStats,
    getWarrantyStats
  };
};
