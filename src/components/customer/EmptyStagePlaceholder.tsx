'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG } from '@/lib/catalog';
import { ModelId } from '@/types';
import { Sparkles, ArrowRight, Zap, BatteryCharging, ShieldCheck } from 'lucide-react';

export const EmptyStagePlaceholder: React.FC = () => {
  const selectModel = useAppStore((state) => state.selectModel);

  const models: ModelId[] = ['VF5', 'VF6', 'VF7'];

  return (
    <div className="space-y-4 fade-enter">
      {/* Intro Banner */}
      <div className="app-card p-6 bg-gradient-to-r from-blue-50/80 via-white to-slate-50 border-blue-100">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-brand-blue">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dự toán thông minh O2O · VinFast Hà Nội</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight pt-1">
              Khám phá các dòng ô tô điện VinFast thế hệ mới
            </h2>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Hãy chọn nhanh một mẫu xe bên dưới hoặc chia sẻ nhu cầu, ngân sách với Trợ lý AI ở cột bên trái để bắt đầu lập bảng dự toán chi phí lăn bánh & chi phí sở hữu 5 năm (TCO) chính xác theo thời gian thực.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Interactive Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((mId) => {
          const car = CAR_CATALOG[mId];
          return (
            <div
              key={mId}
              onClick={() => selectModel(mId)}
              className="app-card overflow-hidden hover:border-brand-accent/50 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative h-36 bg-slate-100/80 p-3 flex items-center justify-center overflow-hidden border-b border-slate-100">
                <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-brand-blue shadow-xs backdrop-blur-xs">
                  {car.badge}
                </span>
                <img
                  src={car.image}
                  alt={car.display_name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-accent transition-colors">
                    {car.display_name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-brand-blue">
                      {car.price.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[10px] text-slate-400">(kèm pin)</span>
                  </div>
                </div>

                {/* Micro specs */}
                <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tầm chạy: <strong>{car.range_nedc} km</strong> / sạc</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Bảo hành: <strong>{car.warranty_years}</strong></span>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-lg bg-slate-100 group-hover:bg-brand-blue group-hover:text-white text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Xem dự toán TCO</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Pill */}
      <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-blue shrink-0" />
          <span>Biểu giá niêm yết chính hãng VinFast Việt Nam · Độc quyền tính toán khấu hao & chi phí trạm sạc V-GREEN Hà Nội.</span>
        </span>
      </div>
    </div>
  );
};
