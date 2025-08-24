import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.43.4";

const url = Deno.env.get("SUPABASE_URL")!;
const srk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, srk);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { 
    status: 204, 
    headers: { 
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Headers": "Content-Type, Authorization" 
    }
  });

  try {
    const { automation_id, action, actor_id, notes } = await req.json();
    
    if (!['request', 'approve', 'reject'].includes(action)) {
      throw new Error('Invalid action');
    }

    if (action === 'request') {
      await supabase
        .from('automations')
        .update({ 
          requires_approval: true, 
          approval_status: 'pending' 
        })
        .eq('id', automation_id);
      
      await supabase
        .from('automation_approvals')
        .insert({ 
          automation_id, 
          action: 'requested', 
          actor_id, 
          notes 
        });
    } else if (action === 'approve') {
      await supabase
        .from('automations')
        .update({ 
          approval_status: 'approved', 
          approved_by: actor_id, 
          approved_at: new Date().toISOString() 
        })
        .eq('id', automation_id);
      
      await supabase
        .from('automation_approvals')
        .insert({ 
          automation_id, 
          action: 'approved', 
          actor_id, 
          notes 
        });
    } else if (action === 'reject') {
      await supabase
        .from('automations')
        .update({ 
          approval_status: 'rejected', 
          approval_notes: notes 
        })
        .eq('id', automation_id);
      
      await supabase
        .from('automation_approvals')
        .insert({ 
          automation_id, 
          action: 'rejected', 
          actor_id, 
          notes 
        });
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
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
