-- Governance fields for automations
alter table automations
  add column if not exists requires_approval boolean default false,
  add column if not exists approval_status text
    check (approval_status in ('draft','pending','approved','rejected'))
    default 'draft',
  add column if not exists approval_notes text,
  add column if not exists approved_by uuid references profiles(id),
  add column if not exists approved_at timestamptz;

-- Optional audit trail for approvals
create table if not exists automation_approvals (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references automations(id) on delete cascade,
  action text not null check (action in ('requested','approved','rejected')),
  actor_id uuid references profiles(id),
  notes text,
  created_at timestamptz default now()
);

-- Templates registry (curated/base or AI-suggested)
create table if not exists automation_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category text,
  trigger jsonb not null,
  graph jsonb not null,
  recommended boolean default false,
  created_at timestamptz default now()
);

-- Runs: quick index for UI
create index if not exists idx_runs_time on automation_runs(started_at desc);
create index if not exists idx_run_steps_run on automation_run_steps(run_id);

-- RLS for new tables
alter table automation_approvals enable row level security;
create policy aa_read on automation_approvals for select using (
  automation_id in (select id from automations a where a.org_id in (select org_id from profiles where id = auth.uid()))
);
create policy aa_write on automation_approvals for insert with check (
  automation_id in (select id from automations a where a.org_id in (select org_id from profiles where id = auth.uid()))
);

alter table automation_templates enable row level security;
create policy at_read on automation_templates for select using (true); -- templates are global
create policy at_write on automation_templates for all using (false); -- only via function

-- Seed sample templates
insert into automation_templates (slug, name, description, category, trigger, graph, recommended)
values
('lead-welcome-3day-followup',
 'Lead Welcome + 3-day Follow-up',
 'Send welcome, wait 3 days, if no reply create task.',
 'Leads',
 '{"kind":"event","event_type":"lead.created"}',
 '{
  "nodes":[
    {"id":"n1","type":"action","name":"email.send","position":{"x":100,"y":100},"config":{"to":"{{context.payload.new.email}}","subject":"Welcome {{context.payload.new.first_name}}","body":"Thanks for your interest in Saleguru!"}},
    {"id":"d1","type":"delay","name":"wait","position":{"x":100,"y":250},"config":{"ms":259200000}},
    {"id":"c1","type":"condition","name":"replied?","position":{"x":100,"y":400},"config":{"expr":"{{context.payload.new.replied}} == true"}},
    {"id":"n2","type":"action","name":"task.create","position":{"x":300,"y":550},"config":{"title":"Follow up {{context.payload.new.first_name}}","priority":"High","contact_id":"{{context.subject_id}}"}}
  ],
  "edges":[{"from":"n1","to":"d1"},{"from":"d1","to":"c1"},{"from":"c1","to":"n2","condition":"false"}]
 }',
 true),
('invoice-reminders-stripe',
 'Invoice Reminders with Paylink',
 'Pre-due, due-day, and post-due reminders with payment link.',
 'Finance',
 '{"kind":"event","event_type":"invoice.created"}',
 '{
  "nodes":[
    {"id":"d1","type":"delay","name":"preDue3d","position":{"x":100,"y":100},"config":{"ms":259200000}},
    {"id":"n1","type":"action","name":"email.send","position":{"x":100,"y":250},"config":{"to":"{{context.payload.new.contact_email}}","subject":"Upcoming invoice {{context.payload.new.number}}","body":"Amount €{{context.payload.new.total}} due {{context.payload.new.due_date}}."}},
    {"id":"d2","type":"delay","name":"onDue","position":{"x":100,"y":400},"config":{"ms":86400000}},
    {"id":"n2","type":"action","name":"email.send","position":{"x":100,"y":550},"config":{"to":"{{context.payload.new.contact_email}}","subject":"Invoice due today {{context.payload.new.number}}","body":"Pay here: {{context.payload.new.pay_url}}"}},
    {"id":"d3","type":"delay","name":"post5d","position":{"x":100,"y":700},"config":{"ms":432000000}},
    {"id":"c1","type":"condition","name":"paid?","position":{"x":100,"y":850},"config":{"expr":"{{context.payload.new.status}} == \"Paid\""}},
    {"id":"n3","type":"action","name":"email.send","position":{"x":300,"y":1000},"config":{"to":"{{context.payload.new.contact_email}}","subject":"Overdue {{context.payload.new.number}}","body":"Secure pay link: {{context.payload.new.pay_url}}"}}
  ],
  "edges":[{"from":"d1","to":"n1"},{"from":"n1","to":"d2"},{"from":"d2","to":"n2"},{"from":"n2","to":"d3"},{"from":"d3","to":"c1"},{"from":"c1","to":"n3","condition":"false"}]
 }',
 true),
('lead-welcome-ab-test',
 'Lead Welcome A/B Subject Test',
 'Test two subjects to improve open rate.',
 'Experiments',
 '{"kind":"event","event_type":"lead.created"}',
 '{
  "nodes": [
    {"id":"s1","type":"split","name":"A/B","position":{"x":100,"y":100},"config":{"arms":[{"label":"A","weight":50},{"label":"B","weight":50}]}},
    {"id":"a1","type":"action","name":"email.send","position":{"x":300,"y":250},"config":{"to":"{{context.payload.new.email}}","subject":"Welcome to Saleguru 🎉","body":"Short and sweet."}},
    {"id":"b1","type":"action","name":"email.send","position":{"x":500,"y":250},"config":{"to":"{{context.payload.new.email}}","subject":"Quick question about your sales stack","body":"Value-forward opener."}}
  ],
  "edges": [
    {"from":"s1","to":"a1","condition":"A"},
    {"from":"s1","to":"b1","condition":"B"}
  ]
 }',
 true);
