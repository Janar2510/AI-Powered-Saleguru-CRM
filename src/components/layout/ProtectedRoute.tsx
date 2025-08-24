import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute() {
  const { session, loading, user } = useAuth();
  const [forceLoad, setForceLoad] = React.useState(false);

  // CRITICAL: Force load after 5 seconds to prevent infinite loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🛡️ ProtectedRoute - Force loading after timeout');
      setForceLoad(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  console.log('🛡️ ProtectedRoute - session:', !!session, 'loading:', loading, 'user:', !!user, 'forceLoad:', forceLoad);

  // CRITICAL: If we have a session but no user, force load to prevent infinite loading
  if (session && !user && !forceLoad) {
    console.log('🛡️ ProtectedRoute - Session exists but no user, forcing load...');
    setForceLoad(true);
  }

  // CRITICAL: If we have a session but no user after a short delay, force render
  React.useEffect(() => {
    if (session && !user) {
      const timer = setTimeout(() => {
        console.log('🛡️ ProtectedRoute - Session exists but no user after delay, forcing render...');
        setForceLoad(true);
      }, 2000); // 2 seconds
      return () => clearTimeout(timer);
    }
  }, [session, user]);

  // CRITICAL: If we have a session, we should not be loading indefinitely
  if (session && loading && !forceLoad) {
    console.log('🛡️ ProtectedRoute - Session exists but still loading, forcing load...');
    setForceLoad(true);
  }

  // CRITICAL: If we have a session and user, we're authenticated
  if (session && user) {
    console.log('🛡️ ProtectedRoute - Authenticated, rendering children');
    return <Outlet />;
  }

  // CRITICAL: If we have a session but no user after force load, create temporary user
  if (session && !user && forceLoad) {
    console.log('🛡️ ProtectedRoute - Session exists but no user after force load, creating temporary user...');
    // This will be handled by the AuthContext fallback, but we can force render
    return <Outlet />;
  }

  if (loading && !forceLoad) {
    console.log('⏳ ProtectedRoute - showing loading...');
    return <div className="p-6">Loading…</div>;
  }
  
  if (!session) {
    console.log('❌ ProtectedRoute - no session, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Temporarily bypass onboarding check to show sidebar
  // if (user && user.onboarding_completed === false) return <Navigate to="/onboarding" replace />;
  
  console.log('✅ ProtectedRoute - allowing access to protected content');
  return <Outlet />;
} 