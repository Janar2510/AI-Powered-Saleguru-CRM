import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.43.4";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

const SYSTEM = `You generate CRM workflow graphs for an engine that supports nodes: 
- action(name, config) - Actions like email.send, task.create, deal.update_stage, http.webhook, proforma.create, stock.reserve
- condition(expr) - JS-like boolean using {{context.*}} tokens (e.g., {{context.event.payload.new.stage}} == "qualified")
- delay(ms) - Wait for specified milliseconds (e.g., 86400000 for 1 day)

Trigger kinds: 
- event: {kind:"event", event_type:"deal.created"} 
- schedule: {kind:"schedule", cron:"0 9 * * 1"}

Node structure:
- Each node needs: {id:"unique", type:"action|condition|delay", name:"action.name", config:{...}}
- Position nodes for visual layout: {id:"node1", type:"action", name:"email.send", config:{to:"{{context.event.payload.new.email}}", subject:"Welcome!", body:"Hello {{context.event.payload.new.name}}"}, position:{x:100, y:100}}

Edge structure:
- {from:"node1", to:"node2"} for sequential flow
- {from:"condition1", to:"node2", condition:"true"} for conditional branches
- {from:"condition1", to:"node3", condition:"false"} for else branches

Available context variables:
- {{context.event.payload.new.*}} - New record data
- {{context.event.payload.old.*}} - Old record data
- {{context.subject_id}} - ID of the record that triggered the event
- {{context.subject_type}} - Type of record (deal, lead, task, etc.)

Respond ONLY as JSON: { name, description, trigger:{kind,...}, graph:{nodes:[],edges:[]} }.
Make workflows practical and safe with realistic email content and proper error handling.`;

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { org_id, goal, constraints } = await req.json();

    const prompt = `Business goal: ${goal}
Constraints/context: ${constraints || 'N/A'}
Locale: Europe/Tallinn, currency EUR.
Use concise subject/body with {{context...}} variables (e.g., {{context.event.payload.new.title}}).
Make it realistic and safe with proper node positioning for visual flow.
Include realistic delays (e.g., 3 days = 259200000ms) and meaningful conditions.`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${OPENAI_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!r.ok) {
      const errorText = await r.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    
    const j = await r.json();
    const content = j.choices[0].message.content.trim();
    
    let wf;
    try {
      wf = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Failed to parse AI response as JSON: ${content}`);
    }

    // Persist as draft automation
    const { data, error } = await supabase.from('automations').insert({
      org_id, 
      name: wf.name, 
      description: wf.description, 
      status: 'draft',
      trigger: wf.trigger, 
      graph: wf.graph
    }).select('id').single();
    
    if (error) throw error;

    return new Response(JSON.stringify({ 
      automation_id: data.id, 
      workflow: wf 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    console.error('Automation generation error:', e);
    return new Response(JSON.stringify({ 
      error: String(e?.message || e) 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
