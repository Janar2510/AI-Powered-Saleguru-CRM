import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Download, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  User, 
  Bot,
  Package,
  ShoppingCart,
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Copy,
  Printer,
  X,
  BarChart3
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import Spline from '@splinetool/react-spline';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { useFeatureLock } from '../hooks/useFeatureLock';
import { useDevMode } from '../contexts/DevModeContext';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  description?: string;
  category?: string;
  unit_of_measure?: string;
  inventory_count?: number;
}

interface OfferItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percent?: number;
  discount_amount?: number;
  final_price: number;
}

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
  items: OfferItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_total: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  created_date: Date;
  sent_date?: Date;
  expiry_date?: Date;
  file_url?: string;
  notes?: string;
  terms_conditions?: string;
  created_by: string;
}

const Offers: React.FC = () => {
  const { showToast } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'offers' | 'templates' | 'analytics'>('offers');
  const { currentPlan } = useDevMode();
  const { withFeatureAccess, FeatureLockModal } = useFeatureLock(currentPlan);

  // Fetch offers from Supabase or use mock data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Load products for offer generation
        const mockProducts: Product[] = [
          {
            id: 'prod-1',
            name: 'Enterprise CRM License',
            sku: 'CRM-ENT-001',
            price: 5000,
            description: 'Annual license for enterprise CRM software',
            category: 'software',
            unit_of_measure: 'license',
            inventory_count: 100
          },
          {
            id: 'prod-2',
            name: 'Data Migration Service',
            sku: 'SVC-MIG-001',
            price: 2500,
            description: 'Professional data migration and integration service',
            category: 'service',
            unit_of_measure: 'hour',
            inventory_count: 50
          },
          {
            id: 'prod-3',
            name: 'Network Switch 24-Port',
            sku: 'HW-SW-24P-001',
            price: 800,
            description: '24-port gigabit network switch for enterprise use',
            category: 'hardware',
            unit_of_measure: 'pcs',
            inventory_count: 15
          },
          {
            id: 'prod-4',
            name: 'Cloud Storage Subscription',
            sku: 'SUB-CLOUD-001',
            price: 100,
            description: 'Monthly cloud storage subscription with backup',
            category: 'subscription',
            unit_of_measure: 'subscription',
            inventory_count: 200
          },
          {
            id: 'prod-5',
            name: 'Premium Support Plan',
            sku: 'SUP-PRM-001',
            price: 1200,
            description: '24/7 priority support with 1-hour response time',
            category: 'subscription',
            unit_of_measure: 'month',
            inventory_count: 75
          }
        ];
        
        setProducts(mockProducts);
        
        // Try to fetch offers from Supabase
        const { data, error } = await supabase
          .from('offers')
          .select('*, deals(id, title, value)')
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
              value: offer.deals?.value || offer.total || 0
            },
            contact: {
              name: offer.contact_name || 'Unknown Contact',
              company: offer.company || 'Unknown Company',
              email: offer.contact_email || 'unknown@example.com'
            },
            items: offer.items || [],
            subtotal: offer.subtotal || 0,
            tax_rate: offer.tax_rate || 0,
            tax_amount: offer.tax_amount || 0,
            discount_total: offer.discount_total || 0,
            total: offer.total || 0,
            status: offer.status || 'draft',
            created_date: new Date(offer.created_at),
            sent_date: offer.sent_at ? new Date(offer.sent_at) : undefined,
            expiry_date: offer.expiry_date ? new Date(offer.expiry_date) : undefined,
            file_url: offer.file_url,
            notes: offer.notes,
            terms_conditions: offer.terms_conditions,
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
            items: [
              {
                product_id: 'prod-1',
                product_name: 'Enterprise CRM License',
                sku: 'CRM-ENT-001',
                quantity: 1,
                unit_price: 5000,
                total_price: 5000,
                final_price: 5000
              },
              {
                product_id: 'prod-5',
                product_name: 'Premium Support Plan',
                sku: 'SUP-PRM-001',
                quantity: 12,
                unit_price: 1200,
                total_price: 14400,
                final_price: 14400
              }
            ],
            subtotal: 19400,
            tax_rate: 0.2,
            tax_amount: 3880,
            discount_total: 0,
            total: 23280,
            status: 'sent',
            created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            sent_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            expiry_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
            file_url: '/offers/enterprise-software-package.pdf',
            notes: 'Customized proposal with 3-year support package',
            terms_conditions: 'All terms and conditions apply.',
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
            items: [
              {
                product_id: 'prod-2',
                product_name: 'Data Migration Service',
                sku: 'SVC-MIG-001',
                quantity: 10,
                unit_price: 2500,
                total_price: 25000,
                final_price: 25000
              }
            ],
            subtotal: 25000,
            tax_rate: 0.1,
            tax_amount: 2500,
            discount_total: 0,
            total: 27500,
            status: 'draft',
            created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            notes: 'Waiting for technical requirements confirmation',
            terms_conditions: 'Service delivery subject to technical review.',
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
            items: [
              {
                product_id: 'prod-5',
                product_name: 'Premium Support Plan',
                sku: 'SUP-PRM-001',
                quantity: 12,
                unit_price: 1200,
                total_price: 14400,
                discount_percent: 15,
                discount_amount: 2160,
                final_price: 12240
              }
            ],
            subtotal: 14400,
            tax_rate: 0.1,
            tax_amount: 1440,
            discount_total: 2160,
            total: 13680,
            status: 'accepted',
            created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            sent_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            file_url: '/offers/support-plan-renewal.pdf',
            notes: 'Annual renewal with 15% discount applied',
            terms_conditions: 'Renewal is subject to availability and final approval.',
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
            items: [
              {
                product_id: 'prod-2',
                product_name: 'Data Migration Service',
                sku: 'SVC-MIG-001',
                quantity: 24,
                unit_price: 2500,
                total_price: 60000,
                final_price: 60000
              }
            ],
            subtotal: 60000,
            tax_rate: 0.1,
            tax_amount: 6000,
            discount_total: 0,
            total: 66000,
            status: 'viewed',
            created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            sent_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            expiry_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            file_url: '/offers/security-audit-package.pdf',
            notes: 'Comprehensive security assessment and implementation',
            terms_conditions: 'Audit results and recommendations are subject to final review.',
            created_by: 'Mike Chen'
          }
        ];
        
        setOffers(mockOffers);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.offer_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateOfferFromProducts = () => {
    setShowProductSelector(true);
  };

  const handleProductSelection = (productIds: string[]) => {
    setSelectedProducts(new Set(productIds));
    setShowProductSelector(false);
    setShowCreateModal(true);
  };

  const handleGenerateOffer = (offerData: Partial<Offer>) => {
    const selectedProductItems = Array.from(selectedProducts).map(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      
      return {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price,
        final_price: product.price
      };
    }).filter(Boolean) as OfferItem[];

    const subtotal = selectedProductItems.reduce((sum, item) => sum + item.final_price, 0);
    const tax_rate = 0.1; // Default 10% tax
    const tax_amount = subtotal * tax_rate;
    const total = subtotal + tax_amount;

    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      offer_id: `OFFER-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      title: offerData.title || 'New Offer',
      deal: offerData.deal || {
        id: 'deal-new',
        name: 'New Deal',
        value: total
      },
      contact: offerData.contact || {
        name: 'New Contact',
        company: 'New Company',
        email: 'contact@company.com'
      },
      items: selectedProductItems,
      subtotal,
      tax_rate,
      tax_amount,
      discount_total: 0,
      total,
      status: 'draft',
      created_date: new Date(),
      notes: offerData.notes,
      terms_conditions: offerData.terms_conditions || 'All terms and conditions apply.',
      created_by: 'Janar Kuusk'
    };

    setOffers([newOffer, ...offers]);
    setShowCreateModal(false);
    setSelectedProducts(new Set());
    showToast({ title: 'Offer created successfully', type: 'success' });
  };

  const handleSendOffer = (offerId: string) => {
    setOffers(offers.map(offer => 
      offer.id === offerId 
        ? { ...offer, status: 'sent', sent_date: new Date() }
        : offer
    ));
    showToast({ title: 'Offer sent successfully', type: 'success' });
  };

  const handleCopyOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      const copiedOffer: Offer = {
        ...offer,
        id: `offer-${Date.now()}`,
        offer_id: `OFFER-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        status: 'draft',
        created_date: new Date(),
        sent_date: undefined
      };
      setOffers([copiedOffer, ...offers]);
      showToast({ title: 'Offer copied successfully', type: 'success' });
    }
  };

  const handleDeleteOffer = (offerId: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      setOffers(offers.filter(offer => offer.id !== offerId));
      showToast({ title: 'Offer deleted successfully', type: 'success' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" size="sm" className="text-gray-400 bg-gray-400/20 border-gray-400/30">Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary" size="sm" className="text-blue-400 bg-blue-400/20 border-blue-400/30">Sent</Badge>;
      case 'viewed':
        return <Badge variant="secondary" size="sm" className="text-yellow-400 bg-yellow-400/20 border-yellow-400/30">Viewed</Badge>;
      case 'accepted':
        return <Badge variant="secondary" size="sm" className="text-green-400 bg-green-400/20 border-green-400/30">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="secondary" size="sm" className="text-red-400 bg-red-400/20 border-red-400/30">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary" size="sm" className="text-gray-400 bg-gray-400/20 border-gray-400/30">Expired</Badge>;
      default:
        return <Badge variant="secondary" size="sm" className="text-gray-400 bg-gray-400/20 border-gray-400/30">Unknown</Badge>;
    }
  };

  const isExpiringSoon = (expiryDate?: Date) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const handleSendReminders = () => {
    showToast({ title: 'Reminders sent to expiring offers', type: 'success' });
  };

  const handleExtendDeadlines = () => {
    showToast({ title: 'Deadlines extended by 30 days', type: 'success' });
  };

  const totalValue = offers.reduce((sum, offer) => sum + offer.total, 0);
  const acceptedOffers = offers.filter(offer => offer.status === 'accepted');
  const pendingOffers = offers.filter(offer => ['draft', 'sent', 'viewed'].includes(offer.status));
  const expiringOffers = offers.filter(offer => isExpiringSoon(offer.expiry_date));

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
                  items: [],
                  subtotal: 0,
                  tax_rate: 0.2,
                  tax_amount: 0,
                  discount_total: 0,
                  total: 0,
                  status: 'draft',
                  created_date: new Date(),
                  terms_conditions: 'All terms and conditions apply.',
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

  // Example: Gate the ability to open the create offer modal
  const handleOpenCreateModal = () => {
    withFeatureAccess('offers_management', () => setShowCreateModal(true));
  };

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Background - Same as Dashboard */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay - Same as Dashboard */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Offers & Proposals</h1>
              <p className="text-[#b0b0d0] mt-1">Create, manage, and track your business offers</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCreateOfferFromProducts}
                variant="secondary"
                size="lg"
                icon={Package}
              >
                From Products
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="gradient"
                size="lg"
                icon={Plus}
              >
                Create Offer
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 border-b border-[#23233a]/30">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'offers'
                  ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              Offers
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'offers' && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-white">{offers.length}</div>
                    <div className="text-[#b0b0d0] text-sm">Total Offers</div>
                  </div>
                </div>
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-[#43e7ad]">{acceptedOffers.length}</div>
                    <div className="text-[#b0b0d0] text-sm">Accepted</div>
                  </div>
                </div>
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-[#f59e0b]">{pendingOffers.length}</div>
                    <div className="text-[#b0b0d0] text-sm">Pending</div>
                  </div>
                </div>
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-[#a259ff]">{formatCurrency(totalValue)}</div>
                    <div className="text-[#b0b0d0] text-sm">Total Value</div>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                      <input
                        type="text"
                        placeholder="Search offers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="viewed">Viewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    {expiringOffers.length > 0 && (
                      <Button
                        onClick={handleSendReminders}
                        variant="secondary"
                        size="sm"
                        icon={Send}
                      >
                        Send Reminders ({expiringOffers.length})
                      </Button>
                    )}
                    <Button
                      onClick={handleExtendDeadlines}
                      variant="secondary"
                      size="sm"
                      icon={Clock}
                    >
                      Extend Deadlines
                    </Button>
                  </div>
                </div>
              </div>

              {/* Offers List */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#b0b0d0]">Loading offers...</p>
                  </div>
                </div>
              ) : filteredOffers.length > 0 ? (
                <div className="space-y-4">
                  {filteredOffers.map((offer) => (
                    <div key={offer.id} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-[#a259ff]" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{offer.title}</h3>
                              <p className="text-sm text-[#b0b0d0]">#{offer.offer_id}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(offer.status)}
                            {isExpiringSoon(offer.expiry_date) && (
                              <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-[#b0b0d0]">Contact</p>
                            <p className="text-white font-medium">{offer.contact.name}</p>
                            <p className="text-sm text-[#b0b0d0]">{offer.contact.company}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#b0b0d0]">Deal</p>
                            <p className="text-white font-medium">{offer.deal.name}</p>
                            <p className="text-sm text-[#b0b0d0]">{offer.items.length} items</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#b0b0d0]">Total Value</p>
                            <p className="text-lg font-bold text-[#43e7ad]">{formatCurrency(offer.total)}</p>
                            <p className="text-sm text-[#b0b0d0]">Created {offer.created_date.toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-[#23233a]/30">
                          <div className="flex items-center space-x-2 text-sm text-[#b0b0d0]">
                            <User className="w-4 h-4" />
                            <span>{offer.created_by}</span>
                            {offer.sent_date && (
                              <>
                                <span>•</span>
                                <span>Sent {offer.sent_date.toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {offer.status === 'draft' && (
                              <Button
                                onClick={() => handleSendOffer(offer.id)}
                                variant="secondary"
                                size="sm"
                                icon={Send}
                              >
                                Send
                              </Button>
                            )}
                            <Button
                              onClick={() => handleCopyOffer(offer.id)}
                              variant="secondary"
                              size="sm"
                              icon={Copy}
                            >
                              Copy
                            </Button>
                            <Button
                              onClick={() => {/* Handle edit */}}
                              variant="secondary"
                              size="sm"
                              icon={Edit}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteOffer(offer.id)}
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              className="text-red-400 hover:text-red-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 text-center py-8">
                  <FileText className="w-12 h-12 text-[#b0b0d0] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No offers found</h3>
                  <p className="text-[#b0b0d0]">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Create your first offer to get started'}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Offer Templates</h2>
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 text-center py-8">
                <FileText className="w-12 h-12 text-[#b0b0d0] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Templates Coming Soon</h3>
                <p className="text-[#b0b0d0]">Pre-built offer templates will be available here</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Offer Analytics</h2>
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 text-center py-8">
                <BarChart3 className="w-12 h-12 text-[#b0b0d0] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Analytics Coming Soon</h3>
                <p className="text-[#b0b0d0]">Detailed offer analytics and insights will be available here</p>
              </div>
            </div>
          )}

          {/* Product Selector Modal */}
          {showProductSelector && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#23233a]/95 backdrop-blur-md rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#23233a]/50">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#23233a]/30">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Select Products for Offer</h2>
                  <button
                    onClick={() => setShowProductSelector(false)}
                    className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedProducts.has(product.id)
                            ? 'bg-[#a259ff]/20 border-[#a259ff]'
                            : 'bg-[#23233a]/50 border-[#23233a]/30 hover:border-[#a259ff]/50'
                        }`}
                        onClick={() => {
                          const newSelected = new Set(selectedProducts);
                          if (newSelected.has(product.id)) {
                            newSelected.delete(product.id);
                          } else {
                            newSelected.add(product.id);
                          }
                          setSelectedProducts(newSelected);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{product.name}</h3>
                          {selectedProducts.has(product.id) && (
                            <CheckCircle className="w-5 h-5 text-[#a259ff]" />
                          )}
                        </div>
                        <p className="text-sm text-[#b0b0d0] mb-2">{product.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#43e7ad] font-semibold">{formatCurrency(product.price)}</span>
                          <span className="text-[#b0b0d0]">SKU: {product.sku}</span>
                        </div>
                        <div className="text-xs text-[#b0b0d0] mt-1">
                          Stock: {product.inventory_count || 0} {product.unit_of_measure}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-[#23233a]/30">
                    <Button
                      onClick={() => setShowProductSelector(false)}
                      variant="secondary"
                      size="lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleProductSelection(Array.from(selectedProducts))}
                      variant="gradient"
                      size="lg"
                      disabled={selectedProducts.size === 0}
                    >
                      Create Offer ({selectedProducts.size} products)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Offer Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#23233a]/95 backdrop-blur-md rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#23233a]/50">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#23233a]/30">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Create New Offer</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                        Offer Title
                      </label>
                      <input
                        type="text"
                        placeholder="Enter offer title..."
                        className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter contact name..."
                          className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          placeholder="Enter company name..."
                          className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                        Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Enter offer notes..."
                        className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      />
                    </div>
                    
                    {selectedProducts.size > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                          Selected Products ({selectedProducts.size})
                        </label>
                        <div className="space-y-2">
                          {Array.from(selectedProducts).map(productId => {
                            const product = products.find(p => p.id === productId);
                            return product ? (
                              <div key={product.id} className="flex items-center justify-between p-3 bg-[#23233a]/30 rounded-lg">
                                <div>
                                  <p className="text-white font-medium">{product.name}</p>
                                  <p className="text-sm text-[#b0b0d0]">{product.sku}</p>
                                </div>
                                <p className="text-[#43e7ad] font-semibold">{formatCurrency(product.price)}</p>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-[#23233a]/30">
                    <Button
                      onClick={() => setShowCreateModal(false)}
                      variant="secondary"
                      size="lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleGenerateOffer({})}
                      variant="gradient"
                      size="lg"
                    >
                      Create Offer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Offers;