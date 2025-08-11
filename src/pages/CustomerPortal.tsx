import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  DollarSign, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin,
  Package,
  CreditCard,
  Download,
  Share2,
  Star,
  Zap,
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  ArrowRight,
  FileSignature,
  Globe,
  Building,
  UserCheck,
  Award,
  Gift,
  Crown,
  Heart,
  Shield,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  Lock,
  Unlock,
  EyeOff,
  Eye as EyeIcon,
  Plus,
  ShoppingCart,
  Receipt,
  FileText as QuoteIcon
} from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { useGuru } from '../contexts/GuruContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card } from '../components/common/Card';
import QuickActionButton from '../components/ui/QuickActionButton';
import DetailViewModal from '../components/common/DetailViewModal';
import EditModal from '../components/common/EditModal';
import ImportExportModal from '../components/common/ImportExportModal';
import { supabase } from '../services/supabase';

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  loyalty_points: number;
  loyalty_tier: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  created_at: string;
  updated_at: string;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  order_date: string;
  delivery_date?: string;
  tracking_number?: string;
  delivery_status?: string;
  signature_required: boolean;
  signature_status: string;
  payment_status: string;
}

interface CustomerDocument {
  id: string;
  type: 'quote' | 'invoice' | 'receipt' | 'contract';
  document_number: string;
  status: string;
  amount?: number;
  currency: string;
  created_at: string;
  due_date?: string;
  download_url?: string;
  signature_required: boolean;
  signature_status: string;
}

const CustomerPortal: React.FC = () => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [customerDocuments, setCustomerDocuments] = useState<CustomerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'orders' | 'documents' | 'payments' | 'loyalty'>('overview');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [analyticsData, setAnalyticsData] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    loyaltyEnrollment: 0,
    averageOrderValue: 0,
    loyaltyTiers: [] as any[],
    topCustomers: [] as any[]
  });

  useEffect(() => {
    loadCustomers();
    loadCustomerOrders();
    loadCustomerDocuments();
    loadAnalytics();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          companies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCustomers: Customer[] = (data || []).map(contact => ({
        id: contact.id,
        name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        email: contact.email || '',
        company: contact.companies?.name || '',
        status: 'active',
        loyalty_points: Math.floor(Math.random() * 1000),
        loyalty_tier: ['bronze', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)],
        total_orders: Math.floor(Math.random() * 50),
        total_spent: Math.floor(Math.random() * 10000),
        last_order_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: contact.created_at,
        updated_at: contact.updated_at || contact.created_at
      }));

      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      showToast({ title: 'Failed to load customers', type: 'error' });
    }
  };

  const loadCustomerOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          contacts (
            first_name,
            last_name,
            email
          ),
          companies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: CustomerOrder[] = (data || []).map(so => ({
        id: so.id,
        order_number: so.so_number,
        status: so.status,
        total_amount: so.totals?.total || 0,
        currency: 'EUR',
        order_date: so.created_at,
        delivery_date: so.status === 'fulfilled' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        tracking_number: so.status === 'fulfilled' ? `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}` : undefined,
        delivery_status: so.status === 'fulfilled' ? 'delivered' : so.status === 'confirmed' ? 'processing' : 'pending',
        signature_required: Math.random() > 0.5,
        signature_status: Math.random() > 0.5 ? 'signed' : 'pending',
        payment_status: so.status === 'fulfilled' ? 'paid' : 'pending'
      }));

      setCustomerOrders(formattedOrders);
    } catch (error) {
      console.error('Error loading customer orders:', error);
    }
  };

  const loadCustomerDocuments = async () => {
    try {
      // Load quotes, invoices, and other documents
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;
      if (invoicesError) throw invoicesError;

      const formattedDocuments: CustomerDocument[] = [
        ...(quotes || []).map(quote => ({
          id: quote.id,
          type: 'quote' as const,
          document_number: quote.quote_number,
          status: quote.status,
          amount: quote.totals?.total || 0,
          currency: quote.currency || 'EUR',
          created_at: quote.created_at,
          due_date: quote.valid_until,
          signature_required: false,
          signature_status: 'not_required'
        })),
        ...(invoices || []).map(invoice => ({
          id: invoice.id,
          type: 'invoice' as const,
          document_number: invoice.invoice_number,
          status: invoice.status,
          amount: invoice.totals?.total || 0,
          currency: invoice.currency || 'EUR',
          created_at: invoice.created_at,
          due_date: invoice.due_date,
          signature_required: false,
          signature_status: 'not_required'
        }))
      ];

      setCustomerDocuments(formattedDocuments);
    } catch (error) {
      console.error('Error loading customer documents:', error);
    }
  };

  const loadAnalytics = async () => {
    // Mock analytics data
    setAnalyticsData({
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      loyaltyEnrollment: 85,
      averageOrderValue: 1250,
      loyaltyTiers: [
        { tier: 'bronze', count: 45, points: 0 },
        { tier: 'silver', count: 28, points: 100 },
        { tier: 'gold', count: 15, points: 500 },
        { tier: 'platinum', count: 8, points: 1000 }
      ],
      topCustomers: customers.slice(0, 5).map(c => ({
        name: c.name,
        points: c.loyalty_points,
        revenue: c.total_spent
      }))
    });
  };

  const handleLoyaltyProgram = () => {
    setActiveTab('loyalty');
    showToast({ title: 'Loyalty Program', description: 'Opening loyalty program management...', type: 'info' });
  };

  const handleRealTimeTracking = () => {
    showToast({ title: 'Real-Time Tracking', description: 'Opening delivery tracking system...', type: 'info' });
  };

  const handleOrderModification = () => {
    showToast({ title: 'Order Modification', description: 'Opening order modification system...', type: 'info' });
  };

  const handleElectronicSignature = () => {
    showToast({ title: 'Electronic Signature', description: 'Opening e-signature system...', type: 'info' });
  };

  const handleOnlinePayment = () => {
    setActiveTab('payments');
    showToast({ title: 'Online Payment', description: 'Opening payment portal...', type: 'info' });
  };

  const handleCustomerSupport = () => {
    openGuru();
  };

  const handleCreateCustomer = () => {
    setShowEditModal(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => prev.filter(c => c.id !== customerId));
      showToast({ title: 'Customer deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast({ title: 'Failed to delete customer', type: 'error' });
    }
  };

  const handleSaveCustomer = async (updatedCustomer: any) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          first_name: updatedCustomer.name.split(' ')[0],
          last_name: updatedCustomer.name.split(' ').slice(1).join(' '),
          email: updatedCustomer.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedCustomer.id);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === updatedCustomer.id ? { ...c, ...updatedCustomer } : c
      ));
      showToast({ title: 'Customer updated successfully', type: 'success' });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating customer:', error);
      showToast({ title: 'Failed to update customer', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-gray-500/20 text-gray-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      suspended: 'bg-red-500/20 text-red-400'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getLoyaltyTierColor = (tier: string) => {
    const colors = {
      bronze: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      silver: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      platinum: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getOrderStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
      processing: 'bg-yellow-500/20 text-yellow-400',
      shipped: 'bg-purple-500/20 text-purple-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c]">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Customer Portal</h1>
              <p className="text-[#b0b0d0]">Odoo-inspired customer self-service portal with document access, payments, and e-signature</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={openGuru}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Support</span>
              </button>
              <button
                onClick={() => setShowImportExportModal(true)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleCreateCustomer}
                className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <QuickActionButton
              icon={Award}
              label="Loyalty Program"
              onClick={handleLoyaltyProgram}
              gradient="bg-gradient-to-r from-yellow-500 to-orange-500"
            />
            <QuickActionButton
              icon={Truck}
              label="Real-Time Tracking"
              onClick={handleRealTimeTracking}
              gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
            <QuickActionButton
              icon={Edit}
              label="Order Modification"
              onClick={handleOrderModification}
              gradient="bg-gradient-to-r from-green-500 to-emerald-500"
            />
            <QuickActionButton
              icon={FileSignature}
              label="Electronic Signature"
              onClick={handleElectronicSignature}
              gradient="bg-gradient-to-r from-purple-500 to-pink-500"
            />
            <QuickActionButton
              icon={CreditCard}
              label="Online Payment"
              onClick={handleOnlinePayment}
              gradient="bg-gradient-to-r from-indigo-500 to-purple-500"
            />
            <QuickActionButton
              icon={MessageSquare}
              label="Customer Support"
              onClick={handleCustomerSupport}
              gradient="bg-gradient-to-r from-red-500 to-pink-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'loyalty', label: 'Loyalty', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#a259ff] to-[#377dff] text-white'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 text-[#b0b0d0] hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#b0b0d0] text-sm">Total Customers</p>
                      <p className="text-2xl font-bold text-white">{analyticsData.totalCustomers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </Card>
                
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#b0b0d0] text-sm">Active Customers</p>
                      <p className="text-2xl font-bold text-white">{analyticsData.activeCustomers}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-400" />
                  </div>
                </Card>
                
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#b0b0d0] text-sm">Loyalty Enrollment</p>
                      <p className="text-2xl font-bold text-white">{analyticsData.loyaltyEnrollment}%</p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-400" />
                  </div>
                </Card>
                
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#b0b0d0] text-sm">Avg Order Value</p>
                      <p className="text-2xl font-bold text-white">€{analyticsData.averageOrderValue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-400" />
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {customerOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{order.order_number}</p>
                          <p className="text-[#b0b0d0] text-sm">{new Date(order.order_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">€{order.total_amount.toFixed(2)}</p>
                          <Badge className={getOrderStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Documents</h3>
                  <div className="space-y-3">
                    {customerDocuments.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {doc.type === 'quote' ? (
                            <QuoteIcon className="w-5 h-5 text-blue-400" />
                          ) : doc.type === 'invoice' ? (
                            <Receipt className="w-5 h-5 text-green-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-purple-400" />
                          )}
                          <div>
                            <p className="text-white font-medium">{doc.document_number}</p>
                            <p className="text-[#b0b0d0] text-sm capitalize">{doc.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">€{doc.amount?.toFixed(2) || '0.00'}</p>
                          <Badge className={doc.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Users className="w-5 h-5 text-[#a259ff]" />
                    <span>Customers</span>
                  </h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#a259ff]/30 transition-all">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {customer.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{customer.name}</h3>
                              <p className="text-sm text-[#b0b0d0]">{customer.company}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#b0b0d0]">Email:</span>
                            <span className="text-white">{customer.email}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#b0b0d0]">Loyalty Points:</span>
                            <span className="text-white font-semibold">{customer.loyalty_points}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#b0b0d0]">Total Orders:</span>
                            <span className="text-white">{customer.total_orders}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#b0b0d0]">Total Spent:</span>
                            <span className="text-white font-semibold">€{customer.total_spent.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getLoyaltyTierColor(customer.loyalty_tier)}>
                            {customer.loyalty_tier.charAt(0).toUpperCase() + customer.loyalty_tier.slice(1)}
                          </Badge>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewCustomer(customer)}
                              className="bg-white/5 backdrop-blur-xl border border-white/10 px-2 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="bg-white/5 backdrop-blur-xl border border-white/10 px-2 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-[#377dff]" />
                  <span>Customer Orders</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customerOrders.map((order) => (
                    <Card key={order.id} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#377dff]/30 transition-all">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#377dff] to-[#00d4ff] rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{order.order_number}</h3>
                              <p className="text-sm text-[#b0b0d0]">{new Date(order.order_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge className={getOrderStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#b0b0d0]">Total Amount:</span>
                            <span className="text-white font-semibold">€{order.total_amount.toFixed(2)}</span>
                          </div>
                          {order.tracking_number && (
                            <div className="flex justify-between text-sm">
                              <span className="text-[#b0b0d0]">Tracking:</span>
                              <span className="text-white">{order.tracking_number}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-[#b0b0d0]">Payment Status:</span>
                            <Badge className={order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                              {order.payment_status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          {order.signature_required && (
                            <button className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-3 py-1 rounded-lg text-white text-sm hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-1">
                              <FileSignature className="w-3 h-3" />
                              <span>Sign</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#a259ff]" />
                  <span>Customer Documents</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customerDocuments.map((doc) => (
                    <Card key={doc.id} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#a259ff]/30 transition-all">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-lg flex items-center justify-center">
                              {doc.type === 'quote' ? (
                                <QuoteIcon className="w-5 h-5 text-white" />
                              ) : doc.type === 'invoice' ? (
                                <Receipt className="w-5 h-5 text-white" />
                              ) : (
                                <FileText className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{doc.document_number}</h3>
                              <p className="text-sm text-[#b0b0d0] capitalize">{doc.type}</p>
                            </div>
                          </div>
                          <Badge className={doc.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                            {doc.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#b0b0d0]">Amount:</span>
                            <span className="text-white font-semibold">€{doc.amount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#b0b0d0]">Created:</span>
                            <span className="text-white">{new Date(doc.created_at).toLocaleDateString()}</span>
                          </div>
                          {doc.due_date && (
                            <div className="flex justify-between text-sm">
                              <span className="text-[#b0b0d0]">Due Date:</span>
                              <span className="text-white">{new Date(doc.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                          <button className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          {doc.signature_required && (
                            <button className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-3 py-1 rounded-lg text-white text-sm hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-1">
                              <FileSignature className="w-3 h-3" />
                              <span>Sign</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-[#00ff88]" />
                  <span>Payment Portal</span>
                </h3>
                <p className="text-[#b0b0d0] mb-6">Secure online payment processing for invoices and orders</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customerDocuments.filter(doc => doc.type === 'invoice' && doc.status !== 'paid').map((invoice) => (
                    <Card key={invoice.id} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#00ff88]/30 transition-all">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-lg flex items-center justify-center">
                              <Receipt className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{invoice.document_number}</h3>
                              <p className="text-sm text-[#b0b0d0]">Invoice</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            Pending
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#b0b0d0]">Amount Due:</span>
                            <span className="text-white font-semibold">€{invoice.amount?.toFixed(2) || '0.00'}</span>
                          </div>
                          {invoice.due_date && (
                            <div className="flex justify-between text-sm">
                              <span className="text-[#b0b0d0]">Due Date:</span>
                              <span className="text-white">{new Date(invoice.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <button className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] px-4 py-2 rounded-lg text-white hover:from-[#00e676] hover:to-[#00b8e6] transition-all flex items-center justify-center space-x-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Pay Now</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loyalty Tab */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#ffd700]" />
                  <span>Loyalty Program</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">Loyalty Tiers</h4>
                    <div className="space-y-3">
                      {analyticsData.loyaltyTiers.map((tier, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge className={getLoyaltyTierColor(tier.tier)}>
                              {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                            </Badge>
                            <span className="text-[#b0b0d0]">{tier.count} customers</span>
                          </div>
                          <span className="text-white font-medium">{tier.points}+ points</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">Top Customers</h4>
                    <div className="space-y-3">
                      {analyticsData.topCustomers.map((customer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{customer.name}</p>
                            <p className="text-[#b0b0d0] text-sm">{customer.points} points</p>
                          </div>
                          <span className="text-white font-medium">€{customer.revenue.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedCustomer && (
        <DetailViewModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          data={selectedCustomer}
          title="Customer Details"
        />
      )}

      {showEditModal && selectedCustomer && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          data={selectedCustomer}
          onSave={handleSaveCustomer}
          title="Edit Customer"
        />
      )}

      {showImportExportModal && (
        <ImportExportModal
          isOpen={showImportExportModal}
          onClose={() => setShowImportExportModal(false)}
          data={customers}
          title="Customer Data"
        />
      )}
    </div>
  );
};

export default CustomerPortal; 