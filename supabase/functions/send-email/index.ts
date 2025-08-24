import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  dealId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  from: string;
  templateId?: string;
  scheduledAt?: string;
  attachments?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request
    const emailData: EmailRequest = await req.json();
    const { dealId, to, cc, bcc, subject, body, from, templateId, scheduledAt, attachments } = emailData;

    // Validate required fields
    if (!dealId || !to || to.length === 0 || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: dealId, to, subject, body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get deal information for context
    const { data: deal, error: dealError } = await supabaseClient
      .from('deals')
      .select(`
        *,
        contact:contacts(name, email),
        organization:organizations(name)
      `)
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return new Response(
        JSON.stringify({ error: 'Deal not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare email content
    let finalBody = body;
    let finalSubject = subject;

    // If using a template, merge template with provided data
    if (templateId) {
      const { data: template } = await supabaseClient
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (template) {
        finalSubject = template.subject || subject;
        finalBody = template.body || body;
        
        // Replace template variables
        const variables = {
          '{deal_title}': deal.title,
          '{deal_value}': deal.value,
          '{contact_name}': deal.contact?.name || '',
          '{organization_name}': deal.organization?.name || '',
          '{user_name}': from,
        };

        Object.entries(variables).forEach(([key, value]) => {
          finalSubject = finalSubject.replace(new RegExp(key, 'g'), String(value));
          finalBody = finalBody.replace(new RegExp(key, 'g'), String(value));
        });
      }
    }

    // Prepare email payload for your email service
    // This example uses a generic structure - adapt to your email provider (SendGrid, Resend, etc.)
    const emailPayload = {
      from: {
        email: from,
        name: 'CRM System'
      },
      to: to.map(email => ({ email })),
      cc: cc?.map(email => ({ email })) || [],
      bcc: bcc?.map(email => ({ email })) || [],
      subject: finalSubject,
      html: finalBody,
      text: finalBody.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      custom_args: {
        deal_id: dealId,
        sent_from: 'crm_deal_detail'
      }
    };

    // Send email using your preferred service
    // Example using fetch to an email service API:
    const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL');
    const emailServiceKey = Deno.env.get('EMAIL_SERVICE_API_KEY');

    let messageId = `mock-message-${Date.now()}`;

    if (emailServiceUrl && emailServiceKey) {
      try {
        const emailResponse = await fetch(emailServiceUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        });

        if (!emailResponse.ok) {
          throw new Error(`Email service responded with ${emailResponse.status}`);
        }

        const emailResult = await emailResponse.json();
        messageId = emailResult.id || emailResult.message_id || messageId;
      } catch (emailError) {
        console.error('Email service error:', emailError);
        
        // If scheduled, store for retry
        if (scheduledAt) {
          await supabaseClient
            .from('email_queue')
      .insert({
              deal_id: dealId,
              to_addresses: to,
              cc_addresses: cc || [],
              bcc_addresses: bcc || [],
              subject: finalSubject,
              body: finalBody,
              scheduled_at: scheduledAt,
              status: 'failed',
              error_message: emailError.message,
              retry_count: 0,
              max_retries: 3,
            });

      return new Response(
        JSON.stringify({ 
              error: 'Email service temporarily unavailable. Email queued for retry.',
              messageId: null
            }),
            { 
              status: 202,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        throw emailError;
      }
    } else {
      // Mock mode for development
      console.log('Mock email sent:', emailPayload);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Log successful email in database
    const { error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        deal_id: dealId,
        message_id: messageId,
        to_addresses: to,
        cc_addresses: cc || [],
        bcc_addresses: bcc || [],
        subject: finalSubject,
        body: finalBody,
        status: 'sent',
        sent_at: new Date().toISOString(),
        template_id: templateId,
      });

    if (logError) {
      console.error('Error logging email:', logError);
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId,
        sentTo: to,
        subject: finalSubject,
        sentAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Email function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/* 
DEPLOYMENT NOTES:

1. Set environment variables in Supabase:
   - EMAIL_SERVICE_URL: Your email service API endpoint
   - EMAIL_SERVICE_API_KEY: Your email service API key

2. Create supporting tables:

-- Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Email Logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id),
  message_id TEXT,
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[] DEFAULT '{}',
  bcc_addresses TEXT[] DEFAULT '{}',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  template_id UUID REFERENCES email_templates(id),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Queue (for scheduled/retry emails)
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id),
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[] DEFAULT '{}',
  bcc_addresses TEXT[] DEFAULT '{}',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

3. Deploy function:
   supabase functions deploy send-email

4. Example email service integrations:
   - SendGrid: https://api.sendgrid.com/v3/mail/send
   - Resend: https://api.resend.com/emails
   - Postmark: https://api.postmarkapp.com/email
*/