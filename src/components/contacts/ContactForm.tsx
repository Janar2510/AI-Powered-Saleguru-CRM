import React, { useState, useEffect } from 'react';
import { X, Plus, User, Building, Mail, Phone, Globe, Tag, Linkedin, Twitter, Bot, Zap } from 'lucide-react';
import { Contact, ContactFormData } from '../../types/contact';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuru } from '../../contexts/GuruContext';
import EnrichmentButton from '../enrichment/EnrichmentButton';
import { useContactEnrichment } from '../../hooks/useContactEnrichment';

interface ContactFormProps {
  initialData?: Partial<Contact>;
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    notes: '',
    tags: [],
    website: '',
    linkedin_url: '',
    twitter_url: '',
    industry: '',
    status: 'active'
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [tempContactId, setTempContactId] = useState<string>(`temp-${Date.now()}`);

  // Initialize contact enrichment hook
  const { 
    enrichContact, 
    isEnriching, 
    enrichmentStatus, 
    enrichmentData 
  } = useContactEnrichment({
    contactId: initialData?.id || tempContactId,
    email: formData.email,
    onSuccess: (data) => {
      // Update form with enriched data
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        phone: data.phone || prev.phone,
        position: data.position || prev.position,
        linkedin_url: data.linkedin_url || prev.linkedin_url,
        twitter_url: data.twitter_url || prev.twitter_url
      }));

      showToast({
        title: 'Contact Enriched',
        description: 'Contact data has been successfully enriched from LinkedIn and web sources',
        type: 'success'
      });
    }
  });

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        tags: initialData.tags || []
      }));
    }
  }, [initialData]);

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        type: 'error'
      });
      return;
    }
    
    onSubmit(formData);
  };

  const handleEnrichContact = () => {
    if (!formData.email) {
      showToast({
        title: 'Email Required',
        description: 'Please enter an email address to enrich contact data',
        type: 'error'
      });
      return;
    }
    
    enrichContact();
  };

  const handleAskGuru = () => {
    openGuru();
    // In a real implementation, this would send a specific query to Guru
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Contact Information</h3>
          <EnrichmentButton
            onClick={handleEnrichContact}
            isLoading={isEnriching}
            status={enrichmentStatus}
            disabled={isSubmitting || !formData.email}
            size="sm"
            label="Enrich Data from LinkedIn & Web"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Smith"
                className={`w-full pl-10 pr-4 py-3 bg-secondary-700 border ${
                  errors.name ? 'border-red-500' : 'border-secondary-600'
                } rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@company.com"
                className={`w-full pl-10 pr-4 py-3 bg-secondary-700 border ${
                  errors.email ? 'border-red-500' : 'border-secondary-600'
                } rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={isSubmitting}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lead">Lead</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Company
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Company Name"
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Position
            </label>
            <input
              type="text"
              value={formData.position || ''}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Job Title"
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://company.com"
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Industry
            </label>
            <input
              type="text"
              value={formData.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              placeholder="e.g. Technology, Finance, Healthcare"
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Social Profiles */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Social Profiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              LinkedIn
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="url"
                value={formData.linkedin_url || ''}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Twitter
            </label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="url"
                value={formData.twitter_url || ''}
                onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/username"
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>

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

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-secondary-300 mb-2">
          Notes
        </label>
        <textarea
          rows={4}
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes about this contact..."
          className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
          disabled={isSubmitting}
        />
      </div>

      {/* AI Assistant */}
      <div className="p-4 bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Bot className="w-5 h-5 text-primary-400 mt-1" />
          <div>
            <h4 className="font-medium text-white">Need help with this contact?</h4>
            <p className="text-secondary-300 text-sm mt-1">
              Ask SaleToruGuru to find more information, suggest follow-ups, or analyze engagement.
            </p>
            <button 
              type="button"
              onClick={handleAskGuru}
              className="btn-primary text-sm mt-3"
            >
              Ask Guru
            </button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3 pt-4 border-t border-secondary-700">
        <button
          type="button"
          onClick={onCancel}
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
              <span>{initialData?.id ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <>
              <span>{initialData?.id ? 'Update Contact' : 'Create Contact'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;