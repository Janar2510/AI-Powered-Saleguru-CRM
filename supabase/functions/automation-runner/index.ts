import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.43.4";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

// ACTIONS registry
async function action_send_email(ctx: any, input: any) {
  // enqueue into emails table (your existing sender picks up status='queued')
  const { to, subject, body, deal_id, contact_id, cc, bcc, schedule_at } = input;
  await supabase.from('emails').insert({
    org_id: ctx.org_id,
    to, cc, bcc, subject, body, deal_id, contact_id,
    direction: 'outbound', 
    status: schedule_at ? 'scheduled' : 'queued', 
    scheduled_at: schedule_at || null
  });
  return { queued: true };
}

async function action_update_deal_stage(ctx: any, input: any) {
  await supabase.from('deals').update({ stage: input.stage }).eq('id', input.deal_id);
  return { updated: true };
}

async function action_create_task(ctx: any, input: any) {
  await supabase.from('tasks').insert({
    title: input.title, 
    due_date: input.due_date, 
    related_deal_id: input.deal_id,
    related_contact_id: input.contact_id, 
    priority: input.priority || 'Medium',
    org_id: ctx.org_id
  });
  return { created: true };
}

async function action_http_webhook(ctx: any, input: any) {
  const res = await fetch(input.url, { 
    method: input.method || 'POST', 
    headers: input.headers || {}, 
    body: input.body ? JSON.stringify(input.body) : undefined 
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function action_create_proforma(ctx: any, input: any) {
  const { data, error } = await supabase.from('proformas').insert({
    org_id: ctx.org_id, 
    sales_order_id: input.sales_order_id, 
    currency: input.currency || 'EUR',
    subtotal_cents: input.subtotal_cents || 0, 
    tax_rate: input.tax_rate || 0,
    tax_cents: input.tax_cents || 0, 
    total_cents: input.total_cents || 0
  }).select('id, number').single();
  if (error) throw error;
  return data;
}

async function action_reserve_stock(ctx: any, input: any) {
  // call your RPC or do direct ops here
  // payload: { sales_order_id, lines:[{product_id, qty, location_id}] }
  for (const l of input.lines || []) {
    await supabase.from('so_reservations').insert({ 
      org_id: ctx.org_id, 
      sales_order_id: input.sales_order_id, 
      product_id: l.product_id, 
      qty: l.qty, 
      location_id: l.location_id 
    });
  }
  return { reserved: true };
}

const ACTIONS: any = {
  'email.send': action_send_email,
  'deal.update_stage': action_update_deal_stage,
  'task.create': action_create_task,
  'http.webhook': action_http_webhook,
  'proforma.create': action_create_proforma,
  'stock.reserve': action_reserve_stock,
};

type Node = { id: string; type: 'action' | 'condition' | 'delay' | 'split'; name: string; config: any };
type Edge = { from: string; to: string; condition?: string }; // condition JS for branching

function pickWeighted(options: Array<{to:string; weight:number}>): string {
  const total = options.reduce((s,o)=>s+o.weight,0);
  const r = Math.random()*total;
  let acc = 0;
  for (const o of options) { acc += o.weight; if (r <= acc) return o.to; }
  return options[options.length-1].to;
}

async function runGraph(org_id: string, automation_id: string, graph: any, context: any, run_id?: string) {
  // Governance check
  const { data: auto } = await supabase.from('automations').select('id, requires_approval, approval_status').eq('id', automation_id).single();
  if (auto?.requires_approval && auto?.approval_status !== 'approved') {
    throw new Error('Automation not approved');
  }

  // Ensure run row
  let runId = run_id;
  if (!runId) {
    const ins = await supabase.from('automation_runs').insert({ 
      org_id, 
      automation_id, 
      context 
    }).select('id').single();
    if (ins.error) throw ins.error;
    runId = ins.data.id;
  }

  // Simple engine: BFS-like through nodes following edges; supports delay push to delayed_jobs
  const nodes: Record<string, Node> = {};
  graph.nodes.forEach((n: Node) => nodes[n.id] = n);
  const edges: Edge[] = graph.edges || [];

  // Start nodes = nodes with no incoming edges
  const incoming = new Set(edges.map(e => e.to));
  const queue = graph.nodes.filter((n: Node) => !incoming.has(n.id)).map((n: Node) => n.id);

  while (queue.length) {
    const id = queue.shift()!;
    const node = nodes[id];
    const stepStart = new Date().toISOString();

    try {
      if (node.type === 'delay') {
        const delayMs = node.config?.ms ?? 0;
        const execute_at = new Date(Date.now() + delayMs).toISOString();
        await supabase.from('delayed_jobs').insert({ 
          org_id, 
          automation_id, 
          run_id: runId, 
          node_id: id, 
          execute_at, 
          payload: { context } 
        });
        await supabase.from('automation_run_steps').insert({ 
          run_id: runId, 
          node_id: id, 
          node_type: 'delay', 
          status: 'success', 
          started_at: stepStart, 
          finished_at: new Date().toISOString(), 
          output: { scheduled_for: execute_at } 
        });
        // Do not enqueue subsequent nodes now; the scheduler will continue the path later.
        continue;
      }

      if (node.type === 'condition') {
        // Safe eval: we run a tiny condition against context; keep it simple
        const cond = String(node.config?.expr || 'true');
        const pass = evalCond(cond, context); // implement a tiny parser below
        await supabase.from('automation_run_steps').insert({ 
          run_id: runId, 
          node_id: id, 
          node_type: 'condition', 
          status: 'success', 
          input: { expr: cond }, 
          output: { pass }, 
          started_at: stepStart, 
          finished_at: new Date().toISOString() 
        });
        const nextEdges = edges.filter(e => e.from === id);
        const branch = nextEdges.find(e => (e.condition || 'true') === (pass ? 'true' : 'false'));
        if (branch) queue.push(branch.to);
        continue;
      }

              if (node.type === 'split') {
          const arms = (node.config?.arms || []).map((a:any)=>({ label: String(a.label), weight: Number(a.weight || 1) }));
          if (!arms.length) throw new Error('split node without arms');
          // Map arms -> possible outgoing edges
          const outs = edges.filter(e=>e.from===id && e.condition && arms.find(a=>a.label===e.condition));
          if (!outs.length) throw new Error('split node has no matching edges');
          const weighted = outs.map(e=>{
            const arm = arms.find(a=>a.label===e.condition)!;
            return { to: e.to, weight: arm.weight };
          });
          const chosen = pickWeighted(weighted);
          await supabase.from('automation_run_steps').insert({
            run_id: runId, node_id: id, node_type: 'split', status: 'success',
            input: node.config, output: { chosen }, started_at: stepStart, finished_at: new Date().toISOString()
          });
          queue.push(chosen);
          continue;
        }

        if (node.type === 'action') {
          const fn = ACTIONS[node.name];
          if (!fn) throw new Error(`Unknown action: ${node.name}`);
          const out = await fn({ org_id, automation_id }, substitute(node.config, context));
          await supabase.from('automation_run_steps').insert({
            run_id: runId,
            node_id: id,
            node_type: 'action',
            status: 'success',
            input: node.config,
            output: out,
            started_at: stepStart,
            finished_at: new Date().toISOString()
          });
        }

      // Enqueue all next nodes (no branch condition) — or multiple if needed
      edges.filter(e => e.from === id && !e.condition).forEach(e => queue.push(e.to));
    } catch (err: any) {
      await supabase.from('automation_run_steps').insert({ 
        run_id: runId, 
        node_id: id, 
        node_type: node.type, 
        status: 'failed', 
        error: String(err?.message || err), 
        started_at: stepStart, 
        finished_at: new Date().toISOString(), 
        input: node.config 
      });
      await supabase.from('automation_runs').update({ 
        status: 'failed', 
        last_error: String(err?.message || err), 
        finished_at: new Date().toISOString() 
      }).eq('id', runId);
      throw err;
    }
  }

  await supabase.from('automation_runs').update({ 
    status: 'success', 
    finished_at: new Date().toISOString() 
  }).eq('id', runId);
  return { run_id: runId };
}

// very tiny expression evaluator: supports context.path == "value", numeric compares, && ||
function evalCond(expr: string, context: any): boolean {
  try {
    // SUPER minimal: replace {{context.x}} tokens first
    const replaced = expr.replace(/\{\{\s*context\.([a-zA-Z0-9_\.]+)\s*\}\}/g, (_, path) => {
      const v = path.split('.').reduce((a: any, k: string) => a?.[k], context);
      return typeof v === 'string' ? `"${v.replace(/"/g, '\\"')}"` : String(v);
    });
    // Allow ==, !=, >, <, &&, ||
    // deno-lint-ignore no-eval
    return !!eval(replaced);
  } catch { 
    return false; 
  }
}

function substitute(obj: any, ctx: any) {
  if (!obj) return obj;
  const s = JSON.stringify(obj);
  const out = s.replace(/\{\{\s*context\.([a-zA-Z0-9_\.]+)\s*\}\}/g, (_, path) => {
    const v = path.split('.').reduce((a: any, k: string) => a?.[k], ctx);
    return typeof v === 'string' ? v : (v ?? '');
  });
  return JSON.parse(out);
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Modes:
    // 1) event pull: consume unprocessed event_log and match automations
    // 2) delayed jobs: execute due delayed_jobs continuation
    const { mode = 'all' } = req.method === 'POST' ? await req.json().catch(() => ({})) : {};

    if (mode === 'events' || mode === 'all') {
      // fetch batch of events
      const { data: events } = await supabase.from('event_log').select('*').eq('processed', false).limit(50).order('occurred_at', { ascending: true });
      for (const ev of (events || [])) {
        // find automations matching this org and event trigger
        const { data: autos } = await supabase.from('automations').select('id, org_id, trigger, graph, status').eq('org_id', ev.org_id).eq('status', 'active');
        for (const a of (autos || [])) {
          const trig = a.trigger || {};
          if (trig.kind === 'event' && trig.event_type === ev.event_type) {
            await runGraph(ev.org_id, a.id, a.graph, { 
              event: ev, 
              subject_type: ev.subject_type, 
              subject_id: ev.subject_id, 
              payload: ev.payload 
            });
          }
        }
        await supabase.from('event_log').update({ processed: true }).eq('id', ev.id);
      }
    }

    if (mode === 'delays' || mode === 'all') {
      const now = new Date().toISOString();
      const { data: jobs } = await supabase.from('delayed_jobs').select('*').lte('execute_at', now).limit(50).order('execute_at', { ascending: true });
      for (const job of (jobs || [])) {
        // Continue from this node: find automation & graph
        const { data: auto } = await supabase.from('automations').select('id, org_id, graph').eq('id', job.automation_id).single();
        if (!auto) continue;
        const graph = auto.graph;
        // push successors of node_id
        const succ = (graph.edges || []).filter((e: any) => e.from === job.node_id).map((e: any) => e.to);
        const sub = { 
          nodes: (graph.nodes || []).filter((n: any) => succ.includes(n.id)), 
          edges: (graph.edges || []).filter((e: any) => succ.includes(e.from)) 
        };
        await runGraph(job.org_id, job.automation_id, sub, job.payload?.context || {}, job.run_id || undefined);
        await supabase.from('delayed_jobs').delete().eq('id', job.id);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
