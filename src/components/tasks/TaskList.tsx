import React, { useState } from 'react';
import { CheckCircle, Clock, Calendar, AlertTriangle, Target, Users, Edit, Trash2, Mail, Phone, ArrowRight, Bell, CheckSquare, User } from 'lucide-react';
import { Task } from '../../types/task';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete, onEdit, onDelete }) => {
  const { showToast } = useToastContext();
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'text-red-500 border-red-500';
      case 'medium':
        return 'text-yellow-500 border-yellow-500';
      case 'low':
        return 'text-green-500 border-green-500';
      default:
        return 'text-secondary-400 border-secondary-400';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'in-progress') return <Clock className="w-5 h-5 text-yellow-500" />;
    if (status === 'overdue') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-secondary-400" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4 text-blue-500" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-green-500" />;
      case 'follow-up':
        return <ArrowRight className="w-4 h-4 text-yellow-500" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-red-500" />;
      default:
        return <CheckSquare className="w-4 h-4 text-secondary-400" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !isTaskCompleted(task);
  };

  const isTaskCompleted = (task: Task) => {
    return task.status === 'completed';
  };

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
      day: 'numeric',
      year: today.getFullYear() !== taskDate.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await onComplete(taskId);
      showToast({
        type: 'success',
        title: 'Task Completed',
        message: 'Task has been marked as complete'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete task'
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await onDelete(taskId);
      setDeletingTaskId(null);
      showToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'Task has been deleted successfully'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete task'
      });
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card 
          key={task.id} 
          className={`bg-white/10 backdrop-blur-md hover:shadow-lg transition-all ${
            task.status === 'overdue' ? 'border-l-4 border-red-500' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="mt-1">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className={`font-semibold ${isTaskCompleted(task) ? 'text-secondary-400 line-through' : 'text-white'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" size="sm">
                      {getTypeIcon(task.type)}
                      <span className="ml-1 capitalize">{task.type}</span>
                    </Badge>
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
                    {task.status === 'overdue' && (
                      <Badge variant="danger" size="sm">Overdue</Badge>
                    )}
                  </div>
                </div>
                
                {task.description && (
                  <p className={`text-sm mt-1 ${isTaskCompleted(task) ? 'text-secondary-500' : 'text-secondary-400'}`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center space-x-1 text-sm text-secondary-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDueDate(task.due_date)}</span>
                    {task.due_time && (
                      <span>{task.due_time.substring(0, 5)}</span>
                    )}
                  </div>
                  
                  {task.deal_title && (
                    <div className="flex items-center space-x-1 text-sm text-secondary-400">
                      <Target className="w-4 h-4" />
                      <span>{task.deal_title}</span>
                    </div>
                  )}
                  
                  {task.contact_name && (
                    <div className="flex items-center space-x-1 text-sm text-secondary-400">
                      <Users className="w-4 h-4" />
                      <span>{task.contact_name}</span>
                    </div>
                  )}
                  
                  {task.assignee_name && (
                    <div className="flex items-center space-x-1 text-sm text-secondary-400">
                      <User className="w-4 h-4" />
                      <span>Assigned to: {task.assignee_name}</span>
                    </div>
                  )}
                </div>
                
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 ml-4">
              {task.status !== 'completed' && (
                <button 
                  onClick={() => handleCompleteTask(task.id)}
                  className="btn-primary text-sm"
                >
                  Complete
                </button>
              )}
              <button 
                onClick={() => onEdit(task)}
                className="btn-secondary text-sm"
              >
                <Edit className="w-4 h-4" />
              </button>
              {deletingTaskId === task.id ? (
                <div className="flex space-x-1 bg-red-900/20 rounded-lg p-1">
                  <button 
                    onClick={() => setDeletingTaskId(null)}
                    className="p-1 text-secondary-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setDeletingTaskId(task.id)}
                  className="btn-secondary text-sm text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Card>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-8">
          <CheckSquare className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
          <p className="text-secondary-400">No tasks found</p>
          <p className="text-secondary-500 text-sm mt-1">
            Try adjusting your filters or create a new task
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskList;