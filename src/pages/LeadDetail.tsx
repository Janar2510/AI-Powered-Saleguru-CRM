import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  Target, 
  Star,
  MessageSquare,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Zap,
  Bot
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';
import { useGuru } from '../contexts/GuruContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { WorkflowActions } from '../components/workflows/WorkflowActions';
import Spline from '@splinetool/react-spline';

interface Lead {
  id: string;
  org_id?: string;
  contact_id?: string;
  company_id?: string;
  source?: string;
  status?: string;
  score?: number;
  notes?: string;
  created_at?: Date;
  name?: string;
  email?: string;
  company?: string;
  position?: string;
  phone?: string;
  last_contacted_at?: Date;
  converted_at?: Date;
  enriched_at?: Date;
  enrichment_status?: 'pending' | 'completed' | 'failed' | 'none';
  tags?: string[];
  deal_value_estimate?: number;
  industry?: string;
  company_size?: string;
  linkedin_url?: string;
  website?: string;
}

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadLead();
    }
  }, [id]);

  const loadLead = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          contacts (
            first_name,
            last_name,
            email,
            phone,
            title
          ),
          companies (
            name,
            domain
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const formattedLead: Lead = {
          ...data,
          name: data.contacts ? `${data.contacts.first_name || ''} ${data.contacts.last_name || ''}`.trim() : 'Unknown',
          email: data.contacts?.email || '',
          phone: data.contacts?.phone || '',
          position: data.contacts?.title || '',
          company: data.companies?.name || '',
          created_at: new Date(data.created_at),
          last_contacted_at: data.last_contacted_at ? new Date(data.last_contacted_at) : undefined,
          converted_at: data.converted_at ? new Date(data.converted_at) : undefined,
          enriched_at: data.enriched_at ? new Date(data.enriched_at) : undefined
        };
        
        setLead(formattedLead);
      }
    } catch (error) {
      console.error('Error loading lead:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load lead details'
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c]">
        <div className="fixed inset-0 z-0">
          <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
        </div>
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c]">
        <div className="fixed inset-0 z-0">
          <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
        </div>
        <div className="relative z-10 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Lead Not Found</h1>
            <p className="text-[#b0b0d0] mb-6">The lead you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={() => navigate('/leads')}
              className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all"
            >
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c]">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/leads')}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-lg text-[#b0b0d0] hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{lead.name}</h1>
                <p className="text-[#b0b0d0]">{lead.position} at {lead.company}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={openGuru}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Guru</span>
              </button>
              <button
                onClick={() => navigate(`/leads/${lead.id}/edit`)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => navigate(`/leads/${lead.id}/convert`)}
                className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Convert to Deal</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Lead Information */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-[#a259ff]" />
                    <span>Lead Information</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Full Name</label>
                      <p className="text-white font-medium">{lead.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Position</label>
                      <p className="text-white">{lead.position || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-[#b0b0d0]" />
                        <a href={`mailto:${lead.email}`} className="text-[#a259ff] hover:text-[#8b4dff] transition-colors">
                          {lead.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-[#b0b0d0]" />
                        <a href={`tel:${lead.phone}`} className="text-[#a259ff] hover:text-[#8b4dff] transition-colors">
                          {lead.phone || 'Not specified'}
                        </a>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Company</label>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-[#b0b0d0]" />
                        <span className="text-white">{lead.company || 'Not specified'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Industry</label>
                      <p className="text-white">{lead.industry || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Lead Score & Status */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-[#a259ff]" />
                    <span>Lead Score & Status</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Lead Score</label>
                      <div className="flex items-center space-x-2">
                        <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(lead.score || 0)}`}>
                          {lead.score || 0}
                        </div>
                        {(lead.score || 0) >= 80 && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Status</label>
                      {getStatusBadge(lead.status || 'new')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Source</label>
                      <p className="text-white capitalize">{lead.source || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notes */}
              {lead.notes && (
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-[#a259ff]" />
                      <span>Notes</span>
                    </h2>
                    <p className="text-[#b0b0d0] whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Workflow Actions */}
              {lead.status !== 'converted' && (
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Workflow Actions</h3>
                    <WorkflowActions
                      leadId={lead.id}
                      leadName={lead.name}
                      leadCompany={lead.company}
                      leadEmail={lead.email}
                      onLeadConverted={(result) => {
                        showToast({
                          type: 'success',
                          title: 'Lead Converted',
                          description: `Successfully converted ${lead.name} to deal ${result.dealId}`
                        });
                        // Update lead status locally
                        setLead(prev => prev ? { ...prev, status: 'converted' } : null);
                        // Navigate to the new deal
                        navigate(`/deals/${result.dealId}`);
                      }}
                    />
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center justify-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Convert to Deal</span>
                    </button>
                    <button className="w-full bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                    <button className="w-full bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Schedule Meeting</span>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#a259ff] rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Lead Created</p>
                        <p className="text-[#b0b0d0] text-xs">{lead.created_at?.toLocaleDateString()}</p>
                      </div>
                    </div>
                    {lead.last_contacted_at && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-[#377dff] rounded-full mt-2"></div>
                        <div>
                          <p className="text-white text-sm font-medium">Last Contacted</p>
                          <p className="text-[#b0b0d0] text-xs">{lead.last_contacted_at.toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    {lead.converted_at && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white text-sm font-medium">Converted to Deal</p>
                          <p className="text-[#b0b0d0] text-xs">{lead.converted_at.toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Additional Info */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Additional Info</h3>
                  <div className="space-y-3">
                    {lead.deal_value_estimate && (
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Estimated Deal Value</label>
                        <p className="text-white font-semibold">€{lead.deal_value_estimate.toLocaleString()}</p>
                      </div>
                    )}
                    {lead.company_size && (
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Company Size</label>
                        <p className="text-white">{lead.company_size}</p>
                      </div>
                    )}
                    {lead.website && (
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Website</label>
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-[#a259ff] hover:text-[#8b4dff] transition-colors flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>Visit Website</span>
                        </a>
                      </div>
                    )}
                    {lead.linkedin_url && (
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-1">LinkedIn</label>
                        <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#a259ff] hover:text-[#8b4dff] transition-colors flex items-center space-x-1">
                          <Linkedin className="w-4 h-4" />
                          <span>View Profile</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
