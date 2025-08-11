import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Deals from './pages/Deals';
import { DealDetail } from './pages/DealDetail';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Emails from './pages/Emails';
import EmailTemplates from './pages/EmailTemplates';
import Analytics from './pages/Analytics';
import LeadScoring from './pages/LeadScoring';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import WelcomeDashboard from './pages/WelcomeDashboard';
import AutomationBuilder from './pages/AutomationBuilder';
import Marketplace from './pages/Marketplace';
import Calls from './pages/Calls';
import SocialMentions from './pages/SocialMentions';
import ProjectDetailView from './pages/ProjectDetailView';
import Projects from './pages/Projects';
import { ToastProvider } from './contexts/ToastContext';
import { GuruProvider } from './contexts/GuruContext';
import { PlanProvider } from './contexts/PlanContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { AuthProvider } from './contexts/AuthContext';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AuthCallback from './components/auth/AuthCallback';
import AuthNavigator from './components/auth/AuthNavigator';
import Spline from '@splinetool/react-spline';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DebugTools from './pages/DebugTools';
import { DevModeProvider } from './contexts/DevModeContext';
import { ModalProvider } from './contexts/ModalContext';
import { PermissionProvider } from './contexts/PermissionContext';
import Admin from './pages/Admin';
import Pulse from './pages/Pulse';
import Accounting from './pages/Accounting';
import WarehousePage from './pages/Warehouse';
import DocumentTemplates from './pages/DocumentTemplates';
import Payments from './pages/Payments';
import CustomerPortalPage from './pages/CustomerPortal';
import ESignaturePage from './pages/eSignature';
import SalesOrders from './pages/SalesOrders';
import QuotationBuilderPage from './pages/QuotationBuilder';
import TestPage from './pages/TestPage';
import SmartMailboxManager from './components/emails/SmartMailboxManager';
import AIWritingAssistant from './components/emails/AIWritingAssistant';
import NewDocument from './pages/documents/new';
import Invoices from './pages/Invoices';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/onboarding';

  return (
    <>
      {/* Global Spline 3D Background - ONLY background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      <div className="relative z-10 min-h-screen">
        {/* Auth Navigator - handles automatic navigation */}
        <AuthNavigator />
        {isAuthPage ? (
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <GuruProvider>
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/signin" element={<Navigate to="/login" replace />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Leads */}
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/leads/:id" element={<LeadDetail />} />
                  
                  {/* Contacts */}
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/contacts/:id" element={<ContactDetail />} />
                  
                  {/* Companies */}
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/companies/:id" element={<CompanyDetail />} />
                  
                  {/* Deals */}
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/deals/:id" element={<DealDetail />} />
                  
                  {/* Quotes - Commented out until components are created */}
                  {/* <Route path="/quotes" element={<Quotes />} /> */}
                  {/* <Route path="/quotes/new" element={<NewQuote />} /> */}
                  {/* <Route path="/quotes/:id" element={<QuoteDetail />} /> */}
                  
                  {/* Sales Orders */}
                  <Route path="/sales-orders" element={<SalesOrders />} />
                  {/* <Route path="/sales-orders/:id" element={<SalesOrderDetail />} /> */}
                  
                  {/* Invoices */}
                  <Route path="/invoices" element={<Invoices />} />
                  {/* <Route path="/invoices/:id" element={<InvoiceDetail />} /> */}
                  
                  {/* Warehouse */}
                  <Route path="/warehouse" element={<WarehousePage />} />
                  {/* <Route path="/warehouse/locations" element={<WarehouseLocations />} /> */}
                  {/* <Route path="/warehouse/moves" element={<WarehouseMoves />} /> */}
                  {/* <Route path="/warehouse/products" element={<WarehouseProducts />} /> */}
                  
                  {/* Accounting */}
                  <Route path="/accounting" element={<Accounting />} />
                  {/* <Route path="/accounting/journals" element={<AccountingJournals />} /> */}
                  {/* <Route path="/accounting/accounts" element={<AccountingAccounts />} /> */}
                  {/* <Route path="/accounting/ledger" element={<AccountingLedger />} /> */}
                  {/* <Route path="/accounting/reports" element={<AccountingReports />} /> */}
                  
                  {/* Payments */}
                  <Route path="/payments" element={<Payments />} />
                  {/* <Route path="/payments/:id" element={<PaymentDetail />} /> */}
                  
                  {/* Documents */}
                  {/* <Route path="/documents" element={<Documents />} /> */}
                  <Route path="/documents/new" element={<NewDocument />} />
                  {/* <Route path="/documents/:id" element={<DocumentDetail />} /> */}
                  
                  {/* Templates */}
                  {/* <Route path="/templates" element={<Templates />} /> */}
                  {/* <Route path="/templates/:id" element={<TemplateDetail />} /> */}
                  
                  {/* E-Signature */}
                  <Route path="/esign" element={<ESignaturePage />} />
                  {/* <Route path="/esign/:id" element={<ESignatureDetail />} /> */}
                  
                  {/* Settings */}
                  <Route path="/settings" element={<Settings />} />
                  {/* <Route path="/settings/branding" element={<SettingsBranding />} /> */}
                  {/* <Route path="/settings/payments" element={<SettingsPayments />} /> */}
                  {/* <Route path="/settings/warehouse" element={<SettingsWarehouse />} /> */}
                  {/* <Route path="/settings/accounting" element={<SettingsAccounting />} /> */}
                  
                  {/* Portal Routes (separate chunk) */}
                  {/* <Route path="/portal" element={<PortalLogin />} /> */}
                  {/* <Route path="/portal/login" element={<PortalLogin />} /> */}
                  {/* <Route path="/portal/quotes" element={<PortalQuotes />} /> */}
                  {/* <Route path="/portal/quotes/:id" element={<PortalQuoteDetail />} /> */}
                  {/* <Route path="/portal/orders" element={<PortalOrders />} /> */}
                  {/* <Route path="/portal/invoices" element={<PortalInvoices />} /> */}
                  {/* <Route path="/portal/invoices/:id" element={<PortalInvoiceDetail />} /> */}
                  {/* <Route path="/portal/deliveries" element={<PortalDeliveries />} /> */}
                  
                  {/* Existing Routes */}
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/emails" element={<Emails />} />
                  <Route path="/email-templates" element={<EmailTemplates />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/lead-scoring" element={<LeadScoring />} />
                  <Route path="/calls" element={<Calls />} />
                  <Route path="/social-mentions" element={<SocialMentions />} />
                  <Route path="/automation" element={<AutomationBuilder />} />
                  <Route path="/pulse" element={<Pulse />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/notifications" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/projects/:projectId" element={<ProjectDetailView />} />
                  <Route path="/debug" element={<DebugTools />} />
                  <Route path="/admin" element={
                    <ProtectedRoute requireRole="admin">
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/document-templates" element={<DocumentTemplates />} />
                  <Route path="/customer-portal" element={<CustomerPortalPage />} />
                  <Route path="/esignature" element={<ESignaturePage />} />
                  <Route path="/quotation-builder" element={<QuotationBuilderPage />} />
                  <Route path="/test" element={<TestPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          </GuruProvider>
        )}
      </div>
    </>
  );
}

function App() {
  useEffect(() => {
    localStorage.setItem('onboardingCompleted', 'true');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PlanProvider>
          <SubscriptionProvider>
            <AuthProvider>
              <PermissionProvider>
                <DevModeProvider>
                  <ModalProvider>
                    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                      <AppRoutes />
                    </Router>
                  </ModalProvider>
                </DevModeProvider>
              </PermissionProvider>
            </AuthProvider>
          </SubscriptionProvider>
        </PlanProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;