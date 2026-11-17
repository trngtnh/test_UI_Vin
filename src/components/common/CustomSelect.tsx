'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  disabled?: boolean;
}

export interface CustomSelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'ghost';
  disabled?: boolean;
  align?: 'left' | 'right';
  'aria-label'?: string;
}

export function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Chọn một mục...',
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  align = 'left',
  'aria-label': ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const nextIndex = (currentIndex + 1) % options.length;
        onChange(options[nextIndex].value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        onChange(options[prevIndex].value);
      }
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg min-h-[30px]',
    md: 'px-3 py-2 text-xs gap-2 rounded-xl min-h-[38px]',
    lg: 'px-4 py-2.5 text-sm gap-2.5 rounded-xl min-h-[44px]',
  };

  const variantClasses = {
    default:
      'bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15',
    subtle:
      'bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 text-slate-700 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15',
    ghost:
      'bg-transparent border border-transparent hover:bg-slate-100 text-slate-700 focus:bg-white focus:border-slate-200',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full font-semibold inline-flex items-center justify-between cursor-pointer transition-all duration-150 select-none ${
          sizeClasses[size]
        } ${variantClasses[variant]} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
        } ${isOpen ? 'ring-2 ring-brand-blue/20 border-brand-blue' : ''} ${triggerClassName}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ease-out ml-1 ${
            isOpen ? 'rotate-180 text-brand-blue' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          tabIndex={-1}
          className={`absolute z-50 mt-1.5 w-full min-w-[200px] max-h-64 overflow-y-auto bg-white rounded-2xl border border-slate-200/90 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${dropdownClassName}`}
          style={{ boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.15), 0 4px 12px -2px rgba(15, 23, 42, 0.08)' }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-100 select-none ${
                  option.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isSelected
                    ? 'bg-blue-50/90 text-brand-blue font-bold'
                    : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-950'
                }`}
              >
                <div className="flex flex-col gap-0.5 truncate pr-2">
                  <span className="truncate">{option.label}</span>
                  {option.sublabel && (
                    <span className="text-[10px] text-slate-400 font-normal truncate">
                      {option.sublabel}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {option.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold">
                      {option.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-brand-blue stroke-[2.5]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
