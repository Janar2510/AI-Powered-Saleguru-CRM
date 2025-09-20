import React, { useState, useEffect } from 'react';
import { UnifiedDocument, UnifiedDocumentLine } from '../../types/UnifiedDocument';
import { 
  BrandCard, 
  BrandButton, 
  BrandInput, 
  BrandTextarea,
  BrandDropdown 
} from '../../contexts/BrandDesignContext';
import { 
  X, 
  Plus, 
  Trash2, 
  FileText, 
  Calculator,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';

interface UnifiedDocumentModalProps {
  document?: UnifiedDocument | null;
  documentType: 'quote' | 'sales_order' | 'invoice' | 'proforma';
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: any) => Promise<void>;
  mode: 'view' | 'edit' | 'create';
}

const UnifiedDocumentModal: React.FC<UnifiedDocumentModalProps> = ({
  document,
  documentType,
  isOpen,
  onClose,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState<Partial<UnifiedDocument>>({
    document_type: documentType,
    currency: 'EUR',
    tax_rate: 20,
    signature_required: documentType === 'quote',
    lines: [],
    status: 'draft'
  });
  
  const [saving, setSaving] = useState(false);

  // Initialize form data when document changes
  useEffect(() => {
    if (document) {
      setFormData(document);
    } else {
      setFormData({
        document_type: documentType,
        currency: 'EUR',
        tax_rate: 20,
        signature_required: documentType === 'quote',
        lines: [{
          id: 'temp-1',
          product_name: '',
          description: '',
          qty: 1,
          unit_price_cents: 0,
          line_total_cents: 0
        }],
        status: 'draft'
      });
    }
  }, [document, documentType]);

  const isReadOnly = mode === 'view';

  // Calculate totals
  const calculateTotals = (lines: UnifiedDocumentLine[], taxRate: number, discountPercent: number = 0) => {
    const subtotal = lines.reduce((sum, line) => sum + line.line_total_cents, 0);
    const discount = Math.round(subtotal * (discountPercent / 100));
    const taxableAmount = subtotal - discount;
    const tax = Math.round(taxableAmount * (taxRate / 100));
    const total = taxableAmount + tax;
    
    return { subtotal, discount, tax, total };
  };

  // Update line item
  const updateLine = (index: number, field: keyof UnifiedDocumentLine, value: any) => {
    if (isReadOnly) return;
    
    const newLines = [...(formData.lines || [])];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Recalculate line total if qty or unit_price changes
    if (field === 'qty' || field === 'unit_price_cents') {
      const qty = field === 'qty' ? value : newLines[index].qty;
      const unitPrice = field === 'unit_price_cents' ? value : newLines[index].unit_price_cents;
      newLines[index].line_total_cents = qty * unitPrice;
    }
    
    setFormData(prev => ({ ...prev, lines: newLines }));
  };

  // Add new line
  const addLine = () => {
    if (isReadOnly) return;
    
    const newLine: UnifiedDocumentLine = {
      id: `temp-${Date.now()}`,
      product_name: '',
      description: '',
      qty: 1,
      unit_price_cents: 0,
      line_total_cents: 0
    };
    
    setFormData(prev => ({
      ...prev,
      lines: [...(prev.lines || []), newLine]
    }));
  };

  // Remove line
  const removeLine = (index: number) => {
    if (isReadOnly || (formData.lines?.length || 0) <= 1) return;
    
    const newLines = formData.lines?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, lines: newLines }));
  };

  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency || 'EUR',
      minimumFractionDigits: 2
    }).format(cents / 100);
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const totals = calculateTotals(
    formData.lines || [], 
    formData.tax_rate || 20, 
    formData.discount_percent || 0
  );

  const getDocumentTitle = () => {
    switch (documentType) {
      case 'quote': return 'Quote';
      case 'sales_order': return 'Sales Order';
      case 'invoice': return 'Invoice';
      case 'proforma': return 'Pro Forma';
      default: return 'Document';
    }
  };

  const getActionText = () => {
    if (mode === 'view') return 'Close';
    if (mode === 'edit') return 'Update';
    return 'Create';
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-white/20 rounded-2xl w-full h-full max-w-[1400px] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                {mode === 'create' ? `New ${getDocumentTitle()}` : `${getDocumentTitle()} ${formData.number || ''}`}
              </h2>
              <p className="text-white/60 text-sm">
                {mode === 'view' ? 'View document details' : mode === 'edit' ? 'Edit document' : 'Create new document'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {mode !== 'view' && (
              <BrandButton 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? 'Saving...' : getActionText()}
              </BrandButton>
            )}
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Form */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Document Info */}
              <BrandCard className="p-6" borderGradient="primary">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
                    <BrandInput
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Document title"
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                    <BrandDropdown
                      value={formData.status || 'draft'}
                      onChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                      options={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'sent', label: 'Sent' },
                        { value: 'viewed', label: 'Viewed' },
                        { value: 'accepted', label: 'Accepted' },
                        { value: 'rejected', label: 'Rejected' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'cancelled', label: 'Cancelled' }
                      ]}
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                    <BrandTextarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Document description"
                      rows={2}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </BrandCard>

              {/* Customer Information */}
              <BrandCard className="p-6" borderGradient="secondary">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Customer Name</label>
                    <BrandInput
                      value={formData.customer_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Customer name"
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                    <BrandInput
                      type="email"
                      value={formData.customer_email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="customer@email.com"
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                    <BrandInput
                      value={formData.customer_phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                      placeholder="Phone number"
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Currency</label>
                    <BrandDropdown
                      value={formData.currency || 'EUR'}
                      onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                      options={[
                        { value: 'EUR', label: 'EUR - Euro' },
                        { value: 'USD', label: 'USD - US Dollar' },
                        { value: 'GBP', label: 'GBP - British Pound' }
                      ]}
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">Billing Address</label>
                    <BrandTextarea
                      value={formData.billing_address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                      placeholder="Billing address"
                      rows={2}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </BrandCard>

              {/* Line Items */}
              <BrandCard className="p-6" borderGradient="accent">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Line Items
                  </h3>
                  {!isReadOnly && (
                    <BrandButton size="sm" onClick={addLine}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Line
                    </BrandButton>
                  )}
                </div>
                
                <div className="space-y-4">
                  {formData.lines?.map((line, index) => (
                    <div key={line.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-white/5 rounded-lg">
                      <div className="col-span-4">
                        <label className="block text-sm text-white/60 mb-1">Product/Service</label>
                        <BrandInput
                          value={line.product_name}
                          onChange={(e) => updateLine(index, 'product_name', e.target.value)}
                          placeholder="Product name"
                          disabled={isReadOnly}
                        />
                      </div>
                      
                      <div className="col-span-3">
                        <label className="block text-sm text-white/60 mb-1">Description</label>
                        <BrandInput
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          placeholder="Description"
                          disabled={isReadOnly}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <label className="block text-sm text-white/60 mb-1">Qty</label>
                        <BrandInput
                          type="number"
                          value={line.qty}
                          onChange={(e) => updateLine(index, 'qty', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          disabled={isReadOnly}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm text-white/60 mb-1">Unit Price</label>
                        <BrandInput
                          type="number"
                          value={(line.unit_price_cents / 100).toFixed(2)}
                          onChange={(e) => updateLine(index, 'unit_price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                          min="0"
                          step="0.01"
                          disabled={isReadOnly}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <label className="block text-sm text-white/60 mb-1">Total</label>
                        <div className="text-white font-medium py-2">
                          {formatCurrency(line.line_total_cents)}
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        {!isReadOnly && formData.lines && formData.lines.length > 1 && (
                          <BrandButton
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLine(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </BrandButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </BrandCard>
            </div>
          </div>

          {/* Sidebar - Totals & Settings */}
          <div className="w-80 border-l border-white/20 p-6 space-y-6 overflow-y-auto">
            {/* Financial Summary */}
            <BrandCard className="p-4" borderGradient="success">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Summary
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal:</span>
                  <span className="text-white font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                {formData.discount_percent && formData.discount_percent > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Discount ({formData.discount_percent}%):</span>
                    <span className="text-red-400 font-medium">-{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-white/60">Tax ({formData.tax_rate || 20}%):</span>
                  <span className="text-white font-medium">{formatCurrency(totals.tax)}</span>
                </div>
                
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-white font-bold text-lg">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
              
              {!isReadOnly && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Tax Rate (%)</label>
                    <BrandInput
                      type="number"
                      value={formData.tax_rate || 20}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Discount (%)</label>
                    <BrandInput
                      type="number"
                      value={formData.discount_percent || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              )}
            </BrandCard>

            {/* Document Settings */}
            <BrandCard className="p-4" borderGradient="secondary">
              <h4 className="text-lg font-semibold text-white mb-4">Settings</h4>
              
              <div className="space-y-4">
                {documentType === 'quote' && (
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Valid Until</label>
                    <BrandInput
                      type="date"
                      value={formData.valid_until?.split('T')[0] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
                
                {documentType === 'invoice' && (
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Due Date</label>
                    <BrandInput
                      type="date"
                      value={formData.due_date?.split('T')[0] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="signature_required"
                    checked={formData.signature_required || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, signature_required: e.target.checked }))}
                    className="rounded border-white/20 bg-black/20 text-blue-500 focus:ring-blue-500"
                    disabled={isReadOnly}
                  />
                  <label htmlFor="signature_required" className="text-sm text-white/80">
                    Signature Required
                  </label>
                </div>
              </div>
            </BrandCard>

            {/* Additional Notes */}
            <BrandCard className="p-4" borderGradient="accent">
              <h4 className="text-lg font-semibold text-white mb-4">Notes & Terms</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Internal Notes</label>
                  <BrandTextarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Internal notes..."
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-1">Terms & Conditions</label>
                  <BrandTextarea
                    value={formData.terms || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Terms and conditions..."
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </BrandCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDocumentModal;

