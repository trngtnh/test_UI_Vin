'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const toast = useAppStore((state) => state.toast);
  const clearToast = useAppStore((state) => state.clearToast);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white/95 text-slate-800 shadow-lg shadow-emerald-500/10',
    warning: 'border-amber-200 bg-white/95 text-slate-800 shadow-lg shadow-amber-500/10',
    info: 'border-blue-200 bg-white/95 text-slate-800 shadow-lg shadow-blue-500/10',
  };

  return (
    <div className="fixed top-20 right-4 lg:right-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className={`p-4 rounded-xl border backdrop-blur-md flex items-start gap-3 ${borders[toast.type]}`}>
        {icons[toast.type]}
        <div className="flex-1 text-xs font-medium leading-relaxed">
          {toast.message}
        </div>
        <button
          onClick={clearToast}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
