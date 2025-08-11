import React from 'react';
import { Calendar, CheckSquare, Filter, Plus, Bot, Clock, Users, Target, Zap, Settings, Eye, EyeOff, AlertTriangle, Bell } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { CalendarFilter } from '../../types/calendar';
import { Task } from '../../types/task';
import { useGuru } from '../../contexts/GuruContext';

interface CalendarSidebarProps {
  filter: CalendarFilter;
  onFilterChange: (filter: Partial<CalendarFilter>) => void;
  onCreateEvent: () => void;
  onCreateTask: () => void;
  upcomingTasks: Task[];
  onTaskClick: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  filter,
  onFilterChange,
  onCreateEvent,
  onCreateTask,
  upcomingTasks,
  onTaskClick,
  onCompleteTask
}) => {
  const { openGuru, sendMessage } = useGuru();
  
  const formatDueDate = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return taskDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const handleGuruSuggestion = (query: string) => {
    openGuru();
    // Small delay to ensure panel is open
    setTimeout(() => {
      sendMessage(query);
    }, 300);
  };

  const eventTypeFilters = [
    { value: 'meeting', label: 'Meetings', icon: Users, color: '#a259ff' },
    { value: 'call', label: 'Calls', icon: Clock, color: '#43e7ad' },
    { value: 'demo', label: 'Demos', icon: Target, color: '#377dff' },
    { value: 'task', label: 'Tasks', icon: CheckSquare, color: '#f59e0b' },
    { value: 'follow-up', label: 'Follow-ups', icon: Calendar, color: '#ef4444' },
    { value: 'internal', label: 'Internal', icon: Users, color: '#6b7280' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Quick Actions</h3>
          <Badge variant="primary" size="sm">Smart</Badge>
        </div>
        <div className="space-y-3">
          <Button
            onClick={onCreateEvent}
            variant="gradient"
            icon={Calendar}
            fullWidth
          >
            Create Event
          </Button>
          
          <Button
            onClick={onCreateTask}
            variant="secondary"
            icon={CheckSquare}
            fullWidth
          >
            Create Task
          </Button>
        </div>
      </Card>

      {/* Smart Filters */}
      <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Smart Filters</h3>
          <Button variant="secondary" size="sm" icon={Settings}>
            Settings
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Event Type Filters */}
          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-3">
              Event Types
            </label>
            <div className="space-y-2">
              {eventTypeFilters.map((type) => {
                const Icon = type.icon;
                const isActive = filter.event_type === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => onFilterChange({ 
                      event_type: isActive ? undefined : type.value 
                    })}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#a259ff]/20 border border-[#a259ff]/30' 
                        : 'bg-[#23233a]/30 border border-[#23233a]/30 hover:border-[#a259ff]/30'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${type.color}20` }}
                    >
                      <Icon className="w-3 h-3" style={{ color: type.color }} />
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-white' : 'text-[#b0b0d0]'
                    }`}>
                      {type.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-[#a259ff]"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Related To Filter */}
          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Related To
            </label>
            <select
              value={filter.related_to || 'all'}
              onChange={(e) => onFilterChange({ related_to: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
            >
              <option value="all">All Items</option>
              <option value="deals">Deals Only</option>
              <option value="contacts">Contacts Only</option>
              <option value="tasks">Tasks Only</option>
            </select>
          </div>
          
          <Button
            onClick={() => onFilterChange({ event_type: undefined, related_to: undefined })}
            variant="secondary"
            icon={Filter}
            fullWidth
          >
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Upcoming Tasks */}
      <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Upcoming Tasks</h3>
          <Badge variant="warning" size="sm">{upcomingTasks.length}</Badge>
        </div>
        
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {upcomingTasks.map((task) => (
            <div 
              key={task.id}
              className="p-3 bg-[#23233a]/30 rounded-lg border border-[#23233a]/30 hover:border-[#a259ff]/30 transition-all duration-200 cursor-pointer group"
              onClick={() => onTaskClick(task)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm mb-1">{task.title}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-[#b0b0d0]">
                      {formatDueDate(task.due_date)}
                      {task.due_time && ` at ${task.due_time.substring(0, 5)}`}
                    </div>
                    <Badge 
                      variant={
                        task.priority === 'high' || task.priority === 'urgent' 
                          ? 'danger' 
                          : task.priority === 'medium' 
                            ? 'warning' 
                            : 'success'
                      } 
                      size="sm"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={CheckSquare}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteTask(task.id);
                  }}
                />
              </div>
            </div>
          ))}
          
          {upcomingTasks.length === 0 && (
            <div className="text-center py-6">
              <CheckSquare className="w-8 h-8 text-[#b0b0d0] mx-auto mb-2" />
              <p className="text-[#b0b0d0] text-sm">No upcoming tasks</p>
              <p className="text-[#b0b0d0] text-xs mt-1">Create a task to get started</p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Button
            onClick={onCreateTask}
            variant="secondary"
            icon={Plus}
            fullWidth
          >
            Add Task
          </Button>
        </div>
      </Card>

      {/* Guru AI Assistant */}
      <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#a259ff]" />
            <h3 className="font-semibold text-white">Guru AI</h3>
            <Badge variant="success" size="sm">Online</Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={() => handleGuruSuggestion("What's my best time to schedule meetings this week?")}
            variant="secondary"
            icon={Clock}
            fullWidth
          >
            Find Best Times
          </Button>
          
          <Button
            onClick={() => handleGuruSuggestion("Show me my schedule conflicts for this week")}
            variant="secondary"
            icon={AlertTriangle}
            fullWidth
          >
            Check Conflicts
          </Button>
          
          <Button
            onClick={() => handleGuruSuggestion("Suggest time blocks for deep work")}
            variant="secondary"
            icon={Zap}
            fullWidth
          >
            Optimize Schedule
          </Button>
          
          <Button
            onClick={openGuru}
            variant="gradient"
            icon={Bot}
            fullWidth
          >
            Ask Guru Anything
          </Button>
        </div>
      </Card>

      {/* Calendar Settings */}
      <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Calendar Settings</h3>
          <Button variant="secondary" size="sm" icon={Settings}>
            Settings
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-[#23233a]/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-[#43e7ad]" />
              <span className="text-sm text-white">Show Tasks in Calendar</span>
            </div>
            <div className="w-10 h-6 bg-[#43e7ad] rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-[#23233a]/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#43e7ad]" />
              <span className="text-sm text-white">Team Calendar Sync</span>
            </div>
            <div className="w-10 h-6 bg-[#43e7ad] rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-[#23233a]/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-[#b0b0d0]" />
              <span className="text-sm text-white">Smart Notifications</span>
            </div>
            <div className="w-10 h-6 bg-[#6b7280] rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarSidebar;