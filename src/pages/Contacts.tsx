import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Users, 
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Target,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  UserPlus,
  Star
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

interface CreateContactData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: 'active' | 'inactive' | 'lead' | 'customer';
  source: string;
  notes: string;
}

const CONTACT_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
  { value: 'lead', label: 'Lead', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { value: 'customer', label: 'Customer', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' }
];

const CONTACT_SOURCES = [
  'Website', 'Referral', 'Cold Call', 'Email Campaign', 'Social Media', 'Trade Show', 'Partner', 'Other'
];

export default function Contacts() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'score'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [newContact, setNewContact] = useState<CreateContactData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    status: 'active',
    source: '',
    notes: ''
  });

  const [editContact, setEditContact] = useState<CreateContactData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    status: 'active',
    source: '',
    notes: ''
  });

  // Load contacts on component mount
  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  // Filter and sort contacts when dependencies change
  useEffect(() => {
    let filtered = [...contacts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contact => {
        const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
        const email = contact.email?.toLowerCase() || '';
        const company = contact.company?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || 
               email.includes(searchLower) || 
               company.includes(searchLower);
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(contact => contact.source === sourceFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'score':
          aValue = a.lead_score || 0;
          bValue = b.lead_score || 0;
          break;
        default:
          aValue = a.first_name.toLowerCase();
          bValue = b.first_name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, statusFilter, sourceFilter, sortBy, sortOrder]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      console.log('Loading contacts...');

      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          organization:organizations(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading contacts:', error);
        // Show dummy contacts as fallback
        setContacts(getDummyContacts());
        showToast({ title: 'Using sample contacts data', type: 'info' });
      } else {
        console.log('Contacts loaded:', data);
        if (data && data.length > 0) {
          setContacts(data);
        } else {
          // Show dummy contacts if no data
          setContacts(getDummyContacts());
          showToast({ title: 'No contacts found, showing sample data', type: 'info' });
        }
      }
    } catch (error) {
      console.error('Error in loadContacts:', error);
      setContacts(getDummyContacts());
      showToast({ title: 'Error loading contacts, showing sample data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getDummyContacts = (): Contact[] => {
    return [
      {
        id: '1',
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
        notes: 'High-value customer with multiple projects.',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        organization: { id: '1', name: 'TechCorp Inc.' }
      },
      {
        id: '2',
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@innovate.io',
        phone: '+1 (555) 987-6543',
        company: 'Innovate Solutions',
        title: 'CEO',
        status: 'lead',
        source: 'Website',
        lead_score: 92,
        tags: ['CEO', 'Innovation'],
        notes: 'Interested in enterprise package.',
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-10T14:20:00Z',
        organization: { id: '2', name: 'Innovate Solutions' }
      },
      {
        id: '3',
        first_name: 'Emily',
        last_name: 'Rodriguez',
        email: 'emily.rodriguez@startup.co',
        phone: '+1 (555) 456-7890',
        company: 'StartupCo',
        title: 'Product Manager',
        status: 'active',
        source: 'Cold Call',
        lead_score: 67,
        tags: ['Startup', 'Product'],
        notes: 'Evaluating CRM solutions for growing team.',
        created_at: '2024-01-08T09:15:00Z',
        updated_at: '2024-01-08T09:15:00Z',
        organization: { id: '3', name: 'StartupCo' }
      }
    ];
  };

  const createContact = async () => {
    try {
      const orgId = (user as any)?.org_id || 'temp-org';
      
      const { error } = await supabase
        .from('contacts')
        .insert({
          ...newContact,
          org_id: orgId,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating contact:', error);
        showToast({ title: 'Error creating contact', type: 'error' });
        return;
      }

      showToast({ title: 'Contact created successfully!', type: 'success' });
      setShowCreateModal(false);
      setNewContact({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        title: '',
        status: 'active',
        source: '',
        notes: ''
      });
      loadContacts();
    } catch (error) {
      console.error('Error creating contact:', error);
      showToast({ title: 'Error creating contact', type: 'error' });
    }
  };

  const updateContact = async () => {
    if (!selectedContact) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          ...editContact,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedContact.id);

      if (error) {
        console.error('Error updating contact:', error);
        showToast({ title: 'Error updating contact', type: 'error' });
        return;
      }

      showToast({ title: 'Contact updated successfully!', type: 'success' });
      setShowEditModal(false);
      setSelectedContact(null);
      loadContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      showToast({ title: 'Error updating contact', type: 'error' });
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        console.error('Error deleting contact:', error);
        showToast({ title: 'Error deleting contact', type: 'error' });
        return;
      }

      showToast({ title: 'Contact deleted successfully!', type: 'success' });
      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      showToast({ title: 'Error deleting contact', type: 'error' });
    }
  };

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setEditContact({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      title: contact.title || '',
      status: contact.status,
      source: contact.source || '',
      notes: contact.notes || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (contact: Contact) => {
    setSelectedContact(contact);
    setShowViewModal(true);
  };

  const navigateToContactDetail = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = CONTACT_STATUSES.find(s => s.value === status);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Calculate stats
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(c => c.status === 'active').length;
  const customers = contacts.filter(c => c.status === 'customer').length;
  const avgScore = contacts.length > 0 
    ? Math.round(contacts.reduce((sum, c) => sum + (c.lead_score || 0), 0) / contacts.length)
    : 0;

  if (isLoading) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a259ff] mx-auto"></div>
            <p className="mt-4 text-white/80">Loading contacts...</p>
          </div>
        </div>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Contacts Management"
        subtitle="Manage your contacts and customer relationships"
        logoGradient={true}
        actions={
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <BrandButton variant="green" onClick={() => setShowCreateModal(true)} animation="scaleIn" size="sm" className="text-xs lg:text-sm">
              <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Add Contact
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
            transition={{ delay: 0.2 }}
          >
            <BrandStatCard
              icon={<UserPlus className="h-6 w-6 text-white" />}
              title="Active Contacts"
              value={activeContacts}
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
              icon={<Star className="h-6 w-6 text-white" />}
              title="Customers"
              value={customers}
              borderGradient="purple"
              animation="scaleIn"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BrandStatCard
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              title="Avg Score"
              value={avgScore}
              borderGradient="blue"
              animation="scaleIn"
            />
          </motion.div>
        </BrandStatsGrid>

        {/* Filters and Search */}
        <BrandCard variant="glass" borderGradient="secondary" className="mx-5 mb-5 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Search Contacts</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <BrandInput
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
              <BrandDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  ...CONTACT_STATUSES.map(status => ({ value: status.value, label: status.label }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Source</label>
              <BrandDropdown
                value={sourceFilter}
                onChange={setSourceFilter}
                options={[
                  { value: 'all', label: 'All Sources' },
                  ...CONTACT_SOURCES.map(source => ({ value: source, label: source }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Sort By</label>
              <BrandDropdown
                value={sortBy}
                onChange={(value) => setSortBy(value as 'name' | 'created_at' | 'score')}
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'created_at', label: 'Created Date' },
                  { value: 'score', label: 'Lead Score' }
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

        {/* Contacts Table */}
        <BrandCard variant="glass" borderGradient="primary" className="mx-5 mb-5">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Company & Title
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div 
                            className="text-sm lg:text-base font-medium text-white hover:text-purple-400 cursor-pointer transition-colors"
                            onClick={() => navigateToContactDetail(contact.id)}
                          >
                            {contact.first_name} {contact.last_name}
                          </div>
                          <div className="text-xs lg:text-sm text-white/60">
                            {contact.source && `Source: ${contact.source}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      <div className="text-sm lg:text-base text-white">
                        {contact.company || '—'}
                      </div>
                      <div className="text-xs lg:text-sm text-white/60">
                        {contact.title || '—'}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-xs lg:text-sm text-white">
                          <Mail className="h-4 w-4 mr-2 text-white/60" />
                          {contact.email}
                        </div>
                        {contact.phone && (
                          <div className="flex items-center text-xs lg:text-sm text-white/60">
                            <Phone className="h-4 w-4 mr-2 text-white/60" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      {contact.lead_score ? (
                        <span className={`text-sm lg:text-base font-medium ${getScoreColor(contact.lead_score)}`}>
                          {contact.lead_score}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <BrandButton
                          size="sm"
                          variant="blue"
                          onClick={() => openViewModal(contact)}
                        >
                          <Eye className="w-4 h-4" />
                        </BrandButton>
                        
                        <BrandButton
                          size="sm"
                          variant="purple"
                          onClick={() => openEditModal(contact)}
                        >
                          <Edit className="w-4 h-4" />
                        </BrandButton>
                        
                        <BrandButton
                          size="sm"
                          variant="red"
                          onClick={() => deleteContact(contact.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </BrandButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No contacts found</h3>
                <p className="text-white/60 mb-4">
                  {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first contact.'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && sourceFilter === 'all' && (
                  <BrandButton onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Contact
                  </BrandButton>
                )}
              </div>
            )}
          </div>
        </BrandCard>

        {/* Create Contact Modal */}
        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} size="3xl">
          <div className="p-8 max-w-4xl w-full">
            <h2 className="text-xl font-semibold mb-6 text-white">Add New Contact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">First Name</label>
                <BrandInput
                  value={newContact.first_name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Last Name</label>
                <BrandInput
                  value={newContact.last_name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <BrandInput
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                <BrandInput
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Company</label>
                <BrandInput
                  value={newContact.company}
                  onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Job Title</label>
                <BrandInput
                  value={newContact.title}
                  onChange={(e) => setNewContact(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter job title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <BrandDropdown
                  value={newContact.status}
                  onChange={(value) => setNewContact(prev => ({ ...prev, status: value as any }))}
                  options={CONTACT_STATUSES.map(status => ({ value: status.value, label: status.label }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Source</label>
                <BrandDropdown
                  value={newContact.source}
                  onChange={(value) => setNewContact(prev => ({ ...prev, source: value }))}
                  options={[
                    { value: '', label: 'Select a source...' },
                    ...CONTACT_SOURCES.map(source => ({ value: source, label: source }))
                  ]}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
              <textarea
                value={newContact.notes}
                onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this contact..."
                rows={4}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/30 placeholder-white/50"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <BrandButton variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </BrandButton>
              <BrandButton onClick={createContact}>
                <Plus className="w-4 h-4 mr-2" />
                Create Contact
              </BrandButton>
            </div>
          </div>
        </Modal>

        {/* Edit Contact Modal */}
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)} size="3xl">
          <div className="p-8 max-w-4xl w-full">
            <h2 className="text-xl font-semibold mb-6 text-white">Edit Contact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">First Name</label>
                <BrandInput
                  value={editContact.first_name}
                  onChange={(e) => setEditContact(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Last Name</label>
                <BrandInput
                  value={editContact.last_name}
                  onChange={(e) => setEditContact(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <BrandInput
                  type="email"
                  value={editContact.email}
                  onChange={(e) => setEditContact(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                <BrandInput
                  value={editContact.phone}
                  onChange={(e) => setEditContact(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Company</label>
                <BrandInput
                  value={editContact.company}
                  onChange={(e) => setEditContact(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Job Title</label>
                <BrandInput
                  value={editContact.title}
                  onChange={(e) => setEditContact(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter job title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <BrandDropdown
                  value={editContact.status}
                  onChange={(value) => setEditContact(prev => ({ ...prev, status: value as any }))}
                  options={CONTACT_STATUSES.map(status => ({ value: status.value, label: status.label }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Source</label>
                <BrandDropdown
                  value={editContact.source}
                  onChange={(value) => setEditContact(prev => ({ ...prev, source: value }))}
                  options={[
                    { value: '', label: 'Select a source...' },
                    ...CONTACT_SOURCES.map(source => ({ value: source, label: source }))
                  ]}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
              <textarea
                value={editContact.notes}
                onChange={(e) => setEditContact(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this contact..."
                rows={4}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/30 placeholder-white/50"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <BrandButton variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </BrandButton>
              <BrandButton onClick={updateContact}>
                <Edit className="w-4 h-4 mr-2" />
                Update Contact
              </BrandButton>
            </div>
          </div>
        </Modal>

        {/* View Contact Modal */}
        <Modal open={showViewModal} onClose={() => setShowViewModal(false)} size="3xl">
          <div className="p-8 max-w-4xl w-full">
            {selectedContact && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {selectedContact.first_name.charAt(0)}{selectedContact.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedContact.first_name} {selectedContact.last_name}
                      </h2>
                      <p className="text-white/60">{selectedContact.title || 'No title specified'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {getStatusBadge(selectedContact.status)}
                    {selectedContact.lead_score && (
                      <BrandBadge variant="default">
                        Score: {selectedContact.lead_score}
                      </BrandBadge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-white/60 mr-3" />
                        <span className="text-white">{selectedContact.email}</span>
                      </div>
                      {selectedContact.phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-white/60 mr-3" />
                          <span className="text-white">{selectedContact.phone}</span>
                        </div>
                      )}
                      {selectedContact.company && (
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-white/60 mr-3" />
                          <span className="text-white">{selectedContact.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Additional Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Source:</span>
                        <span className="text-white">{selectedContact.source || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Created:</span>
                        <span className="text-white">
                          {new Date(selectedContact.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Updated:</span>
                        <span className="text-white">
                          {new Date(selectedContact.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                {selectedContact.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-white/80">{selectedContact.notes}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <BrandButton variant="secondary" onClick={() => setShowViewModal(false)}>
                    Close
                  </BrandButton>
                  <BrandButton variant="purple" onClick={() => navigateToContactDetail(selectedContact.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Profile
                  </BrandButton>
                  <BrandButton variant="blue" onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedContact);
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Contact
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