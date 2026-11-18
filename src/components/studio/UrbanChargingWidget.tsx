'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getCarModelWithVariant, VINFAST_FACILITIES } from '@/lib/catalog';
import { Info } from 'lucide-react';

export const UrbanChargingWidget: React.FC = () => {
  const selectedModelId = useAppStore((state) => state.selectedModelId) || 'VF6';
  const selectedVariantIds = useAppStore((state) => state.selectedVariantIds);
  const selectedCity = useAppStore((state) => state.selectedCity) || 'national';
  const customerInputs = useAppStore((state) => state.customerInputs);
  const updateInputs = useAppStore((state) => state.updateInputs);

  const car = getCarModelWithVariant(selectedModelId, selectedVariantIds?.[selectedModelId]);
  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;
  const locationLabel = selectedCity === 'national' ? 'Đô thị Việt Nam' : `Đô thị ${currentFacility.cityName}`;

  // 85% DoD Safe usable range
  const safeRangeKm = Math.round(car.range_real * 0.85);
  const chargeFreqDays = Math.max(1, Math.floor(safeRangeKm / customerInputs.daily_km));

  return (
    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs space-y-3">
      {/* Widget Header with Sleek Info Popover */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900">
            Mô phỏng Hạ tầng Sạc {locationLabel} (Chu kỳ 85% DoD)
          </h4>
          <p className="text-[10px] text-slate-500">
            Độ sâu xả pin tối ưu bảo vệ tuổi thọ pack pin lithium trên {car.display_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-brand-blue border border-blue-200 shrink-0 tabular-nums">
            85% DoD
          </span>

          {/* Clean Info Icon Popover */}
          <div className="relative group inline-block">
            <button
              type="button"
              className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-brand-blue flex items-center justify-center transition shadow-2xs cursor-help"
              aria-label={`Thông tin trạm sạc ${currentFacility.cityName}`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {/* Popover on Hover */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-72 sm:w-80 p-3.5 bg-slate-900 text-white rounded-xl shadow-xl z-50 leading-relaxed pointer-events-none animate-in fade-in duration-200 border border-slate-800">
              <div className="font-bold text-blue-300 flex items-center gap-1.5 mb-1 text-xs">
                <Info className="w-3.5 h-3.5" />
                <span>Hạ tầng mạng lưới trạm sạc V-GREEN ({currentFacility.cityName})</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Hệ thống V-GREEN phủ rộng tại các trung tâm thương mại Vincom, khu đô thị Vinhomes, trạm dừng nghỉ cao tốc, cây xăng PVOIL và bãi đỗ xe công cộng ({currentFacility.address}). Chủ xe hoàn toàn chủ động sạc nhanh kể cả khi ở chung cư hoặc nhà phố.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Bento Metric Cards - Automotive Precision */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Tầm chạy an toàn:</span>
          <div className="text-sm font-black text-brand-blue tabular-nums">
            {safeRangeKm} km / sạc
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{locationLabel} (85% DoD)</p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Tần suất cắm sạc:</span>
          <div className="text-sm font-black text-slate-900 tabular-nums">
            ~{chargeFreqDays} ngày / lần
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Đi {customerInputs.daily_km} km/ngày</p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Sạc nhanh 10-70%:</span>
          <div className="text-sm font-black text-slate-900 tabular-nums">
            {car.charging_time.replace('trong ', '')}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Trụ siêu nhanh V-GREEN</p>
        </div>
      </div>

      {/* Facility Selection */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-600 self-start sm:self-auto">
          Điểm sạc chính:
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => updateInputs({ charging_facility: 'vgreen' })}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              customerInputs.charging_facility === 'vgreen'
                ? 'bg-brand-blue text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Trạm V-GREEN (3.858 đ/kWh)
          </button>

          <button
            type="button"
            onClick={() => updateInputs({ charging_facility: 'home' })}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              customerInputs.charging_facility === 'home'
                ? 'bg-brand-blue text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tại nhà (~3.200 đ/kWh)
          </button>
        </div>
      </div>
    </div>
  );
};
