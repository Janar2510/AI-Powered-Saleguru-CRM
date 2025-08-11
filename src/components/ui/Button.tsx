import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  type = 'button',
  loading = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-[#a259ff] hover:bg-[#8040C0] text-white focus:ring-[#a259ff] shadow-lg hover:shadow-xl',
    secondary: 'bg-[#23233a]/60 hover:bg-[#23233a]/80 text-[#b0b0d0] hover:text-white focus:ring-[#a259ff] border border-[#23233a]',
    success: 'bg-[#43e7ad] hover:bg-[#3dd19a] text-white focus:ring-[#43e7ad] shadow-lg hover:shadow-xl',
    warning: 'bg-[#f59e0b] hover:bg-[#d97706] text-white focus:ring-[#f59e0b] shadow-lg hover:shadow-xl',
    danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white focus:ring-[#ef4444] shadow-lg hover:shadow-xl',
    gradient: 'bg-gradient-to-r from-[#a259ff] to-[#377dff] hover:from-[#8040C0] hover:to-[#2d5fcc] text-white focus:ring-[#a259ff] shadow-lg hover:shadow-xl'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {Icon && iconPosition === 'left' && (
        <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className={`w-4 h-4 ${children ? 'ml-2' : ''}`} />
      )}
    </button>
  );
};

export default Button; 