import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, FolderPlus, Users, Calendar, DollarSign, Target, AlertCircle, Bot, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { supabase } from '../../services/supabase';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: () => void;
  stages: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
}

const CreateDealModal: React.FC<CreateDealModalProps> = ({ 
  isOpen, 
  onClose, 
  onDealCreated,
  stages,
  companies,
  contacts
}) => {
  const { showToast } = useToastContext();
  const { user } = useAuth();
  const { openModal, closeModal } = useModal();

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    stage_id: '',
    probability: 10,
    expected_close_date: '',
    company_id: '',
    contact_id: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
    
    // Auto-update probability based on stage
    if (field === 'stage_id') {
      const stage = stages.find(s => s.id === value);
      if (stage) {
        // Set a default probability based on stage order
        const stageIndex = stages.findIndex(s => s.id === value);
        const probability = Math.min(100, (stageIndex + 1) * 25);
        setFormData(prev => ({ ...prev, probability }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }
    
    if (!formData.stage_id) {
      newErrors.stage_id = 'Stage is required';
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
      // Use the current user's ID from AuthContext
      const ownerId = user?.id || 1;

      const dealData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        value: parseFloat(formData.value),
        stage_id: parseInt(formData.stage_id) || null,
        probability: formData.probability,
        expected_close_date: formData.expected_close_date || null,
        company_id: formData.company_id ? parseInt(formData.company_id) : null,
        contact_id: formData.contact_id ? parseInt(formData.contact_id) : null,
        owner_id: ownerId
      };

      console.log('Creating deal with data:', dealData);

      // Try to insert with RLS bypass for development
      const { data, error } = await supabase
        .from('deals')
        .insert(dealData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        // If RLS error, try with different approach
        if (error.code === '42501') {
          showToast({ 
            type: 'error', 
            title: 'Permission Error', 
            description: 'Database permissions issue. Please check RLS policies.' 
          });
        } else if (error.code === '409') {
          showToast({ 
            type: 'error', 
            title: 'Conflict Error', 
            description: 'A deal with this information already exists. Please check your data.' 
          });
        } else {
          showToast({ 
            type: 'error', 
            title: 'Creation Failed', 
            description: error.message || 'Failed to create deal' 
          });
        }
        return;
      }

      showToast({ 
        type: 'success', 
        title: 'Deal Created', 
        description: 'Deal has been created successfully' 
      });
      
      onDealCreated();
    } catch (error: any) {
      console.error('Error creating deal:', error);
      showToast({ 
        type: 'error', 
        title: 'Creation Failed', 
        description: error.message || 'Failed to create deal' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      value: '',
      stage_id: '',
      probability: 10,
      expected_close_date: '',
      company_id: '',
      contact_id: '',
      priority: 'medium'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-[#a259ff]" />
              <span>Create New Deal</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Add a new sales opportunity to your pipeline
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Basic Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Deal Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.title ? 'border-[#ef4444]' : 'border-white/20'
                }`}
                placeholder="Enter deal title"
              />
              {errors.title && <p className="text-[#ef4444] text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="Describe the deal opportunity"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Deal Value *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b0b0d0]">$</span>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                      errors.value ? 'border-[#ef4444]' : 'border-white/20'
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.value && <p className="text-[#ef4444] text-sm mt-1">{errors.value}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Probability (%)
                </label>
                <input
                  type="number"
                  value={formData.probability}
                  onChange={(e) => handleInputChange('probability', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Pipeline Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Pipeline Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Stage *
              </label>
              <select
                value={formData.stage_id}
                onChange={(e) => handleInputChange('stage_id', e.target.value)}
                className={`w-full px-4 py-3 bg-[#23233a]/50 border-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.stage_id ? 'border-[#ef4444]' : 'border-white/20'
                }`}
              >
                <option value="">Select a stage</option>
                {(stages || []).map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
              {errors.stage_id && <p className="text-[#ef4444] text-sm mt-1">{errors.stage_id}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Company
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => handleInputChange('company_id', e.target.value)}
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                >
                  <option value="">Select a company</option>
                  {(companies || []).map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Contact
                </label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => handleInputChange('contact_id', e.target.value)}
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                >
                  <option value="">Select a contact</option>
                  {(contacts || []).map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Expected Close Date
              </label>
              <input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
                className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#23233a]/30">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              size="lg"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              icon={isSubmitting ? undefined : Save}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Deal</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateDealModal;