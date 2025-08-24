import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { GuruProvider } from './contexts/GuruContext';
import { ModalProvider } from './contexts/ModalContext';
import { BrandDesignProvider } from './contexts/BrandDesignContext';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
                        <ToastProvider>
                  <GuruProvider>
                    <ModalProvider>
                      <BrandDesignProvider>
                        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                          <AppRoutes />
                        </Router>
                      </BrandDesignProvider>
                    </ModalProvider>
                  </GuruProvider>
                </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;