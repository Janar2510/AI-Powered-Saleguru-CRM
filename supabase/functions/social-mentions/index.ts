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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { method } = req
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (method) {
      case 'GET':
        return await handleGet(req, supabase, path)
      case 'POST':
        return await handlePost(req, supabase, path)
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleGet(req: Request, supabase: any, path: string) {
  const url = new URL(req.url)
  const params = url.searchParams

  switch (path) {
    case 'mentions':
      return await getMentions(supabase, params)
    case 'stats':
      return await getStats(supabase)
    case 'contact-mentions':
      const contactId = params.get('contact_id')
      if (!contactId) {
        return new Response(JSON.stringify({ error: 'contact_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return await getContactMentions(supabase, contactId)
    default:
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
  }
}

async function handlePost(req: Request, supabase: any, path: string) {
  const body = await req.json()

  switch (path) {
    case 'process-mention':
      return await processMention(supabase, body)
    case 'link-contact':
      return await linkContactToMentions(supabase, body)
    default:
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
  }
}

async function getMentions(supabase: any, params: URLSearchParams) {
  const limit = parseInt(params.get('limit') || '50')
  const source = params.get('source')
  const sentiment = params.get('sentiment')
  const contactId = params.get('contact_id')

  let query = supabase
    .from('social_mentions')
    .select('*')
    .order('mention_time', { ascending: false })
    .limit(limit)

  if (source) query = query.eq('source', source)
  if (sentiment) query = query.eq('sentiment', sentiment)
  if (contactId) query = query.eq('contact_id', contactId)

  const { data, error } = await query

  if (error) throw error

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getStats(supabase: any) {
  const { data, error } = await supabase
    .from('social_mentions')
    .select('source, sentiment, mention_time')

  if (error) throw error

  const stats = {
    total: data?.length || 0,
    bySource: {} as Record<string, number>,
    bySentiment: {} as Record<string, number>,
    recent24h: 0,
    recent7d: 0
  }

  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  data?.forEach((mention: any) => {
    stats.bySource[mention.source] = (stats.bySource[mention.source] || 0) + 1
    
    if (mention.sentiment) {
      stats.bySentiment[mention.sentiment] = (stats.bySentiment[mention.sentiment] || 0) + 1
    }

    const mentionTime = new Date(mention.mention_time)
    if (mentionTime >= dayAgo) stats.recent24h++
    if (mentionTime >= weekAgo) stats.recent7d++
  })

  return new Response(JSON.stringify({ data: stats }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getContactMentions(supabase: any, contactId: string) {
  const { data, error } = await supabase
    .from('social_mentions')
    .select('*')
    .eq('contact_id', contactId)
    .order('mention_time', { ascending: false })
    .limit(10)

  if (error) throw error

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function processMention(supabase: any, mentionData: any) {
  // Check if mention already exists
  const { data: existing } = await supabase
    .from('social_mentions')
    .select('id')
    .eq('mention_id', mentionData.mention_id)
    .eq('source', mentionData.source)
    .maybeSingle()

  if (existing) {
    return new Response(JSON.stringify({ message: 'Mention already exists' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Try to match author to contact
  let contact_id = null
  if (mentionData.author) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('twitter_handle', mentionData.author)
      .maybeSingle()
    
    if (contact) contact_id = contact.id
  }

  const mention = {
    ...mentionData,
    contact_id
  }

  const { data, error } = await supabase
    .from('social_mentions')
    .insert([mention])
    .select()

  if (error) throw error

  return new Response(JSON.stringify({ data: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function linkContactToMentions(supabase: any, { contactId, author }: { contactId: string, author: string }) {
  const { error } = await supabase
    .from('social_mentions')
    .update({ contact_id: contactId })
    .eq('author', author)
    .is('contact_id', null)

  if (error) throw error

  return new Response(JSON.stringify({ message: 'Mentions linked successfully' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
} 