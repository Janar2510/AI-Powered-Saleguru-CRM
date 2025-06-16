import { useState, useEffect, useCallback } from 'react';
import { getEnrichmentStatus, EnrichmentStatus } from '../services/enrichmentService';

interface UseEnrichmentStatusProps {
  type: 'contact' | 'company';
  id: string;
  pollInterval?: number; // in milliseconds
  autoRefresh?: boolean;
}

interface UseEnrichmentStatusResult {
  status: EnrichmentStatus;
  lastUpdated?: Date;
  isLoading: boolean;
  error: Error | null;
  refreshStatus: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useEnrichmentStatus = ({
  type,
  id,
  pollInterval = 5000, // Default to 5 seconds
  autoRefresh = false
}: UseEnrichmentStatusProps): UseEnrichmentStatusResult => {
  const [status, setStatus] = useState<EnrichmentStatus>('none');
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(autoRefresh);
  const [pollingIntervalId, setPollingIntervalId] = useState<number | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getEnrichmentStatus(type, id);
      setStatus(result.status);
      setLastUpdated(result.lastUpdated);
    } catch (err) {
      console.error(`Error fetching ${type} enrichment status:`, err);
      setError(err instanceof Error ? err : new Error('Failed to fetch enrichment status'));
    } finally {
      setIsLoading(false);
    }
  }, [type, id]);

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchStatus();
    }
  }, [id, fetchStatus]);

  // Set up polling if enabled
  useEffect(() => {
    if (isPolling && id) {
      const intervalId = window.setInterval(() => {
        // Only continue polling if status is pending
        if (status === 'pending') {
          fetchStatus();
        } else if (pollingIntervalId) {
          // Stop polling if status is no longer pending
          clearInterval(pollingIntervalId);
          setPollingIntervalId(null);
          setIsPolling(false);
        }
      }, pollInterval);
      
      setPollingIntervalId(intervalId);
      
      return () => {
        clearInterval(intervalId);
        setPollingIntervalId(null);
      };
    }
  }, [isPolling, id, status, fetchStatus, pollInterval, pollingIntervalId]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
  }, [pollingIntervalId]);

  return {
    status,
    lastUpdated,
    isLoading,
    error,
    refreshStatus: fetchStatus,
    startPolling,
    stopPolling
  };
};