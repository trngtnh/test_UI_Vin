'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG } from '@/lib/catalog';
import { ModelId } from '@/types';
import {
  Sparkles,
  ArrowRight,
  BatteryCharging,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  Gauge,
} from 'lucide-react';

export const CarCatalogGrid: React.FC = () => {
  const selectModel = useAppStore((state) => state.selectModel);
  const setCustomerTab = useAppStore((state) => state.setCustomerTab);

  const models: ModelId[] = ['VF5', 'VF6', 'VF7'];

  return (
    <div className="space-y-6 fade-enter">
      {/* Hero Banner Showcase */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-brand-blue to-slate-900 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-blue-200 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hệ thống Tư vấn Chọn xe & Dự toán Trực tuyến VinFast O2O</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Khám phá Dải Ô tô Điện Thế hệ Mới VinFast
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hưởng <strong>100% ưu đãi lệ phí trước bạ</strong> tại Hà Nội. Khám phá chi tiết thông số kỹ thuật, so sánh trực quan và tính toán chính xác tổng chi phí sở hữu 5 năm (TCO) so với xe xăng.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setCustomerTab('compare')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Mở bảng So sánh 3 mẫu xe</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Full-featured Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((mId) => {
          const car = CAR_CATALOG[mId];
          return (
            <div
              key={mId}
              className="app-card overflow-hidden hover:border-brand-accent hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image & Badge Area */}
              <div className="relative h-48 bg-gradient-to-b from-slate-50 to-slate-100/80 p-4 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 text-brand-blue shadow-xs backdrop-blur-xs">
                  {car.badge}
                </span>
                <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                  {car.seats}
                </span>
                <img
                  src={car.image}
                  alt={car.display_name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Information Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-brand-accent transition-colors">
                    {car.display_name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-black text-brand-blue tabular-nums whitespace-nowrap">
                      {car.price.toLocaleString('vi-VN')}&nbsp;đ
                    </span>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">(kèm pin & sạc)</span>
                  </div>
                </div>

                {/* Key Specs Matrix */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50">
                    <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tầm chạy: <strong>{car.range_nedc} km</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50">
                    <Gauge className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Dung lượng: <strong>{car.battery_kwh} kWh</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Sạc nhanh: <strong>~25 phút</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Bảo hành: <strong>{car.warranty_years}</strong></span>
                  </div>
                </div>

                {/* Reasons Preview */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60">
                  {car.reason_budget}
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => selectModel(mId, true)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Xem chi tiết & Dự toán</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      selectModel(mId, false);
                      setCustomerTab('compare');
                    }}
                    title="So sánh với mẫu xe khác"
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
