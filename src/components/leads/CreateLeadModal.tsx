import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, User, Building, Mail, Phone, Globe, Tag, DollarSign } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { supabase } from '../../services/supabase';
import { useToastContext } from '../../contexts/ToastContext';
import { useModal } from '../../contexts/ModalContext';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (lead: any) => void;
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose, onLeadCreated }) => {
  const { showToast } = useToastContext();
  const { openModal, closeModal } = useModal();

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    phone: '',
    source: 'manual' as const,
    industry: '',
    company_size: '',
    website: '',
    linkedin_url: '',
    deal_value_estimate: '',
    notes: '',
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sources = [
    { value: 'website', label: 'Website Form', icon: '🌐' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'referral', label: 'Referral', icon: '👥' },
    { value: 'cold-email', label: 'Cold Email', icon: '📧' },
    { value: 'demo-request', label: 'Demo Request', icon: '🎯' },
    { value: 'import', label: 'Import', icon: '📥' },
    { value: 'manual', label: 'Manual Entry', icon: '✏️' }
  ];

  const industries = [
    'Technology', 'SaaS', 'Financial Services', 'Healthcare', 'Manufacturing',
    'Retail', 'Education', 'Real Estate', 'Consulting', 'Other'
  ];

  const companySizes = [
    'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 
    'Large (201-1000)', 'Enterprise (1000+)'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare lead data for Supabase
      const leadData = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        position: formData.position || null,
        phone: formData.phone || null,
        source: formData.source,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        website: formData.website || null,
        linkedin_url: formData.linkedin_url || null,
        deal_value_estimate: formData.deal_value_estimate ? parseInt(formData.deal_value_estimate) : null,
        notes: formData.notes || null,
        tags: formData.tags,
        created_at: new Date().toISOString(),
        created_by: null // In a real app, this would be the current user's ID
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select();

      if (error) throw error;

      // Call the onLeadCreated callback with the created lead
      if (data && data.length > 0) {
        onLeadCreated(data[0]);
      }

      // Show success message
      showToast({
        type: 'success',
        title: 'Lead Created',
        description: `${formData.name} has been added to your leads.`
      });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        company: '',
        position: '',
        phone: '',
        source: 'manual',
        industry: '',
        company_size: '',
        website: '',
        linkedin_url: '',
        deal_value_estimate: '',
        notes: '',
        tags: []
      });
      
      onClose();
    } catch (err) {
      console.error('Error creating lead:', err);
      showToast({
        type: 'error',
        title: 'Creation Failed',
        description: 'Failed to create lead. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div>
            <h3 className="text-xl font-semibold text-white">Add New Lead</h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Create a new lead record to track potential opportunities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Contact Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Sales Manager"
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Company Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Acme Corporation"
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  disabled={isSubmitting}
                >
                  <option value="">Select industry...</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Company Size
                </label>
                <select
                  value={formData.company_size}
                  onChange={(e) => handleInputChange('company_size', e.target.value)}
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  disabled={isSubmitting}
                >
                  <option value="">Select size...</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://company.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div>
            <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>Lead Details</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Lead Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  disabled={isSubmitting}
                >
                  {sources.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.icon} {source.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Estimated Deal Value
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                  <input
                    type="number"
                    value={formData.deal_value_estimate}
                    onChange={(e) => handleInputChange('deal_value_estimate', e.target.value)}
                    placeholder="50000"
                    className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/johnsmith"
                  className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="secondary"
                size="sm"
                icon={Plus}
                disabled={isSubmitting}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-[#ef4444]"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Notes
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional information about this lead..."
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              disabled={isSubmitting}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[#23233a]/30 gap-4">
            <div className="text-sm text-[#b0b0d0]">
              Lead will be automatically scored based on provided information
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={onClose}
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
                icon={isSubmitting ? undefined : Plus}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Lead</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateLeadModal;