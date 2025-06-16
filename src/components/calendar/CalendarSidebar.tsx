import React from 'react';
import { Calendar, CheckSquare, Filter, Plus, Bot } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
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

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-md">
        <h3 className="font-medium text-white mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={onCreateEvent}
            className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <Calendar className="w-4 h-4" />
            <span>Create Event</span>
          </button>
          
          <button
            onClick={onCreateTask}
            className="w-full btn-secondary flex items-center justify-center space-x-2 py-3"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="bg-white/10 backdrop-blur-md">
        <h3 className="font-medium text-white mb-4">Filters</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Event Type
            </label>
            <select
              value={filter.event_type || ''}
              onChange={(e) => onFilterChange({ event_type: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="">All Types</option>
              <option value="meeting">Meetings</option>
              <option value="call">Calls</option>
              <option value="demo">Demos</option>
              <option value="task">Tasks</option>
              <option value="follow-up">Follow-ups</option>
              <option value="internal">Internal</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Related To
            </label>
            <select
              value={filter.related_to || 'all'}
              onChange={(e) => onFilterChange({ related_to: e.target.value as any })}
              className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">All Items</option>
              <option value="deals">Deals Only</option>
              <option value="contacts">Contacts Only</option>
              <option value="tasks">Tasks Only</option>
            </select>
          </div>
          
          <button
            onClick={() => onFilterChange({ event_type: undefined, related_to: undefined })}
            className="w-full btn-secondary text-sm flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Reset Filters</span>
          </button>
        </div>
      </Card>

      {/* Upcoming Tasks */}
      <Card className="bg-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Upcoming Tasks</h3>
          <Badge variant="primary" size="sm">{upcomingTasks.length}</Badge>
        </div>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {upcomingTasks.map((task) => (
            <div 
              key={task.id}
              className="p-3 bg-secondary-700 rounded-lg hover:bg-secondary-600 transition-colors cursor-pointer"
              onClick={() => onTaskClick(task)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm">{task.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="text-xs text-secondary-400">
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteTask(task.id);
                  }}
                  className="p-1 text-secondary-400 hover:text-green-500 transition-colors"
                  title="Mark as complete"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {upcomingTasks.length === 0 && (
            <div className="text-center py-4">
              <CheckSquare className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
              <p className="text-secondary-400 text-sm">No upcoming tasks</p>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <button
            onClick={onCreateTask}
            className="w-full btn-secondary text-sm flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </Card>

      {/* Guru Card */}
      <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-medium text-white">Guru Suggestions</h3>
            <p className="text-secondary-300 text-sm mt-2">
              Try asking SaleToruGuru:
            </p>
            <ul className="space-y-2 mt-2">
              <li>
                <button 
                  onClick={() => handleGuruSuggestion("Show me overdue tasks for deals over $10K")}
                  className="text-sm text-primary-300 hover:text-primary-200 cursor-pointer text-left"
                >
                  "Show me overdue tasks for deals over $10K"
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleGuruSuggestion("Summarize my calendar for the next 7 days")}
                  className="text-sm text-primary-300 hover:text-primary-200 cursor-pointer text-left"
                >
                  "Summarize my calendar for the next 7 days"
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleGuruSuggestion("Find conflicts in my schedule this week")}
                  className="text-sm text-primary-300 hover:text-primary-200 cursor-pointer text-left"
                >
                  "Find conflicts in my schedule this week"
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarSidebar;