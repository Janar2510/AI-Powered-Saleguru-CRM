import React, { useState } from 'react';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  DollarSign,
  BarChart3,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Plane,
  Ship,
  Navigation,
  Zap,
  Users,
  Globe,
  X,
  Save,
  Phone,
  Mail,
  Home,
  Building
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

interface ShippingManagementProps {
  orgId: string;
}

interface Shipment {
  id: string;
  shipment_number: string;
  sales_order_id: string;
  sales_order_number: string;
  customer_name: string;
  customer_address: string;
  carrier: string;
  service: string;
  tracking_number: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned';
  ship_date: string;
  estimated_delivery_date: string;
  actual_delivery_date?: string;
  shipping_cost: number;
  weight_kg: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  package_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: ShipmentItem[];
}

interface ShipmentItem {
  id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Carrier {
  id: string;
  name: string;
  code: string;
  logo: string;
  services: CarrierService[];
  api_connected: boolean;
  default_service: string;
}

interface CarrierService {
  id: string;
  name: string;
  code: string;
  delivery_time: string;
  cost_base: number;
  cost_per_kg: number;
  max_weight: number;
  tracking_available: boolean;
  insurance_available: boolean;
}

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shipment: Partial<Shipment>) => void;
}

interface CarrierSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (carrier: Partial<Carrier>) => void;
  carrier?: Carrier;
}

const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    sales_order_number: '',
    customer_name: '',
    customer_address: '',
    customer_city: '',
    customer_postal_code: '',
    customer_country: '',
    customer_phone: '',
    customer_email: '',
    carrier: 'fedex',
    service: 'ground',
    package_count: 1,
    weight_kg: 1,
    length: 30,
    width: 20,
    height: 15,
    insurance_value: 0,
    signature_required: false,
    saturday_delivery: false,
    notes: ''
  });

  const carriers = [
    { code: 'fedex', name: 'FedEx', services: ['ground', 'express', 'overnight'] },
    { code: 'ups', name: 'UPS', services: ['ground', 'next_day', '2_day'] },
    { code: 'dhl', name: 'DHL', services: ['express', 'standard'] },
    { code: 'usps', name: 'USPS', services: ['priority', 'express', 'ground'] }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const shipment = {
      shipment_number: `SHP-${Date.now()}`,
      sales_order_number: formData.sales_order_number,
      customer_name: formData.customer_name,
      customer_address: `${formData.customer_address}, ${formData.customer_city}, ${formData.customer_postal_code}, ${formData.customer_country}`,
      carrier: formData.carrier,
      service: formData.service,
      status: 'pending' as const,
      ship_date: new Date().toISOString().split('T')[0],
      estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      package_count: formData.package_count,
      weight_kg: formData.weight_kg,
      dimensions: {
        length: formData.length,
        width: formData.width,
        height: formData.height,
        unit: 'cm'
      },
      notes: formData.notes,
      tracking_number: `TRK${Date.now()}`,
      shipping_cost: 15.99 // Mock calculation
    };

    onSave(shipment);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard borderGradient="primary" className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Create Shipment
            </h2>
            <button onClick={onClose} className="text-[#b0b0d0] hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Information */}
            <BrandCard borderGradient="secondary" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Order Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Sales Order Number *
                  </label>
                  <BrandInput
                    value={formData.sales_order_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, sales_order_number: e.target.value }))}
                    placeholder="SO-2024-001"
                    required
                  />
                </div>
              </div>
            </BrandCard>

            {/* Customer Information */}
            <BrandCard borderGradient="accent" className="p-4">
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
                    Phone
                  </label>
                  <BrandInput
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
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
                    Address *
                  </label>
                  <BrandInput
                    value={formData.customer_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    City *
                  </label>
                  <BrandInput
                    value={formData.customer_city}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Postal Code *
                  </label>
                  <BrandInput
                    value={formData.customer_postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_postal_code: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.customer_country}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_country: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>
              </div>
            </BrandCard>

            {/* Shipping Details */}
            <BrandCard borderGradient="purple" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Shipping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Carrier *
                  </label>
                  <select
                    value={formData.carrier}
                    onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    required
                  >
                    {carriers.map(carrier => (
                      <option key={carrier.code} value={carrier.code}>{carrier.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Service *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    required
                  >
                    {carriers.find(c => c.code === formData.carrier)?.services.map(service => (
                      <option key={service} value={service}>
                        {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </BrandCard>

            {/* Package Details */}
            <BrandCard borderGradient="orange" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Package Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Package Count *
                  </label>
                  <BrandInput
                    type="number"
                    value={formData.package_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, package_count: parseInt(e.target.value) || 1 }))}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Weight (kg) *
                  </label>
                  <BrandInput
                    type="number"
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) || 0 }))}
                    min="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Length (cm)
                  </label>
                  <BrandInput
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData(prev => ({ ...prev, length: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Width (cm)
                  </label>
                  <BrandInput
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Height (cm)
                  </label>
                  <BrandInput
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.signature_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, signature_required: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Signature Required</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.saturday_delivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, saturday_delivery: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Saturday Delivery</span>
                </label>
              </div>
            </BrandCard>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <BrandButton variant="secondary" onClick={onClose}>
                Cancel
              </BrandButton>
              <BrandButton variant="primary" type="submit">
                <Save className="w-4 h-4 mr-2" />
                Create Shipment
              </BrandButton>
            </div>
          </form>
        </div>
      </BrandCard>
    </div>
  );
};

const ShippingManagement: React.FC<ShippingManagementProps> = ({ orgId }) => {
  const [activeTab, setActiveTab] = useState<'shipments' | 'carriers' | 'tracking' | 'analytics'>('shipments');
  const [showCreateShipment, setShowCreateShipment] = useState(false);
  const [showCarrierSettings, setShowCarrierSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');

  // Mock data - in real app, this would come from API
  const mockShipments: Shipment[] = [
    {
      id: '1',
      shipment_number: 'SHP-2024-001',
      sales_order_id: 'so-1',
      sales_order_number: 'SO-2024-001',
      customer_name: 'John Doe',
      customer_address: '123 Main St, New York, NY 10001, US',
      carrier: 'fedex',
      service: 'ground',
      tracking_number: 'TRK123456789',
      status: 'in_transit',
      ship_date: '2024-01-15',
      estimated_delivery_date: '2024-01-18',
      shipping_cost: 15.99,
      weight_kg: 2.5,
      dimensions: { length: 30, width: 20, height: 15, unit: 'cm' },
      package_count: 1,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      items: [
        { id: '1', product_name: 'Laptop Stand Pro', product_sku: 'LSP-001', quantity: 1, unit_price: 99.99, total_price: 99.99 }
      ]
    },
    {
      id: '2',
      shipment_number: 'SHP-2024-002',
      sales_order_id: 'so-2',
      sales_order_number: 'SO-2024-002',
      customer_name: 'Jane Smith',
      customer_address: '456 Oak Ave, Los Angeles, CA 90210, US',
      carrier: 'ups',
      service: 'next_day',
      tracking_number: 'TRK987654321',
      status: 'delivered',
      ship_date: '2024-01-14',
      estimated_delivery_date: '2024-01-15',
      actual_delivery_date: '2024-01-15',
      shipping_cost: 25.99,
      weight_kg: 1.2,
      dimensions: { length: 25, width: 15, height: 10, unit: 'cm' },
      package_count: 1,
      created_at: '2024-01-14T10:00:00Z',
      updated_at: '2024-01-15T14:30:00Z',
      items: [
        { id: '2', product_name: 'Wireless Mouse', product_sku: 'WM-001', quantity: 2, unit_price: 29.99, total_price: 59.98 }
      ]
    }
  ];

  const mockCarriers: Carrier[] = [
    {
      id: '1',
      name: 'FedEx',
      code: 'fedex',
      logo: '📦',
      api_connected: true,
      default_service: 'ground',
      services: [
        { id: '1', name: 'Ground', code: 'ground', delivery_time: '1-3 business days', cost_base: 10, cost_per_kg: 2, max_weight: 70, tracking_available: true, insurance_available: true },
        { id: '2', name: 'Express', code: 'express', delivery_time: '1-2 business days', cost_base: 20, cost_per_kg: 5, max_weight: 50, tracking_available: true, insurance_available: true }
      ]
    },
    {
      id: '2',
      name: 'UPS',
      code: 'ups',
      logo: '🚚',
      api_connected: true,
      default_service: 'ground',
      services: [
        { id: '3', name: 'Ground', code: 'ground', delivery_time: '1-5 business days', cost_base: 8, cost_per_kg: 1.5, max_weight: 70, tracking_available: true, insurance_available: true },
        { id: '4', name: 'Next Day', code: 'next_day', delivery_time: '1 business day', cost_base: 30, cost_per_kg: 8, max_weight: 50, tracking_available: true, insurance_available: true }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'picked_up': return 'info';
      case 'in_transit': return 'warning';
      case 'out_for_delivery': return 'info';
      case 'delivered': return 'success';
      case 'exception': return 'error';
      case 'returned': return 'error';
      default: return 'secondary';
    }
  };

  const getCarrierIcon = (carrier: string) => {
    switch (carrier) {
      case 'fedex': return '📦';
      case 'ups': return '🚚';
      case 'dhl': return '✈️';
      case 'usps': return '📮';
      default: return '📫';
    }
  };

  const handleCreateShipment = (shipment: Partial<Shipment>) => {
    // In real app, this would save to backend
    console.log('Creating shipment:', shipment);
    setShowCreateShipment(false);
  };

  const filteredShipments = mockShipments.filter(shipment =>
    (shipment.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     shipment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || shipment.status === statusFilter) &&
    (carrierFilter === '' || shipment.carrier === carrierFilter)
  );

  // Calculate stats
  const stats = {
    totalShipments: mockShipments.length,
    pendingShipments: mockShipments.filter(s => s.status === 'pending').length,
    inTransit: mockShipments.filter(s => s.status === 'in_transit').length,
    delivered: mockShipments.filter(s => s.status === 'delivered').length,
    totalCost: mockShipments.reduce((sum, s) => sum + s.shipping_cost, 0),
    avgDeliveryTime: 2.5, // Mock calculation
    onTimeDelivery: 95 // Mock percentage
  };

  return (
    <BrandPageLayout
      title="Shipping Management"
      subtitle="Advanced shipping and logistics management system"
      actions={
        <div className="flex space-x-3">
          <BrandButton variant="secondary" onClick={() => setShowCarrierSettings(true)}>
            <Truck className="w-4 h-4 mr-2" />
            Carrier Settings
          </BrandButton>
          <BrandButton variant="primary" onClick={() => setShowCreateShipment(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Shipment
          </BrandButton>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-white/20 mb-6">
        {[
          { key: 'shipments', label: 'Shipments', icon: Package },
          { key: 'carriers', label: 'Carriers', icon: Truck },
          { key: 'tracking', label: 'Tracking', icon: Navigation },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-6 py-3 font-medium transition-colors flex items-center ${
              activeTab === key
                ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                : 'text-[#b0b0d0] hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <BrandStatsGrid className="mb-6">
        <BrandStatCard
          title="Total Shipments"
          value={stats.totalShipments}
          icon={<Package className="w-8 h-8" />}
          color="primary"
        />
        <BrandStatCard
          title="In Transit"
          value={stats.inTransit}
          icon={<Truck className="w-8 h-8" />}
          color="orange"
        />
        <BrandStatCard
          title="Delivered"
          value={stats.delivered}
          icon={<CheckCircle className="w-8 h-8" />}
          color="green"
        />
        <BrandStatCard
          title="Shipping Costs"
          value={`$${stats.totalCost.toFixed(2)}`}
          icon={<DollarSign className="w-8 h-8" />}
          color="blue"
        />
        <BrandStatCard
          title="Avg Delivery Time"
          value={`${stats.avgDeliveryTime} days`}
          icon={<Clock className="w-8 h-8" />}
          color="purple"
        />
        <BrandStatCard
          title="On-Time Delivery"
          value={`${stats.onTimeDelivery}%`}
          icon={<TrendingUp className="w-8 h-8" />}
          color="green"
        />
      </BrandStatsGrid>

      {/* Content based on active tab */}
      {activeTab === 'shipments' && (
        <div className="space-y-6">
          {/* Filters */}
          <BrandCard borderGradient="primary" className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
                  <BrandInput
                    placeholder="Search shipments..."
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
                  <option value="pending">Pending</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="exception">Exception</option>
                  <option value="returned">Returned</option>
                </select>
                <select
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                  className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                >
                  <option value="">All Carriers</option>
                  <option value="fedex">FedEx</option>
                  <option value="ups">UPS</option>
                  <option value="dhl">DHL</option>
                  <option value="usps">USPS</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <BrandButton variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </BrandButton>
                <BrandButton variant="secondary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </BrandButton>
              </div>
            </div>
          </BrandCard>

          {/* Shipments List */}
          <div className="space-y-4">
            {filteredShipments.length > 0 ? (
              filteredShipments.map((shipment) => (
                <BrandCard key={shipment.id} borderGradient="secondary" className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#a259ff]/20 rounded-lg flex items-center justify-center text-2xl">
                        {getCarrierIcon(shipment.carrier)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{shipment.shipment_number}</h3>
                          <BrandBadge variant={getStatusColor(shipment.status)} size="sm">
                            {shipment.status.replace('_', ' ').toUpperCase()}
                          </BrandBadge>
                          <BrandBadge variant="info" size="sm">
                            {shipment.carrier.toUpperCase()}
                          </BrandBadge>
                        </div>
                        <p className="text-[#b0b0d0]">
                          Customer: {shipment.customer_name} • Order: {shipment.sales_order_number}
                        </p>
                        <p className="text-[#b0b0d0] text-sm">
                          Tracking: {shipment.tracking_number} • 
                          Ship Date: {new Date(shipment.ship_date).toLocaleDateString()} • 
                          Est. Delivery: {new Date(shipment.estimated_delivery_date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-sm">
                          <span className="text-[#b0b0d0]">
                            Weight: {shipment.weight_kg}kg
                          </span>
                          <span className="text-[#b0b0d0]">
                            Packages: {shipment.package_count}
                          </span>
                          <span className="text-[#b0b0d0]">
                            Cost: ${shipment.shipping_cost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <BrandButton variant="secondary">
                        <Navigation className="w-4 h-4 mr-2" />
                        Track
                      </BrandButton>
                      <BrandButton variant="secondary">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </BrandButton>
                      <BrandButton variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Label
                      </BrandButton>
                      <BrandButton variant="secondary">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Carrier
                      </BrandButton>
                    </div>
                  </div>
                </BrandCard>
              ))
            ) : (
              <BrandCard borderGradient="accent" className="text-center py-12">
                <Package className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Shipments Found</h3>
                <p className="text-[#b0b0d0] mb-6">
                  {searchTerm || statusFilter || carrierFilter ? 
                    'Try adjusting your search criteria' : 
                    'Create your first shipment to get started'}
                </p>
                <BrandButton variant="primary" onClick={() => setShowCreateShipment(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Shipment
                </BrandButton>
              </BrandCard>
            )}
          </div>
        </div>
      )}

      {activeTab === 'carriers' && (
        <div className="space-y-4">
          {mockCarriers.map((carrier) => (
            <BrandCard key={carrier.id} borderGradient="green" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-2xl">
                    {carrier.logo}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{carrier.name}</h3>
                      <BrandBadge variant={carrier.api_connected ? 'success' : 'error'} size="sm">
                        {carrier.api_connected ? 'Connected' : 'Disconnected'}
                      </BrandBadge>
                    </div>
                    <p className="text-[#b0b0d0]">
                      {carrier.services.length} services available • 
                      Default: {carrier.default_service}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      {carrier.services.slice(0, 3).map((service) => (
                        <BrandBadge key={service.id} variant="secondary" size="sm">
                          {service.name}
                        </BrandBadge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <BrandButton variant="secondary">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </BrandButton>
                  <BrandButton variant="green">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test Connection
                  </BrandButton>
                </div>
              </div>
            </BrandCard>
          ))}
        </div>
      )}

      {/* Other tabs content would go here */}

      {/* Modals */}
      <CreateShipmentModal
        isOpen={showCreateShipment}
        onClose={() => setShowCreateShipment(false)}
        onSave={handleCreateShipment}
      />
    </BrandPageLayout>
  );
};

export default ShippingManagement;


