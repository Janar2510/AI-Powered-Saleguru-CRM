import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RUNNER_URL = Deno.env.get("AUTOMATION_RUNNER_URL") || "http://localhost:54321/functions/v1/automation-runner";

serve(async (_req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  try {
    // Simply forward to runner to process both events & due delays
    const response = await fetch(RUNNER_URL, { 
      method: 'POST', 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ mode: 'all' }) 
    });
    
    const result = await response.json();
    
    return new Response(JSON.stringify({ 
      scheduled: true, 
      runner_result: result 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ 
      error: String(e?.message || e),
      scheduled: false 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
