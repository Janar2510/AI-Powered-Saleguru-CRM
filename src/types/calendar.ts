export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  event_type: 'meeting' | 'call' | 'demo' | 'task' | 'follow-up' | 'internal' | 'other';
  related_task_id?: string;
  related_contact_id?: string;
  related_deal_id?: string;
  attendees: Attendee[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Smart Calendar Features
  color?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  reminder_minutes?: number;
  is_all_day?: boolean;
  is_private?: boolean;
  shared_with?: string[];
  ai_suggested?: boolean;
  conflict_resolved?: boolean;
  
  // Joined data
  contact_name?: string;
  deal_title?: string;
  task_title?: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  response_time?: string;
  notes?: string;
}

export interface CalendarEventFormData {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location: string;
  event_type: 'meeting' | 'call' | 'demo' | 'task' | 'follow-up' | 'internal' | 'other';
  related_task_id?: string;
  related_contact_id?: string;
  related_deal_id?: string;
  attendees: string[];
  
  // Smart Calendar Features
  color?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  reminder_minutes?: number;
  is_all_day?: boolean;
  is_private?: boolean;
  shared_with?: string[];
}

export interface CalendarFilter {
  event_type?: string;
  timeframe?: 'day' | 'week' | 'month';
  related_to?: 'all' | 'deals' | 'contacts' | 'tasks';
  
  // Smart Calendar Filters
  show_tasks?: boolean;
  show_team_events?: boolean;
  show_ai_suggestions?: boolean;
  color_filter?: string[];
  priority_filter?: string[];
}

export interface CalendarViewDate {
  year: number;
  month: number;
  day: number;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date?: string;
  end_after_occurrences?: number;
  days_of_week?: number[];
  day_of_month?: number;
}

export interface AISuggestion {
  id: string;
  type: 'scheduling' | 'conflict' | 'optimization' | 'reminder';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  data?: any;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  color: string;
  shared_calendar: boolean;
  permissions: 'view' | 'edit' | 'admin';
}

export interface CalendarSettings {
  show_tasks_in_calendar: boolean;
  team_calendar_sync: boolean;
  smart_notifications: boolean;
  ai_suggestions: boolean;
  default_reminder_minutes: number;
  working_hours: {
    start: string;
    end: string;
    days: number[];
  };
  timezone: string;
  default_event_duration: number;
  auto_schedule_conflicts: boolean;
}

export interface CalendarConflict {
  id: string;
  event_ids: string[];
  conflict_type: 'overlap' | 'double_booking' | 'travel_time';
  severity: 'low' | 'medium' | 'high';
  suggested_resolution?: string;
  created_at: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: 'focus' | 'meeting' | 'break' | 'travel';
  color: string;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  created_at: string;
}