import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Download,
  Eye,
  Send,
  RefreshCw,
  Weight,
  Ruler
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
import { useSalesOrders, useDHLIntegration } from '../hooks/useSalesOrders';

const ShippingManagement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { salesOrders, loading } = useSalesOrders();
  const { createShipment, trackShipment, loading: dhlLoading } = useDHLIntegration();
  
  const [order, setOrder] = useState<any>(null);
  const [shippingData, setShippingData] = useState({
    carrier: 'dhl',
    service_type: 'STANDARD',
    weight_kg: 1.0,
    length_cm: 30,
    width_cm: 20,
    height_cm: 15,
    package_type: 'box',
    signature_required: false,
    insurance_value_cents: 0,
    special_instructions: ''
  });
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const foundOrder = salesOrders.find(o => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        if (foundOrder.shipping_info) {
          setShippingData(prev => ({
            ...prev,
            ...foundOrder.shipping_info
          }));
        }
      }
    }
  }, [id, salesOrders]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getShippingStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'label_created': return <Package className="w-4 h-4" />;
      case 'picked_up': return <Truck className="w-4 h-4" />;
      case 'in_transit': return <MapPin className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'exception': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getShippingStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'label_created': return 'blue';
      case 'picked_up': return 'purple';
      case 'in_transit': return 'orange';
      case 'delivered': return 'green';
      case 'exception': return 'red';
      default: return 'gray';
    }
  };

  const handleCreateShipment = async () => {
    if (!order) return;

    try {
      const shipmentInfo = await createShipment(order, shippingData);
      if (shipmentInfo) {
        setOrder(prev => ({
          ...prev,
          shipping_info: shipmentInfo
        }));
        alert('Shipping label created successfully!');
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert('Failed to create shipping label');
    }
  };

  const handleTrackShipment = async () => {
    if (!order?.shipping_info?.tracking_number) return;

    try {
      const tracking = await trackShipment(order.shipping_info.tracking_number);
      if (tracking) {
        setTrackingInfo(tracking);
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      alert('Failed to track shipment');
    }
  };

  if (loading) {
    return (
      <BrandBackground>
        <BrandPageLayout
          title="Shipping Management"
          subtitle="Loading order details..."
        >
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  if (!order) {
    return (
      <BrandBackground>
        <BrandPageLayout
          title="Shipping Management"
          subtitle="Order not found"
          actions={
            <BrandButton variant="secondary" onClick={() => navigate('/sales-orders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </BrandButton>
          }
        >
          <BrandCard borderGradient="warning" className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Order Not Found</h3>
            <p className="text-[#b0b0d0]">The requested sales order could not be found.</p>
          </BrandCard>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Shipping Management"
        subtitle={`Managing shipping for order ${order.order_number}`}
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/sales-orders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </BrandButton>
            
            {order.shipping_info?.label_url && (
              <BrandButton variant="secondary" onClick={() => window.open(order.shipping_info.label_url, '_blank')}>
                <Download className="w-4 h-4 mr-2" />
                Download Label
              </BrandButton>
            )}
            
            {order.shipping_info?.tracking_number && (
              <BrandButton variant="secondary" onClick={handleTrackShipment}>
                <Eye className="w-4 h-4 mr-2" />
                Track Package
              </BrandButton>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Shipping Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <BrandCard borderGradient="primary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-400" />
                Order Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Order Number</label>
                  <p className="text-white font-medium">{order.order_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Customer</label>
                  <p className="text-white font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Order Date</label>
                  <p className="text-white">{formatDate(order.order_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Order Value</label>
                  <p className="text-white font-medium">{formatCurrency(order.total_cents)}</p>
                </div>
              </div>
            </BrandCard>

            {/* Shipping Configuration */}
            <BrandCard borderGradient="blue" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-400" />
                Shipping Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Carrier</label>
                  <BrandDropdown
                    options={[
                      { value: 'dhl', label: 'DHL Express' },
                      { value: 'fedex', label: 'FedEx' },
                      { value: 'ups', label: 'UPS' },
                      { value: 'usps', label: 'USPS' },
                      { value: 'custom', label: 'Custom Carrier' }
                    ]}
                    value={shippingData.carrier}
                    onChange={(carrier) => setShippingData(prev => ({ ...prev, carrier }))}
                    placeholder="Select carrier"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Service Type</label>
                  <BrandDropdown
                    options={[
                      { value: 'STANDARD', label: 'Standard Delivery' },
                      { value: 'EXPRESS', label: 'Express Delivery' },
                      { value: 'OVERNIGHT', label: 'Overnight' },
                      { value: 'ECONOMY', label: 'Economy' }
                    ]}
                    value={shippingData.service_type}
                    onChange={(service_type) => setShippingData(prev => ({ ...prev, service_type }))}
                    placeholder="Select service"
                  />
                </div>
              </div>

              {/* Package Dimensions */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-white mb-3 flex items-center">
                  <Ruler className="w-4 h-4 mr-2 text-purple-400" />
                  Package Dimensions
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <BrandInput
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    value={shippingData.weight_kg}
                    onChange={(e) => setShippingData(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) || 0 }))}
                    placeholder="1.0"
                  />
                  
                  <BrandInput
                    label="Length (cm)"
                    type="number"
                    value={shippingData.length_cm}
                    onChange={(e) => setShippingData(prev => ({ ...prev, length_cm: parseInt(e.target.value) || 0 }))}
                    placeholder="30"
                  />
                  
                  <BrandInput
                    label="Width (cm)"
                    type="number"
                    value={shippingData.width_cm}
                    onChange={(e) => setShippingData(prev => ({ ...prev, width_cm: parseInt(e.target.value) || 0 }))}
                    placeholder="20"
                  />
                  
                  <BrandInput
                    label="Height (cm)"
                    type="number"
                    value={shippingData.height_cm}
                    onChange={(e) => setShippingData(prev => ({ ...prev, height_cm: parseInt(e.target.value) || 0 }))}
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Special Instructions</label>
                <textarea
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={shippingData.special_instructions}
                  onChange={(e) => setShippingData(prev => ({ ...prev, special_instructions: e.target.value }))}
                  placeholder="Any special delivery instructions..."
                />
              </div>

              {!order.shipping_info?.tracking_number && (
                <div className="mt-6">
                  <BrandButton 
                    variant="primary" 
                    onClick={handleCreateShipment}
                    disabled={dhlLoading}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {dhlLoading ? 'Creating Shipment...' : 'Create Shipping Label'}
                  </BrandButton>
                </div>
              )}
            </BrandCard>

            {/* DHL Integration Status */}
            {order.shipping_info && (
              <BrandCard borderGradient="success" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-green-400" />
                  DHL Integration Status
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Tracking Number</label>
                    <p className="text-white font-mono">{order.shipping_info.tracking_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Status</label>
                    <BrandBadge
                      color={getShippingStatusColor(order.shipping_info.status)}
                      icon={getShippingStatusIcon(order.shipping_info.status)}
                    >
                      {order.shipping_info.status.replace('_', ' ').toUpperCase()}
                    </BrandBadge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Ship Date</label>
                    <p className="text-white">{formatDate(order.shipping_info.ship_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Est. Delivery</label>
                    <p className="text-white">{formatDate(order.shipping_info.estimated_delivery_date)}</p>
                  </div>
                </div>
              </BrandCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <BrandCard borderGradient="purple" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                Shipping Address
              </h3>
              
              <div className="text-[#b0b0d0] space-y-1">
                <p className="text-white font-medium">{order.customer_name}</p>
                <p>{order.shipping_address || order.billing_address}</p>
                <p>{order.customer_email}</p>
                {order.customer_phone && <p>{order.customer_phone}</p>}
              </div>
            </BrandCard>

            {/* Tracking Information */}
            {trackingInfo && (
              <BrandCard borderGradient="orange" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-orange-400" />
                  Tracking Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Current Status</label>
                    <p className="text-white">{trackingInfo.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Location</label>
                    <p className="text-white">{trackingInfo.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Est. Delivery</label>
                    <p className="text-white">{trackingInfo.estimatedDelivery}</p>
                  </div>
                </div>

                {trackingInfo.events && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Tracking Events</h4>
                    <div className="space-y-2">
                      {trackingInfo.events.map((event, index) => (
                        <div key={index} className="text-xs border-l-2 border-orange-400 pl-3">
                          <p className="text-white">{event.status}</p>
                          <p className="text-[#b0b0d0]">{event.date} {event.time}</p>
                          <p className="text-[#b0b0d0]">{event.location}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </BrandCard>
            )}
          </div>
        </div>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default ShippingManagement;
