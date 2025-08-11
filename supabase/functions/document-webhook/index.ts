import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentWebhookData {
  document_id: string;
  customer_id: string;
  template_id: string;
  format: 'pdf' | 'html';
  action: 'generate' | 'download' | 'preview';
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const body = await req.json()
    const webhookData: DocumentWebhookData = body

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify document belongs to customer (security check)
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', webhookData.document_id)
      .eq('partner_id', webhookData.customer_id)
      .single()

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: 'Document not found or access denied' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', webhookData.template_id)
      .single()

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Process document based on action
    let result: any = {}

    switch (webhookData.action) {
      case 'generate':
        result = await generateDocument(document, template, webhookData.format)
        break
      case 'download':
        result = await downloadDocument(document, template, webhookData.format)
        break
      case 'preview':
        result = await previewDocument(document, template)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document processed successfully',
        data: result
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Document webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/**
 * Generate document using QWeb template
 */
async function generateDocument(document: any, template: any, format: string) {
  try {
    // Render QWeb template
    const htmlContent = await renderQWebTemplate(template, document)
    
    if (format === 'pdf') {
      // Generate PDF
      const pdfUrl = await generatePDFFromHTML(htmlContent, document.id)
      return {
        download_url: pdfUrl,
        format: 'pdf'
      }
    } else {
      // Return HTML
      return {
        html_content: htmlContent,
        format: 'html'
      }
    }
  } catch (error) {
    console.error('Error generating document:', error)
    throw error
  }
}

/**
 * Download document
 */
async function downloadDocument(document: any, template: any, format: string) {
  try {
    const htmlContent = await renderQWebTemplate(template, document)
    
    if (format === 'pdf') {
      const pdfUrl = await generatePDFFromHTML(htmlContent, document.id)
      return {
        download_url: pdfUrl,
        filename: `${document.name}.pdf`
      }
    } else {
      return {
        download_url: `/api/documents/${document.id}/download.html`,
        filename: `${document.name}.html`
      }
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    throw error
  }
}

/**
 * Preview document
 */
async function previewDocument(document: any, template: any) {
  try {
    const htmlContent = await renderQWebTemplate(template, document)
    return {
      preview_url: `/api/documents/${document.id}/preview`,
      html_content: htmlContent
    }
  } catch (error) {
    console.error('Error previewing document:', error)
    throw error
  }
}

/**
 * Render QWeb template (Odoo QWeb engine equivalent)
 */
async function renderQWebTemplate(template: any, document: any): Promise<string> {
  try {
    // Parse QWeb template content
    let templateContent = template.content
    
    // Replace template variables with document data
    templateContent = templateContent.replace(/\{\{ document\.name \}\}/g, document.name)
    templateContent = templateContent.replace(/\{\{ document\.date \}\}/g, document.date)
    templateContent = templateContent.replace(/\{\{ document\.type \}\}/g, document.type)
    
    if (document.amount) {
      templateContent = templateContent.replace(/\{\{ document\.amount \}\}/g, document.amount.toString())
    }
    
    if (document.currency) {
      templateContent = templateContent.replace(/\{\{ document\.currency \}\}/g, document.currency)
    }

    // Add template styling
    const styledContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${document.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #a259ff;
            padding-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #a259ff;
          }
          .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-paid { background: #43e7ad; color: white; }
          .status-pending { background: #ff6b6b; color: white; }
          .status-draft { background: #b0b0d0; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${document.name}</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="content">
          ${templateContent}
        </div>
        
        <div class="footer">
          <p>This document was generated using the ${template.style} template</p>
        </div>
      </body>
      </html>
    `

    return styledContent
  } catch (error) {
    console.error('Error rendering QWeb template:', error)
    throw error
  }
}

/**
 * Generate PDF from HTML (wkhtmltopdf equivalent)
 */
async function generatePDFFromHTML(htmlContent: string, documentId: string): Promise<string> {
  try {
    // In a real implementation, this would use a PDF generation library
    // like puppeteer, jsPDF, or a server-side PDF service
    
    // For demo purposes, we'll simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return a mock PDF URL
    return `/api/documents/${documentId}/download.pdf`
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
} 