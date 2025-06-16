import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, User, Target, AlertCircle, Tag, CheckSquare, Phone, Mail, Bell, ArrowRight, Edit, Users } from 'lucide-react';
import { TaskFormData } from '../../types/task';
import { createClient } from '@supabase/supabase-js';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: TaskFormData) => void;
  currentUserId: string | null;
  initialData?: Partial<TaskFormData>;
  isEditing?: boolean;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onTaskCreated,
  currentUserId,
  initialData,
  isEditing = false
}) => {
  const { showToast } = useToastContext();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '',
    type: 'task',
    priority: 'medium',
    assigned_to: currentUserId || '',
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deals, setDeals] = useState<{id: string, title: string}[]>([]);
  const [contacts, setContacts] = useState<{id: string, name: string}[]>([]);
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    } else if (currentUserId) {
      setFormData(prev => ({
        ...prev,
        assigned_to: currentUserId
      }));
    }
  }, [initialData, currentUserId]);

  // Fetch deals, contacts, and users from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch deals
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('id, title')
          .order('title');
        
        if (dealsError) throw dealsError;
        
        if (dealsData) {
          setDeals(dealsData);
        }
        
        // Fetch contacts
        try {
          const { data: contactsData, error: contactsError } = await supabase
            .from('contacts')
            .select('id, name')
            .order('name');
          
          if (contactsError) throw contactsError;
          
          if (contactsData) {
            setContacts(contactsData);
          }
        } catch (error) {
          console.log('Contacts table may not exist yet');
        }
        
        // Fetch users from user_profiles
        try {
          const { data: usersData, error: usersError } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, email')
            .order('first_name');
          
          if (usersError) throw usersError;
          
          if (usersData && usersData.length > 0) {
            const formattedUsers = usersData.map(user => ({
              id: user.id,
              name: user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}${user.id === currentUserId ? ' (You)' : ''}`
                : user.email + (user.id === currentUserId ? ' (You)' : '')
            }));
            setUsers(formattedUsers);
          } else {
            // Fallback if no users found
            if (currentUserId) {
              setUsers([{ id: currentUserId, name: 'You' }]);
            }
          }
        } catch (error) {
          console.log('User profiles table may not exist yet, using fallback');
          // Fallback to current user
          if (currentUserId) {
            setUsers([{ id: currentUserId, name: 'You' }]);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, currentUserId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
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

  const validateForm = (): boolean => {
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
      // Prepare task data
      const taskData: TaskFormData = {
        ...formData,
        // Set status to completed if editing a completed task
        status: initialData?.status === 'completed' ? 'completed' : 'pending'
      };
      
      await onTaskCreated(taskData);
      
      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          title: '',
          description: '',
          due_date: new Date().toISOString().split('T')[0],
          due_time: '',
          type: 'task',
          priority: 'medium',
          assigned_to: currentUserId || '',
          tags: []
        });
      }
      
      showToast({
        title: isEditing ? 'Task Updated' : 'Task Created',
        description: `${formData.title} has been ${isEditing ? 'updated' : 'created'} successfully`,
        type: 'success'
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
      showToast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} task`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'meeting':
        return <Users className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'follow-up':
        return <ArrowRight className="w-4 h-4" />;
      case 'reminder':
        return <Bell className="w-4 h-4" />;
      default:
        return <CheckSquare className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Task Title *
            </label>
            <div className="relative">
              {errors.title && (
                <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.title}
                </div>
              )}
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title..."
                className={`w-full px-4 py-3 bg-secondary-700 border ${
                  errors.title ? 'border-red-500' : 'border-secondary-600'
                } rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600`}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the task..."
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={isSubmitting}
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Task Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['task', 'call', 'meeting', 'email', 'follow-up', 'reminder'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange('type', type)}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border ${
                    formData.type === type
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-secondary-700 border-secondary-600 text-secondary-300 hover:bg-secondary-600'
                  } transition-colors`}
                  disabled={isSubmitting}
                >
                  {getTypeIcon(type)}
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Due Date *
              </label>
              <div className="relative">
                {errors.due_date && (
                  <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.due_date}
                  </div>
                )}
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-secondary-700 border ${
                    errors.due_date ? 'border-red-500' : 'border-secondary-600'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Due Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => handleInputChange('due_time', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => handleInputChange('priority', priority)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors capitalize ${
                    formData.priority === priority
                      ? priority === 'urgent' || priority === 'high'
                        ? 'bg-red-600 text-white'
                        : priority === 'medium'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-green-600 text-white'
                      : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                  }`}
                  disabled={isSubmitting}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Assign To
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <select
                value={formData.assigned_to}
                onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={isSubmitting}
              >
                <option value="">Select assignee...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Related Deal */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Related Deal (Optional)
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <select
                value={formData.deal_id || ''}
                onChange={(e) => handleInputChange('deal_id', e.target.value || undefined)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={isSubmitting}
              >
                <option value="">Select a deal...</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Related Contact */}
          {contacts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Related Contact (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <select
                  value={formData.contact_id || ''}
                  onChange={(e) => handleInputChange('contact_id', e.target.value || undefined)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  disabled={isSubmitting}
                >
                  <option value="">Select a contact...</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn-secondary px-3 py-2"
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-400"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4 border-t border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  {isEditing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isEditing ? 'Update Task' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;