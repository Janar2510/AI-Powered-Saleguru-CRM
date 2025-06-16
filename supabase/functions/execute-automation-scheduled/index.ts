import { serve } from "npm:@supabase/functions-js";
import { createClient } from "npm:@supabase/supabase-js";

// This function is designed to be called on a schedule
// It will check for time-based automations and overdue tasks

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Supabase configuration missing" 
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 500
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Check for time-based automations
    const timeBasedResult = await supabase.functions.invoke('execute-automation', {
      body: {
        triggerType: 'time_based',
        triggerData: {
          timestamp: new Date().toISOString(),
          scheduled: true
        }
      }
    });
    
    // 2. Check for overdue tasks
    const taskOverdueResult = await supabase.functions.invoke('execute-automation', {
      body: {
        triggerType: 'task_deadline_missed',
        triggerData: {
          timestamp: new Date().toISOString(),
          scheduled: true
        }
      }
    });
    
    // Return combined results
    return new Response(
      JSON.stringify({
        success: true,
        timeBasedAutomations: timeBasedResult.data,
        taskOverdueAutomations: taskOverdueResult.data,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error executing scheduled automations:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to execute scheduled automations", 
        details: error.message 
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});