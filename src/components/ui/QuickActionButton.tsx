import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  gradient: string;
  className?: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  gradient,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`${gradient} p-4 rounded-xl text-white w-full min-h-[72px] flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20 ${className}`}
    >
      <Icon className="w-5 h-5 mr-2" />
      <span className="font-medium text-base md:text-lg lg:text-xl">{label}</span>
    </button>
  );
};

export default QuickActionButton; 