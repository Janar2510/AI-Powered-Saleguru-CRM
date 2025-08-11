import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Github,
  Chrome,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';
import { AuthCard, authInputClass, authButtonClass } from '../components/ui/AuthTheme';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { signIn, user, signInWithOAuth, authError } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [splineError, setSplineError] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSplineError = () => {
    setSplineError(true);
    console.error('Failed to load Spline scene');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        setFormError(error.message || 'Failed to sign in.');
        console.error('Supabase login error:', error);
        return;
      }

      showToast({ title: 'Welcome back!', type: 'success' });
      
      // Don't navigate here - let the auth state change handle it
      // The AuthContext will automatically redirect based on onboarding status

    } catch (error: any) {
      setFormError(error.message || 'Unexpected error. Please try again.');
      console.error('Login error:', error);
      showToast({ title: error.message || 'Failed to sign in', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) throw error;
      showToast({ title: `Signing in with ${provider}...`, type: 'success' });
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      showToast({ title: `Failed to sign in with ${provider}`, type: 'error' });
    }
  };

  return (
    <div className="relative z-10 flex items-center justify-center px-4 pt-24 pb-12 min-h-screen">
      <div className="max-w-md w-full">
        <AuthCard>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/saletoru-logo.png" 
                alt="SaleToru Logo" 
                className="h-12 w-auto mr-3 brand-logo"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-base text-[#b0b0d0]">Sign in to your SaleToru account</p>
          </div>
          {/* Social Login */}
          <div className="mb-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center w-full py-2 rounded-lg bg-white text-black font-semibold shadow-sm hover:bg-gray-100 transition"
            >
              <img src="/src/components/ui/brand-assets/google-logo.png" alt="Google" className="h-5 w-5 mr-2" />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className="flex items-center justify-center w-full py-2 rounded-lg bg-[#2d014d] text-white font-semibold shadow-sm hover:bg-[#3a1761] transition"
            >
              <img src="/src/components/ui/brand-assets/apple-logo.png" alt="Apple" className="h-5 w-5 mr-2" />
              Continue with Apple
            </button>
          </div>
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="mx-4 text-gray-400 text-sm">or continue with email</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authError && (
              <div className="mb-2 p-2 bg-red-900/80 text-red-200 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{authError}</span>
              </div>
            )}
            {formError && (
              <div className="mb-2 p-2 bg-red-900/60 text-red-200 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8040C0]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={authInputClass}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8040C0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={authInputClass + ' pr-12'}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8040C0] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="modern-checkbox-enhanced h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="ml-2 text-sm text-[#b0b0d0]">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#a259ff] hover:text-white font-medium transition-colors underline ml-2"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={authButtonClass}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </form>
          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-[#b0b0d0]">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-[#a259ff] hover:text-white font-medium transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </AuthCard>
      </div>
    </div>
  );
};

export default LoginPage; 