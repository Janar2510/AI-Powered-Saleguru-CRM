# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2024-12-19

### Added
- **Sales Order Management System**
  - Complete sales order flow: Quotation → Order → Proforma → Invoice
  - Advanced invoicing with multiple calculation methods (ordered, delivered, time & materials)
  - Product kit management with variant grid entry
  - Partial shipment tracking and management
  - Email gateway integration for order communications
  - Inter-company order rules and mirroring
  - Invoice aging reports and payment terms management
  - Customer portal integration for order self-service

- **Document Management System**
  - Document upload, download, and modification capabilities
  - PDF preview functionality with zoom and navigation
  - Multiple view modes: cards, table, list, grid
  - Advanced search and filtering system
  - Document template selector with preview functionality
  - Document generation service with enhanced templates
  - Customer portal document access and management

- **eSignature System**
  - PDF upload and signature field placement
  - Internal and customer-side eSigning workflows
  - Secure document storage and linking to sales orders
  - Signature status tracking and management
  - Integration with quotation builder and sales orders

- **Quotation Builder Enhancements**
  - Upselling suggestions and additional product recommendations
  - Electronic signature integration for quote acceptance
  - Variant grid entry for product combinations
  - Quote to sales order conversion in one click
  - Customer self-confirmation via portal

- **Customer Portal Features**
  - Live document viewing and management
  - eSign confirmation for quotes and contracts
  - Order modification capabilities
  - Real-time delivery tracking
  - Document download and preview functionality

- **Permission System**
  - Role-based access control (admin, manager, user)
  - Permission-aware delete operations
  - Warehouse and accounting module protection
  - DeleteConfirmationModal for safe operations

- **Accounting System Enhancements**
  - Quotation, Order, Proforma, Invoice flow
  - Unique numbering system for all document types
  - Advanced filtering and search capabilities
  - Multiple view modes for better organization

### Enhanced
- **Document Generation Service**
  - Enhanced template system with more fields
  - Improved design elements and styling
  - Better calculation handling for totals and taxes
  - Support for company details, discounts, shipping, Incoterms

- **UI Components**
  - DocumentUploader component with drag & drop
  - PDFPreview component with zoom controls
  - ViewChooser component for multiple view modes
  - Enhanced Card and Button components

### Fixed
- Database migration issues with foreign key constraints
- JSX syntax errors in component structure
- Null reference errors in toFixed() calculations
- Import errors for Lucide React icons
- Toast notification parameter structure

### Technical
- Added comprehensive database migrations for new features
- Implemented Row Level Security (RLS) policies
- Enhanced error handling and user feedback
- Improved component architecture and reusability

## [Previous Versions]
- Initial CRM implementation with basic features
- Authentication and user management
- Basic dashboard and analytics
- Contact and company management
- Deal tracking and pipeline management