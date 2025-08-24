import React, { createContext, useContext, ReactNode } from 'react';
import Spline from '@splinetool/react-spline';
// SaleToru Logo Gradient Colors
export const BRAND_COLORS = {
  // Primary Logo Gradients
  logo: {
    primary: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 25%, #ffd93d 50%, #6bcf7f 75%, #4d9de0 100%)',
    secondary: 'linear-gradient(135deg, #a259ff 0%, #377dff 50%, #ff6b6b 100%)',
    accent: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6bcf7f 100%)'
  },
  
  // Quick Action Button Colors (Red, Green, Purple, Orange, Yellow, Blue)
  actions: {
    red: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
    green: 'linear-gradient(135deg, #6bcf7f 0%, #4d9de0 100%)',
    purple: 'linear-gradient(135deg, #a259ff 0%, #ff6b6b 100%)',
    orange: 'linear-gradient(135deg, #ff8e53 0%, #ffd93d 100%)',
    yellow: 'linear-gradient(135deg, #ffd93d 0%, #ff8e53 100%)',
    blue: 'linear-gradient(135deg, #4d9de0 0%, #a259ff 100%)'
  },
  
  // Background Gradients
  background: {
    primary: 'linear-gradient(135deg, #0f0f23 0%, #23233a 50%, #18182c 100%)',
    secondary: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    tertiary: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)'
  },
  
  // Text Colors
  text: {
    primary: '#ffffff',
    secondary: '#b0b0d0',
    muted: '#8a8a8a',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #b0b0d0 100%)'
  },
  
  // Border Gradients
  borders: {
    primary: 'linear-gradient(135deg, #a259ff 0%, #377dff 100%)',
    secondary: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)',
    accent: 'linear-gradient(135deg, #6bcf7f 0%, #4d9de0 100%)'
  }
};

// Responsive Spacing System (20-30px base)
export const BRAND_SPACING = {
  xs: '1.25rem',    // 20px
  sm: '1.5rem',     // 24px
  md: '1.875rem',   // 30px
  lg: '2.5rem',     // 40px
  xl: '3.75rem',    // 60px
  '2xl': '5rem'     // 80px
};

// Enhanced Shadows with Glow Effects
export const BRAND_SHADOWS = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
  xl: '0 16px 32px rgba(0, 0, 0, 0.25)',
  glow: {
    primary: '0 0 20px rgba(162, 89, 255, 0.4)',
    red: '0 0 20px rgba(255, 107, 107, 0.4)',
    green: '0 0 20px rgba(107, 207, 127, 0.4)',
    blue: '0 0 20px rgba(77, 157, 224, 0.4)',
    purple: '0 0 20px rgba(162, 89, 255, 0.4)',
    orange: '0 0 20px rgba(255, 142, 83, 0.4)',
    yellow: '0 0 20px rgba(255, 217, 61, 0.4)'
  }
};

// Enhanced Border System with 2px Gradient Borders
export const BRAND_BORDERS = {
  radius: {
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem'     // 24px
  },
  width: '2px',
  gradients: {
    primary: 'linear-gradient(135deg, #a259ff 0%, #377dff 100%)',
    secondary: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)',
    accent: 'linear-gradient(135deg, #6bcf7f 0%, #4d9de0 100%)',
    logo: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 25%, #ffd93d 50%, #6bcf7f 75%, #4d9de0 100%)',
    red: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
    green: 'linear-gradient(135deg, #6bcf7f 0%, #4d9de0 100%)',
    purple: 'linear-gradient(135deg, #a259ff 0%, #ff6b6b 100%)',
    orange: 'linear-gradient(135deg, #ff8e53 0%, #ffd93d 100%)',
    yellow: 'linear-gradient(135deg, #ffd93d 0%, #ff8e53 100%)',
    blue: 'linear-gradient(135deg, #4d9de0 0%, #a259ff 100%)'
  }
};

// Animation Keyframes
export const BRAND_ANIMATIONS = {
  fadeIn: 'fadeIn 0.5s ease-in-out',
  slideUp: 'slideUp 0.6s ease-out',
  slideDown: 'slideDown 0.6s ease-out',
  scaleIn: 'scaleIn 0.3s ease-out',
  pulse: 'pulse 2s infinite',
  shimmer: 'shimmer 2s infinite',
  float: 'float 3s ease-in-out infinite',
  bounce: 'bounce 1s infinite'
};

// Enhanced Brand Background with Logo-Inspired Design
export const BrandBackground: React.FC<{ children: ReactNode; disableSpline?: boolean }> = ({ children, disableSpline = false }) => (
  <div className="min-h-screen relative overflow-hidden">
    {/* Spline 3D Background - positioned behind everything */}
    {!disableSpline && (
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
    )}
    
    {/* Dark overlay for better content readability */}
    <div className="fixed inset-0 -z-40 bg-black/50 pointer-events-none" />

    {/* Content with proper z-index */}
    <div className="relative z-10">
      {children}
    </div>

    {/* Global CSS for animations and gradient borders */}
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideDown {
        from { transform: translateY(-30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      /* Gradient Border Classes */
      .border-gradient-primary {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #a259ff 0%, #377dff 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
      .border-gradient-secondary {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
      .border-gradient-accent {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #6bcf7f 0%, #4d9de0 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
      .border-gradient-logo {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #ff6b6b 0%, #ff8e53 25%, #ffd93d 50%, #6bcf7f 75%, #4d9de0 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
      .border-gradient-red {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
      .border-gradient-green {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #6bcf7f 0%, #4d9de0 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
      .border-gradient-purple {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #a259ff 0%, #ff6b6b 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
      .border-gradient-orange {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #ff8e53 0%, #ffd93d 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
      .border-gradient-yellow {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #ffd93d 0%, #ff8e53 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
      .border-gradient-blue {
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #4d9de0 0%, #a259ff 100%);
        background-clip: padding-box, border-box;
        border: 2px solid transparent;
      }
    `}</style>
  </div>
);

// Enhanced Brand Card with 2px Gradient Border and Glass Effect
export const BrandCard: React.FC<{ 
  children: ReactNode; 
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'logo';
  borderGradient?: 'primary' | 'secondary' | 'accent' | 'logo' | 'red' | 'green' | 'purple' | 'orange' | 'yellow' | 'blue';
  animation?: keyof typeof BRAND_ANIMATIONS;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}> = ({ children, className = '', variant = 'default', borderGradient = 'primary', animation, draggable, onDragStart, onDragEnd, onDragOver, onDrop }) => {
  const baseClasses = "rounded-xl transition-all duration-300 backdrop-blur-xl";
  
  const variantClasses = {
    default: "backdrop-blur-xl border border-white/20",
    glass: "backdrop-blur-2xl border border-white/10 shadow-2xl",
    gradient: "backdrop-blur-xl border border-white/20",
    logo: "backdrop-blur-xl border border-white/15"
  };

  const borderGradientClasses = {
    primary: "border-gradient-primary",
    secondary: "border-gradient-secondary", 
    accent: "border-gradient-accent",
    logo: "border-gradient-logo",
    red: "border-gradient-red",
    green: "border-gradient-green",
    purple: "border-gradient-purple",
    orange: "border-gradient-orange",
    yellow: "border-gradient-yellow",
    blue: "border-gradient-blue"
  };

  // Remove the border-2 class when using gradient borders
  const shouldRemoveBorder = borderGradient && borderGradient !== 'primary';

  const animationClass = animation ? BRAND_ANIMATIONS[animation] : '';

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${shouldRemoveBorder ? '' : 'border-2'} ${borderGradientClasses[borderGradient]} ${animationClass} ${className}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
};

// Enhanced Brand Button with Action Colors
export const BrandButton: React.FC<{
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'red' | 'green' | 'purple' | 'orange' | 'yellow' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  animation?: keyof typeof BRAND_ANIMATIONS;
}> = ({ children, variant = 'primary', size = 'md', className = '', onClick, disabled, animation }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#a259ff] to-[#377dff] text-white hover:from-[#8b4dff] hover:to-[#2d6bff] focus:ring-[#a259ff] shadow-lg hover:shadow-xl",
    secondary: "bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white hover:bg-white/10 focus:ring-white/20",
    outline: "border-2 border-white/20 bg-transparent text-white hover:bg-white/10 focus:ring-white/20",
    ghost: "text-white hover:bg-white/10 focus:ring-white/20",
    red: `bg-gradient-to-r ${BRAND_COLORS.actions.red} text-white shadow-lg hover:shadow-xl focus:ring-red-400`,
    green: `bg-gradient-to-r ${BRAND_COLORS.actions.green} text-white shadow-lg hover:shadow-xl focus:ring-green-400`,
    purple: `bg-gradient-to-r ${BRAND_COLORS.actions.purple} text-white shadow-lg hover:shadow-xl focus:ring-purple-400`,
    orange: `bg-gradient-to-r ${BRAND_COLORS.actions.orange} text-white shadow-lg hover:shadow-xl focus:ring-orange-400`,
    yellow: `bg-gradient-to-r ${BRAND_COLORS.actions.yellow} text-white shadow-lg hover:shadow-xl focus:ring-yellow-400`,
    blue: `bg-gradient-to-r ${BRAND_COLORS.actions.blue} text-white shadow-lg hover:shadow-xl focus:ring-blue-400`
  };
  
  const sizeClasses = {
    sm: "px-5 py-2.5 text-sm rounded-lg",      // 20px padding
    md: "px-6 py-3 text-sm rounded-xl",       // 24px padding
    lg: "px-8 py-4 text-base rounded-2xl"     // 32px padding
  };

  const animationClass = animation ? BRAND_ANIMATIONS[animation] : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${animationClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Enhanced Brand Input with Gradient Focus
export const BrandInput: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
}> = ({ placeholder, value, onChange, className = '', type = 'text', required = false, readOnly = false }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    readOnly={readOnly}
    className={`w-full px-6 py-3 bg-black/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/20 ${className}`}
  />
);

// Enhanced Brand Textarea with Gradient Focus
export const BrandTextarea: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  required?: boolean;
  readOnly?: boolean;
}> = ({ placeholder, value, onChange, className = '', rows = 4, required = false, readOnly = false }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    required={required}
    readOnly={readOnly}
    className={`w-full px-6 py-3 bg-black/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/20 resize-none ${className}`}
  />
);

// Enhanced Brand Badge with Gradient Backgrounds
export const BrandBadge: React.FC<{
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'red' | 'green' | 'purple' | 'orange' | 'yellow' | 'blue';
  size?: 'sm' | 'md';
  className?: string;
  animation?: keyof typeof BRAND_ANIMATIONS;
}> = ({ children, variant = 'default', size = 'md', className = '', animation }) => {
  const baseClasses = "inline-flex items-center rounded-full font-medium transition-all duration-300";
  
  const variantClasses = {
    default: "bg-white/10 text-white border-2 border-white/20",
    secondary: "bg-black/20 text-white/70 border-2 border-white/10",
    success: "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border-2 border-green-500/30",
    warning: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-2 border-yellow-500/30",
    error: "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border-2 border-red-500/30",
    info: "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border-2 border-blue-500/30",
    red: `bg-gradient-to-r ${BRAND_COLORS.actions.red} text-white border-2 border-red-400/30`,
    green: `bg-gradient-to-r ${BRAND_COLORS.actions.green} text-white border-2 border-green-400/30`,
    purple: `bg-gradient-to-r ${BRAND_COLORS.actions.purple} text-white border-2 border-purple-400/30`,
    orange: `bg-gradient-to-r ${BRAND_COLORS.actions.orange} text-white border-2 border-orange-400/30`,
    yellow: `bg-gradient-to-r ${BRAND_COLORS.actions.yellow} text-white border-2 border-yellow-400/30`,
    blue: `bg-gradient-to-r ${BRAND_COLORS.actions.blue} text-white border-2 border-blue-400/30`
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",    // 12px + 6px padding
    md: "px-4 py-2 text-sm"       // 16px + 8px padding
  };

  const animationClass = animation ? BRAND_ANIMATIONS[animation] : '';

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${animationClass} ${className}`}>
      {children}
    </span>
  );
};

// Enhanced Page Layout with Logo-Inspired Design
export const BrandPageLayout: React.FC<{
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  logoGradient?: boolean;
}> = ({ children, title, subtitle, actions, logoGradient = true }) => (
  <div className="p-5 max-w-none">
    <div className="w-full">
      {/* Enhanced Header with Logo Gradient */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
        <div className="space-y-2">
          <h1 
            className={`text-2xl lg:text-4xl font-bold mb-2 ${logoGradient ? 'bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent' : 'text-white'}`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg lg:text-xl text-white/80">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            {actions}
          </div>
        )}
      </div>
      
      {/* Content */}
      {children}
    </div>
  </div>
 );

// Enhanced Stats Grid with Responsive Design
export const BrandStatsGrid: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-4 mx-5 ${className}`}>
    {children}
  </div>
);

// Enhanced Stat Card with Gradient Borders and Animations
export const BrandStatCard: React.FC<{
  icon: ReactNode;
  title: string;
  value: string | number;
  trend?: string;
  className?: string;
  borderGradient?: 'primary' | 'secondary' | 'accent' | 'logo' | 'red' | 'green' | 'purple' | 'orange' | 'yellow' | 'blue';
  animation?: keyof typeof BRAND_ANIMATIONS;
}> = ({ icon, title, value, trend, className = '', borderGradient = 'logo', animation = 'scaleIn' }) => (
  <BrandCard 
    className={`p-4 lg:p-6 ${className}`}
    borderGradient={borderGradient}
    animation={animation}
  >
    <div className="flex items-center">
      <div className="p-2 lg:p-3 rounded-xl border-2 border-white/20">
        {icon}
      </div>
      <div className="ml-3 lg:ml-4">
        <p className="text-xs lg:text-sm font-medium text-white/90">{title}</p>
        <p className="text-lg lg:text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p className="text-xs lg:text-sm text-white/70">{trend}</p>
        )}
      </div>
    </div>
  </BrandCard>
);



// Enhanced Dropdown Component
export const BrandDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, options, placeholder, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-6 py-3 bg-black/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/20 ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
);

// Context Provider
interface BrandDesignContextType {
  colors: typeof BRAND_COLORS;
  spacing: typeof BRAND_SPACING;
  shadows: typeof BRAND_SHADOWS;
  borders: typeof BRAND_BORDERS;
  animations: typeof BRAND_ANIMATIONS;
}

const BrandDesignContext = createContext<BrandDesignContextType | undefined>(undefined);

export const BrandDesignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = {
    colors: BRAND_COLORS,
    spacing: BRAND_SPACING,
    shadows: BRAND_SHADOWS,
    borders: BRAND_BORDERS,
    animations: BRAND_ANIMATIONS
  };

  return (
    <BrandDesignContext.Provider value={value}>
      {children}
    </BrandDesignContext.Provider>
  );
};

export const useBrandDesign = () => {
  const context = useContext(BrandDesignContext);
  if (context === undefined) {
    throw new Error('useBrandDesign must be used within a BrandDesignProvider');
  }
  return context;
};
