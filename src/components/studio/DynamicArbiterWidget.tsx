'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG } from '@/lib/catalog';
import { calculateDeterministicTCO, formatVND } from '@/lib/engine';
import { ModelId } from '@/types';
import { Check, ArrowRight, BatteryCharging, Shield, Zap, Scale } from 'lucide-react';

export const DynamicArbiterWidget: React.FC = () => {
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const selectModel = useAppStore((state) => state.selectModel);
  const customerInputs = useAppStore((state) => state.customerInputs);
  const setCanvasMode = useAppStore((state) => state.setCanvasMode);

  const models: ModelId[] = ['VF5', 'VF6', 'VF7'];

  const tcoResults = models.reduce((acc, mId) => {
    const car = CAR_CATALOG[mId];
    acc[mId] = calculateDeterministicTCO({ car, ...customerInputs });
    return acc;
  }, {} as Record<ModelId, ReturnType<typeof calculateDeterministicTCO>>);

  return (
    <div className="space-y-4 fade-enter">
      {/* Arbiter Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xs flex items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-200 border border-blue-800/60 mb-1.5">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Arbiter · Trọng tài Đối đầu Trực quan</span>
          </div>
          <h3 className="text-sm font-extrabold text-white">
            So sánh Trực diện 3 Phân khúc Xe Điện VinFast
          </h3>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Đối chiếu 3 tiêu chuẩn cốt lõi: Chi phí nhận xe, Không gian khoang lái và Chu kỳ sạc tại Hà Nội
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCanvasMode('hall')}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition shrink-0"
        >
          <span>Quay lại Sảnh chính</span>
        </button>
      </div>

      {/* 3-Column Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((mId) => {
          const car = CAR_CATALOG[mId];
          const tco = tcoResults[mId];
          const isSelected = mId === selectedModelId;
          const safeRange = Math.round(car.range_real * 0.85);
          const chargeFreq = Math.max(1, Math.floor(safeRange / customerInputs.daily_km));

          return (
            <div
              key={mId}
              className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-50/70 border-2 border-brand-accent shadow-sm'
                  : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Header with car photo */}
              <div className="space-y-3">
                <div className="relative h-32 bg-slate-100/90 rounded-xl p-2 flex items-center justify-center overflow-hidden border border-slate-200/60">
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-brand-blue shadow-2xs">
                    {car.badge}
                  </span>
                  {isSelected && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-blue text-white shadow-2xs flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Đang chọn</span>
                    </span>
                  )}
                  <img
                    src={car.image}
                    alt={car.display_name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {car.display_name}
                  </h4>
                  <div className="text-base font-black text-brand-blue mt-0.5 tabular-nums">
                    {car.price.toLocaleString('vi-VN')} đ
                  </div>
                </div>

                {/* 3 Focused Decision Criteria */}
                <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
                  {/* Axis 1: Budget & Loan */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block mb-0.5">1. Chi phí nhận xe (Trả trước 30%):</span>
                    <strong className="text-slate-900 text-xs tabular-nums">{formatVND(tco.down_payment)}</strong>
                    <span className="text-[10px] text-slate-500 block tabular-nums mt-0.5">
                      Góp tháng đầu: {formatVND(tco.first_month_payment)}
                    </span>
                  </div>

                  {/* Axis 2: Space & Utility */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block mb-0.5">2. Kích thước & Khoang lái:</span>
                    <strong className="text-slate-900 text-xs">{car.dimensions}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Chiều dài cơ sở: {car.wheelbase} ({car.seats})
                    </span>
                  </div>

                  {/* Axis 3: Battery & Charging */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block mb-0.5">3. Tần suất sạc ({customerInputs.daily_km} km/ngày):</span>
                    <strong className="text-emerald-700 text-xs tabular-nums">~{chargeFreq} ngày mới cần sạc 1 lần</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5 tabular-nums">
                      Pin {car.battery_kwh} kWh · Tầm chạy NEDC {car.range_nedc} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    selectModel(mId, true);
                    setCanvasMode('detail');
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-700'
                  }`}
                >
                  <span>{isSelected ? 'Đang chọn làm Hồ sơ chính' : 'Chốt chọn mẫu xe này'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
