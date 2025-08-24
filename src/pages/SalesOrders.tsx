import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Eye, 
  Truck, 
  Copy, 
  Trash2,
  FileText,
  Package,
  Clock,
  CheckCircle, 
  AlertCircle,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandStatCard
} from '../contexts/BrandDesignContext';
import { BrandDropdown } from '../components/ui/BrandDropdown';
import { QuickActionsBar } from '../components/accounting/QuickActionsBar';
import { useSalesOrders, SalesOrder } from '../hooks/useSalesOrders';

const SalesOrders: React.FC = () => {
  const navigate = useNavigate();
  const { salesOrders, loading, error, deleteSalesOrder } = useSalesOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'blue';
      case 'processing': return 'purple';
      case 'shipped': return 'orange';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Sales Orders"
        subtitle="Manage customer orders and fulfillment"
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </BrandButton>
            
            <BrandButton variant="primary" onClick={() => navigate('/sales-orders/create')}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </BrandButton>
          </div>
        }
      >
        <QuickActionsBar currentPage="/sales-orders" />

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <BrandStatCard
            title="Total Orders"
            value="2"
            icon={<FileText className="w-8 h-8 text-blue-400" />}
            borderGradient="primary"
          />
          
          <BrandStatCard
            title="Pending Orders"
            value="1"
            icon={<Clock className="w-8 h-8 text-yellow-400" />}
            borderGradient="yellow"
          />
          
          <BrandStatCard
            title="Shipped Orders"
            value="1"
            icon={<Truck className="w-8 h-8 text-green-400" />}
            borderGradient="success"
          />
          
          <BrandStatCard
            title="Total Value"
            value="€2,350.00"
            icon={<Package className="w-8 h-8 text-purple-400" />}
            borderGradient="purple"
          />
      </div>

        {/* Coming Soon Message */}
        <BrandCard borderGradient="primary" className="p-8 text-center">
          <Package className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Sales Orders System</h3>
          <p className="text-[#b0b0d0] mb-4">
            Complete sales order management with shipping integration coming soon.
          </p>
          <BrandButton variant="primary" onClick={() => navigate('/sales-orders/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Sales Order
          </BrandButton>
        </BrandCard>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default SalesOrders; 