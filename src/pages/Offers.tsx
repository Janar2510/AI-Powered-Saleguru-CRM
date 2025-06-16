import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, Eye, Edit, Trash2, Plus, Download, ExternalLink, Calendar, DollarSign, User, Bot } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useToastContext } from '../contexts/ToastContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Offer {
  id: string;
  offer_id: string;
  title: string;
  deal: {
    id: string;
    name: string;
    value: number;
  };
  contact: {
    name: string;
    company: string;
    email: string;
  };
  value: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  created_date: Date;
  sent_date?: Date;
  expiry_date?: Date;
  file_url?: string;
  notes?: string;
  created_by: string;
}

const Offers: React.FC = () => {
  const { showToast } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch offers from Supabase or use mock data
  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('offers')
          .select('*, deals(id, title, value), contacts(name, company, email)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Format data to match Offer interface
          const formattedOffers: Offer[] = data.map(offer => ({
            id: offer.id,
            offer_id: offer.offer_id || `OFFER-${Math.floor(Math.random() * 10000)}`,
            title: offer.title,
            deal: {
              id: offer.deals?.id || offer.deal_id,
              name: offer.deals?.title || 'Unknown Deal',
              value: offer.deals?.value || offer.value || 0
            },
            contact: {
              name: offer.contacts?.name || offer.contact_name || 'Unknown Contact',
              company: offer.contacts?.company || offer.company || 'Unknown Company',
              email: offer.contacts?.email || offer.contact_email || 'unknown@example.com'
            },
            value: offer.value,
            status: offer.status || 'draft',
            created_date: new Date(offer.created_at),
            sent_date: offer.sent_at ? new Date(offer.sent_at) : undefined,
            expiry_date: offer.expiry_date ? new Date(offer.expiry_date) : undefined,
            file_url: offer.file_url,
            notes: offer.notes,
            created_by: offer.created_by || 'Janar Kuusk'
          }));
          
          setOffers(formattedOffers);
          setIsLoading(false);
          return;
        }
        
        // If no data, use mock data
        throw new Error('No offers found');
      } catch (error) {
        console.log('Using mock offers data');
        
        // Use mock data
        const mockOffers: Offer[] = [
          {
            id: '1',
            offer_id: 'OFFER-20250101-0001',
            title: 'Enterprise Software Package',
            deal: {
              id: 'deal-1',
              name: 'TechCorp Enterprise Deal',
              value: 75000
            },
            contact: {
              name: 'John Smith',
              company: 'TechCorp Inc.',
              email: 'john.smith@techcorp.com'
            },
            value: 75000,
            status: 'sent',
            created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            sent_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            expiry_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
            file_url: '/offers/enterprise-software-package.pdf',
            notes: 'Customized proposal with 3-year support package',
            created_by: 'Janar Kuusk'
          },
          {
            id: '2',
            offer_id: 'OFFER-20250102-0001',
            title: 'Cloud Infrastructure Proposal',
            deal: {
              id: 'deal-2',
              name: 'StartupXYZ Cloud Setup',
              value: 25000
            },
            contact: {
              name: 'Sarah Johnson',
              company: 'StartupXYZ',
              email: 'sarah@startupxyz.com'
            },
            value: 25000,
            status: 'draft',
            created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            notes: 'Waiting for technical requirements confirmation',
            created_by: 'Janar Kuusk'
          },
          {
            id: '3',
            offer_id: 'OFFER-20250103-0001',
            title: 'Support Plan Renewal',
            deal: {
              id: 'deal-3',
              name: 'Global Industries Renewal',
              value: 45000
            },
            contact: {
              name: 'Michael Brown',
              company: 'Global Industries',
              email: 'michael@globalindustries.com'
            },
            value: 45000,
            status: 'accepted',
            created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            sent_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            file_url: '/offers/support-plan-renewal.pdf',
            notes: 'Annual renewal with 15% discount applied',
            created_by: 'Sarah Wilson'
          },
          {
            id: '4',
            offer_id: 'OFFER-20250104-0001',
            title: 'Security Audit Package',
            deal: {
              id: 'deal-4',
              name: 'FinanceCore Security',
              value: 60000
            },
            contact: {
              name: 'Lisa Chen',
              company: 'FinanceCore',
              email: 'lisa.chen@financecore.com'
            },
            value: 60000,
            status: 'viewed',
            created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            sent_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            expiry_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            file_url: '/offers/security-audit-package.pdf',
            notes: 'Comprehensive security assessment and implementation',
            created_by: 'Mike Chen'
          }
        ];
        
        setOffers(mockOffers);
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, []);

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.offer_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" size="sm">📝 Draft</Badge>;
      case 'sent':
        return <Badge variant="primary" size="sm">📤 Sent</Badge>;
      case 'viewed':
        return <Badge variant="warning" size="sm">👁️ Viewed</Badge>;
      case 'accepted':
        return <Badge variant="success" size="sm">✅ Accepted</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm">❌ Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary" size="sm">⏰ Expired</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const isExpiringSoon = (expiryDate?: Date) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const handleSendReminders = () => {
    showToast({
      type: 'info',
      title: 'Sending Reminders',
      message: 'Sending reminders for expiring offers...'
    });
    
    // In a real implementation, this would send reminders to clients
    setTimeout(() => {
      showToast({
        type: 'success',
        title: 'Reminders Sent',
        message: 'Reminders have been sent to clients with expiring offers'
      });
    }, 1500);
  };

  const handleExtendDeadlines = () => {
    showToast({
      type: 'info',
      title: 'Extending Deadlines',
      message: 'Extending deadlines for expiring offers...'
    });
    
    // In a real implementation, this would extend offer deadlines
    setTimeout(() => {
      // Update local state
      const updatedOffers = offers.map(offer => {
        if (isExpiringSoon(offer.expiry_date)) {
          return {
            ...offer,
            expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Add 30 days
          };
        }
        return offer;
      });
      
      setOffers(updatedOffers);
      
      showToast({
        type: 'success',
        title: 'Deadlines Extended',
        message: 'Offer deadlines have been extended by 30 days'
      });
    }, 1500);
  };

  const CreateOfferModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white">Create New Offer</h3>
          <button
            onClick={() => setShowCreateModal(false)}
            className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Offer Title</label>
              <input
                type="text"
                placeholder="Enter offer title..."
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Linked Deal</label>
              <select className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600">
                <option value="">Select a deal...</option>
                <option value="deal-1">TechCorp Enterprise Deal ($75,000)</option>
                <option value="deal-2">StartupXYZ Cloud Setup ($25,000)</option>
                <option value="deal-3">Global Industries Renewal ($45,000)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Offer Value</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="number"
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Expiry Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Upload Offer Document</label>
            <div className="border-2 border-dashed border-secondary-600 rounded-lg p-6 text-center hover:border-secondary-500 transition-colors">
              <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-400 mb-2">Drag and drop your offer document here</p>
              <p className="text-secondary-500 text-sm mb-4">or click to browse (PDF, DOC, DOCX)</p>
              <button className="btn-secondary">Choose File</button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Notes</label>
            <textarea
              rows={4}
              placeholder="Add any notes about this offer..."
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between p-6 border-t border-secondary-700">
          <button 
            onClick={() => {
              showToast({
                type: 'info',
                title: 'AI Generate',
                message: 'Generating offer content with AI...'
              });
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>AI Generate</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                setShowCreateModal(false);
                showToast({
                  type: 'success',
                  title: 'Offer Created',
                  message: 'New offer has been created successfully'
                });
                
                // Add a new offer to the list
                const newOffer: Offer = {
                  id: Date.now().toString(),
                  offer_id: `OFFER-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
                  title: 'New Offer',
                  deal: {
                    id: 'deal-1',
                    name: 'TechCorp Enterprise Deal',
                    value: 75000
                  },
                  contact: {
                    name: 'John Smith',
                    company: 'TechCorp Inc.',
                    email: 'john.smith@techcorp.com'
                  },
                  value: 75000,
                  status: 'draft',
                  created_date: new Date(),
                  created_by: 'Janar Kuusk'
                };
                
                setOffers([newOffer, ...offers]);
              }}
              className="btn-primary"
            >
              Create Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-5 py-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Offers</h1>
          <p className="text-secondary-400 mt-1">{offers.length} offers found</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              showToast({
                type: 'info',
                title: 'Ask Guru',
                message: 'Opening Guru assistant...'
              });
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Guru</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Offer</span>
          </button>
        </div>
      </div>

      {/* AI Insights */}
      {offers.some(o => isExpiringSoon(o.expiry_date)) && (
        <Card className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-600/20">
          <div className="flex items-start space-x-3">
            <Bot className="w-5 h-5 text-yellow-500 mt-1" />
            <div className="flex-1">
              <h4 className="font-medium text-white">⏰ Guru Alert</h4>
              <p className="text-secondary-300 text-sm mt-1">
                {offers.filter(o => isExpiringSoon(o.expiry_date)).length} offers are expiring within 7 days. 
                Consider following up to maintain momentum.
              </p>
              <div className="flex space-x-2 mt-3">
                <button 
                  onClick={handleSendReminders}
                  className="btn-primary text-sm"
                >
                  Send Reminders
                </button>
                <button 
                  onClick={handleExtendDeadlines}
                  className="btn-secondary text-sm"
                >
                  Extend Deadlines
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <button 
            onClick={() => {
              showToast({
                type: 'info',
                title: 'Filters',
                message: 'Opening filter options...'
              });
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex space-x-2">
          {['all', 'draft', 'sent', 'viewed', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{offers.length}</div>
            <div className="text-secondary-400 text-sm">Total Offers</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {offers.filter(o => o.status === 'sent').length}
            </div>
            <div className="text-secondary-400 text-sm">Sent</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {offers.filter(o => o.status === 'accepted').length}
            </div>
            <div className="text-secondary-400 text-sm">Accepted</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              ${offers.reduce((sum, o) => sum + o.value, 0).toLocaleString()}
            </div>
            <div className="text-secondary-400 text-sm">Total Value</div>
          </div>
        </Card>
      </div>

      {/* Offers Table */}
      <Card className="bg-white/10 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-700">
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Offer ID</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Title</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Value</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Created</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-secondary-400">Loading offers...</p>
                  </td>
                </tr>
              ) : filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => (
                  <tr key={offer.id} className="border-b border-secondary-700 hover:bg-secondary-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-primary-400 bg-primary-600/10 px-2 py-1 rounded">
                        {offer.offer_id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-secondary-400" />
                        <div>
                          <div className="font-medium text-white">{offer.title}</div>
                          <div className="text-sm text-secondary-400">{offer.deal.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{offer.contact.name}</div>
                          <div className="text-sm text-secondary-400">{offer.contact.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-green-500">
                        ${offer.value.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(offer.status)}
                        {isExpiringSoon(offer.expiry_date) && (
                          <Badge variant="warning" size="sm">Expires Soon</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-secondary-300">
                        {offer.created_date.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-secondary-500">
                        by {offer.created_by}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {offer.file_url && (
                          <button
                            onClick={() => {
                              showToast({
                                type: 'info',
                                title: 'View Document',
                                message: 'Opening offer document...'
                              });
                            }}
                            className="p-1 rounded hover:bg-secondary-600 text-secondary-400 hover:text-white transition-colors"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {offer.file_url && (
                          <button
                            onClick={() => {
                              showToast({
                                type: 'info',
                                title: 'Download',
                                message: 'Downloading offer document...'
                              });
                            }}
                            className="p-1 rounded hover:bg-secondary-600 text-secondary-400 hover:text-white transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            showToast({
                              type: 'info',
                              title: 'Edit Offer',
                              message: 'Opening offer editor...'
                            });
                          }}
                          className="p-1 rounded hover:bg-secondary-600 text-secondary-400 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            showToast({
                              type: 'info',
                              title: 'Delete Offer',
                              message: 'Confirm offer deletion...'
                            });
                          }}
                          className="p-1 rounded hover:bg-red-600 text-secondary-400 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {offer.status === 'sent' && (
                          <button
                            onClick={() => {
                              showToast({
                                type: 'info',
                                title: 'Share Link',
                                message: 'Copying share link to clipboard...'
                              });
                            }}
                            className="p-1 rounded hover:bg-secondary-600 text-secondary-400 hover:text-white transition-colors"
                            title="Share Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <FileText className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
                    <p className="text-secondary-400 text-lg">No offers found</p>
                    <p className="text-secondary-500 text-sm mt-2">
                      {searchTerm ? 'Try adjusting your search criteria' : 'Create your first offer to get started'}
                    </p>
                    {!searchTerm && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="btn-primary"
                        >
                          Create First Offer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {showCreateModal && <CreateOfferModal />}
    </div>
  );
};

export default Offers;