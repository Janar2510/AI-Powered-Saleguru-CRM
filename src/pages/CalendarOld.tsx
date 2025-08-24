import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  User, 
  Building2,
  Phone,
  Mail,
  Video,
  CheckCircle,
  AlertTriangle,
  Flag,
  Search,
  Eye,
  MapPin,
  Bot
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { 
  BrandBackground,
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandDropdown
} from '../contexts/BrandDesignContext';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'task' | 'meeting' | 'call' | 'email' | 'deadline' | 'follow-up';
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  related_contact_id?: string;
  related_deal_id?: string;
  related_organization_id?: string;
  location?: string;
  duration?: number;
  created_at: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Smart Calendar AI Suggestions Component
interface SmartCalendarSuggestionsProps {
  onSuggestionClick: (suggestion: any) => void;
}

const SmartCalendarSuggestions: React.FC<SmartCalendarSuggestionsProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      id: 1,
      type: 'scheduling',
      title: 'Optimal Meeting Time',
      description: 'Based on team availability, suggest 2-4 PM for client meetings',
      icon: Clock,
      priority: 'high',
      action: 'Apply Suggestion'
    },
    {
      id: 2,
      type: 'conflict',
      title: 'Schedule Conflict Detected',
      description: 'You have overlapping meetings at 3 PM today',
      icon: AlertTriangle,
      priority: 'urgent',
      action: 'Resolve Conflict'
    },
    {
      id: 3,
      type: 'optimization',
      title: 'Time Block Recommendation',
      description: 'Block 9-11 AM for deep work based on your productivity patterns',
      icon: TrendingUp,
      priority: 'medium',
      action: 'Create Time Block'
    }
  ];

  return (
    <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-[#a259ff]" />
          <h3 className="text-lg font-semibold text-white">Smart Calendar AI</h3>
          <Badge variant="success" size="sm">Active</Badge>
        </div>
        <Button variant="secondary" size="sm" icon={Settings}>
          Settings
        </Button>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id}
            className="bg-[#23233a]/30 rounded-lg p-3 border border-[#23233a]/30 hover:border-[#a259ff]/30 transition-colors cursor-pointer"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  suggestion.priority === 'urgent' ? 'bg-[#ef4444]/20' :
                  suggestion.priority === 'high' ? 'bg-[#f59e0b]/20' :
                  'bg-[#43e7ad]/20'
                }`}>
                  <suggestion.icon className={`w-4 h-4 ${
                    suggestion.priority === 'urgent' ? 'text-[#ef4444]' :
                    suggestion.priority === 'high' ? 'text-[#f59e0b]' :
                    'text-[#43e7ad]'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm">{suggestion.title}</h4>
                  <p className="text-[#b0b0d0] text-xs mt-1">{suggestion.description}</p>
                </div>
              </div>
              <Button 
                variant="gradient" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSuggestionClick(suggestion);
                }}
              >
                {suggestion.action}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Team Calendar Component
interface TeamCalendarProps {
  onMemberClick: (member: any) => void;
}

const TeamCalendar: React.FC<TeamCalendarProps> = ({ onMemberClick }) => {
  const teamMembers = [
    {
      id: 1,
      name: 'Janar Kuusk',
      role: 'Sales Manager',
      avatar: 'JK',
      status: 'available',
      color: '#a259ff',
      shared: true
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      role: 'Account Executive',
      avatar: 'SW',
      status: 'busy',
      color: '#43e7ad',
      shared: true
    },
    {
      id: 3,
      name: 'Mike Chen',
      role: 'Sales Development',
      avatar: 'MC',
      status: 'away',
      color: '#f59e0b',
      shared: false
    }
  ];

  return (
    <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-[#a259ff]" />
          <h3 className="text-lg font-semibold text-white">Team Calendar</h3>
          <Badge variant="primary" size="sm">{teamMembers.filter(m => m.shared).length} Shared</Badge>
        </div>
        <Button variant="secondary" size="sm" icon={UserPlus}>
          Invite
        </Button>
      </div>
      
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div 
            key={member.id}
            className="flex items-center justify-between p-3 bg-[#23233a]/30 rounded-lg border border-[#23233a]/30 hover:border-[#a259ff]/30 transition-colors cursor-pointer"
            onClick={() => onMemberClick(member)}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: member.color }}
              >
                {member.avatar}
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">{member.name}</h4>
                <p className="text-[#b0b0d0] text-xs">{member.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                member.status === 'available' ? 'bg-[#43e7ad]' :
                member.status === 'busy' ? 'bg-[#f59e0b]' :
                'bg-[#ef4444]'
              }`} />
              {member.shared ? (
                <Eye className="w-4 h-4 text-[#43e7ad]" />
              ) : (
                <EyeOff className="w-4 h-4 text-[#b0b0d0]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Calendar Statistics Component
const CalendarStats: React.FC = () => {
  const stats = [
    {
      label: 'Total Events',
      value: '24',
      icon: CalendarDays,
      color: 'text-[#a259ff]',
      bgColor: 'bg-[#a259ff]/20'
    },
    {
      label: 'This Week',
      value: '8',
      icon: Clock,
      color: 'text-[#43e7ad]',
      bgColor: 'bg-[#43e7ad]/20'
    },
    {
      label: 'Team Meetings',
      value: '12',
      icon: Users,
      color: 'text-[#f59e0b]',
      bgColor: 'bg-[#f59e0b]/20'
    },
    {
      label: 'Tasks Due',
      value: '5',
      icon: CheckSquare,
      color: 'text-[#ef4444]',
      bgColor: 'bg-[#ef4444]/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[#b0b0d0] text-xs">{stat.label}</p>
              <p className="text-white font-semibold text-lg">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

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
  const [showTeamCalendar, setShowTeamCalendar] = useState(true);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  
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
      
      showToast({
        type: 'success',
        title: 'Event Created',
        message: 'Event has been created successfully'
      });
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
      
      showToast({
        type: 'success',
        title: 'Event Updated',
        message: 'Event has been updated successfully'
      });
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
      
      showToast({
        type: 'success',
        title: 'Event Deleted',
        message: 'Event has been deleted successfully'
      });
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
      
      showToast({
        type: 'success',
        title: 'Task Completed',
        message: 'Task has been marked as completed'
      });
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleAISuggestion = (suggestion: any) => {
    showToast({
      type: 'info',
      title: 'AI Suggestion',
      message: `Processing: ${suggestion.title}`
    });
  };

  const handleTeamMemberClick = (member: any) => {
    showToast({
      type: 'info',
      title: 'Team Member',
      message: `Viewing ${member.name}'s calendar`
    });
  };

  return (
    <Container>
      {/* 3D Background */}
      <div className="fixed inset-0 -z-10">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Calendar</h1>
            <p className="text-[#b0b0d0] mt-1">AI-powered scheduling with team collaboration</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="secondary"
              icon={Bot}
              onClick={openGuru}
            >
              Ask Guru
            </Button>
            <Button 
              variant="gradient"
              icon={Plus}
              onClick={() => handleCreateEvent()}
            >
              New Event
            </Button>
          </div>
        </div>

        {/* Calendar Statistics */}
        <CalendarStats />

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* AI Suggestions */}
            {showAISuggestions && (
              <SmartCalendarSuggestions onSuggestionClick={handleAISuggestion} />
            )}

            {/* Team Calendar */}
            {showTeamCalendar && (
              <TeamCalendar onMemberClick={handleTeamMemberClick} />
            )}

            {/* Calendar Sidebar */}
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

          {/* Main Calendar Area */}
          <div className="xl:col-span-3">
            {/* Calendar Controls */}
            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      icon={ChevronLeft}
                      onClick={() => {/* Navigate previous */}}
                    />
                    <Button 
                      variant="secondary" 
                      size="sm"
                      icon={ChevronRight}
                      onClick={() => {/* Navigate next */}}
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {view === 'month' ? 'December 2024' : 
                     view === 'week' ? 'Dec 16-22, 2024' : 
                     'December 20, 2024'}
                  </h2>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-[#23233a]/50 rounded-lg p-1">
                    <Button 
                      variant={view === 'month' ? 'gradient' : 'secondary'} 
                      size="sm"
                      onClick={() => handleViewChange('month')}
                    >
                      Month
                    </Button>
                    <Button 
                      variant={view === 'week' ? 'gradient' : 'secondary'} 
                      size="sm"
                      onClick={() => handleViewChange('week')}
                    >
                      Week
                    </Button>
                    <Button 
                      variant={view === 'day' ? 'gradient' : 'secondary'} 
                      size="sm"
                      onClick={() => handleViewChange('day')}
                    >
                      Day
                    </Button>
                  </div>
                  
                  <Button variant="secondary" size="sm" icon={Share2}>
                    Share
                  </Button>
                </div>
              </div>
            </Card>

            {/* Calendar Grid */}
            {isLoadingEvents ? (
              <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <div className="flex items-center justify-center h-64">
                  <div className="w-10 h-10 border-4 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
                </div>
              </Card>
            ) : (
              <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <CalendarGrid
                  events={events}
                  viewDate={viewDate}
                  onDateChange={handleDateChange}
                  onEventClick={handleEventClick}
                  onCreateEvent={handleCreateEvent}
                  view={view}
                  onViewChange={handleViewChange}
                />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateEventModal && (
        <CreateEventModal
          onClose={() => setShowCreateEventModal(false)}
          onSave={handleEventCreated}
          initialDate={initialDate}
        />
      )}

      {showCreateTaskModal && (
        <CreateTaskModal
          onClose={() => setShowCreateTaskModal(false)}
          onSave={handleTaskCreated}
          isNew={true}
        />
      )}

      {showEventDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            setShowEventDetailsModal(false);
          }}
          onEdit={handleEventEdited}
          onDelete={handleEventDeleted}
        />
      )}
    </Container>
  );
};

export default Calendar;