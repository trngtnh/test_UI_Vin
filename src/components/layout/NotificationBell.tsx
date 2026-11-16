'use client';

import React, { useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Bell, CheckCircle2, Clock, Info, ExternalLink, X } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const notifications = useAppStore((state) => state.notifications);
  const isNotificationOpen = useAppStore((state) => state.isNotificationOpen);
  const toggleNotificationOpen = useAppStore((state) => state.toggleNotificationOpen);
  const markNotificationsAsRead = useAppStore((state) => state.markNotificationsAsRead);
  const selectModel = useAppStore((state) => state.selectModel);
  const setCustomerTab = useAppStore((state) => state.setCustomerTab);
  const setProfileModalOpen = useAppStore((state) => state.setProfileModalOpen);

  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        if (isNotificationOpen) toggleNotificationOpen();
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen, toggleNotificationOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          toggleNotificationOpen();
          if (!isNotificationOpen && unreadCount > 0) {
            markNotificationsAsRead();
          }
        }}
        aria-label="Thông báo hệ thống"
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notifications Popover */}
      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Popover Header */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-blue" />
              <span className="text-xs font-bold text-slate-900">Thông báo hệ thống</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <button
              onClick={toggleNotificationOpen}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    toggleNotificationOpen();
                    setProfileModalOpen(true, 'history');
                  }}
                  className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                    !notif.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'approval' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : notif.type === 'ticket' ? (
                      <Clock className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Info className="w-4 h-4 text-brand-blue" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {notif.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      {notif.modelId && (
                        <span className="text-[10px] font-semibold text-brand-accent flex items-center gap-0.5 hover:underline">
                          <span>Xem dự toán</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400">
              Hệ thống O2O VinFast · Tự động đồng bộ với Showroom Cầu Giấy
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
