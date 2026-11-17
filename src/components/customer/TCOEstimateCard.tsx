'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatVND } from '@/lib/engine';
import { CAR_CATALOG, getCarModelWithVariant } from '@/lib/catalog';
import {
  Wallet,
  Sliders,
  ChevronDown,
  Calendar,
  Send,
  Fuel,
  Zap,
  BatteryCharging,
  TrendingDown,
  Info,
} from 'lucide-react';

import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { VINFAST_FACILITIES } from '@/lib/catalog';

export const TCOEstimateCard: React.FC = () => {
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const selectedCity = useAppStore((state) => state.selectedCity) || 'national';
  const customerInputs = useAppStore((state) => state.customerInputs);
  const updateInputs = useAppStore((state) => state.updateInputs);
  const isAccordionOpen = useAppStore((state) => state.isSlidersAccordionOpen);
  const toggleAccordion = useAppStore((state) => state.toggleSlidersAccordion);
  const submitTicket = useAppStore((state) => state.submitTicketToAdvisor);
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);
  const getComputedEstimate = useAppStore((state) => state.getComputedEstimate);
  const selectedVariantIds = useAppStore((state) => state.selectedVariantIds);
  const selectVariant = useAppStore((state) => state.selectVariant);

  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;

  if (!selectedModelId) return null;

  const baseCar = CAR_CATALOG[selectedModelId];
  const activeVariantId = selectedVariantIds?.[selectedModelId] || baseCar?.variants?.[0]?.id;
  const car = getCarModelWithVariant(selectedModelId, activeVariantId);
  const estimate = getComputedEstimate();
  if (!estimate) return null;

  // Real-time comparison with equivalent ICE (Gasoline) car
  // ICE assumption: 8.0L/100km, RON 95 = 24,000 VND/L
  const iceFuelConsumptionLper100km = 8.0;
  const ron95PricePerL = 24000;
  const iceMonthlyFuel = (estimate.monthly_km / 100) * iceFuelConsumptionLper100km * ron95PricePerL;
  const ice5yFuel = iceMonthlyFuel * 60;
  const evMonthlyEnergy = estimate.monthly_energy;
  const ev5yEnergy = estimate.energy_5y;

  const monthlySavings = Math.max(0, Math.round(iceMonthlyFuel - evMonthlyEnergy));
  const savings5y = Math.max(0, Math.round(ice5yFuel - ev5yEnergy));

  // Percentage widths for dynamic comparison bar
  const maxMonthly = Math.max(iceMonthlyFuel, evMonthlyEnergy, 1);
  const evBarWidth = Math.max(12, Math.min(100, Math.round((evMonthlyEnergy / maxMonthly) * 100)));
  const iceBarWidth = Math.max(12, Math.min(100, Math.round((iceMonthlyFuel / maxMonthly) * 100)));

  // Safe range calculation (85% DoD)
  const safeRangeKm = Math.round(car.range_real * 0.85);
  const chargeFreqDays = Math.max(1, Math.floor(safeRangeKm / customerInputs.daily_km));

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs space-y-0">
      {/* Header Strip */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-brand-blue flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Tổng chi phí sở hữu 5 năm — ước tính (TCO)
            </h3>
            <span className="text-[10px] text-slate-500">Mô hình toán học tất định CALC01–CALC06</span>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
          Dự toán dự kiến · Đang chờ xác nhận từ Showroom
        </span>
      </div>

      {/* Model & Version Switcher Strip */}
      <div className="px-4 py-2.5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-slate-900">{car.display_name}</span>
          <span className="text-brand-blue font-black tabular-nums">
            {car.price.toLocaleString('vi-VN')}&nbsp;đ
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
            Tiết kiệm ~{Math.round(car.price * 0.1 / 1000000)}&nbsp;tr trước&nbsp;bạ
          </span>
        </div>

        {baseCar.variants && baseCar.variants.length > 1 && (
          <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
            {baseCar.variants.map((v) => {
              const isSelected = activeVariantId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVariant(selectedModelId, v.id)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={`${v.name} · ${v.price.toLocaleString('vi-VN')} đ`}
                >
                  {v.name.replace('Bản ', '')}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3 Key Financial Metrics Strip */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5 border-b border-slate-100">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">
            Tổng chi phí sở hữu 5 năm
          </span>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {formatVND(estimate.tco_5y)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
            Xe + lăn bánh + điện + bảo dưỡng - bán lại
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/70 hover:border-blue-300 transition-colors">
          <span className="text-[11px] font-medium text-brand-blue block mb-1">
            Dự tính trả góp tháng đầu
          </span>
          <div className="text-xl font-extrabold text-brand-blue tracking-tight tabular-nums">
            {estimate.loan_amount > 0 ? formatVND(estimate.first_month_payment) : '0 đ / tháng'}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-snug">
            {customerInputs.loan_ratio === 0
              ? 'Thanh toán 100% bằng vốn tự có'
              : customerInputs.loan_method === 'annuity'
              ? 'Niên kim cố định (Kỳ hạn 60 tháng)'
              : 'Gốc đều, lãi trên dư nợ giảm dần (60 tháng)'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 hover:border-emerald-300 transition-colors">
          <span className="text-[11px] font-medium text-emerald-800 block mb-1">
            Chi phí sạc điện ước tính
          </span>
          <div className="text-xl font-extrabold text-emerald-700 tracking-tight tabular-nums">
            ~{formatVND(estimate.monthly_energy)} / tháng
          </div>
          <p className="text-[10px] text-emerald-700 mt-1 font-medium flex items-center gap-1.5 tabular-nums">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Khoảng {chargeFreqDays} ngày mới cần sạc 1 lần</span>
          </p>
        </div>
      </div>

      {/* DYNAMIC COMPARISON: VINFAST EV VS GASOLINE CAR */}
      <div className="p-5 bg-gradient-to-r from-emerald-50/40 via-white to-blue-50/30 border-b border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800">
              So sánh chi phí nhiên liệu thực tế: VinFast {car.display_name.replace('VinFast ', '')} vs Xe Xăng
            </h4>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 tabular-nums">
            Tiết kiệm ~{formatVND(savings5y)} sau 5 năm
          </span>
        </div>

        {/* Dynamic Comparison Visual Bars */}
        <div className="space-y-2.5 text-xs">
          {/* VinFast EV Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-brand-blue">
                <Zap className="w-3.5 h-3.5 fill-blue-500" />
                <span>{car.display_name} (Điện {customerInputs.charging_facility === 'vgreen' ? 'V-GREEN' : 'Tại nhà'})</span>
              </span>
              <span className="font-extrabold text-brand-blue tabular-nums">~{formatVND(evMonthlyEnergy)} / tháng</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-brand-blue rounded-full transition-all duration-300"
                style={{ width: `${evBarWidth}%` }}
              ></div>
            </div>
          </div>

          {/* ICE Gasoline Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Fuel className="w-3.5 h-3.5 text-slate-500" />
                <span>Xe Xăng cùng hạng ({iceFuelConsumptionLper100km}L/100km · Xăng RON 95)</span>
              </span>
              <span className="font-extrabold text-slate-700 tabular-nums">~{formatVND(iceMonthlyFuel)} / tháng</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-slate-400 rounded-full transition-all duration-300"
                style={{ width: `${iceBarWidth}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Savings Micro Note */}
        <p className="text-[10px] text-slate-500 pt-1 flex items-center justify-between flex-wrap gap-1">
          <span>*Giả định: Xăng RON 95 giá 24.000 đ/lít, quãng đường {estimate.monthly_km.toLocaleString('vi-VN')} km/tháng.</span>
          <span className="font-bold text-emerald-700 tabular-nums">Mỗi tháng giữ lại ~{formatVND(monthlySavings)} trong ví</span>
        </p>
      </div>

      {/* Collapsible Accordion for Sliders */}
      <div className="border-b border-slate-200">
        <button
          type="button"
          onClick={toggleAccordion}
          className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-blue" />
            <span>Tùy chỉnh Thông số Vay & Nhu cầu Di chuyển thực tế</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-normal">
              {isAccordionOpen ? 'Thu gọn' : 'Nhấn để điều chỉnh'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isAccordionOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {isAccordionOpen && (
          <div className="px-5 pb-5 pt-2 space-y-4 bg-slate-50/70 fade-enter">
            {/* Slider 1: Daily Distance */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-700">
                  Quãng đường di chuyển hàng ngày:
                </label>
                <span className="font-extrabold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-md tabular-nums">
                  {customerInputs.daily_km} km/ngày (~{estimate.monthly_km.toLocaleString('vi-VN')} km/tháng)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={customerInputs.daily_km}
                onChange={(e) => updateInputs({ daily_km: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10 km (Nội thành gần)</span>
                <span>40 km (Nhu cầu đô thị tiêu chuẩn)</span>
                <span>120 km (Chạy dịch vụ / Ngoại thành)</span>
              </div>
            </div>

            {/* Slider 2: Loan Ratio */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-700">Tỷ lệ vay ngân hàng:</label>
                <span className="font-extrabold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-md tabular-nums">
                  {customerInputs.loan_ratio === 0
                    ? 'Mua thẳng 0% (Vốn tự có 100%)'
                    : `Vay ${Math.round(customerInputs.loan_ratio * 100)}% · Trả trước ${formatVND(
                        estimate.down_payment
                      )}`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.1"
                value={customerInputs.loan_ratio}
                onChange={(e) => updateInputs({ loan_ratio: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Mua thẳng 0%</span>
                <span>Vay 50%</span>
                <span>Tối đa 80% (60 tháng)</span>
              </div>
            </div>

            {/* Repayment method & Charging facility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Phương thức tính lãi & gốc ngân hàng:
                </span>
                <CustomSelect<'decreasing' | 'annuity'>
                  value={customerInputs.loan_method}
                  onChange={(val) => updateInputs({ loan_method: val })}
                  options={[
                    { value: 'decreasing', label: 'Gốc đều, lãi dư nợ giảm dần' },
                    { value: 'annuity', label: 'Niên kim cố định hàng tháng (PMT)' },
                  ]}
                  size="sm"
                  className="w-full"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Kỳ hạn vay chuẩn: 60 tháng (5 năm) · Lãi suất giả định 8%/năm
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Nguồn sạc điện chính hàng ngày:
                </span>
                <CustomSelect<'vgreen' | 'home'>
                  value={customerInputs.charging_facility}
                  onChange={(val) => updateInputs({ charging_facility: val })}
                  options={[
                    { value: 'vgreen', label: 'Trạm sạc V-GREEN (3.858 đ/kWh)' },
                    { value: 'home', label: 'Sạc tại nhà / Chung cư (~3.200 đ/kWh)' },
                  ]}
                  size="sm"
                  className="w-full"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Đã tính 10% tổn hao sạc điện AC/DC thực tế theo chuẩn WLTP
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Action Row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 bg-slate-50/80 border-t border-slate-200">
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={() => setTestDriveModalOpen(true)}
          icon={<Calendar className="w-4 h-4 text-brand-blue" />}
        >
          Đăng ký Lái thử Trải nghiệm
        </Button>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={submitTicket}
          icon={<Send className="w-4 h-4" />}
        >
          Gửi dự toán đến {selectedCity === 'national' ? 'Showroom VinFast' : currentFacility.showroomName.replace('Showroom VinFast ', '')}
        </Button>
      </div>
    </div>
  );
};
