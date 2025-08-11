import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    // Get hash from URL
    const hashFragment = window.location.hash;
    if (hashFragment) {
      const params = new URLSearchParams(hashFragment.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setHash(accessToken);
      } else {
        setError('Invalid or missing reset token. Please try again.');
      }
    } else {
      setError('Invalid or missing reset token. Please try again.');
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please enter both password fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!hash) {
      setError('Invalid or missing reset token. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // Supabase will use the access_token in the URL hash automatically
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img src="/saletoru-logo.png" alt="SaleToru Logo" className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold text-white">SaleToru</h1>
          <p className="text-dark-400">Smart Sales Management</p>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
          <p className="text-dark-400 mb-6">
            Create a new password for your account.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6 flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Password reset successful!</p>
                <p className="mt-1">You will be redirected to the login page shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !hash}
                className="w-full bg-accent hover:bg-accent/80 disabled:opacity-70 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-accent hover:text-accent/80 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword; 