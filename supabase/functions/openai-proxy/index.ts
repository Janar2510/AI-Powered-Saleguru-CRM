import { serve } from "npm:@supabase/functions-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
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
    const { messages, model = "gpt-4o", temperature = 0.7, max_tokens = 1000 } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Get OpenAI API key from environment variable
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured on the server" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API error", 
          details: errorData.error?.message || "Unknown error" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status
        }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});