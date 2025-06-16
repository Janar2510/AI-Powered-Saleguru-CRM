import { serve } from "npm:@supabase/functions-js";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Get request body
    const { to, cc, bcc, subject, html_body, text_body, template_id, deal_id, contact_id } = await req.json();
    
    if (!to || !subject || (!html_body && !text_body)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, and either html_body or text_body" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration is missing" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Add tracking pixel to HTML body if it exists
    let finalHtmlBody = html_body;
    const trackingId = crypto.randomUUID();
    
    if (finalHtmlBody) {
      // Add tracking pixel before the closing </body> tag
      const trackingUrl = `${supabaseUrl}/functions/v1/track-email-open?trackingId=${trackingId}`;
      const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" alt="" style="display:none" />`;
      
      if (finalHtmlBody.includes('</body>')) {
        finalHtmlBody = finalHtmlBody.replace('</body>', `${trackingPixel}</body>`);
      } else {
        finalHtmlBody = `${finalHtmlBody}${trackingPixel}`;
      }
    }

    // In a real implementation, this would use a transactional email service like SendGrid or Mailgun
    // For now, we'll just log the email and save it to the database
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Body: ${finalHtmlBody ? 'Yes' : 'No'}`);
    console.log(`Text Body: ${text_body ? 'Yes' : 'No'}`);
    
    // Save the email to the database
    const { data: email, error: emailError } = await supabase
      .from("emails")
      .insert({
        to,
        cc,
        bcc,
        subject,
        html_body: finalHtmlBody,
        text_body,
        template_id,
        deal_id,
        contact_id,
        tracking_id: trackingId,
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_by: user?.id
      })
      .select()
      .single();
    
    if (emailError) {
      console.error("Error saving email:", emailError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to save email", 
          details: emailError.message
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
    
    // Log the send event
    const { error: eventError } = await supabase
      .from("email_events")
      .insert({
        email_id: email.id,
        event_type: 'send',
        metadata: {
          user_id: user?.id,
          timestamp: new Date().toISOString()
        }
      });
    
    if (eventError) {
      console.error("Error logging email event:", eventError);
    }
    
    // If the email is related to a deal, update the deal
    if (deal_id) {
      const { error: dealError } = await supabase
        .from("deals")
        .update({ 
          emails_count: supabase.rpc('increment_counter', { 
            row_id: deal_id, 
            table_name: 'deals', 
            counter_column: 'emails_count' 
          }),
          last_email_status: 'sent',
          lastActivity: 'Email sent',
          updated_at: new Date().toISOString()
        })
        .eq("id", deal_id);
      
      if (dealError) {
        console.error("Error updating deal:", dealError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        email: {
          id: email.id,
          to,
          subject,
          sent_at: email.sent_at,
          tracking_id: trackingId
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email", 
        details: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});