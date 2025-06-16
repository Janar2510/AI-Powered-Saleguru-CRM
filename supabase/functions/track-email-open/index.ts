import { serve } from "npm:@supabase/functions-js";
import { createClient } from "npm:@supabase/supabase-js";

// 1x1 transparent GIF in base64
const TRANSPARENT_GIF_BASE64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

serve(async (req) => {
  // No CORS headers needed for image requests
  const headers = {
    "Content-Type": "image/gif",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };

  try {
    // Parse the URL to get query parameters
    const url = new URL(req.url);
    const emailId = url.searchParams.get("emailId");
    const trackingId = url.searchParams.get("trackingId");
    const dealId = url.searchParams.get("dealId");
    
    // We need at least one identifier
    if (!emailId && !trackingId && !dealId) {
      console.error("No tracking identifiers provided");
      return new Response(Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'), { headers });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase configuration is missing");
      return new Response(Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'), { headers });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the email by ID or tracking ID
    let email;
    
    if (emailId) {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("id", emailId)
        .single();
      
      if (error) {
        console.error("Error fetching email by ID:", error);
      } else {
        email = data;
      }
    } else if (trackingId) {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("tracking_id", trackingId)
        .single();
      
      if (error) {
        console.error("Error fetching email by tracking ID:", error);
      } else {
        email = data;
      }
    }

    // If we found an email, update its status
    if (email) {
      // Update email status to 'opened' if not already
      if (email.status !== 'opened') {
        const { error: updateError } = await supabase
          .from("emails")
          .update({ 
            status: 'opened',
            opened_at: new Date().toISOString()
          })
          .eq("id", email.id);
        
        if (updateError) {
          console.error("Error updating email status:", updateError);
        }
        
        // Log the open event
        const { error: eventError } = await supabase
          .from("email_events")
          .insert({
            email_id: email.id,
            event_type: 'open',
            metadata: {
              user_agent: req.headers.get("User-Agent"),
              ip: req.headers.get("X-Forwarded-For") || req.headers.get("CF-Connecting-IP"),
              timestamp: new Date().toISOString()
            }
          });
        
        if (eventError) {
          console.error("Error logging email event:", eventError);
        }
      }
      
      // If the email is related to a deal, update the deal
      if (email.deal_id) {
        const { error: dealError } = await supabase
          .from("deals")
          .update({ 
            last_email_status: 'opened',
            lastActivity: 'Email opened',
            updated_at: new Date().toISOString()
          })
          .eq("id", email.deal_id);
        
        if (dealError) {
          console.error("Error updating deal:", dealError);
        }
      }
    } 
    // If we have a deal ID but no email, update the deal directly
    else if (dealId) {
      const { error: dealError } = await supabase
        .from("deals")
        .update({ 
          last_email_status: 'opened',
          lastActivity: 'Email opened',
          updated_at: new Date().toISOString()
        })
        .eq("id", dealId);
      
      if (dealError) {
        console.error("Error updating deal:", dealError);
      }
    }

    // Return a transparent 1x1 GIF
    return new Response(Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'), { headers });
  } catch (error) {
    console.error("Error processing email open tracking:", error);
    return new Response(Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'), { headers });
  }
});