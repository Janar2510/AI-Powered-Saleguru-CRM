import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

// Enhanced Types for Comprehensive Warehouse System

export interface Warehouse {
  id: string;
  org_id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_default: boolean;
  is_active: boolean;
  timezone: string;
  working_hours: any;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  org_id: string;
  warehouse_id: string;
  code: string;
  name: string;
  zone?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  location_type: string;
  capacity_volume?: number;
  capacity_weight?: number;
  temperature_controlled: boolean;
  hazmat_approved: boolean;
  is_active: boolean;
  barcode?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
  warehouse?: Warehouse;
}

export interface StockItem {
  id: string;
  org_id: string;
  product_id: string;
  location_id: string;
  lot_number?: string;
  serial_number?: string;
  expiry_date?: string;
  qty: number;
  reserved_qty: number;
  available_qty: number;
  cost_per_unit?: number;
  last_movement_date: string;
  last_count_date?: string;
  created_at: string;
  updated_at: string;
  location?: Location;
  product?: any;
}

export interface PurchaseOrder {
  id: string;
  org_id: string;
  po_number: string;
  supplier_id?: string;
  supplier_name: string;
  supplier_contact?: any;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  received_date?: string;
  warehouse_id?: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  payment_terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  lines?: PurchaseOrderLine[];
  warehouse?: Warehouse;
}

export interface PurchaseOrderLine {
  id: string;
  po_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  qty_ordered: number;
  qty_received: number;
  unit_cost: number;
  line_total: number;
  location_id?: string;
  lot_number?: string;
  expiry_date?: string;
  notes?: string;
  created_at: string;
  location?: Location;
}

export interface SalesOrder {
  id: string;
  org_id: string;
  so_number: string;
  customer_id?: string;
  customer_name: string;
  customer_contact?: any;
  status: 'pending' | 'confirmed' | 'processing' | 'picked' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  order_date: string;
  required_date?: string;
  shipped_date?: string;
  warehouse_id?: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  payment_method?: string;
  tracking_number?: string;
  carrier?: string;
  shipping_service?: string;
  notes?: string;
  channel: string;
  channel_order_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  lines?: SalesOrderLine[];
  warehouse?: Warehouse;
}

export interface SalesOrderLine {
  id: string;
  so_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  qty_ordered: number;
  qty_picked: number;
  qty_shipped: number;
  unit_price: number;
  line_total: number;
  location_id?: string;
  lot_number?: string;
  notes?: string;
  created_at: string;
  location?: Location;
}

export interface StockAlert {
  id: string;
  org_id: string;
  product_id: string;
  warehouse_id?: string;
  location_id?: string;
  alert_type: 'low_stock' | 'zero_stock' | 'overstock' | 'expiring_soon';
  current_qty?: number;
  threshold_qty?: number;
  alert_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  message?: string;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  product?: any;
  warehouse?: Warehouse;
  location?: Location;
}

export interface StockForecast {
  id: string;
  org_id: string;
  product_id: string;
  warehouse_id?: string;
  forecast_date: string;
  forecast_period_days: number;
  current_stock: number;
  predicted_demand: number;
  recommended_order_qty?: number;
  confidence_score?: number;
  algorithm_version?: string;
  factors?: any;
  created_at: string;
  product?: any;
  warehouse?: Warehouse;
}

export interface MultichannelListing {
  id: string;
  org_id: string;
  product_id: string;
  channel: string;
  channel_product_id?: string;
  listing_title?: string;
  listing_description?: string;
  price?: number;
  quantity?: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'suspended';
  sync_inventory: boolean;
  sync_price: boolean;
  last_sync_at?: string;
  channel_data?: any;
  created_at: string;
  updated_at: string;
  product?: any;
}

export interface InventoryAdjustment {
  id: string;
  org_id: string;
  adjustment_number: string;
  warehouse_id?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adjustment_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  lines?: InventoryAdjustmentLine[];
  warehouse?: Warehouse;
}

export interface InventoryAdjustmentLine {
  id: string;
  adjustment_id: string;
  stock_item_id?: string;
  product_id: string;
  product_name: string;
  location_id?: string;
  lot_number?: string;
  qty_before: number;
  qty_after: number;
  qty_adjustment: number;
  unit_cost?: number;
  cost_adjustment?: number;
  reason?: string;
  created_at: string;
  location?: Location;
}

// Hooks for Warehouses
export const useWarehouses = (orgId: string) => {
  return useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Warehouse[];
    },
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (warehouse: Partial<Warehouse>) => {
      const { data, error } = await supabase
        .from('warehouses')
        .insert(warehouse)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};

// Hooks for Locations
export const useLocations = (orgId: string, warehouseId?: string) => {
  return useQuery({
    queryKey: ['locations', orgId, warehouseId],
    queryFn: async () => {
      let query = supabase
        .from('locations')
        .select(`
          *,
          warehouse:warehouses(*)
        `)
        .eq('org_id', orgId)
        .eq('is_active', true);
      
      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }
      
      const { data, error } = await query.order('zone, aisle, rack, shelf, bin');
      
      if (error) throw error;
      return data as Location[];
    },
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (location: Partial<Location>) => {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

// Hooks for Purchase Orders
export const usePurchaseOrders = (orgId: string, filters?: any) => {
  return useQuery({
    queryKey: ['purchase_orders', orgId, filters],
    queryFn: async () => {
      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          warehouse:warehouses(*),
          lines:purchase_order_lines(
            *,
            location:locations(*)
          )
        `)
        .eq('org_id', orgId);
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.warehouseId) {
        query = query.eq('warehouse_id', filters.warehouseId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PurchaseOrder[];
    },
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ po, lines }: { po: Partial<PurchaseOrder>; lines: Partial<PurchaseOrderLine>[] }) => {
      // Create PO
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert(po)
        .select()
        .single();
      
      if (poError) throw poError;
      
      // Create PO lines
      const linesWithPoId = lines.map(line => ({ ...line, po_id: poData.id }));
      const { data: linesData, error: linesError } = await supabase
        .from('purchase_order_lines')
        .insert(linesWithPoId)
        .select();
      
      if (linesError) throw linesError;
      
      return { ...poData, lines: linesData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
    },
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ poId, receipts }: { 
      poId: string; 
      receipts: { line_id: string; qty_received: number; lot_number?: string; location_id: string }[] 
    }) => {
      // Update PO lines
      for (const receipt of receipts) {
        const { error: lineError } = await supabase
          .from('purchase_order_lines')
          .update({ qty_received: receipt.qty_received })
          .eq('id', receipt.line_id);
        
        if (lineError) throw lineError;
        
        // Create stock movement
        const { data: line } = await supabase
          .from('purchase_order_lines')
          .select('product_id, unit_cost')
          .eq('id', receipt.line_id)
          .single();
        
        if (line) {
          const { error: moveError } = await supabase
            .from('stock_moves')
            .insert({
              org_id: 'current-org-id', // Should be dynamic
              product_id: line.product_id,
              to_location_id: receipt.location_id,
              lot_number: receipt.lot_number,
              qty: receipt.qty_received,
              unit_cost: line.unit_cost,
              reason: 'purchase',
              ref_table: 'purchase_orders',
              ref_id: poId,
            });
          
          if (moveError) throw moveError;
        }
      }
      
      // Update PO status
      const { error: poError } = await supabase
        .from('purchase_orders')
        .update({ 
          status: 'received',
          received_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', poId);
      
      if (poError) throw poError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['stock_items'] });
      queryClient.invalidateQueries({ queryKey: ['stock_moves'] });
    },
  });
};

// Hooks for Sales Orders
export const useSalesOrders = (orgId: string, filters?: any) => {
  return useQuery({
    queryKey: ['sales_orders', orgId, filters],
    queryFn: async () => {
      let query = supabase
        .from('sales_orders')
        .select(`
          *,
          warehouse:warehouses(*),
          lines:sales_order_lines(
            *,
            location:locations(*)
          )
        `)
        .eq('org_id', orgId);
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.channel) {
        query = query.eq('channel', filters.channel);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SalesOrder[];
    },
  });
};

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ so, lines }: { so: Partial<SalesOrder>; lines: Partial<SalesOrderLine>[] }) => {
      // Create SO
      const { data: soData, error: soError } = await supabase
        .from('sales_orders')
        .insert(so)
        .select()
        .single();
      
      if (soError) throw soError;
      
      // Create SO lines
      const linesWithSoId = lines.map(line => ({ ...line, so_id: soData.id }));
      const { data: linesData, error: linesError } = await supabase
        .from('sales_order_lines')
        .insert(linesWithSoId)
        .select();
      
      if (linesError) throw linesError;
      
      return { ...soData, lines: linesData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales_orders'] });
    },
  });
};

// Hooks for Stock Alerts
export const useStockAlerts = (orgId: string, filters?: any) => {
  return useQuery({
    queryKey: ['stock_alerts', orgId, filters],
    queryFn: async () => {
      let query = supabase
        .from('stock_alerts')
        .select(`
          *,
          warehouse:warehouses(*),
          location:locations(*)
        `)
        .eq('org_id', orgId);
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.alertLevel) {
        query = query.eq('alert_level', filters.alertLevel);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StockAlert[];
    },
  });
};

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('stock_alerts')
        .update({ 
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: 'current-user-id' // Should be dynamic
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_alerts'] });
    },
  });
};

// Hooks for Stock Forecasting
export const useStockForecasts = (orgId: string, productId?: string) => {
  return useQuery({
    queryKey: ['stock_forecasts', orgId, productId],
    queryFn: async () => {
      let query = supabase
        .from('stock_forecasts')
        .select(`
          *,
          warehouse:warehouses(*)
        `)
        .eq('org_id', orgId);
      
      if (productId) {
        query = query.eq('product_id', productId);
      }
      
      const { data, error } = await query.order('forecast_date', { ascending: false });
      
      if (error) throw error;
      return data as StockForecast[];
    },
  });
};

export const useGenerateStockForecast = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, warehouseId, forecastPeriodDays }: {
      productId: string;
      warehouseId?: string;
      forecastPeriodDays: number;
    }) => {
      // This would call an AI service to generate forecasts
      // For now, we'll create a mock forecast
      const forecast = {
        org_id: 'current-org-id', // Should be dynamic
        product_id: productId,
        warehouse_id: warehouseId,
        forecast_date: new Date().toISOString().split('T')[0],
        forecast_period_days: forecastPeriodDays,
        current_stock: 100, // Should fetch from actual stock
        predicted_demand: Math.floor(Math.random() * 50) + 10,
        recommended_order_qty: Math.floor(Math.random() * 100) + 50,
        confidence_score: Math.random() * 0.3 + 0.7, // 0.7-1.0
        algorithm_version: 'v1.0',
        factors: {
          seasonality: 0.2,
          trend: 0.1,
          events: 0.05
        }
      };
      
      const { data, error } = await supabase
        .from('stock_forecasts')
        .insert(forecast)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_forecasts'] });
    },
  });
};

// Hooks for Multichannel Listings
export const useMultichannelListings = (orgId: string, productId?: string) => {
  return useQuery({
    queryKey: ['multichannel_listings', orgId, productId],
    queryFn: async () => {
      let query = supabase
        .from('multichannel_listings')
        .select('*')
        .eq('org_id', orgId);
      
      if (productId) {
        query = query.eq('product_id', productId);
      }
      
      const { data, error } = await query.order('channel');
      
      if (error) throw error;
      return data as MultichannelListing[];
    },
  });
};

export const useCreateMultichannelListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listing: Partial<MultichannelListing>) => {
      const { data, error } = await supabase
        .from('multichannel_listings')
        .insert(listing)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multichannel_listings'] });
    },
  });
};

export const useSyncMultichannelInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listingId: string) => {
      // This would sync inventory with external channels
      // For now, we'll just update the sync timestamp
      const { data, error } = await supabase
        .from('multichannel_listings')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', listingId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multichannel_listings'] });
    },
  });
};

// Hooks for Inventory Adjustments
export const useInventoryAdjustments = (orgId: string) => {
  return useQuery({
    queryKey: ['inventory_adjustments', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_adjustments')
        .select(`
          *,
          warehouse:warehouses(*),
          lines:inventory_adjustment_lines(
            *,
            location:locations(*)
          )
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InventoryAdjustment[];
    },
  });
};

export const useCreateInventoryAdjustment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ adjustment, lines }: { 
      adjustment: Partial<InventoryAdjustment>; 
      lines: Partial<InventoryAdjustmentLine>[] 
    }) => {
      // Create adjustment
      const { data: adjustmentData, error: adjustmentError } = await supabase
        .from('inventory_adjustments')
        .insert(adjustment)
        .select()
        .single();
      
      if (adjustmentError) throw adjustmentError;
      
      // Create adjustment lines
      const linesWithAdjustmentId = lines.map(line => ({ 
        ...line, 
        adjustment_id: adjustmentData.id 
      }));
      
      const { data: linesData, error: linesError } = await supabase
        .from('inventory_adjustment_lines')
        .insert(linesWithAdjustmentId)
        .select();
      
      if (linesError) throw linesError;
      
      return { ...adjustmentData, lines: linesData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_adjustments'] });
    },
  });
};

export const useApproveInventoryAdjustment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adjustmentId: string) => {
      // Update adjustment status
      const { data, error } = await supabase
        .from('inventory_adjustments')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'current-user-id' // Should be dynamic
        })
        .eq('id', adjustmentId)
        .select()
        .single();
      
      if (error) throw error;
      
      // TODO: Create stock movements for approved adjustments
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['stock_items'] });
    },
  });
};

// AI-powered features
export const useGenerateAIRecommendations = () => {
  return useMutation({
    mutationFn: async (params: { type: 'reorder' | 'forecast' | 'optimization'; productId?: string }) => {
      // This would call AI services for recommendations
      // For now, return mock data
      const recommendations = {
        reorder: [
          { product_id: 'product-1', recommended_qty: 100, reason: 'Low stock detected' },
          { product_id: 'product-2', recommended_qty: 50, reason: 'Seasonal demand increase' }
        ],
        forecast: [
          { product_id: 'product-1', period: '30 days', predicted_demand: 150, confidence: 0.85 }
        ],
        optimization: [
          { type: 'location', message: 'Consolidate slow-moving items to zone C' },
          { type: 'procurement', message: 'Increase order frequency for high-velocity items' }
        ]
      };
      
      return recommendations[params.type] || [];
    },
  });
};

export default {
  useWarehouses,
  useCreateWarehouse,
  useLocations,
  useCreateLocation,
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useReceivePurchaseOrder,
  useSalesOrders,
  useCreateSalesOrder,
  useStockAlerts,
  useAcknowledgeAlert,
  useStockForecasts,
  useGenerateStockForecast,
  useMultichannelListings,
  useCreateMultichannelListing,
  useSyncMultichannelInventory,
  useInventoryAdjustments,
  useCreateInventoryAdjustment,
  useApproveInventoryAdjustment,
  useGenerateAIRecommendations,
};

