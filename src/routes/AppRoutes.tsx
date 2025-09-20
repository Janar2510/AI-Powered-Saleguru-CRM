import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

// Lazy imports
const Home = React.lazy(() => import('../pages/Home'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Deals = React.lazy(() => import('../pages/Deals'));
const DealsEnhanced = React.lazy(() => import('../pages/DealsEnhanced'));
const DealDetailComprehensive = React.lazy(() => import('../pages/DealDetailComprehensive'));
const Leads = React.lazy(() => import('../pages/Leads'));
const Contacts = React.lazy(() => import('../pages/Contacts'));
const ContactDetail = React.lazy(() => import('../pages/ContactDetail'));
const Organizations = React.lazy(() => import('../pages/Organizations'));
const OrganizationDetail = React.lazy(() => import('../pages/OrganizationDetail'));
const Companies = React.lazy(() => import('../pages/Companies'));
const Tasks = React.lazy(() => import('../pages/Tasks'));
const Calendar = React.lazy(() => import('../pages/Calendar'));
const Automations = React.lazy(() => import('../pages/Automations'));
const AutomationDetail = React.lazy(() => import('../pages/AutomationDetail'));
const AutomationNew = React.lazy(() => import('../pages/AutomationNew'));
const AutomationTemplates = React.lazy(() => import('../pages/AutomationTemplates'));
const Emails = React.lazy(() => import('../pages/Emails'));
const EmailTemplates = React.lazy(() => import('../pages/EmailTemplates'));
const Guru = React.lazy(() => import('../pages/Guru'));
const LeadScoring = React.lazy(() => import('../pages/LeadScoring'));
const Intelligence = React.lazy(() => import('../pages/Intelligence'));
const Gamification = React.lazy(() => import('../pages/Gamification'));
const SocialCRM = React.lazy(() => import('../pages/SocialCRM'));
const Analytics = React.lazy(() => import('../pages/Analytics'));
const Products = React.lazy(() => import('../pages/Products'));
const Accounting = React.lazy(() => import('../pages/Accounting'));
const Quotes = React.lazy(() => import('../pages/Quotes'));
const QuoteCreate = React.lazy(() => import('../pages/QuoteCreate'));
const SalesOrders = React.lazy(() => import('../pages/SalesOrders'));
const SalesOrderCreate = React.lazy(() => import('../pages/SalesOrderCreate'));
const ShippingManagement = React.lazy(() => import('../pages/ShippingManagement'));
const Offers = React.lazy(() => import('../pages/Offers'));
const Invoices = React.lazy(() => import('../pages/Invoices'));
const InvoiceCreate = React.lazy(() => import('../pages/InvoiceCreate'));
const Subscriptions = React.lazy(() => import('../pages/Subscriptions'));
const SubscriptionCreate = React.lazy(() => import('../pages/SubscriptionCreate'));
const DocumentsComprehensive = React.lazy(() => import('../pages/DocumentsComprehensive'));
const Marketplace = React.lazy(() => import('../pages/Marketplace'));
const Settings = React.lazy(() => import('../pages/Settings'));
const DealDetailTest = React.lazy(() => import('../components/test/DealDetailTest'));

// Portal routes
const PortalLogin = React.lazy(() => import('../pages/portal/PortalLogin'));
const PortalDashboard = React.lazy(() => import('../pages/portal/PortalDashboard'));
const PortalOrders = React.lazy(() => import('../pages/portal/PortalOrders'));
const PortalInvoices = React.lazy(() => import('../pages/portal/PortalInvoices'));
const PortalQuotes = React.lazy(() => import('../pages/portal/PortalQuotes'));
const PortalDocumentsEnhanced = React.lazy(() => import('../pages/portal/PortalDocumentsEnhanced'));
const PortalWarranty = React.lazy(() => import('../pages/portal/PortalWarranty'));
const PortalProfile = React.lazy(() => import('../pages/portal/PortalProfile'));
const PortalLayout = React.lazy(() => import('../components/portal/PortalLayout'));

import { BrandBackground } from '../contexts/BrandDesignContext';

function AppLayout({ children }: { children: React.ReactNode }) {
  console.log('AppLayout rendering with children:', children);
  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-auto transition-all duration-300">
        <BrandBackground>
          <div className="w-full px-5 py-6">
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              {children}
            </React.Suspense>
          </div>
        </BrandBackground>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  console.log('AppRoutes rendering - with placeholder Deals, Leads, Contacts, and Tasks');
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<div className="min-h-screen bg-[#0f0f23] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Login</h1>
          <p>Please log in to continue</p>
        </div>
      </div>} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/deals" element={<AppLayout><DealsEnhanced /></AppLayout>} />
        <Route path="/deals/:id" element={<AppLayout><DealDetailComprehensive /></AppLayout>} />
        <Route path="/deals-old" element={<AppLayout><Deals /></AppLayout>} />
        <Route path="/leads" element={<AppLayout><Leads /></AppLayout>} />
        <Route path="/contacts" element={<AppLayout><Contacts /></AppLayout>} />
        <Route path="/contacts/:id" element={<AppLayout><ContactDetail /></AppLayout>} />
        <Route path="/organizations" element={<AppLayout><Organizations /></AppLayout>} />
        <Route path="/organizations/:id" element={<AppLayout><OrganizationDetail /></AppLayout>} />
        <Route path="/tasks" element={<AppLayout><Tasks /></AppLayout>} />
        <Route path="/calendar" element={<AppLayout><Calendar /></AppLayout>} />
        <Route path="/automations" element={<AppLayout><Automations /></AppLayout>} />
        <Route path="/automations/templates" element={<AppLayout><AutomationTemplates /></AppLayout>} />
        <Route path="/automations/new" element={<AppLayout><AutomationNew /></AppLayout>} />
        <Route path="/automations/:id" element={<AppLayout><AutomationDetail /></AppLayout>} />
        <Route path="/emails" element={<AppLayout><Emails /></AppLayout>} />
        <Route path="/email-templates" element={<AppLayout><EmailTemplates /></AppLayout>} />
        <Route path="/guru" element={<AppLayout><Guru /></AppLayout>} />
        <Route path="/lead-scoring" element={<AppLayout><LeadScoring /></AppLayout>} />
        <Route path="/intelligence" element={<AppLayout><Intelligence /></AppLayout>} />
        <Route path="/gamification" element={<AppLayout><Gamification /></AppLayout>} />
        <Route path="/social-crm" element={<AppLayout><SocialCRM /></AppLayout>} />
        <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
        <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
        <Route path="/accounting/*" element={<AppLayout><Accounting /></AppLayout>} />
        <Route path="/quotes" element={<AppLayout><Quotes /></AppLayout>} />
        <Route path="/quotes/create" element={<AppLayout><QuoteCreate /></AppLayout>} />
        <Route path="/quotes/:id/edit" element={<AppLayout><QuoteCreate /></AppLayout>} />
        <Route path="/quotes/:id" element={<AppLayout><QuoteCreate /></AppLayout>} />
        <Route path="/sales-orders" element={<AppLayout><SalesOrders /></AppLayout>} />
        <Route path="/sales-orders/create" element={<AppLayout><SalesOrderCreate /></AppLayout>} />
        <Route path="/sales-orders/:id/edit" element={<AppLayout><SalesOrderCreate /></AppLayout>} />
        <Route path="/sales-orders/:id" element={<AppLayout><SalesOrderCreate /></AppLayout>} />
        <Route path="/sales-orders/:id/shipping" element={<AppLayout><ShippingManagement /></AppLayout>} />
        <Route path="/offers" element={<AppLayout><div className="min-h-screen bg-[#0f0f23] text-white p-6">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4 text-orange-400">Offers</h1>
            <p className="text-xl text-gray-400">Offer management coming soon...</p>
          </div>
        </div></AppLayout>} />
        <Route path="/invoices" element={<AppLayout><Invoices /></AppLayout>} />
        <Route path="/invoices/create" element={<AppLayout><InvoiceCreate /></AppLayout>} />
        <Route path="/invoices/:id" element={<AppLayout><InvoiceCreate /></AppLayout>} />
        <Route path="/invoices/:id/edit" element={<AppLayout><InvoiceCreate /></AppLayout>} />
        <Route path="/subscriptions" element={<AppLayout><Subscriptions /></AppLayout>} />
        <Route path="/subscriptions/create" element={<AppLayout><SubscriptionCreate /></AppLayout>} />
        <Route path="/subscriptions/:id" element={<AppLayout><SubscriptionCreate /></AppLayout>} />
        <Route path="/subscriptions/:id/edit" element={<AppLayout><SubscriptionCreate /></AppLayout>} />
        <Route path="/documents" element={<AppLayout><DocumentsComprehensive /></AppLayout>} />
        <Route path="/documents/create" element={<AppLayout><DocumentsComprehensive /></AppLayout>} />
        <Route path="/documents/:id" element={<AppLayout><DocumentsComprehensive /></AppLayout>} />
        <Route path="/documents/:id/edit" element={<AppLayout><DocumentsComprehensive /></AppLayout>} />
        <Route path="/documents/:id/sign" element={<AppLayout><DocumentsComprehensive /></AppLayout>} />
        <Route path="/marketplace" element={<AppLayout><Marketplace /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><div className="min-h-screen bg-[#0f0f23] text-white p-6">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4 text-gray-400">Settings</h1>
            <p className="text-xl text-gray-400">Settings coming soon...</p>
          </div>
        </div></AppLayout>} />
        <Route path="/test-deal-detail" element={<AppLayout><DealDetailTest /></AppLayout>} />
        
        {/* Portal routes - public access */}
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal" element={<PortalLayout><PortalDashboard /></PortalLayout>} />
        <Route path="/portal/orders" element={<PortalLayout><PortalOrders /></PortalLayout>} />
        <Route path="/portal/invoices" element={<PortalLayout><PortalInvoices /></PortalLayout>} />
        <Route path="/portal/quotes" element={<PortalLayout><PortalQuotes /></PortalLayout>} />
        <Route path="/portal/documents" element={<PortalLayout><PortalDocumentsEnhanced /></PortalLayout>} />
        <Route path="/portal/documents/:id/sign" element={<PortalLayout><PortalDocumentsEnhanced /></PortalLayout>} />
        <Route path="/portal/warranty" element={<PortalLayout><PortalWarranty /></PortalLayout>} />
        <Route path="/portal/profile" element={<PortalLayout><PortalProfile /></PortalLayout>} />
      </Route>
    </Routes>
  );
}
