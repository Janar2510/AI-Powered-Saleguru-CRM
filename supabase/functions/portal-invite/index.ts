import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BASE_URL = Deno.env.get("PORTAL_BASE_URL") || "http://localhost:5173/portal";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: { 
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { 
        status: 405,
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json" 
        }
      });
    }

    const { org_id, email, company_id, contact_id, invited_by } = await req.json();
    
    if (!org_id || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields: org_id, email" }), { 
        status: 400,
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json" 
        }
      });
    }

    // Create or update portal user
    const { data: pu, error: userError } = await supabase
      .from('portal_users')
      .upsert(
        { 
          org_id, 
          email, 
          company_id: company_id || null, 
          contact_id: contact_id || null,
          status: 'active'
        }, 
        { onConflict: 'org_id,email' }
      )
      .select('id, org_id, email')
      .single();

    if (userError) {
      console.error('Error creating portal user:', userError);
      return new Response(JSON.stringify({ error: "Failed to create portal user" }), { 
        status: 500,
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json" 
        }
      });
    }

    // Generate unique token
    const token = crypto.randomUUID().replaceAll('-', '');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    // Create portal token
    const { error: tokenError } = await supabase
      .from('portal_tokens')
      .insert({ 
        token, 
        org_id, 
        portal_user_id: pu!.id, 
        expires_at: expires.toISOString() 
      });

    if (tokenError) {
      console.error('Error creating portal token:', tokenError);
      return new Response(JSON.stringify({ error: "Failed to create portal token" }), { 
        status: 500,
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json" 
        }
      });
    }

    // Create portal invitation record
    if (invited_by) {
      const { error: inviteError } = await supabase
        .from('portal_invitations')
        .insert({
          org_id,
          company_id: company_id || null,
          contact_id: contact_id || null,
          email,
          invited_by,
          token,
          expires_at: expires.toISOString()
        });

      if (inviteError) {
        console.error('Error creating invitation record:', inviteError);
        // Don't fail the whole request for this
      }
    }

    // Generate portal login link
    const link = `${BASE_URL}/login?t=${token}`;

    return new Response(JSON.stringify({ 
      success: true,
      link,
      token,
      expires_at: expires.toISOString(),
      portal_user_id: pu!.id
    }), { 
      status: 200, 
      headers: { 
        "Access-Control-Allow-Origin": "*", 
        "Content-Type": "application/json" 
      }
    });

  } catch (e) {
    console.error('Portal invite error:', e);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: String(e)
    }), { 
      status: 500, 
      headers: { 
        "Access-Control-Allow-Origin": "*", 
        "Content-Type": "application/json" 
      }
    });
  }
});
