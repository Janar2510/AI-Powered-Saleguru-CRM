export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  pipeline_id: string;
  probability: number;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  probability: number;
  status: 'open' | 'won' | 'lost';
  stage_id: string;
  stage?: PipelineStage;
  pipeline_id: string;
  owner_id: string;
  contact_id?: string;
  contact?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company_id?: string;
  };
  company_id?: string;
  company?: {
    id: string;
    name: string;
    website?: string;
    industry?: string;
    size?: string;
  };
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  expected_close_date?: string;
  actual_close_date?: string;
  lost_reason?: string;
  source?: string;
  activities_count: number;
  emails_count: number;
  tasks_count: number;
  notes_count: number;
  next_activity?: {
    id: string;
    title: string;
    type: string;
    due_date: string;
  };
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
  position?: number; // Added for Kanban ordering
}

export interface DealFilter {
  pipeline_id?: string;
  stage_id?: string;
  status?: string;
  owner_id?: string;
  contact_id?: string;
  company_id?: string;
  min_value?: number;
  max_value?: number;
  min_probability?: number;
  max_probability?: number;
  tags?: string[];
  priority?: string;
  source?: string;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface DealCreateData {
  title: string;
  description?: string;
  value: number;
  currency?: string;
  probability: number;
  stage_id: string;
  pipeline_id: string;
  owner_id: string;
  contact_id?: string;
  company_id?: string;
  tags?: string[];
  priority?: string;
  expected_close_date?: string;
  source?: string;
  custom_fields?: Record<string, any>;
  position?: number; // Added for Kanban ordering
}

export interface DealUpdateData extends Partial<DealCreateData> {
  id: string;
  position?: number; // Added for Kanban ordering
}

export interface DealStats {
  total_deals: number;
  total_value: number;
  avg_deal_size: number;
  conversion_rate: number;
  avg_deal_cycle: number;
  deals_by_stage: Array<{
    stage_id: string;
    stage_name: string;
    count: number;
    value: number;
  }>;
  deals_by_status: Array<{
    status: string;
    count: number;
    value: number;
  }>;
  deals_by_owner: Array<{
    owner_id: string;
    owner_name: string;
    count: number;
    value: number;
  }>;
}

export interface DealActivity {
  id: string;
  deal_id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description?: string;
  due_date?: string;
  completed_at?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface DealNote {
  id: string;
  deal_id: string;
  content: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface DealEmail {
  id: string;
  deal_id: string;
  subject: string;
  body: string;
  from_email: string;
  to_email: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}

export interface DealTask {
  id: string;
  deal_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high';
  owner_id: string;
  created_at: string;
  updated_at: string;
} 