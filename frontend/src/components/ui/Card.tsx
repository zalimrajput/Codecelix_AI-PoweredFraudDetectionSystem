import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
  title,
  description,
  action,
}) => {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl shadow-card backdrop-blur-sm overflow-hidden flex flex-col ${className}`}
    >
      {(header || title) && (
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
          {header ? (
            header
          ) : (
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="p-5 flex-1">{children}</div>

      {footer && (
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40">
          {footer}
        </div>
      )}
    </div>
  );
};
