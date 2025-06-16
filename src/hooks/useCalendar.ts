import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CalendarEvent, CalendarEventFormData, CalendarFilter, CalendarViewDate } from '../types/calendar';
import { useToastContext } from '../contexts/ToastContext';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export const useCalendar = (initialFilter?: CalendarFilter) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CalendarFilter>(initialFilter || {});
  const [viewDate, setViewDate] = useState<CalendarViewDate>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate()
    };
  });
  const { showToast } = useToastContext();

  const fetchEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range if not provided
      const start = startDate || new Date(viewDate.year, viewDate.month, 1);
      
      // For end date, if not provided, use the last day of the current month
      const end = endDate || new Date(viewDate.year, viewDate.month + 1, 0);
      
      let query = supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())
        .order('start_time', { ascending: true });
      
      // Apply event type filter
      if (filter.event_type) {
        query = query.eq('event_type', filter.event_type);
      }
      
      // Apply related_to filter
      if (filter.related_to) {
        switch (filter.related_to) {
          case 'deals':
            query = query.not('related_deal_id', 'is', null);
            break;
          case 'contacts':
            query = query.not('related_contact_id', 'is', null);
            break;
          case 'tasks':
            query = query.not('related_task_id', 'is', null);
            break;
        }
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Process and format the data
        const formattedEvents = data.map(event => ({
          ...event,
          attendees: Array.isArray(event.attendees) ? event.attendees : []
        }));
        
        setEvents(formattedEvents);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar events');
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load calendar events'
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter, viewDate, showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData: CalendarEventFormData): Promise<CalendarEvent | null> => {
    try {
      // Format the data for Supabase
      const startDateTime = new Date(`${eventData.start_date}T${eventData.start_time}`);
      const endDateTime = new Date(`${eventData.end_date}T${eventData.end_time}`);
      
      const newEvent = {
        title: eventData.title,
        description: eventData.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: eventData.location,
        event_type: eventData.event_type,
        related_task_id: eventData.related_task_id || null,
        related_contact_id: eventData.related_contact_id || null,
        related_deal_id: eventData.related_deal_id || null,
        attendees: eventData.attendees || [],
        created_by: null // In a real app, this would be the current user's ID
      };
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(newEvent)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Add the event to the local state
        setEvents(prev => [...prev, data]);
        
        showToast({
          type: 'success',
          title: 'Event Created',
          message: 'Calendar event has been created successfully'
        });
        
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error creating calendar event:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create calendar event'
      });
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Process the returned data with proper formatting
        const formattedEvent = {
          ...data,
          attendees: Array.isArray(data.attendees) ? data.attendees : []
        };
        
        // Update the event in the local state
        setEvents(prev => prev.map(event => 
          event.id === eventId ? { ...event, ...formattedEvent } : event
        ));
        
        showToast({
          type: 'success',
          title: 'Event Updated',
          message: 'Calendar event has been updated successfully'
        });
        
        return formattedEvent;
      }
      
      return null;
    } catch (err) {
      console.error('Error updating calendar event:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update calendar event'
      });
      return null;
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      // Remove the event from the local state
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      showToast({
        type: 'success',
        title: 'Event Deleted',
        message: 'Calendar event has been deleted successfully'
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting calendar event:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete calendar event'
      });
      return false;
    }
  };

  const changeView = (newViewDate: Partial<CalendarViewDate>) => {
    setViewDate(prev => ({
      ...prev,
      ...newViewDate
    }));
  };

  const getTaskEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get tasks with due dates that should appear on the calendar
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .gte('due_date', new Date(viewDate.year, viewDate.month, 1).toISOString().split('T')[0])
        .lte('due_date', new Date(viewDate.year, viewDate.month + 1, 0).toISOString().split('T')[0])
        .order('due_date', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Convert tasks to calendar event format
        const taskEvents: CalendarEvent[] = data.map(task => {
          const taskDate = new Date(task.due_date);
          const taskTime = task.due_time ? task.due_time : '09:00:00';
          const [hours, minutes] = taskTime.split(':').map(Number);
          
          taskDate.setHours(hours, minutes, 0, 0);
          
          // End time is 30 minutes after start for task events
          const endDate = new Date(taskDate);
          endDate.setMinutes(endDate.getMinutes() + 30);
          
          return {
            id: `task-${task.id}`,
            title: task.title,
            description: task.description || '',
            start_time: taskDate.toISOString(),
            end_time: endDate.toISOString(),
            event_type: task.type as any,
            related_task_id: task.id,
            related_contact_id: task.contact_id,
            related_deal_id: task.deal_id,
            attendees: [],
            created_at: task.created_at,
            updated_at: task.updated_at,
            created_by: task.created_by,
            task_title: task.title
          };
        });
        
        // Merge task events with regular events
        setEvents(prev => {
          // Filter out any existing task events
          const regularEvents = prev.filter(event => !event.id.startsWith('task-'));
          return [...regularEvents, ...taskEvents];
        });
      }
    } catch (err) {
      console.error('Error fetching task events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch task events');
    } finally {
      setIsLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    getTaskEvents();
  }, [getTaskEvents]);

  return {
    events,
    isLoading,
    error,
    filter,
    setFilter,
    viewDate,
    changeView,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getTaskEvents
  };
};