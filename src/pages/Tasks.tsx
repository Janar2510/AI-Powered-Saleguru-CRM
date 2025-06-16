import React, { useState, useEffect } from 'react';
import { Plus, Filter, Calendar, Clock, CheckCircle, AlertTriangle, Bot, TrendingUp, Users, Target, CheckSquare } from 'lucide-react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
import TaskList from '../components/tasks/TaskList';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskFilter, TaskFormData } from '../types/task';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const Tasks: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Initialize with tasks due today
  const initialFilter: TaskFilter = { timeframe: 'all' };
  const { 
    tasks, 
    isLoading, 
    error, 
    filter, 
    setFilter, 
    createTask, 
    updateTask, 
    completeTask, 
    deleteTask 
  } = useTasks(initialFilter);

  // Get current user ID from Supabase auth
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  const handleFilterChange = (filterKey: string) => {
    setActiveFilter(filterKey);
    
    switch (filterKey) {
      case 'pending':
        setFilter({ status: 'pending', timeframe: 'all' });
        break;
      case 'completed':
        setFilter({ status: 'completed', timeframe: 'all' });
        break;
      case 'overdue':
        setFilter({ timeframe: 'overdue' });
        break;
      case 'today':
        setFilter({ timeframe: 'today' });
        break;
      case 'this-week':
        setFilter({ timeframe: 'this-week' });
        break;
      case 'high-priority':
        setFilter({ priority: 'high', timeframe: 'all' });
        break;
      default:
        setFilter({ timeframe: 'all' });
    }
  };

  const handleTaskCreated = async (taskData: TaskFormData) => {
    if (editingTask) {
      // Update existing task
      await updateTask(editingTask.id, taskData as any);
      setEditingTask(null);
    } else {
      // Create new task
      await createTask(taskData);
    }
    
    setShowCreateModal(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowCreateModal(true);
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleAddSuggestedTask = async (suggestion: any) => {
    if (!currentUserId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Unable to create task: User not authenticated'
      });
      return;
    }

    const newTask: TaskFormData = {
      title: suggestion.title,
      description: suggestion.description,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      due_time: '',
      type: 'task',
      priority: suggestion.priority.toLowerCase(),
      assigned_to: currentUserId,
      tags: ['AI Suggested'],
    };
    
    await createTask(newTask);
    
    showToast({
      type: 'success',
      title: 'Task Added',
      message: `AI suggested task "${suggestion.title}" has been added.`
    });
  };

  // Stats calculations
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length
  };

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            <p className="text-secondary-400 mt-1">Manage your daily activities and follow-ups</p>
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
              onClick={() => {
                setEditingTask(null);
                setShowCreateModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-secondary-400 text-sm">Total Tasks</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {stats.pending}
              </div>
              <div className="text-secondary-400 text-sm">Pending</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {stats.completed}
              </div>
              <div className="text-secondary-400 text-sm">Completed</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {stats.overdue}
              </div>
              <div className="text-secondary-400 text-sm">Overdue</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {stats.highPriority}
              </div>
              <div className="text-secondary-400 text-sm">High Priority</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'pending', label: 'Pending' },
              { key: 'completed', label: 'Completed' },
              { key: 'overdue', label: 'Overdue' },
              { key: 'today', label: 'Due Today' },
              { key: 'this-week', label: 'This Week' },
              { key: 'high-priority', label: 'High Priority' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => handleFilterChange(item.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeFilter === item.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button className="btn-secondary flex items-center space-x-2 whitespace-nowrap">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </button>
        </div>

        {/* AI Suggestions */}
        <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary-500" />
              <span>AI Task Suggestions</span>
              <Badge variant="success" size="sm">Smart</Badge>
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: "Review pipeline health",
                  description: "Analyze current deals and identify bottlenecks in your sales process.",
                  time: "~30m",
                  priority: "Medium"
                },
                {
                  title: "Update contact information",
                  description: "Ensure all contact details are current and complete.",
                  time: "~15m",
                  priority: "Low"
                },
                {
                  title: "Plan prospecting activities",
                  description: "Identify and research new potential customers for your pipeline.",
                  time: "~45m",
                  priority: "High"
                }
              ].map((suggestion, index) => (
                <div key={index} className="bg-secondary-700/50 p-4 rounded-lg border-l-4 border-primary-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{suggestion.title}</h4>
                      <p className="text-sm text-secondary-400 mt-1">{suggestion.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-secondary-500">{suggestion.time}</span>
                        <Badge variant="secondary" size="sm">{suggestion.priority}</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button 
                        onClick={() => handleAddSuggestedTask(suggestion)}
                        className="btn-primary text-sm px-3 py-1"
                        disabled={!currentUserId}
                      >
                        Add Task
                      </button>
                      <button className="btn-secondary text-sm px-3 py-1">Dismiss</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tasks List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary-400">Loading tasks...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border border-red-600/30 text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Tasks</h3>
            <p className="text-red-300">{error}</p>
          </Card>
        ) : tasks.length > 0 ? (
          <TaskList 
            tasks={tasks}
            onComplete={handleCompleteTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        ) : (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description={activeFilter !== 'all' ? 'No tasks match the selected filter criteria' : 'Create your first task to get started'}
            guruSuggestion="Help me organize my tasks better"
            actionLabel="Create Task"
            onAction={() => {
              setEditingTask(null);
              setShowCreateModal(true);
            }}
          />
        )}

        {/* Create/Edit Task Modal */}
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTask(null);
          }}
          onTaskCreated={handleTaskCreated}
          currentUserId={currentUserId}
          initialData={editingTask ? {
            title: editingTask.title,
            description: editingTask.description || '',
            due_date: editingTask.due_date,
            due_time: editingTask.due_time || '',
            type: editingTask.type,
            priority: editingTask.priority,
            assigned_to: editingTask.assigned_to || '',
            contact_id: editingTask.contact_id,
            deal_id: editingTask.deal_id,
            tags: editingTask.tags
          } : undefined}
          isEditing={!!editingTask}
        />
      </div>
    </Container>
  );
};

export default Tasks;