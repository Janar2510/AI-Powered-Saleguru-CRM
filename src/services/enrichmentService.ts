import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// Types for enrichment data
export interface ContactEnrichmentData {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  linkedin_url?: string;
  twitter_url?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  education?: {
    institution: string;
    degree: string;
    years: string;
  }[];
  experience?: {
    company: string;
    title: string;
    years: string;
  }[];
  source?: string;
}

export interface CompanyEnrichmentData {
  name?: string;
  website?: string;
  description?: string;
  industry?: string;
  size?: string;
  founded?: string;
  location?: string;
  linkedin_url?: string;
  twitter_url?: string;
  employees?: number;
  revenue?: string;
  technologies?: string[];
  competitors?: string[];
  source?: string;
}

export type EnrichmentStatus = 'none' | 'pending' | 'completed' | 'failed';

export interface EnrichmentError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Enriches contact data using the enrich-lead Supabase Edge Function
 * @param contactId The ID of the contact to enrich
 * @param email The email of the contact (required for enrichment)
 * @returns Promise with enrichment result
 */
export const enrichContactData = async (
  contactId: string,
  email: string
): Promise<{ success: boolean; data?: ContactEnrichmentData; error?: EnrichmentError }> => {
  try {
    if (!email) {
      return {
        success: false,
        error: {
          code: 'missing_email',
          message: 'Email is required for contact enrichment'
        }
      };
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('enrich-lead', {
      body: {
        leadId: contactId,
        email,
        type: 'contact'
      }
    });

    if (error) {
      console.error('Error calling enrich-lead function:', error);
      return {
        success: false,
        error: {
          code: 'api_error',
          message: 'Failed to call enrichment service',
          details: error
        }
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: {
          code: data.error?.code || 'enrichment_failed',
          message: data.error?.message || 'Failed to enrich contact data',
          details: data.error?.details
        }
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error during contact enrichment:', error);
    
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: 'An unexpected error occurred during enrichment',
        details: error
      }
    };
  }
};

/**
 * Enriches company data using the enrich-lead Supabase Edge Function
 * @param companyId The ID of the company to enrich
 * @param domain The website domain of the company (required for enrichment)
 * @returns Promise with enrichment result
 */
export const enrichCompanyData = async (
  companyId: string,
  domain: string
): Promise<{ success: boolean; data?: CompanyEnrichmentData; error?: EnrichmentError }> => {
  try {
    if (!domain) {
      return {
        success: false,
        error: {
          code: 'missing_domain',
          message: 'Website domain is required for company enrichment'
        }
      };
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('enrich-lead', {
      body: {
        leadId: companyId,
        domain,
        type: 'company'
      }
    });

    if (error) {
      console.error('Error calling enrich-lead function:', error);
      return {
        success: false,
        error: {
          code: 'api_error',
          message: 'Failed to call enrichment service',
          details: error
        }
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: {
          code: data.error?.code || 'enrichment_failed',
          message: data.error?.message || 'Failed to enrich company data',
          details: data.error?.details
        }
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error during company enrichment:', error);
    
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: 'An unexpected error occurred during enrichment',
        details: error
      }
    };
  }
};

/**
 * Gets the current enrichment status for a contact or company
 * @param type The type of entity ('contact' or 'company')
 * @param id The ID of the entity
 * @returns Promise with enrichment status
 */
export const getEnrichmentStatus = async (
  type: 'contact' | 'company',
  id: string
): Promise<{ status: EnrichmentStatus; lastUpdated?: Date }> => {
  try {
    const { data, error } = await supabase
      .from('enrichment_status')
      .select('status, updated_at')
      .eq('entity_type', type)
      .eq('entity_id', id)
      .single();

    if (error || !data) {
      return { status: 'none' };
    }

    return {
      status: data.status as EnrichmentStatus,
      lastUpdated: data.updated_at ? new Date(data.updated_at) : undefined
    };
  } catch (error) {
    console.error('Error fetching enrichment status:', error);
    return { status: 'none' };
  }
};

/**
 * Gets the enriched data for a contact or company
 * @param type The type of entity ('contact' or 'company')
 * @param id The ID of the entity
 * @returns Promise with enriched data
 */
export const getEnrichmentData = async (
  type: 'contact' | 'company',
  id: string
): Promise<ContactEnrichmentData | CompanyEnrichmentData | null> => {
  try {
    const { data, error } = await supabase
      .from('enrichment_data')
      .select('data')
      .eq('entity_type', type)
      .eq('entity_id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching enrichment data:', error);
    return null;
  }
};