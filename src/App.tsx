import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Deals from './pages/Deals';
import Contacts from './pages/Contacts';
import Companies from './pages/Companies';
import Leads from './pages/Leads';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Emails from './pages/Emails';
import EmailTemplates from './pages/EmailTemplates';
import Analytics from './pages/Analytics';
import LeadScoring from './pages/LeadScoring';
import Offers from './pages/Offers';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import WelcomeDashboard from './pages/WelcomeDashboard';
import AutomationBuilder from './pages/AutomationBuilder';
import { ToastProvider } from './contexts/ToastContext';
import { GuruProvider } from './contexts/GuruContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Force onboarding to be completed
  useEffect(() => {
    localStorage.setItem('onboardingCompleted', 'true');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-secondary-900" data-theme="dark">
          <Router>
            <GuruProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/emails" element={<Emails />} />
                  <Route path="/email-templates" element={<EmailTemplates />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/lead-scoring" element={<LeadScoring />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/automation" element={<AutomationBuilder />} />
                  <Route path="/onboarding" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </GuruProvider>
          </Router>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;