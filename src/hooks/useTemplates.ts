import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface DocumentTemplate {
  id: string;
  user_id: string | null;
  name: string;
  type: 'invoice' | 'proforma' | 'receipt' | 'quote';
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  type: DocumentTemplate['type'];
  content: string;
  is_default?: boolean;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastContext();

  // Load all templates
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      showToast({
        title: 'Error',
        description: 'Failed to load templates',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Create new template
  const createTemplate = useCallback(async (templateData: CreateTemplateData) => {
    try {
      setSaving(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newTemplate = {
        ...templateData,
        user_id: user.id,
        is_default: templateData.is_default || false
      };

      const { data, error } = await supabase
        .from('document_templates')
        .insert(newTemplate)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTemplates(prev => [data, ...prev]);
      
      showToast({
        title: 'Success',
        description: 'Template created successfully',
        type: 'success'
      });

      return data;
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err instanceof Error ? err.message : 'Failed to create template');
      showToast({
        title: 'Error',
        description: 'Failed to create template',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // Update template
  const updateTemplate = useCallback(async (id: string, updates: Partial<DocumentTemplate>) => {
    try {
      setSaving(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('document_templates')
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

      setTemplates(prev => 
        prev.map(template => template.id === id ? data : template)
      );

      showToast({
        title: 'Success',
        description: 'Template updated successfully',
        type: 'success'
      });

      return data;
    } catch (err) {
      console.error('Error updating template:', err);
      setError(err instanceof Error ? err.message : 'Failed to update template');
      showToast({
        title: 'Error',
        description: 'Failed to update template',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // Delete template
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setSaving(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setTemplates(prev => prev.filter(template => template.id !== id));

      showToast({
        title: 'Success',
        description: 'Template deleted successfully',
        type: 'success'
      });
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      showToast({
        title: 'Error',
        description: 'Failed to delete template',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // Get templates by type
  const getTemplatesByType = useCallback((type: DocumentTemplate['type']) => {
    return templates.filter(template => template.type === type);
  }, [templates]);

  // Get default templates
  const getDefaultTemplates = useCallback(() => {
    return templates.filter(template => template.is_default);
  }, [templates]);

  // Get user templates
  const getUserTemplates = useCallback(() => {
    return templates.filter(template => template.user_id !== null);
  }, [templates]);

  // Get system templates
  const getSystemTemplates = useCallback(() => {
    return templates.filter(template => template.user_id === null);
  }, [templates]);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    saving,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByType,
    getDefaultTemplates,
    getUserTemplates,
    getSystemTemplates
  };
}; 