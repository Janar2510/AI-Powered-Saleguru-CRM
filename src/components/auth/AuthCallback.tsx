import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          const user = session.user;
          // Check if user exists in user_profiles table
          const { data: existingUser, error: userError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            console.error('Error checking user profile:', userError);
            return;
          }

          // If user doesn't exist, create profile
          if (!existingUser) {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: user.id,
                email: user.email,
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                role: 'user',
                onboarding_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Error creating user profile:', insertError);
            }
          }

          // Refresh user data in context
          await refreshUser();

          // Navigate based on onboarding status
          if (!existingUser?.onboarding_completed) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        showToast({ title: 'Authentication failed', type: 'error' });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, refreshUser, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-white">Completing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback; 