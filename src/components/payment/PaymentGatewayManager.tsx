import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  RefreshCw,
  Eye,
  Download,
  Plus,
  Edit,
  Trash2,
  Shield,
  Lock,
  Unlock,
  Zap,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import Container from '../layout/Container';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { supabase } from '../../services/supabase';

interface PaymentTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: 'stripe' | 'paypal' | 'bank_transfer';
  customer_name: string;
  invoice_id?: string;
  created_at: string;
  updated_at: string;
  gateway_response?: any;
}

interface PaymentGateway {
  id: string;
  name: 'stripe' | 'paypal';
  is_active: boolean;
  api_key?: string;
  secret_key?: string;
  webhook_url?: string;
  supported_currencies: string[];
  transaction_fee_percentage: number;
  created_at: string;
  updated_at: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  is_default: boolean;
  customer_id: string;
  created_at: string;
}

const PaymentGatewayManager: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const { showToast } = useToastContext();

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setIsLoading(true);
    try {
      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Load gateways (simulated data for now)
      const mockGateways: PaymentGateway[] = [
        {
          id: 'stripe_1',
          name: 'stripe',
          is_active: true,
          api_key: 'pk_test_...',
          secret_key: 'sk_test_...',
          webhook_url: 'https://your-domain.com/webhooks/stripe',
          supported_currencies: ['USD', 'EUR', 'GBP'],
          transaction_fee_percentage: 2.9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'paypal_1',
          name: 'paypal',
          is_active: true,
          api_key: 'client_id_...',
          secret_key: 'client_secret_...',
          webhook_url: 'https://your-domain.com/webhooks/paypal',
          supported_currencies: ['USD', 'EUR', 'GBP', 'CAD'],
          transaction_fee_percentage: 3.5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setGateways(mockGateways);

      // Load payment methods (simulated data)
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 'pm_1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          is_default: true,
          customer_id: 'cus_123',
          created_at: new Date().toISOString()
        },
        {
          id: 'pm_2',
          type: 'paypal',
          is_default: false,
          customer_id: 'cus_123',
          created_at: new Date().toISOString()
        }
      ];
      setPaymentMethods(mockPaymentMethods);
    } catch (error) {
      showToast({ title: 'Error loading payment data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async (amount: number, currency: string, paymentMethod: string) => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction: PaymentTransaction = {
        id: `txn_${Date.now()}`,
        reference: `PAY-${Date.now()}`,
        amount,
        currency,
        status: 'completed',
        payment_method: paymentMethod as 'stripe' | 'paypal',
        customer_name: 'John Doe',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      showToast({ title: 'Payment processed successfully', type: 'success' });
    } catch (error) {
      showToast({ title: 'Payment failed', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return RefreshCw;
      case 'failed': return XCircle;
      case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'stripe': return CreditCard;
      case 'paypal': return DollarSign;
      default: return CreditCard;
    }
  };

  const getGatewayIcon = (gateway: string) => {
    switch (gateway) {
      case 'stripe': return CreditCard;
      case 'paypal': return DollarSign;
      default: return CreditCard;
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Gateway Manager
            </h1>
            <p className="text-[#b0b0d0]">
              Manage Stripe, PayPal, and other payment gateways
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Gateway
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-[#23233a]/30 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'transactions', label: 'Transactions', icon: CreditCard },
            { id: 'gateways', label: 'Gateways', icon: Shield },
            { id: 'methods', label: 'Payment Methods', icon: Lock },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#a259ff] text-white'
                  : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">$45,230</p>
                    <p className="text-[#43e7ad] text-sm">+12.5% from last month</p>
                  </div>
                  <div className="p-3 bg-[#a259ff]/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-[#a259ff]" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Transactions</p>
                    <p className="text-2xl font-bold text-white">1,234</p>
                    <p className="text-[#43e7ad] text-sm">+8.2% from last month</p>
                  </div>
                  <div className="p-3 bg-[#377dff]/20 rounded-lg">
                    <CreditCard className="w-6 h-6 text-[#377dff]" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-white">98.5%</p>
                    <p className="text-[#43e7ad] text-sm">+0.3% from last month</p>
                  </div>
                  <div className="p-3 bg-[#43e7ad]/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-[#43e7ad]" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#b0b0d0] text-sm">Active Gateways</p>
                    <p className="text-2xl font-bold text-white">2</p>
                    <p className="text-[#b0b0d0] text-sm">Stripe & PayPal</p>
                  </div>
                  <div className="p-3 bg-[#ff6b6b]/20 rounded-lg">
                    <Shield className="w-6 h-6 text-[#ff6b6b]" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                <Button variant="secondary" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => {
                  const StatusIcon = getStatusIcon(transaction.status);
                  const MethodIcon = getPaymentMethodIcon(transaction.payment_method);
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-[#23233a]/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                          <MethodIcon className="w-5 h-5 text-[#a259ff]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{transaction.customer_name}</p>
                          <p className="text-[#b0b0d0] text-sm">{transaction.reference}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-medium">${transaction.amount.toFixed(2)}</p>
                          <p className="text-[#b0b0d0] text-sm">{transaction.currency}</p>
                        </div>
                        <Badge variant={getStatusColor(transaction.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Payment Transactions</h2>
              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Payment
                </Button>
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#23233a]/30">
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Reference</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Method</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => {
                      const StatusIcon = getStatusIcon(transaction.status);
                      const MethodIcon = getPaymentMethodIcon(transaction.payment_method);
                      
                      return (
                        <tr key={transaction.id} className="border-b border-[#23233a]/20">
                          <td className="py-3 px-4">
                            <p className="text-white font-medium">{transaction.reference}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-white">{transaction.customer_name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-white font-medium">${transaction.amount.toFixed(2)}</p>
                            <p className="text-[#b0b0d0] text-sm">{transaction.currency}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <MethodIcon className="w-4 h-4 text-[#a259ff]" />
                              <span className="text-white capitalize">{transaction.payment_method}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getStatusColor(transaction.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-[#b0b0d0] text-sm">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="secondary">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Gateways Tab */}
        {activeTab === 'gateways' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Payment Gateways</h2>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Gateway
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gateways.map((gateway) => {
                const GatewayIcon = getGatewayIcon(gateway.name);
                
                return (
                  <Card key={gateway.id} className="hover:bg-[#23233a]/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-[#a259ff]/20 rounded-lg">
                          <GatewayIcon className="w-6 h-6 text-[#a259ff]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white capitalize">{gateway.name}</h3>
                          <Badge variant={gateway.is_active ? 'success' : 'secondary'}>
                            {gateway.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[#b0b0d0] text-sm">Transaction Fee</span>
                        <span className="text-white font-medium">{gateway.transaction_fee_percentage}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[#b0b0d0] text-sm">Supported Currencies</span>
                        <span className="text-white text-sm">{gateway.supported_currencies.join(', ')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[#b0b0d0] text-sm">Webhook URL</span>
                        <span className="text-white text-sm truncate max-w-32">{gateway.webhook_url}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-4 border-t border-[#23233a]/30">
                      <Button size="sm" variant="secondary" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button size="sm" variant="secondary" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Method
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="hover:bg-[#23233a]/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                        <CreditCard className="w-5 h-5 text-[#a259ff]" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium capitalize">{method.type}</h3>
                        {method.last4 && (
                          <p className="text-[#b0b0d0] text-sm">•••• {method.last4}</p>
                        )}
                      </div>
                    </div>
                    {method.is_default && (
                      <Badge variant="success" size="sm">Default</Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-3 border-t border-[#23233a]/30">
                    <Button size="sm" variant="secondary" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Payment Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Gateway Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Default Gateway</label>
                    <select className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]">
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Default Currency</label>
                    <select className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Webhook URL</label>
                    <input
                      type="text"
                      placeholder="https://your-domain.com/webhooks"
                      className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#b0b0d0]">Enable SSL Verification</span>
                    <Button variant="success" size="sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#b0b0d0]">Webhook Signatures</span>
                    <Button variant="success" size="sm">
                      <Shield className="w-4 h-4 mr-2" />
                      Verified
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#b0b0d0]">Fraud Detection</span>
                    <Button variant="warning" size="sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Basic
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default PaymentGatewayManager; 