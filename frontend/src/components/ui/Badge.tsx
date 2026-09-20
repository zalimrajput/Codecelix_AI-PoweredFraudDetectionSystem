import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'low' | 'medium' | 'high' | 'info' | 'neutral' | 'purple' | 'green' | 'blue';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

  const dotStyles = {
    low: 'bg-emerald-400',
    medium: 'bg-amber-400',
    high: 'bg-rose-400',
    info: 'bg-sky-400',
    neutral: 'bg-slate-400',
    purple: 'bg-purple-400',
    green: 'bg-emerald-400',
    blue: 'bg-blue-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] font-medium px-2 py-0.5 rounded gap-1 tracking-wider uppercase',
    md: 'text-xs font-medium px-2.5 py-1 rounded-md gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-mono border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]} animate-pulse`} />}
      {children}
    </span>
  );
};
