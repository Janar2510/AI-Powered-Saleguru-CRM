import { useState, useCallback } from 'react';
import { 
  enrichCompanyData, 
  getEnrichmentStatus, 
  getEnrichmentData,
  EnrichmentStatus,
  CompanyEnrichmentData,
  EnrichmentError
} from '../services/enrichmentService';
import { useToastContext } from '../contexts/ToastContext';

interface UseCompanyEnrichmentProps {
  companyId: string;
  website: string;
  onSuccess?: (data: CompanyEnrichmentData) => void;
  onError?: (error: EnrichmentError) => void;
}

interface UseCompanyEnrichmentResult {
  enrichCompany: () => Promise<void>;
  isEnriching: boolean;
  enrichmentStatus: EnrichmentStatus;
  enrichmentData: CompanyEnrichmentData | null;
  lastUpdated?: Date;
  error: EnrichmentError | null;
  refreshStatus: () => Promise<void>;
}

export const useCompanyEnrichment = ({
  companyId,
  website,
  onSuccess,
  onError
}: UseCompanyEnrichmentProps): UseCompanyEnrichmentResult => {
  const { showToast } = useToastContext();
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentStatus, setEnrichmentStatus] = useState<EnrichmentStatus>('none');
  const [enrichmentData, setEnrichmentData] = useState<CompanyEnrichmentData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<EnrichmentError | null>(null);

  // Fetch current enrichment status
  const refreshStatus = useCallback(async () => {
    try {
      const { status, lastUpdated: updatedAt } = await getEnrichmentStatus('company', companyId);
      setEnrichmentStatus(status);
      setLastUpdated(updatedAt);

      if (status === 'completed') {
        const data = await getEnrichmentData('company', companyId) as CompanyEnrichmentData;
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
  }, [companyId]);

  // Extract domain from website URL
  const extractDomain = (url: string): string => {
    if (!url) return '';
    
    // Remove protocol and www
    let domain = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    
    // Remove path and query parameters
    domain = domain.split('/')[0];
    
    return domain;
  };

  // Trigger company enrichment
  const enrichCompany = useCallback(async () => {
    if (!website) {
      setError({
        code: 'missing_website',
        message: 'Website is required for company enrichment'
      });
      
      showToast({
        title: 'Enrichment Error',
        description: 'Website is required for company enrichment',
        type: 'error'
      });
      
      if (onError) {
        onError({
          code: 'missing_website',
          message: 'Website is required for company enrichment'
        });
      }
      
      return;
    }

    const domain = extractDomain(website);
    
    if (!domain) {
      setError({
        code: 'invalid_website',
        message: 'Invalid website format'
      });
      
      showToast({
        title: 'Enrichment Error',
        description: 'Invalid website format',
        type: 'error'
      });
      
      if (onError) {
        onError({
          code: 'invalid_website',
          message: 'Invalid website format'
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
        description: 'Fetching additional data for this company from LinkedIn and web sources...',
        type: 'info'
      });

      const result = await enrichCompanyData(companyId, domain);

      if (result.success && result.data) {
        setEnrichmentData(result.data);
        setEnrichmentStatus('completed');
        setLastUpdated(new Date());
        
        showToast({
          title: 'Enrichment Complete',
          description: 'Company data has been successfully enriched from LinkedIn and web sources',
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
          description: result.error.message || 'Failed to enrich company data',
          type: 'error'
        });
        
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err) {
      console.error('Error during company enrichment:', err);
      
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
  }, [companyId, website, showToast, onSuccess, onError]);

  return {
    enrichCompany,
    isEnriching,
    enrichmentStatus,
    enrichmentData,
    lastUpdated,
    error,
    refreshStatus
  };
};