'use client';

import React, { useState } from 'react';
import { CAR_CATALOG, CATALOG_EFFECTIVE_DATE } from '@/lib/catalog';
import { ModelId } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import {
  X,
  BatteryCharging,
  Zap,
  ShieldCheck,
  Clock,
  Gauge,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Scale,
} from 'lucide-react';

interface CarDetailModalProps {
  modelId: ModelId | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAndProceed?: (modelId: ModelId) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  modelId,
  isOpen,
  onClose,
  onSelectAndProceed,
}) => {
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);
  const openComparisonModal = useAppStore((state) => state.openComparisonModal);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  if (!isOpen || !modelId) return null;

  const car = CAR_CATALOG[modelId];
  const currentColor = car.colors[selectedColorIndex] || car.colors[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-brand-blue text-white shadow-2xs">
              {car.badge}
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">
              Chi tiết Thông số Kỹ thuật · {car.display_name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                openComparisonModal([modelId]);
              }}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition shadow-2xs"
            >
              <Scale className="w-3.5 h-3.5 text-brand-blue" />
              <span>So sánh 2-3 xe</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Section: Visual & Color Customizer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Visual Canvas */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative h-44 bg-gradient-to-b from-slate-100 to-slate-200/60 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-200/80">
                <svg
                  viewBox="0 0 420 180"
                  className="w-full max-h-32 drop-shadow-md"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id={`modalCarGrad-${modelId}`} x1="0%" y1="0%" x2="100%" y2="80%">
                      <stop offset="0%" stopColor={currentColor.hex} stopOpacity="0.95" />
                      <stop offset="60%" stopColor={currentColor.hex} stopOpacity="1" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="210" cy="162" rx="160" ry="8" fill="#0f172a" fillOpacity="0.25" />
                  <path
                    d="M 45 130 C 50 100, 75 90, 110 82 C 145 74, 180 50, 240 50 C 295 50, 325 72, 355 92 C 380 98, 395 110, 395 130 C 395 142, 385 146, 360 146 C 350 126, 320 126, 310 146 L 140 146 C 130 126, 100 126, 90 146 Z"
                    fill={`url(#modalCarGrad-${modelId})`}
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

              {/* Color Swatches */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[11px] font-medium text-slate-600">
                  Màu: <strong>{currentColor.name}</strong>
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

            {/* Pricing & Value Summary */}
            <div className="md:col-span-6 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  Biểu giá Niêm yết Chính hãng · {CATALOG_EFFECTIVE_DATE}
                </span>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {car.display_name}
                </h4>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-brand-blue tabular-nums">
                    {car.price.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[11px] text-slate-500">(kèm Pin & Sạc)</span>
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Tài chính:</strong> {car.reason_budget}
                  </p>
                </div>
                <div className="flex items-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-brand-blue mt-0.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Vận hành:</strong> {car.reason_charging}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Technical Specifications Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-900">Bảng thông số kỹ thuật tiêu chuẩn</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Kích thước (DxRxC)</span>
                <strong className="text-slate-900 text-xs">{car.dimensions}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Chiều dài cơ sở</span>
                <strong className="text-slate-900 text-xs">{car.wheelbase}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Số chỗ ngồi</span>
                <strong className="text-slate-900 text-xs">{car.seats}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Động cơ & Công suất</span>
                <strong className="text-slate-900 text-xs">{car.motor_power}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Tầm chạy NEDC</span>
                <strong className="text-emerald-700 text-xs">{car.range_nedc} km / lần sạc</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Sạc nhanh 10-70%</span>
                <strong className="text-amber-700 text-xs">{car.charging_time}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Dung lượng Pin</span>
                <strong className="text-slate-900 text-xs">{car.battery_kwh} kWh</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Bảo hành chính hãng</span>
                <strong className="text-indigo-700 text-xs">{car.warranty_years}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Khoảng sáng gầm</span>
                <strong className="text-slate-900 text-xs">{car.ground_clearance}</strong>
              </div>
            </div>

            {/* ADAS Safety Features */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Hệ thống An toàn & Hỗ trợ Lái ADAS
              </span>
              <p className="text-[11px] leading-relaxed text-slate-800">{car.adas}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                setTestDriveModalOpen(true);
              }}
              className="py-2.5 px-3.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-brand-blue" />
              <span>Đăng ký Lái thử</span>
            </button>

            {/* Comparison button: user can select 2 or up to 3 cars to compare */}
            <button
              type="button"
              onClick={() => {
                openComparisonModal([modelId]);
              }}
              className="py-2.5 px-3.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-brand-blue text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Scale className="w-3.5 h-3.5 text-brand-blue" />
              <span>So sánh 2-3 xe</span>
            </button>
          </div>

          {onSelectAndProceed && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectAndProceed(modelId);
              }}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 group"
            >
              <span>Chốt chọn mẫu xe này & Tính TCO</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
