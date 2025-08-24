import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface DealData {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expected_close_date: string;
  contact_id: string;
  organization_id: string;
  owner_id: string;
  description?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  contact?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    title?: string;
    avatar_url?: string;
  };
  organization?: {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    size?: string;
    logo_url?: string;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface DealActivity {
  id: string;
  deal_id: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'task' | 'stage_change' | 'value_change' | 'file_upload';
  title: string;
  description: string;
  metadata?: any;
  created_at: string;
  created_by: string;
  created_by_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  is_pinned?: boolean;
}

export interface DealFile {
  id: string;
  deal_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  uploaded_by: string;
  uploaded_by_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface DealChangelogEntry {
  id: string;
  deal_id: string;
  field_name: string;
  old_value: any;
  new_value: any;
  changed_at: string;
  changed_by: string;
  changed_by_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export const useDealData = (dealId?: string) => {
  const [deal, setDeal] = useState<DealData | null>(null);
  const [activities, setActivities] = useState<DealActivity[]>([]);
  const [files, setFiles] = useState<DealFile[]>([]);
  const [changelog, setChangelog] = useState<DealChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastContext();

  // Load deal with all related data
  const loadDeal = useCallback(async () => {
    if (!dealId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Load main deal data with joins
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone, title),
          organization:companies(id, name, website, industry, size),
          owner:users(id, name, email)
        `)
        .eq('id', dealId)
        .single();

      if (dealError) throw dealError;
      if (!dealData) throw new Error('Deal not found');

      setDeal(dealData);

      // Load activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('deal_activities')
        .select(`
          *,
          created_by_user:users(id, name)
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Load files
      const { data: filesData, error: filesError } = await supabase
        .from('deal_files')
        .select(`
          *,
          uploaded_by_user:users(id, name)
        `)
        .eq('deal_id', dealId)
        .order('uploaded_at', { ascending: false });

      if (filesError) throw filesError;
      setFiles(filesData || []);

      // Load changelog
      const { data: changelogData, error: changelogError } = await supabase
        .from('deal_changelog')
        .select(`
          *,
          changed_by_user:users(id, name)
        `)
        .eq('deal_id', dealId)
        .order('changed_at', { ascending: false })
        .limit(50);

      if (changelogError) throw changelogError;
      setChangelog(changelogData || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load deal data';
      setError(errorMessage);
      showToast('Error loading deal', 'error');
      console.error('Error loading deal:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dealId, showToast]);

  // Update deal and track changes
  const updateDeal = async (updates: Partial<DealData>) => {
    if (!deal) return null;

    try {
      // Create changelog entries for changed fields
      const changelogEntries = Object.entries(updates)
        .filter(([key, value]) => (deal as any)[key] !== value)
        .map(([field_name, new_value]) => ({
          deal_id: deal.id,
          field_name,
          old_value: (deal as any)[field_name],
          new_value,
          changed_by: 'current-user-id', // TODO: Get from auth context
        }));

      // Update the deal
      const { data: updatedDeal, error: updateError } = await supabase
        .from('deals')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deal.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Insert changelog entries
      if (changelogEntries.length > 0) {
        const { error: changelogError } = await supabase
          .from('deal_changelog')
          .insert(changelogEntries);

        if (changelogError) {
          console.error('Error creating changelog:', changelogError);
        }
      }

      setDeal(prev => prev ? { ...prev, ...updatedDeal } : null);
      showToast('Deal updated successfully', 'success');
      
      // Reload to get fresh changelog
      await loadDeal();
      
      return updatedDeal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update deal';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Add activity and refresh
  const addActivity = async (activity: Omit<DealActivity, 'id' | 'deal_id' | 'created_at' | 'created_by'>) => {
    if (!dealId) return null;

    try {
      const { data, error } = await supabase
        .from('deal_activities')
        .insert({
          ...activity,
          deal_id: dealId,
          created_by: 'current-user-id', // TODO: Get from auth context
        })
        .select(`
          *,
          created_by_user:profiles(id, name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setActivities(prev => [data, ...prev]);
      showToast('Activity added successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add activity';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  // Pin/unpin activity
  const togglePinActivity = async (activityId: string) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      const { error } = await supabase
        .from('deal_activities')
        .update({ is_pinned: !activity.is_pinned })
        .eq('id', activityId);

      if (error) throw error;

      setActivities(prev => 
        prev.map(a => 
          a.id === activityId 
            ? { ...a, is_pinned: !a.is_pinned }
            : a
        )
      );

      showToast(
        activity.is_pinned ? 'Activity unpinned' : 'Activity pinned',
        'success'
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle pin';
      showToast(errorMessage, 'error');
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!dealId) return;

    const dealSubscription = supabase
      .channel(`deal_${dealId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'deals', filter: `id=eq.${dealId}` },
        () => loadDeal()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'deal_activities', filter: `deal_id=eq.${dealId}` },
        () => loadDeal()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'deal_files', filter: `deal_id=eq.${dealId}` },
        () => loadDeal()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dealSubscription);
    };
  }, [dealId, loadDeal]);

  // Initial load
  useEffect(() => {
    loadDeal();
  }, [loadDeal]);

  return {
    // Data
    deal,
    activities,
    files,
    changelog,
    
    // State
    isLoading,
    error,
    
    // Actions
    updateDeal,
    addActivity,
    togglePinActivity,
    refetch: loadDeal,
    
    // Computed
    pinnedActivities: activities.filter(a => a.is_pinned),
    recentActivities: activities.slice(0, 10),
    changesSummary: changelog.slice(0, 20),
  };
};
