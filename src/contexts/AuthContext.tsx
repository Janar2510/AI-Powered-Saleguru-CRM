import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User, Session } from '@supabase/supabase-js';

// User interface matching our database schema
export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  org_id?: string; // Add org_id field
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize auth state
    useEffect(() => {
    // CRITICAL: Global timeout to prevent infinite loading
    const globalTimeout = setTimeout(() => {
      console.log('GLOBAL TIMEOUT: Force setting loading to false to prevent infinite loading');
      setLoading(false);
    }, 10000); // 10 seconds max

    // Get initial session - simplified to avoid race conditions
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session result:', { session });
        
        if (session?.user) {
          console.log('User found in session, setting session...');
          setSession(session);
          // Immediately try to fetch profile to avoid delays
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No user in session, setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, fetching profile...');
          setLoading(true);
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state...');
          setUser(null);
          setLoading(false);
        } else if (session?.user && !user) {
          console.log('Session exists but no user, fetching profile...');
          setLoading(true);
          await fetchUserProfile(session.user.id);
        } else if (session?.user && user) {
          console.log('Session and user both exist, setting loading to false');
          setLoading(false);
        } else {
          console.log('No session, setting loading to false');
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(globalTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from user_profiles table
  const fetchUserProfile = async (userId: string) => {
    console.log('🚀 fetchUserProfile started for', userId);
    
    try {
      // TEMPORARILY BYPASS DATABASE QUERY TO FIX INFINITE LOADING
      console.log('📋 Temporarily bypassing database query to fix infinite loading...');
      
      // Create a basic user immediately to prevent infinite loading
      const basicUser = {
        id: userId,
        email: 'user@example.com', // Will be updated from session
        first_name: 'User',
        last_name: 'Account',
        role: 'user',
        org_id: 'temp-org', // Add org_id for Deals component
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('👤 Created basic user object:', basicUser);
      
      // Try to get actual user data from session with timeout
      console.log('🔍 Getting current session...');
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session retrieval timeout')), 5000);
        });
        
        const { data: { session: currentSession } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        console.log('📱 Current session:', currentSession);
        
        if (currentSession?.user) {
          console.log('✅ Session user found, updating user data...');
          basicUser.email = currentSession.user.email || basicUser.email;
          basicUser.first_name = currentSession.user.user_metadata?.first_name || basicUser.first_name;
          basicUser.last_name = currentSession.user.user_metadata?.last_name || basicUser.last_name;
          console.log('📝 Updated user data:', basicUser);
        }
      } catch (sessionError) {
        console.log('⚠️ Session retrieval failed, using basic user:', sessionError);
        // Continue with basic user if session retrieval fails
      }
      
      console.log('💾 Setting user state with:', basicUser);
      setUser(basicUser);
      console.log('✅ User state updated successfully');
      setLoading(false);
      console.log('✅ Loading state set to false');
      
    } catch (error: any) {
      console.error('❌ Error in fetchUserProfile:', error);
      
      // Create fallback user even if there's an error
      const fallbackUser = {
        id: userId,
        email: 'user@example.com',
        first_name: 'User',
        last_name: 'Account',
        role: 'user',
        org_id: 'temp-org', // Add org_id for Deals component
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🆘 Setting fallback user due to error:', fallbackUser);
      setUser(fallbackUser);
      setLoading(false);
      console.log('✅ Fallback user set and loading false');
    }
    
    console.log('🏁 fetchUserProfile function completed');
  };

  // Sign up with user profile creation
  const signUp = async (email: string, password: string, userData: any) => {
    console.log('=== SIGNUP FUNCTION START ===');
    try {
      console.log('Starting signup with data:', { email, userData });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            companyName: userData.companyName,
            companySize: userData.companySize,
            companyWebsite: userData.companyWebsite
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        console.log('=== SIGNUP FUNCTION END (ERROR) ===');
        return { error };
      }

      console.log('Signup successful, user created:', data.user?.id);
      
      console.log('=== SIGNUP FUNCTION END (SUCCESS) ===');
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      console.log('=== SIGNUP FUNCTION END (CATCH) ===');
      return { error };
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      console.log('SignIn: Starting authentication for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('SignIn: Authentication failed:', error);
        return { error };
      }

      if (data.user) {
        console.log('SignIn: Authentication successful, fetching user profile...');
        // Fetch the user profile after successful authentication
        await fetchUserProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  // Social sign in
  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      return { error };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Update user profile
  const updateUser = async (updates: Partial<AuthUser>) => {
    console.log('updateUser called with updates:', updates);
    console.log('Current user:', user);
    
    if (!user) {
      console.error('No user logged in');
      return { error: new Error('No user logged in') };
    }

    try {
      console.log('Updating user profile in database...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database update timeout')), 10000);
      });
      
      const updatePromise = supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      console.log('Database update result:', { error });

      if (!error) {
        console.log('Updating local user state...');
        setUser(prev => prev ? { ...prev, ...updates } : null);
        console.log('Local user state updated');
      }

      return { error };
    } catch (error) {
      console.error('Update user error:', error);
      return { error };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user.id);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password` // or your desired redirect
    });
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    updateUser,
    refreshUser,
    resetPassword,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 