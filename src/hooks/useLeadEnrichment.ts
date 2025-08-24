import { useState } from 'react';
import { supabase } from '../services/supabase';

interface LeadInfo {
  name?: string;
  email?: string;
  company?: string;
  linkedinUrl?: string;
}

interface EnrichedData {
  fullName: string;
  jobTitle: string;
  linkedinUrl: string;
  companyName: string;
  location: string;
  workEmail: string;
  phoneNumber: string;
}

/**
 * Custom hook to enrich lead/contact details using AI.
 */
export function useLeadEnrichment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrichLead = async (leadInfo: LeadInfo): Promise<EnrichedData | null> => {
    setError(null);
    setLoading(true);
    
    try {
      // Invoke the Supabase Edge Function with lead info
      const { data, error: funcError } = await supabase.functions.invoke('lead-enrichment', {
        body: leadInfo,
      });
      
      if (funcError) {
        throw funcError;
      }
      
      if (data.error) {
        // The function returned an error (e.g. missing info or format issue)
        throw new Error(data.error);
      }
      
      // Return the enriched data object on success
      return data as EnrichedData;
    } catch (err: any) {
      console.error('Lead enrichment failed:', err);
      setError(err.message ?? 'Enrichment failed. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { 
    enrichLead, 
    loading, 
    error,
    clearError 
  };
}
