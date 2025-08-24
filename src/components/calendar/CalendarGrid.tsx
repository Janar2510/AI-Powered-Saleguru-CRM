import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Target, CheckSquare, Calendar, MoreHorizontal } from 'lucide-react';
import { CalendarEvent } from '../../types/calendar';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
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
      case 'meeting': return 'bg-[#a259ff] border-[#a259ff]/30';
      case 'call': return 'bg-[#43e7ad] border-[#43e7ad]/30';
      case 'demo': return 'bg-[#377dff] border-[#377dff]/30';
      case 'task': return 'bg-[#f59e0b] border-[#f59e0b]/30';
      case 'follow-up': return 'bg-[#ef4444] border-[#ef4444]/30';
      case 'internal': return 'bg-[#6b7280] border-[#6b7280]/30';
      default: return 'bg-[#a259ff] border-[#a259ff]/30';
    }
  };

  const getEventIcon = (event: CalendarEvent) => {
    switch (event.event_type) {
      case 'meeting': return Users;
      case 'call': return Clock;
      case 'demo': return Target;
      case 'task': return CheckSquare;
      case 'follow-up': return Calendar;
      case 'internal': return Users;
      default: return Calendar;
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
            <div key={day} className="p-3 text-center font-medium text-[#b0b0d0] text-sm">
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
                  'min-h-[140px] p-2 border border-[#23233a]/50 rounded-lg transition-all duration-200',
                  day ? 'hover:bg-[#23233a]/30 hover:border-[#a259ff]/30 cursor-pointer' : '',
                  isToday ? 'bg-[#a259ff]/20 border-[#a259ff]/50' : '',
                  isSelected ? 'ring-2 ring-[#a259ff] ring-opacity-50' : ''
                )}
                onClick={() => day && date && onDateChange({
                  year: date.getFullYear(),
                  month: date.getMonth(),
                  day: date.getDate()
                })}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className={clsx(
                        "text-sm font-medium",
                        isToday ? "text-[#a259ff]" : "text-white"
                      )}>
                        {day}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Plus}
                        className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateEvent(date);
                        }}
                      />
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[100px]">
                      {dayEvents.slice(0, 3).map((event) => {
                        const EventIcon = getEventIcon(event);
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                            className={clsx(
                              'text-xs p-2 rounded-lg text-white cursor-pointer transition-all duration-200 hover:scale-105',
                              getEventColor(event),
                              'border backdrop-blur-sm'
                            )}
                          >
                            <div className="flex items-center space-x-1 mb-1">
                              <EventIcon className="w-3 h-3" />
                              <span className="font-medium">{formatTime(event.start_time)}</span>
                            </div>
                            <div className="truncate font-medium text-xs">{event.title}</div>
                            {event.location && (
                              <div className="flex items-center space-x-1 mt-1">
                                <MapPin className="w-2 h-2" />
                                <span className="text-xs opacity-80 truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-[#b0b0d0] text-center py-1">
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
          <div className="grid grid-cols-8 border-b border-[#23233a]/50">
            <div className="p-3 text-center font-medium text-[#b0b0d0] text-sm">
              Time
            </div>
            {weekDays.map((date, index) => {
              const isToday = isCurrentDate(date);
              return (
                <div 
                  key={index} 
                  className={clsx(
                    "p-3 text-center font-medium text-sm",
                    isToday ? "text-[#a259ff]" : "text-white"
                  )}
                >
                  <div className="text-xs text-[#b0b0d0]">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg">
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-8">
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="p-2 text-xs text-[#b0b0d0] border-r border-b border-[#23233a]/30">
                  {formatHour(hour)}
                </div>
                {weekDays.map((date, dayIndex) => {
                  const hourEvents = getEventsForHour(date, hour);
                  return (
                    <div 
                      key={dayIndex}
                      className="p-1 border-r border-b border-[#23233a]/30 min-h-[60px] relative"
                    >
                      {hourEvents.map((event) => {
                        const EventIcon = getEventIcon(event);
                        return (
                          <div
                            key={event.id}
                            onClick={() => onEventClick(event)}
                            className={clsx(
                              'text-xs p-1 rounded text-white cursor-pointer transition-all duration-200 hover:scale-105',
                              getEventColor(event),
                              'border backdrop-blur-sm'
                            )}
                          >
                            <div className="flex items-center space-x-1">
                              <EventIcon className="w-2 h-2" />
                              <span className="font-medium">{formatTime(event.start_time)}</span>
                            </div>
                            <div className="truncate font-medium text-xs">{event.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const date = new Date(viewDate.year, viewDate.month, viewDate.day);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDate(date);

    return (
      <div className="space-y-4">
        {/* Day Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <p className="text-[#b0b0d0] mt-1">
            {dayEvents.length} events scheduled
          </p>
        </div>

        {/* Hourly Schedule */}
        <div className="space-y-2">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(date, hour);
            return (
              <div key={hour} className="flex">
                <div className="w-20 p-2 text-sm text-[#b0b0d0] border-r border-[#23233a]/30">
                  {formatHour(hour)}
                </div>
                <div className="flex-1 p-2 min-h-[60px] relative">
                  {hourEvents.map((event) => {
                    const EventIcon = getEventIcon(event);
                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={clsx(
                          'text-sm p-3 rounded-lg text-white cursor-pointer transition-all duration-200 hover:scale-105 mb-2',
                          getEventColor(event),
                          'border backdrop-blur-sm'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <EventIcon className="w-4 h-4" />
                            <span className="font-semibold">{event.title}</span>
                          </div>
                          <span className="text-xs opacity-80">
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-xs opacity-80 mb-2">{event.description}</p>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{event.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper functions
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const weekDays = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    
    return weekDays;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString() && eventDate.getHours() === hour;
    });
  };

  const isCurrentDate = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatHour = (hour: number) => {
    return new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      hour12: true 
    });
  };

  return (
    <div className="space-y-4">
      {/* View Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            icon={ChevronLeft}
            onClick={() => navigate('prev')}
          />
          <Button 
            variant="secondary" 
            size="sm"
            icon={ChevronRight}
            onClick={() => navigate('next')}
          />
          <h3 className="text-lg font-semibold text-white ml-4">
            {formatHeaderDate()}
          </h3>
        </div>
        
        <div className="flex items-center space-x-1 bg-[#23233a]/50 rounded-lg p-1">
          <Button 
            variant={view === 'month' ? 'gradient' : 'secondary'} 
            size="sm"
            onClick={() => onViewChange('month')}
          >
            Month
          </Button>
          <Button 
            variant={view === 'week' ? 'gradient' : 'secondary'} 
            size="sm"
            onClick={() => onViewChange('week')}
          >
            Week
          </Button>
          <Button 
            variant={view === 'day' ? 'gradient' : 'secondary'} 
            size="sm"
            onClick={() => onViewChange('day')}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="bg-[#23233a]/20 rounded-lg p-4 backdrop-blur-sm">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default CalendarGrid;