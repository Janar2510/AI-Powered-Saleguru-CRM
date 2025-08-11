import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  showCloseButton?: boolean;
  className?: string;
}

const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
  showCloseButton = true,
  className = ''
}) => {
  const { openModal, closeModal } = useModal();

  // Open modal when component mounts
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999999] !z-[9999999] p-4">
      <div className={`bg-[#23233a]/99 backdrop-blur-2xl rounded-xl w-full ${maxWidthClasses[maxWidth]} max-h-[95vh] overflow-y-auto border border-[#23233a]/60 shadow-2xl ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[#b0b0d0] text-sm mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BrandModal; 