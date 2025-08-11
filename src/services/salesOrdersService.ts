import { supabase } from './supabase';

export interface SalesOrder {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  order_date: string;
  status: 'draft' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
}

class SalesOrdersService {
  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSalesOrderById(id: string): Promise<SalesOrder | null> {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createSalesOrder(order: Omit<SalesOrder, 'id' | 'created_at' | 'updated_at'>): Promise<SalesOrder> {
    const { data, error } = await supabase
      .from('sales_orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSalesOrder(id: string, updates: Partial<SalesOrder>): Promise<SalesOrder> {
    const { data, error } = await supabase
      .from('sales_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSalesOrder(id: string): Promise<void> {
    const { error } = await supabase
      .from('sales_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<SalesOrderItem[]> {
    const { data, error } = await supabase
      .from('sales_order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addOrderItem(item: Omit<SalesOrderItem, 'id' | 'created_at'>): Promise<SalesOrderItem> {
    const { data, error } = await supabase
      .from('sales_order_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrderItem(id: string, updates: Partial<SalesOrderItem>): Promise<SalesOrderItem> {
    const { data, error } = await supabase
      .from('sales_order_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeOrderItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('sales_order_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Order Operations
  async confirmOrder(orderId: string): Promise<void> {
    await this.updateSalesOrder(orderId, {
      status: 'confirmed'
    });
  }

  async startProduction(orderId: string): Promise<void> {
    await this.updateSalesOrder(orderId, {
      status: 'in_production'
    });
  }

  async shipOrder(orderId: string): Promise<void> {
    await this.updateSalesOrder(orderId, {
      status: 'shipped'
    });
  }

  async deliverOrder(orderId: string): Promise<void> {
    await this.updateSalesOrder(orderId, {
      status: 'delivered'
    });
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.updateSalesOrder(orderId, {
      status: 'cancelled'
    });
  }

  // Payment Operations
  async recordPayment(orderId: string, amount: number, paymentMethod: string): Promise<void> {
    const order = await this.getSalesOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const newTotalPaid = (order.total_amount || 0) + amount;
    const paymentStatus = newTotalPaid >= order.total_amount ? 'paid' : 'partial';

    await this.updateSalesOrder(orderId, {
      payment_status: paymentStatus
    });
  }

  // Analytics
  async getSalesAnalytics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
  }> {
    const orders = await this.getSalesOrders();
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus
    };
  }

  // Convert from Quotation
  async createFromQuotation(quotationId: string): Promise<SalesOrder> {
    // Get quotation data (this would need to be implemented based on your quotation structure)
    const quotation = await this.getQuotationById(quotationId);
    if (!quotation) throw new Error('Quotation not found');

    // Create sales order from quotation
    const salesOrder = await this.createSalesOrder({
      order_number: `SO${Date.now()}`,
      customer_name: quotation.customer_name || 'Unknown Customer',
      order_date: new Date().toISOString().split('T')[0],
      status: 'draft',
      payment_status: 'pending',
      subtotal: quotation.subtotal || 0,
      tax_amount: quotation.tax_amount || 0,
      total_amount: quotation.total_amount || 0,
      currency: quotation.currency || 'EUR',
      notes: `Converted from quotation ${quotation.quotation_number}`
    });

    return salesOrder;
  }

  private async getQuotationById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}

export const salesOrdersService = new SalesOrdersService(); 