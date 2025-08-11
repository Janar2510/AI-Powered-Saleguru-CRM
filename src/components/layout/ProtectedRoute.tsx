import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  requireRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = false,
  requireRole
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Detailed debug log
  console.log('ProtectedRoute:', {
    user,
    loading,
    pathname: location.pathname,
    onboarding_completed: user?.onboarding_completed,
    requireRole
  });

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('Redirecting to login - no user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Treat undefined onboarding_completed as false
  const onboardingDone = user.onboarding_completed === true;

  // Redirect to onboarding if required and not completed
  if (requireOnboarding && !onboardingDone) {
    console.log('Redirecting to onboarding - not completed');
    return <Navigate to="/onboarding" replace />;
  }

  // Role-based access control
  if (requireRole && user.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-300">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Show protected content
  return <>{children}</>;
};

export default ProtectedRoute; 