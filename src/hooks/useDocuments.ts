import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface Document {
  id: string;
  user_id: string;
  type: 'invoice' | 'proforma' | 'receipt' | 'quote';
  title: string;
  content: string;
  format: 'html' | 'pdf' | 'docx';
  status: 'draft' | 'published' | 'archived';
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
  type: Document['type'];
  title: string;
  content: string;
  format?: 'html' | 'pdf' | 'docx';
  status?: 'draft' | 'published' | 'archived';
  metadata?: any;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastContext();

  // Load all documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
      showToast({
        title: 'Error',
        description: 'Failed to load documents',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Create new document
  const createDocument = useCallback(async (documentData: CreateDocumentData) => {
    try {
      setSaving(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newDocument = {
        ...documentData,
        user_id: user.id,
        format: documentData.format || 'html',
        status: documentData.status || 'draft',
        metadata: documentData.metadata || {}
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(newDocument)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setDocuments(prev => [data, ...prev]);
      
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setDocuments(prev => 
        prev.map(doc => doc.id === id ? data : doc)
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setDocuments(prev => prev.filter(doc => doc.id !== id));

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

  // Get document by ID
  const getDocument = useCallback((id: string) => {
    return documents.find(doc => doc.id === id);
  }, [documents]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documents,
    loading,
    saving,
    error,
    loadDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument
  };
}; 