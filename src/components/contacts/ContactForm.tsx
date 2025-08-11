import React, { useState, useEffect } from 'react';
import { X, Plus, User, Building, Mail, Phone, Globe, Tag, Linkedin, Twitter, Bot, Zap } from 'lucide-react';
import { Contact, ContactFormData } from '../../types/contact';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
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
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Smith"
                className={`w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.name ? 'border-[#ef4444]' : 'border-white/20'
                }`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-[#ef4444] text-xs mt-1">{errors.name}</p>
              )}
            </div>
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
                className={`w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.email ? 'border-[#ef4444]' : 'border-white/20'
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-[#ef4444] text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Company
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Company Name"
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
              value={formData.position || ''}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Job Title"
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://company.com"
                className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Industry
            </label>
            <input
              type="text"
              value={formData.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              placeholder="e.g. Technology, Finance, Healthcare"
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
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
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              LinkedIn
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="url"
                value={formData.linkedin_url || ''}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Twitter
            </label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="url"
                value={formData.twitter_url || ''}
                onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/username"
                className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                disabled={isSubmitting}
              />
            </div>
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
              <Tag className="w-3 h-3" />
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
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes about this contact..."
          className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
          disabled={isSubmitting}
        />
      </div>

      {/* AI Assistant */}
      <div className="p-4 bg-gradient-to-r from-[#a259ff]/10 to-[#8b5cf6]/10 border border-[#a259ff]/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Bot className="w-5 h-5 text-[#a259ff] mt-1" />
          <div>
            <h4 className="font-medium text-white">Need help with this contact?</h4>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Ask SaleToruGuru to find more information, suggest follow-ups, or analyze engagement.
            </p>
            <Button 
              type="button"
              onClick={handleAskGuru}
              variant="gradient"
              size="sm"
              className="mt-3"
            >
              Ask Guru
            </Button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#23233a]/30">
        <Button
          type="button"
          onClick={onCancel}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{initialData?.id ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <span>{initialData?.id ? 'Update Contact' : 'Create Contact'}</span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;