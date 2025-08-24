## Deployment Checklist Additions

### Core Features
- [ ] useFeatureLock: Feature gating works for all plans and dev mode
- [ ] DebugTools: All tabs and export/copy work
- [ ] Password reset: End-to-end flow works
- [ ] admin_email: Field is present and enforced in users table

### Subscriptions System (Latest Addition)
- [x] Database migration: subscriptions, subscription_invoices, subscription_changes tables created
- [x] Subscription CRUD operations: Create, read, update, delete functionality
- [x] Lifecycle management: Pause, resume, cancel with proper workflows
- [x] Billing cycles: Daily, weekly, monthly, quarterly, yearly support
- [x] Financial calculations: Setup fees, discounts, tax handling
- [x] Multi-currency support: EUR, USD, GBP with proper formatting
- [x] BrandDesignContext integration: Consistent styling and animations
- [x] Statistics dashboard: MRR, churn rate, active revenue display
- [x] Search and filtering: By subscription number, plan name, customer
- [x] Customer portal integration: Subscriptions visible to portal users
- [x] Audit trail: Complete change tracking for all modifications
- [x] Auto-numbering: Subscription number generation (SUB-XXXX)
- [x] PostgreSQL functions: Billing calculations and status management
- [x] Error handling: Graceful fallbacks and null safety
- [x] Responsive design: Mobile and desktop optimized
- [ ] Automated billing: Recurring invoice generation (future enhancement)
- [ ] Payment processing: Automatic payment collection (future enhancement)
- [ ] Email notifications: Billing reminders and status updates (future enhancement)

### Database Schema Verification (Subscriptions)
- [x] subscriptions table: All required columns present
- [x] subscription_invoices table: Billing period tracking complete
- [x] subscription_changes table: Audit trail enabled
- [x] Sample data: Test subscriptions populated
- [x] Permissions: Proper RLS and grants configured
- [x] Functions: Billing calculations and lifecycle management working

### Integration Points (Subscriptions)
- [x] Navigation: Subscriptions accessible from sidebar
- [x] Routing: All subscription routes functional (/subscriptions, /subscriptions/create, /subscriptions/:id)
- [x] Customer portal: Portal users can view their subscriptions
- [x] Financial integration: Revenue tracking and MRR calculations
- [x] Contact system: Customer selection and management
- [x] Invoice system: Ready for automatic invoice generation
- [x] Accounting system: Financial data integration ready

### Invoices System
- [x] Database migration: invoices, invoice_items, invoice_payments tables created
- [x] Invoice CRUD operations: Create, read, update, delete functionality
- [x] Payment recording: Track payments against invoices
- [x] Status management: Draft, sent, paid, overdue, cancelled, partially_paid
- [x] Multi-currency support: EUR, USD, GBP with proper formatting
- [x] BrandDesignContext integration: Consistent styling and animations
- [x] Statistics dashboard: Total value, outstanding, paid invoices display
- [x] Search and filtering: By invoice number, customer name, status
- [x] Customer portal integration: Invoices visible to portal users
- [x] Quote to invoice conversion: Function implemented
- [x] Line items management: Multiple products per invoice
- [x] Financial calculations: Automatic subtotal, tax, total calculations
- [x] Error handling: Graceful fallbacks and null safety
- [x] Responsive design: Mobile and desktop optimized
- [ ] PDF generation: Invoice PDF export functionality (future enhancement)
- [ ] Email integration: Send invoices via email (future enhancement)
- [ ] Tax calculations: Advanced tax rules (future enhancement)

### Database Schema Verification
- [x] invoices table: All required columns present
- [x] invoice_items table: Line item structure complete  
- [x] invoice_payments table: Payment tracking enabled
- [x] Sample data: Test invoices populated
- [x] Permissions: Proper RLS and grants configured
- [x] Functions: Invoice number generation working

### Integration Points
- [x] Navigation: Invoices accessible from sidebar
- [x] Routing: All invoice routes functional (/invoices, /invoices/create, /invoices/:id)
- [x] Contacts integration: Customer selection working
- [x] Organizations integration: Business customer support
- [x] Deals integration: Invoice-deal relationships
- [x] Customer portal: Portal users can view their invoices
- [x] Accounting system: Financial data integration ready 