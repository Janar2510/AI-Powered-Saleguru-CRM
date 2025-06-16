export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  type: 'call' | 'meeting' | 'email' | 'follow-up' | 'task' | 'reminder';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  contact_id?: string;
  deal_id?: string;
  completed: boolean; // Kept for backward compatibility
  completed_at?: string;
  completed_by?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Joined data
  contact_name?: string;
  deal_title?: string;
  assignee_name?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  due_time: string;
  type: 'call' | 'meeting' | 'email' | 'follow-up' | 'task' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string;
  contact_id?: string;
  deal_id?: string;
  tags: string[];
}

export interface TaskFilter {
  status?: string;
  type?: string;
  priority?: string;
  timeframe?: 'all' | 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'overdue';
  assigned_to?: string;
  deal_id?: string;
  contact_id?: string;
}