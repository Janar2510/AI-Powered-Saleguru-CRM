export interface Bottleneck {
  id: string;
  type: 'deal' | 'task' | 'contact' | 'lead' | 'company';
  entity_id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  idle_days: number;
  created_at: string;
  updated_at: string;
}

export interface ProductivityInsight {
  id: string;
  category: 'time_management' | 'deal_progress' | 'contact_engagement' | 'task_completion';
  title: string;
  description: string;
  metric_value?: number;
  metric_unit?: string;
  metric_change?: number;
  action_url?: string;
  action_label?: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface FocusTimeSlot {
  id: string;
  start: string | number | Date;
  end: string | number | Date;
  quality_score: number;
  reason: string;
  category?: 'deep_work' | 'meetings' | 'planning' | 'creative' | 'admin';
  energy_level?: 'high' | 'medium' | 'low';
  interruptions_expected?: boolean;
  location?: 'office' | 'home' | 'coffee_shop' | 'anywhere';
  tags?: string[];
  recurring?: boolean;
  recurring_pattern?: 'daily' | 'weekly' | 'monthly';
  priority_tasks?: string[];
  estimated_completion?: number; // minutes
}

export interface FocusTimePreferences {
  preferred_duration: number;
  preferred_time_of_day: 'morning' | 'afternoon' | 'evening' | 'any';
  preferred_location: 'office' | 'home' | 'coffee_shop' | 'anywhere';
  energy_optimization: boolean;
  interruption_blocking: boolean;
  auto_scheduling: boolean;
  notification_reminders: boolean;
  break_intervals: number; // minutes
  max_focus_sessions_per_day: number;
}

export interface FocusTimeAnalytics {
  total_focus_time: number; // minutes
  average_session_length: number;
  completion_rate: number; // percentage
  productivity_score: number;
  most_productive_time: string;
  most_productive_location: string;
  interruptions_reduced: number;
  tasks_completed: number;
  weekly_trend: {
    date: string;
    focus_time: number;
    productivity_score: number;
  }[];
} 