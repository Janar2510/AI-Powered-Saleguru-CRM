// Marketplace Payments Edge Function
// Handle Stripe payments for marketplace app subscriptions and purchases

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "npm:stripe@12.16.0";
import { createClient } from "npm:@supabase/supabase-js@2.43.4";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

interface CreatePaymentIntentRequest {
  appId: string;
  orgId: string;
  amount: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly' | 'one_time';
  trialDays?: number;
}

interface CreateSubscriptionRequest {
  appId: string;
  orgId: string;
  userId: string;
  priceId: string;
  paymentMethodId: string;
  trialDays?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Create payment intent for one-time purchases
    if (path === "/create-payment-intent" && req.method === "POST") {
      const body: CreatePaymentIntentRequest = await req.json();
      
      // Fetch app details
      const { data: app, error: appError } = await supabase
        .from('marketplace_apps')
        .select('*')
        .eq('id', body.appId)
        .single();

      if (appError || !app) {
        return new Response(
          JSON.stringify({ error: "App not found" }),
          { status: 404, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: body.amount,
        currency: body.currency.toLowerCase(),
        metadata: {
          app_id: body.appId,
          org_id: body.orgId,
          app_name: app.name,
          billing_period: body.billingPeriod
        },
        description: `Purchase ${app.name} - ${body.billingPeriod}`,
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Record payment in database
      await supabase.from('app_payments').insert({
        app_id: body.appId,
        org_id: body.orgId,
        amount_cents: body.amount,
        currency: body.currency,
        billing_period: body.billingPeriod,
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id
      });

      return new Response(
        JSON.stringify({
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id
        }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Create subscription for recurring payments
    if (path === "/create-subscription" && req.method === "POST") {
      const body: CreateSubscriptionRequest = await req.json();

      // Fetch app details
      const { data: app, error: appError } = await supabase
        .from('marketplace_apps')
        .select('*')
        .eq('id', body.appId)
        .single();

      if (appError || !app) {
        return new Response(
          JSON.stringify({ error: "App not found" }),
          { status: 404, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }

      // Create or retrieve customer
      let customer;
      const { data: existingPayment } = await supabase
        .from('app_payments')
        .select('stripe_subscription_id')
        .eq('org_id', body.orgId)
        .not('stripe_subscription_id', 'is', null)
        .limit(1)
        .single();

      if (existingPayment?.stripe_subscription_id) {
        const subscription = await stripe.subscriptions.retrieve(existingPayment.stripe_subscription_id);
        customer = await stripe.customers.retrieve(subscription.customer as string);
      } else {
        customer = await stripe.customers.create({
          metadata: {
            org_id: body.orgId,
            user_id: body.userId
          }
        });
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(body.paymentMethodId, {
        customer: customer.id
      });

      // Set as default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: body.paymentMethodId
        }
      });

      // Create subscription
      const subscriptionData: any = {
        customer: customer.id,
        items: [{ price: body.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          app_id: body.appId,
          org_id: body.orgId,
          user_id: body.userId,
          app_name: app.name
        }
      };

      if (body.trialDays && body.trialDays > 0) {
        subscriptionData.trial_period_days = body.trialDays;
      }

      const subscription = await stripe.subscriptions.create(subscriptionData);

      // Record subscription in database
      await supabase.from('app_payments').insert({
        app_id: body.appId,
        org_id: body.orgId,
        user_id: body.userId,
        subscription_id: subscription.id,
        amount_cents: app.price_monthly || 0,
        currency: 'EUR',
        billing_period: 'monthly',
        status: subscription.status === 'active' || subscription.status === 'trialing' ? 'completed' : 'pending',
        stripe_subscription_id: subscription.id,
        payment_method: body.paymentMethodId
      });

      // Install app if subscription is active
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        await supabase.from('installed_apps').insert({
          app_id: body.appId,
          org_id: body.orgId,
          user_id: body.userId,
          status: 'active',
          subscription_id: subscription.id,
          trial_ends_at: body.trialDays ? 
            new Date(Date.now() + body.trialDays * 24 * 60 * 60 * 1000).toISOString() : 
            null
        });
      }

      return new Response(
        JSON.stringify({
          subscription_id: subscription.id,
          client_secret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          status: subscription.status
        }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Cancel subscription
    if (path === "/cancel-subscription" && req.method === "POST") {
      const { subscriptionId, orgId } = await req.json();

      // Verify ownership
      const { data: payment } = await supabase
        .from('app_payments')
        .select('*')
        .eq('stripe_subscription_id', subscriptionId)
        .eq('org_id', orgId)
        .single();

      if (!payment) {
        return new Response(
          JSON.stringify({ error: "Subscription not found" }),
          { status: 404, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }

      // Cancel subscription at period end
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      // Update payment record
      await supabase
        .from('app_payments')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subscriptionId);

      // Deactivate installed app
      await supabase
        .from('installed_apps')
        .update({ status: 'inactive' })
        .eq('subscription_id', subscriptionId);

      return new Response(
        JSON.stringify({ success: true, cancel_at: subscription.cancel_at }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Get payment status
    if (path === "/payment-status" && req.method === "GET") {
      const paymentIntentId = url.searchParams.get("payment_intent_id");
      
      if (!paymentIntentId) {
        return new Response(
          JSON.stringify({ error: "Payment intent ID required" }),
          { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Update payment status in database
      if (paymentIntent.status === 'succeeded') {
        await supabase
          .from('app_payments')
          .update({ status: 'completed' })
          .eq('stripe_payment_intent_id', paymentIntentId);

        // Install app
        const { app_id, org_id } = paymentIntent.metadata;
        if (app_id && org_id) {
          await supabase.from('installed_apps').insert({
            app_id,
            org_id,
            user_id: org_id, // Fallback to org_id
            status: 'active'
          });
        }
      }

      return new Response(
        JSON.stringify({ 
          status: paymentIntent.status,
          metadata: paymentIntent.metadata 
        }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Webhook handler for Stripe events
    if (path === "/webhook" && req.method === "POST") {
      const signature = req.headers.get("stripe-signature");
      const body = await req.arrayBuffer();
      
      if (!signature) {
        return new Response("No signature", { status: 400, headers: cors });
      }

      try {
        const event = stripe.webhooks.constructEvent(
          Buffer.from(body),
          signature,
          Deno.env.get("STRIPE_WEBHOOK_SECRET")!
        );

        switch (event.type) {
          case 'invoice.payment_succeeded':
            const invoice = event.data.object as any;
            if (invoice.subscription) {
              await supabase
                .from('app_payments')
                .update({ status: 'completed' })
                .eq('stripe_subscription_id', invoice.subscription);
            }
            break;

          case 'invoice.payment_failed':
            const failedInvoice = event.data.object as any;
            if (failedInvoice.subscription) {
              await supabase
                .from('app_payments')
                .update({ status: 'failed' })
                .eq('stripe_subscription_id', failedInvoice.subscription);
              
              // Deactivate app
              await supabase
                .from('installed_apps')
                .update({ status: 'error' })
                .eq('subscription_id', failedInvoice.subscription);
            }
            break;

          case 'customer.subscription.deleted':
            const deletedSub = event.data.object as any;
            await supabase
              .from('app_payments')
              .update({ status: 'cancelled' })
              .eq('stripe_subscription_id', deletedSub.id);
            
            await supabase
              .from('installed_apps')
              .update({ status: 'inactive' })
              .eq('subscription_id', deletedSub.id);
            break;
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error('Webhook error:', err);
        return new Response(`Webhook error: ${err.message}`, {
          status: 400,
          headers: cors
        });
      }
    }

    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      { status: 404, headers: { ...cors, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});

