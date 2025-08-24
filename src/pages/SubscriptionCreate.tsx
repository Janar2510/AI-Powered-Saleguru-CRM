import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Repeat,
  Save,
  ArrowLeft,
  User,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Calculator
} from 'lucide-react';

import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge
} from '../contexts/BrandDesignContext';

import { useSubscriptions, CreateSubscriptionData } from '../hooks/useSubscriptions';
import { useContacts } from '../hooks/useContacts';
import { BrandDropdown } from '../components/ui/BrandDropdown';

const SubscriptionCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createSubscription, loading } = useSubscriptions();
  const { contacts } = useContacts();

  const [formData, setFormData] = useState({
    contact_id: '',
    organization_id: '',
    product_id: '',
    plan_name: '',
    plan_description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    trial_end_date: '',
    frequency: 'monthly' as CreateSubscriptionData['frequency'],
    billing_cycle_day: 1,
    amount_cents: 0,
    setup_fee_cents: 0,
    currency: 'EUR',
    discount_percent: 0,
    tax_percent: 10,
    notes: ''
  });

  const [calculatedAmounts, setCalculatedAmounts] = useState({
    setupFee: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });

  // Calculate amounts when relevant fields change
  useEffect(() => {
    const baseAmount = formData.amount_cents / 100;
    const setupFee = formData.setup_fee_cents / 100;
    const discount = baseAmount * (formData.discount_percent / 100);
    const discountedAmount = baseAmount - discount;
    const tax = discountedAmount * (formData.tax_percent / 100);
    const total = discountedAmount + tax + setupFee;

    setCalculatedAmounts({
      setupFee,
      subtotal: baseAmount,
      discount,
      tax,
      total
    });
  }, [formData.amount_cents, formData.setup_fee_cents, formData.discount_percent, formData.tax_percent]);

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plan_name) {
      alert('Please enter a plan name');
      return;
    }

    if (!formData.contact_id && !formData.organization_id) {
      alert('Please select a contact or organization');
      return;
    }

    if (formData.amount_cents <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const subscriptionData: CreateSubscriptionData = {
      ...formData,
      contact_id: formData.contact_id || undefined,
      organization_id: formData.organization_id || undefined,
      product_id: formData.product_id || undefined,
      end_date: formData.end_date || undefined,
      trial_end_date: formData.trial_end_date || undefined
    };

    const createdSubscription = await createSubscription(subscriptionData);
    if (createdSubscription) {
      navigate('/subscriptions');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getFrequencyOptions = () => [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly (3 months)' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const getBillingCycleDayOptions = () => {
    const options = [];
    for (let i = 1; i <= 31; i++) {
      options.push({ value: i.toString(), label: `${i}${getOrdinalSuffix(i)}` });
    }
    return options;
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title={id ? "Edit Subscription" : "Create Subscription"}
        subtitle="Set up recurring billing for customers"
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/subscriptions')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subscriptions
            </BrandButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Contact/Customer
                  </label>
                  <BrandDropdown
                    value={formData.contact_id}
                    onChange={(value) => handleFormChange('contact_id', value)}
                    options={[
                      { value: '', label: 'Select Contact...' },
                      ...contacts.map(contact => ({
                        value: contact.id,
                        label: `${contact.name} (${contact.email})`
                      }))
                    ]}
                    placeholder="Choose a contact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Plan Name *
                  </label>
                  <BrandInput
                    type="text"
                    placeholder="e.g., CRM Premium Plan"
                    value={formData.plan_name}
                    onChange={(e) => handleFormChange('plan_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Plan Description
                </label>
                <textarea
                  placeholder="Describe what's included in this plan..."
                  value={formData.plan_description}
                  onChange={(e) => handleFormChange('plan_description', e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </BrandCard>
          </motion.div>

          {/* Billing Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Billing Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Billing Frequency *
                  </label>
                  <BrandDropdown
                    value={formData.frequency}
                    onChange={(value) => handleFormChange('frequency', value)}
                    options={getFrequencyOptions()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Billing Day of Month
                  </label>
                  <BrandDropdown
                    value={formData.billing_cycle_day.toString()}
                    onChange={(value) => handleFormChange('billing_cycle_day', parseInt(value))}
                    options={getBillingCycleDayOptions()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Currency
                  </label>
                  <BrandDropdown
                    value={formData.currency}
                    onChange={(value) => handleFormChange('currency', value)}
                    options={[
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'GBP', label: 'GBP (£)' }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Start Date *
                  </label>
                  <BrandInput
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleFormChange('start_date', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Trial End Date (Optional)
                  </label>
                  <BrandInput
                    type="date"
                    value={formData.trial_end_date}
                    onChange={(e) => handleFormChange('trial_end_date', e.target.value)}
                  />
                </div>
              </div>
            </BrandCard>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Pricing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Recurring Amount ({formData.currency}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={(formData.amount_cents / 100).toFixed(2)}
                      onChange={(e) => handleFormChange('amount_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Setup Fee ({formData.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={(formData.setup_fee_cents / 100).toFixed(2)}
                      onChange={(e) => handleFormChange('setup_fee_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
                      value={formData.discount_percent}
                      onChange={(e) => handleFormChange('discount_percent', parseFloat(e.target.value || '0'))}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="10"
                      value={formData.tax_percent}
                      onChange={(e) => handleFormChange('tax_percent', parseFloat(e.target.value || '0'))}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Billing Summary
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-white/70">
                      <span>Recurring Amount:</span>
                      <span>{formatCurrency(calculatedAmounts.subtotal)}</span>
                    </div>
                    
                    {calculatedAmounts.discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount ({formData.discount_percent}%):</span>
                        <span>-{formatCurrency(calculatedAmounts.discount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-white/70">
                      <span>Tax ({formData.tax_percent}%):</span>
                      <span>{formatCurrency(calculatedAmounts.tax)}</span>
                    </div>
                    
                    {calculatedAmounts.setupFee > 0 && (
                      <div className="flex justify-between text-blue-400">
                        <span>Setup Fee (one-time):</span>
                        <span>{formatCurrency(calculatedAmounts.setupFee)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-bold text-white">
                      <span>Total per {formData.frequency.replace('ly', '')}:</span>
                      <span>{formatCurrency(calculatedAmounts.total)}</span>
                    </div>
                    
                    <div className="text-center">
                      <BrandBadge variant="primary" className="text-sm">
                        {formData.frequency.charAt(0).toUpperCase() + formData.frequency.slice(1)} Billing
                      </BrandBadge>
                    </div>
                  </div>
                </div>
              </div>
            </BrandCard>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Internal notes about this subscription..."
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>
            </BrandCard>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-end space-x-4"
          >
            <BrandButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/subscriptions')}
            >
              Cancel
            </BrandButton>
            
            <BrandButton
              type="submit"
              variant="primary"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : (id ? 'Update Subscription' : 'Create Subscription')}
            </BrandButton>
          </motion.div>
        </form>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default SubscriptionCreate;
