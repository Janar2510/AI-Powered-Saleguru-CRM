-- Odoo-Inspired CRM - Add Foreign Keys
-- Add foreign key constraints after tables are created

-- Add foreign key constraints
ALTER TABLE org_members 
ADD CONSTRAINT fk_org_members_org_id FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_org_members_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE companies 
ADD CONSTRAINT fk_companies_org_id FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE;

ALTER TABLE contacts 
ADD CONSTRAINT fk_contacts_org_id FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_contacts_company_id FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE leads 
ADD CONSTRAINT fk_leads_org_id FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_leads_contact_id FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_leads_company_id FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE pipelines 
ADD CONSTRAINT fk_pipelines_org_id FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE;

ALTER TABLE pipeline_stages 
ADD CONSTRAINT fk_pipeline_stages_pipeline_id FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE;

ALTER TABLE deals 
ADD CONSTRAINT fk_deals_org_id FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_deals_contact_id FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_deals_company_id FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_deals_pipeline_id FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_deals_stage_id FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id) ON DELETE SET NULL;

-- Add check constraints
ALTER TABLE org_members 
ADD CONSTRAINT chk_org_members_role CHECK (role IN ('owner','admin','member'));

ALTER TABLE leads 
ADD CONSTRAINT chk_leads_status CHECK (status IN ('new','working','qualified','lost','converted'));

ALTER TABLE pipeline_stages 
ADD CONSTRAINT chk_pipeline_stages_probability CHECK (probability BETWEEN 0 AND 100);

ALTER TABLE deals 
ADD CONSTRAINT chk_deals_status CHECK (status IN ('open','won','lost'));
