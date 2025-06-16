import { serve } from "npm:@supabase/functions-js";
import { google } from "npm:googleapis";

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
    const { dealId, dealName } = await req.json();
    
    if (!dealId || !dealName) {
      return new Response(
        JSON.stringify({ error: "dealId and dealName are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Get Google Drive API credentials from environment variables
    const serviceAccountKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    const parentFolderId = Deno.env.get("GOOGLE_DRIVE_PARENT_FOLDER_ID") || "root";
    
    if (!serviceAccountKey) {
      console.error("Google Service Account key not found in environment variables");
      
      // Fallback to mock implementation if credentials are missing
      console.log(`Creating mock folder for deal: ${dealName} (ID: ${dealId})`);
      const folderUrl = `https://drive.google.com/drive/folders/${dealId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          folderUrl,
          dealId,
          dealName,
          created: new Date().toISOString(),
          mock: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    // Parse the service account key
    const serviceAccount = JSON.parse(serviceAccountKey);

    // Set up Google Drive API client
    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      undefined,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive.file']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Create folder name with deal ID for uniqueness
    const folderName = `Deal ${dealId} - ${dealName}`;

    // Create folder in Google Drive
    const folderResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId]
      },
      fields: 'id, webViewLink'
    });

    const folderId = folderResponse.data.id;
    const folderUrl = folderResponse.data.webViewLink;

    if (!folderId || !folderUrl) {
      throw new Error("Failed to get folder ID or URL from Google Drive response");
    }

    // Return success response with folder URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        folderUrl,
        folderId,
        dealId,
        dealName,
        created: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error creating deal folder:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to create deal folder",
        details: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});