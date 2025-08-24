// Stripe webhook (persist payments + journals auto-post)
// Edge Function — supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "npm:stripe@12.16.0";
import { createClient } from "npm:@supabase/supabase-js@2.43.4";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const sig = req.headers.get("stripe-signature") || req.headers.get("Stripe-Signature") || "";
    const raw = await req.arrayBuffer();
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(Buffer.from(raw), sig, WEBHOOK_SECRET);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Signature verification failed: ${String(err)}` }), 
        { 
          status: 400, 
          headers: { ...cors, "Content-Type": "application/json" }
        }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const amount_cents = session.amount_total;
      const currency = session.currency?.toUpperCase() || "EUR";
      
      // You set invoiceNumber in metadata when creating the session
      const meta = session.metadata || {};
      const invoiceNumber = meta.invoiceNumber || meta.invoice_number;

      if (invoiceNumber) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('id, org_id, company_id, status')
          .eq('number', invoiceNumber)
          .single();
          
        if (invoice) {
          // Insert payment (posting trigger will create journals)
          await supabase.from('payments').insert({
            org_id: invoice.org_id,
            invoice_id: invoice.id,
            method: 'card',
            provider: 'stripe',
            provider_ref: session.id,
            amount_cents,
            currency,
            paid_at: new Date().toISOString()
          });

          // Optionally mark invoice status
          if (invoice.status !== 'paid') {
            await supabase
              .from('invoices')
              .update({ status: 'paid' })
              .eq('id', invoice.id);
          }
        }
      }
    }

    if (event.type === "payment_intent.succeeded") {
      // Optional: handle non-checkout flows similarly
      const paymentIntent = event.data.object as any;
      console.log('Payment intent succeeded:', paymentIntent.id);
    }

    return new Response(
      JSON.stringify({ received: true }), 
      { 
        status: 200, 
        headers: { ...cors, "Content-Type": "application/json" }
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: String(e?.message || e) }), 
      { 
        status: 500, 
        headers: { ...cors, "Content-Type": "application/json" }
      }
    );
  }
});
