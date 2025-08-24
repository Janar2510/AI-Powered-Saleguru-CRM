export const SAMPLE_WORKFLOWS = [
  {
    name: "Lead Nurture: welcome + follow-up",
    description: "Greets new leads; follows up if no reply; creates task.",
    trigger: { kind: "event", event_type: "lead.created" },
    graph: {
      nodes: [
        { 
          id: "n1",
          type: "action",
          name: "email.send",
          position: { x: 100, y: 100 },
          config: {
            to: "{{context.payload.new.email}}",
            subject: "Welcome, {{context.payload.new.first_name}}",
            body: "Hi {{context.payload.new.first_name}}, thanks for your interest in Saleguru. Quick question: what's your current sales stack?"
          }
        },
        { 
          id: "d1",
          type: "delay",
          name: "wait",
          position: { x: 100, y: 250 },
          config: { ms: 259200000 }
        }, 
        { 
          id: "c1",
          type: "condition",
          name: "replied?",
          position: { x: 100, y: 400 },
          config: { expr: "{{context.payload.new.replied}} == true" }
        },
        { 
          id: "n2",
          type: "action",
          name: "email.send",
          position: { x: 300, y: 550 },
          config: {
            to: "{{context.payload.new.email}}",
            subject: "Just checking in",
            body: "Hi {{context.payload.new.first_name}}, did you get my note?"
          }
        },
        { 
          id: "n3",
          type: "action",
          name: "task.create",
          position: { x: 500, y: 550 },
          config: {
            title: "Call {{context.payload.new.first_name}}",
            due_date: "{{context.event.occurred_at}}",
            priority: "High",
            contact_id: "{{context.subject_id}}"
          }
        }
      ],
      edges: [
        { from: "n1", to: "d1" },
        { from: "d1", to: "c1" },
        { from: "c1", to: "n3", condition: "false" },
        { from: "c1", to: "n2", condition: "false" }
      ]
    }
  },
  {
    name: "Deal stuck SLA escalation",
    description: "If deal sits in 'Qualified' for 7 days, email nudge, create task, escalate stage if still idle.",
    trigger: { kind: "event", event_type: "deal.stage_changed" },
    graph: {
      nodes: [
        {
          id: "d1",
          type: "delay",
          name: "wait7d",
          position: { x: 100, y: 100 },
          config: { ms: 604800000 }
        },
        {
          id: "c1",
          type: "condition",
          name: "stillQualified",
          position: { x: 100, y: 250 },
          config: { expr: "{{context.payload.new.stage}} == \"Qualified\"" }
        },
        {
          id: "n1",
          type: "action",
          name: "email.send",
          position: { x: 300, y: 400 },
          config: {
            to: "{{context.payload.new.owner_email}}",
            subject: "Deal idle: {{context.payload.new.title}}",
            body: "Deal has been in Qualified for 7+ days."
          }
        },
        {
          id: "n2",
          type: "action",
          name: "task.create",
          position: { x: 500, y: 400 },
          config: {
            title: "Escalate {{context.payload.new.title}}",
            due_date: "{{context.event.occurred_at}}",
            deal_id: "{{context.subject_id}}",
            priority: "High"
          }
        },
        {
          id: "n3",
          type: "action",
          name: "deal.update_stage",
          position: { x: 700, y: 400 },
          config: {
            deal_id: "{{context.subject_id}}",
            stage: "Proposal"
          }
        }
      ],
      edges: [
        { from: "d1", to: "c1" },
        { from: "c1", to: "n1", condition: "true" },
        { from: "c1", to: "n2", condition: "true" },
        { from: "c1", to: "n3", condition: "true" }
      ]
    }
  },
  {
    name: "Invoice reminder & paylink",
    description: "Remind 3 days before due; on due date; 5 days after with Stripe link.",
    trigger: { kind: "event", event_type: "invoice.created" },
    graph: {
      nodes: [
        {
          id: "d1",
          type: "delay",
          name: "preDue3d",
          position: { x: 100, y: 100 },
          config: { ms: (3 * 24 * 60 * 60 * 1000) }
        },
        {
          id: "n1",
          type: "action",
          name: "email.send",
          position: { x: 100, y: 250 },
          config: {
            to: "{{context.payload.new.contact_email}}",
            subject: "Upcoming invoice {{context.payload.new.number}}",
            body: "Amount: €{{context.payload.new.total}}.\nDue {{context.payload.new.due_date}}."
          }
        },
        {
          id: "d2",
          type: "delay",
          name: "onDue",
          position: { x: 100, y: 400 },
          config: { ms: (24 * 60 * 60 * 1000) }
        },
        {
          id: "n2",
          type: "action",
          name: "email.send",
          position: { x: 100, y: 550 },
          config: {
            to: "{{context.payload.new.contact_email}}",
            subject: "Invoice due today {{context.payload.new.number}}",
            body: "Please pay here: {{context.payload.new.pay_url}}"
          }
        },
        {
          id: "d3",
          type: "delay",
          name: "post5d",
          position: { x: 100, y: 700 },
          config: { ms: (5 * 24 * 60 * 60 * 1000) }
        },
        {
          id: "c1",
          type: "condition",
          name: "paid?",
          position: { x: 100, y: 850 },
          config: { expr: "{{context.payload.new.status}} == \"Paid\"" }
        },
        {
          id: "n3",
          type: "action",
          name: "email.send",
          position: { x: 300, y: 1000 },
          config: {
            to: "{{context.payload.new.contact_email}}",
            subject: "Overdue invoice {{context.payload.new.number}}",
            body: "Your secure payment link: {{context.payload.new.pay_url}}"
          }
        }
      ],
      edges: [
        { from: "d1", to: "n1" },
        { from: "n1", to: "d2" },
        { from: "d2", to: "n2" },
        { from: "n2", to: "d3" },
        { from: "d3", to: "c1" },
        { from: "c1", to: "n3", condition: "false" }
      ]
    }
  },
  {
    name: "Confirm order → pro forma + stock",
    description: "When sales order confirmed, create pro forma and reserve stock.",
    trigger: { kind: "event", event_type: "sales_order.confirmed" },
    graph: {
      nodes: [
        {
          id: "n1",
          type: "action",
          name: "proforma.create",
          position: { x: 100, y: 100 },
          config: {
            sales_order_id: "{{context.subject_id}}",
            currency: "EUR",
            subtotal_cents: "{{context.payload.new.subtotal_cents}}",
            tax_rate: "20",
            tax_cents: "{{context.payload.new.tax_cents}}",
            total_cents: "{{context.payload.new.total_cents}}"
          }
        },
        {
          id: "n2",
          type: "action",
          name: "stock.reserve",
          position: { x: 100, y: 250 },
          config: {
            sales_order_id: "{{context.subject_id}}",
            lines: "{{context.payload.new.lines}}"
          }
        },
        {
          id: "n3",
          type: "action",
          name: "email.send",
          position: { x: 100, y: 400 },
          config: {
            to: "{{context.payload.new.customer_email}}",
            subject: "Order confirmed",
            body: "Thanks! Pro forma {{context.payload.new.proforma_number}} attached."
          }
        }
      ],
      edges: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" }
      ]
    }
  }
];

export const installSampleWorkflow = async (workflow: any, orgId: string, supabaseClient: any) => {
  const { data, error } = await supabaseClient
    .from('automations')
    .insert({
      org_id: orgId,
      name: workflow.name,
      description: workflow.description,
      status: 'draft',
      trigger: workflow.trigger,
      graph: workflow.graph
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
};
