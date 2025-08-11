import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { 
  Plus, 
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
  Users,
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
  Gift
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
import { renderTemplate } from '../lib/templates';
import { supabase } from '../services/supabase';

interface SalesOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total_amount: number;
  currency: string;
  order_date: string;
  delivery_date?: string;
  payment_status: string;
  quotation_id?: string;
  contract_id?: string;
  incoterms?: string;
  shipping_route?: string;
  partial_shipping?: boolean;
  created_at: string;
  updated_at: string;
}

const SalesOrders: React.FC = () => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  // State management
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'analytics'>('list');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showInvoicingModal, setShowInvoicingModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showIncotermsModal, setShowIncotermsModal] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  
  // Selected entities
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topCustomers: [],
    salesByCountry: [],
    salesByTeam: [],
    churnRate: 0,
    mrr: 0,
    lifetimeValue: 0,
    cacRatio: 0
  });

  useEffect(() => {
    loadOrders();
    loadAnalytics();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockOrders: SalesOrder[] = [
        {
          id: '1',
          order_number: 'SO-2024-001',
          customer_name: 'Acme Corporation',
          customer_email: 'orders@acme.com',
          status: 'confirmed',
          total_amount: 15000,
          currency: 'EUR',
          order_date: '2024-01-15',
          delivery_date: '2024-02-15',
          payment_status: 'paid',
          quotation_id: 'Q-2024-001',
          contract_id: 'C-2024-001',
          incoterms: 'FOB',
          shipping_route: 'dropship',
          partial_shipping: false,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          order_number: 'SO-2024-002',
          customer_name: 'TechStart Inc',
          customer_email: 'procurement@techstart.com',
          status: 'processing',
          total_amount: 8500,
          currency: 'EUR',
          order_date: '2024-01-20',
          delivery_date: '2024-02-20',
          payment_status: 'pending',
          quotation_id: 'Q-2024-002',
          incoterms: 'CIF',
          shipping_route: 'standard',
          partial_shipping: true,
          created_at: '2024-01-20T14:30:00Z',
          updated_at: '2024-01-20T14:30:00Z'
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load sales orders',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    // Simulate analytics data
    setAnalyticsData({
      totalOrders: 156,
      totalRevenue: 2450000,
      averageOrderValue: 15705,
      conversionRate: 23.5,
      topCustomers: [
        { name: 'Acme Corporation', revenue: 450000 },
        { name: 'TechStart Inc', revenue: 320000 },
        { name: 'Global Solutions', revenue: 280000 }
      ],
      salesByCountry: [
        { country: 'Germany', revenue: 850000 },
        { country: 'USA', revenue: 720000 },
        { country: 'UK', revenue: 480000 }
      ],
      salesByTeam: [
        { team: 'Enterprise', revenue: 1200000 },
        { team: 'SMB', revenue: 850000 },
        { team: 'Startup', revenue: 400000 }
      ],
      churnRate: 8.5,
      mrr: 185000,
      lifetimeValue: 45000,
      cacRatio: 2.8
    });
  };

  // Quick Actions
  const handleConvertQuotation = () => {
    showToast({
      title: 'Convert Quotation',
      description: 'Opening quotation selection...',
      type: 'info'
    });
    // In a real app, this would open a quotation selection modal
  };

  const handleManageInvoicing = () => {
    showToast({
      title: 'Invoicing Management',
      description: 'Opening invoicing dashboard...',
      type: 'info'
    });
    // In a real app, this would open an invoicing management modal
  };

  const handleOrderRoutes = () => {
    showToast({
      title: 'Order Routes',
      description: 'Managing shipping routes...',
      type: 'info'
    });
    // In a real app, this would open a route configuration modal
  };

  const handleContracts = () => {
    showToast({
      title: 'Contracts',
      description: 'Opening contract management...',
      type: 'info'
    });
    // In a real app, this would open a contract management modal
  };

  const handleIncoterms = () => {
    showToast({
      title: 'Incoterms',
      description: 'Configuring Incoterms settings...',
      type: 'info'
    });
    // In a real app, this would open an incoterms configuration modal
  };

  const handleLoyaltyProgram = () => {
    showToast({
      title: 'Loyalty Program',
      description: 'Managing customer loyalty...',
      type: 'info'
    });
    // In a real app, this would open a loyalty program modal
  };

  const handleGenerateDocument = async (order: SalesOrder, type: 'invoice' | 'proforma' | 'receipt') => {
    try {
      // Get user branding
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        showToast({
          title: 'Error',
          description: 'User not authenticated',
          type: 'error'
        });
        return;
      }

      const { data: branding } = await supabase.from('branding').select('*').eq('user_id', user.user.id).single();
      
      // Create document data from order
      const documentData = {
        doc_title: type === 'invoice' ? 'Invoice' : type === 'proforma' ? 'Pro Forma Invoice' : 'Receipt',
        doc_tag: type.toUpperCase(),
        doc_number: order.order_number,
        doc_date: new Date().toLocaleDateString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          address: 'Customer Address' // You would get this from customer data
        },
        items: [], // You would get this from order items
        subtotal: order.total_amount.toString(),
        tax_rate: '20',
        tax_amount: (order.total_amount * 0.2).toFixed(2),
        total: order.total_amount.toString(),
        company_name: branding?.company_name || 'SaleGuru CRM',
        logo_url: branding?.logo_url || '',
        notes: `Generated from Sales Order ${order.order_number}`
      };

      // Generate HTML
      const html = renderTemplate('modern', documentData, branding || {});
      
      // Create blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${order.order_number}.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      showToast({
        title: 'Success',
        description: `${type} document generated successfully`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error generating document:', error);
      showToast({
        title: 'Error',
        description: 'Failed to generate document',
        type: 'error'
      });
    }
  };

  const handleCreateOrder = () => {
    setShowCreateModal(true);
  };

  const handleViewOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleEditOrder = (order: SalesOrder) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // API call to delete order
      setOrders(prev => prev.filter(order => order.id !== orderId));
      showToast({
        title: 'Success',
        description: 'Sales order deleted successfully',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to delete sales order',
        type: 'error'
      });
    }
  };

  const handleSaveOrder = async (updatedOrder: any) => {
    try {
      if (editingOrder) {
        // Update existing order
        setOrders(prev => prev.map(order => 
          order.id === editingOrder.id ? { ...order, ...updatedOrder } : order
        ));
      } else {
        // Create new order
        const newOrder: SalesOrder = {
          id: Date.now().toString(),
          ...updatedOrder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setOrders(prev => [newOrder, ...prev]);
      }
      
      showToast({
        title: 'Success',
        description: `Sales order ${editingOrder ? 'updated' : 'created'} successfully`,
        type: 'success'
      });
      setShowEditModal(false);
      setEditingOrder(null);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to save sales order',
        type: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500/20 text-gray-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
      processing: 'bg-yellow-500/20 text-yellow-400',
      shipped: 'bg-purple-500/20 text-purple-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      partial: 'bg-orange-500/20 text-orange-400',
      paid: 'bg-green-500/20 text-green-400',
      overdue: 'bg-red-500/20 text-red-400'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{analyticsData.totalOrders}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">€{analyticsData.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-white">€{analyticsData.averageOrderValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{analyticsData.conversionRate}%</p>
            </div>
            <Target className="w-8 h-8 text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#b0b0d0]">MRR</span>
              <span className="text-white font-medium">€{analyticsData.mrr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b0b0d0]">Lifetime Value</span>
              <span className="text-white font-medium">€{analyticsData.lifetimeValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b0b0d0]">CAC Ratio</span>
              <span className="text-white font-medium">{analyticsData.cacRatio}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b0b0d0]">Churn Rate</span>
              <span className="text-white font-medium">{analyticsData.churnRate}%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Top Customers</h3>
          <div className="space-y-3">
            {analyticsData.topCustomers.map((customer, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-[#b0b0d0]">{customer.name}</span>
                <span className="text-white font-medium">€{customer.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderOrderList = () => (
    <div className="space-y-4">
      {filteredOrders.map((order) => (
        <Card key={order.id} className="hover:bg-[#23233a]/50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-white font-medium truncate">{order.order_number}</h3>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    {order.payment_status}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-[#b0b0d0]">
                  <span>{order.customer_name}</span>
                  <span>•</span>
                  <span>{order.customer_email}</span>
                  <span>•</span>
                  <span>€{order.total_amount.toLocaleString()}</span>
                  {order.incoterms && (
                    <>
                      <span>•</span>
                      <span className="text-blue-400">{order.incoterms}</span>
                    </>
                  )}
                  {order.shipping_route && (
                    <>
                      <span>•</span>
                      <span className="text-purple-400">{order.shipping_route}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleViewOrder(order)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEditOrder(order)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleGenerateDocument(order, 'invoice')}
                title="Generate Invoice"
              >
                <FileText className="w-4 h-4 mr-2" />
                Invoice
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleGenerateDocument(order, 'proforma')}
                title="Generate Pro Forma"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Pro Forma
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDeleteOrder(order.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const quickActions = [
    { 
      icon: FileText, 
      label: 'Convert Quotation', 
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800',
      action: handleConvertQuotation
    },
    { 
      icon: DollarSign, 
      label: 'Manage Invoicing', 
      gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800',
      action: handleManageInvoicing
    },
    { 
      icon: Truck, 
      label: 'Order Routes', 
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-800',
      action: handleOrderRoutes
    },
    { 
      icon: FileSignature, 
      label: 'Contracts', 
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700',
      action: handleContracts
    },
    { 
      icon: Globe, 
      label: 'Incoterms', 
      gradient: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 hover:from-indigo-600 hover:via-indigo-700 hover:to-purple-800',
      action: handleIncoterms
    },
    { 
      icon: Award, 
      label: 'Loyalty Program', 
      gradient: 'bg-gradient-to-br from-pink-500 via-pink-600 to-rose-700 hover:from-pink-600 hover:via-pink-700 hover:to-rose-800',
      action: handleLoyaltyProgram
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white relative overflow-hidden">
      {/* 3D Spline Background */}
      <div className="absolute inset-0 z-0">
        <Spline 
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
          onError={(error) => {
            console.warn('Spline loading error:', error);
          }}
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23]/80 via-[#1a1a2e]/80 to-[#16213e]/80 z-10"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sales Orders</h1>
            <p className="text-[#b0b0d0]">Manage orders, convert quotations, and track revenue</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={() => setViewMode('analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="primary" onClick={handleCreateOrder}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              icon={action.icon}
              title={action.label}
              description={action.label}
              onClick={action.action}
              gradient={action.gradient}
            />
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b0b0d0] w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="gradient" 
              size="sm" 
              onClick={() => setShowImportModal(true)}
              className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-700 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800"
            >
              Import
            </Button>
            <Button 
              variant="gradient" 
              size="sm" 
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'analytics' ? (
          renderAnalytics()
        ) : (
          renderOrderList()
        )}

        {/* Modals */}
        {showDetailModal && selectedOrder && (
          <DetailViewModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            entity={selectedOrder}
            entityType="sales_order"
            onEdit={handleEditOrder}
            onDelete={handleDeleteOrder}
            onExport={() => {
              setShowDetailModal(false);
              setShowExportModal(true);
            }}
          />
        )}

        {showEditModal && editingOrder && (
          <EditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            entity={editingOrder}
            entityType="sales_order"
            onSave={handleSaveOrder}
          />
        )}

        {showImportModal && (
          <ImportExportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            mode="import"
            entityType="sales_orders"
            onImport={async (data) => {
              console.log('Importing sales orders:', data);
              showToast({
                title: 'Import Successful',
                description: `Imported ${data.length} sales orders`,
                type: 'success'
              });
            }}
          />
        )}

        {showExportModal && (
          <ImportExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            mode="export"
            entityType="sales_orders"
            onExport={async () => {
              console.log('Exporting sales orders');
              showToast({
                title: 'Export Successful',
                description: 'Sales orders exported successfully',
                type: 'success'
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SalesOrders; 