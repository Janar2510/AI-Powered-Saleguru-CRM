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
}

export interface CalendarFilter {
  event_type?: string;
  timeframe?: 'day' | 'week' | 'month';
  related_to?: 'all' | 'deals' | 'contacts' | 'tasks';
}

export interface CalendarViewDate {
  year: number;
  month: number;
  day: number;
}