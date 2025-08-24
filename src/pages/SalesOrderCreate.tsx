import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Calculator,
  ShoppingCart,
  User,
  Calendar,
  FileText,
  Truck,
  Package,
  AlertTriangle,
  Eye,
  Send
} from 'lucide-react';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge
} from '../contexts/BrandDesignContext';
import { BrandDropdown } from '../components/ui/BrandDropdown';
import { useSalesOrders, SalesOrder, SalesOrderLineItem } from '../hooks/useSalesOrders';
import { useQuotes } from '../hooks/useQuotes';

const SalesOrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditing = !!id;
  
  const { salesOrders, createSalesOrder, updateSalesOrder, loading, generateOrderNumber } = useSalesOrders();
  const { quotes } = useQuotes();

  const [order, setOrder] = useState<Partial<SalesOrder>>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    billing_address: '',
    shipping_address: '',
    same_as_billing: true,
    subtotal_cents: 0,
    discount_cents: 0,
    tax_cents: 0,
    shipping_cost_cents: 0,
    total_cents: 0,
    status: 'pending',
    priority: 'normal',
    order_date: new Date().toISOString().split('T')[0],
    required_date: '',
    notes: '',
    terms: 'Payment due within 30 days of delivery.',
    line_items: []
  });

  const [contacts, setContacts] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    // Mock contacts and organizations data
    setContacts([
      { id: '1', name: 'John Smith', email: 'john@acme.com', company: 'Acme Corp', phone: '+1 (555) 123-4567' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@techstart.com', company: 'TechStart Inc', phone: '+1 (555) 234-5678' },
      { id: '3', name: 'Mike Wilson', email: 'mike@innovation.com', company: 'Innovation Labs', phone: '+1 (555) 345-6789' }
    ]);
    
    setOrganizations([
      { id: '1', name: 'Acme Corporation', email: 'contact@acme.com', address: '123 Business St, NY, NY 10001' },
      { id: '2', name: 'TechStart Inc', email: 'hello@techstart.com', address: '456 Innovation Dr, SF, CA 94105' },
      { id: '3', name: 'Innovation Labs', email: 'info@innovation.com', address: '789 Tech Ave, Austin, TX 78701' }
    ]);

    // Handle creation from quote
    const state = location.state as any;
    if (state?.fromQuote) {
      const quote = state.fromQuote;
      setOrder(prev => ({
        ...prev,
        quote_id: quote.id,
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        customer_address: quote.customer_address,
        subtotal_cents: quote.subtotal_cents,
        discount_cents: quote.discount_cents,
        tax_cents: quote.tax_cents,
        total_cents: quote.total_cents,
        notes: quote.notes,
        terms: quote.terms,
        line_items: quote.line_items || []
      }));
    }

    // Handle duplication
    if (state?.duplicateFrom) {
      const sourceOrder = state.duplicateFrom;
      setOrder(prev => ({
        ...prev,
        ...sourceOrder,
        id: undefined,
        order_number: undefined,
        status: 'pending',
        order_date: new Date().toISOString().split('T')[0]
      }));
    }

    // Handle editing
    if (isEditing && id) {
      const existingOrder = salesOrders.find(o => o.id === id);
      if (existingOrder) {
        setOrder(existingOrder);
      }
    }
  }, [id, salesOrders, isEditing, location.state]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const addLineItem = () => {
    const newItem: SalesOrderLineItem = {
      id: `temp_${Date.now()}`,
      product_name: '',
      product_sku: '',
      quantity: 1,
      unit_price_cents: 0,
      discount_percent: 0,
      tax_percent: 10,
      line_total_cents: 0
    };

    setOrder(prev => ({
      ...prev,
      line_items: [...(prev.line_items || []), newItem]
    }));
  };

  const updateLineItem = (index: number, updates: Partial<SalesOrderLineItem>) => {
    setOrder(prev => {
      const items = [...(prev.line_items || [])];
      items[index] = { ...items[index], ...updates };
      
      // Recalculate line total
      const item = items[index];
      const subtotal = item.unit_price_cents * item.quantity;
      const discountAmount = subtotal * (item.discount_percent / 100);
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * (item.tax_percent / 100);
      item.line_total_cents = Math.round(taxableAmount + taxAmount);

      // Recalculate order totals
      const orderSubtotal = items.reduce((sum, item) => sum + (item.unit_price_cents * item.quantity), 0);
      const orderDiscount = items.reduce((sum, item) => sum + (item.unit_price_cents * item.quantity * item.discount_percent / 100), 0);
      const orderTax = items.reduce((sum, item) => sum + ((item.unit_price_cents * item.quantity - (item.unit_price_cents * item.quantity * item.discount_percent / 100)) * item.tax_percent / 100), 0);
      
      return {
        ...prev,
        line_items: items,
        subtotal_cents: Math.round(orderSubtotal),
        discount_cents: Math.round(orderDiscount),
        tax_cents: Math.round(orderTax),
        total_cents: Math.round(orderSubtotal - orderDiscount + orderTax + (prev.shipping_cost_cents || 0))
      };
    });
  };

  const removeLineItem = (index: number) => {
    setOrder(prev => {
      const items = [...(prev.line_items || [])];
      items.splice(index, 1);
      
      // Recalculate totals
      const orderSubtotal = items.reduce((sum, item) => sum + (item.unit_price_cents * item.quantity), 0);
      const orderDiscount = items.reduce((sum, item) => sum + (item.unit_price_cents * item.quantity * item.discount_percent / 100), 0);
      const orderTax = items.reduce((sum, item) => sum + ((item.unit_price_cents * item.quantity - (item.unit_price_cents * item.quantity * item.discount_percent / 100)) * item.tax_percent / 100), 0);
      
      return {
        ...prev,
        line_items: items,
        subtotal_cents: Math.round(orderSubtotal),
        discount_cents: Math.round(orderDiscount),
        tax_cents: Math.round(orderTax),
        total_cents: Math.round(orderSubtotal - orderDiscount + orderTax + (prev.shipping_cost_cents || 0))
      };
    });
  };

  const handleSave = async () => {
    if (!order.customer_name || !order.customer_email) {
      alert('Please fill in customer name and email');
      return;
    }

    if (!order.line_items || order.line_items.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    try {
      if (isEditing && id) {
        await updateSalesOrder(id, order);
      } else {
        await createSalesOrder(order);
      }
      navigate('/sales-orders');
    } catch (error) {
      console.error('Error saving sales order:', error);
      alert('Failed to save sales order');
    }
  };

  const handleShippingAddressToggle = (sameAsBilling: boolean) => {
    setOrder(prev => ({
      ...prev,
      same_as_billing: sameAsBilling,
      shipping_address: sameAsBilling ? prev.billing_address : prev.shipping_address
    }));
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title={isEditing ? 'Edit Sales Order' : 'Create Sales Order'}
        subtitle={isEditing ? `Editing order ${order.order_number}` : 'Create a new customer order'}
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/sales-orders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => {/* TODO: Preview */}}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </BrandButton>
            
            <BrandButton variant="primary" onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : (isEditing ? 'Update Order' : 'Create Order')}
            </BrandButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <BrandCard borderGradient="primary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Customer Information
              </h3>
              
              {/* Contact/Organization Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <BrandDropdown
                  options={[
                    { value: '', label: 'Select contact...' },
                    ...contacts.map(contact => ({
                      value: contact.id,
                      label: contact.name,
                      description: `${contact.email} - ${contact.company}`
                    }))
                  ]}
                  value=""
                  onChange={(contactId) => {
                    const contact = contacts.find(c => c.id === contactId);
                    if (contact) {
                      setOrder(prev => ({
                        ...prev,
                        customer_name: contact.name,
                        customer_email: contact.email,
                        customer_phone: contact.phone
                      }));
                    }
                  }}
                  placeholder="Choose from contacts"
                />
                
                <BrandDropdown
                  options={[
                    { value: '', label: 'Select organization...' },
                    ...organizations.map(org => ({
                      value: org.id,
                      label: org.name,
                      description: org.email
                    }))
                  ]}
                  value=""
                  onChange={(orgId) => {
                    const org = organizations.find(o => o.id === orgId);
                    if (org) {
                      setOrder(prev => ({
                        ...prev,
                        customer_name: org.name,
                        customer_email: org.email,
                        billing_address: org.address,
                        shipping_address: prev.same_as_billing ? org.address : prev.shipping_address
                      }));
                    }
                  }}
                  placeholder="Choose from organizations"
                />
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BrandInput
                  label="Customer Name *"
                  type="text"
                  value={order.customer_name || ''}
                  onChange={(e) => setOrder(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Enter customer name"
                  required
                />
                
                <BrandInput
                  label="Email Address *"
                  type="email"
                  value={order.customer_email || ''}
                  onChange={(e) => setOrder(prev => ({ ...prev, customer_email: e.target.value }))}
                  placeholder="customer@example.com"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <BrandInput
                  label="Phone Number"
                  type="tel"
                  value={order.customer_phone || ''}
                  onChange={(e) => setOrder(prev => ({ ...prev, customer_phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
                
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Reference Quote
                  </label>
                  <BrandDropdown
                    options={[
                      { value: '', label: 'No reference quote' },
                      ...quotes.map(quote => ({
                        value: quote.id!,
                        label: quote.quote_number!,
                        description: `${quote.customer_name} - ${formatCurrency(quote.total_cents)}`
                      }))
                    ]}
                    value={order.quote_id || ''}
                    onChange={(quoteId) => setOrder(prev => ({ ...prev, quote_id: quoteId }))}
                    placeholder="Link to quote"
                  />
                </div>
              </div>
            </BrandCard>

            {/* Coming Soon Placeholder */}
            <BrandCard borderGradient="warning" className="p-8 text-center">
              <Package className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Sales Order Creation</h3>
              <p className="text-[#b0b0d0] mb-4">
                Complete sales order creation interface with line items, shipping management, and DHL integration coming soon.
              </p>
            </BrandCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <BrandCard borderGradient="success" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-400" />
                Order Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[#b0b0d0]">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal_cents || 0)}</span>
                </div>
                <div className="flex justify-between text-[#b0b0d0]">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount_cents || 0)}</span>
                </div>
                <div className="flex justify-between text-[#b0b0d0]">
                  <span>Tax:</span>
                  <span>+{formatCurrency(order.tax_cents || 0)}</span>
                </div>
                <div className="flex justify-between text-[#b0b0d0]">
                  <span>Shipping:</span>
                  <span>+{formatCurrency(order.shipping_cost_cents || 0)}</span>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-white text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total_cents || 0)}</span>
                  </div>
                </div>
              </div>
            </BrandCard>

            {/* Order Status */}
            <BrandCard borderGradient="purple" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Status</label>
                  <BrandDropdown
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'confirmed', label: 'Confirmed' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'shipped', label: 'Shipped' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'cancelled', label: 'Cancelled' }
                    ]}
                    value={order.status || 'pending'}
                    onChange={(status) => setOrder(prev => ({ ...prev, status: status as any }))}
                    placeholder="Select status"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Priority</label>
                  <BrandDropdown
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'high', label: 'High' },
                      { value: 'urgent', label: 'Urgent' }
                    ]}
                    value={order.priority || 'normal'}
                    onChange={(priority) => setOrder(prev => ({ ...prev, priority: priority as any }))}
                    placeholder="Select priority"
                  />
                </div>
              </div>
            </BrandCard>
          </div>
        </div>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default SalesOrderCreate;
