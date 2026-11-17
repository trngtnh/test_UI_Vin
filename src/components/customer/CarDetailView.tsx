'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG, CATALOG_EFFECTIVE_DATE } from '@/lib/catalog';
import { ModelId } from '@/types';
import { TCOEstimateCard } from './TCOEstimateCard';
import {
  ArrowLeft,
  BatteryCharging,
  Zap,
  Shield,
  Layers,
  Calendar,
  CheckCircle2,
  Gauge,
  Sparkles,
} from 'lucide-react';

export const CarDetailView: React.FC = () => {
  const selectedModelId = useAppStore((state) => state.selectedModelId) || 'VF6';
  const selectModel = useAppStore((state) => state.selectModel);
  const setCustomerTab = useAppStore((state) => state.setCustomerTab);
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);

  const car = CAR_CATALOG[selectedModelId];
  const allModels: ModelId[] = ['VF5', 'VF6', 'VF7'];

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  return (
    <div className="space-y-6 fade-enter">
      {/* Top Navigation & Model Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setCustomerTab('catalog')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-blue transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition">
            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-brand-blue group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>Quay lại Danh mục Xe VinFast</span>
        </button>

        {/* Model Switcher Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto overflow-x-auto">
          {allModels.map((mId) => {
            const m = CAR_CATALOG[mId];
            const isActive = mId === selectedModelId;
            return (
              <button
                key={mId}
                type="button"
                onClick={() => {
                  selectModel(mId, true);
                  setSelectedColorIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{m.display_name.replace('VinFast ', '')}</span>
                <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  ~{Math.round(m.price / 1000000)} tr
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Showcase Card */}
      <div className="app-card overflow-hidden border-slate-200 shadow-sm">
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Car Image & Color Picker (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative h-64 sm:h-80 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl p-6 flex items-center justify-center border border-slate-200/80 overflow-hidden group">
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-lg text-xs font-bold bg-white text-brand-blue shadow-xs">
                {car.badge}
              </span>
              <img
                src={car.image}
                alt={car.display_name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Exterior Color Palette */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px]">Màu sắc ngoại thất:</span>
                <span className="font-bold text-slate-800">
                  {car.colors[selectedColorIndex]?.name || 'Mặc định'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {car.colors.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      selectedColorIndex === idx
                        ? 'border-brand-accent scale-110 shadow-xs ring-2 ring-blue-100'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Key Specs & Pricing Overview (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Biểu giá Niêm yết Chính hãng · {CATALOG_EFFECTIVE_DATE}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {car.display_name}
              </h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-blue tabular-nums whitespace-nowrap">
                  {car.price.toLocaleString('vi-VN')}&nbsp;VNĐ
                </span>
                <span className="text-xs text-slate-500 whitespace-nowrap">(Đã gồm Pin & Sạc)</span>
              </div>
              <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ưu đãi 100% lệ phí trước bạ xe điện tại Hà Nội (Tiết kiệm ~{Math.round(car.price * 0.1 / 1000000)} triệu)</span>
              </p>
            </div>

            {/* Quick Spec Highlights */}
            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Kích thước (DxRxC)</span>
                <strong className="text-slate-900 text-xs">{car.dimensions}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Chiều dài cơ sở</span>
                <strong className="text-slate-900 text-xs">{car.wheelbase}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Động cơ & Công suất</span>
                <strong className="text-slate-900 text-xs">{car.motor_power}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Sạc nhanh 10-70%</span>
                <strong className="text-slate-900 text-xs">{car.charging_time}</strong>
              </div>
            </div>

            {/* 2 Key Reasons */}
            <div className="space-y-2 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p><strong>Ngân sách:</strong> {car.reason_budget}</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
                <p><strong>Sạc & Vận hành:</strong> {car.reason_charging}</p>
              </div>
            </div>

            {/* Top Action CTAs */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setTestDriveModalOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>Đăng ký Lái thử</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomerTab('compare')}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Layers className="w-4 h-4" />
                <span>So sánh xe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated TCO Calculator Section */}
      <TCOEstimateCard />
    </div>
  );
};
