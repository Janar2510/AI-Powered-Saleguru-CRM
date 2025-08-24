import React from 'react';
import { X, Mail, Phone, Building, Globe, Linkedin, Calendar, User, Target, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

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

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onEdit: () => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, onEdit }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
    if (score >= 40) return 'text-orange-500 bg-orange-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary" size="sm">🆕 New</Badge>;
      case 'contacted':
        return <Badge variant="primary" size="sm">📞 Contacted</Badge>;
      case 'qualified':
        return <Badge variant="success" size="sm">✅ Qualified</Badge>;
      case 'converted':
        return <Badge variant="success" size="sm">🎯 Converted</Badge>;
      case 'archived':
        return <Badge variant="secondary" size="sm">📁 Archived</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website': return '🌐';
      case 'linkedin': return '💼';
      case 'referral': return '👥';
      case 'cold-email': return '📧';
      case 'demo-request': return '🎯';
      case 'import': return '📥';
      case 'manual': return '✏️';
      default: return '📋';
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
                {`${lead.first_name?.[0] || ''}${lead.last_name?.[0] || ''}`}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {`${lead.first_name} ${lead.last_name}`}
              </h2>
              <p className="text-secondary-400">{lead.title || 'No title'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Edit Lead
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-secondary-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-secondary-400" />
                  <span className="text-white">{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-secondary-400" />
                    <span className="text-white">{lead.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-secondary-400" />
                  <span className="text-white">{lead.company}</span>
                </div>
                {lead.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-secondary-400" />
                    <a 
                      href={lead.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300"
                    >
                      {lead.website}
                    </a>
                  </div>
                )}
                {lead.linkedin_url && (
                  <div className="flex items-center space-x-3">
                    <Linkedin className="w-4 h-4 text-secondary-400" />
                    <a 
                      href={lead.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {/* Lead Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Lead Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Lead Score</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(lead.lead_score)}`}>
                    {lead.lead_score}/100
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Status</span>
                  {getStatusBadge(lead.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Source</span>
                  <div className="flex items-center space-x-2">
                    <span>{getSourceIcon(lead.source)}</span>
                    <span className="text-white capitalize">{lead.source.replace('-', ' ')}</span>
                  </div>
                </div>
                {lead.deal_value_estimate && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Estimated Value</span>
                    <span className="text-green-400 font-medium">
                      ${lead.deal_value_estimate.toLocaleString()}
                    </span>
                  </div>
                )}
                {lead.industry && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Industry</span>
                    <span className="text-white">{lead.industry}</span>
                  </div>
                )}
                {lead.company_size && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Company Size</span>
                    <span className="text-white">{lead.company_size}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Created</span>
                  <span className="text-white">
                    {lead.created_at.toLocaleDateString()}
                  </span>
                </div>
                {lead.last_contacted_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Last Contacted</span>
                    <span className="text-white">
                      {lead.last_contacted_at.toLocaleDateString()}
                    </span>
                  </div>
                )}
                {lead.converted_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Converted</span>
                    <span className="text-green-400">
                      {lead.converted_at.toLocaleDateString()}
                    </span>
                  </div>
                )}
                {lead.enriched_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Enriched</span>
                    <span className="text-white">
                      {lead.enriched_at.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* AI Insights */}
            {lead.ai_insight && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  AI Insights
                </h3>
                <p className="text-secondary-300 leading-relaxed">
                  {lead.ai_insight}
                </p>
              </Card>
            )}

            {/* Notes */}
            {lead.notes && (
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                <p className="text-secondary-300 leading-relaxed whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </Card>
            )}

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal; 