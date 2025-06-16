import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'elevated';
  as?: keyof JSX.IntrinsicElements;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = false,
  padding = 'md',
  variant = 'glass',
  as: Component = 'div'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5', // Changed to 20px (p-5)
    lg: 'p-6',
  };

  const variantClasses = {
    default: 'bg-secondary-800 border border-secondary-700',
    glass: 'bg-secondary-800/40 backdrop-blur-xl border border-white/5 shadow-lg',
    elevated: 'bg-secondary-800/60 backdrop-blur-md border border-secondary-700/80 shadow-xl'
  };

  return (
    <Component
      className={clsx(
        variantClasses[variant],
        paddingClasses[padding],
        'rounded-xl',
        hover && 'hover:shadow-card-hover hover:scale-[1.02] transition-all duration-200',
        'animate-fade-in',
        className
      )}
    >
      {children}
    </Component>
  );
};

export default Card;