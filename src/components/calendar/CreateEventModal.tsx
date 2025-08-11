import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Calendar, Clock, User, Target, AlertCircle, Tag, CheckSquare, Phone, Mail, Bell, ArrowRight, Edit, MapPin } from 'lucide-react';
import { CalendarEventFormData } from '../../types/calendar';
import { supabase } from '../../services/supabase';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { useModal } from '../../contexts/ModalContext';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: CalendarEventFormData) => void;
  initialDate?: Date;
  isEditing?: boolean;
  initialData?: Partial<CalendarEventFormData>;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onEventCreated,
  initialDate,
  isEditing = false,
  initialData
}) => {
  const { showToast } = useToastContext();
  const { openModal, closeModal } = useModal();

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);
  
  // Initialize with current date/time if not provided
  const now = initialDate || new Date();
  const endTime = new Date(now);
  endTime.setHours(endTime.getHours() + 1);
  
  const [formData, setFormData] = useState<CalendarEventFormData>({
    title: '',
    description: '',
    start_date: now.toISOString().split('T')[0],
    start_time: now.toTimeString().substring(0, 5),
    end_date: now.toISOString().split('T')[0],
    end_time: endTime.toTimeString().substring(0, 5),
    location: '',
    event_type: 'meeting',
    attendees: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deals, setDeals] = useState<{id: string, title: string}[]>([]);
  const [contacts, setContacts] = useState<{id: string, name: string}[]>([]);
  const [tasks, setTasks] = useState<{id: string, title: string}[]>([]);
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  // Fetch related data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch deals
        const { data: dealsData } = await supabase
          .from('deals')
          .select('id, title')
          .order('title');
        
        if (dealsData) {
          setDeals(dealsData);
        }
        
        // Fetch tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('id, title')
          .order('title');
        
        if (tasksData) {
          setTasks(tasksData);
        }
        
        // Fetch contacts (if table exists)
        try {
          const { data: contactsData } = await supabase
            .from('contacts')
            .select('*');
          
          if (contactsData) {
            setContacts(contactsData);
          }
        } catch (error) {
          console.log('Contacts table may not exist yet');
        }
        
        // In a real app, we would fetch users from auth
        // For now, use mock data
        setUsers([
          { id: 'current-user', name: 'Janar Kuusk (You)' },
          { id: 'sarah-wilson', name: 'Sarah Wilson' },
          { id: 'mike-chen', name: 'Mike Chen' },
          { id: 'lisa-park', name: 'Lisa Park' }
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

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

  const toggleAttendee = (attendeeId: string) => {
    setFormData(prev => {
      if (prev.attendees.includes(attendeeId)) {
        return { ...prev, attendees: prev.attendees.filter(id => id !== attendeeId) };
      } else {
        return { ...prev, attendees: [...prev.attendees, attendeeId] };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }
    
    // Check if end time is after start time
    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
    
    if (endDateTime <= startDateTime) {
      newErrors.end_time = 'End time must be after start time';
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
      onEventCreated(formData);
      
      // Reset form if not editing
      if (!isEditing) {
        const now = new Date();
        const endTime = new Date(now);
        endTime.setHours(endTime.getHours() + 1);
        
        setFormData({
          title: '',
          description: '',
          start_date: now.toISOString().split('T')[0],
          start_time: now.toTimeString().substring(0, 5),
          end_date: now.toISOString().split('T')[0],
          end_time: endTime.toTimeString().substring(0, 5),
          location: '',
          event_type: 'meeting',
          attendees: []
        });
      }
      
      showToast({
        title: isEditing ? 'Event Updated' : 'Event Created',
        description: `${formData.title} has been ${isEditing ? 'updated' : 'created'} successfully`,
        type: 'success'
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting event:', error);
      showToast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} event`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <h3 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Event Title *
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
                placeholder="Enter event title..."
                className={`w-full px-4 py-3 bg-[#23233a]/50 border-2 ${
                  errors.title ? 'border-red-500' : 'border-white/20'
                } rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]`}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Event Type
            </label>
            <select
              value={formData.event_type}
              onChange={(e) => handleInputChange('event_type', e.target.value)}
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              disabled={isSubmitting}
            >
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="demo">Demo</option>
              <option value="task">Task</option>
              <option value="follow-up">Follow-up</option>
              <option value="internal">Internal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Event description..."
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              disabled={isSubmitting}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Start Date *
              </label>
              <div className="relative">
                {errors.start_date && (
                  <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.start_date}
                  </div>
                )}
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 ${
                    errors.start_date ? 'border-red-500' : 'border-white/20'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Start Time *
              </label>
              <div className="relative">
                {errors.start_time && (
                  <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.start_time}
                  </div>
                )}
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 ${
                    errors.start_time ? 'border-red-500' : 'border-white/20'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                End Date *
              </label>
              <div className="relative">
                {errors.end_date && (
                  <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.end_date}
                  </div>
                )}
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-secondary-700 border ${
                    errors.end_date ? 'border-red-500' : 'border-secondary-600'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                End Time *
              </label>
              <div className="relative">
                {errors.end_time && (
                  <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.end_time}
                  </div>
                )}
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-secondary-700 border ${
                    errors.end_time ? 'border-red-500' : 'border-secondary-600'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600`}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Location and Related Items */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Meeting room or address"
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Related Deal */}
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Related Deal
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <select
                  value={formData.related_deal_id || ''}
                  onChange={(e) => handleInputChange('related_deal_id', e.target.value || undefined)}
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

            {/* Related Task */}
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Related Task
              </label>
              <div className="relative">
                <CheckSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <select
                  value={formData.related_task_id || ''}
                  onChange={(e) => handleInputChange('related_task_id', e.target.value || undefined)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  disabled={isSubmitting}
                >
                  <option value="">None</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Related Contact */}
            {contacts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Related Contact
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <select
                    value={formData.related_contact_id || ''}
                    onChange={(e) => handleInputChange('related_contact_id', e.target.value || undefined)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    disabled={isSubmitting}
                  >
                    <option value="">None</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Attendees
            </label>
            <div className="space-y-2 mb-3">
              {users.map((user) => (
                <label key={user.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.attendees.includes(user.id)}
                    onChange={() => toggleAttendee(user.id)}
                    className="rounded border-secondary-600 bg-secondary-700 text-primary-600 focus:ring-primary-600"
                    disabled={isSubmitting}
                  />
                  <span className="text-secondary-300">
                    {user.name}
                  </span>
                </label>
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
                  <span>{isEditing ? 'Update Event' : 'Create Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateEventModal;