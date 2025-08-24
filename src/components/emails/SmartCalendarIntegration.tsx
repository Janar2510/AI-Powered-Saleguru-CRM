import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Video,
  Phone,
  Mail,
  Settings,
  Check,
  AlertCircle,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Repeat,
  Bell
} from 'lucide-react';
import {
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandInput
} from '../../contexts/BrandDesignContext';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  type: 'meeting' | 'call' | 'demo' | 'followup' | 'interview' | 'presentation';
  attendees: Array<{
    email: string;
    name: string;
    status: 'pending' | 'accepted' | 'declined' | 'tentative';
  }>;
  location?: string;
  meetingLink?: string;
  isRecurring?: boolean;
  priority: 'low' | 'normal' | 'high';
  reminder?: string;
  dealId?: string;
  contactId?: string;
}

interface SmartCalendarIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleEmail: (scheduledTime: string, eventId?: string) => void;
  selectedDate?: string;
  dealId?: string;
  contactId?: string;
  suggestedTimes?: string[];
}

const SmartCalendarIntegration: React.FC<SmartCalendarIntegrationProps> = ({
  isOpen,
  onClose,
  onScheduleEmail,
  selectedDate,
  dealId,
  contactId,
  suggestedTimes = []
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'meeting' as CalendarEvent['type'],
    attendees: '',
    location: '',
    meetingLink: '',
    priority: 'normal' as CalendarEvent['priority']
  });

  // Mock calendar data
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Product Demo with Tech Corp',
      description: 'Showcase new features and pricing options',
      start: '2024-01-22T10:00:00Z',
      end: '2024-01-22T11:00:00Z',
      type: 'demo',
      attendees: [
        { email: 'john@techcorp.com', name: 'John Smith', status: 'accepted' },
        { email: 'sarah@techcorp.com', name: 'Sarah Johnson', status: 'pending' }
      ],
      location: 'Conference Room A',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      priority: 'high',
      reminder: '15min',
      dealId: 'deal_1'
    },
    {
      id: '2',
      title: 'Follow-up Call - Business Solutions',
      start: '2024-01-22T14:30:00Z',
      end: '2024-01-22T15:00:00Z',
      type: 'followup',
      attendees: [
        { email: 'mike@business.com', name: 'Mike Wilson', status: 'accepted' }
      ],
      priority: 'normal',
      contactId: 'contact_2'
    },
    {
      id: '3',
      title: 'Sales Presentation - Enterprise Deal',
      start: '2024-01-23T09:00:00Z',
      end: '2024-01-23T10:30:00Z',
      type: 'presentation',
      attendees: [
        { email: 'lisa@enterprise.com', name: 'Lisa Chen', status: 'accepted' },
        { email: 'david@enterprise.com', name: 'David Kim', status: 'accepted' }
      ],
      meetingLink: 'https://zoom.us/j/123456789',
      priority: 'high',
      dealId: 'deal_2'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setEvents(mockEvents);
      if (selectedDate) {
        setCurrentDate(new Date(selectedDate));
      }
    }
  }, [isOpen, selectedDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayEvents = events.filter(event => 
        new Date(event.start).toDateString() === currentDate.toDateString()
      );
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        events: dayEvents
      });
    }
    
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const isTimeSlotBusy = (timeSlot: string, date: Date) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hours, minutes, 0, 0);
    
    return events.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return slotTime >= eventStart && slotTime < eventEnd;
    });
  };

  const handleScheduleEmail = (timeSlot: string) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const scheduledDate = new Date(currentDate);
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    onScheduleEmail(scheduledDate.toISOString());
    onClose();
  };

  const handleCreateEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      start: newEvent.start,
      end: newEvent.end,
      type: newEvent.type,
      attendees: newEvent.attendees.split(',').map(email => ({
        email: email.trim(),
        name: email.trim().split('@')[0],
        status: 'pending' as const
      })),
      location: newEvent.location,
      meetingLink: newEvent.meetingLink,
      priority: newEvent.priority,
      dealId,
      contactId
    };
    
    setEvents(prev => [...prev, event]);
    setShowCreateEvent(false);
    setNewEvent({
      title: '',
      description: '',
      start: '',
      end: '',
      type: 'meeting',
      attendees: '',
      location: '',
      meetingLink: '',
      priority: 'normal'
    });
  };

  const formatEventTime = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'demo': return 'purple';
      case 'meeting': return 'blue';
      case 'call': return 'green';
      case 'followup': return 'orange';
      case 'interview': return 'red';
      case 'presentation': return 'yellow';
      default: return 'secondary';
    }
  };

  const days = getDaysInMonth(currentDate);
  const timeSlots = getTimeSlots();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard className="w-full max-w-6xl h-[90vh] overflow-hidden" borderGradient="blue">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Smart Calendar</h2>
                <p className="text-white/70">Schedule emails and manage meetings</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <BrandButton variant="purple" size="sm" onClick={() => setShowCreateEvent(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </BrandButton>
              <BrandButton variant="secondary" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </BrandButton>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Calendar View */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <BrandButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </BrandButton>
                
                <h3 className="text-xl font-bold text-white">
                  {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </h3>
                
                <BrandButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </BrandButton>
              </div>
              
              <BrandButton
                variant="blue"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </BrandButton>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white/5 rounded-xl p-4">
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-white/60 font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer ${
                      day.isCurrentMonth
                        ? 'border-white/20 hover:border-white/40 bg-white/5'
                        : 'border-white/10 bg-white/2 text-white/40'
                    } ${
                      day.date.toDateString() === new Date().toDateString()
                        ? 'border-blue-500 bg-blue-500/10'
                        : ''
                    }`}
                    onClick={() => setCurrentDate(day.date)}
                  >
                    <div className="text-sm font-medium text-white mb-1">
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {day.events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded text-white bg-${getEventTypeColor(event.type)}-500/20 truncate`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-white/60">
                          +{day.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Events */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Events for {currentDate.toLocaleDateString()}
              </h4>
              
              <div className="space-y-3">
                {events
                  .filter(event => 
                    new Date(event.start).toDateString() === currentDate.toDateString()
                  )
                  .map(event => (
                    <BrandCard key={event.id} className="p-4" borderGradient={getEventTypeColor(event.type) as any}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-${getEventTypeColor(event.type)}-500/20`}>
                            {event.type === 'demo' && <Video className="w-4 h-4 text-purple-400" />}
                            {event.type === 'meeting' && <Users className="w-4 h-4 text-blue-400" />}
                            {event.type === 'call' && <Phone className="w-4 h-4 text-green-400" />}
                            {event.type === 'followup' && <Mail className="w-4 h-4 text-orange-400" />}
                            {event.type === 'interview' && <Users className="w-4 h-4 text-red-400" />}
                            {event.type === 'presentation' && <Video className="w-4 h-4 text-yellow-400" />}
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-white">{event.title}</h5>
                            <p className="text-white/70 text-sm">{formatEventTime(event)}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <BrandBadge variant={getEventTypeColor(event.type) as any} size="sm">
                                {event.type}
                              </BrandBadge>
                              {event.priority === 'high' && (
                                <BrandBadge variant="red" size="sm">High Priority</BrandBadge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {event.meetingLink && (
                            <BrandButton variant="blue" size="sm">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Join
                            </BrandButton>
                          )}
                          <BrandButton variant="secondary" size="sm">
                            <Edit className="w-3 h-3" />
                          </BrandButton>
                        </div>
                      </div>
                    </BrandCard>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Time Slots Sidebar */}
          <div className="w-80 border-l border-white/10 p-6 overflow-y-auto">
            <h4 className="text-lg font-semibold text-white mb-4">
              Available Time Slots
            </h4>
            <p className="text-white/70 text-sm mb-6">
              Select a time to schedule your email for {currentDate.toLocaleDateString()}
            </p>

            <div className="space-y-2">
              {timeSlots.map(timeSlot => {
                const isBusy = isTimeSlotBusy(timeSlot, currentDate);
                const isSuggested = suggestedTimes.includes(timeSlot);
                
                return (
                  <button
                    key={timeSlot}
                    onClick={() => !isBusy && handleScheduleEmail(timeSlot)}
                    disabled={isBusy}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      isBusy
                        ? 'border-red-500/30 bg-red-500/10 text-red-400 cursor-not-allowed'
                        : isSuggested
                        ? 'border-green-500 bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{timeSlot}</span>
                      <div className="flex items-center space-x-2">
                        {isSuggested && (
                          <BrandBadge variant="green" size="sm">
                            Suggested
                          </BrandBadge>
                        )}
                        {isBusy ? (
                          <BrandBadge variant="red" size="sm">
                            Busy
                          </BrandBadge>
                        ) : (
                          <Clock className="w-4 h-4 text-white/60" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h5 className="text-white/80 font-medium mb-3">Quick Actions</h5>
              <div className="space-y-2">
                <BrandButton variant="blue" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule for Tomorrow
                </BrandButton>
                <BrandButton variant="purple" size="sm" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule for Next Week
                </BrandButton>
                <BrandButton variant="green" size="sm" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Reminder
                </BrandButton>
              </div>
            </div>
          </div>
        </div>

        {/* Create Event Modal */}
        {showCreateEvent && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <BrandCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden" borderGradient="green">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Create New Event</h3>
                  <BrandButton variant="secondary" size="sm" onClick={() => setShowCreateEvent(false)}>
                    <X className="w-4 h-4" />
                  </BrandButton>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-white/80 font-medium mb-2">Event Title</label>
                  <BrandInput
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 font-medium mb-2">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/20 border-2 border-white/20 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 font-medium mb-2">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newEvent.end}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/20 border-2 border-white/20 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-black/20 border-2 border-white/20 rounded-xl text-white"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="demo">Demo</option>
                    <option value="followup">Follow-up</option>
                    <option value="interview">Interview</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2">Attendees (comma separated emails)</label>
                  <BrandInput
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, attendees: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2">Location / Meeting Link</label>
                  <BrandInput
                    value={newEvent.location || newEvent.meetingLink}
                    onChange={(e) => setNewEvent(prev => ({ 
                      ...prev, 
                      [e.target.value.startsWith('http') ? 'meetingLink' : 'location']: e.target.value 
                    }))}
                    placeholder="Conference Room A or https://meet.google.com/..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10">
                <div className="flex items-center justify-end space-x-3">
                  <BrandButton variant="secondary" onClick={() => setShowCreateEvent(false)}>
                    Cancel
                  </BrandButton>
                  <BrandButton variant="green" onClick={handleCreateEvent}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </BrandButton>
                </div>
              </div>
            </BrandCard>
          </div>
        )}
      </BrandCard>
    </div>
  );
};

export default SmartCalendarIntegration;

