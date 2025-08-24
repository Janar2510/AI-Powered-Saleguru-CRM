import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, QrCode, Globe, Users, Settings, Plus, Eye, Edit, Download, Send, RefreshCw, AlertTriangle, CheckCircle, Clock, DollarSign, Shield } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'adyen' | 'authorize_net' | 'ogone' | 'alipay' | 'custom';
  status: 'active' | 'inactive' | 'error';
  api_key?: string;
  webhook_url?: string;
  supported_currencies: string[];
  transaction_fee: number;
  last_sync: Date;
  total_transactions: number;
  total_volume: number;
  success_rate: number;
}

interface PaymentMethod {
  id: string;
  customer_id: string;
  customer_name: string;
  type: 'credit_card' | 'bank_account' | 'paypal' | 'digital_wallet';
  last_four?: string;
  expiry_date?: string;
  is_default: boolean;
  status: 'active' | 'expired' | 'suspended';
  created_at: Date;
}

interface CustomerPortal {
  id: string;
  customer_id: string;
  customer_name: string;
  email: string;
  last_login: Date;
  total_invoices: number;
  paid_invoices: number;
  outstanding_balance: number;
  subscription_count: number;
  document_count: number;
  status: 'active' | 'suspended' | 'pending';
}

interface QRCodePayment {
  id: string;
  invoice_id: string;
  invoice_number: string;
  customer: string;
  amount: number;
  currency: string;
  qr_code_url: string;
  payment_url: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  created_at: Date;
  expires_at: Date;
  paid_at?: Date;
}

interface DirectDebit {
  id: string;
  customer_id: string;
  customer_name: string;
  mandate_id: string;
  bank_account: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  status: 'active' | 'pending' | 'suspended' | 'cancelled';
  next_payment_date: Date;
  created_at: Date;
}

const PaymentGatewayManager: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();

  const [activeTab, setActiveTab] = useState<'gateways' | 'methods' | 'portal' | 'qr_payments' | 'direct_debit' | 'settings'>('gateways');
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: 'stripe-1',
      name: 'Stripe',
      type: 'stripe',
      status: 'active',
      api_key: 'sk_test_...',
      webhook_url: 'https://webhook.site/...',
      supported_currencies: ['USD', 'EUR', 'GBP', 'CAD'],
      transaction_fee: 2.9,
      last_sync: new Date(),
      total_transactions: 1247,
      total_volume: 125000.00,
      success_rate: 98.5
    },
    {
      id: 'paypal-1',
      name: 'PayPal',
      type: 'paypal',
      status: 'active',
      api_key: 'paypal_client_id_...',
      webhook_url: 'https://webhook.site/...',
      supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      transaction_fee: 3.5,
      last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      total_transactions: 892,
      total_volume: 89000.00,
      success_rate: 97.2
    },
    {
      id: 'adyen-1',
      name: 'Adyen',
      type: 'adyen',
      status: 'inactive',
      api_key: 'adyen_api_key_...',
      webhook_url: 'https://webhook.site/...',
      supported_currencies: ['USD', 'EUR', 'GBP', 'JPY'],
      transaction_fee: 2.8,
      last_sync: new Date(Date.now() - 24 * 60 * 60 * 1000),
      total_transactions: 0,
      total_volume: 0,
      success_rate: 0
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm-001',
      customer_id: 'cust-001',
      customer_name: 'Tech Solutions Inc.',
      type: 'credit_card',
      last_four: '4242',
      expiry_date: '12/25',
      is_default: true,
      status: 'active',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'pm-002',
      customer_id: 'cust-002',
      customer_name: 'Marketing Pro LLC',
      type: 'paypal',
      is_default: true,
      status: 'active',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'pm-003',
      customer_id: 'cust-003',
      customer_name: 'Design Studio Co.',
      type: 'bank_account',
      last_four: '1234',
      is_default: false,
      status: 'active',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [customerPortals, setCustomerPortals] = useState<CustomerPortal[]>([
    {
      id: 'portal-001',
      customer_id: 'cust-001',
      customer_name: 'Tech Solutions Inc.',
      email: 'billing@techsolutions.com',
      last_login: new Date(Date.now() - 2 * 60 * 60 * 1000),
      total_invoices: 15,
      paid_invoices: 12,
      outstanding_balance: 2750.00,
      subscription_count: 3,
      document_count: 8,
      status: 'active'
    },
    {
      id: 'portal-002',
      customer_id: 'cust-002',
      customer_name: 'Marketing Pro LLC',
      email: 'accounts@marketingpro.com',
      last_login: new Date(Date.now() - 24 * 60 * 60 * 1000),
      total_invoices: 8,
      paid_invoices: 8,
      outstanding_balance: 0,
      subscription_count: 2,
      document_count: 5,
      status: 'active'
    }
  ]);

  const [qrPayments, setQrPayments] = useState<QRCodePayment[]>([
    {
      id: 'qr-001',
      invoice_id: 'INV-2024-001',
      invoice_number: 'INV-2024-001',
      customer: 'Tech Solutions Inc.',
      amount: 2750.00,
      currency: 'USD',
      qr_code_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      payment_url: 'https://pay.example.com/inv-2024-001',
      status: 'pending',
      created_at: new Date(Date.now() - 30 * 60 * 1000),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      id: 'qr-002',
      invoice_id: 'INV-2024-002',
      invoice_number: 'INV-2024-002',
      customer: 'Marketing Pro LLC',
      amount: 1296.00,
      currency: 'USD',
      qr_code_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      payment_url: 'https://pay.example.com/inv-2024-002',
      status: 'paid',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expires_at: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [directDebits, setDirectDebits] = useState<DirectDebit[]>([
    {
      id: 'dd-001',
      customer_id: 'cust-001',
      customer_name: 'Tech Solutions Inc.',
      mandate_id: 'MD-2024-001',
      bank_account: '****1234',
      amount: 1200.00,
      frequency: 'monthly',
      status: 'active',
      next_payment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'dd-002',
      customer_id: 'cust-002',
      customer_name: 'Marketing Pro LLC',
      mandate_id: 'MD-2024-002',
      bank_account: '****5678',
      amount: 500.00,
      frequency: 'quarterly',
      status: 'active',
      next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleToggleGateway = (gatewayId: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === gatewayId 
        ? { ...gateway, status: gateway.status === 'active' ? 'inactive' : 'active' }
        : gateway
    ));
  };

  const handleSyncGateway = (gatewayId: string) => {
    showToast({
      title: 'Syncing Gateway',
      description: 'Updating payment gateway data',
      type: 'info'
    });
    
    setTimeout(() => {
      setGateways(prev => prev.map(gateway => 
        gateway.id === gatewayId 
          ? { ...gateway, last_sync: new Date() }
          : gateway
      ));
      showToast({
        title: 'Sync Complete',
        description: 'Payment gateway data updated',
        type: 'success'
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'error': return 'danger';
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'expired': return 'danger';
      case 'cancelled': return 'secondary';
      case 'suspended': return 'warning';
      default: return 'secondary';
    }
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'stripe': return CreditCard;
      case 'paypal': return CreditCard;
      case 'adyen': return CreditCard;
      case 'authorize_net': return CreditCard;
      case 'ogone': return CreditCard;
      case 'alipay': return CreditCard;
      default: return CreditCard;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#a259ff]" />
              <span>Payment Gateway Manager</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Manage payment gateways, customer portals, and online payments
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#23233a]/30">
          {[
            { id: 'gateways', name: 'Payment Gateways', icon: CreditCard },
            { id: 'methods', name: 'Payment Methods', icon: Shield },
            { id: 'portal', name: 'Customer Portal', icon: Users },
            { id: 'qr_payments', name: 'QR Payments', icon: QrCode },
            { id: 'direct_debit', name: 'Direct Debit', icon: DollarSign },
            { id: 'settings', name: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'gateways' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Payment Gateways</h4>
                <Button variant="gradient" size="sm" icon={Plus}>
                  Add Gateway
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gateways.map(gateway => {
                  const Icon = getGatewayIcon(gateway.type);
                  return (
                    <Card key={gateway.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[#a259ff]" />
                          </div>
                          <div>
                            <h5 className="font-medium text-white">{gateway.name}</h5>
                            <p className="text-xs text-[#b0b0d0] capitalize">{gateway.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(gateway.status) as any} size="sm">
                          {gateway.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#b0b0d0]">Fee:</span>
                          <span className="text-white">{gateway.transaction_fee}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#b0b0d0]">Transactions:</span>
                          <span className="text-white">{gateway.total_transactions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#b0b0d0]">Volume:</span>
                          <span className="text-white">{formatCurrency(gateway.total_volume)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#b0b0d0]">Success Rate:</span>
                          <span className="text-white">{gateway.success_rate}%</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant={gateway.status === 'active' ? 'secondary' : 'gradient'}
                          size="sm"
                          onClick={() => handleToggleGateway(gateway.id)}
                        >
                          {gateway.status === 'active' ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={RefreshCw}
                          onClick={() => handleSyncGateway(gateway.id)}
                        >
                          Sync
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'methods' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Payment Methods</h4>
              
              <div className="space-y-4">
                {paymentMethods.map(method => (
                  <Card key={method.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-white">{method.customer_name}</h5>
                        <p className="text-sm text-[#b0b0d0] capitalize">{method.type.replace('_', ' ')}</p>
                        {method.last_four && (
                          <p className="text-sm text-[#b0b0d0]">****{method.last_four}</p>
                        )}
                        {method.expiry_date && (
                          <p className="text-sm text-[#b0b0d0]">Expires: {method.expiry_date}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.is_default && (
                          <Badge variant="success" size="sm">Default</Badge>
                        )}
                        <Badge variant={getStatusColor(method.status) as any} size="sm">
                          {method.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'portal' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Customer Portal</h4>
              
              <div className="space-y-4">
                {customerPortals.map(portal => (
                  <Card key={portal.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{portal.customer_name}</h5>
                        <p className="text-sm text-[#b0b0d0]">{portal.email}</p>
                        <p className="text-xs text-[#b0b0d0]">
                          Last login: {portal.last_login.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(portal.status) as any} size="sm">
                        {portal.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{portal.total_invoices}</div>
                        <div className="text-xs text-[#b0b0d0]">Total Invoices</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{portal.paid_invoices}</div>
                        <div className="text-xs text-[#b0b0d0]">Paid Invoices</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{formatCurrency(portal.outstanding_balance)}</div>
                        <div className="text-xs text-[#b0b0d0]">Outstanding</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{portal.subscription_count}</div>
                        <div className="text-xs text-[#b0b0d0]">Subscriptions</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View Portal
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Manage Access
                      </Button>
                      <Button variant="secondary" size="sm">
                        Send Invite
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'qr_payments' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">QR Code Payments</h4>
              
              <div className="space-y-4">
                {qrPayments.map(payment => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{payment.invoice_number}</h5>
                        <p className="text-sm text-[#b0b0d0]">{payment.customer}</p>
                        <p className="text-xs text-[#b0b0d0]">
                          Created: {payment.created_at.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-[#b0b0d0]">
                          Expires: {payment.expires_at.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(payment.status) as any} size="sm">
                          {payment.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            {payment.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={QrCode}>
                        View QR
                      </Button>
                      <Button variant="secondary" size="sm" icon={Download}>
                        Download
                      </Button>
                      <Button variant="secondary" size="sm">
                        Share Link
                      </Button>
                      {payment.status === 'pending' && (
                        <Button variant="danger" size="sm">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'direct_debit' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Direct Debit Mandates</h4>
              
              <div className="space-y-4">
                {directDebits.map(debit => (
                  <Card key={debit.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{debit.customer_name}</h5>
                        <p className="text-sm text-[#b0b0d0]">Mandate: {debit.mandate_id}</p>
                        <p className="text-sm text-[#b0b0d0]">Account: {debit.bank_account}</p>
                        <p className="text-xs text-[#b0b0d0] capitalize">
                          {debit.frequency.replace('_', ' ')} payments
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(debit.status) as any} size="sm">
                          {debit.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(debit.amount)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            Next: {debit.next_payment_date.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View Details
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Payment Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h6 className="font-medium text-white mb-3">Gateway Configuration</h6>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-[#b0b0d0]">Default Currency</label>
                      <select className="w-full mt-1 bg-[#23233a]/50 border border-[#23233a]/60 rounded-lg px-3 py-2 text-white">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-[#b0b0d0]">Payment Timeout (minutes)</label>
                      <input 
                        type="number" 
                        defaultValue={30}
                        className="w-full mt-1 bg-[#23233a]/50 border border-[#23233a]/60 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" defaultChecked />
                      <span className="text-sm text-white">Enable automatic retry for failed payments</span>
                    </label>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h6 className="font-medium text-white mb-3">Customer Portal</h6>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" defaultChecked />
                      <span className="text-sm text-white">Allow customers to update payment methods</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" defaultChecked />
                      <span className="text-sm text-white">Enable automatic payment reminders</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-[#a259ff]" />
                      <span className="text-sm text-white">Require two-factor authentication</span>
                    </label>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentGatewayManager; 