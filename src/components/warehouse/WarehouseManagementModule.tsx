import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Truck, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Hash,
  Tag,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { usePermissions } from '../../contexts/PermissionContext';
import { supabase } from '../../services/supabase';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

interface WarehouseProduct {
  id: string;
  name: string;
  sku: string;
  product_code?: string;
  supplier?: string;
  supplier_code?: string;
  serial_number?: string;
  barcode?: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  unit_price: number;
  cost_price: number;
  purchase_price?: number;
  sale_price?: number;
  wholesale_price?: number;
  retail_price?: number;
  profit_margin?: number;
  tax_rate?: number;
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  volume_l?: number;
  area_m2?: number;
  pieces_per_unit?: number;
  minimum_order_quantity?: number;
  reorder_point?: number;
  lead_time_days?: number;
  shelf_life_days?: number;
  is_active?: boolean;
  is_tracked?: boolean;
  specifications?: any;
  tags?: string[];
  created_at: string;
}

interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  type: 'storage' | 'shipping' | 'receiving' | 'production';
  capacity: number;
  current_usage: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
}

interface WarehouseStock {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  last_updated: string;
  product_name?: string;
  location_name?: string;
}

interface WarehouseMovement {
  id: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  product_id: string;
  from_location_id?: string;
  to_location_id?: string;
  quantity: number;
  reference: string;
  notes?: string;
  created_at: string;
  product_name?: string;
  from_location_name?: string;
  to_location_name?: string;
}

const WarehouseManagementModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [stock, setStock] = useState<WarehouseStock[]>([]);
  const [movements, setMovements] = useState<WarehouseMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showStockMovement, setShowStockMovement] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list'>('cards');
  const [selectedProduct, setSelectedProduct] = useState<WarehouseProduct | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'product' | 'location'; item: any } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToastContext();
  const { canDelete, canEdit, canCreate } = usePermissions();

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    product_code: '',
    supplier: '',
    supplier_code: '',
    serial_number: '',
    description: '',
    category: 'general',
    subcategory: '',
    brand: '',
    model: '',
    unit_price: 0,
    purchase_price: 0,
    sale_price: 0,
    wholesale_price: 0,
    retail_price: 0,
    cost_price: 0,
    profit_margin: 0,
    tax_rate: 20,
    weight_kg: 0,
    length_cm: 0,
    width_cm: 0,
    height_cm: 0,
    volume_l: 0,
    area_m2: 0,
    pieces_per_unit: 1,
    minimum_order_quantity: 1,
    reorder_point: 10,
    lead_time_days: 7,
    shelf_life_days: 365,
    barcode: '',
    specifications: {},
    tags: []
  });

  const [newLocation, setNewLocation] = useState({
    name: '',
    code: '',
    type: 'storage' as const,
    capacity: 0
  });

  const [newMovement, setNewMovement] = useState({
    type: 'in' as const,
    product_id: '',
    from_location_id: '',
    to_location_id: '',
    quantity: 0,
    reference: '',
    notes: ''
  });

  useEffect(() => {
    loadWarehouseData();
  }, []);

  const loadWarehouseData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading warehouse data...');
      
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('warehouse_products')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Products data:', productsData);
      console.log('Products error:', productsError);

      if (productsData) {
        setProducts(productsData);
      }

      // Load locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('warehouse_locations')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Locations data:', locationsData);
      console.log('Locations error:', locationsError);

      if (locationsData) {
        setLocations(locationsData);
      }

      // Load stock with product and location names
      const { data: stockData, error: stockError } = await supabase
        .from('warehouse_stock')
        .select(`
          *,
          warehouse_products(name),
          warehouse_locations(name)
        `)
        .order('last_updated', { ascending: false });

      console.log('Stock data:', stockData);
      console.log('Stock error:', stockError);

      if (stockData) {
        const formattedStock = stockData.map(item => ({
          ...item,
          product_name: item.warehouse_products?.name,
          location_name: item.warehouse_locations?.name
        }));
        setStock(formattedStock);
      }

      // Load movements
      const { data: movementsData, error: movementsError } = await supabase
        .from('warehouse_movements')
        .select(`
          *,
          warehouse_products(name),
          from_location:warehouse_locations!from_location_id(name),
          to_location:warehouse_locations!to_location_id(name)
        `)
        .order('created_at', { ascending: false });

      console.log('Movements data:', movementsData);
      console.log('Movements error:', movementsError);

      if (movementsData) {
        const formattedMovements = movementsData.map(item => ({
          ...item,
          product_name: item.warehouse_products?.name,
          from_location_name: item.from_location?.name,
          to_location_name: item.to_location?.name
        }));
        setMovements(formattedMovements);
      }
    } catch (error) {
      console.error('Error loading warehouse data:', error);
      showToast({ title: 'Error loading warehouse data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_products')
        .insert([{
          ...newProduct,
          specifications: JSON.stringify(newProduct.specifications),
          tags: newProduct.tags
        }])
        .select();

      if (error) throw error;

      showToast({ title: 'Product added successfully!', type: 'success' });
      setShowAddProduct(false);
      setNewProduct({
        name: '', sku: '', product_code: '', supplier: '', supplier_code: '',
        serial_number: '', description: '', category: 'general', subcategory: '',
        brand: '', model: '', unit_price: 0, purchase_price: 0, sale_price: 0,
        wholesale_price: 0, retail_price: 0, cost_price: 0, profit_margin: 0,
        tax_rate: 20, weight_kg: 0, length_cm: 0, width_cm: 0, height_cm: 0,
        volume_l: 0, area_m2: 0, pieces_per_unit: 1, minimum_order_quantity: 1,
        reorder_point: 10, lead_time_days: 7, shelf_life_days: 365, barcode: '',
        specifications: {}, tags: []
      });
      // Refresh products list
      const { data: refreshedProducts } = await supabase
        .from('warehouse_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (refreshedProducts) {
        setProducts(refreshedProducts);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showToast({ title: 'Error adding product', type: 'error' });
    }
  };

  const updateProduct = async () => {
    if (!selectedProduct) {
      showToast({ title: 'No product selected', type: 'error' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('warehouse_products')
        .update({
          ...newProduct,
          specifications: JSON.stringify(newProduct.specifications),
          tags: newProduct.tags
        })
        .eq('id', selectedProduct.id)
        .select();

      if (error) throw error;

      showToast({ title: 'Product updated successfully!', type: 'success' });
      setShowEditModal(false);
      setSelectedProduct(null);
      
      // Refresh products list
      const { data: refreshedProducts } = await supabase
        .from('warehouse_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (refreshedProducts) {
        setProducts(refreshedProducts);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showToast({ title: 'Error updating product', type: 'error' });
    }
  };

  const addLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_locations')
        .insert([newLocation])
        .select()
        .single();

      if (error) throw error;

      setLocations(prev => [data, ...prev]);
      setShowAddLocation(false);
      setNewLocation({
        name: '',
        code: '',
        type: 'storage',
        capacity: 0
      });
      showToast({ title: 'Location added successfully', type: 'success' });
    } catch (error) {
      showToast({ title: 'Error adding location', type: 'error' });
    }
  };

  const addStockMovement = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_movements')
        .insert([newMovement])
        .select()
        .single();

      if (error) throw error;

      // Update stock levels
      if (newMovement.type === 'in' && newMovement.to_location_id) {
        await updateStockLevel(newMovement.product_id, newMovement.to_location_id, newMovement.quantity, 'in' as 'in' | 'out');
      } else if (newMovement.type === 'out' && newMovement.from_location_id) {
        await updateStockLevel(newMovement.product_id, newMovement.from_location_id, newMovement.quantity, 'out' as 'in' | 'out');
      }

      setMovements(prev => [data, ...prev]);
      setShowStockMovement(false);
      setNewMovement({
        type: 'in',
        product_id: '',
        from_location_id: '',
        to_location_id: '',
        quantity: 0,
        reference: '',
        notes: ''
      });
      showToast({ title: 'Stock movement recorded successfully', type: 'success' });
      
      // Reload stock data
      await loadWarehouseData();
    } catch (error) {
      showToast({ title: 'Error recording stock movement', type: 'error' });
    }
  };

  const updateStockLevel = async (productId: string, locationId: string, quantity: number, operation: 'in' | 'out') => {
    try {
      // Get current stock
      const { data: currentStock } = await supabase
        .from('warehouse_stock')
        .select('*')
        .eq('product_id', productId)
        .eq('location_id', locationId)
        .single();

      if (currentStock) {
        // Update existing stock
        const newQuantity = operation === 'in' 
          ? currentStock.quantity + quantity
          : currentStock.quantity - quantity;

        await supabase
          .from('warehouse_stock')
          .update({
            quantity: newQuantity,
            available_quantity: newQuantity - currentStock.reserved_quantity,
            last_updated: new Date().toISOString()
          })
          .eq('id', currentStock.id);
      } else if (operation === 'in') {
        // Create new stock record
        await supabase
          .from('warehouse_stock')
          .insert([{
            product_id: productId,
            location_id: locationId,
            quantity: quantity,
            reserved_quantity: 0,
            available_quantity: quantity,
            min_stock_level: 10,
            max_stock_level: 100,
            last_updated: new Date().toISOString()
          }]);
      }
    } catch (error) {
      console.error('Error updating stock level:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'maintenance': return 'warning';
      default: return 'secondary';
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'success';
      case 'out': return 'danger';
      case 'transfer': return 'warning';
      case 'adjustment': return 'primary';
      default: return 'secondary';
    }
  };

  const getStockLevelColor = (quantity: number, minLevel: number) => {
    if (quantity <= minLevel) return 'danger';
    if (quantity <= minLevel * 2) return 'warning';
    return 'success';
  };

  const handleViewProduct = (product: WarehouseProduct) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product: WarehouseProduct) => {
    // Populate the edit form with current product data
    setNewProduct({
      name: product.name,
      sku: product.sku,
      product_code: product.product_code || '',
      supplier: product.supplier || '',
      supplier_code: product.supplier_code || '',
      serial_number: product.serial_number || '',
      barcode: product.barcode || '',
      description: product.description || '',
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      model: product.model || '',
      purchase_price: product.purchase_price || 0,
      sale_price: product.sale_price || 0,
      wholesale_price: product.wholesale_price || 0,
      retail_price: product.retail_price || 0,
      profit_margin: product.profit_margin || 0,
      tax_rate: product.tax_rate || 0,
      weight_kg: product.weight_kg || 0,
      length_cm: product.length_cm || 0,
      width_cm: product.width_cm || 0,
      height_cm: product.height_cm || 0,
      volume_l: product.volume_l || 0,
      area_m2: product.area_m2 || 0,
      pieces_per_unit: product.pieces_per_unit || 1,
      minimum_order_quantity: product.minimum_order_quantity || 1,
      reorder_point: product.reorder_point || 10,
      lead_time_days: product.lead_time_days || 7,
      shelf_life_days: product.shelf_life_days || 365,
      is_active: product.is_active !== false,
      is_tracked: product.is_tracked !== false,
      specifications: product.specifications || {},
      tags: product.tags || []
    });
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleViewLocation = (location: WarehouseLocation) => {
    setSelectedLocation(location);
    setShowViewModal(true);
  };

  const handleEditLocation = (location: WarehouseLocation) => {
    setSelectedLocation(location);
    setShowEditModal(true);
  };

  // Delete functions
  const handleDeleteProduct = (product: WarehouseProduct) => {
    setDeleteItem({ type: 'product', item: product });
    setShowDeleteModal(true);
  };

  const handleDeleteLocation = (location: WarehouseLocation) => {
    setDeleteItem({ type: 'location', item: location });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      if (deleteItem.type === 'product') {
        const { error } = await supabase
          .from('warehouse_products')
          .delete()
          .eq('id', deleteItem.item.id);

        if (error) throw error;

        setProducts(prev => prev.filter(p => p.id !== deleteItem.item.id));
        showToast({ title: 'Product deleted successfully', type: 'success' });
      } else if (deleteItem.type === 'location') {
        const { error } = await supabase
          .from('warehouse_locations')
          .delete()
          .eq('id', deleteItem.item.id);

        if (error) throw error;

        setLocations(prev => prev.filter(l => l.id !== deleteItem.item.id));
        showToast({ title: 'Location deleted successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast({ title: 'Error deleting item', type: 'error' });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteItem(null);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.product_code && product.product_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (product.supplier && product.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesBrand = filterBrand === 'all' || product.brand === filterBrand;
      const matchesSupplier = filterSupplier === 'all' || product.supplier === filterSupplier;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && product.is_active) ||
                           (filterStatus === 'inactive' && !product.is_active);
      
      return matchesSearch && matchesCategory && matchesBrand && matchesSupplier && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof WarehouseProduct];
      let bValue: any = b[sortBy as keyof WarehouseProduct];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Warehouse Management
          </h1>
          <p className="text-[#b0b0d0]">
            Manage inventory, locations, and stock movements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={loadWarehouseData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a259ff] mx-auto mb-4"></div>
            <p className="text-white">Loading warehouse data...</p>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {!isLoading && (
        <div className="bg-[#23233a]/30 p-4 rounded-lg">
          <h3 className="text-white font-medium mb-2">Debug Info:</h3>
          <p className="text-[#b0b0d0] text-sm">Products: {products.length}</p>
          <p className="text-[#b0b0d0] text-sm">Locations: {locations.length}</p>
          <p className="text-[#b0b0d0] text-sm">Stock Items: {stock.length}</p>
          <p className="text-[#b0b0d0] text-sm">Movements: {movements.length}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-[#23233a]/30 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'locations', label: 'Locations', icon: MapPin },
          { id: 'movements', label: 'Movements', icon: Truck },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-[#a259ff] text-white'
                : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b0b0d0] text-sm">Total Products</p>
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                </div>
                <div className="p-3 bg-[#a259ff]/20 rounded-lg">
                  <Package className="w-6 h-6 text-[#a259ff]" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b0b0d0] text-sm">Active Locations</p>
                  <p className="text-2xl font-bold text-white">{locations.filter(l => l.status === 'active').length}</p>
                </div>
                <div className="p-3 bg-[#377dff]/20 rounded-lg">
                  <MapPin className="w-6 h-6 text-[#377dff]" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b0b0d0] text-sm">Low Stock Items</p>
                  <p className="text-2xl font-bold text-white">{stock.filter(s => s.quantity <= s.min_stock_level).length}</p>
                </div>
                <div className="p-3 bg-[#ff6b6b]/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-[#ff6b6b]" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b0b0d0] text-sm">Today's Movements</p>
                  <p className="text-2xl font-bold text-white">{movements.filter(m => 
                    new Date(m.created_at).toDateString() === new Date().toDateString()
                  ).length}</p>
                </div>
                <div className="p-3 bg-[#43e7ad]/20 rounded-lg">
                  <Truck className="w-6 h-6 text-[#43e7ad]" />
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Stock Movements */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Stock Movements</h3>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {movements.slice(0, 5).map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 bg-[#23233a]/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                      <Truck className="w-5 h-5 text-[#a259ff]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{movement.product_name}</p>
                      <p className="text-[#b0b0d0] text-sm">{movement.reference}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getMovementTypeColor(movement.type)}>
                      {movement.type.toUpperCase()}
                    </Badge>
                    <span className="text-white font-medium">{movement.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Inventory Management</h2>
            <div className="flex items-center gap-3">
              {/* View Mode Controls */}
              <div className="flex items-center bg-[#23233a]/30 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-[#a259ff] text-white'
                      : 'text-[#b0b0d0] hover:text-white'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'table'
                      ? 'bg-[#a259ff] text-white'
                      : 'text-[#b0b0d0] hover:text-white'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#a259ff] text-white'
                      : 'text-[#b0b0d0] hover:text-white'
                  }`}
                >
                  List
                </button>
              </div>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search by name, SKU, product code, brand, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] text-sm"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="tools">Tools</option>
                <option value="furniture">Furniture</option>
                <option value="automotive">Automotive</option>
              </select>
              
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] text-sm"
              >
                <option value="all">All Brands</option>
                {Array.from(new Set(products.map(p => p.brand).filter(Boolean))).map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              
              <select
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] text-sm"
              >
                <option value="all">All Suppliers</option>
                {Array.from(new Set(products.map(p => p.supplier).filter(Boolean))).map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="sku">Sort by SKU</option>
                <option value="category">Sort by Category</option>
                <option value="unit_price">Sort by Price</option>
                <option value="created_at">Sort by Date</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] text-sm hover:bg-[#23233a]/70"
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
            
            {/* Results Count */}
            <div className="text-[#b0b0d0] text-sm">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>

          {/* Products Views */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:bg-[#23233a]/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                        <Package className="w-5 h-5 text-[#a259ff]" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{product.name}</h3>
                        <p className="text-[#b0b0d0] text-sm">{product.sku}</p>
                      </div>
                    </div>
                    <Badge variant="primary" size="sm">
                      {product.category}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#b0b0d0] text-sm">Unit Price</span>
                      <span className="text-white font-medium">${product.unit_price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[#b0b0d0] text-sm">Cost Price</span>
                      <span className="text-white font-medium">${product.cost_price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-3 border-t border-[#23233a]/30">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleViewProduct(product)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="flex-1" 
                      onClick={() => handleEditProduct(product)}
                      disabled={!canEdit('warehouse')}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {canDelete('warehouse') && (
                      <Button 
                        size="sm" 
                        variant="danger" 
                        className="flex-1" 
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#23233a]/30">
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Product</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">SKU</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Category</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Unit Price</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Cost Price</th>
                      <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-[#23233a]/20 hover:bg-[#23233a]/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-1 bg-[#a259ff]/20 rounded">
                              <Package className="w-4 h-4 text-[#a259ff]" />
                            </div>
                            <span className="text-white font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#b0b0d0]">{product.sku}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="primary" size="sm">{product.category}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white font-medium">${product.unit_price.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white font-medium">${product.cost_price.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="secondary" onClick={() => handleViewProduct(product)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => handleEditProduct(product)}
                              disabled={!canEdit('warehouse')}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {canDelete('warehouse') && (
                              <Button 
                                size="sm" 
                                variant="danger" 
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:bg-[#23233a]/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                        <Package className="w-5 h-5 text-[#a259ff]" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{product.name}</h3>
                        <p className="text-[#b0b0d0] text-sm">{product.sku}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-[#b0b0d0] text-sm">Unit Price</p>
                        <p className="text-white font-medium">${product.unit_price.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#b0b0d0] text-sm">Cost Price</p>
                        <p className="text-white font-medium">${product.cost_price.toFixed(2)}</p>
                      </div>
                      <Badge variant="primary" size="sm">{product.category}</Badge>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleViewProduct(product)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleEditProduct(product)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Warehouse Locations</h2>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowAddLocation(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Card key={location.id} className="hover:bg-[#23233a]/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#377dff]/20 rounded-lg">
                      <MapPin className="w-5 h-5 text-[#377dff]" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{location.name}</h3>
                      <p className="text-[#b0b0d0] text-sm">{location.code}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(location.status)} size="sm">
                    {location.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#b0b0d0] text-sm">Type</span>
                    <span className="text-white font-medium capitalize">{location.type}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#b0b0d0] text-sm">Usage</span>
                    <span className="text-white font-medium">
                      {location.current_usage} / {location.capacity}
                    </span>
                  </div>
                  
                  <div className="w-full bg-[#23233a] rounded-full h-2">
                    <div 
                      className="bg-[#a259ff] h-2 rounded-full" 
                      style={{ width: `${(location.current_usage / location.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-[#23233a]/30">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleViewLocation(location)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleEditLocation(location)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Stock Movements</h2>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowStockMovement(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Movement
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#23233a]/30">
                    <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Product</th>
                    <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">From</th>
                    <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">To</th>
                    <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Reference</th>
                    <th className="text-left py-3 px-4 text-[#b0b0d0] font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id} className="border-b border-[#23233a]/20">
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">{movement.product_name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getMovementTypeColor(movement.type)}>
                          {movement.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">{movement.quantity}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white">{movement.from_location_name || '-'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white">{movement.to_location_name || '-'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white">{movement.reference}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-[#b0b0d0] text-sm">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Warehouse Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Default Low Stock Alert</label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    defaultValue="20"
                    className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Currency</label>
                  <select className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#b0b0d0]">Low Stock Alerts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a] rounded focus:ring-[#a259ff]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#b0b0d0]">Movement Notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a] rounded focus:ring-[#a259ff]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#b0b0d0]">Daily Reports</span>
                  <input type="checkbox" className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a] rounded focus:ring-[#a259ff]" />
                </div>
              </div>
            </Card>

            {/* Import/Export */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
              <div className="space-y-4">
                <Button variant="secondary" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Inventory Data
                </Button>
                <Button variant="secondary" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Inventory Data
                </Button>
                <Button variant="danger" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </Card>

            {/* System Info */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#b0b0d0]">Total Products:</span>
                  <span className="text-white">{products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b0b0d0]">Total Locations:</span>
                  <span className="text-white">{locations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b0b0d0]">Stock Items:</span>
                  <span className="text-white">{stock.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b0b0d0]">Movements:</span>
                  <span className="text-white">{movements.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Product</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Basic Information</h4>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Product Code"
                  value={newProduct.product_code}
                  onChange={(e) => setNewProduct({...newProduct, product_code: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
              </div>

              {/* Supplier Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Supplier Information</h4>
                <input
                  type="text"
                  placeholder="Supplier"
                  value={newProduct.supplier}
                  onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Supplier Code"
                  value={newProduct.supplier_code}
                  onChange={(e) => setNewProduct({...newProduct, supplier_code: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Serial Number"
                  value={newProduct.serial_number}
                  onChange={(e) => setNewProduct({...newProduct, serial_number: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Barcode"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
              </div>

              {/* Category & Brand */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Category & Brand</h4>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                >
                  <option value="general">General</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="tools">Tools</option>
                  <option value="furniture">Furniture</option>
                  <option value="automotive">Automotive</option>
                </select>
                <input
                  type="text"
                  placeholder="Subcategory"
                  value={newProduct.subcategory}
                  onChange={(e) => setNewProduct({...newProduct, subcategory: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Brand"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={newProduct.model}
                  onChange={(e) => setNewProduct({...newProduct, model: e.target.value})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Pricing</h4>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Purchase Price"
                  value={newProduct.purchase_price}
                  onChange={(e) => setNewProduct({...newProduct, purchase_price: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Sale Price"
                  value={newProduct.sale_price}
                  onChange={(e) => setNewProduct({...newProduct, sale_price: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Wholesale Price"
                  value={newProduct.wholesale_price}
                  onChange={(e) => setNewProduct({...newProduct, wholesale_price: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Retail Price"
                  value={newProduct.retail_price}
                  onChange={(e) => setNewProduct({...newProduct, retail_price: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
              </div>

              {/* Physical Dimensions */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Physical Dimensions</h4>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Weight (kg)"
                  value={newProduct.weight_kg}
                  onChange={(e) => setNewProduct({...newProduct, weight_kg: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Length (cm)"
                  value={newProduct.length_cm}
                  onChange={(e) => setNewProduct({...newProduct, length_cm: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Width (cm)"
                  value={newProduct.width_cm}
                  onChange={(e) => setNewProduct({...newProduct, width_cm: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Height (cm)"
                  value={newProduct.height_cm}
                  onChange={(e) => setNewProduct({...newProduct, height_cm: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
              </div>

              {/* Inventory Management */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Inventory Management</h4>
                <input
                  type="number"
                  placeholder="Pieces per Unit"
                  value={newProduct.pieces_per_unit}
                  onChange={(e) => setNewProduct({...newProduct, pieces_per_unit: parseInt(e.target.value) || 1})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="number"
                  placeholder="Minimum Order Quantity"
                  value={newProduct.minimum_order_quantity}
                  onChange={(e) => setNewProduct({...newProduct, minimum_order_quantity: parseInt(e.target.value) || 1})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="number"
                  placeholder="Reorder Point"
                  value={newProduct.reorder_point}
                  onChange={(e) => setNewProduct({...newProduct, reorder_point: parseInt(e.target.value) || 10})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
                <input
                  type="number"
                  placeholder="Lead Time (days)"
                  value={newProduct.lead_time_days}
                  onChange={(e) => setNewProduct({...newProduct, lead_time_days: parseInt(e.target.value) || 7})}
                  className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={() => setShowAddProduct(false)}>Cancel</Button>
              <Button variant="primary" onClick={addProduct}>Add Product</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Location</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Location Name</label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                />
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Location Code</label>
                <input
                  type="text"
                  value={newLocation.code}
                  onChange={(e) => setNewLocation({...newLocation, code: e.target.value})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                />
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Location Type</label>
                <select
                  value={newLocation.type}
                  onChange={(e) => setNewLocation({...newLocation, type: e.target.value as any})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  <option value="storage">Storage</option>
                  <option value="shipping">Shipping</option>
                  <option value="receiving">Receiving</option>
                  <option value="production">Production</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Capacity</label>
                <input
                  type="number"
                  value={newLocation.capacity}
                  onChange={(e) => setNewLocation({...newLocation, capacity: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowAddLocation(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={addLocation}
              >
                Add Location
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showStockMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Record Stock Movement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Movement Type</label>
                <select
                  value={newMovement.type}
                  onChange={(e) => setNewMovement({...newMovement, type: e.target.value as any})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                  <option value="transfer">Transfer</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Product</label>
                <select
                  value={newMovement.product_id}
                  onChange={(e) => setNewMovement({...newMovement, product_id: e.target.value})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              
              {newMovement.type === 'out' as any && (
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">From Location</label>
                  <select
                    value={newMovement.from_location_id}
                    onChange={(e) => setNewMovement({...newMovement, from_location_id: e.target.value})}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {(newMovement.type === 'in' as any || newMovement.type === 'transfer' as any) && (
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">To Location</label>
                  <select
                    value={newMovement.to_location_id}
                    onChange={(e) => setNewMovement({...newMovement, to_location_id: e.target.value})}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Quantity</label>
                <input
                  type="number"
                  value={newMovement.quantity}
                  onChange={(e) => setNewMovement({...newMovement, quantity: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                />
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Reference</label>
                <input
                  type="text"
                  value={newMovement.reference}
                  onChange={(e) => setNewMovement({...newMovement, reference: e.target.value})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowStockMovement(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={addStockMovement}
              >
                Record Movement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (selectedProduct || selectedLocation) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedProduct ? `View Product: ${selectedProduct.name}` : `View Location: ${selectedLocation?.name}`}
              </h3>
              <Button variant="secondary" size="sm" onClick={() => setShowViewModal(false)}>
                ✕
              </Button>
            </div>
            
            {selectedProduct && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Basic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Name:</span>
                        <p className="text-white font-medium">{selectedProduct.name}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">SKU:</span>
                        <p className="text-white font-medium">{selectedProduct.sku}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Product Code:</span>
                        <p className="text-white font-medium">{selectedProduct.product_code || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Category:</span>
                        <Badge variant="primary" size="sm">{selectedProduct.category}</Badge>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Subcategory:</span>
                        <p className="text-white font-medium">{selectedProduct.subcategory || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Brand:</span>
                        <p className="text-white font-medium">{selectedProduct.brand || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Model:</span>
                        <p className="text-white font-medium">{selectedProduct.model || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Description:</span>
                        <p className="text-white">{selectedProduct.description || 'No description'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Supplier Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Supplier Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Supplier:</span>
                        <p className="text-white font-medium">{selectedProduct.supplier || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Supplier Code:</span>
                        <p className="text-white font-medium">{selectedProduct.supplier_code || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Serial Number:</span>
                        <p className="text-white font-medium">{selectedProduct.serial_number || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Barcode:</span>
                        <p className="text-white font-medium">{selectedProduct.barcode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Pricing</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Purchase Price:</span>
                        <p className="text-white font-medium">${selectedProduct.purchase_price?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Sale Price:</span>
                        <p className="text-white font-medium">${selectedProduct.sale_price?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Wholesale Price:</span>
                        <p className="text-white font-medium">${selectedProduct.wholesale_price?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Retail Price:</span>
                        <p className="text-white font-medium">${selectedProduct.retail_price?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Profit Margin:</span>
                        <p className="text-white font-medium">{selectedProduct.profit_margin?.toFixed(2) || '0.00'}%</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Tax Rate:</span>
                        <p className="text-white font-medium">{selectedProduct.tax_rate?.toFixed(2) || '0.00'}%</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Physical Dimensions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Physical Dimensions</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Weight:</span>
                        <p className="text-white font-medium">{selectedProduct.weight_kg?.toFixed(3) || '0.000'} kg</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Dimensions:</span>
                        <p className="text-white font-medium">
                          {selectedProduct.length_cm || 0} × {selectedProduct.width_cm || 0} × {selectedProduct.height_cm || 0} cm
                        </p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Volume:</span>
                        <p className="text-white font-medium">{selectedProduct.volume_l?.toFixed(2) || '0.00'} L</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Area:</span>
                        <p className="text-white font-medium">{selectedProduct.area_m2?.toFixed(2) || '0.00'} m²</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Inventory Management */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Inventory Management</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Pieces per Unit:</span>
                        <p className="text-white font-medium">{selectedProduct.pieces_per_unit || 1}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Min Order Quantity:</span>
                        <p className="text-white font-medium">{selectedProduct.minimum_order_quantity || 1}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Reorder Point:</span>
                        <p className="text-white font-medium">{selectedProduct.reorder_point || 10}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Lead Time:</span>
                        <p className="text-white font-medium">{selectedProduct.lead_time_days || 7} days</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Shelf Life:</span>
                        <p className="text-white font-medium">{selectedProduct.shelf_life_days || 365} days</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Status:</span>
                        <Badge variant={selectedProduct.is_active ? 'success' : 'danger'} size="sm">
                          {selectedProduct.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#23233a]/30">
                  <div className="flex items-center justify-end space-x-3">
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                    <Button variant="primary" onClick={() => {
                      setShowViewModal(false);
                      handleEditProduct(selectedProduct);
                    }}>Edit Product</Button>
                  </div>
                </div>
              </div>
            )}
            
            {selectedLocation && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Location Details</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Name:</span>
                        <p className="text-white font-medium">{selectedLocation.name}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Code:</span>
                        <p className="text-white font-medium">{selectedLocation.code}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Type:</span>
                        <Badge variant="primary" size="sm">{selectedLocation.type}</Badge>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Status:</span>
                        <Badge variant={getStatusColor(selectedLocation.status)} size="sm">{selectedLocation.status}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Capacity</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Current Usage:</span>
                        <p className="text-white font-medium">{selectedLocation.current_usage} / {selectedLocation.capacity}</p>
                      </div>
                      <div>
                        <span className="text-[#b0b0d0] text-sm">Usage Percentage:</span>
                        <div className="w-full bg-[#23233a] rounded-full h-2 mt-1">
                          <div 
                            className="bg-[#a259ff] h-2 rounded-full" 
                            style={{ width: `${(selectedLocation.current_usage / selectedLocation.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#23233a]/30">
                  <div className="flex items-center justify-end space-x-3">
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                    <Button variant="primary" onClick={() => {
                      setShowViewModal(false);
                      handleEditLocation(selectedLocation);
                    }}>Edit Location</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (selectedProduct || selectedLocation) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedProduct ? `Edit Product: ${selectedProduct.name}` : `Edit Location: ${selectedLocation?.name}`}
              </h3>
              <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
                ✕
              </Button>
            </div>
            
            {selectedProduct && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300">Basic Information</h4>
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="SKU"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Product Code"
                      value={newProduct.product_code}
                      onChange={(e) => setNewProduct({...newProduct, product_code: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>

                  {/* Supplier Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300">Supplier Information</h4>
                    <input
                      type="text"
                      placeholder="Supplier"
                      value={newProduct.supplier}
                      onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Supplier Code"
                      value={newProduct.supplier_code}
                      onChange={(e) => setNewProduct({...newProduct, supplier_code: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Serial Number"
                      value={newProduct.serial_number}
                      onChange={(e) => setNewProduct({...newProduct, serial_number: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Barcode"
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>

                  {/* Category & Brand */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300">Category & Brand</h4>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    >
                      <option value="general">General</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="books">Books</option>
                      <option value="tools">Tools</option>
                      <option value="furniture">Furniture</option>
                      <option value="automotive">Automotive</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Subcategory"
                      value={newProduct.subcategory}
                      onChange={(e) => setNewProduct({...newProduct, subcategory: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Brand"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="text"
                      placeholder="Model"
                      value={newProduct.model}
                      onChange={(e) => setNewProduct({...newProduct, model: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300">Pricing</h4>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Purchase Price"
                      value={newProduct.purchase_price}
                      onChange={(e) => setNewProduct({...newProduct, purchase_price: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Sale Price"
                      value={newProduct.sale_price}
                      onChange={(e) => setNewProduct({...newProduct, sale_price: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Wholesale Price"
                      value={newProduct.wholesale_price}
                      onChange={(e) => setNewProduct({...newProduct, wholesale_price: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Retail Price"
                      value={newProduct.retail_price}
                      onChange={(e) => setNewProduct({...newProduct, retail_price: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>

                  {/* Physical Dimensions */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300">Physical Dimensions</h4>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Weight (kg)"
                      value={newProduct.weight_kg}
                      onChange={(e) => setNewProduct({...newProduct, weight_kg: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Length (cm)"
                      value={newProduct.length_cm}
                      onChange={(e) => setNewProduct({...newProduct, length_cm: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Width (cm)"
                      value={newProduct.width_cm}
                      onChange={(e) => setNewProduct({...newProduct, width_cm: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Height (cm)"
                      value={newProduct.height_cm}
                      onChange={(e) => setNewProduct({...newProduct, height_cm: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>

                  {/* Inventory Management */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300">Inventory Management</h4>
                    <input
                      type="number"
                      placeholder="Pieces per Unit"
                      value={newProduct.pieces_per_unit}
                      onChange={(e) => setNewProduct({...newProduct, pieces_per_unit: parseInt(e.target.value) || 1})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="number"
                      placeholder="Minimum Order Quantity"
                      value={newProduct.minimum_order_quantity}
                      onChange={(e) => setNewProduct({...newProduct, minimum_order_quantity: parseInt(e.target.value) || 1})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="number"
                      placeholder="Reorder Point"
                      value={newProduct.reorder_point}
                      onChange={(e) => setNewProduct({...newProduct, reorder_point: parseInt(e.target.value) || 10})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                    <input
                      type="number"
                      placeholder="Lead Time (days)"
                      value={newProduct.lead_time_days}
                      onChange={(e) => setNewProduct({...newProduct, lead_time_days: parseInt(e.target.value) || 7})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#23233a]/30">
                  <div className="flex items-center justify-end space-x-3">
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={updateProduct}>Save Changes</Button>
                  </div>
                </div>
              </div>
            )}
            
            {selectedLocation && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Location Name</label>
                    <input
                      type="text"
                      defaultValue={selectedLocation.name}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Code</label>
                    <input
                      type="text"
                      defaultValue={selectedLocation.code}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Type</label>
                    <select
                      defaultValue={selectedLocation.type}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    >
                      <option value="storage">Storage</option>
                      <option value="shipping">Shipping</option>
                      <option value="receiving">Receiving</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Status</label>
                    <select
                      defaultValue={selectedLocation.status}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Capacity</label>
                    <input
                      type="number"
                      defaultValue={selectedLocation.capacity}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Current Usage</label>
                    <input
                      type="number"
                      defaultValue={selectedLocation.current_usage}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#23233a]/30">
                  <div className="flex items-center justify-end space-x-3">
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => {
                      showToast({ title: 'Location updated successfully', type: 'success' });
                      setShowEditModal(false);
                    }}>Save Changes</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={deleteItem?.type === 'product' ? 'Delete Product' : 'Delete Location'}
        message={
          deleteItem?.type === 'product' 
            ? `Are you sure you want to delete "${deleteItem?.item?.name}"? This will permanently remove the product and all associated stock records.`
            : `Are you sure you want to delete "${deleteItem?.item?.name}"? This will permanently remove the location and all associated stock records.`
        }
        itemName={deleteItem?.item?.name || ''}
        module="warehouse"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default WarehouseManagementModule; 