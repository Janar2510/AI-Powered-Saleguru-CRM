import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  Plus,
  Search,
  Calendar,
  DollarSign,
  User,
  Building2,
  Clock,
  Play,
  Pause,
  X,
  Eye,
  Edit,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandStatCard
} from '../contexts/BrandDesignContext';

import { useSubscriptions, Subscription } from '../hooks/useSubscriptions';
import { useContacts } from '../hooks/useContacts';
import { BrandDropdown } from '../components/ui/BrandDropdown';

const Subscriptions: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptions, loading, error, fetchSubscriptions, pauseSubscription, cancelSubscription } = useSubscriptions();
  const { contacts } = useContacts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelImmediately, setCancelImmediately] = useState(false);

  // Calculate statistics
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(sub => sub.status === 'active').length,
    trial: subscriptions.filter(sub => sub.status === 'trial').length,
    paused: subscriptions.filter(sub => sub.status === 'paused').length,
    cancelled: subscriptions.filter(sub => sub.status === 'cancelled').length,
    monthlyRecurring: subscriptions
      .filter(sub => sub.status === 'active' && sub.frequency === 'monthly')
      .reduce((sum, sub) => sum + (sub.amount_cents || 0), 0),
    yearlyRecurring: subscriptions
      .filter(sub => sub.status === 'active' && sub.frequency === 'yearly')
      .reduce((sum, sub) => sum + (sub.amount_cents || 0), 0),
    totalRecurring: subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + (sub.amount_cents || 0), 0)
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (subscription.subscription_number || '').toLowerCase().includes(searchLower) ||
      (subscription.plan_name || '').toLowerCase().includes(searchLower) ||
      (subscription.contact?.name || '').toLowerCase().includes(searchLower) ||
      (subscription.organization?.name || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Subscription['status']) => {
    const statusConfig = {
      active: { variant: 'success' as const, label: 'Active', icon: CheckCircle },
      trial: { variant: 'info' as const, label: 'Trial', icon: Clock },
      paused: { variant: 'warning' as const, label: 'Paused', icon: Pause },
      cancelled: { variant: 'secondary' as const, label: 'Cancelled', icon: X },
      expired: { variant: 'red' as const, label: 'Expired', icon: AlertTriangle },
      past_due: { variant: 'red' as const, label: 'Past Due', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;

    return (
      <BrandBadge variant={config.variant} className="flex items-center space-x-1">
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </BrandBadge>
    );
  };

  const getFrequencyBadge = (frequency: Subscription['frequency']) => {
    const frequencyConfig = {
      daily: { color: 'bg-purple-500/20 text-purple-400 border-purple-400/30', label: 'Daily' },
      weekly: { color: 'bg-blue-500/20 text-blue-400 border-blue-400/30', label: 'Weekly' },
      monthly: { color: 'bg-green-500/20 text-green-400 border-green-400/30', label: 'Monthly' },
      quarterly: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30', label: 'Quarterly' },
      yearly: { color: 'bg-orange-500/20 text-orange-400 border-orange-400/30', label: 'Yearly' }
    };

    const config = frequencyConfig[frequency] || frequencyConfig.monthly;

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (cents: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    const success = await pauseSubscription(subscriptionId, 'Paused by user');
    if (success) {
      // Refresh data
      fetchSubscriptions();
    }
  };

  const handleCancelSubscription = async () => {
    if (!showCancelModal) return;

    const success = await cancelSubscription(showCancelModal, cancelReason, cancelImmediately);
    if (success) {
      setShowCancelModal(null);
      setCancelReason('');
      setCancelImmediately(false);
    }
  };

  if (error) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Subscriptions" subtitle="Subscription management system">
          <BrandCard borderGradient="red" className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <BrandButton variant="secondary" onClick={fetchSubscriptions}>
              <Repeat className="w-4 h-4 mr-2" />
              Retry
            </BrandButton>
          </BrandCard>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Subscriptions"
        subtitle="Manage recurring subscriptions and billing cycles"
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="primary" onClick={() => navigate('/subscriptions/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Subscription
            </BrandButton>
          </div>
        }
      >
        {/* Statistics Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <BrandStatCard
            icon={<Repeat className="h-6 w-6 text-white" />}
            title="Total Subscriptions"
            value={stats.total}
            trend={`${stats.active} active, ${stats.trial} trial`}
            borderGradient="primary"
          />

          <BrandStatCard
            icon={<DollarSign className="h-6 w-6 text-white" />}
            title="Monthly Recurring"
            value={formatCurrency(stats.monthlyRecurring)}
            trend={`${stats.monthlyRecurring > 0 ? '+' : ''}${formatCurrency(stats.monthlyRecurring - stats.yearlyRecurring/12)} MRR`}
            borderGradient="green"
          />

          <BrandStatCard
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            title="Active Revenue"
            value={formatCurrency(stats.totalRecurring)}
            trend={`${stats.active} paying customers`}
            borderGradient="blue"
          />

          <BrandStatCard
            icon={<Clock className="h-6 w-6 text-white" />}
            title="Churn Rate"
            value={`${Math.round((stats.cancelled / (stats.total || 1)) * 100)}%`}
            trend={`${stats.paused} paused subscriptions`}
            borderGradient="yellow"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <BrandCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <BrandInput
                    type="text"
                    placeholder="Search subscriptions by number, plan, or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
              </div>
              
              <div className="w-48">
                <BrandDropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active' },
                    { value: 'trial', label: 'Trial' },
                    { value: 'paused', label: 'Paused' },
                    { value: 'cancelled', label: 'Cancelled' },
                    { value: 'expired', label: 'Expired' },
                    { value: 'past_due', label: 'Past Due' }
                  ]}
                  placeholder="Filter by status"
                />
              </div>
            </div>
          </BrandCard>
        </motion.div>

        {/* Subscriptions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <BrandCard className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="ml-3 text-white/70">Loading subscriptions...</span>
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="text-center py-12">
                <Repeat className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No subscriptions found</h3>
                <p className="text-white/60 mb-6">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first subscription to get started'}
                </p>
                <BrandButton variant="primary" onClick={() => navigate('/subscriptions/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Subscription
                </BrandButton>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Subscription</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Customer</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Plan</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Billing</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Amount</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Next Billing</th>
                      <th className="text-left py-4 px-6 text-white/90 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((subscription, index) => (
                      <motion.tr
                        key={subscription.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <Repeat className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{subscription.subscription_number}</p>
                              <p className="text-xs text-white/60">
                                Started {new Date(subscription.start_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {subscription.contact ? (
                              <>
                                <User className="w-4 h-4 text-white/60" />
                                <div>
                                  <p className="text-white font-medium">{subscription.contact.name}</p>
                                  <p className="text-xs text-white/60">{subscription.contact.email}</p>
                                </div>
                              </>
                            ) : subscription.organization ? (
                              <>
                                <Building2 className="w-4 h-4 text-white/60" />
                                <div>
                                  <p className="text-white font-medium">{subscription.organization.name}</p>
                                  <p className="text-xs text-white/60">{subscription.organization.email}</p>
                                </div>
                              </>
                            ) : (
                              <p className="text-white/60">No customer</p>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white font-medium">{subscription.plan_name}</p>
                            {subscription.plan_description && (
                              <p className="text-xs text-white/60">{subscription.plan_description}</p>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {getFrequencyBadge(subscription.frequency)}
                            <div className="text-xs text-white/60">
                              Day {subscription.billing_cycle_day}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          {getStatusBadge(subscription.status)}
                        </td>
                        
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-white">
                              {formatCurrency(subscription.amount_cents, subscription.currency)}
                            </p>
                            <p className="text-xs text-white/60">
                              per {subscription.frequency.replace('ly', '')}
                            </p>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          {subscription.next_billing_date ? (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-white/60" />
                              <span className="text-white text-sm">
                                {new Date(subscription.next_billing_date).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-white/60">—</span>
                          )}
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <BrandButton
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/subscriptions/${subscription.id}`)}
                              className="p-2"
                            >
                              <Eye className="w-4 h-4" />
                            </BrandButton>
                            
                            {subscription.status === 'active' && (
                              <BrandButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePauseSubscription(subscription.id)}
                                className="p-2 text-yellow-400 hover:text-yellow-300"
                              >
                                <Pause className="w-4 h-4" />
                              </BrandButton>
                            )}
                            
                            {subscription.status === 'paused' && (
                              <BrandButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePauseSubscription(subscription.id)}
                                className="p-2 text-green-400 hover:text-green-300"
                              >
                                <Play className="w-4 h-4" />
                              </BrandButton>
                            )}
                            
                            {(subscription.status === 'active' || subscription.status === 'paused') && (
                              <BrandButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCancelModal(subscription.id)}
                                className="p-2 text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </BrandButton>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </BrandCard>
        </motion.div>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <BrandCard className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Cancel Subscription</h3>
                
                <div className="space-y-4">
                  <p className="text-white/70">
                    Are you sure you want to cancel this subscription? This action cannot be undone.
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Cancellation Reason (Optional)
                    </label>
                    <textarea
                      placeholder="Why is this subscription being cancelled?"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cancelImmediately"
                      checked={cancelImmediately}
                      onChange={(e) => setCancelImmediately(e.target.checked)}
                      className="rounded border-white/20 bg-black/20 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="cancelImmediately" className="text-sm text-white/90">
                      Cancel immediately (otherwise cancel at end of billing period)
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <BrandButton
                    variant="secondary"
                    onClick={() => {
                      setShowCancelModal(null);
                      setCancelReason('');
                      setCancelImmediately(false);
                    }}
                  >
                    Keep Subscription
                  </BrandButton>
                  <BrandButton
                    variant="primary"
                    onClick={handleCancelSubscription}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Subscription
                  </BrandButton>
                </div>
              </BrandCard>
            </motion.div>
          </div>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default Subscriptions;