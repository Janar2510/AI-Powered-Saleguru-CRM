import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Bot, 
  TrendingUp, 
  Users, 
  Target, 
  CheckSquare,
  Search,
  Grid,
  Square,
  Edit,
  Trash2,
  Eye,
  User,
  Building,
  DollarSign,
  Percent,
  Hash,
  XCircle,
  AlertCircle,
  Copy,
  Send,
  FileText,
  Mail,
  Phone,
  Tag,
  Bell,
  ArrowRight,
  X
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spline from '@splinetool/react-spline';
import { useToastContext } from '../contexts/ToastContext';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskFilter, TaskFormData } from '../types/task';
import { useGuru } from '../contexts/GuruContext';
import { supabase } from '../services/supabase';

// Task Modal Component
interface TaskModalProps {
  task?: Task;
  onClose: () => void;
  onSave: (task: TaskFormData) => void;
  isNew: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  task, 
  onClose, 
  onSave, 
  isNew 
}) => {
  const { showToast } = useToastContext();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '',
    type: 'task',
    priority: 'medium',
    assigned_to: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date,
        due_time: task.due_time || '',
        type: task.type,
        priority: task.priority,
        assigned_to: task.assigned_to || '',
        tags: task.tags || []
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      showToast({ title: isNew ? 'Task created successfully' : 'Task updated successfully', type: 'success' });
      onClose();
    } catch (error) {
      showToast({ title: 'Error saving task', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'low':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'email':
        return Mail;
      case 'meeting':
        return Users;
      case 'follow-up':
        return Bell;
      default:
        return CheckSquare;
    }
  };

  const TypeIcon = getTypeIcon(formData.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-[#23233a]/90 backdrop-blur-xl border border-[#23233a]/50 shadow-2xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                  <TypeIcon className="w-6 h-6 text-[#a259ff]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isNew ? 'Create New Task' : 'Edit Task'}
                  </h2>
                  <p className="text-[#b0b0d0] text-sm">
                    {isNew ? 'Add a new task to your workflow' : 'Update task details'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#23233a]/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#b0b0d0]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                      errors.title ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter task title..."
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] resize-none"
                    placeholder="Enter task description..."
                  />
                </div>
              </div>

              {/* Task Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Task Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  >
                    <option value="task">General Task</option>
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow-up">Follow Up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-[#23233a]/50 border-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                      errors.due_date ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.due_date && (
                    <p className="text-red-400 text-sm mt-1">{errors.due_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Due Time
                  </label>
                  <input
                    type="time"
                    name="due_time"
                    value={formData.due_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} className="bg-[#a259ff]/20 text-[#a259ff] border-[#a259ff]/30">
                        <span className="mr-1">{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      placeholder="Add a tag..."
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (isNew ? 'Create Task' : 'Update Task')}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Tasks: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
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

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSaveTask = async (taskData: TaskFormData) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData as any);
      setEditingTask(null);
    } else {
      await createTask(taskData);
    }
    setShowModal(false);
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleAddSuggestedTask = async (suggestion: any) => {
    if (!currentUserId) {
      showToast({ title: 'Error', description: 'Unable to create task: User not authenticated' });
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
    
    showToast({ title: 'Task Added', description: `AI suggested task "${suggestion.title}" has been added.` });
  };

  // Stats calculations
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !activeFilter || activeFilter === 'all' || 
                         (activeFilter === 'pending' && task.status === 'pending') ||
                         (activeFilter === 'completed' && task.completed) ||
                         (activeFilter === 'overdue' && task.status === 'overdue') ||
                         (activeFilter === 'high-priority' && (task.priority === 'high' || task.priority === 'urgent'));
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string, completed: boolean) => {
    if (completed) return 'text-green-400 bg-green-400/20 border-green-400/30';
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'overdue':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'low':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'email':
        return Mail;
      case 'meeting':
        return Users;
      case 'follow-up':
        return Bell;
      default:
        return CheckSquare;
    }
  };

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Tasks</h1>
              <p className="text-[#b0b0d0] mt-1">Manage your daily activities and follow-ups</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={openGuru}
                variant="secondary"
                icon={Bot}
              >
                Ask Guru
              </Button>
              <Button
                onClick={handleCreateTask}
                variant="gradient"
                size="lg"
                icon={Plus}
              >
                New Task
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Total Tasks</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-400/20 rounded-lg">
                    <CheckSquare className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-400/20 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                  </div>
                  <div className="p-3 bg-green-400/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Overdue</p>
                    <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
                  </div>
                  <div className="p-3 bg-red-400/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">High Priority</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.highPriority}</p>
                  </div>
                  <div className="p-3 bg-orange-400/20 rounded-lg">
                    <Target className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  />
                </div>
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
                          ? 'bg-[#a259ff] text-white'
                          : 'bg-[#23233a]/50 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/70'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-1 bg-[#23233a]/50 border-2 border-white/20 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#a259ff] text-white'
                      : 'text-[#b0b0d0] hover:text-white'
                  }`}
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#a259ff] text-white'
                      : 'text-[#b0b0d0] hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <Card className="bg-gradient-to-r from-[#a259ff]/10 to-purple-600/10 border border-[#a259ff]/20">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Bot className="w-5 h-5 text-[#a259ff]" />
                <span>AI Task Suggestions</span>
                <Badge className="bg-[#a259ff]/20 text-[#a259ff] border-[#a259ff]/30">
                  Smart
                </Badge>
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
                  <div key={index} className="bg-[#23233a]/50 p-4 rounded-lg border-l-4 border-[#a259ff]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{suggestion.title}</h4>
                        <p className="text-sm text-[#b0b0d0] mt-1">{suggestion.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-[#b0b0d0]">{suggestion.time}</span>
                          <Badge className="bg-[#23233a]/50 text-[#b0b0d0] border-[#23233a]/30">
                            {suggestion.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          onClick={() => handleAddSuggestedTask(suggestion)}
                          variant="primary"
                          size="sm"
                          disabled={!currentUserId}
                        >
                          Add Task
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                        >
                          Dismiss
                        </Button>
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
                <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#b0b0d0]">Loading tasks...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="bg-red-900/20 border border-red-600/30 text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Error Loading Tasks</h3>
              <p className="text-red-300">{error}</p>
            </Card>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map(task => {
                const TypeIcon = getTypeIcon(task.type);
                return (
                  <Card key={task.id} className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                              <TypeIcon className="w-5 h-5 text-[#a259ff]" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">
                              {task.title}
                            </h3>
                            <Badge className={getStatusColor(task.status, task.completed)}>
                              {task.completed ? 'Completed' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                          </div>
                          
                          {task.description && (
                            <p className="text-[#b0b0d0] mb-3">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-[#b0b0d0]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                            {task.due_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{task.due_time}</span>
                              </div>
                            )}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag className="w-4 h-4" />
                                <span>{task.tags.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!task.completed && (
                            <Button
                              onClick={() => handleCompleteTask(task.id)}
                              variant="success"
                              size="sm"
                              icon={CheckCircle}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            onClick={() => handleEditTask(task)}
                            variant="secondary"
                            size="sm"
                            icon={Edit}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteTask(task.id)}
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 text-center py-12">
              <CheckSquare className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
              <p className="text-[#b0b0d0] mb-6">
                {activeFilter !== 'all' ? 'No tasks match the selected filter criteria' : 'Create your first task to get started'}
              </p>
              <Button
                onClick={handleCreateTask}
                variant="gradient"
                icon={Plus}
              >
                Create Task
              </Button>
            </Card>
          )}

          {/* Task Modal */}
          {showModal && (
            <TaskModal
              task={editingTask || undefined}
              onClose={() => {
                setShowModal(false);
                setEditingTask(null);
              }}
              onSave={handleSaveTask}
              isNew={!editingTask}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;