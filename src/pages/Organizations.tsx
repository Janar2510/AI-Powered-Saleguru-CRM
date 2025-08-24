import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Building2, 
  Globe,
  MapPin,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  ExternalLink,
  Industry,
  Mail,
  Phone,
  Star,
  Award
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
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
  BrandInput,
  BrandBadge,
  BrandDropdown
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
  contact_count?: number;
  deal_count?: number;
  total_value?: number;
}

interface CreateOrganizationData {
  name: string;
  industry: string;
  website: string;
  country: string;
  size: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive' | 'prospect';
  notes: string;
}

const ORG_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
  { value: 'prospect', label: 'Prospect', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' }
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 
  'Real Estate', 'Consulting', 'Media', 'Transportation', 'Energy', 'Agriculture',
  'Construction', 'Hospitality', 'Legal', 'Government', 'Non-profit', 'Other'
];

const COMPANY_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees',
  '501-1000 employees', '1001-5000 employees', '5000+ employees'
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Netherlands',
  'Australia', 'Japan', 'Singapore', 'India', 'Brazil', 'Mexico', 'Spain', 'Italy',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Other'
];

export default function Organizations() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'contact_count'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [newOrganization, setNewOrganization] = useState<CreateOrganizationData>({
    name: '',
    industry: '',
    website: '',
    country: '',
    size: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    status: 'active',
    notes: ''
  });

  const [editOrganization, setEditOrganization] = useState<CreateOrganizationData>({
    name: '',
    industry: '',
    website: '',
    country: '',
    size: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    status: 'active',
    notes: ''
  });

  // Load organizations on component mount
  useEffect(() => {
    if (user) {
      loadOrganizations();
    }
  }, [user]);

  // Filter and sort organizations when dependencies change
  useEffect(() => {
    let filtered = [...organizations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(org => {
        const name = org.name.toLowerCase();
        const industry = org.industry?.toLowerCase() || '';
        const country = org.country?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || 
               industry.includes(searchLower) || 
               country.includes(searchLower);
      });
    }

    // Apply industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(org => org.industry === industryFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(org => org.status === statusFilter);
    }

    // Apply size filter
    if (sizeFilter !== 'all') {
      filtered = filtered.filter(org => org.size === sizeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'contact_count':
          aValue = a.contact_count || 0;
          bValue = b.contact_count || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredOrganizations(filtered);
  }, [organizations, searchTerm, industryFilter, statusFilter, sizeFilter, sortBy, sortOrder]);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      console.log('Loading organizations...');

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading organizations:', error);
        // Show dummy organizations as fallback
        setOrganizations(getDummyOrganizations());
        showToast({ title: 'Using sample organizations data', type: 'info' });
      } else {
        console.log('Organizations loaded:', data);
        if (data && data.length > 0) {
          setOrganizations(data);
        } else {
          // Show dummy organizations if no data
          setOrganizations(getDummyOrganizations());
          showToast({ title: 'No organizations found, showing sample data', type: 'info' });
        }
      }
    } catch (error) {
      console.error('Error in loadOrganizations:', error);
      setOrganizations(getDummyOrganizations());
      showToast({ title: 'Error loading organizations, showing sample data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getDummyOrganizations = (): Organization[] => {
    return [
      {
        id: '1',
        name: 'TechCorp Inc.',
        industry: 'Technology',
        website: 'https://techcorp.com',
        country: 'United States',
        size: '201-500 employees',
        description: 'Leading technology solutions provider specializing in cloud infrastructure and AI.',
        phone: '+1 (555) 123-4567',
        email: 'info@techcorp.com',
        address: '123 Tech Street, San Francisco, CA 94105',
        status: 'active',
        tags: ['Enterprise', 'Cloud', 'AI'],
        notes: 'Major client with multiple ongoing projects.',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        contact_count: 12,
        deal_count: 5,
        total_value: 450000
      },
      {
        id: '2',
        name: 'HealthFirst Medical',
        industry: 'Healthcare',
        website: 'https://healthfirst.com',
        country: 'Canada',
        size: '501-1000 employees',
        description: 'Comprehensive healthcare services with focus on preventive care.',
        phone: '+1 (416) 555-9876',
        email: 'contact@healthfirst.com',
        address: '456 Medical Ave, Toronto, ON M5V 3A8',
        status: 'active',
        tags: ['Healthcare', 'Medical'],
        notes: 'Potential for expanding into digital health solutions.',
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-10T14:20:00Z',
        contact_count: 8,
        deal_count: 3,
        total_value: 275000
      },
      {
        id: '3',
        name: 'GreenEnergy Solutions',
        industry: 'Energy',
        website: 'https://greenenergy.com',
        country: 'Germany',
        size: '51-200 employees',
        description: 'Renewable energy solutions and sustainability consulting.',
        phone: '+49 30 12345678',
        email: 'info@greenenergy.com',
        address: 'Unter den Linden 77, 10117 Berlin, Germany',
        status: 'prospect',
        tags: ['Renewable', 'Sustainability'],
        notes: 'Interested in CRM for managing renewable energy projects.',
        created_at: '2024-01-08T09:15:00Z',
        updated_at: '2024-01-08T09:15:00Z',
        contact_count: 4,
        deal_count: 2,
        total_value: 125000
      },
      {
        id: '4',
        name: 'RetailMax Group',
        industry: 'Retail',
        website: 'https://retailmax.com',
        country: 'United Kingdom',
        size: '1001-5000 employees',
        description: 'Large retail chain with focus on customer experience.',
        phone: '+44 20 7946 0958',
        email: 'corporate@retailmax.com',
        address: '789 Oxford Street, London W1C 1JN, UK',
        status: 'active',
        tags: ['Retail', 'Customer Experience'],
        notes: 'Looking to implement omnichannel customer management.',
        created_at: '2024-01-05T16:45:00Z',
        updated_at: '2024-01-05T16:45:00Z',
        contact_count: 15,
        deal_count: 7,
        total_value: 680000
      }
    ];
  };

  const createOrganization = async () => {
    try {
      const orgId = (user as any)?.org_id || 'temp-org';
      
      const { error } = await supabase
        .from('organizations')
        .insert({
          ...newOrganization,
          org_id: orgId,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating organization:', error);
        showToast({ title: 'Error creating organization', type: 'error' });
        return;
      }

      showToast({ title: 'Organization created successfully!', type: 'success' });
      setShowCreateModal(false);
      setNewOrganization({
        name: '',
        industry: '',
        website: '',
        country: '',
        size: '',
        description: '',
        phone: '',
        email: '',
        address: '',
        status: 'active',
        notes: ''
      });
      loadOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      showToast({ title: 'Error creating organization', type: 'error' });
    }
  };

  const updateOrganization = async () => {
    if (!selectedOrganization) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          ...editOrganization,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrganization.id);

      if (error) {
        console.error('Error updating organization:', error);
        showToast({ title: 'Error updating organization', type: 'error' });
        return;
      }

      showToast({ title: 'Organization updated successfully!', type: 'success' });
      setShowEditModal(false);
      setSelectedOrganization(null);
      loadOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      showToast({ title: 'Error updating organization', type: 'error' });
    }
  };

  const deleteOrganization = async (organizationId: string) => {
    if (!confirm('Are you sure you want to delete this organization? This will affect related contacts and deals.')) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId);

      if (error) {
        console.error('Error deleting organization:', error);
        showToast({ title: 'Error deleting organization', type: 'error' });
        return;
      }

      showToast({ title: 'Organization deleted successfully!', type: 'success' });
      loadOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      showToast({ title: 'Error deleting organization', type: 'error' });
    }
  };

  const openEditModal = (organization: Organization) => {
    setSelectedOrganization(organization);
    setEditOrganization({
      name: organization.name,
      industry: organization.industry || '',
      website: organization.website || '',
      country: organization.country || '',
      size: organization.size || '',
      description: organization.description || '',
      phone: organization.phone || '',
      email: organization.email || '',
      address: organization.address || '',
      status: organization.status,
      notes: organization.notes || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (organization: Organization) => {
    setSelectedOrganization(organization);
    setShowViewModal(true);
  };

  const navigateToOrganizationDetail = (organizationId: string) => {
    navigate(`/organizations/${organizationId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = ORG_STATUSES.find(s => s.value === status);
    if (!statusConfig) return <BrandBadge variant="default">{status}</BrandBadge>;

    return (
      <BrandBadge 
        variant="default"
        className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0`}
      >
        {statusConfig.label}
      </BrandBadge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const totalOrganizations = organizations.length;
  const activeOrganizations = organizations.filter(o => o.status === 'active').length;
  const prospects = organizations.filter(o => o.status === 'prospect').length;
  const totalContacts = organizations.reduce((sum, org) => sum + (org.contact_count || 0), 0);
  const totalValue = organizations.reduce((sum, org) => sum + (org.total_value || 0), 0);

  if (isLoading) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a259ff] mx-auto"></div>
            <p className="mt-4 text-white/80">Loading organizations...</p>
          </div>
        </div>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Organizations Management"
        subtitle="Manage company accounts and business relationships"
        logoGradient={true}
        actions={
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <BrandButton variant="green" onClick={() => setShowCreateModal(true)} animation="scaleIn" size="sm" className="text-xs lg:text-sm">
              <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Add Organization
            </BrandButton>
            <BrandButton variant="blue" size="sm" className="text-xs lg:text-sm">
              <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Export
            </BrandButton>
            <BrandButton variant="purple" size="sm" className="text-xs lg:text-sm">
              <Upload className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Import
            </BrandButton>
          </div>
        }
      >
        {/* Brand Stats Grid */}
        <BrandStatsGrid>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BrandStatCard
              icon={<Building2 className="h-6 w-6 text-white" />}
              title="Total Organizations"
              value={totalOrganizations}
              borderGradient="primary"
              animation="scaleIn"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BrandStatCard
              icon={<Star className="h-6 w-6 text-white" />}
              title="Active Organizations"
              value={activeOrganizations}
              borderGradient="green"
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
              title="Prospects"
              value={prospects}
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
              borderGradient="purple"
              animation="scaleIn"
            />
          </motion.div>
        </BrandStatsGrid>

        {/* Filters and Search */}
        <BrandCard variant="glass" borderGradient="secondary" className="mx-5 mb-5 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">Search Organizations</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <BrandInput
                  type="text"
                  placeholder="Search by name, industry, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Industry</label>
              <BrandDropdown
                value={industryFilter}
                onChange={setIndustryFilter}
                options={[
                  { value: 'all', label: 'All Industries' },
                  ...INDUSTRIES.map(industry => ({ value: industry, label: industry }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
              <BrandDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  ...ORG_STATUSES.map(status => ({ value: status.value, label: status.label }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Sort By</label>
              <BrandDropdown
                value={sortBy}
                onChange={(value) => setSortBy(value as 'name' | 'created_at' | 'contact_count')}
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'created_at', label: 'Created Date' },
                  { value: 'contact_count', label: 'Contacts' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Order</label>
              <BrandDropdown
                value={sortOrder}
                onChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                options={[
                  { value: 'asc', label: 'Ascending' },
                  { value: 'desc', label: 'Descending' }
                ]}
              />
            </div>
          </div>
        </BrandCard>

        {/* Organizations Table */}
        <BrandCard variant="glass" borderGradient="primary" className="mx-5 mb-5">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Industry & Location
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Metrics
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrganizations.map((organization) => (
                  <tr key={organization.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div 
                            className="text-sm lg:text-base font-medium text-white hover:text-purple-400 cursor-pointer transition-colors"
                            onClick={() => navigateToOrganizationDetail(organization.id)}
                          >
                            {organization.name}
                          </div>
                          <div className="text-xs lg:text-sm text-white/60">
                            {organization.size && `${organization.size}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      <div className="text-sm lg:text-base text-white">
                        {organization.industry || '—'}
                      </div>
                      <div className="text-xs lg:text-sm text-white/60 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {organization.country || '—'}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      <div className="flex flex-col space-y-1">
                        {organization.website && (
                          <div className="flex items-center text-xs lg:text-sm text-white">
                            <Globe className="h-4 w-4 mr-2 text-white/60" />
                            <a 
                              href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-purple-400 transition-colors"
                            >
                              Website
                              <ExternalLink className="h-3 w-3 ml-1 inline" />
                            </a>
                          </div>
                        )}
                        {organization.email && (
                          <div className="flex items-center text-xs lg:text-sm text-white/60">
                            <Mail className="h-4 w-4 mr-2 text-white/60" />
                            {organization.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      {getStatusBadge(organization.status)}
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      <div className="flex flex-col space-y-1 text-xs lg:text-sm">
                        <div className="flex items-center text-white">
                          <Users className="h-3 w-3 mr-1 text-white/60" />
                          {organization.contact_count || 0} contacts
                        </div>
                        <div className="flex items-center text-white/60">
                          <Target className="h-3 w-3 mr-1 text-white/60" />
                          {organization.deal_count || 0} deals
                        </div>
                        {organization.total_value && (
                          <div className="flex items-center text-green-400">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {formatCurrency(organization.total_value)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <BrandButton
                          size="sm"
                          variant="blue"
                          onClick={() => openViewModal(organization)}
                        >
                          <Eye className="w-4 h-4" />
                        </BrandButton>
                        
                        <BrandButton
                          size="sm"
                          variant="purple"
                          onClick={() => openEditModal(organization)}
                        >
                          <Edit className="w-4 h-4" />
                        </BrandButton>
                        
                        <BrandButton
                          size="sm"
                          variant="red"
                          onClick={() => deleteOrganization(organization.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </BrandButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredOrganizations.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No organizations found</h3>
                <p className="text-white/60 mb-4">
                  {searchTerm || industryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first organization.'
                  }
                </p>
                {!searchTerm && industryFilter === 'all' && statusFilter === 'all' && (
                  <BrandButton onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Organization
                  </BrandButton>
                )}
              </div>
            )}
          </div>
        </BrandCard>

        {/* Create Organization Modal */}
        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} size="3xl">
          <div className="p-8 max-w-4xl w-full">
            <h2 className="text-xl font-semibold mb-6 text-white">Add New Organization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Organization Name</label>
                <BrandInput
                  value={newOrganization.name}
                  onChange={(e) => setNewOrganization(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Industry</label>
                <BrandDropdown
                  value={newOrganization.industry}
                  onChange={(value) => setNewOrganization(prev => ({ ...prev, industry: value }))}
                  options={[
                    { value: '', label: 'Select an industry...' },
                    ...INDUSTRIES.map(industry => ({ value: industry, label: industry }))
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Website</label>
                <BrandInput
                  value={newOrganization.website}
                  onChange={(e) => setNewOrganization(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
                <BrandDropdown
                  value={newOrganization.country}
                  onChange={(value) => setNewOrganization(prev => ({ ...prev, country: value }))}
                  options={[
                    { value: '', label: 'Select a country...' },
                    ...COUNTRIES.map(country => ({ value: country, label: country }))
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Company Size</label>
                <BrandDropdown
                  value={newOrganization.size}
                  onChange={(value) => setNewOrganization(prev => ({ ...prev, size: value }))}
                  options={[
                    { value: '', label: 'Select company size...' },
                    ...COMPANY_SIZES.map(size => ({ value: size, label: size }))
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <BrandDropdown
                  value={newOrganization.status}
                  onChange={(value) => setNewOrganization(prev => ({ ...prev, status: value as any }))}
                  options={ORG_STATUSES.map(status => ({ value: status.value, label: status.label }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                <BrandInput
                  value={newOrganization.phone}
                  onChange={(e) => setNewOrganization(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <BrandInput
                  type="email"
                  value={newOrganization.email}
                  onChange={(e) => setNewOrganization(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Address</label>
              <BrandInput
                value={newOrganization.address}
                onChange={(e) => setNewOrganization(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
              <textarea
                value={newOrganization.description}
                onChange={(e) => setNewOrganization(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the organization..."
                rows={3}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/30 placeholder-white/50"
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
              <textarea
                value={newOrganization.notes}
                onChange={(e) => setNewOrganization(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this organization..."
                rows={4}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/30 placeholder-white/50"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <BrandButton variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </BrandButton>
              <BrandButton onClick={createOrganization}>
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </BrandButton>
            </div>
          </div>
        </Modal>

        {/* Edit Organization Modal */}
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)} size="3xl">
          <div className="p-8 max-w-4xl w-full">
            <h2 className="text-xl font-semibold mb-6 text-white">Edit Organization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Organization Name</label>
                <BrandInput
                  value={editOrganization.name}
                  onChange={(e) => setEditOrganization(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Industry</label>
                <BrandDropdown
                  value={editOrganization.industry}
                  onChange={(value) => setEditOrganization(prev => ({ ...prev, industry: value }))}
                  options={[
                    { value: '', label: 'Select an industry...' },
                    ...INDUSTRIES.map(industry => ({ value: industry, label: industry }))
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Website</label>
                <BrandInput
                  value={editOrganization.website}
                  onChange={(e) => setEditOrganization(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
                <BrandDropdown
                  value={editOrganization.country}
                  onChange={(value) => setEditOrganization(prev => ({ ...prev, country: value }))}
                  options={[
                    { value: '', label: 'Select a country...' },
                    ...COUNTRIES.map(country => ({ value: country, label: country }))
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Company Size</label>
                <BrandDropdown
                  value={editOrganization.size}
                  onChange={(value) => setEditOrganization(prev => ({ ...prev, size: value }))}
                  options={[
                    { value: '', label: 'Select company size...' },
                    ...COMPANY_SIZES.map(size => ({ value: size, label: size }))
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <BrandDropdown
                  value={editOrganization.status}
                  onChange={(value) => setEditOrganization(prev => ({ ...prev, status: value as any }))}
                  options={ORG_STATUSES.map(status => ({ value: status.value, label: status.label }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                <BrandInput
                  value={editOrganization.phone}
                  onChange={(e) => setEditOrganization(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <BrandInput
                  type="email"
                  value={editOrganization.email}
                  onChange={(e) => setEditOrganization(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Address</label>
              <BrandInput
                value={editOrganization.address}
                onChange={(e) => setEditOrganization(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
              <textarea
                value={editOrganization.description}
                onChange={(e) => setEditOrganization(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the organization..."
                rows={3}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/30 placeholder-white/50"
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
              <textarea
                value={editOrganization.notes}
                onChange={(e) => setEditOrganization(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this organization..."
                rows={4}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/30 placeholder-white/50"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <BrandButton variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </BrandButton>
              <BrandButton onClick={updateOrganization}>
                <Edit className="w-4 h-4 mr-2" />
                Update Organization
              </BrandButton>
            </div>
          </div>
        </Modal>

        {/* View Organization Modal */}
        <Modal open={showViewModal} onClose={() => setShowViewModal(false)} size="3xl">
          <div className="p-8 max-w-4xl w-full">
            {selectedOrganization && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedOrganization.name}
                      </h2>
                      <p className="text-white/60">{selectedOrganization.industry || 'No industry specified'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {getStatusBadge(selectedOrganization.status)}
                    {selectedOrganization.size && (
                      <BrandBadge variant="default">
                        {selectedOrganization.size}
                      </BrandBadge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      {selectedOrganization.website && (
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-white/60 mr-3" />
                          <a 
                            href={selectedOrganization.website.startsWith('http') ? selectedOrganization.website : `https://${selectedOrganization.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-purple-400 transition-colors"
                          >
                            {selectedOrganization.website}
                          </a>
                        </div>
                      )}
                      {selectedOrganization.email && (
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-white/60 mr-3" />
                          <span className="text-white">{selectedOrganization.email}</span>
                        </div>
                      )}
                      {selectedOrganization.phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-white/60 mr-3" />
                          <span className="text-white">{selectedOrganization.phone}</span>
                        </div>
                      )}
                      {selectedOrganization.address && (
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-white/60 mr-3" />
                          <span className="text-white">{selectedOrganization.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Organization Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Country:</span>
                        <span className="text-white">{selectedOrganization.country || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Company Size:</span>
                        <span className="text-white">{selectedOrganization.size || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Created:</span>
                        <span className="text-white">
                          {new Date(selectedOrganization.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Updated:</span>
                        <span className="text-white">
                          {new Date(selectedOrganization.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {selectedOrganization.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-white/80">{selectedOrganization.description}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedOrganization.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-white/80">{selectedOrganization.notes}</p>
                    </div>
                  </div>
                )}

                {/* Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white">{selectedOrganization.contact_count || 0}</div>
                      <div className="text-sm text-white/60">Contacts</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white">{selectedOrganization.deal_count || 0}</div>
                      <div className="text-sm text-white/60">Deals</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white">
                        {selectedOrganization.total_value ? formatCurrency(selectedOrganization.total_value) : '$0'}
                      </div>
                      <div className="text-sm text-white/60">Total Value</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <BrandButton variant="secondary" onClick={() => setShowViewModal(false)}>
                    Close
                  </BrandButton>
                  <BrandButton variant="purple" onClick={() => navigateToOrganizationDetail(selectedOrganization.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Profile
                  </BrandButton>
                  <BrandButton variant="blue" onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedOrganization);
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Organization
                  </BrandButton>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </BrandPageLayout>
    </BrandBackground>
  );
}
