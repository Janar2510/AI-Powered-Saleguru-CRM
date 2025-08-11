import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthNavigator: React.FC = () => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't navigate while loading
    if (loading) {
      console.log('AuthNavigator: Still loading, waiting...');
      return;
    }

    // Debug log
    console.log('AuthNavigator:', {
      user,
      loading,
      session,
      pathname: location.pathname,
      onboarding_completed: user?.onboarding_completed,
      hasSession: !!session
    });

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    const isOnboardingPage = location.pathname === '/onboarding';
    const isAuthCallbackPage = location.pathname === '/auth/callback';
    const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/';
    const isAdminPage = location.pathname === '/admin';

    // If user is not authenticated and not on auth pages, redirect to login
    if (!user && !isAuthPage && !isAuthCallbackPage) {
      console.log('AuthNavigator: No user, redirecting to login');
      navigate('/login');
      return;
    }

    // If user is authenticated
    if (user) {
      // Treat undefined onboarding_completed as false
      const onboardingDone = user.onboarding_completed === true;
      const isAdmin = user.role === 'admin';

      console.log('AuthNavigator: User authenticated', {
        onboardingDone,
        isAdmin,
        currentPath: location.pathname
      });

      // If on auth pages, redirect based on onboarding status and role
      if (isAuthPage) {
        if (!onboardingDone) {
          console.log('AuthNavigator: Redirecting to onboarding from auth page');
          navigate('/onboarding');
        } else if (isAdmin) {
          console.log('AuthNavigator: Redirecting to admin from auth page');
          navigate('/admin');
        } else {
          console.log('AuthNavigator: Redirecting to dashboard from auth page');
          navigate('/dashboard');
        }
        return;
      }

      // If user needs onboarding but not on onboarding page
      if (!onboardingDone && !isOnboardingPage) {
        // TEMPORARY: Allow users to stay on dashboard for testing
        if (location.pathname === '/dashboard' || location.pathname === '/') {
          console.log('AuthNavigator: TEMPORARY - Allowing user to stay on dashboard despite incomplete onboarding');
          return;
        }
        
        console.log('AuthNavigator: User needs onboarding, redirecting');
        navigate('/onboarding');
        return;
      }

      // If user completed onboarding but on onboarding page
      if (onboardingDone && isOnboardingPage) {
        if (isAdmin) {
          console.log('AuthNavigator: Admin completed onboarding, redirecting to admin');
          navigate('/admin');
        } else {
          console.log('AuthNavigator: User completed onboarding, redirecting to dashboard');
          navigate('/dashboard');
        }
        return;
      }

      // If admin user tries to access dashboard, redirect to /admin
      if (isAdmin && isDashboardPage && !isAdminPage) {
        console.log('AuthNavigator: Admin accessing dashboard, redirecting to admin');
        navigate('/admin');
        return;
      }
    }

    // Handle sign out - only if we have no session and we're not on auth pages
    if (!session && !isAuthPage && !isAuthCallbackPage) {
      console.log('AuthNavigator: No session, redirecting to login');
      navigate('/login');
    }
  }, [user, loading, session, location.pathname, navigate]);

  // Don't render anything - this component only handles navigation
  return null;
};

export default AuthNavigator; 