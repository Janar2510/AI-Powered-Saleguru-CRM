import React, { useState, useEffect } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spline from '@splinetool/react-spline';
import { paymentsService } from '../services/paymentsService';
import { useToastContext } from '../contexts/ToastContext';
import { 
  CreditCard, 
  DollarSign, 
  Wallet, 
  Banknote, 
  Plus, 
  Search,
  Filter,
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
  TrendingUp,
  Activity,
  Clock,
  Shield,
  Lock,
  Settings,
  Bell,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  PieChart,
  LineChart,
  BarChart,
  Bot,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Move,
  PackageCheck,
  PackageX,
  Send,
  Receipt,
  Calculator,
  FileText,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Bot as BotIcon,
  Sparkles as SparklesIcon
} from 'lucide-react';

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

const Payments: React.FC = () => {
  const { showToast } = useToastContext();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'gateways' | 'analytics' | 'settings'>('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await paymentsService.getPayments();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      showToast({ title: 'Failed to load transactions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    try {
      const payment = await paymentsService.processPayment(100, 'credit_card', `PAY_${Date.now()}`);
      showToast({ title: 'Payment processed successfully', type: 'success' });
      loadTransactions();
    } catch (error) {
      console.error('Error processing payment:', error);
      showToast({ title: 'Failed to process payment', type: 'error' });
    }
  };

  const handleAddGateway = async () => {
    try {
      const gateway = await paymentsService.createPaymentGateway({
        name: 'New Gateway',
        type: 'stripe',
        config: { api_key: 'test_key' }
      });
      
      showToast({ title: 'Payment gateway added successfully', type: 'success' });
    } catch (error) {
      console.error('Error adding gateway:', error);
      showToast({ title: 'Failed to add gateway', type: 'error' });
    }
  };

  const handleProcessRefund = async () => {
    try {
      const transactionId = selectedTransactions[0] || 'sample-transaction-id';
      const refund = await paymentsService.refundPayment(transactionId, 50, 'Customer request');
      showToast({ title: 'Refund processed successfully', type: 'success' });
      loadTransactions();
    } catch (error) {
      console.error('Error processing refund:', error);
      showToast({ title: 'Failed to process refund', type: 'error' });
    }
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const analytics = await paymentsService.getPaymentAnalytics();
      showToast({ title: 'Analytics generated successfully', type: 'success' });
      setActiveTab('analytics');
    } catch (error) {
      console.error('Error generating analytics:', error);
      showToast({ title: 'Failed to generate analytics', type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const quickActions = [
    { 
      icon: CreditCard, 
      label: 'Process Payment', 
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800',
      action: handleProcessPayment
    },
    { 
      icon: Wallet, 
      label: 'Add Gateway', 
      gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800',
      action: handleAddGateway
    },
    { 
      icon: DollarSign, 
      label: 'Refund', 
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-800',
      action: handleProcessRefund
    },
    { 
      icon: Shield, 
      label: 'AI Analytics', 
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700',
      action: handleAIAnalysis
    },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || transaction.method === filterMethod;
    const matchesSearch = (transaction.client?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (transaction.type?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatus && matchesMethod && matchesSearch;
  });

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for:`, selectedTransactions);
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Payment Management</h1>
                  <p className="text-[#b0b0d0] mt-1 text-sm lg:text-base">Process payments and manage transactions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="secondary" onClick={() => setActiveTab('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="secondary" onClick={() => setActiveTab('analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="gradient" onClick={() => setActiveTab('overview')}>
                  <Activity className="w-4 h-4 mr-2" />
                  Overview
                </Button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                </div>

                {/* Payment Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Total Revenue</p>
                          <p className="text-2xl font-bold text-white">€125,000</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Successful Payments</p>
                          <p className="text-2xl font-bold text-white">1,247</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Failed Payments</p>
                          <p className="text-2xl font-bold text-white">23</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Pending</p>
                          <p className="text-2xl font-bold text-white">15</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Transactions List with Filters */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#a259ff]" />
                      Payment Transactions
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                        <Eye className="w-4 h-4 mr-2" />
                        {viewMode === 'grid' ? 'List' : 'Grid'}
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div className="mb-6 p-4 bg-[#23233a]/60 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Status</label>
                          <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full p-2 bg-[#23233a] border border-[#23233a] rounded-lg text-white"
                          >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Payment Method</label>
                          <select 
                            value={filterMethod} 
                            onChange={(e) => setFilterMethod(e.target.value)}
                            className="w-full p-2 bg-[#23233a] border border-[#23233a] rounded-lg text-white"
                          >
                            <option value="all">All Methods</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Search</label>
                          <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 bg-[#23233a] border border-[#23233a] rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bulk Actions */}
                  {selectedTransactions.length > 0 && (
                    <div className="mb-4 p-3 bg-[#a259ff]/20 border border-[#a259ff]/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">
                          {selectedTransactions.length} transaction(s) selected
                        </span>
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('export')}>
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('refund')}>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Refund
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('delete')}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {filteredTransactions.map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-[#23233a]/60 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTransactions([...selectedTransactions, transaction.id]);
                              } else {
                                setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id));
                              }
                            }}
                            className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]"
                          />
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'Payment' ? 'bg-green-500' :
                            transaction.type === 'Refund' ? 'bg-blue-500' : 'bg-red-500'
                          }`}>
                            {transaction.type === 'Payment' ? <CreditCard className="w-5 h-5 text-white" /> :
                             transaction.type === 'Refund' ? <DollarSign className="w-5 h-5 text-white" /> :
                             <AlertTriangle className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{transaction.type}</p>
                            <p className="text-sm text-[#b0b0d0]">{transaction.client} • {transaction.method}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              €{Math.abs(transaction.amount).toLocaleString()}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              transaction.status === 'completed' ? 'bg-green-500 text-black' :
                              transaction.status === 'pending' ? 'bg-yellow-500 text-black' :
                              'bg-red-500 text-white'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="secondary" size="sm" onClick={() => handleProcessPayment()}>
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* AI Analysis Header */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Bot className="w-5 h-5 text-[#a259ff]" />
                      AI-Powered Payment Analytics
                    </h3>
                    <Button 
                      variant="gradient" 
                      onClick={handleAIAnalysis}
                      disabled={aiLoading}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {aiLoading ? 'Analyzing...' : 'Generate AI Report'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'Revenue Trends', icon: LineChart, gradient: 'from-green-500 to-emerald-600' },
                      { name: 'Payment Methods', icon: PieChart, gradient: 'from-blue-500 to-cyan-600' },
                      { name: 'Gateway Performance', icon: BarChart, gradient: 'from-purple-500 to-indigo-600' },
                      { name: 'Failure Analysis', icon: AlertTriangle, gradient: 'from-red-500 to-pink-600' },
                      { name: 'Customer Payment Patterns', icon: TrendingUp, gradient: 'from-orange-500 to-red-600' },
                      { name: 'Security Metrics', icon: Shield, gradient: 'from-teal-500 to-green-600' },
                    ].map((report, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50 hover:border-[#a259ff]/30 group">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className={`w-10 h-10 bg-gradient-to-br ${report.gradient} rounded-lg flex items-center justify-center mr-3`}>
                              <report.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{report.name}</h3>
                              <p className="text-sm text-[#b0b0d0]">AI-generated insights</p>
                            </div>
                          </div>
                          <Button 
                            variant="gradient" 
                            className="w-full group-hover:scale-105 transition-transform"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#a259ff]" />
                    Payment Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-semibold text-white mb-4">Payment Gateways</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">Stripe</p>
                            <p className="text-sm text-[#b0b0d0]">Credit card processing</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">PayPal</p>
                            <p className="text-sm text-[#b0b0d0]">Digital wallet payments</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">Bank Transfer</p>
                            <p className="text-sm text-[#b0b0d0]">Direct bank transfers</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-semibold text-white mb-4">Security Settings</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">3D Secure</p>
                            <p className="text-sm text-[#b0b0d0]">Enhanced security for cards</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">Fraud Detection</p>
                            <p className="text-sm text-[#b0b0d0]">AI-powered fraud prevention</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">PCI Compliance</p>
                            <p className="text-sm text-[#b0b0d0]">Payment card industry standards</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Payments; 