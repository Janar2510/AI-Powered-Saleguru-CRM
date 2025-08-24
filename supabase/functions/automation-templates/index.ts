import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.43.4";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { 
    status: 204, 
    headers: { 
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Headers": "Content-Type, Authorization" 
    }
  });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('automation_templates')
        .select('*')
        .order('recommended', { ascending: false });
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), { 
        status: 200, 
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json" 
        }
      });
    }

    if (req.method === 'POST') {
      const { org_id, template_id } = await req.json();
      
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('automation_templates')
        .select('*')
        .eq('id', template_id)
        .single();
      
      if (templateError) throw templateError;
      
      // Create automation from template
      const { data: automation, error: automationError } = await supabase
        .from('automations')
        .insert({
          org_id, 
          name: template.name, 
          description: template.description, 
          status: 'draft',
          trigger: template.trigger, 
          graph: template.graph, 
          requires_approval: true, 
          approval_status: 'draft'
        })
        .select('id')
        .single();
      
      if (automationError) throw automationError;
      
      return new Response(JSON.stringify({ automation_id: automation.id }), { 
        status: 200, 
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json" 
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { 
        "Access-Control-Allow-Origin": "*", 
        "Content-Type": "application/json" 
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { 
      status: 500, 
      headers: { 
        "Access-Control-Allow-Origin": "*", 
        "Content-Type": "application/json" 
      }
    });
  }
});
