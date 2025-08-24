import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target, 
  Calendar, 
  Flag, 
  Phone, 
  Mail, 
  Video, 
  Circle,
  Search,
  Edit,
  Trash2,
  Eye,
  User,
  Building2,
  Tag,
  CalendarDays,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  FileText
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

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'Open' | 'Completed' | 'Overdue' | 'In Progress';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'General' | 'Call' | 'Email' | 'Meeting' | 'Follow-up';
  tags?: string[];
  created_at: string;
}

export default function Tasks() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'created_at' | 'priority'>('due_date');
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium' as const,
    category: 'General' as const,
    notes: ''
  });

  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium' as const,
    category: 'General' as const,
    notes: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  // Advanced filtering and sorting
  useEffect(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task => {
        const title = task.title.toLowerCase();
        const description = task.description?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        return title.includes(searchLower) || description.includes(searchLower);
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      switch (statusFilter) {
        case 'open':
          filtered = filtered.filter(task => ['Open', 'In Progress'].includes(task.status));
          break;
        case 'overdue':
          filtered = filtered.filter(task => 
            task.status !== 'Completed' && 
            task.due_date && 
            task.due_date < today
          );
          break;
        case 'completed':
          filtered = filtered.filter(task => task.status === 'Completed');
          break;
        case 'due_today':
          filtered = filtered.filter(task => 
            task.status !== 'Completed' && 
            task.due_date === today
          );
          break;
        case 'due_this_week':
          filtered = filtered.filter(task => 
            task.status !== 'Completed' && 
            task.due_date && 
            task.due_date >= today && 
            task.due_date <= weekFromNow
          );
          break;
      }
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'due_date':
          aValue = a.due_date || '9999-12-31';
          bValue = b.due_date || '9999-12-31';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          aValue = a.due_date || '9999-12-31';
          bValue = b.due_date || '9999-12-31';
      }

      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
      
      if (error) {
        console.error('Error loading tasks:', error);
        setTasks(getDummyTasks());
        showToast({ title: 'Using sample tasks data', type: 'info' });
      } else {
        const updatedTasks = updateOverdueStatus(data || []);
        setTasks(updatedTasks.length > 0 ? updatedTasks : getDummyTasks());
      }
    } catch (error) {
      setTasks(getDummyTasks());
      showToast({ title: 'Error loading tasks', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOverdueStatus = (tasks: Task[]): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.map(task => {
      if (task.status !== 'Completed' && task.due_date && task.due_date < today) {
        return { ...task, status: 'Overdue' as const };
      }
      return task;
    });
  };

  const getDummyTasks = (): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return [
      {
        id: '1',
        title: 'Follow up with TechCorp on CRM proposal',
        description: 'Call Sarah Johnson to discuss the proposal',
        due_date: tomorrow,
        status: 'Open',
        priority: 'High',
        category: 'Call',
        tags: ['Follow-up', 'CRM'],
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Send contract to GreenEnergy',
        description: 'Email contract documents for signature',
        due_date: today,
        status: 'Open',
        priority: 'High',
        category: 'Email',
        tags: ['Contract'],
        created_at: '2024-01-12T09:15:00Z'
      },
      {
        id: '3',
        title: 'Complete onboarding for RetailMax',
        description: 'Finalize the onboarding process',
        due_date: lastWeek,
        status: 'Overdue',
        priority: 'Critical',
        category: 'General',
        tags: ['Onboarding'],
        created_at: '2024-01-05T16:45:00Z'
      },
      {
        id: '4',
        title: 'Quarterly business review',
        description: 'Completed QBR meeting',
        due_date: lastWeek,
        status: 'Completed',
        priority: 'Medium',
        category: 'Meeting',
        tags: ['QBR'],
        created_at: '2024-01-03T08:00:00Z'
      }
    ];
  };

  const addTask = async () => {
    if (!newTask.title) return;

    try {
      const { error } = await supabase.from('tasks').insert({
        ...newTask,
        org_id: (user as any)?.org_id || 'temp-org',
        assigned_to: (user as any)?.email || 'current_user',
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error creating task:', error);
        showToast({ title: 'Error creating task', type: 'error' });
        return;
      }

      showToast({ title: 'Task created successfully!', type: 'success' });
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', due_date: '', priority: 'Medium', category: 'General', notes: '' });
      loadTasks();
    } catch (error) {
      showToast({ title: 'Error creating task', type: 'error' });
    }
  };

  const updateTask = async () => {
    if (!selectedTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...editTask,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTask.id);

      if (error) {
        console.error('Error updating task:', error);
        showToast({ title: 'Error updating task', type: 'error' });
        return;
      }

      showToast({ title: 'Task updated successfully!', type: 'success' });
      setShowEditModal(false);
      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      showToast({ title: 'Error updating task', type: 'error' });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        showToast({ title: 'Error deleting task', type: 'error' });
        return;
      }

      showToast({ title: 'Task deleted successfully!', type: 'success' });
      loadTasks();
    } catch (error) {
      showToast({ title: 'Error deleting task', type: 'error' });
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedTasks.length === 0) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          completed_at: status === 'Completed' ? new Date().toISOString() : null
        })
        .in('id', selectedTasks);

      if (error) {
        console.error('Error bulk updating tasks:', error);
        showToast({ title: 'Error updating tasks', type: 'error' });
        return;
      }

      showToast({ title: `${selectedTasks.length} tasks updated successfully!`, type: 'success' });
      setSelectedTasks([]);
      loadTasks();
    } catch (error) {
      showToast({ title: 'Error updating tasks', type: 'error' });
    }
  };

  const bulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', selectedTasks);

      if (error) {
        console.error('Error bulk deleting tasks:', error);
        showToast({ title: 'Error deleting tasks', type: 'error' });
        return;
      }

      showToast({ title: `${selectedTasks.length} tasks deleted successfully!`, type: 'success' });
      setSelectedTasks([]);
      loadTasks();
    } catch (error) {
      showToast({ title: 'Error deleting tasks', type: 'error' });
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditTask({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority,
      category: task.category,
      notes: ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (task: Task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  const navigateToRelated = (type: string, id: string) => {
    switch (type) {
      case 'deal':
        navigate(`/deals`); // Would navigate to specific deal if ID available
        break;
      case 'contact':
        navigate(`/contacts/${id}`);
        break;
      case 'organization':
        navigate(`/organizations/${id}`);
        break;
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    setSelectedTasks(filteredTasks.map(task => task.id));
  };

  const clearSelection = () => {
    setSelectedTasks([]);
  };

  const toggleComplete = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Open' : 'Completed';
    
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
      
      if (error) {
        console.error('Error updating task:', error);
        showToast({ title: 'Error updating task', type: 'error' });
        return;
      }

      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus as any } : t));
      showToast({ title: `Task ${newStatus.toLowerCase()}!`, type: 'success' });
    } catch (error) {
      showToast({ title: 'Error updating task', type: 'error' });
    }
  };

  // This is now handled by the useEffect above

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Call': return <Phone className="h-4 w-4" />;
      case 'Email': return <Mail className="h-4 w-4" />;
      case 'Meeting': return <Video className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'Completed' || !task.due_date) return false;
    return task.due_date < new Date().toISOString().split('T')[0];
  };

  const isDueToday = (task: Task) => {
    if (task.status === 'Completed' || !task.due_date) return false;
    return task.due_date === new Date().toISOString().split('T')[0];
  };

  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => ['Open', 'In Progress'].includes(t.status)).length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  if (isLoading) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a259ff] mx-auto"></div>
            <p className="mt-4 text-white/80">Loading tasks...</p>
          </div>
        </div>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Tasks & Activities"
        subtitle="Manage your tasks and track your productivity"
        logoGradient={true}
        actions={
          <BrandButton variant="green" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </BrandButton>
        }
      >
        {/* Stats */}
        <BrandStatsGrid>
          <BrandStatCard icon={<Target className="h-6 w-6 text-white" />} title="Total Tasks" value={totalTasks} borderGradient="primary" />
          <BrandStatCard icon={<Clock className="h-6 w-6 text-white" />} title="Open Tasks" value={openTasks} borderGradient="blue" />
          <BrandStatCard icon={<AlertTriangle className="h-6 w-6 text-white" />} title="Overdue" value={overdueTasks} borderGradient="red" />
          <BrandStatCard icon={<CheckCircle className="h-6 w-6 text-white" />} title="Completed" value={completedTasks} borderGradient="green" />
        </BrandStatsGrid>

        {/* Advanced Filters and Search */}
        <BrandCard variant="glass" borderGradient="secondary" className="mx-5 mb-5 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">Search Tasks</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <BrandInput
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
              <BrandDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Tasks' },
                  { value: 'open', label: 'Open & In Progress' },
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'due_today', label: 'Due Today' },
                  { value: 'due_this_week', label: 'Due This Week' }
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

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
              <BrandDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'General', label: 'General' },
                  { value: 'Call', label: 'Call' },
                  { value: 'Email', label: 'Email' },
                  { value: 'Meeting', label: 'Meeting' },
                  { value: 'Follow-up', label: 'Follow-up' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Sort By</label>
              <BrandDropdown
                value={sortBy}
                onChange={(value) => setSortBy(value as any)}
                options={[
                  { value: 'due_date', label: 'Due Date' },
                  { value: 'created_at', label: 'Created Date' },
                  { value: 'priority', label: 'Priority' }
                ]}
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTasks.length > 0 && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <BrandButton variant="green" onClick={() => bulkUpdateStatus('Completed')}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </BrandButton>
                  <BrandButton variant="blue" onClick={() => bulkUpdateStatus('Open')}>
                    <Circle className="w-4 h-4 mr-1" />
                    Reopen
                  </BrandButton>
                  <BrandButton variant="red" onClick={bulkDelete}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </BrandButton>
                  <BrandButton variant="secondary" onClick={clearSelection}>
                    Clear
                  </BrandButton>
                </div>
              </div>
            </div>
          )}
        </BrandCard>

        {/* Tasks List */}
        <BrandCard variant="glass" borderGradient="primary" className="mx-5 mb-5">
          <div className="p-6">
            {/* Select All Header */}
            {filteredTasks.length > 0 && (
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={selectedTasks.length === filteredTasks.length ? clearSelection : selectAllTasks}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedTasks.length === filteredTasks.length ? 'bg-purple-500 border-purple-500' : 'border-white/30'
                    }`}
                  >
                    {selectedTasks.length === filteredTasks.length && <CheckCircle className="w-4 h-4 text-white" />}
                  </button>
                  <span className="text-white/80 text-sm">
                    {selectedTasks.length > 0 ? `${selectedTasks.length} selected` : 'Select all'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BrandButton variant="green" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    New Task
                  </BrandButton>
                  <BrandButton variant="blue">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </BrandButton>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:bg-white/10 ${
                    task.status === 'Completed' 
                      ? 'bg-white/5 border-white/10 opacity-75' 
                      : isOverdue(task)
                      ? 'bg-red-500/10 border-red-500/30'
                      : isDueToday(task)
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Task Completion Checkbox */}
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.status === 'Completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      {task.status === 'Completed' && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </button>

                    {/* Selection checkbox (smaller, right side) */}
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="mt-1 w-4 h-4 text-purple-600 bg-transparent border-2 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
                    />

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium text-white cursor-pointer hover:text-purple-400 transition-colors ${
                          task.status === 'Completed' ? 'line-through opacity-75' : ''
                        }`} onClick={() => openViewModal(task)}>
                          {task.title}
                        </h4>
                        
                        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                          {/* Priority Flag */}
                          <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                          
                          {/* Category Icon */}
                          <div className="text-white/60">
                            {getCategoryIcon(task.category)}
                          </div>
                          
                          {/* Status Badge */}
                          <BrandBadge variant="default">{task.status}</BrandBadge>
                        </div>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className={`text-sm text-white/70 mb-2 ${
                          task.status === 'Completed' ? 'opacity-75' : ''
                        }`}>
                          {task.description}
                        </p>
                      )}

                      {/* Task Meta Information */}
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <div className="flex items-center space-x-4">
                          {/* Due Date */}
                          {task.due_date && (
                            <div className={`flex items-center ${
                              isOverdue(task) && task.status !== 'Completed' 
                                ? 'text-red-400 font-medium' 
                                : isDueToday(task) && task.status !== 'Completed'
                                ? 'text-yellow-400 font-medium'
                                : ''
                            }`}>
                              <CalendarDays className="w-3 h-3 mr-1" />
                              {new Date(task.due_date).toLocaleDateString()}
                              {isOverdue(task) && task.status !== 'Completed' && (
                                <span className="ml-1 text-red-400 font-bold">OVERDUE</span>
                              )}
                              {isDueToday(task) && task.status !== 'Completed' && (
                                <span className="ml-1 text-yellow-400 font-bold">DUE TODAY</span>
                              )}
                            </div>
                          )}

                          {/* Category */}
                          <div className="flex items-center">
                            {getCategoryIcon(task.category)}
                            <span className="ml-1">{task.category}</span>
                          </div>

                          {/* Priority */}
                          <div className={`flex items-center ${getPriorityColor(task.priority)}`}>
                            <Flag className="w-3 h-3 mr-1" />
                            <span>{task.priority}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openViewModal(task)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Task"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                            title="Edit Task"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Tag className="w-3 h-3 text-white/40" />
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag, index) => (
                              <BrandBadge key={index} variant="default" size="sm">
                                {tag}
                              </BrandBadge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
                  <BrandButton onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Task
                  </BrandButton>
                </div>
              )}
            </div>
          </div>
        </BrandCard>

        {/* Create Task Modal */}
        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
          <div className="p-8 max-w-3xl w-full">
            <h2 className="text-xl font-semibold mb-6 text-white">Create New Task</h2>
            
            <div className="space-y-4">
              <BrandInput
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
              
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-white/50"
              />
              
              <div className="grid grid-cols-3 gap-4">
                <BrandInput
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
                
                <BrandDropdown
                  value={newTask.priority}
                  onChange={(value) => setNewTask(prev => ({ ...prev, priority: value as any }))}
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                    { value: 'Critical', label: 'Critical' }
                  ]}
                />
                
                <BrandDropdown
                  value={newTask.category}
                  onChange={(value) => setNewTask(prev => ({ ...prev, category: value as any }))}
                  options={[
                    { value: 'General', label: 'General' },
                    { value: 'Call', label: 'Call' },
                    { value: 'Email', label: 'Email' },
                    { value: 'Meeting', label: 'Meeting' },
                    { value: 'Follow-up', label: 'Follow-up' }
                  ]}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <BrandButton variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</BrandButton>
              <BrandButton onClick={addTask}>Create Task</BrandButton>
            </div>
          </div>
        </Modal>

        {/* Edit Task Modal */}
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)} size="2xl">
          <div className="p-8 max-w-4xl w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Edit Task</h2>
              <p className="text-white/80">Update task details and progress</p>
            </div>
            
            <div className="space-y-4">
              <BrandInput
                placeholder="Task title"
                value={editTask.title}
                onChange={(e) => setEditTask(prev => ({ ...prev, title: e.target.value }))}
              />
              
              <textarea
                placeholder="Description"
                value={editTask.description}
                onChange={(e) => setEditTask(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-white/50"
              />
              
              <div className="grid grid-cols-3 gap-4">
                <BrandInput
                  type="date"
                  value={editTask.due_date}
                  onChange={(e) => setEditTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
                
                <BrandDropdown
                  value={editTask.priority}
                  onChange={(value) => setEditTask(prev => ({ ...prev, priority: value as any }))}
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                    { value: 'Critical', label: 'Critical' }
                  ]}
                />
                
                <BrandDropdown
                  value={editTask.category}
                  onChange={(value) => setEditTask(prev => ({ ...prev, category: value as any }))}
                  options={[
                    { value: 'General', label: 'General' },
                    { value: 'Call', label: 'Call' },
                    { value: 'Email', label: 'Email' },
                    { value: 'Meeting', label: 'Meeting' },
                    { value: 'Follow-up', label: 'Follow-up' }
                  ]}
                />
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={editTask.notes}
                onChange={(e) => setEditTask(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-white/50"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <BrandButton variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</BrandButton>
              <BrandButton onClick={updateTask}>Update Task</BrandButton>
            </div>

          </div>
        </Modal>

        {/* View Task Modal */}
        <Modal open={showViewModal} onClose={() => setShowViewModal(false)} size="2xl">
          {selectedTask && (
            <div className="p-8 max-w-4xl w-full space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedTask.title}</h2>
                  <div className="flex items-center space-x-4">
                    <BrandBadge variant="default">{selectedTask.status}</BrandBadge>
                    <div className={`flex items-center ${getPriorityColor(selectedTask.priority)}`}>
                      <Flag className="w-4 h-4 mr-1" />
                      <span className="font-medium">{selectedTask.priority}</span>
                    </div>
                    <div className="flex items-center text-white/60">
                      {getCategoryIcon(selectedTask.category)}
                      <span className="ml-1">{selectedTask.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <BrandButton 
                    variant="purple" 
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedTask);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </BrandButton>
                  <BrandButton 
                    variant="red" 
                    onClick={() => {
                      setShowViewModal(false);
                      deleteTask(selectedTask.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </BrandButton>
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-white/80 bg-white/5 p-4 rounded-lg border border-white/10">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BrandCard variant="glass" borderGradient="blue" className="p-4">
                  <div className="flex items-center mb-2">
                    <CalendarDays className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="font-medium text-white">Due Date</span>
                  </div>
                  <p className={`text-sm ${
                    isOverdue(selectedTask) && selectedTask.status !== 'Completed'
                      ? 'text-red-400 font-bold'
                      : isDueToday(selectedTask) && selectedTask.status !== 'Completed'
                      ? 'text-yellow-400 font-bold'
                      : 'text-white/80'
                  }`}>
                    {selectedTask.due_date 
                      ? new Date(selectedTask.due_date).toLocaleDateString() 
                      : 'No due date set'
                    }
                    {isOverdue(selectedTask) && selectedTask.status !== 'Completed' && (
                      <span className="block text-red-400 font-bold">OVERDUE</span>
                    )}
                    {isDueToday(selectedTask) && selectedTask.status !== 'Completed' && (
                      <span className="block text-yellow-400 font-bold">DUE TODAY</span>
                    )}
                  </p>
                </BrandCard>

                <BrandCard variant="glass" borderGradient="green" className="p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-green-400 mr-2" />
                    <span className="font-medium text-white">Created</span>
                  </div>
                  <p className="text-sm text-white/80">
                    {new Date(selectedTask.created_at).toLocaleDateString()}
                  </p>
                </BrandCard>

                <BrandCard variant="glass" borderGradient="purple" className="p-4">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-purple-400 mr-2" />
                    <span className="font-medium text-white">Assigned</span>
                  </div>
                  <p className="text-sm text-white/80">
                    {selectedTask.assigned_to || 'Unassigned'}
                  </p>
                </BrandCard>
              </div>

              {/* Related Entities */}
              {(selectedTask.related_contact_id || selectedTask.related_deal_id || selectedTask.related_organization_id) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Related Items</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.related_contact_id && (
                      <BrandButton 
                        variant="blue" 
                        onClick={() => navigateToRelated('contact', selectedTask.related_contact_id!)}
                      >
                        <User className="w-4 h-4 mr-1" />
                        View Contact
                      </BrandButton>
                    )}
                    {selectedTask.related_deal_id && (
                      <BrandButton 
                        variant="green" 
                        onClick={() => navigateToRelated('deal', selectedTask.related_deal_id!)}
                      >
                        <Target className="w-4 h-4 mr-1" />
                        View Deal
                      </BrandButton>
                    )}
                    {selectedTask.related_organization_id && (
                      <BrandButton 
                        variant="purple" 
                        onClick={() => navigateToRelated('organization', selectedTask.related_organization_id!)}
                      >
                        <Building2 className="w-4 h-4 mr-1" />
                        View Organization
                      </BrandButton>
                    )}
                  </div>
                </div>
              )}

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <BrandBadge key={index} variant="default" size="sm">
                        {tag}
                      </BrandBadge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <BrandButton variant="secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </BrandButton>
                <BrandButton 
                  variant={selectedTask.status === 'Completed' ? 'blue' : 'green'}
                  onClick={() => {
                    toggleComplete(selectedTask);
                    setShowViewModal(false);
                  }}
                >
                  {selectedTask.status === 'Completed' ? (
                    <>
                      <Circle className="w-4 h-4 mr-1" />
                      Mark Open
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Complete
                    </>
                  )}
                </BrandButton>
              </div>
            </div>
          )}
        </Modal>
      </BrandPageLayout>
    </BrandBackground>
  );
}

