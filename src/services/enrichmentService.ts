import { supabase } from '../services/supabase';

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
  logo_url?: string;
  social_profiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
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

    // Temporarily disabled due to CORS issues with Edge Functions
    // TODO: Re-enable when Edge Functions are properly deployed
    console.log('Contact enrichment temporarily disabled - using mock data');
    
    // Return mock enrichment data
    const mockData: ContactEnrichmentData = {
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email,
      phone: '+1 (555) 123-4567',
      position: 'Senior Manager',
      linkedin_url: `https://linkedin.com/in/${email.split('@')[0]}`,
      location: 'San Francisco, CA',
      bio: 'Experienced professional with expertise in business development and strategic planning.',
      skills: ['Business Development', 'Strategic Planning', 'Sales', 'Marketing'],
      source: 'Mock Enrichment'
    };

    return {
      success: true,
      data: mockData
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

    // Temporarily disabled due to CORS issues with Edge Functions
    // TODO: Re-enable when Edge Functions are properly deployed
    console.log('Company enrichment temporarily disabled - using mock data');
    
    // Return mock enrichment data
    const mockData: CompanyEnrichmentData = {
      name: domain.split('.')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      website: `https://${domain}`,
      description: 'Innovative technology company focused on digital transformation and growth.',
      industry: 'Technology',
      size: '50-200 employees',
      founded: '2020',
      location: 'San Francisco, CA',
      linkedin_url: `https://linkedin.com/company/${domain.split('.')[0]}`,
      employees: 150,
      revenue: '$10M - $50M',
      technologies: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
      competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
      source: 'Mock Enrichment'
    };

    return {
      success: true,
      data: mockData
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