import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { html, format, documentId, userId } = await req.json()

    if (!html) {
      throw new Error('HTML content is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let response: Response

    switch (format) {
      case 'html':
        response = new Response(html, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename=document.html`,
            ...corsHeaders
          }
        })
        break

      case 'pdf':
        // For PDF generation, you would typically use a service like Puppeteer
        // For now, we'll return a mock PDF response
        response = new Response('PDF content would be generated here', {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=document.pdf`,
            ...corsHeaders
          }
        })
        break

      case 'docx':
        // For DOCX generation, you would typically use a library like docx
        // For now, we'll return a mock DOCX response
        response = new Response('DOCX content would be generated here', {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=document.docx`,
            ...corsHeaders
          }
        })
        break

      default:
        throw new Error(`Unsupported format: ${format}`)
    }

    // Log the document generation if documentId is provided
    if (documentId && userId) {
      try {
        await supabase
          .from('documents')
          .update({
            metadata: {
              last_exported: new Date().toISOString(),
              export_format: format
            }
          })
          .eq('id', documentId)
          .eq('user_id', userId)
      } catch (error) {
        console.error('Failed to update document metadata:', error)
      }
    }

    return response

  } catch (error) {
    console.error('Error generating document:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
}) 