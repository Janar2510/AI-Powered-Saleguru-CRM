import React, { useState, useEffect } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spline from '@splinetool/react-spline';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard, 
  Banknote,
  Calculator,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  Calendar,
  CheckSquare,
  BarChart3,
  TrendingUp as TrendingUpIcon,
  Activity,
  Clock,
  Shield,
  Lock,
  Settings,
  Bell,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  PieChart,
  LineChart,
  BarChart,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Bot,
  Sparkles,
  Filter as FilterIcon,
  Settings as SettingsIcon,
  Eye as EyeIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Plus as PlusIcon,
  MoreHorizontal as MoreHorizontalIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon2,
  Upload as UploadIcon2,
  Bot as BotIcon,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { accountingService } from '../services/accountingService';
import { useToastContext } from '../contexts/ToastContext';
import BrandDesigner from '../components/BrandDesigner';
import { useAuth } from '../contexts/AuthContext';

// Quick Action Button Component
const QuickActionButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  gradient: string;
}> = ({ icon: Icon, label, onClick, gradient }) => (
  <button
    onClick={onClick}
    className={`${gradient} p-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center space-y-3 min-h-[120px]`}
  >
    <Icon className="w-8 h-8" />
    <span>{label}</span>
  </button>
);

const Accounting: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'reports' | 'settings' | 'analytics' | 'branding'>('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const { showToast } = useToastContext();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesData, paymentsData, analyticsData] = await Promise.all([
        accountingService.getInvoices(),
        accountingService.getPayments(),
        accountingService.getFinancialSummary()
      ]);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading accounting data:', error);
      showToast({ title: 'Error loading data', type: 'error' });
    }
  };

  const quickActions = [
    { 
      icon: Receipt, 
      label: 'New Invoice', 
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800',
      action: async () => {
        try {
          const newInvoice = await accountingService.createInvoice({
            number: `INV${Date.now()}`,
            customer_name: 'New Customer',
            amount: 0,
            status: 'draft',
            date: new Date().toISOString().split('T')[0]
          });
          setInvoices(prev => [newInvoice, ...prev]);
          showToast({ title: 'Invoice created successfully', type: 'success' });
        } catch (error) {
          console.error('Error creating invoice:', error);
          showToast({ title: 'Error creating invoice', type: 'error' });
        }
      }
    },
    { 
      icon: CreditCard, 
      label: 'Record Payment', 
      gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800',
      action: async () => {
        try {
          const newPayment = await accountingService.createPayment({
            reference: `PAY${Date.now()}`,
            amount: 0,
            status: 'pending',
            payment_method: 'bank_transfer'
          });
          setPayments(prev => [newPayment, ...prev]);
          showToast({ title: 'Payment recorded successfully', type: 'success' });
        } catch (error) {
          console.error('Error recording payment:', error);
          showToast({ title: 'Error recording payment', type: 'error' });
        }
      }
    },
    { 
      icon: Calculator, 
      label: 'Financial Reports', 
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-800',
      action: () => setActiveTab('reports')
    },
    { 
      icon: Bot, 
      label: 'AI Analytics', 
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700',
      action: () => setActiveTab('analytics')
    },
  ];

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action}`);
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast({ title: 'AI analysis completed', type: 'success' });
    } catch (error) {
      showToast({ title: 'AI analysis failed', type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Container>
      <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
        {/* Spline Background */}
        <div className="fixed inset-0 z-0">
          <Spline
            scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
            className="w-full h-full"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Accounting</h1>
            <p className="text-[#b0b0d0] mt-2">Manage invoices, payments, and financial reports</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="secondary" onClick={handleAIAnalysis} disabled={aiLoading}>
              <Bot className="w-4 h-4 mr-2" />
              {aiLoading ? 'Analyzing...' : 'AI Analysis'}
            </Button>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              icon={action.icon}
              label={action.label}
              onClick={action.action}
              gradient={action.gradient}
            />
          ))}
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Total Invoices</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalInvoices}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">€{analytics.totalAmount?.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Paid Amount</p>
                    <p className="text-2xl font-bold text-white">€{analytics.paidAmount?.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Outstanding</p>
                    <p className="text-2xl font-bold text-white">€{analytics.outstandingAmount?.toLocaleString()}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-[#23233a]/60 backdrop-blur-sm rounded-lg border border-[#23233a]/50">
          <div className="flex border-b border-[#23233a]/30">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'transactions', label: 'Transactions', icon: Activity },
              { key: 'reports', label: 'Reports', icon: FileText },
              { key: 'settings', label: 'Settings', icon: Settings },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp },
              { key: 'branding', label: 'Branding', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Invoices */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Recent Invoices</h3>
                      <div className="space-y-3">
                        {invoices.slice(0, 5).map((invoice) => (
                          <div key={invoice.id} className="flex items-center justify-between p-3 bg-[#23233a]/30 rounded-lg">
                            <div>
                              <p className="text-white font-medium">{invoice.number}</p>
                              <p className="text-[#b0b0d0] text-sm">{invoice.customer_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium">€{invoice.amount}</p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                invoice.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Recent Payments */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Recent Payments</h3>
                      <div className="space-y-3">
                        {payments.slice(0, 5).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 bg-[#23233a]/30 rounded-lg">
                            <div>
                              <p className="text-white font-medium">{payment.reference}</p>
                              <p className="text-[#b0b0d0] text-sm">{payment.payment_method}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium">€{payment.amount}</p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">All Transactions</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="secondary" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                
                <div className="bg-[#23233a]/30 rounded-lg p-6">
                  <p className="text-[#b0b0d0] text-center">Transaction list will be implemented here</p>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Financial Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <div className="p-6 text-center">
                      <BarChart className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <h4 className="text-white font-semibold mb-2">Revenue Report</h4>
                      <p className="text-[#b0b0d0] text-sm">Monthly revenue analysis</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6 text-center">
                      <PieChart className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h4 className="text-white font-semibold mb-2">Payment Analysis</h4>
                      <p className="text-[#b0b0d0] text-sm">Payment method breakdown</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6 text-center">
                      <LineChart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <h4 className="text-white font-semibold mb-2">Cash Flow</h4>
                      <p className="text-[#b0b0d0] text-sm">Cash flow projections</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Accounting Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <div className="p-6">
                      <h4 className="text-white font-semibold mb-4">General Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[#b0b0d0] text-sm">Default Currency</label>
                          <select className="w-full mt-1 bg-[#23233a] border border-[#23233a]/50 rounded-lg px-3 py-2 text-white">
                            <option>EUR</option>
                            <option>USD</option>
                            <option>GBP</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[#b0b0d0] text-sm">Tax Rate (%)</label>
                          <input type="number" className="w-full mt-1 bg-[#23233a] border border-[#23233a]/50 rounded-lg px-3 py-2 text-white" defaultValue="21" />
                        </div>
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6">
                      <h4 className="text-white font-semibold mb-4">Invoice Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[#b0b0d0] text-sm">Invoice Number Prefix</label>
                          <input type="text" className="w-full mt-1 bg-[#23233a] border border-[#23233a]/50 rounded-lg px-3 py-2 text-white" defaultValue="INV" />
                        </div>
                        <div>
                          <label className="text-[#b0b0d0] text-sm">Payment Terms (days)</label>
                          <input type="number" className="w-full mt-1 bg-[#23233a] border border-[#23233a]/50 rounded-lg px-3 py-2 text-white" defaultValue="30" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">AI-Powered Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <div className="p-6">
                      <h4 className="text-white font-semibold mb-4">Revenue Trends</h4>
                      <div className="h-64 bg-[#23233a]/30 rounded-lg flex items-center justify-center">
                        <p className="text-[#b0b0d0]">Chart will be implemented here</p>
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6">
                      <h4 className="text-white font-semibold mb-4">Payment Analysis</h4>
                      <div className="h-64 bg-[#23233a]/30 rounded-lg flex items-center justify-center">
                        <p className="text-[#b0b0d0]">Chart will be implemented here</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Document Branding</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <div className="p-6">
                      <BrandDesigner userId={user?.id || ''} onChange={() => {}} />
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6">
                      <h4 className="text-white font-semibold mb-4">Brand Preview</h4>
                      <div className="h-64 bg-[#23233a]/30 rounded-lg flex items-center justify-center">
                        <p className="text-[#b0b0d0]">Brand preview will be shown here</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Accounting; 