-- Odoo-Inspired CRM Sample Data
-- This migration adds sample data after the schema is created

-- Sample organization (create first)
INSERT INTO orgs (id, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Organization')
ON CONFLICT DO NOTHING;

-- Sample pipeline and stages
INSERT INTO pipelines (id, org_id, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Sales Pipeline')
ON CONFLICT DO NOTHING;

INSERT INTO pipeline_stages (id, pipeline_id, name, probability, position) VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Qualification', 10, 1),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Proposal', 25, 2),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Negotiation', 50, 3),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Closed Won', 100, 4),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Closed Lost', 0, 5)
ON CONFLICT DO NOTHING;

-- Sample companies
INSERT INTO companies (id, org_id, name, domain) VALUES 
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Acme Corp', 'acme.com'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'TechStart Inc', 'techstart.io')
ON CONFLICT DO NOTHING;

-- Sample contacts
INSERT INTO contacts (id, org_id, company_id, first_name, last_name, email, phone, title) VALUES 
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'John', 'Doe', 'john@acme.com', '+1234567890', 'CEO'),
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Jane', 'Smith', 'jane@techstart.io', '+1987654321', 'CTO')
ON CONFLICT DO NOTHING;

-- Sample leads
INSERT INTO leads (id, org_id, contact_id, company_id, source, status, score, notes) VALUES 
  ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'website', 'working', 75, 'Interested in enterprise solution'),
  ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'referral', 'qualified', 85, 'Ready for proposal')
ON CONFLICT DO NOTHING;

-- Sample deals (using correct stage_id)
INSERT INTO deals (id, org_id, title, contact_id, company_id, pipeline_id, stage_id, value, status) VALUES 
  ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'Acme Enterprise Deal', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 50000.00, 'open'),
  ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'TechStart Partnership', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 75000.00, 'open')
ON CONFLICT DO NOTHING;
