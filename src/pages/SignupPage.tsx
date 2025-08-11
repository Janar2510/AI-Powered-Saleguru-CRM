import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';
import { AuthCard, authInputClass, authButtonClass, AUTH_TEXT_PRIMARY, AUTH_TEXT_SECONDARY } from '../components/ui/AuthTheme';
import { useAuth } from '../contexts/AuthContext';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { signUp, signInWithOAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    companyName: '',
    companySize: '',
    companyWebsite: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    first_name?: string; 
    last_name?: string; 
    companyName?: string 
  }>();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors && errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      console.log('SignupPage: Starting signup process');
      const { error } = await signUp(formData.email, formData.password, formData);
      console.log('SignupPage: Signup result:', { error });
      
      if (error) {
        console.error('SignupPage: Signup failed with error:', error);
        throw error;
      }
      
      console.log('SignupPage: Signup successful, showing toast');
      showToast({ 
        title: 'Account created successfully!', 
        description: 'Setting up your workspace...', 
        type: 'success' 
      });
      
      // Don't navigate manually - let AuthNavigator handle it
      // The AuthNavigator will automatically redirect to onboarding
      // once the user profile is fetched
      
    } catch (error: any) {
      console.error('SignupPage: Caught error in handleSubmit:', error);
      showToast({ 
        title: 'Signup failed', 
        description: error.message || 'Please try again', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) throw error;
      showToast({ title: `Signing up with ${provider}...`, type: 'success' });
    } catch (error: any) {
      showToast({ title: `Failed to sign up with ${provider}`, type: 'error' });
    }
  };

  return (
    <div className="relative z-10 flex items-center justify-center px-4 pt-24 pb-12 min-h-screen">
      <div className="max-w-2xl w-full">
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
              <h1 className={`${AUTH_TEXT_PRIMARY} mb-2`}>Create Your Account</h1>
              <p className={AUTH_TEXT_SECONDARY}>Join thousands of sales teams using SaleToru</p>
            </div>
            {/* Divider (optional, for visual match) */}
            <div className="modern-divider-enhanced mb-4">
              <span>Sign up with email</span>
            </div>
            <div className="mb-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSocialSignup('google')}
                className="flex items-center justify-center w-full py-2 rounded-lg bg-white text-black font-semibold shadow-sm hover:bg-gray-100 transition"
              >
                <img src="/src/components/ui/brand-assets/google-logo.png" alt="Google" className="h-5 w-5 mr-2" />
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup('apple')}
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
            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Row - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8040C0]" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={authInputClass}
                      placeholder="John"
                      autoComplete="given-name"
                    />
                  </div>
                  {errors?.first_name && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.first_name}
                    </p>
                  )}
                </div>
                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Last Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8040C0]" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={authInputClass}
                      placeholder="Smith"
                      autoComplete="family-name"
                    />
                  </div>
                  {errors?.last_name && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8040C0]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={authInputClass}
                    placeholder="john@company.com"
                    autoComplete="email"
                  />
                </div>
                {errors?.email && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8040C0]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={authInputClass + ' pr-12'}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8040C0] hover:text-white focus:outline-none"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Lock />
                  </button>
                </div>
                {errors?.password && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
              
              {/* Company Row - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Company Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8040C0]" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={authInputClass}
                      placeholder="Your Company Name"
                      autoComplete="organization"
                    />
                  </div>
                  {errors?.companyName && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.companyName}
                    </p>
                  )}
                </div>
                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Company Size</label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    className={authInputClass.replace('pl-12', 'pl-4')}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value=">500">500+</option>
                  </select>
                </div>
              </div>
              
              {/* Company Website */}
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">Company Website</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8040C0]" />
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    className={authInputClass}
                    placeholder="https://yourcompany.com"
                    autoComplete="url"
                  />
                </div>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={authButtonClass}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing up...
                  </div>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-[#b0b0d0]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-[#a259ff] hover:text-white font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </AuthCard>
        </div>
      </div>
    );
};

export default SignupPage; 