import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Percent,
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
import { useQuotes, useProducts, Quote, QuoteLineItem } from '../hooks/useQuotes';
import { BrandDropdown } from '../components/ui/BrandDropdown';

const QuoteCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { quotes, createQuote, updateQuote, loading } = useQuotes();
  const { products, fetchProducts } = useProducts();
  
  const [quote, setQuote] = useState<Partial<Quote>>({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    quote_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    subtotal_cents: 0,
    discount_cents: 0,
    tax_cents: 0,
    total_cents: 0,
    notes: '',
    terms: 'Payment due within 30 days of acceptance.',
    line_items: []
  });

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [contacts, setContacts] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const fetchContactsAndOrganizations = async () => {
    setLoadingData(true);
    try {
      // Mock data for contacts and organizations
      setContacts([
        { id: '1', name: 'John Smith', email: 'john@acme.com', company: 'Acme Corp' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah@techstart.com', company: 'TechStart Inc' },
        { id: '3', name: 'Mike Wilson', email: 'mike@innovation.com', company: 'Innovation Labs' }
      ]);
      
      setOrganizations([
        { id: '1', name: 'Acme Corporation', email: 'contact@acme.com', address: '123 Business St, NY' },
        { id: '2', name: 'TechStart Inc', email: 'hello@techstart.com', address: '456 Innovation Dr, SF' },
        { id: '3', name: 'Innovation Labs', email: 'info@innovation.com', address: '789 Tech Ave, Austin' }
      ]);
    } catch (error) {
      console.error('Error fetching contacts/organizations:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchContactsAndOrganizations();
    
    if (isEditing && id) {
      const existingQuote = quotes.find(q => q.id === id);
      if (existingQuote) {
        setQuote(existingQuote);
        const discount = existingQuote.discount_cents / Math.max(existingQuote.subtotal_cents, 1) * 100;
        setDiscountPercent(Math.round(discount * 100) / 100);
      }
    }
  }, [id, quotes, fetchProducts, isEditing]);

  const addLineItem = (productId?: string) => {
    const product = productId ? products.find(p => p.id === productId) : null;
    
    const newLineItem: QuoteLineItem = {
      id: `temp-${Date.now()}`,
      product_id: productId || '',
      product_name: product?.name || '',
      product_sku: product?.sku || '',
      quantity: 1,
      unit_price_cents: product?.price_cents || 0,
      discount_percent: 0,
      tax_percent: product?.tax_rate || 20,
      line_total_cents: product?.price_cents || 0
    };

    setQuote(prev => ({
      ...prev,
      line_items: [...(prev.line_items || []), newLineItem]
    }));

    setShowProductSelector(false);
    calculateTotals([...(quote.line_items || []), newLineItem]);
  };

  const updateLineItem = (index: number, updates: Partial<QuoteLineItem>) => {
    const updatedLineItems = quote.line_items?.map((item, i) => {
      if (i === index) {
        const updated = { ...item, ...updates };
        // Recalculate line total
        const beforeDiscount = updated.quantity * updated.unit_price_cents;
        const discountAmount = beforeDiscount * (updated.discount_percent / 100);
        const afterDiscount = beforeDiscount - discountAmount;
        const taxAmount = afterDiscount * (updated.tax_percent / 100);
        updated.line_total_cents = afterDiscount + taxAmount;
        return updated;
      }
      return item;
    }) || [];

    setQuote(prev => ({ ...prev, line_items: updatedLineItems }));
    calculateTotals(updatedLineItems);
  };

  const removeLineItem = (index: number) => {
    const updatedLineItems = quote.line_items?.filter((_, i) => i !== index) || [];
    setQuote(prev => ({ ...prev, line_items: updatedLineItems }));
    calculateTotals(updatedLineItems);
  };

  const calculateTotals = (lineItems: QuoteLineItem[]) => {
    const subtotal = lineItems.reduce((sum, item) => {
      const beforeDiscount = item.quantity * item.unit_price_cents;
      const discountAmount = beforeDiscount * (item.discount_percent / 100);
      return sum + (beforeDiscount - discountAmount);
    }, 0);

    const discount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discount;
    
    const tax = lineItems.reduce((sum, item) => {
      const beforeDiscount = item.quantity * item.unit_price_cents;
      const itemDiscount = beforeDiscount * (item.discount_percent / 100);
      const afterItemDiscount = beforeDiscount - itemDiscount;
      return sum + (afterItemDiscount * (item.tax_percent / 100));
    }, 0);

    const total = afterDiscount + tax;

    setQuote(prev => ({
      ...prev,
      subtotal_cents: Math.round(subtotal),
      discount_cents: Math.round(discount),
      tax_cents: Math.round(tax),
      total_cents: Math.round(total)
    }));
  };

  const handleDiscountChange = (newDiscountPercent: number) => {
    setDiscountPercent(newDiscountPercent);
    if (quote.line_items) {
      calculateTotals(quote.line_items);
    }
  };

  const handleSave = async () => {
    try {
      if (!quote.customer_name || !quote.customer_email) {
        alert('Please fill in customer name and email');
        return;
      }

      if (!quote.line_items || quote.line_items.length === 0) {
        alert('Please add at least one line item');
        return;
      }

      let success;
      if (isEditing && id) {
        success = await updateQuote(id, quote);
      } else {
        const createdQuote = await createQuote(quote);
        success = !!createdQuote;
      }

      if (success) {
        navigate('/quotes');
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Failed to save quote. Please try again.');
    }
  };

  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title={isEditing ? 'Edit Quote' : 'Create Quote'}
        subtitle={isEditing ? 'Update quote details and line items' : 'Create a new customer quote with automated calculations'}
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/quotes')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quotes
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => {/* TODO: Preview quote */}}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => {/* TODO: Send quote */}}>
              <Send className="w-4 h-4 mr-2" />
              Send Quote
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => navigate('/sales-orders/create', { state: { fromQuote: quote } })}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Convert to Order
            </BrandButton>
            
            <BrandButton variant="primary" onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : (isEditing ? 'Update Quote' : 'Create Quote')}
            </BrandButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Quote Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <BrandCard borderGradient="primary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Select Contact
                  </label>
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
                        setQuote(prev => ({
                          ...prev,
                          customer_name: contact.name,
                          customer_email: contact.email
                        }));
                      }
                    }}
                    placeholder="Choose from contacts"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Select Organization
                  </label>
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
                        setQuote(prev => ({
                          ...prev,
                          customer_name: org.name,
                          customer_email: org.email,
                          customer_address: org.address
                        }));
                      }
                    }}
                    placeholder="Choose from organizations"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Customer Name *
                  </label>
                  <BrandInput
                    type="text"
                    value={quote.customer_name || ''}
                    onChange={(e) => setQuote(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Email Address *
                  </label>
                  <BrandInput
                    type="email"
                    value={quote.customer_email || ''}
                    onChange={(e) => setQuote(prev => ({ ...prev, customer_email: e.target.value }))}
                    placeholder="customer@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Billing Address
                </label>
                <textarea
                  value={quote.customer_address || ''}
                  onChange={(e) => setQuote(prev => ({ ...prev, customer_address: e.target.value }))}
                  placeholder="Enter billing address"
                  rows={3}
                  className="w-full px-4 py-3 bg-black/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300"
                />
              </div>
            </BrandCard>

            {/* Quote Details */}
            <BrandCard borderGradient="secondary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Quote Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Quote Date
                  </label>
                  <BrandInput
                    type="date"
                    value={quote.quote_date || ''}
                    onChange={(e) => setQuote(prev => ({ ...prev, quote_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Valid Until
                  </label>
                  <BrandInput
                    type="date"
                    value={quote.valid_until || ''}
                    onChange={(e) => setQuote(prev => ({ ...prev, valid_until: e.target.value }))}
                  />
                </div>
              </div>
            </BrandCard>

            {/* Line Items */}
            <BrandCard borderGradient="accent" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-green-400" />
                  Line Items
                </h3>
                
                <div className="flex space-x-2">
                  <BrandButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowProductSelector(!showProductSelector)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </BrandButton>
                  
                  <BrandButton
                    variant="secondary"
                    size="sm"
                    onClick={() => addLineItem()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Custom Item
                  </BrandButton>
                </div>
              </div>

              {/* Product Selector */}
              {showProductSelector && (
                <div className="mb-4 p-4 bg-black/20 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-white mb-3">Select Product</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addLineItem(product.id)}
                        className="p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                      >
                        <div className="text-white font-medium">{product.name}</div>
                        <div className="text-sm text-[#b0b0d0]">
                          {product.sku} - {formatCurrency(product.price_cents)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              {quote.line_items && quote.line_items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-[#b0b0d0] text-sm">Product</th>
                        <th className="text-center py-2 text-[#b0b0d0] text-sm">Qty</th>
                        <th className="text-right py-2 text-[#b0b0d0] text-sm">Unit Price</th>
                        <th className="text-center py-2 text-[#b0b0d0] text-sm">Discount %</th>
                        <th className="text-center py-2 text-[#b0b0d0] text-sm">Tax %</th>
                        <th className="text-right py-2 text-[#b0b0d0] text-sm">Price + Tax</th>
                        <th className="text-right py-2 text-[#b0b0d0] text-sm">Total</th>
                        <th className="text-center py-2 text-[#b0b0d0] text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.line_items.map((item, index) => (
                        <tr key={item.id || index} className="border-b border-white/5">
                          <td className="py-3">
                            <BrandInput
                              type="text"
                              value={item.product_name}
                              onChange={(e) => updateLineItem(index, { product_name: e.target.value })}
                              placeholder="Product name"
                              className="text-sm"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <BrandInput
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, { quantity: parseInt(e.target.value) || 0 })}
                              min="1"
                              className="text-sm text-center w-20"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <BrandInput
                              type="number"
                              value={item.unit_price_cents / 100}
                              onChange={(e) => updateLineItem(index, { unit_price_cents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                              step="0.01"
                              min="0"
                              className="text-sm text-right w-24"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <BrandInput
                              type="number"
                              value={item.discount_percent}
                              onChange={(e) => updateLineItem(index, { discount_percent: parseFloat(e.target.value) || 0 })}
                              step="0.1"
                              min="0"
                              max="100"
                              className="text-sm text-center w-20"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <BrandInput
                              type="number"
                              value={item.tax_percent}
                              onChange={(e) => updateLineItem(index, { tax_percent: parseFloat(e.target.value) || 0 })}
                              step="0.1"
                              min="0"
                              max="100"
                              className="text-sm text-center w-20"
                            />
                          </td>
                          <td className="py-3 px-2 text-right text-[#b0b0d0] text-sm">
                            {formatCurrency(Math.round(item.unit_price_cents * (1 + item.tax_percent / 100)))}
                          </td>
                          <td className="py-3 px-2 text-right text-white font-semibold">
                            {formatCurrency(item.line_total_cents)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <BrandButton
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </BrandButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#b0b0d0]">
                  No line items added yet. Click "Add Product" or "Custom Item" to get started.
                </div>
              )}
            </BrandCard>

            {/* Notes and Terms */}
            <BrandCard borderGradient="secondary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-yellow-400" />
                Notes & Terms
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={quote.notes || ''}
                    onChange={(e) => setQuote(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Internal notes (not visible to customer)"
                    rows={3}
                    className="w-full px-4 py-3 bg-black/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={quote.terms || ''}
                    onChange={(e) => setQuote(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Terms and conditions for this quote"
                    rows={3}
                    className="w-full px-4 py-3 bg-black/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            </BrandCard>
          </div>

          {/* Quote Summary Sidebar */}
          <div className="space-y-6">
            {/* Quote Summary */}
            <BrandCard borderGradient="success" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-400" />
                Quote Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-[#b0b0d0]">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(quote.subtotal_cents || 0)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#b0b0d0]">Discount:</span>
                    <div className="flex items-center space-x-2">
                      <BrandInput
                        type="number"
                        value={discountPercent}
                        onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                        step="0.1"
                        min="0"
                        max="100"
                        className="w-20 text-center text-sm py-1"
                      />
                      <Percent className="w-3 h-3 text-[#b0b0d0]" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[#b0b0d0] text-sm">
                    <span className="ml-4">Amount:</span>
                    <span>-{formatCurrency(quote.discount_cents || 0)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-[#b0b0d0]">
                  <span>Tax:</span>
                  <span>+{formatCurrency(quote.tax_cents || 0)}</span>
                </div>
                
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-white text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(quote.total_cents || 0)}</span>
                  </div>
                </div>
              </div>
            </BrandCard>

            {/* Quote Sender Information */}
            <BrandCard borderGradient="blue" className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Sender Information
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white font-medium">SaleToru CRM</p>
                  <p className="text-[#b0b0d0]">Your Company Name</p>
                </div>
                
                <div>
                  <p className="text-[#b0b0d0]">📧 sales@yourcompany.com</p>
                  <p className="text-[#b0b0d0]">📞 +1 (555) 123-4567</p>
                </div>
                
                <div>
                  <p className="text-[#b0b0d0]">📍 123 Business Street</p>
                  <p className="text-[#b0b0d0]">City, State 12345</p>
                </div>
              </div>
            </BrandCard>

            {/* Quote Status */}
            <BrandCard borderGradient="purple" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quote Status</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Current Status
                  </label>
                  <select
                    value={quote.status || 'draft'}
                    onChange={(e) => setQuote(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-black/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                <div className="text-center">
                  <BrandBadge 
                    variant={
                      quote.status === 'accepted' ? 'success' :
                      quote.status === 'sent' ? 'warning' :
                      quote.status === 'declined' ? 'danger' :
                      quote.status === 'expired' ? 'error' :
                      'secondary'
                    }
                  >
                    {quote.status?.toUpperCase() || 'DRAFT'}
                  </BrandBadge>
                </div>
              </div>
            </BrandCard>
          </div>
        </div>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default QuoteCreate;
