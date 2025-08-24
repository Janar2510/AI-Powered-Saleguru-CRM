import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useCommercial } from '../../hooks/useCommercial';
import { useAuth } from '../../contexts/AuthContext';

export function DealCommercialPanel({ dealId }: { dealId: string }) {
  const { profile } = useAuth();
  const orgId = profile?.org_id || 'temp-org';
  const { data, isLoading, createQuote, quoteToSO, soToInvoice } = useCommercial(orgId, dealId);

  if (isLoading) return <div className="p-3">Loading…</div>;

  return (
    <Card className="p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Button onClick={()=>createQuote.mutate({ items: [] })}>Create Quote</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <div className="font-medium mb-1">Quotes</div>
          <div className="space-y-2">
            {(data?.quotes||[]).map(q => (
              <div key={q.id} className="flex items-center justify-between text-sm border rounded p-2">
                <span>{q.number} • {q.status}</span>
                <Button size="sm" variant="outline" onClick={()=>quoteToSO.mutate(q.id)}>To Sales Order</Button>
              </div>
            ))}
            {(!data?.quotes || data.quotes.length===0) && <div className="text-xs opacity-70">No quotes yet.</div>}
          </div>
        </div>

        <div>
          <div className="font-medium mb-1">Sales Orders</div>
          <div className="space-y-2">
            {(data?.orders||[]).map(o => (
              <div key={o.id} className="flex items-center justify-between text-sm border rounded p-2">
                <span>{o.number} • {o.status}</span>
                <Button size="sm" variant="outline" onClick={()=>soToInvoice.mutate(o.id)}>To Invoice</Button>
              </div>
            ))}
            {(!data?.orders || data.orders.length===0) && <div className="text-xs opacity-70">No sales orders yet.</div>}
          </div>
        </div>

        <div>
          <div className="font-medium mb-1">Invoices</div>
          <div className="space-y-2">
            {(data?.invoices||[]).map(i => (
              <div key={i.id} className="flex items-center justify-between text-sm border rounded p-2">
                <span>{i.number} • {i.status}</span>
                <Button size="sm" variant="outline">Open</Button>
              </div>
            ))}
            {(!data?.invoices || data.invoices.length===0) && <div className="text-xs opacity-70">No invoices yet.</div>}
          </div>
        </div>
      </div>
    </Card>
  );
}
