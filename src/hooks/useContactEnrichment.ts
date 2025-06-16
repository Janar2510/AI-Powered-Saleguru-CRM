import { useState, useCallback } from 'react';
import { 
  enrichContactData, 
  getEnrichmentStatus, 
  getEnrichmentData,
  EnrichmentStatus,
  ContactEnrichmentData,
  EnrichmentError
} from '../services/enrichmentService';
import { useToastContext } from '../contexts/ToastContext';

interface UseContactEnrichmentProps {
  contactId: string;
  email: string;
  onSuccess?: (data: ContactEnrichmentData) => void;
  onError?: (error: EnrichmentError) => void;
}

interface UseContactEnrichmentResult {
  enrichContact: () => Promise<void>;
  isEnriching: boolean;
  enrichmentStatus: EnrichmentStatus;
  enrichmentData: ContactEnrichmentData | null;
  lastUpdated?: Date;
  error: EnrichmentError | null;
  refreshStatus: () => Promise<void>;
}

export const useContactEnrichment = ({
  contactId,
  email,
  onSuccess,
  onError
}: UseContactEnrichmentProps): UseContactEnrichmentResult => {
  const { showToast } = useToastContext();
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentStatus, setEnrichmentStatus] = useState<EnrichmentStatus>('none');
  const [enrichmentData, setEnrichmentData] = useState<ContactEnrichmentData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<EnrichmentError | null>(null);

  // Fetch current enrichment status
  const refreshStatus = useCallback(async () => {
    try {
      const { status, lastUpdated: updatedAt } = await getEnrichmentStatus('contact', contactId);
      setEnrichmentStatus(status);
      setLastUpdated(updatedAt);

      if (status === 'completed') {
        const data = await getEnrichmentData('contact', contactId) as ContactEnrichmentData;
        setEnrichmentData(data);
      } else if (status === 'failed') {
        setError({
          code: 'enrichment_failed',
          message: 'Previous enrichment attempt failed'
        });
      }
    } catch (err) {
      console.error('Error fetching enrichment status:', err);
    }
  }, [contactId]);

  // Trigger contact enrichment
  const enrichContact = useCallback(async () => {
    if (!email) {
      setError({
        code: 'missing_email',
        message: 'Email is required for contact enrichment'
      });
      
      showToast({
        title: 'Enrichment Error',
        description: 'Email is required for contact enrichment',
        type: 'error'
      });
      
      if (onError) {
        onError({
          code: 'missing_email',
          message: 'Email is required for contact enrichment'
        });
      }
      
      return;
    }

    setIsEnriching(true);
    setError(null);
    setEnrichmentStatus('pending');

    try {
      showToast({
        title: 'Enrichment Started',
        description: 'Fetching additional data for this contact from LinkedIn and web sources...',
        type: 'info'
      });

      const result = await enrichContactData(contactId, email);

      if (result.success && result.data) {
        setEnrichmentData(result.data);
        setEnrichmentStatus('completed');
        setLastUpdated(new Date());
        
        showToast({
          title: 'Enrichment Complete',
          description: 'Contact data has been successfully enriched from LinkedIn and web sources',
          type: 'success'
        });
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else if (result.error) {
        setError(result.error);
        setEnrichmentStatus('failed');
        
        showToast({
          title: 'Enrichment Failed',
          description: result.error.message || 'Failed to enrich contact data',
          type: 'error'
        });
        
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err) {
      console.error('Error during contact enrichment:', err);
      
      const enrichmentError: EnrichmentError = {
        code: 'unexpected_error',
        message: 'An unexpected error occurred during enrichment',
        details: err
      };
      
      setError(enrichmentError);
      setEnrichmentStatus('failed');
      
      showToast({
        title: 'Enrichment Error',
        description: 'An unexpected error occurred during enrichment',
        type: 'error'
      });
      
      if (onError) {
        onError(enrichmentError);
      }
    } finally {
      setIsEnriching(false);
    }
  }, [contactId, email, showToast, onSuccess, onError]);

  return {
    enrichContact,
    isEnriching,
    enrichmentStatus,
    enrichmentData,
    lastUpdated,
    error,
    refreshStatus
  };
};