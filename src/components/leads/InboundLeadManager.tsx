import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Globe, Users, Calendar, MessageSquare, FileText, Settings, Play, Pause, RefreshCw, CheckCircle, AlertCircle, Clock, Plus } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface InboundSource {
  id: string;
  name: string;
  type: 'email' | 'voip' | 'social' | 'website' | 'events' | 'support' | 'forms';
  status: 'active' | 'inactive' | 'error';
  lastSync: Date;
  leadsCreated: number;
  icon: React.ComponentType<any>;
  description: string;
  config: any;
}

interface LeadNurturingCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  segment: string;
  emailTemplate: string;
  schedule: string;
  leadsSent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface EmailGateway {
  id: string;
  name: string;
  type: 'gmail' | 'outlook' | 'imap' | 'pop3' | 'api';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
  emailsProcessed: number;
  leadsCreated: number;
  opportunitiesAttached: number;
}

const InboundLeadManager: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();

  const [activeTab, setActiveTab] = useState<'sources' | 'nurturing' | 'gateways' | 'rules'>('sources');
  const [sources, setSources] = useState<InboundSource[]>([
    {
      id: 'email-gateway',
      name: 'Email Gateway',
      type: 'email',
      status: 'active',
      lastSync: new Date(),
      leadsCreated: 45,
      icon: Mail,
      description: 'Automatically create leads from incoming emails',
      config: { domain: 'company.com', filters: ['support', 'sales'] }
    },
    {
      id: 'voip-calls',
      name: 'VoIP Calls',
      type: 'voip',
      status: 'active',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      leadsCreated: 23,
      icon: Phone,
      description: 'Track and create leads from phone calls',
      config: { provider: 'Twilio', number: '+1-555-0123' }
    },
    {
      id: 'social-media',
      name: 'Social Media',
      type: 'social',
      status: 'active',
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      leadsCreated: 67,
      icon: Users,
      description: 'Monitor social media reactions and mentions',
      config: { platforms: ['twitter', 'linkedin', 'facebook'] }
    },
    {
      id: 'website-visitors',
      name: 'Website Visitors',
      type: 'website',
      status: 'active',
      lastSync: new Date(),
      leadsCreated: 89,
      icon: Globe,
      description: 'Track website visitors and form submissions',
      config: { domain: 'company.com', tracking: true }
    },
    {
      id: 'event-attendees',
      name: 'Event Attendees',
      type: 'events',
      status: 'inactive',
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
      leadsCreated: 12,
      icon: Calendar,
      description: 'Import leads from event registrations',
      config: { events: ['Conference 2024', 'Webinar Series'] }
    },
    {
      id: 'support-tickets',
      name: 'Support Tickets',
      type: 'support',
      status: 'active',
      lastSync: new Date(Date.now() - 15 * 60 * 1000),
      leadsCreated: 34,
      icon: MessageSquare,
      description: 'Convert support tickets to leads',
      config: { system: 'Zendesk', autoConvert: true }
    },
    {
      id: 'form-builders',
      name: 'Form Builders',
      type: 'forms',
      status: 'active',
      lastSync: new Date(),
      leadsCreated: 156,
      icon: FileText,
      description: 'Capture leads from custom forms',
      config: { forms: ['Contact', 'Demo Request', 'Newsletter'] }
    }
  ]);

  const [campaigns, setCampaigns] = useState<LeadNurturingCampaign[]>([
    {
      id: 'welcome-series',
      name: 'Welcome Series',
      status: 'active',
      segment: 'New Leads',
      emailTemplate: 'Welcome Email Template',
      schedule: 'Immediate + 3 days + 7 days',
      leadsSent: 234,
      openRate: 68.5,
      clickRate: 23.1,
      conversionRate: 12.4
    },
    {
      id: 'product-education',
      name: 'Product Education',
      status: 'active',
      segment: 'Qualified Leads',
      emailTemplate: 'Product Demo Template',
      schedule: 'Weekly',
      leadsSent: 156,
      openRate: 72.3,
      clickRate: 31.7,
      conversionRate: 18.9
    },
    {
      id: 're-engagement',
      name: 'Re-engagement',
      status: 'paused',
      segment: 'Inactive Leads',
      emailTemplate: 'Re-engagement Template',
      schedule: 'Monthly',
      leadsSent: 89,
      openRate: 45.2,
      clickRate: 15.8,
      conversionRate: 8.3
    }
  ]);

  const [gateways, setGateways] = useState<EmailGateway[]>([
    {
      id: 'gmail-company',
      name: 'Gmail (Company)',
      type: 'gmail',
      status: 'connected',
      lastSync: new Date(),
      emailsProcessed: 1247,
      leadsCreated: 89,
      opportunitiesAttached: 45
    },
    {
      id: 'outlook-sales',
      name: 'Outlook (Sales)',
      type: 'outlook',
      status: 'connected',
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      emailsProcessed: 892,
      leadsCreated: 67,
      opportunitiesAttached: 34
    },
    {
      id: 'support-api',
      name: 'Support API',
      type: 'api',
      status: 'connected',
      lastSync: new Date(),
      emailsProcessed: 567,
      leadsCreated: 23,
      opportunitiesAttached: 12
    }
  ]);

  const [assignmentRules, setAssignmentRules] = useState([
    {
      id: 'rule-1',
      name: 'Enterprise Leads',
      criteria: 'Company Size: 1000+ employees',
      assignTo: 'Senior Sales Team',
      priority: 'high',
      status: 'active'
    },
    {
      id: 'rule-2',
      name: 'SMB Leads',
      criteria: 'Company Size: 10-999 employees',
      assignTo: 'Mid-Market Team',
      priority: 'medium',
      status: 'active'
    },
    {
      id: 'rule-3',
      name: 'Startup Leads',
      criteria: 'Company Size: 1-9 employees',
      assignTo: 'Startup Team',
      priority: 'low',
      status: 'active'
    }
  ]);

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleToggleSource = (sourceId: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, status: source.status === 'active' ? 'inactive' : 'active' }
        : source
    ));
  };

  const handleToggleCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
  };

  const handleSyncSource = (sourceId: string) => {
    showToast({
      title: 'Syncing...',
      description: 'Updating lead data from source',
      type: 'info'
    });
    
    // Simulate sync
    setTimeout(() => {
      setSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { ...source, lastSync: new Date() }
          : source
      ));
      showToast({
        title: 'Sync Complete',
        description: 'Lead data updated successfully',
        type: 'success'
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'error': return 'danger';
      case 'paused': return 'warning';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Pause className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'paused': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-[#a259ff]" />
              <span>Inbound Lead Manager</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Manage automatic lead creation and nurturing campaigns
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#23233a]/30">
          {[
            { id: 'sources', name: 'Lead Sources', icon: Globe },
            { id: 'nurturing', name: 'Nurturing Campaigns', icon: Mail },
            { id: 'gateways', name: 'Email Gateways', icon: MessageSquare },
            { id: 'rules', name: 'Assignment Rules', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Lead Sources</h4>
                <Button variant="gradient" size="sm" icon={Plus}>
                  Add Source
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map(source => (
                  <Card key={source.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                          <source.icon className="w-5 h-5 text-[#a259ff]" />
                        </div>
                        <div>
                          <h5 className="font-medium text-white">{source.name}</h5>
                          <p className="text-xs text-[#b0b0d0]">{source.description}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(source.status) as any} size="sm">
                        {source.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Leads Created:</span>
                        <span className="text-white font-medium">{source.leadsCreated}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Last Sync:</span>
                        <span className="text-white">{source.lastSync.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant={source.status === 'active' ? 'secondary' : 'gradient'}
                        size="sm"
                        onClick={() => handleToggleSource(source.id)}
                      >
                        {source.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={RefreshCw}
                        onClick={() => handleSyncSource(source.id)}
                      >
                        Sync
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nurturing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Nurturing Campaigns</h4>
                <Button variant="gradient" size="sm" icon={Plus}>
                  Create Campaign
                </Button>
              </div>
              
              <div className="space-y-4">
                {campaigns.map(campaign => (
                  <Card key={campaign.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{campaign.name}</h5>
                        <p className="text-sm text-[#b0b0d0]">Segment: {campaign.segment}</p>
                        <p className="text-sm text-[#b0b0d0]">Schedule: {campaign.schedule}</p>
                      </div>
                      <Badge variant={getStatusColor(campaign.status) as any} size="sm">
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{campaign.leadsSent}</div>
                        <div className="text-xs text-[#b0b0d0]">Leads Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{campaign.openRate}%</div>
                        <div className="text-xs text-[#b0b0d0]">Open Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{campaign.clickRate}%</div>
                        <div className="text-xs text-[#b0b0d0]">Click Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{campaign.conversionRate}%</div>
                        <div className="text-xs text-[#b0b0d0]">Conversion</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant={campaign.status === 'active' ? 'secondary' : 'gradient'}
                        size="sm"
                        onClick={() => handleToggleCampaign(campaign.id)}
                      >
                        {campaign.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gateways' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Email Gateways</h4>
                <Button variant="gradient" size="sm" icon={Plus}>
                  Add Gateway
                </Button>
              </div>
              
              <div className="space-y-4">
                {gateways.map(gateway => (
                  <Card key={gateway.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{gateway.name}</h5>
                        <p className="text-sm text-[#b0b0d0]">Type: {gateway.type.toUpperCase()}</p>
                      </div>
                      <Badge variant={getStatusColor(gateway.status) as any} size="sm">
                        {gateway.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{gateway.emailsProcessed}</div>
                        <div className="text-xs text-[#b0b0d0]">Emails Processed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{gateway.leadsCreated}</div>
                        <div className="text-xs text-[#b0b0d0]">Leads Created</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{gateway.opportunitiesAttached}</div>
                        <div className="text-xs text-[#b0b0d0]">Opportunities</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm">
                        Configure
                      </Button>
                      <Button variant="secondary" size="sm" icon={RefreshCw}>
                        Sync
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Assignment Rules</h4>
                <Button variant="gradient" size="sm" icon={Plus}>
                  Add Rule
                </Button>
              </div>
              
              <div className="space-y-4">
                {assignmentRules.map(rule => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-white">{rule.name}</h5>
                        <p className="text-sm text-[#b0b0d0]">Criteria: {rule.criteria}</p>
                        <p className="text-sm text-[#b0b0d0]">Assign To: {rule.assignTo}</p>
                      </div>
                      <Badge variant={getStatusColor(rule.status) as any} size="sm">
                        {rule.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        Test
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default InboundLeadManager; 