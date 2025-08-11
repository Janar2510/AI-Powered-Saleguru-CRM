import { supabase } from './supabase';

export interface WarehouseProduct {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit_price: number;
  cost_price: number;
  created_at: string;
  updated_at: string;
}

export interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  type: 'storage' | 'shipping' | 'receiving' | 'production';
  capacity: number;
  current_usage: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface WarehouseStock {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface WarehouseMovement {
  id: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  product_id: string;
  from_location_id?: string;
  to_location_id?: string;
  quantity: number;
  reference: string;
  notes?: string;
  created_at: string;
}

class WarehouseService {
  // Products
  async getProducts(): Promise<WarehouseProduct[]> {
    const { data, error } = await supabase
      .from('warehouse_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createProduct(product: Omit<WarehouseProduct, 'id' | 'created_at' | 'updated_at'>): Promise<WarehouseProduct> {
    const { data, error } = await supabase
      .from('warehouse_products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProduct(id: string, updates: Partial<WarehouseProduct>): Promise<WarehouseProduct> {
    const { data, error } = await supabase
      .from('warehouse_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('warehouse_products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Locations
  async getLocations(): Promise<WarehouseLocation[]> {
    const { data, error } = await supabase
      .from('warehouse_locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createLocation(location: Omit<WarehouseLocation, 'id' | 'created_at' | 'updated_at'>): Promise<WarehouseLocation> {
    const { data, error } = await supabase
      .from('warehouse_locations')
      .insert(location)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Stock
  async getStock(): Promise<WarehouseStock[]> {
    const { data, error } = await supabase
      .from('warehouse_stock')
      .select(`
        *,
        warehouse_products(name, sku),
        warehouse_locations(name, code)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateStock(id: string, updates: Partial<WarehouseStock>): Promise<WarehouseStock> {
    const { data, error } = await supabase
      .from('warehouse_stock')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Movements
  async getMovements(): Promise<WarehouseMovement[]> {
    const { data, error } = await supabase
      .from('warehouse_movements')
      .select(`
        *,
        warehouse_products(name, sku),
        from_location:warehouse_locations!warehouse_movements_from_location_id_fkey(name, code),
        to_location:warehouse_locations!warehouse_movements_to_location_id_fkey(name, code)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createMovement(movement: Omit<WarehouseMovement, 'id' | 'created_at'>): Promise<WarehouseMovement> {
    const { data, error } = await supabase
      .from('warehouse_movements')
      .insert(movement)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Stock Operations
  async receiveStock(productId: string, locationId: string, quantity: number, reference: string, notes?: string): Promise<void> {
    // Create movement record
    await this.createMovement({
      type: 'in',
      product_id: productId,
      to_location_id: locationId,
      quantity,
      reference,
      notes
    });

    // Update stock
    const { data: existingStock } = await supabase
      .from('warehouse_stock')
      .select('*')
      .eq('product_id', productId)
      .eq('location_id', locationId)
      .maybeSingle();

    if (existingStock) {
      await this.updateStock(existingStock.id, {
        quantity: existingStock.quantity + quantity,
        available_quantity: existingStock.available_quantity + quantity
      });
    } else {
      // Create new stock record
      await supabase
        .from('warehouse_stock')
        .insert({
          product_id: productId,
          location_id: locationId,
          quantity,
          available_quantity: quantity
        });
    }
  }

  async shipStock(productId: string, locationId: string, quantity: number, reference: string, notes?: string): Promise<void> {
    // Create movement record
    await this.createMovement({
      type: 'out',
      product_id: productId,
      from_location_id: locationId,
      quantity,
      reference,
      notes
    });

    // Update stock
    const { data: existingStock } = await supabase
      .from('warehouse_stock')
      .select('*')
      .eq('product_id', productId)
      .eq('location_id', locationId)
      .maybeSingle();

    if (existingStock && existingStock.available_quantity >= quantity) {
      await this.updateStock(existingStock.id, {
        quantity: existingStock.quantity - quantity,
        available_quantity: existingStock.available_quantity - quantity
      });
    } else {
      throw new Error('Insufficient stock available');
    }
  }
}

export const warehouseService = new WarehouseService(); 