'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG } from '@/lib/catalog';
import { BatteryCharging, Zap, MapPin, ShieldCheck, Clock, Info } from 'lucide-react';

export const UrbanChargingWidget: React.FC = () => {
  const selectedModelId = useAppStore((state) => state.selectedModelId) || 'VF6';
  const customerInputs = useAppStore((state) => state.customerInputs);
  const updateInputs = useAppStore((state) => state.updateInputs);

  const car = CAR_CATALOG[selectedModelId];

  // 85% DoD Safe usable range
  const safeRangeKm = Math.round(car.range_real * 0.85);
  const chargeFreqDays = Math.max(1, Math.floor(safeRangeKm / customerInputs.daily_km));

  return (
    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs space-y-3">
      {/* Widget Header with Sleek Lucide Info Icon Popover */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Mô phỏng Hạ tầng Sạc Đô thị Hà Nội (Chu kỳ 85% DoD)
            </h4>
            <p className="text-[10px] text-slate-500">
              Độ sâu xả pin tối ưu bảo vệ tuổi thọ pack pin lithium
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 tabular-nums">
            85% DoD
          </span>

          {/* Clean Info Icon Popover */}
          <div className="relative group inline-block">
            <button
              type="button"
              className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-brand-blue flex items-center justify-center transition shadow-2xs cursor-help"
              aria-label="Thông tin trạm sạc Hà Nội"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {/* Popover on Hover */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-72 sm:w-80 p-3.5 bg-slate-900 text-white rounded-xl shadow-xl z-50 leading-relaxed pointer-events-none animate-in fade-in duration-200 border border-slate-800">
              <div className="font-bold text-blue-300 flex items-center gap-1.5 mb-1 text-xs">
                <Info className="w-3.5 h-3.5" />
                <span>Hạ tầng mạng lưới trạm sạc tại Hà Nội</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Tại Hà Nội, VinFast đã triển khai hơn 150+ trạm sạc công cộng tại các trung tâm thương mại Vincom, chung cư Vinhomes, cây xăng PVOIL và bãi đỗ xe công cộng (Cầu Giấy, Nam Từ Liêm, Ba Đình, Đống Đa...). Bạn hoàn toàn yên tâm sử dụng xe điện kể cả khi ở nhà phố hay chung cư không có trụ sạc riêng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Pills - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-medium text-slate-400 block mb-0.5">Tầm chạy an toàn:</span>
          <div className="text-sm font-extrabold text-brand-blue tabular-nums">
            {safeRangeKm} km / sạc
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Đô thị Hà Nội</p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-medium text-slate-400 block mb-0.5">Tần suất cắm sạc:</span>
          <div className="text-sm font-extrabold text-emerald-700 tabular-nums">
            ~{chargeFreqDays} ngày / lần
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Đi {customerInputs.daily_km} km/ngày</p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-medium text-slate-400 block mb-0.5">Sạc nhanh 10-70%:</span>
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{car.charging_time}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Trạm V-GREEN</p>
        </div>
      </div>

      {/* Facility Selection */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 self-start sm:self-auto">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>Điểm sạc chính:</span>
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => updateInputs({ charging_facility: 'vgreen' })}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
              customerInputs.charging_facility === 'vgreen'
                ? 'bg-brand-blue text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Trạm V-GREEN (3.858 đ/kWh)</span>
          </button>

          <button
            type="button"
            onClick={() => updateInputs({ charging_facility: 'home' })}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
              customerInputs.charging_facility === 'home'
                ? 'bg-brand-blue text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Tại nhà (~3.200 đ/kWh)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
