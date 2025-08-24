import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Shield, 
  Building2,
  ArrowRight
} from 'lucide-react';
import { 
  BrandBackground,
  BrandCard, 
  BrandButton, 
  BrandInput 
} from '../../contexts/BrandDesignContext';
import { setPortalSession, isPortalAuthenticated } from '../../lib/portalAuth';

const PortalLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    if (isPortalAuthenticated()) {
      navigate('/portal');
      return;
    }

    // Check for bypass parameter for development
    const bypassParam = searchParams.get('bypass');
    if (bypassParam === 'dev') {
      // Create a bypass session for development
      setPortalSession(
        'dev-bypass-token',
        new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
        'dev-user-001',
        'dev@saleguru.com'
      );
      setStatus('success');
      setTimeout(() => {
        navigate('/portal');
      }, 1500);
      return;
    }

    // Get token from URL params
    const urlToken = searchParams.get('t');
    if (!urlToken) {
      setStatus('error');
      setErrorMessage('Missing access token. Please use the link provided in your invitation email.');
      return;
    }

    setToken(urlToken);
    authenticateWithToken(urlToken);
  }, [searchParams, navigate]);

  const authenticateWithToken = async (tokenValue: string) => {
    try {
      setStatus('loading');
      
      // Validate token with backend
      const response = await fetch('/api/portal/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenValue }),
      });

      if (!response.ok) {
        throw new Error('Invalid or expired token');
      }

      const result = await response.json();
      
      if (!result.valid) {
        throw new Error(result.message || 'Token validation failed');
      }

      // Set portal session
      setPortalSession(
        tokenValue,
        result.expiresAt,
        result.portalUserId,
        result.email
      );

      setStatus('success');
      
      // Redirect to portal after short delay
      setTimeout(() => {
        navigate('/portal');
      }, 1500);

    } catch (error) {
      console.error('Portal authentication error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      authenticateWithToken(token.trim());
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-white">Authenticating...</h2>
            <p className="text-white/70">Validating your access token</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <h2 className="text-xl font-semibold text-white">Access Granted!</h2>
            <p className="text-white/70">Redirecting you to the portal...</p>
            <div className="flex items-center justify-center space-x-2 text-blue-400">
              <span>Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <h2 className="text-xl font-semibold text-white">Access Denied</h2>
              <p className="text-white/70">{errorMessage}</p>
            </div>

            {/* Manual Token Entry */}
            <BrandCard className="bg-white/5 border-white/10">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Manual Token Entry</h3>
                <p className="text-white/70 text-sm">
                  If you have a valid access token, you can enter it manually below.
                </p>
                
                <form onSubmit={handleManualTokenSubmit} className="space-y-4">
                  <BrandInput
                    type="text"
                    placeholder="Enter your access token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                  <BrandButton
                    type="submit"
                    disabled={!token.trim()}
                    className="w-full"
                  >
                    Access Portal
                  </BrandButton>
                </form>
              </div>
            </BrandCard>

            <div className="text-center space-y-3">
              <BrandButton
                variant="outline"
                onClick={() => window.location.href = 'mailto:support@saleguru.com'}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Contact Support
              </BrandButton>
              
              <div className="text-white/40 text-sm">or</div>
              
              <BrandButton
                variant="primary"
                onClick={() => window.location.href = '/portal/login?bypass=dev'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Development Bypass
              </BrandButton>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BrandBackground>
      <div className="min-h-screen flex items-center justify-center p-4">

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Customer Portal
          </h1>
          <p className="text-white/70">Secure access to your business information</p>
        </div>

        {/* Login Card */}
        <BrandCard className="bg-black/20 backdrop-blur-xl border-white/10 p-8">
          {renderContent()}
        </BrandCard>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-white/50 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure portal access with encrypted tokens</span>
          </div>
        </div>
      </motion.div>
      </div>
    </BrandBackground>
  );
};

export default PortalLogin;
