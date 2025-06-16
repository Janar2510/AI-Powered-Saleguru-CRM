import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Bot, Filter, AlertTriangle } from 'lucide-react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import CalendarGrid from '../components/calendar/CalendarGrid';
import CalendarSidebar from '../components/calendar/CalendarSidebar';
import CreateEventModal from '../components/calendar/CreateEventModal';
import EventDetailsModal from '../components/calendar/EventDetailsModal';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { useCalendar } from '../hooks/useCalendar';
import { useTasks } from '../hooks/useTasks';
import { CalendarEvent, CalendarEventFormData, CalendarViewDate } from '../types/calendar';
import { Task, TaskFormData } from '../types/task';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';

const Calendar: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  
  // Initialize calendar hook
  const { 
    events, 
    isLoading: isLoadingEvents, 
    error: eventsError, 
    filter, 
    setFilter,
    viewDate,
    changeView,
    createEvent,
    updateEvent,
    deleteEvent,
    getTaskEvents
  } = useCalendar();
  
  // Initialize tasks hook for upcoming tasks
  const { 
    tasks: upcomingTasks, 
    isLoading: isLoadingTasks,
    completeTask
  } = useTasks({ 
    status: 'pending', 
    timeframe: 'this-week' 
  });

  const handleCreateEvent = (date?: Date) => {
    setInitialDate(date);
    setShowCreateEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleEventCreated = async (eventData: CalendarEventFormData) => {
    try {
      // Format the data for Supabase
      const startDateTime = new Date(`${eventData.start_date}T${eventData.start_time}`);
      const endDateTime = new Date(`${eventData.end_date}T${eventData.end_time}`);
      
      // Convert attendee IDs to attendee objects
      const attendees = eventData.attendees.map(id => {
        // In a real app, this would fetch user details from a users service
        const name = id === 'current-user' ? 'Janar Kuusk' : 
                    id === 'sarah-wilson' ? 'Sarah Wilson' :
                    id === 'mike-chen' ? 'Mike Chen' : 'Lisa Park';
                    
        const email = id === 'current-user' ? 'janar@example.com' : 
                     id === 'sarah-wilson' ? 'sarah@example.com' :
                     id === 'mike-chen' ? 'mike@example.com' : 'lisa@example.com';
                     
        return {
          id,
          name,
          email,
          status: 'accepted'
        };
      });
      
      const newEvent = {
        title: eventData.title,
        description: eventData.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: eventData.location,
        event_type: eventData.event_type,
        related_task_id: eventData.related_task_id,
        related_contact_id: eventData.related_contact_id,
        related_deal_id: eventData.related_deal_id,
        attendees
      };
      
      await createEvent(newEvent as any);
      
      // Refresh events to include the new one
      getTaskEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create event'
      });
    }
  };

  const handleEventEdited = async (event: CalendarEvent) => {
    try {
      await updateEvent(event.id, event);
      setSelectedEvent(null);
      setShowEventDetailsModal(false);
      
      // Refresh events
      getTaskEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update event'
      });
    }
  };

  const handleEventDeleted = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setSelectedEvent(null);
      setShowEventDetailsModal(false);
      
      // Refresh events
      getTaskEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete event'
      });
    }
  };

  const handleTaskCreated = async (taskData: TaskFormData) => {
    try {
      // In a real app, this would call the createTask function from useTasks
      // For now, just show a toast
      showToast({
        type: 'success',
        title: 'Task Created',
        message: 'Task has been created successfully'
      });
      
      setShowCreateTaskModal(false);
      
      // Refresh tasks and events
      getTaskEvents();
    } catch (error) {
      console.error('Error creating task:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create task'
      });
    }
  };

  const handleDateChange = (newDate: CalendarViewDate) => {
    changeView(newDate);
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setView(newView);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // In a real app, this would navigate to the task details or open a modal
    showToast({
      type: 'info',
      title: 'Task Selected',
      message: `Viewing details for "${task.title}"`
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
      
      // Refresh events to update task events
      getTaskEvents();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Calendar</h1>
            <p className="text-secondary-400 mt-1">Manage your schedule and appointments</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={openGuru}
              className="btn-secondary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
            <button 
              onClick={() => handleCreateEvent()}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CalendarSidebar
              filter={filter}
              onFilterChange={(newFilter) => setFilter({ ...filter, ...newFilter })}
              onCreateEvent={() => handleCreateEvent()}
              onCreateTask={() => setShowCreateTaskModal(true)}
              upcomingTasks={upcomingTasks}
              onTaskClick={handleTaskClick}
              onCompleteTask={handleCompleteTask}
            />
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            {isLoadingEvents ? (
              <Card className="bg-white/10 backdrop-blur-md">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-secondary-400">Loading calendar...</p>
                  </div>
                </div>
              </Card>
            ) : eventsError ? (
              <Card className="bg-red-900/20 border border-red-600/30 text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Error Loading Calendar</h3>
                <p className="text-red-300">{eventsError}</p>
              </Card>
            ) : (
              <CalendarGrid
                events={events}
                viewDate={viewDate}
                onDateChange={handleDateChange}
                onEventClick={handleEventClick}
                onCreateEvent={handleCreateEvent}
                view={view}
                onViewChange={handleViewChange}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        <CreateEventModal
          isOpen={showCreateEventModal}
          onClose={() => setShowCreateEventModal(false)}
          onEventCreated={handleEventCreated}
          initialDate={initialDate}
        />

        {selectedEvent && (
          <EventDetailsModal
            isOpen={showEventDetailsModal}
            onClose={() => {
              setShowEventDetailsModal(false);
              setSelectedEvent(null);
            }}
            event={selectedEvent}
            onEdit={handleEventEdited}
            onDelete={handleEventDeleted}
          />
        )}

        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      </div>
    </Container>
  );
};

export default Calendar;