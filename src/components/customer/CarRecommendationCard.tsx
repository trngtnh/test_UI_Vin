'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG, CATALOG_EFFECTIVE_DATE } from '@/lib/catalog';
import { CheckCircle2, Zap, BatteryCharging, Shield, Users, Compass, CalendarCheck } from 'lucide-react';
import { ModelId } from '@/types';

export const CarRecommendationCard: React.FC = () => {
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const selectModel = useAppStore((state) => state.selectModel);
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);

  if (!selectedModelId) return null;

  const car = CAR_CATALOG[selectedModelId];
  const allModels: ModelId[] = ['VF5', 'VF6', 'VF7'];

  return (
    <div className="app-card overflow-hidden fade-enter border-blue-100 shadow-sm">
      {/* Model Switcher Segmented Control */}
      <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
          Chuyển đổi mẫu xe:
        </span>
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
          {allModels.map((mId) => {
            const m = CAR_CATALOG[mId];
            const isActive = mId === selectedModelId;
            return (
              <button
                key={mId}
                type="button"
                onClick={() => selectModel(mId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{m.display_name.replace('VinFast ', '')}</span>
                <span className={`text-[10px] font-normal ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  ~{Math.round(m.price / 1000000)} tr
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Car Presentation Body */}
      <div className="p-5 flex flex-col md:flex-row gap-5 items-start">
        {/* Car Image with Zoom Effect */}
        <div className="w-full md:w-60 h-40 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/80 relative group">
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-brand-blue shadow-2xs">
            {car.badge}
          </span>
          <img
            src={car.image}
            alt={car.display_name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Specs & Pricing Details */}
        <div className="flex-1 flex flex-col justify-between h-full space-y-3 w-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-brand-accent" />
                <span>Thế hệ {car.generation_id} · Bản {car.variant_id.toUpperCase()}</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Nguồn: {car.source} · {CATALOG_EFFECTIVE_DATE}
              </span>
            </div>

            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {car.display_name}
              </h3>
              <div className="text-right">
                <span className="text-lg font-black text-brand-blue block">
                  {car.price.toLocaleString('vi-VN')} VNĐ
                </span>
                <span className="text-[10px] text-slate-400">(Giá đã gồm Pin & Bộ sạc chính hãng)</span>
              </div>
            </div>
          </div>

          {/* 4 Interactive Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-slate-500" />
                <span>Số chỗ</span>
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">{car.seats}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <BatteryCharging className="w-3 h-3 text-emerald-600" />
                <span>Tầm chạy</span>
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">{car.range_nedc} km</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-blue-600" />
                <span>Dung lượng pin</span>
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">{car.battery_kwh} kWh</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-indigo-600" />
                <span>Bảo hành</span>
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">{car.warranty_years}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Concrete Reasons */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 border-t border-slate-100 space-y-2 text-xs text-slate-700">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-slate-900">Vừa vặn ngân sách:</strong> {car.reason_budget}
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-slate-900">Chu kỳ sạc tiện lợi:</strong> {car.reason_charging}
          </p>
        </div>
      </div>
    </div>
  );
};
