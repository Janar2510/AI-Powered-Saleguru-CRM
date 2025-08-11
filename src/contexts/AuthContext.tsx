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
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
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
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        console.log('Initial session result:', { session });
        setSession(session);
        
        if (session?.user) {
          console.log('User found in session, fetching profile...');
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
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from user_profiles table
  const fetchUserProfile = async (userId: string) => {
    console.log('Fetching user profile for', userId);
    setLoading(true);
    
    try {
      console.log('About to query user_profiles table...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
      });
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      console.log('Profile fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If it's a "not found" error, try to create the profile manually
        if (error.code === 'PGRST116') {
          console.log('User profile not found, attempting manual creation...');
          
          // Get user metadata from auth
          const { data: { user: authUser } } = await supabase.auth.getUser();
          console.log('Auth user data:', authUser);
          
          if (authUser) {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: userId,
                email: authUser.email,
                first_name: authUser.user_metadata?.first_name || '',
                last_name: authUser.user_metadata?.last_name || '',
                role: 'user',
                onboarding_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            console.log('Manual insert result:', { insertError });
            
            if (insertError) {
              console.error('Manual profile creation failed:', insertError);
              setAuthError('Failed to create user profile. Please contact support.');
              setUser(null);
              return;
            } else {
              console.log('Manual profile creation successful');
              // Fetch the newly created profile
              const { data: newProfile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();
              
              console.log('New profile fetch result:', { newProfile });
              
              if (newProfile) {
                setUser(newProfile);
                return;
              }
            }
          }
          setAuthError('User profile not found. Please contact support.');
          setUser(null);
          return;
        } else {
          setAuthError(error.message || 'Failed to fetch user profile.');
        }
        setUser(null);
        return;
      }

      if (data) {
        console.log('User profile found:', data);
        setUser(data);
      } else {
        setAuthError('User profile not found.');
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error in fetchUserProfile:', error);
      setAuthError(error.message || 'Error in fetchUserProfile.');
      setUser(null);
    } finally {
      console.log('fetchUserProfile completed, setting loading to false');
      setLoading(false);
    }
    
    // TEMPORARY: If profile fetch fails, create a temporary user for testing
    if (!user && session?.user) {
      console.log('Creating temporary user for testing...');
      const tempUser = {
        id: session.user.id,
        email: session.user.email || '',
        first_name: session.user.user_metadata?.first_name || '',
        last_name: session.user.user_metadata?.last_name || '',
        role: 'user',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUser(tempUser);
      console.log('Temporary user created:', tempUser);
    }
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