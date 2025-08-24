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
  Bot,

  Users,
  Copy,
  Settings,
  Globe,
  Monitor
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

export default function Calendar() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);

  const [teamMembers, setTeamMembers] = useState([
    { 
      id: 'current', 
      name: 'Janar Kuusk', 
      email: 'janar@example.com', 
      color: '#a259ff', 
      shared: true, 
      permission: 'owner',
      status: 'online',
      activity: 'Available',
      lastSeen: new Date()
    },
    { 
      id: 'sarah', 
      name: 'Sarah Wilson', 
      email: 'sarah@example.com', 
      color: '#43e7ad', 
      shared: true, 
      permission: 'view',
      status: 'on_meeting',
      activity: 'In Sales Call - Q4 Planning',
      lastSeen: new Date()
    },
    { 
      id: 'mike', 
      name: 'Mike Chen', 
      email: 'mike@example.com', 
      color: '#f59e0b', 
      shared: false, 
      permission: 'none',
      status: 'busy',
      activity: 'Focus Time - Development',
      lastSeen: new Date(Date.now() - 300000) // 5 mins ago
    },
    { 
      id: 'anna', 
      name: 'Anna Rodriguez', 
      email: 'anna@example.com', 
      color: '#ef4444', 
      shared: true, 
      permission: 'view',
      status: 'on_call',
      activity: 'Customer Support Call',
      lastSeen: new Date()
    }
  ]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // New event form
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'task' as const,
    priority: 'Medium' as const,
    location: '',
    duration: 60
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(event => event.priority === priorityFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, typeFilter, statusFilter, priorityFilter]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      
      // Load tasks as calendar events
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (tasksError) {
        console.error('Error loading tasks:', tasksError);
      }

      // Transform tasks into calendar events
      const taskEvents: CalendarEvent[] = (tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        date: task.due_date || new Date().toISOString().split('T')[0],
        time: '09:00',
        type: (task.category?.toLowerCase() || 'task') as any,
        status: task.status === 'Completed' ? 'completed' : 
                task.status === 'Overdue' ? 'overdue' : 'pending',
        priority: task.priority,
        related_contact_id: task.related_contact_id,
        related_deal_id: task.related_deal_id,
        related_organization_id: task.related_organization_id,
        duration: 60,
        created_at: task.created_at
      }));

      // Add sample events if no tasks exist
      if (taskEvents.length === 0) {
        const sampleEvents = generateSampleEvents();
        setEvents(sampleEvents);
      } else {
        setEvents(taskEvents);
      }
      
    } catch (error) {
      console.error('Error loading calendar events:', error);
      showToast({ title: 'Error loading calendar events', type: 'error' });
      
      // Show sample events as fallback
      const sampleEvents = generateSampleEvents();
      setEvents(sampleEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleEvents = (): CalendarEvent[] => {
    const today = new Date();
    const events: CalendarEvent[] = [];

    // Generate events for the next 30 days
    for (let i = 0; i < 30; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      const dateStr = eventDate.toISOString().split('T')[0];

      // Add 1-3 random events per day
      const eventCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < eventCount; j++) {
        const eventTypes = ['task', 'meeting', 'call', 'email', 'deadline', 'follow-up'];
        const priorities = ['Low', 'Medium', 'High', 'Critical'];
        const statuses = ['pending', 'completed', 'overdue'];
        
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const hour = 9 + Math.floor(Math.random() * 8);
        const minute = Math.floor(Math.random() * 4) * 15;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const titles = {
          task: ['Complete project proposal', 'Review quarterly reports', 'Update website content'],
          meeting: ['Team standup', 'Client presentation', 'Strategy planning session'],
          call: ['Follow-up call with prospect', 'Customer support call', 'Sales demo call'],
          email: ['Send project update', 'Newsletter campaign', 'Customer follow-up'],
          deadline: ['Project milestone', 'Report submission', 'Contract renewal'],
          'follow-up': ['Check on proposal status', 'Schedule next meeting', 'Send additional information']
        };

        const randomTitle = titles[randomType as keyof typeof titles][Math.floor(Math.random() * titles[randomType as keyof typeof titles].length)];

        events.push({
          id: `sample-${i}-${j}`,
          title: randomTitle,
          description: `Sample ${randomType} event for demonstration`,
          date: dateStr,
          time: time,
          type: randomType as any,
          status: randomStatus as any,
          priority: randomPriority as any,
          duration: 60,
          created_at: new Date().toISOString()
        });
      }
    }

    return events;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getDaysInWeek = (date: Date) => {
    const days = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startOfWeek);
      weekDay.setDate(startOfWeek.getDate() + i);
      days.push(weekDay);
    }

    return days;
  };

  const getHoursInDay = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getWeekRange = (date: Date) => {
    const week = getDaysInWeek(date);
    const start = week[0];
    const end = week[6];
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const openCreateModal = (date?: string) => {
    if (date) {
      setNewEvent(prev => ({ ...prev, date }));
    }
    setShowCreateModal(true);
  };

  const openViewModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      showToast({ title: 'Please fill in required fields', type: 'error' });
      return;
    }

    try {
      // Create as a task in the database
      const { error } = await supabase.from('tasks').insert({
        title: newEvent.title,
        description: newEvent.description,
        due_date: newEvent.date,
        priority: newEvent.priority,
        category: newEvent.type.charAt(0).toUpperCase() + newEvent.type.slice(1),
        status: 'Open',
        org_id: (user as any)?.org_id || 'temp-org',
        assigned_to: (user as any)?.email || 'current_user',
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error creating event:', error);
        showToast({ title: 'Error creating event', type: 'error' });
        return;
      }

      showToast({ title: 'Event created successfully!', type: 'success' });
      setShowCreateModal(false);
      setNewEvent({ title: '', description: '', date: '', time: '', type: 'task', priority: 'Medium', location: '', duration: 60 });
      loadEvents();
    } catch (error) {
      showToast({ title: 'Error creating event', type: 'error' });
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      case 'meeting': return <Video className="h-3 w-3" />;
      case 'deadline': return <AlertTriangle className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-400 border-red-400';
      case 'High': return 'text-orange-400 border-orange-400';
      case 'Medium': return 'text-yellow-400 border-yellow-400';
      default: return 'text-green-400 border-green-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 border-green-500/50';
      case 'overdue': return 'bg-red-500/20 border-red-500/50';
      case 'cancelled': return 'bg-gray-500/20 border-gray-500/50';
      default: return 'bg-blue-500/20 border-blue-500/50';
    }
  };

  const navigateToRelated = (type: string, id: string) => {
    switch (type) {
      case 'contact':
        navigate(`/contacts/${id}`);
        break;
      case 'deal':
        navigate('/deals');
        break;
      case 'organization':
        navigate(`/organizations/${id}`);
        break;
      case 'task':
        navigate('/tasks');
        break;
    }
  };

  const generateAISuggestions = () => {
    const suggestions = [];
    const today = new Date();
    const todayEvents = getEventsForDate(today);
    
    // Check for conflicts
    const conflictingEvents = todayEvents.filter((event, index) => {
      return todayEvents.some((otherEvent, otherIndex) => {
        if (index === otherIndex) return false;
        const eventTime = new Date(`2024-01-01T${event.time}`);
        const otherTime = new Date(`2024-01-01T${otherEvent.time}`);
        const timeDiff = Math.abs(eventTime.getTime() - otherTime.getTime());
        return timeDiff < 3600000; // Less than 1 hour apart
      });
    });

    if (conflictingEvents.length > 0) {
      suggestions.push({
        id: 'conflict',
        type: 'warning',
        title: 'Schedule Conflict Detected',
        description: `You have ${conflictingEvents.length} overlapping events today`,
        action: 'Resolve Conflicts',
        priority: 'high'
      });
    }

    // Suggest optimal meeting times
    const busyHours = todayEvents.map(event => {
      const time = event.time || '09:00';
      return parseInt(time.split(':')[0]);
    });

    const freeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      if (!busyHours.includes(hour)) {
        freeSlots.push(hour);
      }
    }

    if (freeSlots.length > 0) {
      const optimalTime = freeSlots[Math.floor(freeSlots.length / 2)];
      suggestions.push({
        id: 'optimal-time',
        type: 'suggestion',
        title: 'Optimal Meeting Time Available',
        description: `${optimalTime}:00 - ${optimalTime + 1}:00 is free and ideal for meetings`,
        action: 'Schedule Meeting',
        priority: 'medium'
      });
    }

    // Productivity time blocking suggestion
    if (freeSlots.length >= 2) {
      suggestions.push({
        id: 'time-block',
        type: 'productivity',
        title: 'Focus Time Recommendation',
        description: 'Block 2 hours for deep work during your productive hours',
        action: 'Create Time Block',
        priority: 'low'
      });
    }

    return suggestions;
  };

  const findFreeTime = (duration: number = 60, date?: Date) => {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === dateStr);
    
    const freeSlots = [];
    const workingHours = { start: 9, end: 17 };
    
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const slotStart = `${hour.toString().padStart(2, '0')}:00`;
      const slotEnd = `${(hour + Math.ceil(duration / 60)).toString().padStart(2, '0')}:00`;
      
      const hasConflict = dayEvents.some(event => {
        if (!event.time) return false;
        const eventHour = parseInt(event.time.split(':')[0]);
        return eventHour >= hour && eventHour < hour + Math.ceil(duration / 60);
      });
      
      if (!hasConflict) {
        freeSlots.push({
          start: slotStart,
          end: slotEnd,
          duration: duration,
          date: dateStr
        });
      }
    }
    
    return freeSlots;
  };

  const shareCalendar = () => {
    showToast({ 
      title: 'Calendar Shared', 
      type: 'success'
    });
  };

  const changeView = (newView: 'month' | 'week' | 'day') => {
    setView(newView);
  };

  const getTeamStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'busy': return 'bg-red-400';
      case 'on_meeting': return 'bg-blue-400';
      case 'on_call': return 'bg-purple-400';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <div className="w-2 h-2 rounded-full bg-green-400" />;
      case 'busy': return <div className="w-2 h-2 rounded-full bg-red-400" />;
      case 'on_meeting': return <Video className="w-3 h-3 text-blue-400" />;
      case 'on_call': return <Phone className="w-3 h-3 text-purple-400" />;
      case 'away': return <div className="w-2 h-2 rounded-full bg-yellow-400" />;
      case 'offline': return <div className="w-2 h-2 rounded-full bg-gray-400" />;
      default: return <div className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Busy';
      case 'on_meeting': return 'In Meeting';
      case 'on_call': return 'On Call';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const updateMemberStatus = (memberId: string, newStatus: string) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, status: newStatus, lastSeen: new Date() }
        : member
    ));
  };

  // Calendar Integration Functions
  const connectGoogleCalendar = async () => {
    showToast({ 
      title: 'Google Calendar Integration', 
      type: 'info' 
    });
    // In real implementation, this would handle OAuth flow
  };

  const connectAppleCalendar = async () => {
    showToast({ 
      title: 'Apple Calendar Integration', 
      type: 'info' 
    });
    // In real implementation, this would handle CalDAV
  };

  const connectCalendly = async () => {
    showToast({ 
      title: 'Calendly Integration', 
      type: 'info' 
    });
    // In real implementation, this would handle Calendly API
  };

  const todayEvents = filteredEvents.filter(event => event.date === new Date().toISOString().split('T')[0]);
  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate > today;
  }).slice(0, 5);
  const overDueEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate < today && event.status !== 'completed';
  });

  if (isLoading) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a259ff] mx-auto"></div>
            <p className="mt-4 text-white/80">Loading calendar...</p>
          </div>
        </div>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Smart Calendar & Schedule"
        subtitle="AI-powered scheduling with seamless CRM integration"
        logoGradient={true}
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="blue" onClick={goToToday}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Today
            </BrandButton>
            <BrandButton variant="green" onClick={() => openCreateModal()}>
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </BrandButton>
          </div>
        }
      >
        {/* AI Insights & Suggestions Card */}
        <BrandCard variant="glass" borderGradient="purple" className="mx-5 mb-5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Smart Calendar AI</h3>
                <p className="text-white/70 text-sm">Intelligent scheduling and productivity optimization</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <BrandBadge variant="default">Active</BrandBadge>
              <BrandButton variant="purple" onClick={() => setShowAIModal(true)}>
                <Bot className="w-4 h-4 mr-1" />
                AI Assist
              </BrandButton>
            </div>
          </div>

          {/* AI Suggestions Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {generateAISuggestions().slice(0, 3).map((suggestion, _index) => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                  suggestion.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                  suggestion.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-green-500/10 border-green-500/30'
                }`}
                onClick={() => setShowAIModal(true)}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    suggestion.priority === 'high' ? 'bg-red-400' :
                    suggestion.priority === 'medium' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`} />
                  <span className="text-white text-sm font-medium">{suggestion.title}</span>
                </div>
                <p className="text-white/60 text-xs">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </BrandCard>

        {/* Stats Grid */}
        <BrandStatsGrid className="mx-5 mb-5">
          <BrandStatCard icon={<CalendarIcon className="h-6 w-6 text-white" />} title="Today's Events" value={todayEvents.length} borderGradient="blue" />
          <BrandStatCard icon={<Clock className="h-6 w-6 text-white" />} title="Upcoming" value={upcomingEvents.length} borderGradient="green" />
          <BrandStatCard icon={<AlertTriangle className="h-6 w-6 text-white" />} title="Overdue" value={overDueEvents.length} borderGradient="red" />
          <BrandStatCard icon={<CheckCircle className="h-6 w-6 text-white" />} title="Total Events" value={filteredEvents.length} borderGradient="purple" />
        </BrandStatsGrid>

        {/* Advanced Filters */}
        <BrandCard variant="glass" borderGradient="secondary" className="mx-5 mb-5 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Search Events</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <BrandInput
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Type</label>
              <BrandDropdown
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'task', label: 'Tasks' },
                  { value: 'meeting', label: 'Meetings' },
                  { value: 'call', label: 'Calls' },
                  { value: 'email', label: 'Emails' },
                  { value: 'deadline', label: 'Deadlines' },
                  { value: 'follow-up', label: 'Follow-ups' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
              <BrandDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Priority</label>
              <BrandDropdown
                value={priorityFilter}
                onChange={setPriorityFilter}
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'Critical', label: 'Critical' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' }
                ]}
              />
            </div>
          </div>
        </BrandCard>

        {/* Calendar Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mx-5">
          {/* Calendar Grid - 3 columns */}
          <div className="xl:col-span-3">
            <BrandCard variant="glass" borderGradient="primary" className="p-6">
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 text-white/80 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <h2 className="text-2xl font-bold text-white">
                    {view === 'month' ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}` :
                     view === 'week' ? getWeekRange(currentDate) :
                     currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h2>
                  
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 text-white/80 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* View Selector */}
                  <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                    <button
                      onClick={() => changeView('month')}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        view === 'month' ? 'bg-purple-500 text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => changeView('week')}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        view === 'week' ? 'bg-purple-500 text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => changeView('day')}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        view === 'day' ? 'bg-purple-500 text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Day
                    </button>
                  </div>

                  <BrandButton variant="secondary" onClick={goToToday}>
                    Today
                  </BrandButton>

                  <BrandButton variant="blue" onClick={() => setShowTeamModal(true)}>
                    <Users className="w-4 h-4 mr-1" />
                    Team
                  </BrandButton>
                </div>
              </div>

              {/* Month View */}
              {view === 'month' && (
                <>
                  {/* Days Header */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {DAYS.map(day => (
                      <div key={day} className="p-2 text-center text-white/80 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((date, index) => {
                      const isToday = date && 
                        date.toDateString() === new Date().toDateString();
                      const dayEvents = getEventsForDate(date);
                      const dateStr = date?.toISOString().split('T')[0] || '';

                      return (
                        <motion.div
                          key={index}
                          className={`min-h-[120px] p-2 border border-white/10 rounded-lg transition-all duration-200 hover:bg-white/5 ${
                            date ? 'cursor-pointer' : 'bg-black/20'
                          } ${isToday ? 'bg-purple-500/20 border-purple-500/50' : ''}`}
                          onClick={() => date && openCreateModal(dateStr)}
                          whileHover={{ scale: 1.02 }}
                        >
                          {date && (
                            <>
                              <div className={`text-sm font-medium mb-1 ${
                                isToday ? 'text-purple-300' : 'text-white/80'
                              }`}>
                                {date.getDate()}
                              </div>
                              
                              <div className="space-y-1">
                                {dayEvents.slice(0, 3).map(event => (
                                  <motion.div
                                    key={event.id}
                                    className={`p-1 rounded text-xs border-l-2 cursor-pointer ${getStatusColor(event.status)} ${getPriorityColor(event.priority)}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openViewModal(event);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <div className="flex items-center space-x-1">
                                      {getEventTypeIcon(event.type)}
                                      <span className="text-white/90 truncate flex-1">
                                        {event.title}
                                      </span>
                                    </div>
                                    {event.time && (
                                      <div className="text-white/60 text-xs mt-1">
                                        {event.time}
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                                
                                {dayEvents.length > 3 && (
                                  <div className="text-xs text-white/60 pl-1">
                                    +{dayEvents.length - 3} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Week View */}
              {view === 'week' && (
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Days Header for Week */}
                    <div className="grid grid-cols-8 gap-1 mb-4">
                      <div className="p-2"></div> {/* Time column */}
                      {getDaysInWeek(currentDate).map((date, index) => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                          <div key={index} className={`p-2 text-center border border-white/10 rounded ${
                            isToday ? 'bg-purple-500/20 border-purple-500/50' : ''
                          }`}>
                            <div className={`text-sm font-medium ${isToday ? 'text-purple-300' : 'text-white/80'}`}>
                              {DAYS[date.getDay()]}
                            </div>
                            <div className={`text-xs ${isToday ? 'text-purple-300' : 'text-white/60'}`}>
                              {date.getDate()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Time slots */}
                    <div className="space-y-1">
                      {getHoursInDay().slice(9, 18).map(hour => (
                        <div key={hour} className="grid grid-cols-8 gap-1 h-16">
                          <div className="p-2 text-xs text-white/60 border-r border-white/10">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          {getDaysInWeek(currentDate).map((date, dayIndex) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const hourEvents = getEventsForDate(date).filter(event => {
                              if (!event.time) return false;
                              const eventHour = parseInt(event.time.split(':')[0]);
                              return eventHour === hour;
                            });

                            return (
                              <div 
                                key={dayIndex} 
                                className="border border-white/10 hover:bg-white/5 cursor-pointer p-1 relative"
                                onClick={() => openCreateModal(dateStr)}
                              >
                                {hourEvents.map(event => (
                                  <div
                                    key={event.id}
                                    className={`absolute inset-1 p-1 rounded text-xs cursor-pointer ${getStatusColor(event.status)}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openViewModal(event);
                                    }}
                                  >
                                    <div className="flex items-center space-x-1">
                                      {getEventTypeIcon(event.type)}
                                      <span className="text-white/90 truncate">
                                        {event.title}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Day View */}
              {view === 'day' && (
                <div className="max-w-2xl mx-auto">
                  <div className="space-y-1">
                    {getHoursInDay().slice(6, 22).map(hour => {
                      const hourEvents = getEventsForDate(currentDate).filter(event => {
                        if (!event.time) return false;
                        const eventHour = parseInt(event.time.split(':')[0]);
                        return eventHour === hour;
                      });

                      return (
                        <div key={hour} className="flex">
                          <div className="w-20 p-3 text-sm text-white/60 border-r border-white/10">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          <div 
                            className="flex-1 min-h-[60px] border border-white/10 hover:bg-white/5 cursor-pointer p-2 relative"
                            onClick={() => {
                              const dateStr = currentDate.toISOString().split('T')[0];
                              setNewEvent(prev => ({ 
                                ...prev, 
                                date: dateStr, 
                                time: `${hour.toString().padStart(2, '0')}:00` 
                              }));
                              setShowCreateModal(true);
                            }}
                          >
                            {hourEvents.map(event => (
                              <div
                                key={event.id}
                                className={`mb-1 p-2 rounded border-l-4 cursor-pointer ${getStatusColor(event.status)}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openViewModal(event);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {getEventTypeIcon(event.type)}
                                    <span className="text-white font-medium">{event.title}</span>
                                    <Flag className={`h-3 w-3 ${getPriorityColor(event.priority).split(' ')[0]}`} />
                                  </div>
                                  <span className="text-white/60 text-xs">{event.time}</span>
                                </div>
                                {event.description && (
                                  <p className="text-white/70 text-xs mt-1">{event.description}</p>
                                )}
                              </div>
                            ))}
                            {hourEvents.length === 0 && (
                              <div className="text-white/40 text-xs">Click to add event</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </BrandCard>
          </div>

          {/* Sidebar - 1 column */}
          <div className="xl:col-span-1 space-y-5">
            {/* Quick Actions */}
            <BrandCard variant="glass" borderGradient="green" className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <BrandButton variant="green" className="w-full" onClick={() => openCreateModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </BrandButton>
                <BrandButton variant="blue" className="w-full" onClick={() => navigate('/tasks')}>
                  <Target className="w-4 h-4 mr-2" />
                  Go to Tasks
                </BrandButton>
                <BrandButton variant="purple" className="w-full" onClick={() => navigate('/contacts')}>
                  <User className="w-4 h-4 mr-2" />
                  View Contacts
                </BrandButton>
              </div>
            </BrandCard>

            {/* Upcoming Events */}
            <BrandCard variant="glass" borderGradient="secondary" className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-white/60 text-sm">No upcoming events</p>
                ) : (
                  upcomingEvents.map(event => (
                    <motion.div
                      key={event.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-white/5 ${getStatusColor(event.status)}`}
                      onClick={() => openViewModal(event)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getEventTypeIcon(event.type)}
                            <span className="font-medium text-white text-sm truncate">{event.title}</span>
                            <Flag className={`h-3 w-3 flex-shrink-0 ${getPriorityColor(event.priority).split(' ')[0]}`} />
                          </div>
                          <div className="text-xs text-white/70">
                            {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </BrandCard>

            {/* Team Calendar */}
            <BrandCard variant="glass" borderGradient="blue" className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Team Calendar</h3>
                <BrandButton variant="blue" onClick={() => setShowTeamModal(true)}>
                  <Users className="w-4 h-4" />
                </BrandButton>
              </div>
              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div 
                    key={member.id}
                    className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      member.shared ? 'border-white/20 hover:bg-white/5' : 'border-white/10 opacity-60'
                    }`}
                    onClick={() => member.shared && setSelectedTeamMember(member.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {/* Status indicator overlay */}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black/50 flex items-center justify-center ${getTeamStatusColor(member.status)}`}>
                            {member.status === 'on_meeting' || member.status === 'on_call' ? (
                              getStatusIcon(member.status)
                            ) : null}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-white text-sm font-medium truncate">{member.name}</span>
                            {member.shared && <Eye className="w-3 h-3 text-green-400 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            {getStatusIcon(member.status)}
                            <span className="text-xs text-white/80">{getStatusText(member.status)}</span>
                          </div>
                          <p className="text-xs text-white/60 truncate mt-1">{member.activity}</p>
                        </div>
                      </div>
                      
                      {/* Status change dropdown for current user */}
                      {member.id === 'current' && (
                        <BrandDropdown
                          value={member.status}
                          onChange={(value) => updateMemberStatus(member.id, value)}
                          options={[
                            { value: 'online', label: '🟢 Online' },
                            { value: 'busy', label: '🔴 Busy' },
                            { value: 'on_meeting', label: '📹 In Meeting' },
                            { value: 'on_call', label: '📞 On Call' },
                            { value: 'away', label: '🟡 Away' }
                          ]}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Free Time Suggestions */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-2">AI Free Time Suggestions</h4>
                <div className="space-y-2">
                  {findFreeTime(60).slice(0, 3).map((slot, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-white/70">{slot.start} - {slot.end}</span>
                      <BrandButton 
                        variant="green" 
                        onClick={() => {
                          setNewEvent(prev => ({ 
                            ...prev, 
                            date: slot.date, 
                            time: slot.start 
                          }));
                          setShowCreateModal(true);
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </BrandButton>
                    </div>
                  ))}
                </div>
              </div>
            </BrandCard>
          </div>
        </div>

        {/* Create Event Modal */}
        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
          <div className="p-8 max-w-3xl w-full">
            <h2 className="text-xl font-semibold mb-6 text-white">Create New Event</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <BrandInput
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                />
                
                <BrandDropdown
                  value={newEvent.type}
                  onChange={(value) => setNewEvent(prev => ({ ...prev, type: value as any }))}
                  options={[
                    { value: 'task', label: 'Task' },
                    { value: 'meeting', label: 'Meeting' },
                    { value: 'call', label: 'Call' },
                    { value: 'email', label: 'Email' },
                    { value: 'deadline', label: 'Deadline' },
                    { value: 'follow-up', label: 'Follow-up' }
                  ]}
                />
              </div>
              
              <textarea
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-white/50"
              />
              
              <div className="grid grid-cols-4 gap-4">
                <BrandInput
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                />
                
                <BrandInput
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                />
                
                <BrandDropdown
                  value={newEvent.priority}
                  onChange={(value) => setNewEvent(prev => ({ ...prev, priority: value as any }))}
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                    { value: 'Critical', label: 'Critical' }
                  ]}
                />
                
                <BrandInput
                  type="number"
                  placeholder="Duration (min)"
                  value={newEvent.duration?.toString() || '60'}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                />
              </div>
              
              <BrandInput
                placeholder="Location (optional)"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <BrandButton variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</BrandButton>
              <BrandButton onClick={createEvent}>Create Event</BrandButton>
            </div>
          </div>
        </Modal>

        {/* View Event Modal */}
        <Modal open={showViewModal} onClose={() => setShowViewModal(false)} size="lg">
          {selectedEvent && (
            <div className="p-8 max-w-4xl w-full space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                  <div className="flex items-center space-x-4">
                    <BrandBadge variant="default">{selectedEvent.status}</BrandBadge>
                    <div className={`flex items-center ${getPriorityColor(selectedEvent.priority).split(' ')[0]}`}>
                      <Flag className="w-4 h-4 mr-1" />
                      <span className="font-medium">{selectedEvent.priority}</span>
                    </div>
                    <div className="flex items-center text-white/60">
                      {getEventTypeIcon(selectedEvent.type)}
                      <span className="ml-1 capitalize">{selectedEvent.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigateToRelated('task', selectedEvent.id)}
                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Go to Task"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-white/80 bg-white/5 p-4 rounded-lg border border-white/10">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BrandCard variant="glass" borderGradient="blue" className="p-4">
                  <div className="flex items-center mb-2">
                    <CalendarIcon className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="font-medium text-white">Date & Time</span>
                  </div>
                  <p className="text-sm text-white/80">
                    {new Date(selectedEvent.date).toLocaleDateString()}
                    {selectedEvent.time && ` at ${selectedEvent.time}`}
                  </p>
                </BrandCard>

                <BrandCard variant="glass" borderGradient="green" className="p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-green-400 mr-2" />
                    <span className="font-medium text-white">Duration</span>
                  </div>
                  <p className="text-sm text-white/80">
                    {selectedEvent.duration || 60} minutes
                  </p>
                </BrandCard>

                <BrandCard variant="glass" borderGradient="purple" className="p-4">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-5 h-5 text-purple-400 mr-2" />
                    <span className="font-medium text-white">Location</span>
                  </div>
                  <p className="text-sm text-white/80">
                    {selectedEvent.location || 'No location specified'}
                  </p>
                </BrandCard>
              </div>

              {/* Related Entities */}
              {(selectedEvent.related_contact_id || selectedEvent.related_deal_id || selectedEvent.related_organization_id) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Related Items</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.related_contact_id && (
                      <BrandButton 
                        variant="blue" 
                        onClick={() => navigateToRelated('contact', selectedEvent.related_contact_id!)}
                      >
                        <User className="w-4 h-4 mr-1" />
                        View Contact
                      </BrandButton>
                    )}
                    {selectedEvent.related_deal_id && (
                      <BrandButton 
                        variant="green" 
                        onClick={() => navigateToRelated('deal', selectedEvent.related_deal_id!)}
                      >
                        <Target className="w-4 h-4 mr-1" />
                        View Deal
                      </BrandButton>
                    )}
                    {selectedEvent.related_organization_id && (
                      <BrandButton 
                        variant="purple" 
                        onClick={() => navigateToRelated('organization', selectedEvent.related_organization_id!)}
                      >
                        <Building2 className="w-4 h-4 mr-1" />
                        View Organization
                      </BrandButton>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <BrandButton variant="secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </BrandButton>
                <BrandButton 
                  variant="purple"
                  onClick={() => navigateToRelated('task', selectedEvent.id)}
                >
                  <Target className="w-4 h-4 mr-1" />
                  Edit in Tasks
                </BrandButton>
              </div>
            </div>
          )}
        </Modal>

        {/* Team Management Modal */}
        <Modal open={showTeamModal} onClose={() => setShowTeamModal(false)} size="xl">
          <div className="p-8 max-w-5xl w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Team Calendar Management</h2>
                <p className="text-white/80">Share your calendar and manage team permissions</p>
              </div>
              <BrandButton variant="green">
                <Plus className="w-4 h-4 mr-1" />
                Invite Member
              </BrandButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Members Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Team Members</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {teamMembers.map(member => (
                    <BrandCard key={member.id} variant="glass" className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                              style={{ backgroundColor: member.color }}
                            >
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            {/* Enhanced status indicator */}
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-black/50 flex items-center justify-center ${getTeamStatusColor(member.status)}`}>
                              {member.status === 'on_meeting' || member.status === 'on_call' ? (
                                <div className="scale-75">
                                  {getStatusIcon(member.status)}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white">{member.name}</h4>
                            <p className="text-white/60 text-sm">{member.email}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              {getStatusIcon(member.status)}
                              <span className="text-xs text-white/80">{getStatusText(member.status)}</span>
                            </div>
                            <p className="text-xs text-white/60 mt-1 truncate">{member.activity}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <BrandBadge variant={member.shared ? 'default' : 'secondary'}>
                                {member.permission === 'owner' ? 'Owner' : 
                                 member.permission === 'view' ? 'View Only' : 'No Access'}
                              </BrandBadge>
                              {member.shared && (
                                <BrandBadge variant="default">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Shared
                                </BrandBadge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {member.id !== 'current' && (
                          <div className="flex flex-col space-y-2">
                            <BrandDropdown
                              value={member.permission}
                              onChange={(value) => {
                                setTeamMembers(prev => prev.map(m => 
                                  m.id === member.id 
                                    ? { ...m, permission: value as any, shared: value !== 'none' }
                                    : m
                                ));
                              }}
                              options={[
                                { value: 'none', label: 'No Access' },
                                { value: 'view', label: 'View Only' },
                                { value: 'edit', label: 'Can Edit' }
                              ]}
                            />
                            <BrandButton 
                              variant={member.shared ? 'red' : 'green'}
                              onClick={() => {
                                setTeamMembers(prev => prev.map(m => 
                                  m.id === member.id ? { ...m, shared: !m.shared } : m
                                ));
                                shareCalendar();
                              }}
                            >
                              {member.shared ? 'Revoke' : 'Share'}
                            </BrandButton>
                          </div>
                        )}
                      </div>
                    </BrandCard>
                  ))}
                </div>
              </div>

              {/* Calendar Integrations Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Calendar Integrations</h3>
                
                {/* External Calendar Connections */}
                <BrandCard variant="glass" borderGradient="blue" className="p-4">
                  <h4 className="font-medium text-white mb-3">External Calendars</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="text-white font-medium">Google Calendar</span>
                          <p className="text-white/60 text-xs">Sync events both ways</p>
                        </div>
                      </div>
                      <BrandButton variant="blue" onClick={connectGoogleCalendar}>
                        Connect
                      </BrandButton>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center">
                          <Monitor className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="text-white font-medium">Apple Calendar</span>
                          <p className="text-white/60 text-xs">iCloud calendar sync</p>
                        </div>
                      </div>
                      <BrandButton variant="secondary" onClick={connectAppleCalendar}>
                        Connect
                      </BrandButton>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                          <CalendarIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="text-white font-medium">Calendly</span>
                          <p className="text-white/60 text-xs">Booking integration</p>
                        </div>
                      </div>
                      <BrandButton variant="orange" onClick={connectCalendly}>
                        Connect
                      </BrandButton>
                    </div>
                  </div>
                </BrandCard>

                {/* Share Calendar Link */}
                <BrandCard variant="glass" borderGradient="purple" className="p-4">
                  <h4 className="font-medium text-white mb-3">Share Calendar Link</h4>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <BrandInput 
                        value="https://calendar.saletoru.com/shared/janar-kuusk-calendar" 
                        readOnly 
                        className="flex-1"
                      />
                      <BrandButton variant="blue" onClick={() => {
                        navigator.clipboard.writeText("https://calendar.saletoru.com/shared/janar-kuusk-calendar");
                        showToast({ title: 'Link copied to clipboard!', type: 'success' });
                      }}>
                        <Copy className="w-4 h-4" />
                      </BrandButton>
                    </div>
                    <p className="text-white/60 text-sm">
                      Anyone with this link can view your calendar based on the permissions you set.
                    </p>
                  </div>
                </BrandCard>

                {/* Status Management for Current User */}
                <BrandCard variant="glass" borderGradient="green" className="p-4">
                  <h4 className="font-medium text-white mb-3">Your Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: teamMembers[0]?.color }}
                        >
                          JK
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-black/50 flex items-center justify-center ${getTeamStatusColor(teamMembers[0]?.status || 'online')}`}>
                          {(teamMembers[0]?.status === 'on_meeting' || teamMembers[0]?.status === 'on_call') && (
                            <div className="scale-75">
                              {getStatusIcon(teamMembers[0]?.status)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <BrandDropdown
                          value={teamMembers[0]?.status || 'online'}
                          onChange={(value) => updateMemberStatus('current', value)}
                          options={[
                            { value: 'online', label: '🟢 Online' },
                            { value: 'busy', label: '🔴 Busy' },
                            { value: 'on_meeting', label: '📹 In Meeting' },
                            { value: 'on_call', label: '📞 On Call' },
                            { value: 'away', label: '🟡 Away' }
                          ]}
                        />
                      </div>
                    </div>
                    <BrandInput 
                      placeholder="What are you working on?"
                      value={teamMembers[0]?.activity || ''}
                      onChange={(e) => {
                        setTeamMembers(prev => prev.map(m => 
                          m.id === 'current' ? { ...m, activity: e.target.value } : m
                        ));
                      }}
                    />
                  </div>
                </BrandCard>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <BrandButton variant="secondary" onClick={() => setShowTeamModal(false)}>
                Close
              </BrandButton>
              <BrandButton variant="purple">
                <Settings className="w-4 h-4 mr-1" />
                Advanced Settings
              </BrandButton>
            </div>
          </div>
        </Modal>

        {/* AI Assistant Modal */}
        <Modal open={showAIModal} onClose={() => setShowAIModal(false)} size="lg">
          <div className="p-8 max-w-4xl w-full space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Smart Calendar AI Assistant</h2>
                <p className="text-white/80">Intelligent scheduling and productivity optimization</p>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">AI Suggestions</h3>
              {generateAISuggestions().map(suggestion => (
                <BrandCard key={suggestion.id} variant="glass" className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        suggestion.priority === 'high' ? 'bg-red-500/20' :
                        suggestion.priority === 'medium' ? 'bg-yellow-500/20' :
                        'bg-green-500/20'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          suggestion.priority === 'high' ? 'bg-red-400' :
                          suggestion.priority === 'medium' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{suggestion.title}</h4>
                        <p className="text-white/70 text-sm mt-1">{suggestion.description}</p>
                      </div>
                    </div>
                    <BrandButton variant="purple">
                      {suggestion.action}
                    </BrandButton>
                  </div>
                </BrandCard>
              ))}
            </div>

            {/* Free Time Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Free Time Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BrandCard variant="glass" borderGradient="green" className="p-4">
                  <h4 className="font-medium text-white mb-2">Today's Free Slots</h4>
                  <div className="space-y-2">
                    {findFreeTime(60).slice(0, 4).map((slot, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">{slot.start} - {slot.end}</span>
                        <BrandButton 
                          variant="green"
                          onClick={() => {
                            setNewEvent(prev => ({ 
                              ...prev, 
                              date: slot.date, 
                              time: slot.start 
                            }));
                            setShowAIModal(false);
                            setShowCreateModal(true);
                          }}
                        >
                          Schedule
                        </BrandButton>
                      </div>
                    ))}
                  </div>
                </BrandCard>

                <BrandCard variant="glass" borderGradient="blue" className="p-4">
                  <h4 className="font-medium text-white mb-2">Productivity Insights</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70 text-sm">Peak Hours</span>
                      <span className="text-white text-sm">10AM - 12PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70 text-sm">Focus Time Available</span>
                      <span className="text-white text-sm">3 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70 text-sm">Meeting Load</span>
                      <span className="text-green-400 text-sm">Light</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70 text-sm">Conflict Risk</span>
                      <span className="text-yellow-400 text-sm">Medium</span>
                    </div>
                  </div>
                </BrandCard>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <BrandButton variant="secondary" onClick={() => setShowAIModal(false)}>
                Close
              </BrandButton>
              <BrandButton variant="purple">
                <Bot className="w-4 h-4 mr-1" />
                Schedule Optimization
              </BrandButton>
            </div>
          </div>
        </Modal>
      </BrandPageLayout>
    </BrandBackground>
  );
}
