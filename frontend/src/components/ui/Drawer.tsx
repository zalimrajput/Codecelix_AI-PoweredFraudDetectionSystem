import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  width = 'md',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  const positionStyles = {
    left: 'left-0 border-r border-slate-800 animate-in slide-in-from-left duration-300',
    right: 'right-0 border-l border-slate-800 animate-in slide-in-from-right duration-300',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={`fixed inset-y-0 ${position === 'left' ? 'left-0' : 'right-0'} flex max-w-full pointer-events-none`}>
        <div
          className={`pointer-events-auto w-screen ${widthStyles[width]} ${positionStyles[position]} bg-slate-900 shadow-2xl flex flex-col`}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
                {description && (
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {footer && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
