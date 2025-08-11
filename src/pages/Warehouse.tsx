import React, { useState, useEffect } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spline from '@splinetool/react-spline';
import { 
  Package, 
  Truck, 
  Box, 
  Warehouse as WarehouseIcon, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  Calendar,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  Settings,
  Bell,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  PieChart,
  LineChart,
  BarChart,
  Bot,
  Sparkles,
  AlertTriangle,
  Minus,
  Plus as PlusIcon,
  Minus as MinusIcon,
  RotateCcw,
  Move,
  PackageCheck,
  PackageX
} from 'lucide-react';
import { warehouseService } from '../services/warehouseService';
import { useToastContext } from '../contexts/ToastContext';

// Quick Action Button Component
const QuickActionButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  gradient: string;
}> = ({ icon: Icon, label, onClick, gradient }) => (
  <button
    onClick={onClick}
    className={`${gradient} p-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center space-y-3 min-h-[120px]`}
  >
    <Icon className="w-8 h-8" />
    <span>{label}</span>
  </button>
);

const Warehouse: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'movements' | 'analytics' | 'settings'>('overview');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const { showToast } = useToastContext();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, stockData, movementsData] = await Promise.all([
        warehouseService.getProducts(),
        warehouseService.getStock(),
        warehouseService.getMovements()
      ]);
      setProducts(productsData);
      setStock(stockData);
      setMovements(movementsData);
    } catch (error) {
      console.error('Error loading warehouse data:', error);
      showToast({ title: 'Error loading data', type: 'error' });
    }
  };

  const quickActions = [
    { 
      icon: Package, 
      label: 'Add Product', 
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800',
      action: async () => {
        try {
          const newProduct = await warehouseService.createProduct({
            name: 'New Product',
            sku: `SKU${Date.now()}`,
            description: 'Product description',
            category: 'general',
            unit_price: 0,
            cost_price: 0
          });
          setProducts(prev => [newProduct, ...prev]);
          showToast({ title: 'Product added successfully', type: 'success' });
        } catch (error) {
          console.error('Error adding product:', error);
          showToast({ title: 'Error adding product', type: 'error' });
        }
      }
    },
    { 
      icon: Truck, 
      label: 'Receive Stock', 
      gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800',
      action: async () => {
        try {
          if (products.length > 0 && stock.length > 0) {
            await warehouseService.receiveStock(
              products[0].id,
              stock[0].location_id,
              10,
              `RECEIVE${Date.now()}`,
              'Manual stock receipt'
            );
            await loadData(); // Reload data
            showToast({ title: 'Stock received successfully', type: 'success' });
          } else {
            showToast({ title: 'No products or locations available', type: 'error' });
          }
        } catch (error) {
          console.error('Error receiving stock:', error);
          showToast({ title: 'Error receiving stock', type: 'error' });
        }
      }
    },
    { 
      icon: Box, 
      label: 'Ship Order', 
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-800',
      action: async () => {
        try {
          if (products.length > 0) {
            // Get the first product and try to ship from any location
            const product = products[0];
            const locations = await warehouseService.getLocations();
            
            if (locations.length > 0) {
              await warehouseService.shipStock(
                product.id,
                locations[0].id,
                1,
                `SHIP${Date.now()}`,
                'Manual shipment'
              );
              await loadData(); // Reload data
              showToast({ title: 'Order shipped successfully', type: 'success' });
            } else {
              showToast({ title: 'No locations available', type: 'error' });
            }
          } else {
            showToast({ title: 'No products available', type: 'error' });
          }
        } catch (error) {
          console.error('Error shipping order:', error);
          showToast({ title: 'Error shipping order', type: 'error' });
        }
      }
    },
    { 
      icon: WarehouseIcon, 
      label: 'AI Analytics', 
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700',
      action: () => setActiveTab('analytics')
    },
  ];

  // Mock inventory data
  const mockInventory = [
    { id: '1', name: 'Laptop Pro', sku: 'LP-001', quantity: 25, location: 'A1-B2', status: 'in-stock', category: 'Electronics', minStock: 5, supplier: 'TechCorp' },
    { id: '2', name: 'Wireless Mouse', sku: 'WM-002', quantity: 150, location: 'C3-D4', status: 'in-stock', category: 'Accessories', minStock: 20, supplier: 'AccessCorp' },
    { id: '3', name: 'USB Cable', sku: 'UC-003', quantity: 5, location: 'E5-F6', status: 'low-stock', category: 'Cables', minStock: 10, supplier: 'CableCorp' },
    { id: '4', name: 'Monitor 24"', sku: 'MN-004', quantity: 0, location: 'G7-H8', status: 'out-of-stock', category: 'Electronics', minStock: 3, supplier: 'DisplayCorp' },
    { id: '5', name: 'Keyboard', sku: 'KB-005', quantity: 12, location: 'I9-J10', status: 'in-stock', category: 'Accessories', minStock: 8, supplier: 'InputCorp' },
  ];

  const filteredInventory = mockInventory.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (item.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for:`, selectedItems);
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    // Mock AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAiLoading(false);
  };

  const handleStockMovement = (itemId: string, type: 'in' | 'out', quantity: number) => {
    console.log(`${type === 'in' ? 'Receiving' : 'Shipping'} ${quantity} units of item ${itemId}`);
  };

  return (
    <Container>
      <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
        {/* Spline Background */}
        <div className="fixed inset-0 z-0">
          <Spline
            scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
            className="w-full h-full"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Warehouse Management</h1>
                  <p className="text-[#b0b0d0] mt-1 text-sm lg:text-base">Track inventory and manage stock movements</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="secondary" onClick={() => setActiveTab('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="secondary" onClick={() => setActiveTab('analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="gradient" onClick={() => setActiveTab('overview')}>
                  <Activity className="w-4 h-4 mr-2" />
                  Overview
                </Button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <QuickActionButton
                        key={index}
                        icon={action.icon}
                        label={action.label}
                        onClick={action.action}
                        gradient={action.gradient}
                      />
                    ))}
                  </div>
                </div>

                {/* Warehouse Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Total Products</p>
                          <p className="text-2xl font-bold text-white">1,247</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">In Stock</p>
                          <p className="text-2xl font-bold text-white">1,180</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Low Stock</p>
                          <p className="text-2xl font-bold text-white">45</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#b0b0d0]">Out of Stock</p>
                          <p className="text-2xl font-bold text-white">22</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <PackageX className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Inventory List with Filters */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#a259ff]" />
                      Inventory Management
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                        <Eye className="w-4 h-4 mr-2" />
                        {viewMode === 'grid' ? 'List' : 'Grid'}
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div className="mb-6 p-4 bg-[#23233a]/60 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Category</label>
                          <select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full p-2 bg-[#23233a] border border-[#23233a] rounded-lg text-white"
                          >
                            <option value="all">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Cables">Cables</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Status</label>
                          <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full p-2 bg-[#23233a] border border-[#23233a] rounded-lg text-white"
                          >
                            <option value="all">All Status</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Search</label>
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 bg-[#23233a] border border-[#23233a] rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bulk Actions */}
                  {selectedItems.length > 0 && (
                    <div className="mb-4 p-3 bg-[#a259ff]/20 border border-[#a259ff]/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">
                          {selectedItems.length} item(s) selected
                        </span>
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('export')}>
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('move')}>
                            <Move className="w-4 h-4 mr-1" />
                            Move
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('delete')}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {filteredInventory.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-[#23233a]/60 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, item.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== item.id));
                              }
                            }}
                            className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]"
                          />
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.status === 'in-stock' ? 'bg-green-500' :
                            item.status === 'low-stock' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-sm text-[#b0b0d0]">SKU: {item.sku} • {item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-white">{item.quantity} units</p>
                            <p className="text-sm text-[#b0b0d0] flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {item.location}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.status === 'in-stock' ? 'bg-green-500 text-black' :
                            item.status === 'low-stock' ? 'bg-yellow-500 text-black' :
                            'bg-red-500 text-white'
                          }`}>
                            {item.status}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button variant="secondary" size="sm" onClick={() => handleStockMovement(item.id, 'in', 10)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleStockMovement(item.id, 'out', 5)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* AI Analysis Header */}
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Bot className="w-5 h-5 text-[#a259ff]" />
                      AI-Powered Warehouse Analytics
                    </h3>
                    <Button 
                      variant="gradient" 
                      onClick={handleAIAnalysis}
                      disabled={aiLoading}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {aiLoading ? 'Analyzing...' : 'Generate AI Report'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'Stock Levels', icon: BarChart, gradient: 'from-green-500 to-emerald-600' },
                      { name: 'Movement Trends', icon: LineChart, gradient: 'from-blue-500 to-cyan-600' },
                      { name: 'Category Analysis', icon: PieChart, gradient: 'from-purple-500 to-indigo-600' },
                      { name: 'Supplier Performance', icon: TrendingUp, gradient: 'from-orange-500 to-red-600' },
                      { name: 'Low Stock Alerts', icon: AlertTriangle, gradient: 'from-red-500 to-pink-600' },
                      { name: 'Efficiency Metrics', icon: Activity, gradient: 'from-teal-500 to-green-600' },
                    ].map((report, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50 hover:border-[#a259ff]/30 group">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className={`w-10 h-10 bg-gradient-to-br ${report.gradient} rounded-lg flex items-center justify-center mr-3`}>
                              <report.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{report.name}</h3>
                              <p className="text-sm text-[#b0b0d0]">AI-generated insights</p>
                            </div>
                          </div>
                          <Button 
                            variant="gradient" 
                            className="w-full group-hover:scale-105 transition-transform"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#a259ff]" />
                    Warehouse Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-semibold text-white mb-4">General Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Warehouse Name</label>
                          <input type="text" className="w-full p-3 bg-[#23233a] border border-[#23233a] rounded-lg text-white" defaultValue="Main Warehouse" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Location</label>
                          <input type="text" className="w-full p-3 bg-[#23233a] border border-[#23233a] rounded-lg text-white" defaultValue="123 Business St, Tech City" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Low Stock Threshold (%)</label>
                          <input type="number" className="w-full p-3 bg-[#23233a] border border-[#23233a] rounded-lg text-white" defaultValue="20" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-semibold text-white mb-4">Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">Low Stock Alerts</p>
                            <p className="text-sm text-[#b0b0d0]">Get notified when stock is low</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">Movement Notifications</p>
                            <p className="text-sm text-[#b0b0d0]">Notify on stock movements</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">Out of Stock Alerts</p>
                            <p className="text-sm text-[#b0b0d0]">Alert when items are out of stock</p>
                          </div>
                          <input type="checkbox" className="rounded border-[#23233a] bg-[#23233a] text-[#a259ff] focus:ring-[#a259ff]" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Warehouse; 