'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { User, Headset, RotateCcw, MapPin } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { VINFAST_FACILITIES } from '@/lib/catalog';
import { CityId } from '@/types';

export const Header: React.FC = () => {
  const currentRole = useAppStore((state) => state.currentRole);
  const setRole = useAppStore((state) => state.setRole);
  const resetSession = useAppStore((state) => state.resetSession);
  const ticket = useAppStore((state) => state.ticket);
  const userProfile = useAppStore((state) => state.userProfile);
  const setProfileModalOpen = useAppStore((state) => state.setProfileModalOpen);
  const selectedCity = useAppStore((state) => state.selectedCity) || 'national';
  const setCity = useAppStore((state) => state.setCity);

  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;
  const pendingCount = ticket.status === 'pending_approval' ? 1 : 0;

  return (
    <header className="shrink-0 sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Dynamic Showroom Location Selector */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white shadow-xs shrink-0 ring-1 ring-white/10">
            {/* VinFast Official Stylized V-Wing Insignia */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.5 6.5C7.2 10.2 10.5 12 12 12C13.5 12 16.8 10.2 21.5 6.5L12 19.5L2.5 6.5Z"
                fill="currentColor"
              />
              <path
                d="M5.5 4.5C8.8 6.8 10.8 7.8 12 7.8C13.2 7.8 15.2 6.8 18.5 4.5L12 14.2L5.5 4.5Z"
                fill="currentColor"
                fillOpacity="0.35"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-sm tracking-widest text-slate-900 uppercase">
                VINFAST
              </span>
              <span className="h-3.5 w-px bg-slate-300" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-700 tracking-tight">
                Tư vấn Xe điện
              </span>
              
              {/* Dynamic City / Showroom Facility Dropdown */}
              <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 rounded-full px-2.5 py-0.5 border border-slate-200 transition cursor-pointer ml-1">
                <MapPin className="w-3 h-3 text-brand-blue shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setCity(e.target.value as CityId)}
                  className="bg-transparent text-[11px] font-semibold text-slate-800 cursor-pointer focus:outline-hidden pr-0.5 appearance-none"
                  aria-label="Chọn địa điểm Showroom"
                >
                  <option value="national">Toàn quốc (Việt Nam)</option>
                  <option value="hanoi">Hà Nội · Cầu Giấy</option>
                  <option value="hcm">TP.HCM · Landmark 81</option>
                  <option value="danang">Đà Nẵng · Ngô Quyền</option>
                  <option value="haiphong">Hải Phòng · Imperia</option>
                  <option value="cantho">Cần Thơ · Hùng Vương</option>
                </select>
                <span className="text-[10px] text-slate-400 pointer-events-none">▾</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate max-w-md">
                {selectedCity === 'national'
                  ? 'Cổng tư vấn chính hãng toàn quốc · Ưu đãi 100% lệ phí trước bạ'
                  : `Showroom ${currentFacility.showroomName.replace('Showroom VinFast ', '')} · ${currentFacility.address}`}
              </span>
            </p>
          </div>
        </div>

        {/* WORKSPACE PORTAL SELECTOR & NOTIFICATIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200" role="tablist" aria-label="Phân hệ làm việc">
            <button
              onClick={() => setRole('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentRole === 'customer'
                  ? 'bg-white text-brand-blue shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              role="tab"
              aria-selected={currentRole === 'customer'}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Khách hàng tìm xe</span>
              <span className="sm:hidden">Khách</span>
            </button>

            <button
              onClick={() => setRole('advisor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                currentRole === 'advisor'
                  ? 'bg-white text-brand-blue shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              role="tab"
              aria-selected={currentRole === 'advisor'}
            >
              <Headset className="w-4 h-4" />
              <span className="hidden sm:inline">
                {selectedCity === 'national' ? 'Showroom VinFast' : currentFacility.showroomName.replace('Showroom VinFast ', '')}
              </span>
              <span className="sm:hidden">Showroom</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* User Account / Profile Button */}
          <button
            type="button"
            onClick={() => setProfileModalOpen(true, 'history')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-700 hover:text-brand-blue hover:bg-slate-100 transition-colors border border-slate-200 flex items-center gap-1.5 shadow-2xs"
            title="Trang cá nhân & Lịch sử đăng ký"
            aria-label="Trang cá nhân & Lịch sử đăng ký"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-800">
              {userProfile.fullName ? userProfile.fullName.split(' ').slice(-1)[0] : 'Tài khoản'}
            </span>
          </button>

          {/* Real-time Notification Bell */}
          <NotificationBell />

          {/* Reset session button */}
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn làm mới lại phiên làm việc?')) {
                resetSession();
              }
            }}
            title="Làm mới phiên tư vấn"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
