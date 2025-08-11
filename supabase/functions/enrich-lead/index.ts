import { serve } from "npm:@supabase/functions-js";
import { createClient } from "npm:@supabase/supabase-js";

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
    const { leadId, email, domain, type = "contact" } = await req.json();
    
    if (type === "contact" && !email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email is required for contact enrichment" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    if (type === "company" && !domain) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Domain is required for company enrichment" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Get API key from environment variable
    const apiKey = Deno.env.get("CLEARBIT_API_KEY") || Deno.env.get("PEOPLE_DATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Enrichment API key not configured on the server" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Supabase configuration missing" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update status to pending
    const tableName = type === "contact" ? "contacts" : "companies";
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        enrichment_status: "pending",
        updated_at: new Date().toISOString()
      })
      .eq("id", leadId);
    
    if (updateError) {
      console.error(`Error updating ${type} status:`, updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to update ${type} status` 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    // Call enrichment API
    let apiUrl;
    let apiHeaders = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };
    
    if (type === "contact") {
      // Using People Data API or Clearbit Person API
      apiUrl = `https://person.clearbit.com/v2/people/find?email=${encodeURIComponent(email)}`;
    } else {
      // Using Clearbit Company API
      apiUrl = `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(domain)}`;
    }
    
    console.log(`Calling enrichment API for ${type}:`, apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: apiHeaders
    });

    if (!response.ok) {
      // API call failed
      const errorData = await response.json().catch(() => ({}));
      console.error(`Enrichment API error:`, errorData);
      
      // Update status to failed
      await supabase
        .from(tableName)
        .update({
          enrichment_status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("id", leadId);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Enrichment API error: ${response.status}`,
          details: errorData
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status
        }
      );
    }

    // Process API response
    const enrichmentData = await response.json();
    
    if (!enrichmentData || Object.keys(enrichmentData).length === 0) {
      // No data found
      await supabase
        .from(tableName)
        .update({
          enrichment_status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("id", leadId);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `No enrichment data found for ${type === "contact" ? email : domain}` 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        }
      );
    }

    // Transform data based on type
    let transformedData;
    let updateData = {};
    
    if (type === "contact") {
      transformedData = {
        name: enrichmentData.name?.fullName,
        email: enrichmentData.email,
        phone: enrichmentData.phone,
        position: enrichmentData.employment?.title,
        linkedin_url: enrichmentData.linkedin?.handle 
          ? `https://linkedin.com/in/${enrichmentData.linkedin.handle}` 
          : undefined,
        twitter_url: enrichmentData.twitter?.handle 
          ? `https://twitter.com/${enrichmentData.twitter.handle}` 
          : undefined,
        location: enrichmentData.geo?.city && enrichmentData.geo?.country 
          ? `${enrichmentData.geo.city}, ${enrichmentData.geo.country}` 
          : undefined,
        bio: enrichmentData.bio,
        skills: enrichmentData.skills || [],
        education: enrichmentData.education?.map(edu => ({
          institution: edu.school,
          degree: edu.degree,
          years: edu.start && edu.end ? `${edu.start}-${edu.end}` : undefined
        })) || [],
        experience: enrichmentData.employment?.map(emp => ({
          company: emp.name,
          title: emp.title,
          years: emp.start && emp.end ? `${emp.start}-${emp.end}` : `${emp.start}-Present`
        })) || [],
        source: "Clearbit Person API"
      };
      
      // Update contact fields
      updateData = {
        name: transformedData.name || undefined,
        position: transformedData.position || undefined,
        phone: transformedData.phone || undefined,
        linkedin_url: transformedData.linkedin_url || undefined,
        twitter_url: transformedData.twitter_url || undefined,
        enrichment_data: transformedData,
        enrichment_status: "completed",
        enriched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      // Company enrichment
      transformedData = {
        name: enrichmentData.name,
        website: enrichmentData.domain ? `https://${enrichmentData.domain}` : undefined,
        industry: enrichmentData.category?.industry,
        size: enrichmentData.metrics?.employees 
          ? categorizeCompanySize(enrichmentData.metrics.employees) 
          : undefined,
        revenue: enrichmentData.metrics?.estimatedAnnualRevenue,
        founded: enrichmentData.foundedYear,
        headquarters: enrichmentData.geo?.city && enrichmentData.geo?.country 
          ? `${enrichmentData.geo.city}, ${enrichmentData.geo.country}` 
          : undefined,
        description: enrichmentData.description,
        logo_url: enrichmentData.logo,
        social_profiles: {
          linkedin: enrichmentData.linkedin?.handle 
            ? `https://linkedin.com/company/${enrichmentData.linkedin.handle}` 
            : undefined,
          twitter: enrichmentData.twitter?.handle 
            ? `https://twitter.com/${enrichmentData.twitter.handle}` 
            : undefined,
          facebook: enrichmentData.facebook?.handle 
            ? `https://facebook.com/${enrichmentData.facebook.handle}` 
            : undefined
        },
        key_people: enrichmentData.people?.map(person => ({
          name: person.name,
          position: person.title
        })) || [],
        competitors: enrichmentData.competitors || [],
        technologies: enrichmentData.tech || [],
        source: "Clearbit Company API"
      };
      
      // Update company fields
      updateData = {
        name: transformedData.name || undefined,
        industry: transformedData.industry || undefined,
        size: transformedData.size || undefined,
        description: transformedData.description || undefined,
        logo_url: transformedData.logo_url || undefined,
        linkedin_url: transformedData.social_profiles?.linkedin || undefined,
        twitter_url: transformedData.social_profiles?.twitter || undefined,
        facebook_url: transformedData.social_profiles?.facebook || undefined,
        enrichment_data: transformedData,
        enrichment_status: "completed",
        enriched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Update with enriched data
    const { error: enrichmentError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("id", leadId);

    if (enrichmentError) {
      console.error(`Error updating ${type} with enrichment data:`, enrichmentError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to update ${type} with enrichment data` 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: transformedData
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error processing enrichment request:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
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

// Helper function to categorize company size
function categorizeCompanySize(employees: number): string {
  if (employees <= 10) return "Startup (1-10)";
  if (employees <= 50) return "Small (11-50)";
  if (employees <= 200) return "Medium (51-200)";
  if (employees <= 1000) return "Large (201-1000)";
  return "Enterprise (1000+)";
}