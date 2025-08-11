import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-secondary-800 border border-secondary-700 rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  );
}; 