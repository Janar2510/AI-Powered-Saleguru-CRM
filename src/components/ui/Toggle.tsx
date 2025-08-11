import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  variant?: 'gradient' | 'white';
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  className = '',
  variant = 'gradient',
  disabled = false
}) => {
  const base = 'relative inline-flex items-center h-7 w-14 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  const gradientBg = checked
    ? 'bg-gradient-to-r from-[#a259ff] to-[#377dff]'
    : 'bg-secondary-700';
  const whiteBg = checked
    ? 'bg-white border border-primary-500'
    : 'bg-secondary-700 border border-secondary-500';
  const thumb =
    'inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition-transform duration-200';
  const thumbChecked = checked ? 'translate-x-7' : 'translate-x-1';
  const thumbGradient = checked
    ? 'bg-gradient-to-r from-[#a259ff] to-[#377dff] border-2 border-[#8040C0] shadow-lg'
    : 'bg-white';
  const thumbWhite = checked ? 'bg-primary-500 border-2 border-[#8040C0] shadow-lg' : 'bg-white border border-secondary-400';

  return (
    <label className={`flex items-center cursor-pointer select-none ${className}`}>
      <span className="mr-3 text-sm text-secondary-300">{label}</span>
      <span
        className={
          base +
          ' ' +
          (variant === 'gradient' ? gradientBg : whiteBg) +
          (disabled ? ' opacity-60 cursor-not-allowed' : '')
        }
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span
          className={
            thumb +
            ' ' +
            thumbChecked +
            ' ' +
            (variant === 'gradient' ? thumbGradient : thumbWhite)
          }
        />
      </span>
    </label>
  );
};

export default Toggle; 