import React, { useState, useEffect } from 'react';
import { X, Plus, FolderPlus, Users, Calendar, DollarSign, Target, AlertCircle, Bot, Save } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { createClient } from '@supabase/supabase-js';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuru } from '../../contexts/GuruContext';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: (deal: any) => void;
  initialData?: any; // For editing existing deals
  isEditing?: boolean;
}

const CreateDealModal: React.FC<CreateDealModalProps> = ({ 
  isOpen, 
  onClose, 
  onDealCreated,
  initialData,
  isEditing = false
}) => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    contact: '',
    value: '',
    stage: 'lead',
    probability: 10,
    priority: 'medium' as 'low' | 'medium' | 'high',
    description: '',
    expectedCloseDate: '',
    teamMembers: [] as string[],
    industry: '',
    source: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
    tags: [] as string[]
  });

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load initial data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title || '',
        company: initialData.company || '',
        contact: initialData.contact || '',
        value: initialData.value?.toString() || '',
        stage: initialData.stage_id || 'lead',
        probability: initialData.probability || 10,
        priority: initialData.priority || 'medium',
        description: initialData.description || '',
        expectedCloseDate: initialData.expected_close_date || '',
        teamMembers: initialData.team_members || [],
        industry: initialData.industry || '',
        source: initialData.source || '',
        contactEmail: initialData.contactEmail || '',
        contactPhone: initialData.contactPhone || '',
        notes: initialData.notes || '',
        tags: initialData.tags || []
      });
    }
  }, [isEditing, initialData]);

  // Set up auto-save
  useEffect(() => {
    if (isDirty && isEditing) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 5000); // Auto-save after 5 seconds of inactivity
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [formData, isDirty, isEditing]);

  const stages = [
    { id: 'lead', name: 'Lead', probability: 10 },
    { id: 'qualified', name: 'Qualified', probability: 25 },
    { id: 'proposal', name: 'Proposal', probability: 50 },
    { id: 'negotiation', name: 'Negotiation', probability: 75 },
    { id: 'closed-won', name: 'Closed Won', probability: 100 }
  ];

  const teamMembers = [
    'Janar Kuusk',
    'Sarah Wilson',
    'Mike Chen',
    'Lisa Park',
    'David Brown'
  ];

  const industries = [
    'Technology',
    'Financial Services',
    'Healthcare',
    'Manufacturing',
    'Retail',
    'Education',
    'Other'
  ];

  const sources = [
    'Website',
    'Referral',
    'Cold Call',
    'LinkedIn',
    'Event',
    'Partner',
    'Other'
  ];

  const generateDealId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ST-${year}-${randomNum}`;
  };

  const createCloudFolder = async (dealId: string, dealTitle: string) => {
    setIsCreatingFolder(true);
    
    try {
      // Call the Supabase Edge Function to create the folder
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Supabase URL not configured");
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-deal-folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ dealId, dealName: dealTitle })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create folder');
      }
      
      const data = await response.json();
      
      if (data.mock) {
        console.warn('Using mock folder URL - Google Drive API not configured');
      }
      
      return data.folderUrl;
    } catch (error) {
      console.error('Error creating cloud folder:', error);
      showToast({
        type: 'warning',
        title: 'Folder Creation Issue',
        message: 'Could not create cloud folder. Using fallback URL.'
      });
      
      // Fallback to a mock folder URL
      return `https://drive.google.com/drive/folders/${dealId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Auto-update probability based on stage
    if (field === 'stage') {
      const stage = stages.find(s => s.id === value);
      if (stage) {
        setFormData(prev => ({ ...prev, probability: stage.probability }));
      }
    }
  };

  const toggleTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(member)
        ? prev.teamMembers.filter(m => m !== member)
        : [...prev.teamMembers, member]
    }));
    setIsDirty(true);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Primary contact is required';
    }
    
    if (!formData.value.trim()) {
      newErrors.value = 'Deal value is required';
    } else if (isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
      newErrors.value = 'Deal value must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAutoSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // In a real app, this would update the deal in the database
      console.log('Auto-saving deal:', formData);
      
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Error auto-saving deal:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dealId = isEditing && initialData?.deal_id ? initialData.deal_id : generateDealId();
      
      // Create cloud folder if not editing
      let driveUrl = initialData?.drive_url;
      if (!isEditing) {
        driveUrl = await createCloudFolder(dealId, formData.title);
      }
      
      // Prepare deal data
      const dealData = {
        deal_id: dealId,
        title: formData.title,
        company: formData.company,
        contact: formData.contact,
        value: parseInt(formData.value) || 0,
        stage_id: formData.stage,
        probability: formData.probability,
        priority: formData.priority,
        description: formData.description,
        expected_close_date: formData.expectedCloseDate || null,
        team_members: formData.teamMembers,
        drive_url: driveUrl,
        industry: formData.industry,
        source: formData.source,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        notes: formData.notes,
        tags: formData.tags
      };

      onDealCreated(dealData);
      
      showToast({
        type: 'success',
        title: isEditing ? 'Deal Updated' : 'Deal Created',
        message: `${formData.title} has been ${isEditing ? 'updated' : 'created'} successfully.`
      });
      
      onClose();
    } catch (err) {
      console.error('Error creating/updating deal:', err);
      showToast({
        type: 'error',
        title: isEditing ? 'Update Failed' : 'Creation Failed',
        message: `Failed to ${isEditing ? 'update' : 'create'} deal. Please try again.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div>
            <h3 className="text-xl font-semibold text-white">{isEditing ? 'Edit Deal' : 'Create New Deal'}</h3>
            <p className="text-secondary-400 text-sm mt-1">
              {isEditing 
                ? 'Update deal information and settings' 
                : 'A unique deal ID and cloud folder will be automatically created'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openGuru}
              className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
              title="Ask Guru for help"
            >
              <Bot className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
              disabled={isSubmitting || isCreatingFolder}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Auto-save indicator */}
          {isEditing && (
            <div className="flex items-center justify-end text-xs text-secondary-500">
              {isDirty ? (
                <span>Unsaved changes</span>
              ) : lastSaved ? (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              ) : null}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Deal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Deal Title *
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
                    placeholder="e.g., Enterprise Software Package"
                    className={`w-full px-4 py-3 bg-secondary-700 border ${
                      errors.title ? 'border-red-500' : 'border-secondary-600'
                    } rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600`}
                    disabled={isSubmitting || isCreatingFolder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Company *
                </label>
                <div className="relative">
                  {errors.company && (
                    <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.company}
                    </div>
                  )}
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g., TechCorp Inc."
                    className={`w-full px-4 py-3 bg-secondary-700 border ${
                      errors.company ? 'border-red-500' : 'border-secondary-600'
                    } rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600`}
                    disabled={isSubmitting || isCreatingFolder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Primary Contact *
                </label>
                <div className="relative">
                  {errors.contact && (
                    <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.contact}
                    </div>
                  )}
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder="e.g., John Smith"
                    className={`w-full px-4 py-3 bg-secondary-700 border ${
                      errors.contact ? 'border-red-500' : 'border-secondary-600'
                    } rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600`}
                    disabled={isSubmitting || isCreatingFolder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Deal Value *
                </label>
                <div className="relative">
                  {errors.value && (
                    <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.value}
                    </div>
                  )}
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    placeholder="75000"
                    className={`w-full pl-10 pr-4 py-3 bg-secondary-700 border ${
                      errors.value ? 'border-red-500' : 'border-secondary-600'
                    } rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600`}
                    disabled={isSubmitting || isCreatingFolder}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Contact Information */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Contact Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="john.smith@example.com"
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  disabled={isSubmitting || isCreatingFolder}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  disabled={isSubmitting || isCreatingFolder}
                />
              </div>
            </div>
          </div>

          {/* Deal Classification */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Deal Classification</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  disabled={isSubmitting || isCreatingFolder}
                >
                  <option value="">Select industry...</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  disabled={isSubmitting || isCreatingFolder}
                >
                  <option value="">Select source...</option>
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
                  disabled={isSubmitting || isCreatingFolder}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stage and Probability */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Deal Stage</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  disabled={isSubmitting || isCreatingFolder}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
                >
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name} ({stage.probability}% probability)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Win Probability
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => handleInputChange('probability', parseInt(e.target.value))}
                    disabled={isSubmitting || isCreatingFolder}
                    className="w-full pl-10 pr-8 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expected Close Date */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Expected Close Date
            </label>
            <div className="relative max-w-md">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                disabled={isSubmitting || isCreatingFolder}
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Team Members
            </label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  key={member}
                  type="button"
                  onClick={() => toggleTeamMember(member)}
                  disabled={isSubmitting || isCreatingFolder}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    formData.teamMembers.includes(member)
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                  }`}
                >
                  {member}
                </button>
              ))}
            </div>
            {formData.teamMembers.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-secondary-400">
                  Selected: {formData.teamMembers.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about this deal..."
              disabled={isSubmitting || isCreatingFolder}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this deal..."
              disabled={isSubmitting || isCreatingFolder}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
            />
          </div>

          {/* Cloud Folder Info */}
          {!isEditing && (
            <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <FolderPlus className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-200">Automatic Cloud Folder</h4>
                  <p className="text-blue-300/80 text-sm mt-1">
                    A Google Drive folder will be automatically created with the format: 
                    "Deal ST-2025-001 – Enterprise Software Package"
                  </p>
                  {isCreatingFolder && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-blue-300">Creating cloud folder...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-secondary-700">
            <div className="text-sm text-secondary-400">
              {isEditing 
                ? 'All changes are automatically saved'
                : 'Deal ID will be auto-generated (e.g., ST-2025-001)'}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting || isCreatingFolder}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting || isCreatingFolder}
              >
                {isSubmitting || isCreatingFolder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    {isEditing ? <Save className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
                    <span>{isEditing ? 'Update Deal' : 'Create Deal'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealModal;