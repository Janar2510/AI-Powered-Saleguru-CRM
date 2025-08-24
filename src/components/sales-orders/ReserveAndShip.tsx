'use client';
import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { 
  BrandButton, 
  BrandBadge,
  BrandCard 
} from '../../contexts/BrandDesignContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ReserveAndShipProps {
  orgId: string;
  salesOrder: { id: string; number: string; status: string };
  lines: Array<{ 
    id: string;
    product_id: string; 
    location_id: string; 
    qty: number;
    product_name?: string;
    location_name?: string;
  }>;
}

const ReserveAndShip: React.FC<ReserveAndShipProps> = ({ 
  orgId, 
  salesOrder, 
  lines 
}) => {
  const [busy, setBusy] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [shipped, setShipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reserve = async () => {
    setBusy(true);
    setError(null);
    
    try {
      const { error } = await supabase.rpc('reserve_stock', { 
        p_org: orgId, 
        p_sales_order: salesOrder.id, 
        p_lines: lines 
      });
      
      if (error) throw error;
      
      setReserved(true);
      console.log('Stock reserved successfully');
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to reserve stock:', err);
    } finally {
      setBusy(false);
    }
  };

  const ship = async () => {
    setBusy(true);
    setError(null);
    
    try {
      // Create shipment header
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert({ 
          org_id: orgId, 
          sales_order_id: salesOrder.id, 
          status: 'shipped',
          shipped_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (shipmentError) throw shipmentError;

      // Ship stock
      const { error: shipError } = await supabase.rpc('ship_stock', { 
        p_org: orgId, 
        p_shipment: shipment.id, 
        p_sales_order: salesOrder.id, 
        p_lines: lines 
      });
      
      if (shipError) throw shipError;
      
      setShipped(true);
      console.log('Stock shipped successfully');
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to ship stock:', err);
    } finally {
      setBusy(false);
    }
  };

  if (lines.length === 0) {
    return (
      <BrandCard className="p-4" borderGradient="secondary">
        <div className="text-center text-white/60">
          No items to reserve or ship
        </div>
      </BrandCard>
    );
  }

  return (
    <BrandCard className="p-6" borderGradient="primary">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Inventory Management</h3>
        <div className="flex items-center gap-2">
          {reserved && (
            <BrandBadge variant="success" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Reserved
            </BrandBadge>
          )}
          {shipped && (
            <BrandBadge variant="success" className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Shipped
            </BrandBadge>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Order Lines Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-white/80 mb-2">Order Items:</h4>
        <div className="space-y-2">
          {lines.map((line, index) => (
            <div key={line.id || index} className="flex items-center justify-between text-sm">
              <span className="text-white/70">
                {line.product_name || `Product ${line.product_id.slice(0, 8)}`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white/60">
                  {line.location_name || `Location ${line.location_id.slice(0, 8)}`}
                </span>
                <span className="text-white font-medium">
                  Qty: {line.qty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <BrandButton 
          onClick={reserve} 
          disabled={busy || reserved}
          variant={reserved ? "outline" : "primary"}
          className="flex items-center gap-2"
        >
          {busy && !reserved ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Package className="w-4 h-4" />
          )}
          {reserved ? 'Already Reserved' : 'Reserve Stock'}
        </BrandButton>
        
        <BrandButton 
          onClick={ship} 
          disabled={busy || shipped || !reserved}
          variant={shipped ? "outline" : "secondary"}
          className="flex items-center gap-2"
        >
          {busy && !shipped ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Truck className="w-4 h-4" />
          )}
          {shipped ? 'Already Shipped' : 'Ship Stock'}
        </BrandButton>
      </div>

      {/* Status Info */}
      <div className="mt-4 text-xs text-white/50">
        <p>• Reserve: Locks stock for this order</p>
        <p>• Ship: Consumes reserved stock and creates shipment record</p>
        <p>• Both operations are atomic and safe for concurrent access</p>
      </div>
    </BrandCard>
  );
};

export default ReserveAndShip;
