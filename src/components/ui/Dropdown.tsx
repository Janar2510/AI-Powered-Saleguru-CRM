import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  label,
  className = '',
  placeholder = 'Select...',
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className="block mb-1 text-sm text-secondary-300">{label}</label>}
      <button
        type="button"
        className={`w-full px-4 py-3 bg-[#23233a]/60 border border-[#23233a]/40 rounded-lg shadow-md text-white text-left focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={selected ? '' : 'text-secondary-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#a259ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>
      {open && (
        <ul
          className="absolute z-50 mt-2 w-full bg-[#23233a]/90 border border-[#23233a]/60 rounded-lg shadow-xl backdrop-blur-md max-h-60 overflow-y-auto transition-all duration-200 origin-top scale-95 opacity-0 animate-dropdown-open"
          style={{ animation: 'dropdown-open 0.18s cubic-bezier(0.4,0,0.2,1) forwards' }}
          tabIndex={-1}
          role="listbox"
        >
          {options.map(opt => (
            <li
              key={opt.value}
              className={`px-4 py-2 cursor-pointer select-none transition-colors ${
                value === opt.value
                  ? 'bg-gradient-to-r from-[#a259ff]/30 to-[#377dff]/30 text-white' 
                  : 'hover:bg-secondary-700 text-secondary-200'
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              role="option"
              aria-selected={value === opt.value}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown; 