import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Edit,
  Plus,
  ExternalLink,
  Calendar,
  Award,
  Star,
  Activity,
  User,
  CheckCircle,
  Clock,
  MessageSquare,
  Video,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { 
  BrandBackground,
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard,
  BrandCard,
  BrandButton,
  BrandBadge
} from '../contexts/BrandDesignContext';

interface Organization {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  country?: string;
  size?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive' | 'prospect';
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  status: string;
  lead_score?: number;
}

interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  probability: number;
  status: 'open' | 'won' | 'lost';
  stage_id: string;
  stage?: string;
  expected_close_date?: string;
  actual_close_date?: string;
  created_at: string;
}

interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'task' | 'note';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  contact_name?: string;
}

const ORG_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-500' },
  { value: 'prospect', label: 'Prospect', color: 'bg-blue-500' }
];

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastContext();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrganizationDetails();
    }
  }, [id]);

  const loadOrganizationDetails = async () => {
    try {
      setIsLoading(true);
      
      // Load organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (orgError) {
        console.error('Error loading organization:', orgError);
        setOrganization(getDummyOrganization());
      } else {
        setOrganization(orgData);
      }

      // Load related contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('company', organization?.name || 'TechCorp Inc.')
        .order('created_at', { ascending: false });

      if (contactsError) {
        console.error('Error loading contacts:', contactsError);
        setContacts(getDummyContacts());
      } else {
        setContacts(contactsData || getDummyContacts());
      }

      // Load related deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('organization_id', id)
        .order('created_at', { ascending: false });

      if (dealsError) {
        console.error('Error loading deals:', dealsError);
        setDeals(getDummyDeals());
      } else {
        setDeals(dealsData || getDummyDeals());
      }

      // Load activities (using dummy data for now)
      setActivities(getDummyActivities());

    } catch (error) {
      console.error('Error in loadOrganizationDetails:', error);
      setOrganization(getDummyOrganization());
      setContacts(getDummyContacts());
      setDeals(getDummyDeals());
      setActivities(getDummyActivities());
      showToast({ title: 'Error loading organization details, showing sample data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getDummyOrganization = (): Organization => {
    return {
      id: id || '1',
      name: 'TechCorp Inc.',
      industry: 'Technology',
      website: 'https://techcorp.com',
      country: 'United States',
      size: '201-500 employees',
      description: 'Leading technology solutions provider specializing in cloud infrastructure and AI. We help businesses transform their operations through innovative software solutions and cutting-edge technology.',
      phone: '+1 (555) 123-4567',
      email: 'info@techcorp.com',
      address: '123 Tech Street, San Francisco, CA 94105',
      status: 'active',
      tags: ['Enterprise', 'Cloud', 'AI'],
      notes: 'Major client with multiple ongoing projects. Excellent relationship with procurement team. Looking to expand into new markets.',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    };
  };

  const getDummyContacts = (): Contact[] => {
    return [
      {
        id: '1',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1 (555) 123-4567',
        title: 'Marketing Director',
        status: 'customer',
        lead_score: 85
      },
      {
        id: '2',
        first_name: 'David',
        last_name: 'Chen',
        email: 'david.chen@techcorp.com',
        phone: '+1 (555) 123-4568',
        title: 'CTO',
        status: 'active',
        lead_score: 92
      },
      {
        id: '3',
        first_name: 'Maria',
        last_name: 'Rodriguez',
        email: 'maria.rodriguez@techcorp.com',
        phone: '+1 (555) 123-4569',
        title: 'Procurement Manager',
        status: 'active',
        lead_score: 78
      }
    ];
  };

  const getDummyDeals = (): Deal[] => {
    return [
      {
        id: '1',
        title: 'Enterprise CRM Implementation',
        description: 'Full enterprise CRM solution with custom integrations',
        value: 85000,
        currency: 'USD',
        probability: 85,
        status: 'open',
        stage_id: 'negotiation',
        stage: 'Negotiation',
        expected_close_date: '2024-03-15',
        created_at: '2024-01-10T14:20:00Z'
      },
      {
        id: '2',
        title: 'Marketing Automation Setup',
        description: 'Marketing automation workflows and email campaigns',
        value: 25000,
        currency: 'USD',
        probability: 95,
        status: 'won',
        stage_id: 'closed-won',
        stage: 'Closed Won',
        expected_close_date: '2024-02-01',
        actual_close_date: '2024-01-28',
        created_at: '2023-12-15T09:15:00Z'
      },
      {
        id: '3',
        title: 'Cloud Infrastructure Migration',
        description: 'Migration of legacy systems to cloud infrastructure',
        value: 120000,
        currency: 'USD',
        probability: 70,
        status: 'open',
        stage_id: 'proposal',
        stage: 'Proposal',
        expected_close_date: '2024-04-30',
        created_at: '2024-01-20T11:30:00Z'
      }
    ];
  };

  const getDummyActivities = (): Activity[] => {
    return [
      {
        id: '1',
        type: 'meeting',
        title: 'Quarterly Business Review',
        description: 'Reviewed Q4 performance and discussed 2024 strategy',
        date: '2024-01-20T14:30:00Z',
        status: 'completed',
        contact_name: 'Sarah Johnson'
      },
      {
        id: '2',
        type: 'email',
        title: 'Proposal Follow-up',
        description: 'Sent detailed cloud migration proposal with timeline',
        date: '2024-01-18T10:00:00Z',
        status: 'completed',
        contact_name: 'David Chen'
      },
      {
        id: '3',
        type: 'call',
        title: 'Technical Discovery Call',
        description: 'Discussed technical requirements for new integration',
        date: '2024-01-15T15:00:00Z',
        status: 'completed',
        contact_name: 'David Chen'
      },
      {
        id: '4',
        type: 'task',
        title: 'Prepare ROI Analysis',
        description: 'Create detailed ROI analysis for cloud migration project',
        date: '2024-01-25T09:00:00Z',
        status: 'pending',
        contact_name: 'Maria Rodriguez'
      },
      {
        id: '5',
        type: 'meeting',
        title: 'Contract Negotiation',
        description: 'Scheduled contract negotiation meeting',
        date: '2024-01-30T14:00:00Z',
        status: 'pending',
        contact_name: 'Sarah Johnson'
      }
    ];
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = ORG_STATUSES.find(s => s.value === status);
    if (!statusConfig) return <BrandBadge variant="default">{status}</BrandBadge>;

    return (
      <BrandBadge variant="default">
        {statusConfig.label}
      </BrandBadge>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'meeting':
        return <Video className="h-4 w-4" />;
      case 'task':
        return <CheckCircle className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-600';
      case 'call':
        return 'bg-green-600';
      case 'meeting':
        return 'bg-purple-600';
      case 'task':
        return 'bg-orange-600';
      case 'note':
        return 'bg-gray-600';
      default:
        return 'bg-indigo-600';
    }
  };

  if (isLoading) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a259ff] mx-auto"></div>
            <p className="mt-4 text-white/80">Loading organization details...</p>
          </div>
        </div>
      </BrandBackground>
    );
  }

  if (!organization) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Organization Not Found</h2>
            <p className="text-white/60 mb-6">The organization you're looking for doesn't exist or has been deleted.</p>
            <BrandButton onClick={() => navigate('/organizations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Organizations
            </BrandButton>
          </div>
        </div>
      </BrandBackground>
    );
  }

  // Calculate stats
  const totalContacts = contacts.length;
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter(d => d.status === 'won').length;
  const wonValue = deals.filter(d => d.status === 'won').reduce((sum, deal) => sum + deal.value, 0);

  return (
    <BrandBackground>
      <BrandPageLayout
        title={organization.name}
        subtitle={organization.industry ? `${organization.industry} • ${organization.country}` : organization.country || 'Organization Profile'}
        logoGradient={true}
        actions={
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <BrandButton variant="secondary" onClick={() => navigate('/organizations')} size="sm">
              <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Back
            </BrandButton>
            {organization.website && (
              <BrandButton 
                variant="blue" 
                size="sm"
                onClick={() => window.open(organization.website!.startsWith('http') ? organization.website : `https://${organization.website}`, '_blank')}
              >
                <Globe className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Website
              </BrandButton>
            )}
            <BrandButton variant="green" size="sm">
              <Mail className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Email
            </BrandButton>
            <BrandButton variant="purple" size="sm">
              <Edit className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Edit
            </BrandButton>
          </div>
        }
      >
        {/* Organization Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-5 mb-6"
        >
          <BrandCard variant="gradient" borderGradient="logo" className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="h-20 w-20 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    {organization.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {getStatusBadge(organization.status)}
                    {organization.size && (
                      <BrandBadge variant="default">
                        {organization.size}
                      </BrandBadge>
                    )}
                    {organization.industry && (
                      <BrandBadge variant="default">
                        {organization.industry}
                      </BrandBadge>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    {organization.website && (
                      <div className="flex items-center text-white/80">
                        <Globe className="h-4 w-4 mr-2" />
                        <a 
                          href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-purple-400 transition-colors"
                        >
                          {organization.website}
                        </a>
                      </div>
                    )}
                    {organization.email && (
                      <div className="flex items-center text-white/80">
                        <Mail className="h-4 w-4 mr-2" />
                        {organization.email}
                      </div>
                    )}
                    {organization.phone && (
                      <div className="flex items-center text-white/80">
                        <Phone className="h-4 w-4 mr-2" />
                        {organization.phone}
                      </div>
                    )}
                    {organization.address && (
                      <div className="flex items-center text-white/80">
                        <MapPin className="h-4 w-4 mr-2" />
                        {organization.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {organization.website && (
                  <BrandButton 
                    variant="blue"
                    onClick={() => window.open(organization.website!.startsWith('http') ? organization.website : `https://${organization.website}`, '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </BrandButton>
                )}
                <BrandButton variant="green">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </BrandButton>
                <BrandButton variant="purple">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact
                </BrandButton>
              </div>
            </div>
          </BrandCard>
        </motion.div>

        {/* Stats Grid */}
        <BrandStatsGrid>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BrandStatCard
              icon={<Users className="h-6 w-6 text-white" />}
              title="Total Contacts"
              value={totalContacts}
              borderGradient="primary"
              animation="scaleIn"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BrandStatCard
              icon={<Target className="h-6 w-6 text-white" />}
              title="Total Deals"
              value={totalDeals}
              borderGradient="blue"
              animation="scaleIn"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BrandStatCard
              icon={<DollarSign className="h-6 w-6 text-white" />}
              title="Total Value"
              value={formatCurrency(totalValue)}
              borderGradient="green"
              animation="scaleIn"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BrandStatCard
              icon={<Award className="h-6 w-6 text-white" />}
              title="Won Revenue"
              value={formatCurrency(wonValue)}
              borderGradient="purple"
              animation="scaleIn"
            />
          </motion.div>
        </BrandStatsGrid>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mx-5">
          {/* Contacts Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BrandCard variant="glass" borderGradient="primary" className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Organization Contacts</h3>
                <BrandButton size="sm" variant="green">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </BrandButton>
              </div>
              
              <div className="space-y-4">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">
                          {contact.first_name} {contact.last_name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {contact.lead_score && (
                            <BrandBadge variant="default" size="sm">
                              Score: {contact.lead_score}
                            </BrandBadge>
                          )}
                          <BrandBadge variant="default" size="sm">
                            {contact.status}
                          </BrandBadge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-white/60 mb-2">{contact.title || 'No title'}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-white/80 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {contact.email}
                          </span>
                        </div>
                        {contact.phone && (
                          <div className="text-white/60 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">No contacts found for this organization</p>
                    <BrandButton size="sm" variant="green">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Contact
                    </BrandButton>
                  </div>
                )}
              </div>
            </BrandCard>
          </motion.div>

          {/* Deals Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <BrandCard variant="glass" borderGradient="secondary" className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Organization Deals</h3>
                <BrandButton size="sm" variant="blue">
                  <Plus className="w-4 h-4 mr-2" />
                  New Deal
                </BrandButton>
              </div>
              
              <div className="space-y-4">
                {deals.length > 0 ? (
                  deals.map((deal) => (
                    <div key={deal.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{deal.title}</h4>
                        <BrandBadge 
                          variant={deal.status === 'won' ? 'default' : deal.status === 'lost' ? 'default' : 'default'}
                        >
                          {deal.status === 'won' ? '✓ Won' : deal.status === 'lost' ? '✗ Lost' : deal.stage}
                        </BrandBadge>
                      </div>
                      
                      <p className="text-sm text-white/60 mb-3">{deal.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-white font-medium">
                            {formatCurrency(deal.value, deal.currency)}
                          </span>
                          <span className="text-white/60">
                            {deal.probability}% probability
                          </span>
                        </div>
                        <div className="text-white/60">
                          {deal.expected_close_date && formatDate(deal.expected_close_date)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">No deals found for this organization</p>
                    <BrandButton size="sm" variant="blue">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Deal
                    </BrandButton>
                  </div>
                )}
              </div>
            </BrandCard>
          </motion.div>
        </div>

        {/* Activities Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mx-5 mt-5"
        >
          <BrandCard variant="glass" borderGradient="accent" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
              <BrandButton size="sm" variant="purple">
                <Plus className="w-4 h-4 mr-2" />
                Log Activity
              </BrandButton>
            </div>
            
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white text-sm">{activity.title}</h4>
                      <BrandBadge 
                        variant={activity.status === 'completed' ? 'default' : 'default'}
                        size="sm"
                      >
                        {activity.status}
                      </BrandBadge>
                    </div>
                    <p className="text-sm text-white/60 mt-1">{activity.description}</p>
                    <div className="flex items-center justify-between text-xs text-white/50 mt-2">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(activity.date)}
                      </div>
                      {activity.contact_name && (
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {activity.contact_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </BrandCard>
        </motion.div>

        {/* Organization Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mx-5 mt-5">
          {/* Description */}
          {organization.description && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <BrandCard variant="glass" borderGradient="logo" className="p-6 h-full">
                <h3 className="text-lg font-semibold text-white mb-4">About {organization.name}</h3>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-white/80 whitespace-pre-wrap">{organization.description}</p>
                </div>
              </BrandCard>
            </motion.div>
          )}

          {/* Organization Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <BrandCard variant="glass" borderGradient="secondary" className="p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-4">Organization Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Industry:</span>
                  <span className="text-white">{organization.industry || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Company Size:</span>
                  <span className="text-white">{organization.size || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Country:</span>
                  <span className="text-white">{organization.country || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Status:</span>
                  <span className="text-white">{organization.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Created:</span>
                  <span className="text-white">{formatDate(organization.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Last Updated:</span>
                  <span className="text-white">{formatDate(organization.updated_at)}</span>
                </div>
                {organization.tags && organization.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Tags:</span>
                    <span className="text-white">{organization.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </BrandCard>
          </motion.div>
        </div>

        {/* Notes */}
        {organization.notes && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mx-5 mt-5 mb-5"
          >
            <BrandCard variant="glass" borderGradient="accent" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-white/80 whitespace-pre-wrap">{organization.notes}</p>
              </div>
            </BrandCard>
          </motion.div>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
}
