export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  assigned_to?: string;
  last_contacted_at?: Date;
  contact_count: number;
  deal_count: number;
  total_deal_value?: number;
  status: 'active' | 'inactive' | 'lead' | 'customer';
  enrichment_status?: 'none' | 'pending' | 'completed' | 'failed';
  enriched_at?: Date;
  enrichment_data?: any;
}

export interface CompanyFormData {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  tags: string[];
  assigned_to?: string;
  status: 'active' | 'inactive' | 'lead' | 'customer';
}

export interface CompanyFilter {
  search?: string;
  status?: string;
  industry?: string;
  size?: string;
  assigned_to?: string;
  tags?: string[];
}