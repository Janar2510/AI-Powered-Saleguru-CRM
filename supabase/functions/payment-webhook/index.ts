import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentWebhookData {
  gateway: 'stripe' | 'paypal';
  transaction_id: string;
  status: 'success' | 'failed' | 'pending';
  amount?: number;
  currency?: string;
  customer_email?: string;
  signature?: string;
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const body = await req.json()
    const webhookData: PaymentWebhookData = body

    // Validate webhook signature (security check)
    const isValidSignature = await validateWebhookSignature(req, webhookData)
    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update payment transaction status
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: webhookData.status === 'success' ? 'completed' : 'failed',
        gateway_response: webhookData,
        updated_at: new Date().toISOString()
      })
      .eq('reference', webhookData.transaction_id)

    if (updateError) {
      console.error('Error updating payment:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update payment status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If payment is successful, update related invoice (if exists)
    if (webhookData.status === 'success') {
      const { data: payment } = await supabase
        .from('payments')
        .select('invoice_id')
        .eq('reference', webhookData.transaction_id)
        .single()

      if (payment?.invoice_id) {
        await supabase
          .from('invoices')
          .update({ 
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.invoice_id)
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment webhook processed successfully',
        transaction_id: webhookData.transaction_id,
        status: webhookData.status
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/**
 * Validate webhook signature for security
 */
async function validateWebhookSignature(req: Request, webhookData: PaymentWebhookData): Promise<boolean> {
  try {
    const signature = req.headers.get('stripe-signature') || req.headers.get('paypal-signature')
    
    if (!signature) {
      console.warn('No signature found in webhook request')
      return false
    }

    // In a real implementation, you would validate the signature
    // For Stripe: stripe.webhooks.constructEvent(payload, signature, webhook_secret)
    // For PayPal: paypal.verifyIPN(payload, signature)
    
    // For demo purposes, we'll accept all webhooks
    // In production, always validate signatures!
    return true
  } catch (error) {
    console.error('Signature validation error:', error)
    return false
  }
} 