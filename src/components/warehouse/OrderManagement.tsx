import React, { useState } from 'react';
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  BarChart3,
  TrendingUp,
  X,
  Save,
  Check,
  ArrowRight,
  Zap
} from 'lucide-react';
import {
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandInput,
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard
} from '../../contexts/BrandDesignContext';
import {
  usePurchaseOrders,
  useSalesOrders,
  useCreatePurchaseOrder,
  useCreateSalesOrder,
  useReceivePurchaseOrder,
  type PurchaseOrder,
  type SalesOrder,
  type PurchaseOrderLine,
  type SalesOrderLine
} from '../../hooks/useEnhancedInventory';

interface OrderManagementProps {
  orgId: string;
}

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

interface CreateSalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | SalesOrder | null;
  type: 'purchase' | 'sales';
}

const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_email: '',
    supplier_phone: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    payment_terms: '',
    notes: '',
    lines: [
      {
        product_name: '',
        product_sku: '',
        qty_ordered: 1,
        unit_cost: 0,
        notes: ''
      }
    ]
  });

  const handleAddLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        product_name: '',
        product_sku: '',
        qty_ordered: 1,
        unit_cost: 0,
        notes: ''
      }]
    }));
  };

  const handleRemoveLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subtotal = formData.lines.reduce((sum, line) => 
      sum + (line.qty_ordered * line.unit_cost), 0
    );
    const tax_amount = subtotal * 0.1; // 10% tax
    const total_amount = subtotal + tax_amount;

    const po = {
      org_id: 'current-org-id', // Should be dynamic
      po_number: `PO-${Date.now()}`,
      supplier_name: formData.supplier_name,
      supplier_contact: {
        email: formData.supplier_email,
        phone: formData.supplier_phone
      },
      order_date: formData.order_date,
      expected_delivery_date: formData.expected_delivery_date,
      payment_terms: formData.payment_terms,
      notes: formData.notes,
      subtotal,
      tax_amount,
      total_amount,
      status: 'draft'
    };

    onSave({ po, lines: formData.lines });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard borderGradient="primary" className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <ShoppingCart className="w-6 h-6 mr-2" />
              Create Purchase Order
            </h2>
            <button onClick={onClose} className="text-[#b0b0d0] hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Supplier Information */}
            <BrandCard borderGradient="secondary" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Supplier Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Supplier Name *
                  </label>
                  <BrandInput
                    value={formData.supplier_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Email
                  </label>
                  <BrandInput
                    type="email"
                    value={formData.supplier_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Phone
                  </label>
                  <BrandInput
                    value={formData.supplier_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Payment Terms
                  </label>
                  <select
                    value={formData.payment_terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  >
                    <option value="">Select Payment Terms</option>
                    <option value="NET30">NET 30</option>
                    <option value="NET60">NET 60</option>
                    <option value="COD">Cash on Delivery</option>
                    <option value="PREPAID">Prepaid</option>
                  </select>
                </div>
              </div>
            </BrandCard>

            {/* Order Details */}
            <BrandCard borderGradient="accent" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Order Date *
                  </label>
                  <BrandInput
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Expected Delivery Date
                  </label>
                  <BrandInput
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  placeholder="Order notes..."
                />
              </div>
            </BrandCard>

            {/* Order Lines */}
            <BrandCard borderGradient="purple" className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Order Items</h3>
                <BrandButton variant="secondary" onClick={handleAddLine}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </BrandButton>
              </div>

              <div className="space-y-4">
                {formData.lines.map((line, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-white/5 rounded-lg">
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-[#b0b0d0] mb-1">
                        Product Name *
                      </label>
                      <BrandInput
                        value={line.product_name}
                        onChange={(e) => handleLineChange(index, 'product_name', e.target.value)}
                        placeholder="Product name"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#b0b0d0] mb-1">
                        SKU
                      </label>
                      <BrandInput
                        value={line.product_sku}
                        onChange={(e) => handleLineChange(index, 'product_sku', e.target.value)}
                        placeholder="SKU"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#b0b0d0] mb-1">
                        Quantity *
                      </label>
                      <BrandInput
                        type="number"
                        value={line.qty_ordered}
                        onChange={(e) => handleLineChange(index, 'qty_ordered', parseInt(e.target.value) || 0)}
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#b0b0d0] mb-1">
                        Unit Cost *
                      </label>
                      <BrandInput
                        type="number"
                        step="0.01"
                        value={line.unit_cost}
                        onChange={(e) => handleLineChange(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#b0b0d0] mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-[#23233a]/30 border-2 border-white/10 rounded-lg text-white text-center">
                        ${(line.qty_ordered * line.unit_cost).toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      {formData.lines.length > 1 && (
                        <BrandButton
                          variant="red"
                          onClick={() => handleRemoveLine(index)}
                        >
                          <X className="w-4 h-4" />
                        </BrandButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-[#b0b0d0]">Subtotal:</span>
                  <span className="text-white font-medium">
                    ${formData.lines.reduce((sum, line) => sum + (line.qty_ordered * line.unit_cost), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#b0b0d0]">Tax (10%):</span>
                  <span className="text-white font-medium">
                    ${(formData.lines.reduce((sum, line) => sum + (line.qty_ordered * line.unit_cost), 0) * 0.1).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-white/20 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-white font-bold text-lg">
                      ${(formData.lines.reduce((sum, line) => sum + (line.qty_ordered * line.unit_cost), 0) * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </BrandCard>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <BrandButton variant="secondary" onClick={onClose}>
                Cancel
              </BrandButton>
              <BrandButton variant="primary" type="submit">
                <Save className="w-4 h-4 mr-2" />
                Create Purchase Order
              </BrandButton>
            </div>
          </form>
        </div>
      </BrandCard>
    </div>
  );
};

const CreateSalesOrderModal: React.FC<CreateSalesOrderModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    billing_address: '',
    order_date: new Date().toISOString().split('T')[0],
    required_date: '',
    channel: 'direct',
    payment_method: '',
    notes: '',
    lines: [
      {
        product_name: '',
        product_sku: '',
        qty_ordered: 1,
        unit_price: 0,
        notes: ''
      }
    ]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subtotal = formData.lines.reduce((sum, line) => 
      sum + (line.qty_ordered * line.unit_price), 0
    );
    const tax_amount = subtotal * 0.1; // 10% tax
    const shipping_cost = 10; // Fixed shipping cost
    const total_amount = subtotal + tax_amount + shipping_cost;

    const so = {
      org_id: 'current-org-id', // Should be dynamic
      so_number: `SO-${Date.now()}`,
      customer_name: formData.customer_name,
      customer_contact: {
        email: formData.customer_email,
        phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address
      },
      order_date: formData.order_date,
      required_date: formData.required_date,
      channel: formData.channel,
      payment_method: formData.payment_method,
      notes: formData.notes,
      subtotal,
      tax_amount,
      shipping_cost,
      total_amount,
      status: 'pending'
    };

    onSave({ so, lines: formData.lines });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard borderGradient="primary" className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Create Sales Order
            </h2>
            <button onClick={onClose} className="text-[#b0b0d0] hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <BrandCard borderGradient="secondary" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Customer Name *
                  </label>
                  <BrandInput
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Email
                  </label>
                  <BrandInput
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Phone
                  </label>
                  <BrandInput
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Sales Channel
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  >
                    <option value="direct">Direct Sales</option>
                    <option value="amazon">Amazon</option>
                    <option value="ebay">eBay</option>
                    <option value="shopify">Shopify</option>
                    <option value="walmart">Walmart</option>
                    <option value="website">Website</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Shipping Address
                  </label>
                  <textarea
                    value={formData.shipping_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, shipping_address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    placeholder="Shipping address..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Billing Address
                  </label>
                  <textarea
                    value={formData.billing_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    placeholder="Billing address..."
                  />
                </div>
              </div>
            </BrandCard>

            {/* Similar structure as PO modal but for sales... */}
            {/* Order Details and Lines would follow similar pattern */}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <BrandButton variant="secondary" onClick={onClose}>
                Cancel
              </BrandButton>
              <BrandButton variant="primary" type="submit">
                <Save className="w-4 h-4 mr-2" />
                Create Sales Order
              </BrandButton>
            </div>
          </form>
        </div>
      </BrandCard>
    </div>
  );
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  type
}) => {
  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'processing': case 'partially_received': return 'warning';
      case 'received': case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard borderGradient="primary" className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              {type === 'purchase' ? <ShoppingCart className="w-6 h-6 mr-2" /> : <Package className="w-6 h-6 mr-2" />}
              {type === 'purchase' ? 
                `Purchase Order ${(order as PurchaseOrder).po_number}` : 
                `Sales Order ${(order as SalesOrder).so_number}`
              }
            </h2>
            <button onClick={onClose} className="text-[#b0b0d0] hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Order Header */}
            <BrandCard borderGradient="secondary" className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Status</label>
                  <BrandBadge variant={getStatusColor(order.status)} size="md">
                    {order.status.toUpperCase()}
                  </BrandBadge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Order Date</label>
                  <p className="text-white">{new Date(order.order_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Total Amount</label>
                  <p className="text-white font-bold text-lg">${order.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </BrandCard>

            {/* Customer/Supplier Info */}
            <BrandCard borderGradient="accent" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">
                {type === 'purchase' ? 'Supplier Information' : 'Customer Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Name</label>
                  <p className="text-white">
                    {type === 'purchase' ? 
                      (order as PurchaseOrder).supplier_name : 
                      (order as SalesOrder).customer_name
                    }
                  </p>
                </div>
                {order.notes && (
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Notes</label>
                    <p className="text-white">{order.notes}</p>
                  </div>
                )}
              </div>
            </BrandCard>

            {/* Order Lines */}
            <BrandCard borderGradient="purple" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-[#b0b0d0] py-2">Product</th>
                      <th className="text-right text-[#b0b0d0] py-2">Qty Ordered</th>
                      {type === 'purchase' && (
                        <th className="text-right text-[#b0b0d0] py-2">Qty Received</th>
                      )}
                      <th className="text-right text-[#b0b0d0] py-2">Unit Price</th>
                      <th className="text-right text-[#b0b0d0] py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lines?.map((line: any) => (
                      <tr key={line.id} className="border-b border-white/10">
                        <td className="py-3">
                          <div>
                            <p className="text-white font-medium">{line.product_name}</p>
                            {line.product_sku && (
                              <p className="text-[#b0b0d0] text-sm">SKU: {line.product_sku}</p>
                            )}
                          </div>
                        </td>
                        <td className="text-right text-white py-3">
                          {type === 'purchase' ? line.qty_ordered : line.qty_ordered}
                        </td>
                        {type === 'purchase' && (
                          <td className="text-right text-white py-3">
                            {(line as PurchaseOrderLine).qty_received}
                          </td>
                        )}
                        <td className="text-right text-white py-3">
                          ${(type === 'purchase' ? line.unit_cost : line.unit_price).toFixed(2)}
                        </td>
                        <td className="text-right text-white py-3 font-medium">
                          ${line.line_total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Totals */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-[#b0b0d0]">Subtotal:</span>
                  <span className="text-white font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#b0b0d0]">Tax:</span>
                  <span className="text-white font-medium">${order.tax_amount.toFixed(2)}</span>
                </div>
                {(order as SalesOrder).shipping_cost !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#b0b0d0]">Shipping:</span>
                    <span className="text-white font-medium">${(order as SalesOrder).shipping_cost.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-white/20 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-white font-bold text-lg">${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </BrandCard>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-white/10">
              <div className="flex space-x-3">
                <BrandButton variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </BrandButton>
                <BrandButton variant="secondary">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </BrandButton>
              </div>
              <div className="flex space-x-3">
                <BrandButton variant="secondary" onClick={onClose}>
                  Close
                </BrandButton>
                <BrandButton variant="primary">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Order
                </BrandButton>
              </div>
            </div>
          </div>
        </div>
      </BrandCard>
    </div>
  );
};

const OrderManagement: React.FC<OrderManagementProps> = ({ orgId }) => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'sales'>('purchase');
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [showCreateSO, setShowCreateSO] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | SalesOrder | null>(null);
  const [orderDetailsType, setOrderDetailsType] = useState<'purchase' | 'sales'>('purchase');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: purchaseOrders = [], isLoading: loadingPOs } = usePurchaseOrders(orgId);
  const { data: salesOrders = [], isLoading: loadingSOs } = useSalesOrders(orgId);
  const createPOMutation = useCreatePurchaseOrder();
  const createSOMutation = useCreateSalesOrder();

  const handleCreatePO = async (data: any) => {
    try {
      await createPOMutation.mutateAsync(data);
      setShowCreatePO(false);
    } catch (error) {
      console.error('Error creating purchase order:', error);
    }
  };

  const handleCreateSO = async (data: any) => {
    try {
      await createSOMutation.mutateAsync(data);
      setShowCreateSO(false);
    } catch (error) {
      console.error('Error creating sales order:', error);
    }
  };

  const handleViewOrder = (order: PurchaseOrder | SalesOrder, type: 'purchase' | 'sales') => {
    setSelectedOrder(order);
    setOrderDetailsType(type);
    setShowOrderDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'processing': case 'partially_received': return 'warning';
      case 'received': case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const filteredPOs = purchaseOrders.filter(po =>
    (po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     po.po_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || po.status === statusFilter)
  );

  const filteredSOs = salesOrders.filter(so =>
    (so.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     so.so_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || so.status === statusFilter)
  );

  // Calculate stats
  const poStats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter(po => po.status === 'sent' || po.status === 'confirmed').length,
    received: purchaseOrders.filter(po => po.status === 'received').length,
    totalValue: purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0)
  };

  const soStats = {
    total: salesOrders.length,
    pending: salesOrders.filter(so => so.status === 'pending' || so.status === 'confirmed').length,
    shipped: salesOrders.filter(so => so.status === 'shipped' || so.status === 'delivered').length,
    totalValue: salesOrders.reduce((sum, so) => sum + so.total_amount, 0)
  };

  return (
    <BrandPageLayout
      title="Order Management"
      subtitle="Manage purchase orders and sales orders efficiently"
      actions={
        <div className="flex space-x-3">
          <BrandButton variant="secondary" onClick={() => setShowCreatePO(true)}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            New Purchase Order
          </BrandButton>
          <BrandButton variant="primary" onClick={() => setShowCreateSO(true)}>
            <Package className="w-4 h-4 mr-2" />
            New Sales Order
          </BrandButton>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-white/20 mb-6">
        <button
          onClick={() => setActiveTab('purchase')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'purchase'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'sales'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Sales Orders
        </button>
      </div>

      {/* Stats */}
      <BrandStatsGrid className="mb-6">
        {activeTab === 'purchase' ? (
          <>
            <BrandStatCard
              title="Total Purchase Orders"
              value={poStats.total}
              icon={<ShoppingCart className="w-8 h-8" />}
              color="primary"
            />
            <BrandStatCard
              title="Pending Orders"
              value={poStats.pending}
              icon={<Clock className="w-8 h-8" />}
              color="orange"
            />
            <BrandStatCard
              title="Received Orders"
              value={poStats.received}
              icon={<CheckCircle className="w-8 h-8" />}
              color="green"
            />
            <BrandStatCard
              title="Total Value"
              value={`$${poStats.totalValue.toLocaleString()}`}
              icon={<DollarSign className="w-8 h-8" />}
              color="blue"
            />
          </>
        ) : (
          <>
            <BrandStatCard
              title="Total Sales Orders"
              value={soStats.total}
              icon={<Package className="w-8 h-8" />}
              color="primary"
            />
            <BrandStatCard
              title="Pending Orders"
              value={soStats.pending}
              icon={<Clock className="w-8 h-8" />}
              color="orange"
            />
            <BrandStatCard
              title="Shipped Orders"
              value={soStats.shipped}
              icon={<Truck className="w-8 h-8" />}
              color="green"
            />
            <BrandStatCard
              title="Total Revenue"
              value={`$${soStats.totalValue.toLocaleString()}`}
              icon={<DollarSign className="w-8 h-8" />}
              color="blue"
            />
          </>
        )}
      </BrandStatsGrid>

      {/* Filters */}
      <BrandCard borderGradient="primary" className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
              <BrandInput
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
            >
              <option value="">All Statuses</option>
              {activeTab === 'purchase' ? (
                <>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="partially_received">Partially Received</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="picked">Picked</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <BrandButton variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </BrandButton>
            <BrandButton variant="secondary">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </BrandButton>
          </div>
        </div>
      </BrandCard>

      {/* Orders List */}
      <div className="space-y-4">
        {activeTab === 'purchase' ? (
          filteredPOs.length > 0 ? (
            filteredPOs.map((po) => (
              <BrandCard key={po.id} borderGradient="secondary" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-[#a259ff]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{po.po_number}</h3>
                        <BrandBadge variant={getStatusColor(po.status)} size="sm">
                          {po.status}
                        </BrandBadge>
                      </div>
                      <p className="text-[#b0b0d0]">
                        Supplier: {po.supplier_name} • Order Date: {new Date(po.order_date).toLocaleDateString()}
                      </p>
                      <p className="text-[#b0b0d0] text-sm">
                        {po.lines?.length || 0} items • Total: ${po.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <BrandButton
                      variant="secondary"
                      onClick={() => handleViewOrder(po, 'purchase')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </BrandButton>
                    <BrandButton variant="secondary">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </BrandButton>
                    {po.status === 'confirmed' && (
                      <BrandButton variant="green">
                        <Truck className="w-4 h-4 mr-2" />
                        Receive
                      </BrandButton>
                    )}
                  </div>
                </div>
              </BrandCard>
            ))
          ) : (
            <BrandCard borderGradient="accent" className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Purchase Orders Found</h3>
              <p className="text-[#b0b0d0] mb-6">
                {searchTerm || statusFilter ? 'Try adjusting your search criteria' : 'Create your first purchase order to get started'}
              </p>
              <BrandButton variant="primary" onClick={() => setShowCreatePO(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Purchase Order
              </BrandButton>
            </BrandCard>
          )
        ) : (
          filteredSOs.length > 0 ? (
            filteredSOs.map((so) => (
              <BrandCard key={so.id} borderGradient="secondary" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#43e7ad]/20 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#43e7ad]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{so.so_number}</h3>
                        <BrandBadge variant={getStatusColor(so.status)} size="sm">
                          {so.status}
                        </BrandBadge>
                        <BrandBadge variant="info" size="sm">
                          {so.channel}
                        </BrandBadge>
                      </div>
                      <p className="text-[#b0b0d0]">
                        Customer: {so.customer_name} • Order Date: {new Date(so.order_date).toLocaleDateString()}
                      </p>
                      <p className="text-[#b0b0d0] text-sm">
                        {so.lines?.length || 0} items • Total: ${so.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <BrandButton
                      variant="secondary"
                      onClick={() => handleViewOrder(so, 'sales')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </BrandButton>
                    <BrandButton variant="secondary">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </BrandButton>
                    {so.status === 'confirmed' && (
                      <BrandButton variant="purple">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Process
                      </BrandButton>
                    )}
                  </div>
                </div>
              </BrandCard>
            ))
          ) : (
            <BrandCard borderGradient="accent" className="text-center py-12">
              <Package className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Sales Orders Found</h3>
              <p className="text-[#b0b0d0] mb-6">
                {searchTerm || statusFilter ? 'Try adjusting your search criteria' : 'Create your first sales order to get started'}
              </p>
              <BrandButton variant="primary" onClick={() => setShowCreateSO(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Sales Order
              </BrandButton>
            </BrandCard>
          )
        )}
      </div>

      {/* Modals */}
      <CreatePurchaseOrderModal
        isOpen={showCreatePO}
        onClose={() => setShowCreatePO(false)}
        onSave={handleCreatePO}
      />

      <CreateSalesOrderModal
        isOpen={showCreateSO}
        onClose={() => setShowCreateSO(false)}
        onSave={handleCreateSO}
      />

      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        order={selectedOrder}
        type={orderDetailsType}
      />
    </BrandPageLayout>
  );
};

export default OrderManagement;
