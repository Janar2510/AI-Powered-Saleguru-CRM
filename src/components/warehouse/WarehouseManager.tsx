import React, { useState } from 'react';
import { 
  Warehouse, 
  MapPin, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  BarChart3,
  ShoppingCart,
  Truck,
  ClipboardList,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Search,
  Filter,
  X,
  Save,
  Check
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
  useWarehouses, 
  useLocations, 
  useStock, 
  useStockMoves, 
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useReceivePurchaseOrder,
  useAdjustStock,
  useProductStockSummary,
  useLowStockProducts,
  type Warehouse as WarehouseType,
  type Location,
  type StockItem,
  type StockMove,
  type PurchaseOrder
} from '../../hooks/useInventory';

interface WarehouseManagerProps {
  orgId?: string;
  selectedProduct?: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
}

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adjustment: {
    product_id: string;
    location_id: string;
    new_qty: number;
    unit_cost?: number;
    reason: string;
  }) => void;
  stockItem?: StockItem;
  locations: Location[];
}

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (po: any) => void;
  purchaseOrder?: PurchaseOrder;
  products: any[];
  locations: Location[];
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  stockItem,
  locations
}) => {
  const [formData, setFormData] = useState({
    product_id: stockItem?.product_id || '',
    location_id: stockItem?.location_id || '',
    current_qty: stockItem?.qty || 0,
    new_qty: stockItem?.qty || 0,
    unit_cost: stockItem?.cost_per_unit || 0,
    reason: 'adjustment'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      product_id: formData.product_id,
      location_id: formData.location_id,
      new_qty: formData.new_qty,
      unit_cost: formData.unit_cost,
      reason: formData.reason
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard borderGradient="purple" className="w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Stock Adjustment</h2>
          <button onClick={onClose} className="text-[#b0b0d0] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Location
              </label>
              <select
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                required
              >
                <option value="">Select location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.warehouse?.name} - {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Reason
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              >
                <option value="adjustment">General Adjustment</option>
                <option value="damage">Damaged Inventory</option>
                <option value="loss">Lost/Stolen</option>
                <option value="return">Customer Return</option>
                <option value="recount">Physical Recount</option>
                <option value="initial_stock">Initial Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Current Quantity
              </label>
              <input
                type="number"
                value={formData.current_qty}
                readOnly
                className="w-full px-3 py-2 bg-[#23233a]/30 border-2 border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                New Quantity
              </label>
              <input
                type="number"
                value={formData.new_qty}
                onChange={(e) => setFormData({ ...formData, new_qty: parseFloat(e.target.value) || 0 })}
                step="0.001"
                min="0"
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Unit Cost
              </label>
              <input
                type="number"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Difference
              </label>
              <div className={`px-3 py-2 rounded-lg text-center font-medium ${
                formData.new_qty - formData.current_qty > 0 
                  ? 'bg-green-400/20 text-green-400' 
                  : formData.new_qty - formData.current_qty < 0
                  ? 'bg-red-400/20 text-red-400'
                  : 'bg-gray-400/20 text-gray-400'
              }`}>
                {formData.new_qty - formData.current_qty > 0 && '+'}
                {formData.new_qty - formData.current_qty}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <BrandButton variant="secondary" onClick={onClose}>
              Cancel
            </BrandButton>
            <BrandButton variant="purple">
              <Save className="w-4 h-4 mr-2" />
              Save Adjustment
            </BrandButton>
          </div>
        </form>
      </BrandCard>
    </div>
  );
};

const WarehouseManager: React.FC<WarehouseManagerProps> = ({ 
  orgId = 'default-org-id',
  selectedProduct 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'movements' | 'purchase-orders' | 'locations'>('overview');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses(orgId);
  const { data: locations = [], isLoading: locationsLoading } = useLocations(undefined, orgId);
  const { data: stock = [], isLoading: stockLoading } = useStock(orgId);
  const { data: stockMoves = [], isLoading: movesLoading } = useStockMoves(selectedProduct?.id, orgId);
  const { data: purchaseOrders = [], isLoading: poLoading } = usePurchaseOrders(orgId);
  const { data: stockSummary = [] } = useProductStockSummary(orgId);
  const { data: lowStockProducts = [] } = useLowStockProducts(orgId);

  // Mutations
  const adjustStockMutation = useAdjustStock(orgId);
  const createPOMutation = useCreatePurchaseOrder(orgId);
  const receivePOMutation = useReceivePurchaseOrder(orgId);

  const handleStockAdjustment = async (adjustment: any) => {
    try {
      await adjustStockMutation.mutateAsync(adjustment);
      setShowAdjustmentModal(false);
      setSelectedStockItem(undefined);
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getStockStatus = (available: number, reserved: number) => {
    if (available === 0) {
      return { status: 'out-of-stock', color: 'text-red-400', bg: 'bg-red-400/20' };
    } else if (available <= 10) {
      return { status: 'low-stock', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    } else {
      return { status: 'in-stock', color: 'text-green-400', bg: 'bg-green-400/20' };
    }
  };

  // Filter stock based on search
  const filteredStock = stock.filter(item => 
    !searchTerm || 
    item.location?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.warehouse?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <BrandPageLayout
      title="Warehouse Management"
      subtitle={selectedProduct ? `Managing stock for ${selectedProduct.name}` : 'Manage inventory across all locations'}
      actions={
        <div className="flex space-x-3">
          <BrandButton
            variant="secondary"
            onClick={() => setShowAdjustmentModal(true)}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Stock Adjustment
          </BrandButton>
          <BrandButton variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Purchase Order
          </BrandButton>
        </div>
      }
    >

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-[#23233a]/30">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'stock', label: 'Stock Levels', icon: Package },
          { key: 'movements', label: 'Stock Movements', icon: ArrowUpDown },
          { key: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
          { key: 'locations', label: 'Locations', icon: MapPin }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === tab.key
                ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                : 'text-[#b0b0d0] hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <BrandStatsGrid>
            <BrandStatCard
              title="Total Locations"
              value={locations.length}
              icon={<MapPin className="w-8 h-8" />}

            />
            <BrandStatCard
              title="Products in Stock"
              value={stockSummary.length}
              icon={<Package className="w-8 h-8" />}

            />
            <BrandStatCard
              title="Low Stock Alerts"
              value={lowStockProducts.length}
              icon={<AlertTriangle className="w-8 h-8" />}

            />
            <BrandStatCard
              title="Total Inventory Value"
              value={formatCurrency(stockSummary.reduce((sum, item) => sum + (item.total_value || 0), 0))}
              icon={<DollarSign className="w-8 h-8" />}

            />
          </BrandStatsGrid>

          {/* Low Stock Alerts */}
          {lowStockProducts.length > 0 && (
            <BrandCard borderGradient="orange" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-[#f59e0b] mr-2" />
                Low Stock Alerts
              </h3>
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Product ID: {product.product_id}</div>
                      <div className="text-sm text-[#b0b0d0]">
                        Available: {product.total_available} | On Hand: {product.total_on_hand}
                      </div>
                    </div>
                    <BrandButton variant="secondary">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Reorder
                    </BrandButton>
                  </div>
                ))}
              </div>
            </BrandCard>
          )}

          {/* Recent Stock Movements */}
          <BrandCard borderGradient="secondary" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ArrowUpDown className="w-5 h-5 mr-2" />
              Recent Stock Movements
            </h3>
            <div className="space-y-3">
              {stockMoves.slice(0, 5).map((move) => (
                <div key={move.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      move.qty > 0 ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="font-medium text-white">
                        {move.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-sm text-[#b0b0d0]">
                        Qty: {move.qty > 0 ? '+' : ''}{move.qty} • {new Date(move.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <BrandBadge 
                    variant={move.qty > 0 ? 'green' : 'red'}
                  >
                    {move.qty > 0 ? 'IN' : 'OUT'}
                  </BrandBadge>
                </div>
              ))}
            </div>
          </BrandCard>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />
            </div>
            <BrandButton variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </BrandButton>
          </div>

          {/* Stock Items */}
          <div className="space-y-3">
            {filteredStock.map((item) => {
              const status = getStockStatus(item.available_qty, item.reserved_qty);
              return (
                <BrandCard key={item.id} borderGradient="primary" className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${status.bg}`} />
                      <div>
                        <div className="font-medium text-white">
                          {item.location?.warehouse?.name} - {item.location?.name}
                        </div>
                        <div className="text-sm text-[#b0b0d0]">
                          Location: {item.location?.code} • Product ID: {item.product_id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-white font-medium">On Hand: {item.qty}</div>
                        <div className="text-sm text-[#b0b0d0]">Reserved: {item.reserved_qty}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${status.color}`}>Available: {item.available_qty}</div>
                        <div className="text-sm text-[#b0b0d0]">
                          Cost: {item.cost_per_unit ? formatCurrency(item.cost_per_unit) : 'N/A'}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <BrandButton
                          variant="secondary"
                          onClick={() => {
                            setSelectedStockItem(item);
                            setShowAdjustmentModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Adjust
                        </BrandButton>
                        <BrandButton variant="secondary">
                          <Eye className="w-4 h-4 mr-2" />
                          History
                        </BrandButton>
                      </div>
                    </div>
                  </div>
                </BrandCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => {
          setShowAdjustmentModal(false);
          setSelectedStockItem(undefined);
        }}
        onSave={handleStockAdjustment}
        stockItem={selectedStockItem}
        locations={locations}
      />
    </BrandPageLayout>
  );
};

export default WarehouseManager;
