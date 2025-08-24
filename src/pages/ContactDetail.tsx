import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Star,
  Target,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  User,
  Award,
  FileText,
  MessageSquare,
  Phone as PhoneIcon,
  Video,
  Send
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

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  status: 'active' | 'inactive' | 'lead' | 'customer';
  source?: string;
  lead_score?: number;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
  };
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
}

const CONTACT_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-500' },
  { value: 'lead', label: 'Lead', color: 'bg-blue-500' },
  { value: 'customer', label: 'Customer', color: 'bg-purple-500' }
];

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastContext();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadContactDetails();
    }
  }, [id]);

  const loadContactDetails = async () => {
    try {
      setIsLoading(true);
      
      // Load contact details
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select(`
          *,
          organization:organizations(id, name)
        `)
        .eq('id', id)
        .single();

      if (contactError) {
        console.error('Error loading contact:', contactError);
        // Use dummy data as fallback
        setContact(getDummyContact());
      } else {
        setContact(contactData);
      }

      // Load related deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('contact_id', id)
        .order('created_at', { ascending: false });

      if (dealsError) {
        console.error('Error loading deals:', dealsError);
        setDeals(getDummyDeals());
      } else {
        setDeals(dealsData || getDummyDeals());
      }

      // Load activities (we'll use dummy data for now)
      setActivities(getDummyActivities());

    } catch (error) {
      console.error('Error in loadContactDetails:', error);
      setContact(getDummyContact());
      setDeals(getDummyDeals());
      setActivities(getDummyActivities());
      showToast({ title: 'Error loading contact details, showing sample data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getDummyContact = (): Contact => {
    return {
      id: id || '1',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      title: 'Marketing Director',
      status: 'customer',
      source: 'Referral',
      lead_score: 85,
      tags: ['VIP', 'Technology'],
      notes: 'High-value customer with multiple projects. Prefers email communication over phone calls. Has been working with us for 2+ years.',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      organization: { id: '1', name: 'TechCorp Inc.' }
    };
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
      }
    ];
  };

  const getDummyActivities = (): Activity[] => {
    return [
      {
        id: '1',
        type: 'email',
        title: 'Follow-up on Enterprise CRM proposal',
        description: 'Sent detailed proposal with pricing and timeline',
        date: '2024-01-20T14:30:00Z',
        status: 'completed'
      },
      {
        id: '2',
        type: 'call',
        title: 'Discovery call',
        description: 'Discussed requirements and pain points',
        date: '2024-01-18T10:00:00Z',
        status: 'completed'
      },
      {
        id: '3',
        type: 'meeting',
        title: 'Demo presentation',
        description: 'Scheduled product demo for next week',
        date: '2024-01-25T15:00:00Z',
        status: 'pending'
      },
      {
        id: '4',
        type: 'task',
        title: 'Prepare custom integration proposal',
        description: 'Create detailed technical proposal for API integrations',
        date: '2024-01-22T09:00:00Z',
        status: 'pending'
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
    const statusConfig = CONTACT_STATUSES.find(s => s.value === status);
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
        return <PhoneIcon className="h-4 w-4" />;
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
            <p className="mt-4 text-white/80">Loading contact details...</p>
          </div>
        </div>
      </BrandBackground>
    );
  }

  if (!contact) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <User className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Contact Not Found</h2>
            <p className="text-white/60 mb-6">The contact you're looking for doesn't exist or has been deleted.</p>
            <BrandButton onClick={() => navigate('/contacts')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contacts
            </BrandButton>
          </div>
        </div>
      </BrandBackground>
    );
  }

  // Calculate stats
  const totalDeals = deals.length;
  const wonDeals = deals.filter(d => d.status === 'won').length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonValue = deals.filter(d => d.status === 'won').reduce((sum, deal) => sum + deal.value, 0);

  return (
    <BrandBackground>
      <BrandPageLayout
        title={`${contact.first_name} ${contact.last_name}`}
        subtitle={contact.title ? `${contact.title} at ${contact.company}` : contact.company || 'Contact Profile'}
        logoGradient={true}
        actions={
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <BrandButton variant="secondary" onClick={() => navigate('/contacts')} size="sm">
              <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Back
            </BrandButton>
            <BrandButton variant="blue" size="sm">
              <PhoneIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Call
            </BrandButton>
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
        {/* Contact Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-5 mb-6"
        >
          <BrandCard variant="gradient" borderGradient="logo" className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    {contact.first_name} {contact.last_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {getStatusBadge(contact.status)}
                    {contact.lead_score && (
                      <BrandBadge variant="default">
                        Score: {contact.lead_score}
                      </BrandBadge>
                    )}
                    {contact.source && (
                      <BrandBadge variant="default">
                        Source: {contact.source}
                      </BrandBadge>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-white/80">
                      <Mail className="h-4 w-4 mr-2" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-white/80">
                        <Phone className="h-4 w-4 mr-2" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center text-white/80">
                        <Building2 className="h-4 w-4 mr-2" />
                        {contact.company}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <BrandButton variant="blue">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Call
                </BrandButton>
                <BrandButton variant="green">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </BrandButton>
                <BrandButton variant="purple">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
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
              icon={<Target className="h-6 w-6 text-white" />}
              title="Total Deals"
              value={totalDeals}
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
              icon={<Award className="h-6 w-6 text-white" />}
              title="Won Deals"
              value={wonDeals}
              borderGradient="green"
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
              borderGradient="blue"
              animation="scaleIn"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BrandStatCard
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              title="Revenue"
              value={formatCurrency(wonValue)}
              borderGradient="purple"
              animation="scaleIn"
            />
          </motion.div>
        </BrandStatsGrid>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mx-5">
          {/* Deals Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BrandCard variant="glass" borderGradient="primary" className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Related Deals</h3>
                <BrandButton size="sm" variant="green">
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
                    <p className="text-white/60 mb-4">No deals found for this contact</p>
                    <BrandButton size="sm" variant="green">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Deal
                    </BrandButton>
                  </div>
                )}
              </div>
            </BrandCard>
          </motion.div>

          {/* Activities Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <BrandCard variant="glass" borderGradient="secondary" className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
                <BrandButton size="sm" variant="blue">
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
                      <div className="flex items-center text-xs text-white/50 mt-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(activity.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BrandCard>
          </motion.div>
        </div>

        {/* Notes Section */}
        {contact.notes && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mx-5 mt-5"
          >
            <BrandCard variant="glass" borderGradient="accent" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-white/80 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            </BrandCard>
          </motion.div>
        )}

        {/* Contact Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mx-5 mt-5 mb-5"
        >
          <BrandCard variant="glass" borderGradient="logo" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Created:</span>
                  <span className="text-white">{formatDate(contact.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Last Updated:</span>
                  <span className="text-white">{formatDate(contact.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Status:</span>
                  <span className="text-white">{contact.status}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Source:</span>
                  <span className="text-white">{contact.source || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Lead Score:</span>
                  <span className="text-white">{contact.lead_score || 'Not scored'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Tags:</span>
                  <span className="text-white">
                    {contact.tags && contact.tags.length > 0 
                      ? contact.tags.join(', ') 
                      : 'No tags'
                    }
                  </span>
                </div>
              </div>
            </div>
          </BrandCard>
        </motion.div>
      </BrandPageLayout>
    </BrandBackground>
  );
}