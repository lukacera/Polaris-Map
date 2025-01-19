import React, { useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  primaryButton: {
    label: string | React.ReactNode;
    onClick: () => void;
    className?: string;
  };
  secondaryButton?: {
    label: string;
    onClick: () => void;
    className?: string;
  };
}

export default function PopupModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  primaryButton,
  secondaryButton
}: ModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, handleEscapeKey]);

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-black/60 
        flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div className="bg-background text-white rounded-2xl p-6 w-full max-w-md mx-4 relative shadow-2xl border border-surface-border">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors duration-200 
              hover:bg-surface-border/10 p-2 rounded-full"
          type="button"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {icon}
            {title}
          </h2>
          {description && (
            <p className="text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {secondaryButton && (
            <button
              onClick={secondaryButton.onClick}
              className={secondaryButton.className || 
                "flex-1 px-4 py-2.5 text-gray-300 hover:text-white transition-colors duration-200 border border-surface-border hover:border-surface-border/70 rounded-xl hover:bg-surface-border/10"}
            >
              {secondaryButton.label}
            </button>
          )}
          <button
            onClick={primaryButton.onClick}
            className={primaryButton.className || 
              "flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl transition-all duration-200 font-medium"}
          >
            {primaryButton.label}
          </button>
        </div>
      </div>
    </div>
  );
}