import React, { useState, useEffect } from 'react';
import { X, Plus, Building, Globe, Mail, Phone, Tag, Linkedin, Twitter, Facebook, MapPin, Bot, Zap } from 'lucide-react';
import { Company, CompanyFormData } from '../../types/company';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';
import { useGuru } from '../../contexts/GuruContext';
import EnrichmentButton from '../enrichment/EnrichmentButton';
import { useCompanyEnrichment } from '../../hooks/useCompanyEnrichment';

interface CompanyFormProps {
  initialData?: Partial<Company>;
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    website: '',
    industry: '',
    size: '',
    description: '',
    logo_url: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    phone: '',
    email: '',
    linkedin_url: '',
    twitter_url: '',
    facebook_url: '',
    tags: [],
    status: 'active'
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [tempCompanyId, setTempCompanyId] = useState<string>(`temp-${Date.now()}`);

  // Initialize company enrichment hook
  const { 
    enrichCompany, 
    isEnriching, 
    enrichmentStatus, 
    enrichmentData 
  } = useCompanyEnrichment({
    companyId: initialData?.id || tempCompanyId,
    website: formData.website || '',
    onSuccess: (data) => {
      // Update form with enriched data
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        industry: data.industry || prev.industry,
        size: data.size || prev.size,
        description: data.description || prev.description,
        logo_url: data.logo_url || prev.logo_url,
        linkedin_url: data.social_profiles?.linkedin || prev.linkedin_url,
        twitter_url: data.social_profiles?.twitter || prev.twitter_url,
        facebook_url: data.social_profiles?.facebook || prev.facebook_url
      }));

      showToast({
        title: 'Company Enriched',
        description: 'Company data has been successfully enriched from LinkedIn and web sources',
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
      newErrors.name = 'Company name is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.website && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(formData.website)) {
      newErrors.website = 'Invalid website URL';
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

  const handleEnrichCompany = () => {
    if (!formData.website) {
      showToast({
        title: 'Website Required',
        description: 'Please enter a website URL to enrich company data',
        type: 'error'
      });
      return;
    }
    
    enrichCompany();
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
          <h3 className="text-lg font-semibold text-white">Company Information</h3>
          <EnrichmentButton
            onClick={handleEnrichCompany}
            isLoading={isEnriching}
            status={enrichmentStatus}
            disabled={isSubmitting || !formData.website}
            size="sm"
            label="Enrich Data from LinkedIn & Web"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Company Name *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Company Name"
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
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://company.com"
                className={`w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.website ? 'border-[#ef4444]' : 'border-white/20'
                }`}
                disabled={isSubmitting}
              />
              {errors.website && (
                <p className="text-[#ef4444] text-xs mt-1">{errors.website}</p>
              )}
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

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Company Size
            </label>
            <select
              value={formData.size || ''}
              onChange={(e) => handleInputChange('size', e.target.value)}
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              disabled={isSubmitting}
            >
              <option value="">Select size...</option>
              <option value="Startup (1-10)">Startup (1-10)</option>
              <option value="Small (11-50)">Small (11-50)</option>
              <option value="Medium (51-200)">Medium (51-200)</option>
              <option value="Large (201-1000)">Large (201-1000)</option>
              <option value="Enterprise (1000+)">Enterprise (1000+)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the company..."
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@company.com"
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
              Phone
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
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Street Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Business St"
                className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City"
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              State/Province
            </label>
            <input
              type="text"
              value={formData.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="State"
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="Country"
              className="w-full px-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.postal_code || ''}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              placeholder="Postal Code"
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
                placeholder="https://linkedin.com/company/name"
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

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Facebook
            </label>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="url"
                value={formData.facebook_url || ''}
                onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/companyname"
                className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logo_url || ''}
              onChange={(e) => handleInputChange('logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
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

      {/* AI Assistant */}
      <div className="p-4 bg-gradient-to-r from-[#a259ff]/10 to-[#8b5cf6]/10 border border-[#a259ff]/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Bot className="w-5 h-5 text-[#a259ff] mt-1" />
          <div>
            <h4 className="font-medium text-white">Need help with this company?</h4>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Ask SaleToruGuru to find more information, suggest contacts, or analyze industry trends.
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
            <span>{initialData?.id ? 'Update Company' : 'Create Company'}</span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;