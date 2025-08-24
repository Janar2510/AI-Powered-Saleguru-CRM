'use client';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { 
  BrandButton, 
  BrandBadge 
} from '../../contexts/BrandDesignContext';
import { 
  ArrowRight, 
  FileText, 
  ShoppingCart, 
  Receipt,
  Loader2
} from 'lucide-react';

interface DealToolbarProps {
  dealId: string;
  quoteId?: string | null;
  proformaId?: string | null;
  salesOrderId?: string | null;
}

const DealToolbar: React.FC<DealToolbarProps> = ({ 
  dealId, 
  quoteId, 
  proformaId, 
  salesOrderId 
}) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string>('');

  const run = async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    try { 
      await fn(); 
      // Show success toast or notification
      console.log(`${name} completed successfully`);
    } catch (e: any) { 
      console.error(`${name} failed:`, e.message);
      // Show error toast or notification
    }
    setBusy('');
  };

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/80">Document Flow:</span>
        <BrandBadge variant="info" className="text-xs">
          {quoteId ? 'Quote' : 'No Quote'} 
          {proformaId && ' → Pro Forma'} 
          {salesOrderId && ' → Sales Order'} 
          {salesOrderId && ' → Invoice'}
        </BrandBadge>
      </div>

      <div className="flex flex-wrap gap-2">
        {quoteId && (
          <BrandButton 
            disabled={busy !== ''}
            onClick={() => run('Quote → Pro Forma', async () => {
              const { data, error } = await supabase.rpc('quote_to_proforma', { p_quote: quoteId });
              if (error) throw error;
              navigate(`/proformas/${data}`);
            })}
            className="flex items-center gap-2"
          >
            {busy === 'Quote → Pro Forma' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            Quote → Pro Forma
          </BrandButton>
        )}

        {proformaId && (
          <BrandButton 
            disabled={busy !== ''}
            onClick={() => run('Pro Forma → Sales Order', async () => {
              const { data, error } = await supabase.rpc('proforma_to_sales_order', { p_proforma: proformaId });
              if (error) throw error;
              navigate(`/sales-orders/${data}`);
            })}
            className="flex items-center gap-2"
          >
            {busy === 'Pro Forma → Sales Order' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            Pro Forma → Sales Order
          </BrandButton>
        )}

        {salesOrderId && (
          <BrandButton 
            disabled={busy !== ''}
            onClick={() => run('Sales Order → Invoice', async () => {
              const { data, error } = await supabase.rpc('sales_order_to_invoice', { p_sales_order: salesOrderId });
              if (error) throw error;
              navigate(`/invoices/${data}`);
            })}
            className="flex items-center gap-2"
          >
            {busy === 'Sales Order → Invoice' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            Sales Order → Invoice
          </BrandButton>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {quoteId && (
          <BrandButton 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/quotes/${quoteId}`)}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Quote
          </BrandButton>
        )}
        
        {proformaId && (
          <BrandButton 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/proformas/${proformaId}`)}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Pro Forma
          </BrandButton>
        )}
        
        {salesOrderId && (
          <BrandButton 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/sales-orders/${salesOrderId}`)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Sales Order
          </BrandButton>
        )}
      </div>
    </div>
  );
};

export default DealToolbar;
