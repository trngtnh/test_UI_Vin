'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG, CATALOG_EFFECTIVE_DATE, VINFAST_FACILITIES } from '@/lib/catalog';
import { ModelId } from '@/types';
import { UrbanChargingWidget } from './UrbanChargingWidget';
import { DynamicArbiterWidget } from './DynamicArbiterWidget';
import { TCOEstimateCard } from '@/components/customer/TCOEstimateCard';
import { CarDetailModal } from '@/components/customer/CarDetailModal';
import {
  CheckCircle2,
  Zap,
  Layers,
  FileText,
  ShieldCheck,
  Gauge,
  ArrowRight,
  ArrowLeft,
  BatteryCharging,
  Clock,
  Sparkles,
  Calendar,
  Send,
  Sliders,
  Check,
  Scale,
  Car,
  RotateCcw,
  Info,
} from 'lucide-react';

export const LivingCanvasPane: React.FC = () => {
  const selectedModelId = useAppStore((state) => state.selectedModelId) || 'VF6';
  const selectModel = useAppStore((state) => state.selectModel);
  const canvasMode = useAppStore((state) => state.canvasMode);
  const setCanvasMode = useAppStore((state) => state.setCanvasMode);
  const setJourneyStep = useAppStore((state) => state.setJourneyStep);
  const backToHall = useAppStore((state) => state.backToHall);
  const proceedToTCO = useAppStore((state) => state.proceedToTCO);
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);
  const openComparisonModal = useAppStore((state) => state.openComparisonModal);
  const selectedCity = useAppStore((state) => state.selectedCity) || 'national';

  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;
  const car = CAR_CATALOG[selectedModelId] || CAR_CATALOG.VF6;
  const allModels: ModelId[] = ['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9'];
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [hallFilter, setHallFilter] = useState<'all' | 'under500' | '500to700' | '700to1000' | 'over1000'>('all');

  // Pop-up Detail Modal State
  const [detailModalModelId, setDetailModalModelId] = useState<ModelId | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenCarDetail = (mId: ModelId) => {
    setDetailModalModelId(mId);
    setIsDetailModalOpen(true);
  };

  const currentColor = car?.colors[selectedColorIndex] || car?.colors[0] || { name: 'Trắng', hex: '#fff' };

  const filteredModels = allModels.filter((mId) => {
    const m = CAR_CATALOG[mId];
    if (!m) return false;
    if (hallFilter === 'under500') return m.price < 500000000;
    if (hallFilter === '500to700') return m.price >= 500000000 && m.price <= 700000000;
    if (hallFilter === '700to1000') return m.price > 700000000 && m.price <= 1000000000;
    if (hallFilter === 'over1000') return m.price > 1000000000;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden relative">
      {/* =========================================================================
          VIEW 1: SẢNH CHÍNH GIỚI THIỆU XE VINFAST (SHOWROOM HALL) - DEFAULT ON LOAD
          ========================================================================= */}
      {canvasMode === 'hall' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Hall Header Strip */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 text-brand-blue flex items-center justify-center shadow-2xs shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                    {selectedCity === 'national'
                      ? 'Dải Xe Điện VinFast Toàn Cầu'
                      : `Dải Xe Điện VinFast · ${currentFacility.cityName}`}
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    Ưu đãi 100% Lệ phí trước bạ
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Biểu giá niêm yết kèm pin & chính sách bảo hành chính hãng · Áp dụng {CATALOG_EFFECTIVE_DATE}
                </p>
              </div>
            </div>

            {/* Quick Actions: Open 2-3 Cars Comparison Pop-up */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openComparisonModal([])}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs whitespace-nowrap shrink-0"
              >
                <Scale className="w-3.5 h-3.5 text-brand-blue" />
                <span>So sánh các dòng xe</span>
              </button>
            </div>
          </div>

          {/* Hall Body: Scrollable Car Cards */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* VinFast Official Hero Banner */}
            <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-900 via-brand-blue to-slate-900 text-white relative overflow-hidden shadow-sm">
              <div className="relative z-10 max-w-xl space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-blue-200 border border-white/20">
                  {selectedCity === 'national' ? 'VinFast Việt Nam' : currentFacility.showroomName}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Khám phá Toàn bộ Dải Xe Điện Thế hệ Mới
                </h1>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Trải nghiệm dải 6 mẫu xe điện từ mini đô thị (VF 3) đến SUV hạng sang (VF 9). Hưởng <strong>100% ưu đãi lệ phí trước bạ xe điện</strong> theo Nghị định 10/2022/NĐ-CP (tiết kiệm từ ~35 đến trên 150 triệu đồng).
                </p>
              </div>
            </div>

            {/* Segment Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setHallFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    hallFilter === 'all'
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Tất cả ({allModels.length} xe)
                </button>
                <button
                  type="button"
                  onClick={() => setHallFilter('under500')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    hallFilter === 'under500'
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Dưới 500 tr (VF 3, VF 5)
                </button>
                <button
                  type="button"
                  onClick={() => setHallFilter('500to700')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    hallFilter === '500to700'
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  500 - 700 tr (VF 6)
                </button>
                <button
                  type="button"
                  onClick={() => setHallFilter('700to1000')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    hallFilter === '700to1000'
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  700 tr - 1 tỷ (VF 7)
                </button>
                <button
                  type="button"
                  onClick={() => setHallFilter('over1000')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    hallFilter === 'over1000'
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Trên 1 tỷ (VF 8, VF 9)
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Hiển thị {filteredModels.length} mẫu xe
              </span>
            </div>

            {/* 3 Model Cards Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {filteredModels.map((mId) => {
                const item = CAR_CATALOG[mId];
                return (
                  <div
                    key={mId}
                    className="rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Top Image & Badge */}
                    <div className="p-4 bg-slate-50/80 border-b border-slate-100 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-brand-blue shadow-2xs border border-slate-200/60">
                          {item.badge}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                          {item.seats}
                        </span>
                      </div>

                      {/* Vector Visual Silhouette Preview */}
                      <div className="h-32 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                        <svg
                          viewBox="0 0 420 180"
                          className="w-full max-h-28 drop-shadow-xs"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <linearGradient id={`grad-${mId}`} x1="0%" y1="0%" x2="100%" y2="80%">
                              <stop offset="0%" stopColor={item.colors[0]?.hex || '#2563EB'} stopOpacity="0.95" />
                              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <ellipse cx="210" cy="162" rx="160" ry="8" fill="#0f172a" fillOpacity="0.2" />
                          <path
                            d="M 45 130 C 50 100, 75 90, 110 82 C 145 74, 180 50, 240 50 C 295 50, 325 72, 355 92 C 380 98, 395 110, 395 130 C 395 142, 385 146, 360 146 C 350 126, 320 126, 310 146 L 140 146 C 130 126, 100 126, 90 146 Z"
                            fill={`url(#grad-${mId})`}
                            stroke="#334155"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M 125 82 C 150 72, 185 55, 235 55 C 275 55, 305 70, 325 84 C 322 88, 300 88, 240 88 Z"
                            fill="#0f172a"
                            stroke="#475569"
                            strokeWidth="1"
                          />
                          <path d="M 370 105 L 392 112 L 368 116" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
                          <circle cx="335" cy="144" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                          <circle cx="115" cy="144" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>

                    {/* Middle Info Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-blue transition-colors">
                          {item.display_name}
                        </h3>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-base font-black text-brand-blue tabular-nums">
                            {item.price.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[10px] text-slate-400">(kèm pin & sạc)</span>
                        </div>
                      </div>

                      {/* Specs Matrix */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 border-t border-slate-100 pt-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-50 flex items-center gap-1">
                          <BatteryCharging className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Tầm chạy: <strong>{item.range_nedc} km</strong></span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>Pin: <strong>{item.battery_kwh} kWh</strong></span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Sạc nhanh: <strong>~25 phút</strong></span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>Bảo hành: <strong>{item.warranty_years}</strong></span>
                        </div>
                      </div>

                      {/* Reason note */}
                      <p className="text-[11px] text-slate-600 line-clamp-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100/60 leading-relaxed">
                        {item.reason_budget}
                      </p>

                      {/* Dual Action Buttons: Xem chi tiết mở Pop-up Modal, giữ nguyên Sảnh chính (Giai đoạn 1) */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenCarDetail(mId)}
                          className="flex-1 py-2 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs"
                        >
                          Xem chi tiết
                        </button>

                        <button
                          type="button"
                          onClick={() => proceedToTCO(mId)}
                          className="flex-1 py-2 px-3 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1"
                        >
                          <span>Tính TCO</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: CHI TIẾT XE ĐƠN LẺ ĐƯỢC CHỌN (DETAIL STAGE)
          ========================================================================= */}
      {canvasMode === 'detail' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Bar with Back to Hall Button & Model Tabs */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={backToHall}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-blue transition group"
            >
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 flex items-center justify-center shadow-2xs">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span>Quay lại Sảnh chính</span>
            </button>

            {/* Model Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
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
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-brand-blue text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{m.display_name.replace('VinFast ', '')}</span>
                    <span className={`text-[10px] tabular-nums ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      ~{Math.round(m.price / 1000000)} tr
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Vehicle Hero Stage */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border border-slate-200/90 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Left: Car Stage with color picker */}
                <div className="md:col-span-6 space-y-3">
                  <div className="relative h-48 bg-gradient-to-b from-slate-100/90 to-slate-200/60 rounded-xl p-4 flex flex-col items-center justify-center overflow-hidden border border-slate-200/80">
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white text-brand-blue shadow-2xs z-10">
                      {car.badge}
                    </span>

                    <svg
                      viewBox="0 0 420 180"
                      className="w-full max-h-36 drop-shadow-md"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="detailPaintGrad" x1="0%" y1="0%" x2="100%" y2="80%">
                          <stop offset="0%" stopColor={currentColor.hex} stopOpacity="0.95" />
                          <stop offset="60%" stopColor={currentColor.hex} stopOpacity="1" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="210" cy="162" rx="170" ry="10" fill="#0f172a" fillOpacity="0.25" />
                      <path
                        d="M 45 130 C 50 100, 75 90, 110 82 C 145 74, 180 50, 240 50 C 295 50, 325 72, 355 92 C 380 98, 395 110, 395 130 C 395 142, 385 146, 360 146 C 350 126, 320 126, 310 146 L 140 146 C 130 126, 100 126, 90 146 Z"
                        fill="url(#detailPaintGrad)"
                        stroke="#334155"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M 125 82 C 150 72, 185 55, 235 55 C 275 55, 305 70, 325 84 C 322 88, 300 88, 240 88 Z"
                        fill="#0f172a"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                      <path d="M 370 105 L 392 112 L 368 116" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="335" cy="144" r="24" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                      <circle cx="115" cy="144" r="24" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    </svg>

                    <span className="text-[10px] font-semibold text-slate-500 mt-1">
                      Mô hình studio tương tác · Sơn ngoại thất thực tế
                    </span>
                  </div>

                  {/* Exterior color dots */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[11px] font-medium text-slate-600">
                      Màu ngoại thất: <strong>{currentColor.name}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {car.colors.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColorIndex(idx)}
                          title={c.name}
                          className={`w-5 h-5 rounded-full border transition-transform ${
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

                {/* Right: Pricing & Personalized Reasoning */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Biểu giá Niêm yết Chính hãng · Áp dụng {CATALOG_EFFECTIVE_DATE}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {car.display_name}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-brand-blue tabular-nums">
                        {car.price.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[11px] text-slate-500">(kèm Pin & Sạc)</span>
                    </div>
                  </div>

                  {/* 2 AI Reasons */}
                  <div className="space-y-2 text-xs text-slate-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/90">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed">
                        <strong className="text-slate-900">Tài chính:</strong> {car.reason_budget}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-brand-blue mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed">
                        <strong className="text-slate-900">Vận hành:</strong> {car.reason_charging}
                      </p>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Kích thước (DxRxC)</span>
                      <strong className="text-slate-800 text-[11px]">{car.dimensions}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Động cơ & Công suất</span>
                      <strong className="text-slate-800 text-[11px]">{car.motor_power}</strong>
                    </div>
                  </div>

                  {/* Primary CTA to proceed to TCO */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTestDriveModalOpen(true)}
                      className="py-2.5 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                      <span>Đăng ký Lái thử</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openComparisonModal([selectedModelId])}
                      className="py-2.5 px-3.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-brand-blue text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
                    >
                      <Scale className="w-3.5 h-3.5 text-brand-blue" />
                      <span>So sánh 2-3 xe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => proceedToTCO(selectedModelId)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 group"
                    >
                      <span>Chốt chọn xe này & Tính TCO</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Urban Charging Preview */}
            <UrbanChargingWidget />
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: XE ĐỀ XUẤT TỪ AI AGENT (RECOMMENDATIONS & COMPARISON)
          ========================================================================= */}
      {canvasMode === 'recommendations' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Bar */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={backToHall}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-blue transition group"
            >
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 flex items-center justify-center shadow-2xs">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span>Quay lại Sảnh chính</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue border border-blue-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phương án đề xuất tối ưu từ AI Agent</span>
              </span>
              <button
                type="button"
                onClick={() => openComparisonModal([selectedModelId])}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0"
              >
                <Scale className="w-3.5 h-3.5 text-brand-blue" />
                <span>So sánh 2-3 xe</span>
              </button>
            </div>
          </div>

          {/* Recommendations Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Primary Matched Car Showcase: Car Visual + Button [Xem chi tiết xe] pop up */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 border-2 border-brand-accent shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand-blue text-white shadow-2xs">
                  MẪU XE KHỚP NHẤT VỚI NHU CẦU CỦA BẠN
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {car.badge} · {car.seats}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Left Info: Name, Price, AI analysis, safe range */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{car.display_name}</h3>
                    <div className="text-2xl font-black text-brand-blue tabular-nums mt-0.5">
                      {car.price.toLocaleString('vi-VN')} đ
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white/95 p-3 rounded-xl border border-blue-100 shadow-2xs">
                    <strong className="text-slate-900">Đánh giá của AI:</strong> {car.reason_budget} {car.reason_charging}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Tầm chạy an toàn (85% DoD)</span>
                      <strong className="text-emerald-700">{Math.round(car.range_real * 0.85)} km / lần sạc</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Sạc nhanh 10-70%</span>
                      <strong className="text-slate-800">{car.charging_time}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Studio Vehicle Silhouette + Button [Xem chi tiết xe] */}
                <div className="md:col-span-6 flex flex-col items-center justify-center space-y-3 bg-white/80 p-3 rounded-xl border border-blue-100">
                  <div className="w-full h-36 flex items-center justify-center">
                    <svg
                      viewBox="0 0 420 180"
                      className="w-full max-h-32 drop-shadow-md"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id={`rec-primary-${car.model_id}`} x1="0%" y1="0%" x2="100%" y2="80%">
                          <stop offset="0%" stopColor={car.colors[0]?.hex || '#2563EB'} stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="210" cy="162" rx="160" ry="8" fill="#0f172a" fillOpacity="0.25" />
                      <path
                        d="M 45 130 C 50 100, 75 90, 110 82 C 145 74, 180 50, 240 50 C 295 50, 325 72, 355 92 C 380 98, 395 110, 395 130 C 395 142, 385 146, 360 146 C 350 126, 320 126, 310 146 L 140 146 C 130 126, 100 126, 90 146 Z"
                        fill={`url(#rec-primary-${car.model_id})`}
                        stroke="#334155"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M 125 82 C 150 72, 185 55, 235 55 C 275 55, 305 70, 325 84 C 322 88, 300 88, 240 88 Z"
                        fill="#0f172a"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                      <path d="M 370 105 L 392 112 L 368 116" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="335" cy="144" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                      <circle cx="115" cy="144" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    </svg>
                  </div>

                  {/* Pop-up Button: Opens CarDetailModal without leaving Recommendations */}
                  <button
                    type="button"
                    onClick={() => handleOpenCarDetail(selectedModelId)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 hover:border-brand-accent bg-white hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>Xem chi tiết thông số xe</span>
                  </button>
                </div>
              </div>

              {/* Main Recommendation CTA */}
              <button
                type="button"
                onClick={() => proceedToTCO(selectedModelId)}
                className="w-full py-3 px-4 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 group"
              >
                <span>Chốt chọn mẫu xe này & Tính toán TCO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Other 2 Models to Compare with Vehicle Visual, Hover Tooltip Reasons, and Action Buttons */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2.5">
                Hoặc xem xét thêm 2 lựa chọn đối chiếu cùng phân khúc:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  selectedModelId === 'VF3' ? ['VF5', 'VF6'] :
                  selectedModelId === 'VF5' ? ['VF3', 'VF6'] :
                  selectedModelId === 'VF6' ? ['VF5', 'VF7'] :
                  selectedModelId === 'VF7' ? ['VF6', 'VF8'] :
                  selectedModelId === 'VF8' ? ['VF7', 'VF9'] :
                  ['VF7', 'VF8']
                ).map((otherId) => {
                  const otherCar = CAR_CATALOG[otherId as ModelId];
                  if (!otherCar) return null;
                    return (
                      <div
                        key={otherId}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        {/* Top Bar with Badge, Seats and Hover Tooltip Icon for Reasons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              {otherCar.badge}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{otherCar.seats}</span>
                          </div>

                          {/* Info Hover Tooltip for Reasons */}
                          <div className="relative group/tooltip">
                            <button
                              type="button"
                              className="p-1 rounded-full text-slate-400 hover:text-brand-blue hover:bg-blue-50 transition"
                              aria-label="Lý do đối chiếu"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            {/* Hover Popover */}
                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-30 pointer-events-none animate-in fade-in duration-150 leading-relaxed">
                              <p className="font-bold text-blue-300 mb-1">Lý do đối chiếu:</p>
                              <p>{otherCar.reason_budget}</p>
                              <p className="mt-1 text-slate-300">{otherCar.reason_charging}</p>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Visual Silhouette Preview */}
                        <div className="h-28 flex items-center justify-center bg-slate-50/90 rounded-xl p-2 border border-slate-100">
                          <svg
                            viewBox="0 0 420 180"
                            className="w-full max-h-24 drop-shadow-xs"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <linearGradient id={`rec-alt-${otherId}`} x1="0%" y1="0%" x2="100%" y2="80%">
                                <stop offset="0%" stopColor={otherCar.colors[0]?.hex || '#2563EB'} stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                              </linearGradient>
                            </defs>
                            <ellipse cx="210" cy="162" rx="160" ry="8" fill="#0f172a" fillOpacity="0.2" />
                            <path
                              d="M 45 130 C 50 100, 75 90, 110 82 C 145 74, 180 50, 240 50 C 295 50, 325 72, 355 92 C 380 98, 395 110, 395 130 C 395 142, 385 146, 360 146 C 350 126, 320 126, 310 146 L 140 146 C 130 126, 100 126, 90 146 Z"
                              fill={`url(#rec-alt-${otherId})`}
                              stroke="#334155"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M 125 82 C 150 72, 185 55, 235 55 C 275 55, 305 70, 325 84 C 322 88, 300 88, 240 88 Z"
                              fill="#0f172a"
                              stroke="#475569"
                              strokeWidth="1"
                            />
                            <path d="M 370 105 L 392 112 L 368 116" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="335" cy="144" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                            <circle cx="115" cy="144" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                          </svg>
                        </div>

                        {/* Name & Price */}
                        <div className="flex items-baseline justify-between">
                          <h5 className="text-xs font-bold text-slate-900">{otherCar.display_name}</h5>
                          <span className="text-xs font-extrabold text-brand-blue tabular-nums">
                            {otherCar.price.toLocaleString('vi-VN')} đ
                          </span>
                        </div>

                        {/* Dual Action Buttons: [Xem chi tiết] & [Chọn & Tính TCO] */}
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenCarDetail(otherId as ModelId)}
                            className="flex-1 py-2 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            type="button"
                            onClick={() => proceedToTCO(otherId as ModelId)}
                            className="flex-1 py-2 px-3 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1"
                          >
                            <span>Chọn & Tính TCO</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: BẢNG TÍNH TOÁN TCO & CHI PHÍ NUÔI XE 5 NĂM (TCO WORKBENCH)
          ========================================================================= */}
      {canvasMode === 'tco' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Bar with Back Button navigating back to Recommendations (Giai đoạn 2) */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCanvasMode('recommendations');
                setJourneyStep(2);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-blue transition group"
            >
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 flex items-center justify-center shadow-2xs">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span>Quay lại Đề xuất xe</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">
                Dự toán chi phí 5 năm: <strong className="text-slate-900 font-bold">{car.display_name}</strong>
              </span>
              <button
                type="button"
                onClick={backToHall}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-[11px] font-semibold transition shadow-2xs"
              >
                Đổi mẫu xe khác
              </button>
            </div>
          </div>

          {/* TCO Body: Cleaned of redundant duplicate banners to prioritize metrics and calculators */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Urban Charging Simulator */}
            <UrbanChargingWidget />

            {/* TCO & Gasoline Comparison Calculator (with Submit Ticket Action returning cleanly to Hall) */}
            <TCOEstimateCard />
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: MA TRẬN TRỌNG TÀI ĐỐI ĐẦU 3 MẪU XE (AI ARBITER)
          ========================================================================= */}
      {canvasMode === 'arbiter' && (
        <div className="flex flex-col h-full overflow-hidden items-center justify-center p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center shadow-2xs border border-blue-100">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Bảng So sánh Đa mẫu xe VinFast</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Hệ thống hỗ trợ đối chiếu chi tiết 2 hoặc 3 mẫu xe (VF 5 Plus, VF 6, VF 7) trong bảng so sánh pop-up tương tác.
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => openComparisonModal(['VF5', 'VF6', 'VF7'])}
              className="px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-xs hover:bg-slate-900 transition flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>Mở bảng so sánh pop-up</span>
            </button>
            <button
              type="button"
              onClick={backToHall}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              Về Sảnh chính
            </button>
          </div>
        </div>
      )}

      {/* Universal Car Detail Pop-up Modal */}
      <CarDetailModal
        modelId={detailModalModelId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSelectAndProceed={(mId) => {
          setIsDetailModalOpen(false);
          proceedToTCO(mId);
        }}
      />
    </div>
  );
};
