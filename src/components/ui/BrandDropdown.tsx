import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

interface BrandDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export const BrandDropdown: React.FC<BrandDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  disabled = false,
  className = "",
  label,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full bg-[#23233a]/50 border-2 ${
          error ? 'border-red-500/50' : 'border-white/20'
        } rounded-lg px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={selectedOption ? 'text-white' : 'text-[#b0b0d0]'}>
              {selectedOption?.label || placeholder}
            </span>
            {selectedOption?.badge && (
              <span className="px-2 py-1 text-xs bg-[#a259ff]/20 text-[#a259ff] rounded-full">
                {selectedOption.badge}
              </span>
            )}
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-[#b0b0d0] transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
        {selectedOption?.description && (
          <div className="text-xs text-[#b0b0d0] mt-1">
            {selectedOption.description}
          </div>
        )}
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-[#23233a] rounded-lg border border-white/20 shadow-xl z-[9999] max-h-60 overflow-y-auto">
          <div className="p-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  option.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-white/10'
                } ${
                  option.value === value
                    ? 'bg-[#a259ff]/20 text-[#a259ff]'
                    : 'text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span>{option.label}</span>
                    {option.badge && (
                      <span className="px-2 py-1 text-xs bg-white/10 text-[#b0b0d0] rounded-full">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-[#a259ff]" />
                  )}
                </div>
                {option.description && (
                  <div className="text-xs text-[#b0b0d0] mt-1">
                    {option.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandDropdown;
