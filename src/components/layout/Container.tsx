import React from 'react';
import clsx from 'clsx';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: keyof JSX.IntrinsicElements;
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className,
  size = 'full',
  padding = 'none',
  as: Component = 'div'
}) => {
  const sizeClasses = {
    sm: 'max-w-3xl mx-auto',
    md: 'max-w-5xl mx-auto', 
    lg: 'max-w-6xl mx-auto',
    xl: 'max-w-7xl mx-auto',
    full: 'w-full'
  };

  const paddingClasses = {
    none: 'px-5 py-5', // 20px margins
    sm: 'px-5 py-6',
    md: 'px-5 py-8',
    lg: 'px-5 py-10'
  };

  return (
    <Component className={clsx(
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </Component>
  );
};

export default Container;