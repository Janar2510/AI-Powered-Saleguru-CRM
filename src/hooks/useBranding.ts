import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface BrandSettings {
  user_id: string;
  logo_url: string;
  primary_color: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  template_style: 'classic' | 'modern' | 'minimal';
  created_at: string;
  updated_at: string;
}

export interface UpdateBrandData {
  logo_url?: string;
  primary_color?: string;
  company_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  template_style?: 'classic' | 'modern' | 'minimal';
}

export const useBranding = () => {
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastContext();

  // Load brand settings
  const loadBrandSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        setBrandSettings(data);
      } else {
        // Create default brand settings if none exist
        const defaultSettings: BrandSettings = {
          user_id: user.id,
          logo_url: '',
          primary_color: '#a259ff',
          company_name: 'SaleToru CRM',
          address: '',
          phone: '',
          email: '',
          website: '',
          template_style: 'classic',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newData, error: createError } = await supabase
          .from('branding')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setBrandSettings(newData);
      }
    } catch (err) {
      console.error('Error loading brand settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load brand settings');
      showToast({
        title: 'Error',
        description: 'Failed to load brand settings',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Update brand settings
  const updateBrandSettings = useCallback(async (updates: UpdateBrandData) => {
    try {
      setSaving(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('branding')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setBrandSettings(data);

      showToast({
        title: 'Success',
        description: 'Brand settings updated successfully',
        type: 'success'
      });

      return data;
    } catch (err) {
      console.error('Error updating brand settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update brand settings');
      showToast({
        title: 'Error',
        description: 'Failed to update brand settings',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // Upload logo
  const uploadLogo = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Upload to Supabase Storage
      const fileName = `logos/${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('branding')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('branding')
        .getPublicUrl(fileName);

      // Update brand settings with new logo URL
      await updateBrandSettings({ logo_url: urlData.publicUrl });

      showToast({
        title: 'Success',
        description: 'Logo uploaded successfully',
        type: 'success'
      });

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
      showToast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to upload logo',
        type: 'error'
      });
      throw err;
    } finally {
      setUploading(false);
    }
  }, [updateBrandSettings, showToast]);

  // Remove logo
  const removeLogo = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      if (!brandSettings?.logo_url) {
        return;
      }

      // Extract file path from URL
      const urlParts = brandSettings.logo_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `logos/${brandSettings.user_id}/${fileName}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('branding')
        .remove([filePath]);

      if (storageError) {
        console.warn('Failed to delete logo from storage:', storageError);
      }

      // Update brand settings
      await updateBrandSettings({ logo_url: '' });

      showToast({
        title: 'Success',
        description: 'Logo removed successfully',
        type: 'success'
      });
    } catch (err) {
      console.error('Error removing logo:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove logo');
      showToast({
        title: 'Error',
        description: 'Failed to remove logo',
        type: 'error'
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [brandSettings, updateBrandSettings, showToast]);

  // Load brand settings on mount
  useEffect(() => {
    loadBrandSettings();
  }, [loadBrandSettings]);

  return {
    brandSettings,
    loading,
    saving,
    uploading,
    error,
    loadBrandSettings,
    updateBrandSettings,
    uploadLogo,
    removeLogo
  };
}; 