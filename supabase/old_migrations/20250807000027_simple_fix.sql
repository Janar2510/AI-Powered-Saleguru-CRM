-- Simple Fix for Number Columns (2025-08-07)

-- Add quotation_number column
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS quotation_number TEXT;

-- Add order_number column  
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS order_number TEXT;

-- Add invoice_number column
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Add status columns
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Add date columns
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_date DATE DEFAULT CURRENT_DATE;

-- Add amount columns
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS subtotal DECIMAL(15,2) DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) DEFAULT 0;

ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(15,2) DEFAULT 0;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) DEFAULT 0;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(15,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) DEFAULT 0;

-- Add currency columns
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Add other missing columns
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'standard';

-- Update existing records with simple numbers
UPDATE quotations SET quotation_number = 'Q000001' WHERE quotation_number IS NULL OR quotation_number = '';
UPDATE sales_orders SET order_number = 'SO000001' WHERE order_number IS NULL OR order_number = '';
UPDATE invoices SET invoice_number = 'I000001' WHERE invoice_number IS NULL OR invoice_number = '';

SELECT 'Migration completed successfully!' as status; 