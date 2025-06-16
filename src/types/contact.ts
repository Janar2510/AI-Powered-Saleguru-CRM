export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  tags: string[];
  avatar_url?: string;
  website?: string;
  linkedin_url?: string;
  twitter_url?: string;
  industry?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  assigned_to?: string;
  last_contacted_at?: Date;
  lead_score?: number;
  status: 'active' | 'inactive' | 'lead' | 'customer';
  enrichment_status?: 'none' | 'pending' | 'completed' | 'failed';
  enriched_at?: Date;
  enrichment_data?: any;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  tags: string[];
  website?: string;
  linkedin_url?: string;
  twitter_url?: string;
  industry?: string;
  assigned_to?: string;
  status: 'active' | 'inactive' | 'lead' | 'customer';
}

export interface ContactFilter {
  search?: string;
  status?: string;
  company?: string;
  assigned_to?: string;
  tags?: string[];
  industry?: string;
}