import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  FileText, 
  ShoppingCart, 
  Receipt, 
  Home,
  Building2,
  ChevronRight
} from 'lucide-react';
import { 
  BrandBackground,
  BrandPageLayout,
  BrandButton, 
  BrandBadge,
} from '../../contexts/BrandDesignContext';
import { clearPortalSession, isPortalAuthenticated } from '../../lib/portalAuth';

interface PortalLayoutProps {
  children: React.ReactNode;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearPortalSession();
    navigate('/portal/login');
  };

  const navigationItems = [
    { path: '/portal', label: 'Dashboard', icon: Home },
    { path: '/portal/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/portal/invoices', label: 'Invoices', icon: Receipt },
    { path: '/portal/quotes', label: 'Quotes', icon: FileText },
    { path: '/portal/documents', label: 'Documents', icon: FileText },
    { path: '/portal/profile', label: 'Profile', icon: User },
  ];

  // Only redirect to login in production when not authenticated
  if (!isPortalAuthenticated() && process.env.NODE_ENV === 'production') {
    navigate('/portal/login');
    return null;
  }

  const currentPage = navigationItems.find(item => item.path === location.pathname);

  return (
    <BrandBackground>
      <BrandPageLayout
        title={`Customer Portal - ${currentPage?.label || 'Portal'}`}
        subtitle="Secure customer access portal for managing orders, invoices, and documents"
        actions={
          <div className="flex items-center space-x-3">
            <BrandButton
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              ← Back to CRM
            </BrandButton>
            <BrandBadge variant="success" className="text-xs">
              Portal Access
            </BrandBadge>
            <BrandButton variant="outline" size="sm">
              Help & Support
            </BrandButton>
            <BrandButton variant="primary" size="sm">
              Contact Support
            </BrandButton>
            <BrandButton
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </BrandButton>
          </div>
        }
      >
        {/* Portal Navigation */}
        <motion.nav 
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex space-x-1 bg-black/20 backdrop-blur-sm rounded-xl p-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <BrandButton
                  key={item.path}
                  variant={isActive ? "primary" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-400 border border-blue-500/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-blue-400" />
                  )}
                </BrandButton>
              );
            })}
          </div>
        </motion.nav>

        {/* Portal Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default PortalLayout;
