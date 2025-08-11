import React, { useState } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
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
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-dark-400 mb-6">
            Enter your email address and we'll send you instructions to reset your password.
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
                <p className="font-medium">Reset link sent!</p>
                <p className="mt-1">Please check your email for instructions to reset your password.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/80 disabled:opacity-70 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Reset Link'
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

export default ForgotPassword; 