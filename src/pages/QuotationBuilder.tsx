import React, { useState, useEffect } from 'react';
import Container from '../components/layout/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Spline from '@splinetool/react-spline';
import { quotationBuilderService } from '../services/quotationBuilderService';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { 
  FileText, 
  Download, 
  Save, 
  Bot, 
  Plus, 
  Eye, 
  Settings,
  Upload,
  Palette,
  Image as ImageIcon,
  Trash2,
  Copy,
  Share2,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  Calendar,
  CheckSquare,
  DollarSign,
  Calculator,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  Building,
  User,
  Package,
  Truck,
  CreditCard
} from 'lucide-react';

interface Quote {
  id: string;
  quote_number: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'confirmed';
  contact_id?: string;
  company_id?: string;
  deal_id?: string;
  currency: string;
  valid_until?: string;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  created_at: string;
  contact?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  company?: {
    name: string;
  };
  deal?: {
    title: string;
  };
}

interface SalesOrder {
  id: string;
  so_number: string;
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled';
  quote_id?: string;
  contact_id?: string;
  company_id?: string;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  created_at: string;
}

const QuotationBuilder: React.FC = () => {
  const { showToast } = useToastContext();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [activeTab, setActiveTab] = useState<'quotes' | 'sales-orders' | 'workflow' | 'templates' | 'branding'>('quotes');
  const [aiLoading, setAiLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadQuotes();
    loadSalesOrders();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          contacts (
            first_name,
            last_name,
            email
          ),
          companies (
            name
          ),
          deals (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
      showToast({ title: 'Failed to load quotes', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadSalesOrders = async () => {
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
      setSalesOrders(data || []);
    } catch (error) {
      console.error('Error loading sales orders:', error);
    }
  };

  const handleCreateQuote = async () => {
    try {
      const quoteNumber = `Q${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          quote_number: quoteNumber,
          status: 'draft',
          currency: 'EUR',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totals: {
            subtotal: 0,
            tax: 0,
            total: 0
          }
        })
        .select()
        .single();

      if (error) throw error;
      
      showToast({ title: 'Quote created successfully', type: 'success' });
      loadQuotes();
    } catch (error) {
      console.error('Error creating quote:', error);
      showToast({ title: 'Failed to create quote', type: 'error' });
    }
  };

  const handleConvertToSalesOrder = async (quoteId: string) => {
    try {
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) throw new Error('Quote not found');

      const soNumber = `SO${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      
      const { data, error } = await supabase
        .from('sales_orders')
        .insert({
          so_number: soNumber,
          status: 'draft',
          quote_id: quoteId,
          contact_id: quote.contact_id,
          company_id: quote.company_id,
          totals: quote.totals
        })
        .select()
        .single();

      if (error) throw error;

      // Update quote status to confirmed
      await supabase
        .from('quotes')
        .update({ status: 'confirmed' })
        .eq('id', quoteId);

      showToast({ title: 'Sales Order created successfully', type: 'success' });
      loadQuotes();
      loadSalesOrders();
    } catch (error) {
      console.error('Error converting to sales order:', error);
      showToast({ title: 'Failed to create sales order', type: 'error' });
    }
  };

  const handleGenerateInvoice = async (soId: string) => {
    try {
      const salesOrder = salesOrders.find(so => so.id === soId);
      if (!salesOrder) throw new Error('Sales Order not found');

      const invoiceNumber = `INV${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          status: 'draft',
          so_id: soId,
          contact_id: salesOrder.contact_id,
          company_id: salesOrder.company_id,
          currency: 'EUR',
          totals: salesOrder.totals,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      showToast({ title: 'Invoice generated successfully', type: 'success' });
    } catch (error) {
      console.error('Error generating invoice:', error);
      showToast({ title: 'Failed to generate invoice', type: 'error' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Draft' },
      sent: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Sent' },
      accepted: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Accepted' },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Rejected' },
      expired: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Expired' },
      confirmed: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Confirmed' },
      fulfilled: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Fulfilled' },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

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
              <h1 className="text-3xl font-bold text-white mb-2">Quotation Builder</h1>
              <p className="text-[#b0b0d0]">Odoo-inspired workflow: Quote → Sales Order → Delivery → Invoice → Payment</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('workflow')}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Workflow</span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Palette className="w-4 h-4" />
                <span>Branding</span>
              </button>
              <button
                onClick={handleCreateQuote}
                className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Quote</span>
              </button>
            </div>
          </div>

          {/* Workflow Overview */}
          {activeTab === 'workflow' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-[#a259ff]" />
                <span>Odoo-Inspired Sales Workflow</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">1. Quote</h3>
                  <p className="text-[#b0b0d0] text-sm">Create professional quotes with product selection and pricing</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#377dff] to-[#00d4ff] rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">2. Sales Order</h3>
                  <p className="text-[#b0b0d0] text-sm">Convert quotes to sales orders with inventory reservation</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">3. Delivery</h3>
                  <p className="text-[#b0b0d0] text-sm">Manage stock movements and delivery tracking</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00ff88] to-[#ffd700] rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">4. Invoice</h3>
                  <p className="text-[#b0b0d0] text-sm">Generate invoices based on delivered quantities</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#ffd700] to-[#ff6b6b] rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">5. Payment</h3>
                  <p className="text-[#b0b0d0] text-sm">Track payments and reconcile with invoices</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            {[
              { id: 'quotes', label: 'Quotes', icon: FileText },
              { id: 'sales-orders', label: 'Sales Orders', icon: ShoppingCart },
              { id: 'workflow', label: 'Workflow', icon: TrendingUp },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'branding', label: 'Branding', icon: Palette }
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

          {/* Quotes Tab */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-[#a259ff]" />
                    <span>Quotes</span>
                  </h3>
                  <button
                    onClick={handleCreateQuote}
                    className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Quote</span>
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : quotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quotes.map((quote) => (
                      <Card key={quote.id} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#a259ff]/30 transition-all">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{quote.quote_number}</h3>
                                <p className="text-sm text-[#b0b0d0]">
                                  {quote.contact ? `${quote.contact.first_name} ${quote.contact.last_name}` : 'No contact'}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(quote.status)}
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#b0b0d0]">Company:</span>
                              <span className="text-white">{quote.company?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#b0b0d0]">Total:</span>
                              <span className="text-white font-semibold">€{quote.totals.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#b0b0d0]">Created:</span>
                              <span className="text-white">{new Date(quote.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {quote.status === 'draft' && (
                              <button
                                onClick={() => handleConvertToSalesOrder(quote.id)}
                                className="bg-gradient-to-r from-[#377dff] to-[#00d4ff] px-3 py-1 rounded-lg text-white text-sm hover:from-[#2d6bff] hover:to-[#00b8e6] transition-all flex items-center space-x-1"
                              >
                                <ArrowRight className="w-3 h-3" />
                                <span>Convert to SO</span>
                              </button>
                            )}
                            <button className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-[#8a8a8a] mx-auto mb-4" />
                    <p className="text-[#b0b0d0] mb-4">No quotes found</p>
                    <button
                      onClick={handleCreateQuote}
                      className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all"
                    >
                      Create Your First Quote
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sales Orders Tab */}
          {activeTab === 'sales-orders' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5 text-[#377dff]" />
                    <span>Sales Orders</span>
                  </h3>
                </div>
                
                {salesOrders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {salesOrders.map((so) => (
                      <Card key={so.id} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#377dff]/30 transition-all">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#377dff] to-[#00d4ff] rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{so.so_number}</h3>
                                <p className="text-sm text-[#b0b0d0]">
                                  {so.contact ? `${so.contact.first_name} ${so.contact.last_name}` : 'No contact'}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(so.status)}
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#b0b0d0]">Total:</span>
                              <span className="text-white font-semibold">€{so.totals.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#b0b0d0]">Created:</span>
                              <span className="text-white">{new Date(so.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {so.status === 'draft' && (
                              <button
                                onClick={() => handleGenerateInvoice(so.id)}
                                className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] px-3 py-1 rounded-lg text-white text-sm hover:from-[#00e676] hover:to-[#00b8e6] transition-all flex items-center space-x-1"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>Generate Invoice</span>
                              </button>
                            )}
                            <button className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-[#8a8a8a] mx-auto mb-4" />
                    <p className="text-[#b0b0d0] mb-4">No sales orders found</p>
                    <p className="text-[#8a8a8a] text-sm">Convert a quote to create your first sales order</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#a259ff]" />
                <span>Quote Templates</span>
              </h3>
              <p className="text-[#b0b0d0] mb-6">Professional quote templates for different industries and use cases</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Standard Quote', description: 'Professional quote template for general business', icon: FileText },
                  { name: 'Service Quote', description: 'Specialized template for service-based businesses', icon: Settings },
                  { name: 'Product Quote', description: 'Template optimized for product sales', icon: Package }
                ].map((template, index) => (
                  <Card key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#a259ff]/30 transition-all cursor-pointer">
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-lg flex items-center justify-center mx-auto mb-4">
                        <template.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">{template.name}</h4>
                      <p className="text-[#b0b0d0] text-sm">{template.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Palette className="w-5 h-5 text-[#a259ff]" />
                <span>Branding & Design</span>
              </h3>
              <p className="text-[#b0b0d0] mb-6">Customize the appearance of your quotes and documents</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                  <h4 className="font-semibold text-white mb-3">Company Branding</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Company Logo</label>
                      <div className="w-32 h-16 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-[#8a8a8a]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Primary Color</label>
                      <input type="color" className="w-full h-10 rounded-lg border border-white/10" defaultValue="#a259ff" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                  <h4 className="font-semibold text-white mb-3">Document Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Default Currency</label>
                      <select className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white">
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Quote Validity (days)</label>
                      <input type="number" className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white" defaultValue="30" />
                    </div>
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

export default QuotationBuilder; 