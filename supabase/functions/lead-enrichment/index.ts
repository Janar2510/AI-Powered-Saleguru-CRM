import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

// Initialize Supabase client with service role (for any DB access if needed)
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Load OpenAI API key from environment (Supabase secret)
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

// Set CORS headers to allow requests from the front-end
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Parse input JSON (partial lead info)
    const { name, email, company, linkedinUrl } = await req.json();

    // Require at least one piece of info to enrich
    if (!name && !email && !company && !linkedinUrl) {
      return new Response(
        JSON.stringify({ error: "No input data provided for enrichment." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct a prompt for OpenAI to simulate web/LinkedIn scraping.
    // Describe any provided info and ask for missing details.
    let providedInfo = "";
    if (name) providedInfo += `Name: ${name}\n`;
    if (company) providedInfo += `Company: ${company}\n`;
    if (email) providedInfo += `Email: ${email}\n`;
    if (linkedinUrl) providedInfo += `LinkedIn: ${linkedinUrl}\n`;

    const systemPrompt = 
      "You are an AI assistant with access to professional profiles (like LinkedIn) and the web. " +
      "Enrich the lead/contact information based on the provided details. " +
      "If some fields are already given, use them and focus on finding the others. " +
      "Always respond **only** with a JSON object containing the fields: " +
      "fullName, jobTitle, linkedinUrl, companyName, location, workEmail, phoneNumber. " +
      "Do not include any explanations or extra text. Make realistic professional data.";
    
    const userPrompt = 
      `Available information:\n${providedInfo}\n` +
      "Provide the missing details (or confirm existing ones) for this person. " +
      "Output in JSON with keys: fullName, jobTitle, linkedinUrl, companyName, location, workEmail, phoneNumber.";

    // Call OpenAI API (chat completion) to get enriched data
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",       // Using GPT-4 for better accuracy
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openaiResponse.ok) {
      const err = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${err}`);
    }
    
    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices[0].message.content.trim();

    // Parse the AI response (expected to be JSON)
    let enrichedData;
    try {
      enrichedData = JSON.parse(aiContent);
    } catch (parseErr) {
      console.error("Failed to parse AI response as JSON:", aiContent);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format", rawOutput: aiContent }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return the enriched data as JSON
    return new Response(JSON.stringify(enrichedData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in lead-enrichment function:", error);
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
