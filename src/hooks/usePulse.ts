import { useState, useEffect, useCallback } from 'react';
import { PulseService, PulseMetric, PulseActivity, PulseFilter } from '../services/pulseService';
import { useToastContext } from '../contexts/ToastContext';

export const usePulse = () => {
  const { showToast } = useToastContext();
  const [metrics, setMetrics] = useState<PulseMetric[]>([]);
  const [activities, setActivities] = useState<PulseActivity[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<PulseFilter>({
    timeRange: 'week',
    activityType: 'all'
  });

  // Load pulse data
  const loadPulseData = useCallback(async () => {
    try {
      setLoading(true);
      const [metricsData, activitiesData, insightsData] = await Promise.all([
        PulseService.getPulseMetrics(filters.timeRange),
        PulseService.getPulseActivities(filters),
        PulseService.getPulseInsights(filters.timeRange)
      ]);

      setMetrics(metricsData);
      setActivities(activitiesData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading pulse data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load pulse data'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  // Refresh pulse data
  const refreshPulseData = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadPulseData();
      showToast({
        type: 'success',
        title: 'Success',
        description: 'Pulse data refreshed successfully'
      });
    } catch (error) {
      console.error('Error refreshing pulse data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to refresh pulse data'
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadPulseData, showToast]);

  // Create activity
  const createActivity = useCallback(async (activityData: Partial<PulseActivity>) => {
    try {
      const newActivity = await PulseService.createPulseActivity(activityData);
      setActivities(prev => [newActivity, ...prev]);
      showToast({
        type: 'success',
        title: 'Success',
        description: 'Activity created successfully'
      });
      return newActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create activity'
      });
      throw error;
    }
  }, [showToast]);

  // Update activity
  const updateActivity = useCallback(async (id: string, updates: Partial<PulseActivity>) => {
    try {
      const updatedActivity = await PulseService.updatePulseActivity(id, updates);
      setActivities(prev => prev.map(activity => 
        activity.id === id ? updatedActivity : activity
      ));
      showToast({
        type: 'success',
        title: 'Success',
        description: 'Activity updated successfully'
      });
      return updatedActivity;
    } catch (error) {
      console.error('Error updating activity:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update activity'
      });
      throw error;
    }
  }, [showToast]);

  // Delete activity
  const deleteActivity = useCallback(async (id: string) => {
    try {
      await PulseService.deletePulseActivity(id);
      setActivities(prev => prev.filter(activity => activity.id !== id));
      showToast({
        type: 'success',
        title: 'Success',
        description: 'Activity deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete activity'
      });
      throw error;
    }
  }, [showToast]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<PulseFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (filters.activityType && filters.activityType !== 'all') {
      if (activity.type !== filters.activityType) return false;
    }
    if (filters.status && activity.status !== filters.status) return false;
    if (filters.priority && activity.priority !== filters.priority) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!activity.title.toLowerCase().includes(searchLower) && 
          !activity.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  // Load data on mount and when filters change
  useEffect(() => {
    loadPulseData();
  }, [loadPulseData]);

  return {
    // State
    metrics,
    activities: filteredActivities,
    insights,
    loading,
    refreshing,
    filters,
    
    // Actions
    loadPulseData,
    refreshPulseData,
    createActivity,
    updateActivity,
    deleteActivity,
    updateFilters,
    
    // Computed
    totalActivities: activities.length,
    completedActivities: activities.filter(a => a.status === 'completed').length,
    pendingActivities: activities.filter(a => a.status === 'pending').length,
    overdueActivities: activities.filter(a => a.status === 'overdue').length,
  };
}; 