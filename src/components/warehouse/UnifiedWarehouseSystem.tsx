import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Truck, ShoppingCart, BarChart3, Settings, Plus, Eye, Edit, Download, Send, RefreshCw, CheckCircle, Clock, AlertTriangle, Warehouse, Box, Palette, Tag, MapPin, Users } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit_price: number;
  currency: string;
  stock_quantity: number;
  reorder_point: number;
  variants: ProductVariant[];
  images: string[];
  is_active: boolean;
  supplier_id?: string;
  supplier_name?: string;
  location: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

interface ProductVariant {
  id: string;
  product_id: string;
  attributes: { [key: string]: string };
  sku: string;
  unit_price: number;
  stock_quantity: number;
  location: string;
}

interface PurchaseOrder {
  id: string;
  number: string;
  supplier_id: string;
  supplier_name: string;
  supplier_email: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  total_amount: number;
  currency: string;
  created_at: Date;
  expected_delivery: Date;
  items: PurchaseOrderItem[];
  notes?: string;
  payment_terms: string;
}

interface PurchaseOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity: number;
}

interface InventoryMovement {
  id: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  from_location?: string;
  to_location?: string;
  reference_id?: string;
  reference_type?: 'purchase_order' | 'sales_order' | 'transfer' | 'adjustment';
  notes?: string;
  created_at: Date;
  created_by: string;
}

interface Warehouse {
  id: string;
  name: string;
  address: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  capacity: number;
  used_capacity: number;
  zones: WarehouseZone[];
  is_active: boolean;
}

interface WarehouseZone {
  id: string;
  name: string;
  warehouse_id: string;
  capacity: number;
  used_capacity: number;
  temperature_range?: string;
  humidity_range?: string;
  is_active: boolean;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_person: string;
  payment_terms: string;
  rating: number;
  total_orders: number;
  total_spent: number;
  is_active: boolean;
}

interface StockAlert {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  reorder_point: number;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock';
  created_at: Date;
  is_resolved: boolean;
}

const UnifiedWarehouseSystem: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();

  const [activeTab, setActiveTab] = useState<'inventory' | 'products' | 'purchases' | 'warehouses' | 'suppliers' | 'movements' | 'alerts' | 'analytics'>('inventory');
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'PROD-001',
      name: 'CRM Software License',
      sku: 'CRM-LIC-001',
      description: 'Annual subscription for CRM software',
      category: 'Software',
      unit_price: 3000.00,
      currency: 'USD',
      stock_quantity: 50,
      reorder_point: 10,
      variants: [
        {
          id: 'VAR-001',
          product_id: 'PROD-001',
          attributes: { 'Users': '10', 'Duration': '1 Year' },
          sku: 'CRM-LIC-001-10-1Y',
          unit_price: 3000.00,
          stock_quantity: 50,
          location: 'Zone A-01'
        }
      ],
      images: ['/images/crm-software.jpg'],
      is_active: true,
      supplier_id: 'SUP-001',
      supplier_name: 'Tech Solutions Inc.',
      location: 'Zone A-01',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0
      }
    },
    {
      id: 'PROD-002',
      name: 'Hardware Components',
      sku: 'HW-COMP-001',
      description: 'High-performance hardware components',
      category: 'Hardware',
      unit_price: 150.00,
      currency: 'USD',
      stock_quantity: 200,
      reorder_point: 25,
      variants: [
        {
          id: 'VAR-002',
          product_id: 'PROD-002',
          attributes: { 'Size': 'Standard', 'Color': 'Black' },
          sku: 'HW-COMP-001-STD-BLK',
          unit_price: 150.00,
          stock_quantity: 200,
          location: 'Zone B-02'
        }
      ],
      images: ['/images/hardware.jpg'],
      is_active: true,
      supplier_id: 'SUP-002',
      supplier_name: 'Hardware Supply Co.',
      location: 'Zone B-02',
      dimensions: {
        length: 10,
        width: 5,
        height: 2,
        weight: 0.5
      }
    }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'PO-001',
      number: 'PO-2024-001',
      supplier_id: 'SUP-001',
      supplier_name: 'Tech Solutions Inc.',
      supplier_email: 'procurement@techsolutions.com',
      status: 'confirmed',
      total_amount: 5000.00,
      currency: 'USD',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: 'item-1',
          product_id: 'PROD-001',
          product_name: 'CRM Software License',
          sku: 'CRM-LIC-001',
          quantity: 100,
          unit_price: 50.00,
          total_price: 5000.00,
          received_quantity: 0
        }
      ],
      notes: 'Bulk order for enterprise customers',
      payment_terms: 'Net 30'
    }
  ]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: 'WH-001',
      name: 'Main Warehouse',
      address: '123 Industrial Blvd, Business City, BC 12345',
      contact_person: 'John Manager',
      contact_email: 'warehouse@company.com',
      contact_phone: '+1-555-0123',
      capacity: 10000,
      used_capacity: 3500,
      zones: [
        {
          id: 'ZONE-001',
          name: 'Zone A - Software',
          warehouse_id: 'WH-001',
          capacity: 2000,
          used_capacity: 800,
          is_active: true
        },
        {
          id: 'ZONE-002',
          name: 'Zone B - Hardware',
          warehouse_id: 'WH-001',
          capacity: 3000,
          used_capacity: 1200,
          is_active: true
        }
      ],
      is_active: true
    }
  ]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: 'SUP-001',
      name: 'Tech Solutions Inc.',
      email: 'procurement@techsolutions.com',
      phone: '+1-555-0100',
      address: '456 Tech Street, Tech City, TC 12345',
      contact_person: 'Sarah Procurement',
      payment_terms: 'Net 30',
      rating: 4.8,
      total_orders: 25,
      total_spent: 125000.00,
      is_active: true
    },
    {
      id: 'SUP-002',
      name: 'Hardware Supply Co.',
      email: 'orders@hardwaresupply.com',
      phone: '+1-555-0200',
      address: '789 Hardware Ave, Supply City, SC 12345',
      contact_person: 'Mike Supply',
      payment_terms: 'Net 45',
      rating: 4.5,
      total_orders: 15,
      total_spent: 75000.00,
      is_active: true
    }
  ]);

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([
    {
      id: 'MOV-001',
      type: 'in',
      product_id: 'PROD-001',
      product_name: 'CRM Software License',
      sku: 'CRM-LIC-001',
      quantity: 100,
      to_location: 'Zone A-01',
      reference_id: 'PO-001',
      reference_type: 'purchase_order',
      notes: 'Received from purchase order',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      created_by: 'John Manager'
    },
    {
      id: 'MOV-002',
      type: 'out',
      product_id: 'PROD-001',
      product_name: 'CRM Software License',
      sku: 'CRM-LIC-001',
      quantity: 50,
      from_location: 'Zone A-01',
      reference_id: 'SO-001',
      reference_type: 'sales_order',
      notes: 'Shipped to customer',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      created_by: 'Sarah Sales'
    }
  ]);

  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([
    {
      id: 'ALERT-001',
      product_id: 'PROD-002',
      product_name: 'Hardware Components',
      sku: 'HW-COMP-001',
      current_stock: 8,
      reorder_point: 25,
      alert_type: 'low_stock',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      is_resolved: false
    }
  ]);

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleCreateProduct = () => {
    const newProduct: Product = {
      id: `PROD-${Date.now()}`,
      name: 'New Product',
      sku: `SKU-${Date.now()}`,
      description: 'Product description',
      category: 'General',
      unit_price: 0,
      currency: 'USD',
      stock_quantity: 0,
      reorder_point: 10,
      variants: [],
      images: [],
      is_active: true,
      location: 'Zone A-01',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0
      }
    };

    setProducts(prev => [...prev, newProduct]);
    showToast({
      title: 'Product Created',
      description: 'New product added to inventory',
      type: 'success'
    });
  };

  const handleCreatePurchaseOrder = () => {
    const newPurchaseOrder: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      number: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier_id: 'SUP-001',
      supplier_name: 'New Supplier',
      supplier_email: 'supplier@example.com',
      status: 'draft',
      total_amount: 0,
      currency: 'USD',
      created_at: new Date(),
      expected_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      items: [],
      payment_terms: 'Net 30'
    };

    setPurchaseOrders(prev => [...prev, newPurchaseOrder]);
    showToast({
      title: 'Purchase Order Created',
      description: 'New purchase order draft created',
      type: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'info';
      case 'confirmed': return 'success';
      case 'received': return 'success';
      case 'cancelled': return 'secondary';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'danger';
      case 'overstock': return 'warning';
      case 'in': return 'success';
      case 'out': return 'danger';
      case 'transfer': return 'info';
      case 'adjustment': return 'warning';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return Package;
      case 'out': return Truck;
      case 'transfer': return RefreshCw;
      case 'adjustment': return Settings;
      default: return Package;
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Warehouse className="w-5 h-5 text-[#a259ff]" />
              <span>Unified Warehouse & Inventory System</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Manage inventory, products, purchases, and warehouse operations
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
        <div className="flex border-b border-[#23233a]/30 overflow-x-auto">
          {[
            { id: 'inventory', name: 'Inventory', icon: Package },
            { id: 'products', name: 'Products', icon: Tag },
            { id: 'purchases', name: 'Purchase Orders', icon: ShoppingCart },
            { id: 'warehouses', name: 'Warehouses', icon: Warehouse },
            { id: 'suppliers', name: 'Suppliers', icon: Users },
            { id: 'movements', name: 'Movements', icon: Truck },
            { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
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
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Inventory Overview</h4>
                <div className="flex space-x-2">
                  <Badge variant="success" size="sm">
                    {products.filter(p => p.stock_quantity > p.reorder_point).length} In Stock
                  </Badge>
                  <Badge variant="warning" size="sm">
                    {products.filter(p => p.stock_quantity <= p.reorder_point && p.stock_quantity > 0).length} Low Stock
                  </Badge>
                  <Badge variant="danger" size="sm">
                    {products.filter(p => p.stock_quantity === 0).length} Out of Stock
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-white">{product.name}</h5>
                        <p className="text-sm text-[#b0b0d0]">SKU: {product.sku}</p>
                        <p className="text-xs text-[#b0b0d0] capitalize">{product.category}</p>
                      </div>
                      <Badge 
                        variant={
                          product.stock_quantity === 0 ? 'danger' : 
                          product.stock_quantity <= product.reorder_point ? 'warning' : 'success'
                        } 
                        size="sm"
                      >
                        {product.stock_quantity} in stock
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Price:</span>
                        <span className="text-white">{formatCurrency(product.unit_price, product.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Location:</span>
                        <span className="text-white">{product.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Reorder Point:</span>
                        <span className="text-white">{product.reorder_point}</span>
                      </div>
                      {product.supplier_name && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[#b0b0d0]">Supplier:</span>
                          <span className="text-white">{product.supplier_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        Movement
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Products</h4>
                <Button variant="gradient" size="sm" icon={Plus} onClick={handleCreateProduct}>
                  Add Product
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-white">{product.name}</h5>
                        <p className="text-sm text-[#b0b0d0]">SKU: {product.sku}</p>
                        <p className="text-xs text-[#b0b0d0] capitalize">{product.category}</p>
                      </div>
                      <Badge variant={product.is_active ? 'success' : 'secondary'} size="sm">
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Price:</span>
                        <span className="text-white">{formatCurrency(product.unit_price, product.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Stock:</span>
                        <span className="text-white">{product.stock_quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Variants:</span>
                        <span className="text-white">{product.variants.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#b0b0d0]">Location:</span>
                        <span className="text-white">{product.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        Variants
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Purchase Orders</h4>
                <Button variant="gradient" size="sm" icon={Plus} onClick={handleCreatePurchaseOrder}>
                  Create PO
                </Button>
              </div>
              
              <div className="space-y-4">
                {purchaseOrders.map(po => (
                  <Card key={po.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{po.number}</h5>
                        <p className="text-sm text-[#b0b0d0]">{po.supplier_name}</p>
                        <p className="text-sm text-[#b0b0d0]">{po.supplier_email}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(po.status) as any} size="sm">
                          {po.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(po.total_amount, po.currency)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            Expected: {po.expected_delivery.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Items:</span>
                        <div className="text-white">{po.items.length}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Payment Terms:</span>
                        <div className="text-white">{po.payment_terms}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Created:</span>
                        <div className="text-white">{po.created_at.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Currency:</span>
                        <div className="text-white">{po.currency}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm" icon={Download}>
                        PDF
                      </Button>
                      {po.status === 'draft' && (
                        <Button variant="gradient" size="sm" icon={Send}>
                          Send
                        </Button>
                      )}
                      {po.status === 'confirmed' && (
                        <Button variant="success" size="sm" icon={CheckCircle}>
                          Receive
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'warehouses' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Warehouses</h4>
              
              <div className="space-y-4">
                {warehouses.map(warehouse => (
                  <Card key={warehouse.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{warehouse.name}</h5>
                        <p className="text-sm text-[#b0b0d0]">{warehouse.address}</p>
                        <p className="text-sm text-[#b0b0d0]">Contact: {warehouse.contact_person}</p>
                        <p className="text-sm text-[#b0b0d0]">{warehouse.contact_email}</p>
                      </div>
                      <Badge variant={warehouse.is_active ? 'success' : 'secondary'} size="sm">
                        {warehouse.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Capacity:</span>
                        <div className="text-white">{warehouse.used_capacity} / {warehouse.capacity}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Usage:</span>
                        <div className="text-white">{Math.round((warehouse.used_capacity / warehouse.capacity) * 100)}%</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Zones:</span>
                        <div className="text-white">{warehouse.zones.length}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Phone:</span>
                        <div className="text-white">{warehouse.contact_phone}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View Details
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        Zones
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Suppliers</h4>
              
              <div className="space-y-4">
                {suppliers.map(supplier => (
                  <Card key={supplier.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{supplier.name}</h5>
                        <p className="text-sm text-[#b0b0d0]">{supplier.contact_person}</p>
                        <p className="text-sm text-[#b0b0d0]">{supplier.email}</p>
                        <p className="text-sm text-[#b0b0d0]">{supplier.address}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={supplier.is_active ? 'success' : 'secondary'} size="sm">
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {formatCurrency(supplier.total_spent)}
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            Rating: {supplier.rating}/5
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Phone:</span>
                        <div className="text-white">{supplier.phone}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Payment Terms:</span>
                        <div className="text-white">{supplier.payment_terms}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Total Orders:</span>
                        <div className="text-white">{supplier.total_orders}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Rating:</span>
                        <div className="text-white">{supplier.rating}/5</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View Details
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        Orders
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Inventory Movements</h4>
              
              <div className="space-y-4">
                {inventoryMovements.map(movement => {
                  const MovementIcon = getMovementIcon(movement.type);
                  return (
                    <Card key={movement.id} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                            <MovementIcon className="w-5 h-5 text-[#a259ff]" />
                          </div>
                          <div>
                            <h5 className="font-medium text-white">{movement.product_name}</h5>
                            <p className="text-sm text-[#b0b0d0]">SKU: {movement.sku}</p>
                            <p className="text-xs text-[#b0b0d0] capitalize">{movement.type} movement</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {movement.quantity} units
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            {movement.created_at.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-[#b0b0d0]">Type:</span>
                          <div className="text-white capitalize">{movement.type}</div>
                        </div>
                        <div>
                          <span className="text-[#b0b0d0]">From:</span>
                          <div className="text-white">{movement.from_location || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-[#b0b0d0]">To:</span>
                          <div className="text-white">{movement.to_location || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-[#b0b0d0]">By:</span>
                          <div className="text-white">{movement.created_by}</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" icon={Eye}>
                          View Details
                        </Button>
                        <Button variant="secondary" size="sm" icon={Download}>
                          Report
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Stock Alerts</h4>
              
              <div className="space-y-4">
                {stockAlerts.map(alert => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white">{alert.product_name}</h5>
                        <p className="text-sm text-[#b0b0d0]">SKU: {alert.sku}</p>
                        <p className="text-xs text-[#b0b0d0] capitalize">{alert.alert_type.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(alert.alert_type) as any} size="sm">
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {alert.current_stock} units
                          </div>
                          <div className="text-xs text-[#b0b0d0]">
                            Reorder: {alert.reorder_point}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-[#b0b0d0]">Current Stock:</span>
                        <div className="text-white">{alert.current_stock}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Reorder Point:</span>
                        <div className="text-white">{alert.reorder_point}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Created:</span>
                        <div className="text-white">{alert.created_at.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0]">Status:</span>
                        <div className="text-white">{alert.is_resolved ? 'Resolved' : 'Active'}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={Eye}>
                        View Product
                      </Button>
                      {!alert.is_resolved && (
                        <Button variant="success" size="sm" icon={ShoppingCart}>
                          Create PO
                        </Button>
                      )}
                      <Button variant="secondary" size="sm">
                        Mark Resolved
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Warehouse Analytics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#a259ff]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Total Products</p>
                      <p className="text-xl font-semibold text-white">{products.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#377dff]/20 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-[#377dff]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Active POs</p>
                      <p className="text-xl font-semibold text-white">{purchaseOrders.filter(po => po.status === 'confirmed').length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#43e7ad]/20 rounded-lg flex items-center justify-center">
                      <Warehouse className="w-5 h-5 text-[#43e7ad]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Warehouses</p>
                      <p className="text-xl font-semibold text-white">{warehouses.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#ff6b6b]/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-[#ff6b6b]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#b0b0d0]">Active Alerts</p>
                      <p className="text-xl font-semibold text-white">{stockAlerts.filter(alert => !alert.is_resolved).length}</p>
                    </div>
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

export default UnifiedWarehouseSystem; 