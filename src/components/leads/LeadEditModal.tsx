import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Building, Globe, Linkedin } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  title?: string;
  phone?: string;
  source: 'website' | 'linkedin' | 'referral' | 'cold-email' | 'demo-request' | 'import' | 'manual';
  lead_score: number;
  status: 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted' | 'archived';
  created_at: Date;
  last_contacted_at?: Date;
  converted_at?: Date;
  enriched_at?: Date;
  enrichment_status?: 'pending' | 'completed' | 'failed' | 'none';
  tags?: string[];
  notes?: string;
  deal_value_estimate?: number;
  industry?: string;
  company_size?: string;
  linkedin_url?: string;
  website?: string;
  ai_insight?: string;
  owner_id?: string;
}

interface LeadEditModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}

const LeadEditModal: React.FC<LeadEditModalProps> = ({ lead, onClose, onSave }) => {
  const [formData, setFormData] = useState<Lead>(lead);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof Lead, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {`${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Edit Lead</h2>
              <p className="text-secondary-400">
                {`${formData.first_name} ${formData.last_name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>
            </Card>

            {/* Company Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Company Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url || ''}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry || ''}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Company Size
                  </label>
                  <select
                    value={formData.company_size || ''}
                    onChange={(e) => handleInputChange('company_size', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="">Select size</option>
                    <option value="Startup">Startup (1-10)</option>
                    <option value="SMB">SMB (11-50)</option>
                    <option value="Mid-Market">Mid-Market (51-200)</option>
                    <option value="Enterprise">Enterprise (200+)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Lead Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Lead Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Lead Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.lead_score}
                    onChange={(e) => handleInputChange('lead_score', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="archived">Archived</option>
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
                  >
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="cold-email">Cold Email</option>
                    <option value="demo-request">Demo Request</option>
                    <option value="import">Import</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Estimated Deal Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deal_value_estimate || ''}
                    onChange={(e) => handleInputChange('deal_value_estimate', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="50000"
                  />
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
                  placeholder="Add notes about this lead..."
                />
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-secondary-700">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadEditModal; 