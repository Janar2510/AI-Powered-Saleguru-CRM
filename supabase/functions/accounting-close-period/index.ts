import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.43.4";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

interface ClosePeriodRequest {
  org_id: string;
  period_id: string;
}

serve(async (req) => {
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
    const { org_id, period_id }: ClosePeriodRequest = await req.json();

    if (!org_id || !period_id) {
      throw new Error("org_id and period_id are required");
    }

    // Verify the period exists and is open
    const { data: period, error: periodError } = await supabase
      .from('acc_periods')
      .select('*')
      .eq('id', period_id)
      .eq('org_id', org_id)
      .single();

    if (periodError) {
      throw new Error(`Period not found: ${periodError.message}`);
    }

    if (period.status !== 'open') {
      throw new Error(`Period ${period.code} is not open (status: ${period.status})`);
    }

    // Call the period close function
    const { data: result, error: closeError } = await supabase
      .rpc('acc_close_period', {
        p_period_id: period_id,
        p_org: org_id
      });

    if (closeError) {
      throw new Error(`Failed to close period: ${closeError.message}`);
    }

    // Get the updated period status
    const { data: updatedPeriod, error: updateError } = await supabase
      .from('acc_periods')
      .select('*')
      .eq('id', period_id)
      .single();

    if (updateError) {
      console.warn('Could not fetch updated period:', updateError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Period ${period.code} closed successfully`,
        journal_id: result,
        period: updatedPeriod || period,
        closed_at: new Date().toISOString()
      }), 
      { 
        status: 200, 
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json"
        }
      }
    );

  } catch (e: any) {
    console.error('Period close error:', e);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: String(e?.message || e) 
      }), 
      { 
        status: 500, 
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json"
        }
      }
    );
  }
});

