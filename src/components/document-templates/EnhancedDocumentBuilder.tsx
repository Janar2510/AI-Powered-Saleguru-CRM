import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { 
  User, 
  Building, 
  Package, 
  Calculator, 
  Eye, 
  Download, 
  Save, 
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_id?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
  sku: string;
}

interface DocumentItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  description?: string;
}

interface DocumentData {
  id?: string;
  type: 'quote' | 'proforma' | 'invoice' | 'receipt';
  title: string;
  contact_id?: string;
  company_id?: string;
  items: DocumentItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'delivered' | 'paid';
  notes?: string;
  terms?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface EnhancedDocumentBuilderProps {
  selectedTemplate?: any;
}

const EnhancedDocumentBuilder: React.FC<EnhancedDocumentBuilderProps> = ({ selectedTemplate }) => {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  
  // State
  const [documentData, setDocumentData] = useState<DocumentData>({
    type: 'quote',
    title: '',
    items: [],
    subtotal: 0,
    tax_rate: 20,
    tax_amount: 0,
    total: 0,
    status: 'draft'
  });
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadContacts();
    loadCompanies();
    loadProducts();
  }, []);

  // Apply selected template
  useEffect(() => {
    if (selectedTemplate) {
      setDocumentData(prev => ({
        ...prev,
        type: selectedTemplate.type,
        title: selectedTemplate.name
      }));
    }
  }, [selectedTemplate]);

  // Auto-calculate totals when items change
  useEffect(() => {
    const subtotal = documentData.items.reduce((sum, item) => sum + item.total, 0);
    const tax_amount = (subtotal * documentData.tax_rate) / 100;
    const total = subtotal + tax_amount;
    
    setDocumentData(prev => ({
      ...prev,
      subtotal,
      tax_amount,
      total
    }));
  }, [documentData.items, documentData.tax_rate]);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('first_name');
      
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addItem = () => {
    const newItem: DocumentItem = {
      id: Date.now().toString(),
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      description: ''
    };
    
    setDocumentData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (index: number, field: keyof DocumentItem, value: any) => {
    const updatedItems = [...documentData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate item total
    if (field === 'quantity' || field === 'unit_price') {
      const item = updatedItems[index];
      item.total = item.quantity * item.unit_price;
    }
    
    // Auto-fill product details
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].product_name = product.name;
        updatedItems[index].unit_price = product.price;
        updatedItems[index].total = updatedItems[index].quantity * product.price;
      }
    }
    
    setDocumentData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const removeItem = (index: number) => {
    setDocumentData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const saveDocument = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const documentToSave = {
        ...documentData,
        user_id: user.id,
        contact_id: selectedContact?.id,
        company_id: selectedCompany?.id
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(documentToSave)
        .select()
        .single();

      if (error) throw error;

      showToast({
        title: 'Success',
        description: 'Document saved successfully',
        type: 'success'
      });

      setDocumentData(prev => ({ ...prev, id: data.id }));
    } catch (error) {
      console.error('Error saving document:', error);
      showToast({
        title: 'Error',
        description: 'Failed to save document',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity <= 0) return { status: 'out', color: 'text-red-500', icon: AlertTriangle };
    if (product.stock_quantity <= product.min_stock_level) return { status: 'low', color: 'text-yellow-500', icon: Clock };
    return { status: 'ok', color: 'text-green-500', icon: CheckCircle };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Document Builder</h1>
          <p className="text-gray-300">Create professional quotes, invoices, and more</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Document Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Type & Title */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Document Details</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white rounded-lg hover:from-blue-700/80 hover:to-blue-800/80 transition-colors backdrop-blur-sm"
                  >
                    <Eye className="w-4 h-4" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </button>
                  <button
                    onClick={saveDocument}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/80 to-green-700/80 text-white rounded-lg hover:from-green-700/80 hover:to-green-800/80 transition-colors disabled:opacity-50 backdrop-blur-sm"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Document Type</label>
                  <select
                    value={documentData.type}
                    onChange={(e) => setDocumentData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white backdrop-blur-sm"
                  >
                    <option value="quote">Quote</option>
                    <option value="proforma">Pro Forma</option>
                    <option value="invoice">Invoice</option>
                    <option value="receipt">Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Document Title</label>
                  <input
                    type="text"
                    value={documentData.title}
                    onChange={(e) => setDocumentData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter document title"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedContact?.id || ''}
                      onChange={(e) => {
                        const contact = contacts.find(c => c.id === e.target.value);
                        setSelectedContact(contact || null);
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white backdrop-blur-sm"
                    >
                      <option value="">Select Contact</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.first_name} {contact.last_name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="px-3 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedContact && (
                    <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <p className="text-sm font-medium text-white">{selectedContact.first_name} {selectedContact.last_name}</p>
                      <p className="text-sm text-gray-400">{selectedContact.email}</p>
                      {selectedContact.phone && <p className="text-sm text-gray-400">{selectedContact.phone}</p>}
                    </div>
                  )}
                </div>

                {/* Company Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCompany?.id || ''}
                      onChange={(e) => {
                        const company = companies.find(c => c.id === e.target.value);
                        setSelectedCompany(company || null);
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white backdrop-blur-sm"
                    >
                      <option value="">Select Company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCompanyModal(true)}
                      className="px-3 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedCompany && (
                    <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <p className="text-sm font-medium text-white">{selectedCompany.name}</p>
                      <p className="text-sm text-gray-400">{selectedCompany.email}</p>
                      {selectedCompany.phone && <p className="text-sm text-gray-400">{selectedCompany.phone}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Items</h2>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white rounded-lg hover:from-purple-700/80 hover:to-indigo-700/80 transition-colors backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {documentData.items.map((item, index) => (
                  <div key={item.id} className="border border-white/10 rounded-lg p-4 bg-white/5 backdrop-blur-sm">
                    <div className="grid grid-cols-12 gap-4">
                      {/* Product Selection */}
                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Product</label>
                        <select
                          value={item.product_id}
                          onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white backdrop-blur-sm"
                        >
                          <option value="">Select Product</option>
                          {products.map(product => {
                            const stockStatus = getStockStatus(product);
                            return (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.stock_quantity} in stock)
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white backdrop-blur-sm"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Unit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white backdrop-blur-sm"
                        />
                      </div>

                      {/* Total */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Total</label>
                        <input
                          type="number"
                          value={item.total}
                          readOnly
                          className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white backdrop-blur-sm"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-2 flex items-end">
                        <button
                          onClick={() => removeItem(index)}
                          className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-3">
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description (optional)"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={documentData.tax_rate}
                    onChange={(e) => setDocumentData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal:</span>
                    <span className="font-medium text-white">€{documentData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tax ({documentData.tax_rate}%):</span>
                    <span className="font-medium text-white">€{documentData.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-white/10 pt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-white">€{documentData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white rounded-lg hover:from-blue-700/80 hover:to-blue-800/80 transition-colors backdrop-blur-sm">
                  <Calculator className="w-4 h-4" />
                  Calculate Totals
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600/80 to-green-700/80 text-white rounded-lg hover:from-green-700/80 hover:to-green-800/80 transition-colors backdrop-blur-sm">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600/80 to-purple-700/80 text-white rounded-lg hover:from-purple-700/80 hover:to-purple-800/80 transition-colors backdrop-blur-sm">
                  <Download className="w-4 h-4" />
                  Export DOCX
                </button>
              </div>
            </div>

            {/* Stock Alerts */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Stock Alerts</h2>
              <div className="space-y-2">
                {products
                  .filter(product => product.stock_quantity <= product.min_stock_level)
                  .map(product => {
                    const stockStatus = getStockStatus(product);
                    const Icon = stockStatus.icon;
                    return (
                      <div key={product.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                        <Icon className={`w-4 h-4 ${stockStatus.color}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{product.name}</p>
                          <p className="text-xs text-gray-400">
                            {product.stock_quantity} units remaining
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {products.filter(p => p.stock_quantity <= p.min_stock_level).length === 0 && (
                  <p className="text-sm text-gray-400">No stock alerts</p>
                )}
              </div>
            </div>

            {/* Document Preview */}
            {previewMode && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
                <div className="bg-white/5 rounded-lg p-4 min-h-[400px] border border-white/10 backdrop-blur-sm">
                  <div className="text-center text-gray-400">
                    Document preview will appear here
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDocumentBuilder;
