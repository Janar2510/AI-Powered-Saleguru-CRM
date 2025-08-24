import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  title?: string;
  subtitle?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  open, 
  onClose, 
  children, 
  size = 'lg',
  title,
  subtitle
}) => {
  const { openModal, closeModal } = useModal();

  // Open modal when component mounts
  useEffect(() => {
    if (open) {
      openModal();
      return () => closeModal();
    }
  }, [open, openModal, closeModal]);

  if (!open) return null;

  // Unified modal width mapping (consistent across the app)
  const sizeClasses = {
    sm: 'max-w-lg',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    '3xl': 'max-w-4xl',
    '4xl': 'max-w-5xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-6xl'
  } as const;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className={`bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full ${sizeClasses[size]} max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl`}>
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
            {(title || subtitle) && (
              <div>
                {title && (
                  <h3 className="text-xl font-semibold text-white">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-[#b0b0d0] text-sm mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export { Modal }; 