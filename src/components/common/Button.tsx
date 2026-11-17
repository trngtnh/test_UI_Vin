'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'dark';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-blue text-white border border-transparent shadow-xs hover:bg-slate-900 hover:shadow-sm active:scale-[0.98] focus-visible:ring-brand-blue/30',
  secondary:
    'bg-blue-50 text-brand-blue border border-blue-200/70 hover:bg-blue-100 hover:border-blue-300 shadow-2xs active:scale-[0.98] focus-visible:ring-blue-400/30',
  outline:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs active:scale-[0.98] focus-visible:ring-slate-300/40',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] focus-visible:ring-slate-300/40',
  destructive:
    'bg-rose-600 text-white border border-transparent shadow-xs hover:bg-rose-700 active:scale-[0.98] focus-visible:ring-rose-400/30',
  dark:
    'bg-slate-900 text-white border border-slate-800 shadow-xs hover:bg-slate-800 hover:shadow-sm active:scale-[0.98] focus-visible:ring-slate-700/40',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px] rounded-lg gap-1',
  sm: 'h-8 px-3 text-xs rounded-xl gap-1.5',
  md: 'h-9 px-4 text-xs font-bold rounded-xl gap-2',
  lg: 'h-10 px-5 text-sm font-bold rounded-xl gap-2',
  'icon-sm': 'h-8 w-8 p-0 rounded-lg justify-center',
  'icon-md': 'h-9 w-9 p-0 rounded-xl justify-center',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center font-bold tracking-tight transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out select-none cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
        {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
