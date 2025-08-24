import React, { useState } from 'react';
import {
  Warehouse,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Brain,
  Globe,
  Zap,
  Settings,
  Plus,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  Clock,
  CheckCircle,
  Target,
  Layers,
  RefreshCw
} from 'lucide-react';
import {
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard
} from '../../contexts/BrandDesignContext';

// Import all the new warehouse components
import OrderManagement from './OrderManagement';
import AIStockForecasting from './AIStockForecasting';
import MultichannelManagement from './MultichannelManagement';
import {
  useWarehouses,
  useStockAlerts,
  usePurchaseOrders,
  useSalesOrders,
  useMultichannelListings,
  useStockForecasts
} from '../../hooks/useEnhancedInventory';

interface EnhancedWarehouseManagerProps {
  orgId?: string;
  selectedProduct?: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
  onBackToProducts?: () => void;
}

interface DashboardStatsProps {
  orgId: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ orgId }) => {
  const { data: warehouses = [] } = useWarehouses(orgId);
  const { data: alerts = [] } = useStockAlerts(orgId, { status: 'active' });
  const { data: purchaseOrders = [] } = usePurchaseOrders(orgId);
  const { data: salesOrders = [] } = useSalesOrders(orgId);
  const { data: listings = [] } = useMultichannelListings(orgId);
  const { data: forecasts = [] } = useStockForecasts(orgId);

  // Calculate key metrics
  const stats = {
    // Inventory stats
    totalWarehouses: warehouses.length,
    activeAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.alert_level === 'critical').length,
    
    // Order stats
    pendingPOs: purchaseOrders.filter(po => po.status === 'sent' || po.status === 'confirmed').length,
    pendingSOs: salesOrders.filter(so => so.status === 'pending' || so.status === 'confirmed').length,
    
    // Multichannel stats
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    
    // AI stats
    totalForecasts: forecasts.length,
    highConfidenceForecasts: forecasts.filter(f => (f.confidence_score || 0) >= 0.8).length,
    
    // Financial stats
    totalPOValue: purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0),
    totalSOValue: salesOrders.reduce((sum, so) => sum + so.total_amount, 0)
  };

  return (
    <BrandStatsGrid className="mb-8">
      <BrandStatCard
        title="Active Warehouses"
        value={stats.totalWarehouses}
        icon={<Warehouse className="w-8 h-8" />}
        color="primary"
        subtitle={`${stats.activeAlerts} alerts`}
      />
      <BrandStatCard
        title="Pending Orders"
        value={stats.pendingPOs + stats.pendingSOs}
        icon={<ShoppingCart className="w-8 h-8" />}
        color="orange"
        subtitle={`${stats.pendingPOs} PO • ${stats.pendingSOs} SO`}
      />
      <BrandStatCard
        title="Channel Listings"
        value={stats.activeListings}
        icon={<Globe className="w-8 h-8" />}
        color="green"
        subtitle={`${stats.totalListings} total listings`}
      />
      <BrandStatCard
        title="AI Forecasts"
        value={stats.highConfidenceForecasts}
        icon={<Brain className="w-8 h-8" />}
        color="blue"
        subtitle={`${stats.totalForecasts} total forecasts`}
      />
      <BrandStatCard
        title="Purchase Value"
        value={`$${stats.totalPOValue.toLocaleString()}`}
        icon={<DollarSign className="w-8 h-8" />}
        color="purple"
        subtitle="This month"
      />
      <BrandStatCard
        title="Sales Revenue"
        value={`$${stats.totalSOValue.toLocaleString()}`}
        icon={<TrendingUp className="w-8 h-8" />}
        color="green"
        subtitle="This month"
      />
    </BrandStatsGrid>
  );
};

const QuickActions: React.FC<{ onActionClick: (action: string) => void }> = ({ onActionClick }) => {
  const actions = [
    {
      id: 'create_po',
      title: 'Create Purchase Order',
      description: 'Add new purchase order',
      icon: ShoppingCart,
      color: 'primary' as const,
      action: () => onActionClick('create_po')
    },
    {
      id: 'create_so',
      title: 'Create Sales Order',
      description: 'Process new sales order',
      icon: Package,
      color: 'green' as const,
      action: () => onActionClick('create_so')
    },
    {
      id: 'ai_forecast',
      title: 'Generate AI Forecast',
      description: 'Create demand predictions',
      icon: Brain,
      color: 'blue' as const,
      action: () => onActionClick('ai_forecast')
    },
    {
      id: 'multichannel',
      title: 'Create Listing',
      description: 'List on sales channels',
      icon: Globe,
      color: 'purple' as const,
      action: () => onActionClick('multichannel')
    },
    {
      id: 'stock_alert',
      title: 'Stock Alerts',
      description: 'Check inventory alerts',
      icon: AlertTriangle,
      color: 'orange' as const,
      action: () => onActionClick('stock_alert')
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Performance insights',
      icon: BarChart3,
      color: 'secondary' as const,
      action: () => onActionClick('analytics')
    }
  ];

  return (
    <BrandCard borderGradient="primary" className="p-6 mb-8">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className="p-4 bg-white/5 rounded-lg border-2 border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 group"
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-gradient-to-r ${
                action.color === 'primary' ? 'from-[#a259ff] to-[#377dff]' :
                action.color === 'green' ? 'from-[#6bcf7f] to-[#4d9de0]' :
                action.color === 'blue' ? 'from-[#4d9de0] to-[#a259ff]' :
                action.color === 'purple' ? 'from-[#a259ff] to-[#ff6b6b]' :
                action.color === 'orange' ? 'from-[#ff8e53] to-[#ffd93d]' :
                'from-[#ff6b6b] to-[#ffd93d]'
              }`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-sm font-medium text-white mb-1 group-hover:text-[#a259ff] transition-colors">
                {action.title}
              </h4>
              <p className="text-xs text-[#b0b0d0]">{action.description}</p>
            </button>
          );
        })}
      </div>
    </BrandCard>
  );
};

const RecentActivity: React.FC<{ orgId: string }> = ({ orgId }) => {
  // Mock recent activity data - in real app, this would come from API
  const activities = [
    {
      id: 1,
      type: 'purchase_order',
      title: 'Purchase Order PO-2024-001 created',
      description: 'Order for 100 units of Laptop Stand Pro',
      timestamp: '2024-01-15T10:30:00Z',
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      id: 2,
      type: 'stock_alert',
      title: 'Low stock alert triggered',
      description: 'Wireless Mouse inventory below threshold',
      timestamp: '2024-01-15T10:25:00Z',
      icon: AlertTriangle,
      color: 'orange'
    },
    {
      id: 3,
      type: 'sales_order',
      title: 'Sales Order SO-2024-055 shipped',
      description: 'Order for Gaming Keyboard delivered',
      timestamp: '2024-01-15T10:20:00Z',
      icon: Truck,
      color: 'green'
    },
    {
      id: 4,
      type: 'forecast',
      title: 'AI forecast generated',
      description: 'Demand predictions updated for 15 products',
      timestamp: '2024-01-15T10:15:00Z',
      icon: Brain,
      color: 'purple'
    },
    {
      id: 5,
      type: 'multichannel',
      title: 'Amazon listing synchronized',
      description: 'Inventory levels updated across channels',
      timestamp: '2024-01-15T10:10:00Z',
      icon: Globe,
      color: 'blue'
    }
  ];

  return (
    <BrandCard borderGradient="secondary" className="p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div key={activity.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activity.color === 'blue' ? 'bg-blue-500/20' :
                activity.color === 'orange' ? 'bg-orange-500/20' :
                activity.color === 'green' ? 'bg-green-500/20' :
                activity.color === 'purple' ? 'bg-purple-500/20' :
                'bg-gray-500/20'
              }`}>
                <IconComponent className={`w-5 h-5 ${
                  activity.color === 'blue' ? 'text-blue-400' :
                  activity.color === 'orange' ? 'text-orange-400' :
                  activity.color === 'green' ? 'text-green-400' :
                  activity.color === 'purple' ? 'text-purple-400' :
                  'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                <p className="text-xs text-[#b0b0d0]">{activity.description}</p>
                <p className="text-xs text-[#8a8a8a]">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </BrandCard>
  );
};

const EnhancedWarehouseManager: React.FC<EnhancedWarehouseManagerProps> = ({ 
  orgId = 'default-org-id',
  selectedProduct,
  onBackToProducts
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'ai-forecasting' | 'multichannel' | 'inventory' | 'analytics'>('dashboard');

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_po':
      case 'create_so':
        setActiveTab('orders');
        break;
      case 'ai_forecast':
        setActiveTab('ai-forecasting');
        break;
      case 'multichannel':
        setActiveTab('multichannel');
        break;
      case 'stock_alert':
      case 'analytics':
        setActiveTab('analytics');
        break;
      default:
        break;
    }
  };

  const tabs = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview & quick actions'
    },
    {
      key: 'orders',
      label: 'Order Management',
      icon: ShoppingCart,
      description: 'Purchase & sales orders'
    },
    {
      key: 'ai-forecasting',
      label: 'AI Forecasting',
      icon: Brain,
      description: 'Demand prediction & analytics'
    },
    {
      key: 'multichannel',
      label: 'Multichannel',
      icon: Globe,
      description: 'Sales channel management'
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: Package,
      description: 'Stock management'
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: Target,
      description: 'Performance insights'
    }
  ];

  return (
    <BrandPageLayout
      title="Warehouse Management Hub"
      subtitle="World-class inventory, order, and multichannel management system"
      actions={
        <div className="flex space-x-3">
          {onBackToProducts && (
            <BrandButton variant="secondary" onClick={onBackToProducts}>
              <Package className="w-4 h-4 mr-2" />
              Back to Products
            </BrandButton>
          )}
          <BrandButton variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </BrandButton>
          <BrandButton variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </BrandButton>
          <BrandButton variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </BrandButton>
        </div>
      }
    >
      {/* Enhanced Navigation Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 border-b border-white/20">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'text-[#a259ff] border-b-2 border-[#a259ff] bg-[#a259ff]/10'
                    : 'text-[#b0b0d0] hover:text-white hover:bg-white/5'
                } rounded-t-lg`}
              >
                <IconComponent className="w-4 h-4" />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-xs opacity-70">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <>
            {/* Dashboard Stats */}
            <DashboardStats orgId={orgId} />

            {/* Quick Actions */}
            <QuickActions onActionClick={handleQuickAction} />

            {/* Recent Activity & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity orgId={orgId} />
              
              {/* System Health */}
              <BrandCard borderGradient="accent" className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  System Health
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white">Inventory Sync</span>
                    </div>
                    <BrandBadge variant="success" size="sm">Healthy</BrandBadge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white">Order Processing</span>
                    </div>
                    <BrandBadge variant="success" size="sm">Healthy</BrandBadge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-white">Channel Sync</span>
                    </div>
                    <BrandBadge variant="warning" size="sm">Syncing</BrandBadge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white">AI Forecasting</span>
                    </div>
                    <BrandBadge variant="success" size="sm">Active</BrandBadge>
                  </div>
                </div>
              </BrandCard>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <OrderManagement orgId={orgId} />
        )}

        {activeTab === 'ai-forecasting' && (
          <AIStockForecasting orgId={orgId} />
        )}

        {activeTab === 'multichannel' && (
          <MultichannelManagement orgId={orgId} />
        )}

        {activeTab === 'inventory' && (
          <BrandCard borderGradient="primary" className="p-6">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Inventory Management</h3>
              <p className="text-[#b0b0d0] mb-6">
                Advanced inventory tracking and management features coming soon
              </p>
              <BrandButton variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Coming Soon
              </BrandButton>
            </div>
          </BrandCard>
        )}

        {activeTab === 'analytics' && (
          <BrandCard borderGradient="primary" className="p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Advanced Analytics</h3>
              <p className="text-[#b0b0d0] mb-6">
                Comprehensive warehouse analytics and reporting dashboard
              </p>
              <BrandButton variant="primary">
                <Target className="w-4 h-4 mr-2" />
                Coming Soon
              </BrandButton>
            </div>
          </BrandCard>
        )}
      </div>
    </BrandPageLayout>
  );
};

export default EnhancedWarehouseManager;
