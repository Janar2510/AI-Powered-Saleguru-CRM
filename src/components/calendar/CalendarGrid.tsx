import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Target, CheckSquare } from 'lucide-react';
import { CalendarEvent } from '../../types/calendar';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import clsx from 'clsx';

interface CalendarGridProps {
  events: CalendarEvent[];
  viewDate: { year: number; month: number; day: number };
  onDateChange: (date: { year: number; month: number; day: number }) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  viewDate,
  onDateChange,
  onEventClick,
  onCreateEvent,
  view,
  onViewChange
}) => {
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = { ...viewDate };
    
    switch (view) {
      case 'month':
        newDate.month = direction === 'next' 
          ? (viewDate.month === 11 ? 0 : viewDate.month + 1) 
          : (viewDate.month === 0 ? 11 : viewDate.month - 1);
        
        if (direction === 'next' && viewDate.month === 11) {
          newDate.year += 1;
        } else if (direction === 'prev' && viewDate.month === 0) {
          newDate.year -= 1;
        }
        break;
      case 'week':
        const weekDate = new Date(viewDate.year, viewDate.month, viewDate.day);
        weekDate.setDate(weekDate.getDate() + (direction === 'next' ? 7 : -7));
        newDate.year = weekDate.getFullYear();
        newDate.month = weekDate.getMonth();
        newDate.day = weekDate.getDate();
        break;
      case 'day':
        const dayDate = new Date(viewDate.year, viewDate.month, viewDate.day);
        dayDate.setDate(dayDate.getDate() + (direction === 'next' ? 1 : -1));
        newDate.year = dayDate.getFullYear();
        newDate.month = dayDate.getMonth();
        newDate.day = dayDate.getDate();
        break;
    }
    
    onDateChange(newDate);
  };

  const getEventColor = (event: CalendarEvent) => {
    switch (event.event_type) {
      case 'meeting': return 'bg-blue-500';
      case 'call': return 'bg-green-500';
      case 'demo': return 'bg-purple-500';
      case 'task': return 'bg-orange-500';
      case 'follow-up': return 'bg-yellow-500';
      case 'internal': return 'bg-gray-500';
      default: return 'bg-primary-500';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatHeaderDate = () => {
    const date = new Date(viewDate.year, viewDate.month, viewDate.day);
    
    switch (view) {
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'week': {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
        
        const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        return `${startMonth} - ${endMonth}`;
      }
      case 'day':
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div>
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekdays.map((day) => (
            <div key={day} className="p-3 text-center font-medium text-secondary-400 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => {
            const date = day ? new Date(viewDate.year, viewDate.month, day) : null;
            const dayEvents = date ? getEventsForDate(date) : [];
            const isToday = date ? isCurrentDate(date) : false;
            const isSelected = date ? 
              date.getDate() === viewDate.day && 
              date.getMonth() === viewDate.month && 
              date.getFullYear() === viewDate.year 
              : false;

            return (
              <div
                key={index}
                className={clsx(
                  'min-h-[120px] p-2 border border-secondary-700 rounded-lg transition-colors',
                  day ? 'hover:bg-secondary-700 cursor-pointer' : '',
                  isToday ? 'bg-primary-600/20 border-primary-600' : '',
                  isSelected ? 'ring-2 ring-primary-600' : ''
                )}
                onClick={() => day && date && onDateChange({
                  year: date.getFullYear(),
                  month: date.getMonth(),
                  day: date.getDate()
                })}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium text-white mb-1">{day}</div>
                    <div className="space-y-1 overflow-y-auto max-h-[80px]">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className={clsx(
                            'text-xs p-1 rounded text-white truncate',
                            getEventColor(event)
                          )}
                        >
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(event.start_time)}</span>
                          </div>
                          <div className="truncate font-medium">{event.title}</div>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-secondary-500 text-center">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(new Date(viewDate.year, viewDate.month, viewDate.day));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-secondary-700">
            <div className="p-3 text-center font-medium text-secondary-400 text-sm">
              Time
            </div>
            {weekDays.map((date, index) => {
              const isToday = isCurrentDate(date);
              return (
                <div 
                  key={index} 
                  className={clsx(
                    "p-3 text-center font-medium text-sm",
                    isToday ? "text-primary-400" : "text-secondary-400"
                  )}
                >
                  <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className={clsx(
                    "text-lg font-bold",
                    isToday ? "text-primary-300" : "text-white"
                  )}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-secondary-700/50">
                <div className="p-2 text-right text-xs text-secondary-500 border-r border-secondary-700/50">
                  {formatHour(hour)}
                </div>
                
                {weekDays.map((date, dayIndex) => {
                  const cellDate = new Date(date);
                  cellDate.setHours(hour);
                  
                  const cellEvents = events.filter(event => {
                    const eventDate = new Date(event.start_time);
                    return eventDate.toDateString() === date.toDateString() && 
                           eventDate.getHours() === hour;
                  });
                  
                  return (
                    <div 
                      key={dayIndex}
                      className="p-1 min-h-[60px] border-r border-secondary-700/30 relative hover:bg-secondary-700/30 transition-colors"
                      onClick={() => {
                        const newDate = new Date(date);
                        newDate.setHours(hour);
                        onCreateEvent(newDate);
                      }}
                    >
                      {cellEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className={clsx(
                            'text-xs p-2 rounded text-white mb-1 cursor-pointer hover:opacity-90 transition-opacity',
                            getEventColor(event)
                          )}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatTime(event.start_time)} - {formatTime(event.end_time)}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
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
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const currentDate = new Date(viewDate.year, viewDate.month, viewDate.day);
    
    const dayEvents = events.filter(event => 
      new Date(event.start_time).toDateString() === currentDate.toDateString()
    );

    return (
      <div>
        {/* Day Header */}
        <div className="p-4 border-b border-secondary-700 text-center">
          <h3 className="text-lg font-semibold text-white">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>

        {/* Time Grid */}
        <div className="relative">
          {hours.map((hour) => {
            const hourDate = new Date(currentDate);
            hourDate.setHours(hour, 0, 0, 0);
            
            const hourEvents = dayEvents.filter(event => 
              new Date(event.start_time).getHours() === hour
            );
            
            return (
              <div 
                key={hour}
                className="grid grid-cols-12 border-b border-secondary-700/50"
              >
                <div className="col-span-1 p-2 text-right text-xs text-secondary-500 border-r border-secondary-700/50">
                  {formatHour(hour)}
                </div>
                
                <div 
                  className="col-span-11 p-2 min-h-[80px] hover:bg-secondary-700/30 transition-colors"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setHours(hour, 0, 0, 0);
                    onCreateEvent(newDate);
                  }}
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={clsx(
                        'p-3 rounded text-white mb-2 cursor-pointer hover:opacity-90 transition-opacity',
                        getEventColor(event)
                      )}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.related_deal_id && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Target className="w-4 h-4" />
                          <span>{event.deal_title}</span>
                        </div>
                      )}
                      
                      {event.related_task_id && (
                        <div className="flex items-center space-x-1 mt-2">
                          <CheckSquare className="w-4 h-4" />
                          <span>{event.task_title}</span>
                        </div>
                      )}
                      
                      {event.attendees.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper Functions
  const getDaysInMonth = (year: number, month: number) => {
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
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const result = [];
    const day = date.getDay();
    const diff = date.getDate() - day;
    
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date);
      newDate.setDate(diff + i);
      result.push(newDate);
    }
    
    return result;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const isCurrentDate = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatHour = (hour: number) => {
    return new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('prev')}
            className="p-2 rounded-lg bg-secondary-700 hover:bg-secondary-600 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-white">
            {formatHeaderDate()}
          </h2>
          
          <button
            onClick={() => navigate('next')}
            className="p-2 rounded-lg bg-secondary-700 hover:bg-secondary-600 text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-secondary-700 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => onViewChange(viewType)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                  view === viewType
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-300 hover:text-white'
                }`}
              >
                {viewType}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              const today = new Date();
              onDateChange({
                year: today.getFullYear(),
                month: today.getMonth(),
                day: today.getDate()
              });
            }}
            className="btn-secondary text-sm"
          >
            Today
          </button>
          
          <button
            onClick={() => onCreateEvent(new Date(viewDate.year, viewDate.month, viewDate.day))}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="bg-secondary-800/30 rounded-lg p-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </Card>
  );
};

export default CalendarGrid;