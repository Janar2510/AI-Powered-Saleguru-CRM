-- Enhanced Documents System
-- This migration creates a comprehensive document system with proper relationships

-- Drop existing tables if they exist
DROP TABLE IF EXISTS document_items CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

-- Create enhanced documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quote', 'proforma', 'invoice', 'receipt')),
  title TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 20,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'delivered', 'paid')),
  notes TEXT,
  terms TEXT,
  due_date DATE,
  sent_date TIMESTAMPTZ,
  accepted_date TIMESTAMPTZ,
  delivered_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  document_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create document items table
CREATE TABLE document_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create accounting entries table for document integration
CREATE TABLE accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'receivable', 'payable')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can view their own documents') THEN
        CREATE POLICY "Users can view their own documents" ON documents
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can insert their own documents') THEN
        CREATE POLICY "Users can insert their own documents" ON documents
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can update their own documents') THEN
        CREATE POLICY "Users can update their own documents" ON documents
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can delete their own documents') THEN
        CREATE POLICY "Users can delete their own documents" ON documents
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- RLS Policies for document_items
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_items' AND policyname = 'Users can view their own document items') THEN
        CREATE POLICY "Users can view their own document items" ON document_items
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM documents 
              WHERE documents.id = document_items.document_id 
              AND documents.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_items' AND policyname = 'Users can insert their own document items') THEN
        CREATE POLICY "Users can insert their own document items" ON document_items
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM documents 
              WHERE documents.id = document_items.document_id 
              AND documents.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_items' AND policyname = 'Users can update their own document items') THEN
        CREATE POLICY "Users can update their own document items" ON document_items
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM documents 
              WHERE documents.id = document_items.document_id 
              AND documents.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_items' AND policyname = 'Users can delete their own document items') THEN
        CREATE POLICY "Users can delete their own document items" ON document_items
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM documents 
              WHERE documents.id = document_items.document_id 
              AND documents.user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- RLS Policies for accounting_entries
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_entries' AND policyname = 'Users can view their own accounting entries') THEN
        CREATE POLICY "Users can view their own accounting entries" ON accounting_entries
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_entries' AND policyname = 'Users can insert their own accounting entries') THEN
        CREATE POLICY "Users can insert their own accounting entries" ON accounting_entries
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_entries' AND policyname = 'Users can update their own accounting entries') THEN
        CREATE POLICY "Users can update their own accounting entries" ON accounting_entries
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_entries' AND policyname = 'Users can delete their own accounting entries') THEN
        CREATE POLICY "Users can delete their own accounting entries" ON accounting_entries
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_contact_id ON documents(contact_id);
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_deal_id ON documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_items_document_id ON document_items(document_id);
CREATE INDEX IF NOT EXISTS idx_document_items_product_id ON document_items(product_id);

CREATE INDEX IF NOT EXISTS idx_accounting_entries_user_id ON accounting_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_document_id ON accounting_entries(document_id);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_type ON accounting_entries(type);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_status ON accounting_entries(status);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_entry_date ON accounting_entries(entry_date);

-- Function to generate document numbers
CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT)
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    sequence_num INTEGER;
    doc_number TEXT;
BEGIN
    year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get the next sequence number for this year and type
    SELECT COALESCE(MAX(CAST(SUBSTRING(document_number FROM LENGTH(doc_type || year || '-') + 1) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM documents 
    WHERE document_number LIKE doc_type || year || '-%';
    
    doc_number := doc_type || year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN doc_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-calculate document totals
CREATE OR REPLACE FUNCTION calculate_document_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate subtotal from items
    SELECT COALESCE(SUM(total), 0) INTO NEW.subtotal
    FROM document_items 
    WHERE document_id = NEW.id;
    
    -- Calculate tax and total
    NEW.tax_amount := (NEW.subtotal * NEW.tax_rate) / 100;
    NEW.total := NEW.subtotal + NEW.tax_amount;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate totals when document is updated
CREATE TRIGGER trigger_calculate_document_totals
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION calculate_document_totals();

-- Function to create accounting entry when document status changes
CREATE OR REPLACE FUNCTION create_accounting_entry_on_document_change()
RETURNS TRIGGER AS $$
DECLARE
    entry_type TEXT;
    category TEXT;
BEGIN
    -- Only process if status changed
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    -- Determine accounting entry type based on document type and status
    IF NEW.type = 'invoice' AND NEW.status = 'sent' THEN
        entry_type := 'receivable';
        category := 'Accounts Receivable';
    ELSIF NEW.type = 'invoice' AND NEW.status = 'paid' THEN
        entry_type := 'income';
        category := 'Sales Revenue';
    ELSIF NEW.type = 'quote' AND NEW.status = 'accepted' THEN
        entry_type := 'receivable';
        category := 'Pending Revenue';
    ELSE
        RETURN NEW;
    END IF;
    
    -- Create accounting entry
    INSERT INTO accounting_entries (
        user_id,
        document_id,
        type,
        category,
        description,
        amount,
        entry_date,
        due_date,
        status,
        reference
    ) VALUES (
        NEW.user_id,
        NEW.id,
        entry_type,
        category,
        NEW.title,
        NEW.total,
        CURRENT_DATE,
        NEW.due_date,
        CASE WHEN NEW.status = 'paid' THEN 'paid' ELSE 'pending' END,
        NEW.document_number
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create accounting entries
CREATE TRIGGER trigger_create_accounting_entry
    AFTER UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION create_accounting_entry_on_document_change();

-- Insert sample data
DO $$
DECLARE
    current_user_id UUID;
    sample_contact_id UUID;
    sample_company_id UUID;
    sample_product_id UUID;
    sample_document_id UUID;
BEGIN
    -- Get current user
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;
    
    -- Get sample contact
    SELECT id INTO sample_contact_id FROM contacts LIMIT 1;
    
    -- Get sample company
    SELECT id INTO sample_company_id FROM companies LIMIT 1;
    
    -- Get sample product
    SELECT id INTO sample_product_id FROM products LIMIT 1;
    
    -- Create sample document
    INSERT INTO documents (
        user_id,
        type,
        title,
        contact_id,
        company_id,
        subtotal,
        tax_rate,
        tax_amount,
        total,
        status,
        document_number
    ) VALUES (
        current_user_id,
        'quote',
        'Sample Quote for Web Development',
        sample_contact_id,
        sample_company_id,
        5000.00,
        20.00,
        1000.00,
        6000.00,
        'draft',
        generate_document_number('quote')
    ) RETURNING id INTO sample_document_id;
    
    -- Create sample document items
    IF sample_product_id IS NOT NULL THEN
        INSERT INTO document_items (
            document_id,
            product_id,
            product_name,
            description,
            quantity,
            unit_price,
            total
        ) VALUES (
            sample_document_id,
            sample_product_id,
            'Web Development Service',
            'Custom website development with responsive design',
            1,
            5000.00,
            5000.00
        );
    END IF;
END $$;
