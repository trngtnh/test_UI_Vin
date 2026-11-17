'use client';

import React from 'react';

export type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'outline' | 'dark' | 'destructive' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  pulseDot?: boolean;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200/80',
  brand: 'bg-blue-50 text-brand-blue border-blue-200/80',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  outline: 'bg-white text-slate-700 border-slate-200',
  dark: 'bg-slate-900 text-slate-100 border-slate-800',
  destructive: 'bg-rose-50 text-rose-700 border-rose-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  brand: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  outline: 'bg-slate-400',
  dark: 'bg-emerald-400',
  destructive: 'bg-rose-500',
  danger: 'bg-rose-500',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  dot = false,
  pulseDot = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors select-none whitespace-nowrap shrink-0 ${
        badgeVariants[variant]
      } ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]} ${
            pulseDot ? 'animate-pulse' : ''
          }`}
        />
      )}
      {children}
    </span>
  );
};
