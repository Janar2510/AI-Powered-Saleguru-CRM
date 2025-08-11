import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  DollarSign, 
  Tag, 
  Layers, 
  X, 
  Save,
  CheckSquare,
  Square,
  Users,
  Calendar,
  Warehouse,
  ShoppingCart,
  Truck,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Receipt,
  ClipboardList,
  Upload,
  Download
} from 'lucide-react';
import Card from '../components/ui/Card';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spline from '@splinetool/react-spline';
import { supabase } from '../services/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost?: number;
  purchase_price?: number; // Purchase price from supplier
  category?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'discontinued';
  inventory_count?: number;
  min_stock_level?: number; // Minimum stock level for reorder alerts
  max_stock_level?: number; // Maximum stock level
  supplier_id?: string;
  supplier_name?: string;
  warehouse_location?: string; // Physical location in warehouse
  unit_of_measure?: string; // pcs, kg, liters, etc.
  weight?: number; // Weight per unit
  dimensions?: string; // L x W x H cm
  created_at: string;
  updated_at: string;
  created_by: string;
  image_url?: string;
}

interface PurchaseOrder {
  id: string;
  product_id: string;
  product_name: string;
  supplier_id: string;
  supplier_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery: string;
  received_date?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

interface InventoryTransaction {
  id: string;
  product_id: string;
  product_name: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer';
  quantity: number;
  unit_price: number;
  total_amount: number;
  reference_id?: string; // PO ID, Sale ID, etc.
  reference_type?: string; // 'purchase_order', 'sale', 'adjustment'
  warehouse_location?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
  isNew: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave, isNew }) => {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: '',
      description: '',
      sku: '',
      price: 0,
      cost: 0,
      purchase_price: 0,
      category: '',
      tags: [],
      status: 'active',
      inventory_count: 0,
      min_stock_level: 10,
      max_stock_level: 100,
      supplier_name: '',
      warehouse_location: '',
      unit_of_measure: 'pcs',
      weight: 0,
      dimensions: ''
    }
  );
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove)
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.sku?.trim()) {
      newErrors.sku = 'SKU is required';
    }
    
    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#23233a]/95 backdrop-blur-md rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#23233a]/50">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#23233a]/30">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {isNew ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-md font-semibold text-white mb-4 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Basic Information
              </h3>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.name ? 'border-[#ef4444]' : 'border-white/20'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-[#ef4444] text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.sku ? 'border-[#ef4444]' : 'border-white/20'
                }`}
                placeholder="Enter SKU"
              />
              {errors.sku && <p className="text-[#ef4444] text-sm mt-1">{errors.sku}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              >
                <option value="">Select category</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="service">Service</option>
                <option value="subscription">Subscription</option>
                <option value="consumables">Consumables</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Unit of Measure
              </label>
              <select
                name="unit_of_measure"
                value={formData.unit_of_measure || 'pcs'}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="l">Liters</option>
                <option value="m">Meters</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
                <option value="set">Set</option>
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
            
            {/* Pricing Information */}
            <div className="md:col-span-2">
              <h3 className="text-md font-semibold text-white mb-4 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Pricing Information
              </h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Selling Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-3 py-2 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                    errors.price ? 'border-[#ef4444]' : 'border-white/20'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="text-[#ef4444] text-sm mt-1">{errors.price}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Purchase Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Cost (Internal)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Supplier Name
              </label>
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="Enter supplier name"
              />
            </div>
            
            {/* Inventory Management */}
            <div className="md:col-span-2">
              <h3 className="text-md font-semibold text-white mb-4 flex items-center">
                <Warehouse className="w-4 h-4 mr-2" />
                Inventory Management
              </h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Current Stock
              </label>
              <input
                type="number"
                name="inventory_count"
                value={formData.inventory_count}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Minimum Stock Level
              </label>
              <input
                type="number"
                name="min_stock_level"
                value={formData.min_stock_level}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Maximum Stock Level
              </label>
              <input
                type="number"
                name="max_stock_level"
                value={formData.max_stock_level}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Warehouse Location
              </label>
              <input
                type="text"
                name="warehouse_location"
                value={formData.warehouse_location}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="e.g., A1-B2-C3"
              />
            </div>
            
            {/* Physical Properties */}
            <div className="md:col-span-2">
              <h3 className="text-md font-semibold text-white mb-4 flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Physical Properties
              </h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Weight per Unit (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Dimensions (L x W x H cm)
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="10 x 5 x 2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="Enter product description"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map(tag => (
                  <span
                    key={tag}
                    className="bg-[#a259ff]/20 text-[#a259ff] px-2 py-1 rounded-lg text-sm flex items-center space-x-1"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[#a259ff] hover:text-[#a259ff]/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  placeholder="Add tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  onClick={handleAddTag}
                  variant="secondary"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-[#23233a]/30">
            <Button
              onClick={onClose}
              variant="secondary"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              icon={Save}
            >
              {isNew ? 'Create Product' : 'Update Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PurchaseOrderModalProps {
  purchaseOrder?: PurchaseOrder;
  onClose: () => void;
  onSave: (purchaseOrder: PurchaseOrder) => void;
  isNew: boolean;
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ purchaseOrder, onClose, onSave, isNew }) => {
  const [formData, setFormData] = useState<PurchaseOrder>(
    purchaseOrder || {
      id: '',
      product_id: '',
      product_name: '',
      supplier_id: '',
      supplier_name: '',
      quantity: 0,
      unit_price: 0,
      total_amount: 0,
      status: 'pending',
      order_date: new Date().toISOString(),
      expected_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'user-1',
      created_at: new Date().toISOString()
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numValue = parseFloat(value) || 0;
      setFormData({
        ...formData,
        [name]: numValue,
        total_amount: name === 'quantity' || name === 'unit_price' 
          ? (name === 'quantity' ? numValue : formData.quantity) * (name === 'unit_price' ? numValue : formData.unit_price)
          : formData.total_amount
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.product_name?.trim()) {
      newErrors.product_name = 'Product name is required';
    }
    
    if (!formData.supplier_name?.trim()) {
      newErrors.supplier_name = 'Supplier name is required';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (formData.unit_price <= 0) {
      newErrors.unit_price = 'Unit price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#23233a]/95 backdrop-blur-md rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#23233a]/50">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#23233a]/30">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {isNew ? 'Create Purchase Order' : 'Edit Purchase Order'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.product_name ? 'border-[#ef4444]' : 'border-white/20'
                }`}
                placeholder="Enter product name"
              />
              {errors.product_name && <p className="text-[#ef4444] text-sm mt-1">{errors.product_name}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Supplier Name *
              </label>
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.supplier_name ? 'border-[#ef4444]' : 'border-white/20'
                }`}
                placeholder="Enter supplier name"
              />
              {errors.supplier_name && <p className="text-[#ef4444] text-sm mt-1">{errors.supplier_name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                  errors.quantity ? 'border-[#ef4444]' : 'border-white/20'
                }`}
                placeholder="0"
              />
              {errors.quantity && <p className="text-[#ef4444] text-sm mt-1">{errors.quantity}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Unit Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-3 py-2 bg-[#23233a]/50 border-2 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] ${
                    errors.unit_price ? 'border-[#ef4444]' : 'border-white/20'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.unit_price && <p className="text-[#ef4444] text-sm mt-1">{errors.unit_price}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Total Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
                <input
                  type="number"
                  value={formData.total_amount}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              >
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Order Date
              </label>
              <input
                type="date"
                name="order_date"
                value={formData.order_date.split('T')[0]}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Expected Delivery
              </label>
              <input
                type="date"
                name="expected_delivery"
                value={formData.expected_delivery.split('T')[0]}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                placeholder="Enter any additional notes"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-[#23233a]/30">
            <Button
              onClick={onClose}
              variant="secondary"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              icon={Save}
            >
              {isNew ? 'Create Order' : 'Update Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'warehouse'>('list');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Warehouse management states
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'purchases' | 'inventory' | 'analytics'>('products');
  
  // Bulk operations states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  
  // Advanced filtering states
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [stockRange, setStockRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [supplierFilter, setSupplierFilter] = useState<string>('');
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadProducts();
    loadPurchaseOrders();
    loadInventoryTransactions();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Mock data for development since supabase might not be configured
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Enterprise CRM License',
          description: 'Annual license for enterprise CRM software',
          sku: 'CRM-ENT-001',
          price: 5000,
          cost: 2000,
          purchase_price: 1800,
          category: 'software',
          tags: ['enterprise', 'license', 'annual'],
          status: 'active',
          inventory_count: 100,
          min_stock_level: 20,
          max_stock_level: 200,
          supplier_name: 'Microsoft Corp',
          warehouse_location: 'A1-B2-C3',
          unit_of_measure: 'license',
          weight: 0,
          dimensions: '0 x 0 x 0',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'user-1',
          image_url: 'https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
          id: '2',
          name: 'Data Migration Service',
          description: 'Professional data migration and integration service',
          sku: 'SVC-MIG-001',
          price: 2500,
          cost: 800,
          purchase_price: 600,
          category: 'service',
          tags: ['migration', 'integration', 'professional'],
          status: 'active',
          inventory_count: 50,
          min_stock_level: 10,
          max_stock_level: 100,
          supplier_name: 'Tech Solutions Inc',
          warehouse_location: 'D4-E5-F6',
          unit_of_measure: 'hour',
          weight: 0,
          dimensions: '0 x 0 x 0',
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'user-1',
          image_url: 'https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
          id: '3',
          name: 'Network Switch 24-Port',
          description: '24-port gigabit network switch for enterprise use',
          sku: 'HW-SW-24P-001',
          price: 800,
          cost: 400,
          purchase_price: 350,
          category: 'hardware',
          tags: ['network', 'switch', 'gigabit'],
          status: 'active',
          inventory_count: 15,
          min_stock_level: 5,
          max_stock_level: 50,
          supplier_name: 'Cisco Systems',
          warehouse_location: 'G7-H8-I9',
          unit_of_measure: 'pcs',
          weight: 2.5,
          dimensions: '30 x 20 x 5',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'user-1',
          image_url: 'https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
          id: '4',
          name: 'Cloud Storage Subscription',
          description: 'Monthly cloud storage subscription with backup',
          sku: 'SUB-CLOUD-001',
          price: 100,
          cost: 30,
          purchase_price: 25,
          category: 'subscription',
          tags: ['cloud', 'storage', 'backup'],
          status: 'active',
          inventory_count: 200,
          min_stock_level: 50,
          max_stock_level: 500,
          supplier_name: 'AWS',
          warehouse_location: 'J10-K11-L12',
          unit_of_measure: 'subscription',
          weight: 0,
          dimensions: '0 x 0 x 0',
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'user-1',
          image_url: 'https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      // Mock purchase orders data
      const mockPurchaseOrders: PurchaseOrder[] = [
        {
          id: 'po-1',
          product_id: '1',
          product_name: 'Enterprise CRM License',
          supplier_id: 'supplier-1',
          supplier_name: 'Microsoft Corp',
          quantity: 50,
          unit_price: 1800,
          total_amount: 90000,
          status: 'ordered',
          order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          expected_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Annual license renewal',
          created_by: 'user-1',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'po-2',
          product_id: '3',
          product_name: 'Network Switch 24-Port',
          supplier_id: 'supplier-2',
          supplier_name: 'Cisco Systems',
          quantity: 20,
          unit_price: 350,
          total_amount: 7000,
          status: 'received',
          order_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          expected_delivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          received_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'New office setup',
          created_by: 'user-1',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setPurchaseOrders(mockPurchaseOrders);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    }
  };

  const loadInventoryTransactions = async () => {
    try {
      // Mock inventory transactions data
      const mockTransactions: InventoryTransaction[] = [
        {
          id: 'inv-1',
          product_id: '3',
          product_name: 'Network Switch 24-Port',
          transaction_type: 'purchase',
          quantity: 20,
          unit_price: 350,
          total_amount: 7000,
          reference_id: 'po-2',
          reference_type: 'purchase_order',
          warehouse_location: 'G7-H8-I9',
          notes: 'Received from Cisco Systems',
          created_by: 'user-1',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'inv-2',
          product_id: '1',
          product_name: 'Enterprise CRM License',
          transaction_type: 'sale',
          quantity: 5,
          unit_price: 5000,
          total_amount: 25000,
          reference_id: 'sale-1',
          reference_type: 'sale',
          warehouse_location: 'A1-B2-C3',
          notes: 'Sold to ABC Corp',
          created_by: 'user-1',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setInventoryTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading inventory transactions:', error);
    }
  };

  const handleCreateProduct = () => {
    setIsNewProduct(true);
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setIsNewProduct(false);
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      // For development, update the UI optimistically
      if (isNewProduct) {
        const newProduct = {
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'user-1',
          ...productData
        } as Product;
        setProducts([...products, newProduct]);
      } else {
        setProducts(products.map(p => p.id === selectedProduct?.id ? { ...p, ...productData } : p));
      }
      
      setShowProductModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setShowProductModal(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      // For development, update the UI optimistically
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) return;
    
    try {
      setProducts(products.filter(p => !selectedProducts.has(p.id)));
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Error bulk deleting products:', error);
    }
  };

  const handleCreatePurchaseOrder = (product: Product) => {
    setSelectedPurchaseOrder({
      id: `po-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      supplier_id: '',
      supplier_name: product.supplier_name || '',
      quantity: 0,
      unit_price: product.purchase_price || 0,
      total_amount: 0,
      status: 'pending',
      order_date: new Date().toISOString(),
      expected_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'user-1',
      created_at: new Date().toISOString()
    });
    setShowPurchaseModal(true);
  };

  const handleSavePurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    if (selectedPurchaseOrder) {
      // Update existing PO
      setPurchaseOrders(prev => prev.map(po => 
        po.id === selectedPurchaseOrder.id ? { ...po, ...purchaseOrder } : po
      ));
    } else {
      // Create new PO
      setPurchaseOrders(prev => [...prev, purchaseOrder]);
    }
    setShowPurchaseModal(false);
    setSelectedPurchaseOrder(null);
  };

  const handleReceivePurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    // Update PO status
    setPurchaseOrders(prev => prev.map(po => 
      po.id === purchaseOrder.id ? { ...po, status: 'received', received_date: new Date().toISOString() } : po
    ));

    // Create inventory transaction
    const transaction: InventoryTransaction = {
      id: `inv-${Date.now()}`,
      product_id: purchaseOrder.product_id,
      product_name: purchaseOrder.product_name,
      transaction_type: 'purchase',
      quantity: purchaseOrder.quantity,
      unit_price: purchaseOrder.unit_price,
      total_amount: purchaseOrder.total_amount,
      reference_id: purchaseOrder.id,
      reference_type: 'purchase_order',
      warehouse_location: products.find(p => p.id === purchaseOrder.product_id)?.warehouse_location || '',
      notes: `Received from ${purchaseOrder.supplier_name}`,
      created_by: 'user-1',
      created_at: new Date().toISOString()
    };

    setInventoryTransactions(prev => [transaction, ...prev]);

    // Update product inventory
    setProducts(prev => prev.map(p => 
      p.id === purchaseOrder.product_id 
        ? { ...p, inventory_count: (p.inventory_count || 0) + purchaseOrder.quantity }
        : p
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'inactive':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'discontinued':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'software':
        return <Package className="w-4 h-4" />;
      case 'hardware':
        return <Layers className="w-4 h-4" />;
      case 'service':
        return <Users className="w-4 h-4" />;
      case 'subscription':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStockStatus = (product: Product) => {
    const currentStock = product.inventory_count || 0;
    const minStock = product.min_stock_level || 0;
    
    if (currentStock === 0) {
      return { status: 'out-of-stock', color: 'text-red-400', icon: <AlertTriangle className="w-4 h-4" /> };
    } else if (currentStock <= minStock) {
      return { status: 'low-stock', color: 'text-yellow-400', icon: <AlertTriangle className="w-4 h-4" /> };
    } else {
      return { status: 'in-stock', color: 'text-green-400', icon: <CheckSquare className="w-4 h-4" /> };
    }
  };

  const getPurchaseOrderStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'ordered':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'received':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'cancelled':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const lowStockProducts = products.filter(product => {
    const currentStock = product.inventory_count || 0;
    const minStock = product.min_stock_level || 0;
    return currentStock <= minStock;
  });

  const totalInventoryValue = products.reduce((sum, product) => {
    return sum + ((product.inventory_count || 0) * (product.cost || 0));
  }, 0);

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const outOfStockProducts = products.filter(p => (p.inventory_count || 0) === 0).length;

  // Bulk import/export functions
  const generateSampleFile = () => {
    const sampleData = [
      {
        name: 'Sample Product 1',
        sku: 'SAMPLE-001',
        description: 'This is a sample product description',
        price: 100.00,
        purchase_price: 80.00,
        cost: 85.00,
        category: 'software',
        unit_of_measure: 'pcs',
        inventory_count: 50,
        min_stock_level: 10,
        max_stock_level: 100,
        supplier_name: 'Sample Supplier Inc.',
        warehouse_location: 'A1-B2-C3',
        weight: 1.5,
        dimensions: '10 x 5 x 2',
        status: 'active',
        tags: 'sample,test,import'
      },
      {
        name: 'Sample Product 2',
        sku: 'SAMPLE-002',
        description: 'Another sample product for testing',
        price: 250.00,
        purchase_price: 200.00,
        cost: 210.00,
        category: 'hardware',
        unit_of_measure: 'pcs',
        inventory_count: 25,
        min_stock_level: 5,
        max_stock_level: 50,
        supplier_name: 'Hardware Supplier Co.',
        warehouse_location: 'D4-E5-F6',
        weight: 2.0,
        dimensions: '15 x 8 x 3',
        status: 'active',
        tags: 'hardware,sample,test'
      }
    ];

    const csvContent = [
      // Header row
      'name,sku,description,price,purchase_price,cost,category,unit_of_measure,inventory_count,min_stock_level,max_stock_level,supplier_name,warehouse_location,weight,dimensions,status,tags',
      // Data rows
      ...sampleData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_import_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
    } else {
      showToast({ title: 'Please select a valid CSV file', type: 'error' });
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await importFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).filter(line => line.trim());

      const newProducts: Product[] = [];
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i].split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
        const product: Partial<Product> = {};
        
        headers.forEach((header, index) => {
          const value = row[index];
          if (value) {
            switch (header) {
              case 'name':
                product.name = value;
                break;
              case 'sku':
                product.sku = value;
                break;
              case 'description':
                product.description = value;
                break;
              case 'price':
                product.price = parseFloat(value) || 0;
                break;
              case 'purchase_price':
                product.purchase_price = parseFloat(value) || 0;
                break;
              case 'cost':
                product.cost = parseFloat(value) || 0;
                break;
              case 'category':
                product.category = value;
                break;
              case 'unit_of_measure':
                product.unit_of_measure = value;
                break;
              case 'inventory_count':
                product.inventory_count = parseInt(value) || 0;
                break;
              case 'min_stock_level':
                product.min_stock_level = parseInt(value) || 0;
                break;
              case 'max_stock_level':
                product.max_stock_level = parseInt(value) || 0;
                break;
              case 'supplier_name':
                product.supplier_name = value;
                break;
              case 'warehouse_location':
                product.warehouse_location = value;
                break;
              case 'weight':
                product.weight = parseFloat(value) || 0;
                break;
              case 'dimensions':
                product.dimensions = value;
                break;
              case 'status':
                product.status = value as 'active' | 'inactive' | 'discontinued';
                break;
              case 'tags':
                product.tags = value.split(',').map(tag => tag.trim());
                break;
            }
          }
        });

        if (product.name && product.sku) {
          newProducts.push({
            id: `import-${Date.now()}-${i}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'user-1',
            ...product
          } as Product);
        }

        setImportProgress(((i + 1) / data.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay for progress animation
      }

      setProducts([...newProducts, ...products]);
      setImportFile(null);
      setImportProgress(0);
      setShowImportModal(false);
      showToast({ title: `Successfully imported ${newProducts.length} products`, type: 'success' });
    } catch (error) {
      console.error('Import error:', error);
      showToast({ title: 'Error importing products', type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleBulkExport = () => {
    const csvContent = [
      // Header row
      'name,sku,description,price,purchase_price,cost,category,unit_of_measure,inventory_count,min_stock_level,max_stock_level,supplier_name,warehouse_location,weight,dimensions,status,tags',
      // Data rows
      ...products.map(product => [
        product.name,
        product.sku,
        product.description || '',
        product.price,
        product.purchase_price || 0,
        product.cost || 0,
        product.category || '',
        product.unit_of_measure || 'pcs',
        product.inventory_count || 0,
        product.min_stock_level || 0,
        product.max_stock_level || 0,
        product.supplier_name || '',
        product.warehouse_location || '',
        product.weight || 0,
        product.dimensions || '',
        product.status,
        (product.tags || []).join(',')
      ].map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast({ title: `Exported ${products.length} products`, type: 'success' });
  };

  // Advanced filtering logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (product.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStatus = !statusFilter || product.status === statusFilter;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    const matchesStock = (product.inventory_count || 0) >= stockRange.min && (product.inventory_count || 0) <= stockRange.max;
    const matchesSupplier = !supplierFilter || product.supplier_name?.toLowerCase().includes(supplierFilter.toLowerCase());
    const matchesUnit = !unitFilter || product.unit_of_measure === unitFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPrice && matchesStock && matchesSupplier && matchesUnit;
  });

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Background - Same as Dashboard */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay - Same as Dashboard */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Products & Warehouse</h1>
              <p className="text-[#b0b0d0] mt-1">Manage your product catalog and warehouse operations</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowImportModal(true)}
                variant="secondary"
                size="lg"
                icon={Upload}
              >
                Import
              </Button>
              <Button
                onClick={() => setShowExportModal(true)}
                variant="secondary"
                size="lg"
                icon={Download}
              >
                Export
              </Button>
              <Button
                onClick={() => setActiveTab('purchases')}
                variant="secondary"
                size="lg"
                icon={ShoppingCart}
              >
                Purchase Orders
              </Button>
              <Button
                onClick={() => setActiveTab('inventory')}
                variant="secondary"
                size="lg"
                icon={Warehouse}
              >
                Inventory
              </Button>
              <Button
                onClick={handleCreateProduct}
                variant="gradient"
                size="lg"
                icon={Plus}
              >
                Add Product
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 border-b border-[#23233a]/30">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'purchases'
                  ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              Purchase Orders
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'inventory'
                  ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                  : 'text-[#b0b0d0] hover:text-white'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'products' && (
            <>
              {/* Search and Filters */}
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      >
                        <option value="">All Categories</option>
                        {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(category => (
                          <option key={category} value={category}>
                            {category?.charAt(0).toUpperCase() + category?.slice(1)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      variant="secondary"
                      size="sm"
                      icon={Filter}
                    >
                      Advanced Filters
                    </Button>
                    <div className="flex space-x-1 bg-[#23233a]/50 border-2 border-white/20 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'list'
                            ? 'bg-[#a259ff] text-white'
                            : 'text-[#b0b0d0] hover:text-white'
                        }`}
                      >
                        <Square className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-[#a259ff] text-white'
                            : 'text-[#b0b0d0] hover:text-white'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {selectedProducts.size > 0 && (
                      <Button
                        onClick={handleBulkDelete}
                        variant="secondary"
                        size="sm"
                        icon={Trash2}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete ({selectedProducts.size})
                      </Button>
                    )}
                  </div>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="mt-4 pt-4 border-t border-[#23233a]/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Price Range</label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: parseFloat(e.target.value) || 10000 })}
                            className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Stock Range</label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={stockRange.min}
                            onChange={(e) => setStockRange({ ...stockRange, min: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={stockRange.max}
                            onChange={(e) => setStockRange({ ...stockRange, max: parseInt(e.target.value) || 1000 })}
                            className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Supplier</label>
                        <input
                          type="text"
                          placeholder="Search supplier..."
                          value={supplierFilter}
                          onChange={(e) => setSupplierFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Unit of Measure</label>
                        <select
                          value={unitFilter}
                          onChange={(e) => setUnitFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                        >
                          <option value="">All Units</option>
                          <option value="pcs">Pieces</option>
                          <option value="kg">Kilograms</option>
                          <option value="l">Liters</option>
                          <option value="m">Meters</option>
                          <option value="box">Box</option>
                          <option value="pack">Pack</option>
                          <option value="set">Set</option>
                          <option value="hour">Hour</option>
                          <option value="day">Day</option>
                          <option value="month">Month</option>
                          <option value="year">Year</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setPriceRange({ min: 0, max: 10000 });
                          setStockRange({ min: 0, max: 1000 });
                          setSupplierFilter('');
                          setUnitFilter('');
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Products List */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#b0b0d0]">Loading products...</p>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <div key={product.id} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                            />
                            
                            <div className="w-12 h-12 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                              {getCategoryIcon(product.category)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                <Badge variant="secondary" size="sm" className={getStatusColor(product.status)}>
                                  {product.status}
                                </Badge>
                                <div className={`flex items-center space-x-1 ${stockStatus.color}`}>
                                  {stockStatus.icon}
                                  <span className="text-sm">{stockStatus.status}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-[#b0b0d0]">
                                <span>SKU: {product.sku}</span>
                                <span>Price: {formatCurrency(product.price)}</span>
                                <span>Stock: {product.inventory_count || 0} {product.unit_of_measure}</span>
                                {product.supplier_name && (
                                  <span>Supplier: {product.supplier_name}</span>
                                )}
                                {product.warehouse_location && (
                                  <span>Location: {product.warehouse_location}</span>
                                )}
                              </div>
                              
                              {product.description && (
                                <p className="text-sm text-[#b0b0d0] mt-1">{product.description}</p>
                              )}
                              
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {product.tags.map(tag => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-[#a259ff]/20 text-[#a259ff] text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleCreatePurchaseOrder(product)}
                              variant="secondary"
                              size="sm"
                              icon={ShoppingCart}
                            >
                              Purchase
                            </Button>
                            <Button
                              onClick={() => handleEditProduct(product)}
                              variant="secondary"
                              size="sm"
                              icon={Edit}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteProduct(product.id)}
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              className="text-red-400 hover:text-red-300"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 text-center py-8">
                  <Package className="w-12 h-12 text-[#b0b0d0] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                  <p className="text-[#b0b0d0]">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Add your first product to get started'}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Purchase Orders</h2>
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  variant="gradient"
                  size="lg"
                  icon={Plus}
                >
                  New Purchase Order
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchaseOrders.map((po) => (
                  <div key={po.id} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{po.product_name}</h3>
                        <Badge variant="secondary" size="sm" className={getPurchaseOrderStatusColor(po.status)}>
                          {po.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-[#b0b0d0]">
                        <div>Supplier: {po.supplier_name}</div>
                        <div>Quantity: {po.quantity}</div>
                        <div>Unit Price: {formatCurrency(po.unit_price)}</div>
                        <div>Total: {formatCurrency(po.total_amount)}</div>
                        <div>Order Date: {new Date(po.order_date).toLocaleDateString()}</div>
                        <div>Expected: {new Date(po.expected_delivery).toLocaleDateString()}</div>
                      </div>
                      
                      {po.notes && (
                        <p className="text-sm text-[#b0b0d0] italic">{po.notes}</p>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        {po.status === 'ordered' && (
                          <Button
                            onClick={() => handleReceivePurchaseOrder(po)}
                            variant="secondary"
                            size="sm"
                            icon={Truck}
                          >
                            Receive
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setSelectedPurchaseOrder(po);
                            setShowPurchaseModal(true);
                          }}
                          variant="secondary"
                          size="sm"
                          icon={Edit}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Inventory Transactions</h2>
              </div>

              <div className="space-y-4">
                {inventoryTransactions.map((transaction) => (
                  <div key={transaction.id} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                          {transaction.transaction_type === 'purchase' && <Truck className="w-5 h-5" />}
                          {transaction.transaction_type === 'sale' && <DollarSign className="w-5 h-5" />}
                          {transaction.transaction_type === 'adjustment' && <BarChart3 className="w-5 h-5" />}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-white">{transaction.product_name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-[#b0b0d0]">
                            <span className="capitalize">{transaction.transaction_type}</span>
                            <span>Qty: {transaction.quantity}</span>
                            <span>Price: {formatCurrency(transaction.unit_price)}</span>
                            <span>Total: {formatCurrency(transaction.total_amount)}</span>
                            {transaction.warehouse_location && (
                              <span>Location: {transaction.warehouse_location}</span>
                            )}
                          </div>
                          {transaction.notes && (
                            <p className="text-sm text-[#b0b0d0] mt-1">{transaction.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-[#b0b0d0]">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Warehouse Analytics</h2>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-white">{totalProducts}</div>
                    <div className="text-[#b0b0d0] text-sm">Total Products</div>
                  </div>
                </div>
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-[#43e7ad]">{activeProducts}</div>
                    <div className="text-[#b0b0d0] text-sm">Active Products</div>
                  </div>
                </div>
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-[#f59e0b]">{lowStockProducts.length}</div>
                    <div className="text-[#b0b0d0] text-sm">Low Stock Items</div>
                  </div>
                </div>
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-[#a259ff]">{formatCurrency(totalInventoryValue)}</div>
                    <div className="text-[#b0b0d0] text-sm">Total Inventory Value</div>
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              {lowStockProducts.length > 0 && (
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-[#f59e0b] mr-2" />
                      Low Stock Alerts
                    </h3>
                    <div className="space-y-2">
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg">
                          <div>
                            <div className="font-medium text-white">{product.name}</div>
                            <div className="text-sm text-[#b0b0d0]">
                              Current: {product.inventory_count || 0} | Min: {product.min_stock_level || 0}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleCreatePurchaseOrder(product)}
                            variant="secondary"
                            size="sm"
                            icon={ShoppingCart}
                          >
                            Reorder
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modals */}
          {showProductModal && (
            <ProductModal
              product={selectedProduct || undefined}
              onClose={() => setShowProductModal(false)}
              onSave={handleSaveProduct}
              isNew={isNewProduct}
            />
          )}

          {showPurchaseModal && (
            <PurchaseOrderModal
              purchaseOrder={selectedPurchaseOrder || undefined}
              onClose={() => {
                setShowPurchaseModal(false);
                setSelectedPurchaseOrder(null);
              }}
              onSave={handleSavePurchaseOrder}
              isNew={!selectedPurchaseOrder}
            />
          )}

          {/* Import Modal */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#23233a]/95 backdrop-blur-md rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#23233a]/50">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#23233a]/30">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Import Products</h2>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 space-y-6">
                  <div>
                    <h3 className="text-md font-semibold text-white mb-4">Import Options</h3>
                    <div className="space-y-4">
                      <div className="bg-[#23233a]/30 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">Download Sample File</h4>
                        <p className="text-sm text-[#b0b0d0] mb-3">
                          Download a sample CSV file to see the required format for importing products.
                        </p>
                        <Button
                          onClick={generateSampleFile}
                          variant="secondary"
                          size="sm"
                          icon={Download}
                        >
                          Download Sample
                        </Button>
                      </div>
                      
                      <div className="bg-[#23233a]/30 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">Upload CSV File</h4>
                        <p className="text-sm text-[#b0b0d0] mb-3">
                          Select a CSV file with your product data. The file should include headers and match the sample format.
                        </p>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#a259ff] file:text-white hover:file:bg-[#a259ff]/80"
                        />
                        {importFile && (
                          <p className="text-sm text-[#43e7ad] mt-2">
                            Selected: {importFile.name}
                          </p>
                        )}
                      </div>
                      
                      {isImporting && (
                        <div className="bg-[#23233a]/30 rounded-lg p-4">
                          <h4 className="font-medium text-white mb-2">Importing Products...</h4>
                          <div className="w-full bg-[#23233a]/50 rounded-full h-2">
                            <div 
                              className="bg-[#a259ff] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${importProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-[#b0b0d0] mt-2">
                            Progress: {Math.round(importProgress)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-[#23233a]/30">
                    <Button
                      onClick={() => setShowImportModal(false)}
                      variant="secondary"
                      size="lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBulkImport}
                      variant="gradient"
                      size="lg"
                      icon={Upload}
                      disabled={!importFile || isImporting}
                    >
                      {isImporting ? 'Importing...' : 'Import Products'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Modal */}
          {showExportModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#23233a]/95 backdrop-blur-md rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#23233a]/50">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#23233a]/30">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Export Products</h2>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 space-y-6">
                  <div>
                    <h3 className="text-md font-semibold text-white mb-4">Export Options</h3>
                    <div className="space-y-4">
                      <div className="bg-[#23233a]/30 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">Export All Products</h4>
                        <p className="text-sm text-[#b0b0d0] mb-3">
                          Export all {products.length} products to a CSV file. This includes all product details and warehouse information.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#b0b0d0]">
                          <div>
                            <span className="font-medium text-white">Total Products:</span> {products.length}
                          </div>
                          <div>
                            <span className="font-medium text-white">Active Products:</span> {activeProducts}
                          </div>
                          <div>
                            <span className="font-medium text-white">Low Stock Items:</span> {lowStockProducts.length}
                          </div>
                          <div>
                            <span className="font-medium text-white">Total Value:</span> {formatCurrency(totalInventoryValue)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#23233a]/30 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">Export Filtered Products</h4>
                        <p className="text-sm text-[#b0b0d0] mb-3">
                          Export only the currently filtered products ({filteredProducts.length} items).
                        </p>
                        <Button
                          onClick={() => {
                            // Export filtered products logic
                            const csvContent = [
                              'name,sku,description,price,purchase_price,cost,category,unit_of_measure,inventory_count,min_stock_level,max_stock_level,supplier_name,warehouse_location,weight,dimensions,status,tags',
                              ...filteredProducts.map(product => [
                                product.name,
                                product.sku,
                                product.description || '',
                                product.price,
                                product.purchase_price || 0,
                                product.cost || 0,
                                product.category || '',
                                product.unit_of_measure || 'pcs',
                                product.inventory_count || 0,
                                product.min_stock_level || 0,
                                product.max_stock_level || 0,
                                product.supplier_name || '',
                                product.warehouse_location || '',
                                product.weight || 0,
                                product.dimensions || '',
                                product.status,
                                (product.tags || []).join(',')
                              ].map(value => 
                                typeof value === 'string' && value.includes(',') ? `"${value}"` : value
                              ).join(','))
                            ].join('\n');

                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `products_filtered_export_${new Date().toISOString().split('T')[0]}.csv`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                            
                            setShowExportModal(false);
                            showToast({ title: `Exported ${filteredProducts.length} filtered products`, type: 'success' });
                          }}
                          variant="secondary"
                          size="sm"
                          icon={Download}
                        >
                          Export Filtered ({filteredProducts.length})
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-[#23233a]/30">
                    <Button
                      onClick={() => setShowExportModal(false)}
                      variant="secondary"
                      size="lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        handleBulkExport();
                        setShowExportModal(false);
                      }}
                      variant="gradient"
                      size="lg"
                      icon={Download}
                    >
                      Export All Products
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products; 