import React from 'react';
import clsx from 'clsx';
// TODO: Import BRAND from brand assets/theme when available

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'sm',
  className
}) => {
  // Color logic should be moved to brand assets/theme
  const variants = {
    primary: 'bg-[#a259ff]/20 text-[#a259ff] border-[#a259ff]/30',
    secondary: 'bg-[#23233a]/50 text-[#b0b0d0] border-[#23233a]/30',
    success: 'bg-[#43e7ad]/20 text-[#43e7ad] border-[#43e7ad]/30',
    warning: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30',
    danger: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30',
    outline: 'bg-transparent text-white border-white/20',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium border backdrop-blur-sm rounded-lg min-w-0 flex-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      style={{ maxWidth: '100%' }}
    >
      <span className="truncate text-ellipsis whitespace-nowrap min-w-0 flex-1 flex items-center justify-center">{children}</span>
    </span>
  );
};

export default Badge;