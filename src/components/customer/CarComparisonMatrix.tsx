'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG } from '@/lib/catalog';
import { calculateDeterministicTCO, formatVND } from '@/lib/engine';
import { ArrowLeft, CheckCircle, Zap, Shield, ArrowRight, Layers } from 'lucide-react';
import { ModelId } from '@/types';

export const CarComparisonMatrix: React.FC = () => {
  const selectModel = useAppStore((state) => state.selectModel);
  const setCustomerTab = useAppStore((state) => state.setCustomerTab);
  const customerInputs = useAppStore((state) => state.customerInputs);
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);

  const models: ModelId[] = ['VF5', 'VF6', 'VF7'];

  // Calculate quick TCO for each car
  const tcoMap = models.reduce((acc, mId) => {
    const car = CAR_CATALOG[mId];
    acc[mId] = calculateDeterministicTCO({ car, ...customerInputs });
    return acc;
  }, {} as Record<ModelId, ReturnType<typeof calculateDeterministicTCO>>);

  return (
    <div className="space-y-6 fade-enter">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
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

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <Layers className="w-4 h-4 text-brand-blue" />
          <span>Bảng so sánh thông số kỹ thuật chính thức</span>
        </div>
      </div>

      {/* Comparison Table Card */}
      <div className="app-card overflow-hidden shadow-sm border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 w-1/4 font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                  Tiêu chí đối chiếu
                </th>
                {models.map((mId) => {
                  const car = CAR_CATALOG[mId];
                  return (
                    <th key={mId} className="p-4 w-1/4 text-center border-l border-slate-200 bg-white">
                      <div className="h-28 flex items-center justify-center p-2 mb-2 bg-slate-50 rounded-xl border border-slate-100">
                        <img
                          src={car.image}
                          alt={car.display_name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-brand-blue mb-1">
                        {car.badge}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {car.display_name}
                      </h4>
                      <div className="text-sm font-black text-brand-blue mt-1 tabular-nums whitespace-nowrap">
                        {car.price.toLocaleString('vi-VN')}&nbsp;đ
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Category 1: Kích thước & Ngoại thất */}
              <tr className="bg-slate-50/50">
                <td colSpan={4} className="p-2.5 px-4 font-bold text-slate-700 text-[11px] uppercase tracking-wider bg-slate-100/60">
                  1. Kích thước & Khung gầm
                </td>
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Kích thước (D x R x C)</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-bold text-slate-800">
                    {CAR_CATALOG[mId].dimensions}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Chiều dài cơ sở</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-bold text-slate-800">
                    {CAR_CATALOG[mId].wheelbase}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Khoảng sáng gầm xe</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-bold text-slate-800">
                    {CAR_CATALOG[mId].ground_clearance}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Số chỗ ngồi</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-bold text-slate-800">
                    {CAR_CATALOG[mId].seats}
                  </td>
                ))}
              </tr>

              {/* Category 2: Động cơ, Pin & Sạc */}
              <tr className="bg-slate-50/50">
                <td colSpan={4} className="p-2.5 px-4 font-bold text-slate-700 text-[11px] uppercase tracking-wider bg-slate-100/60">
                  2. Động cơ, Pin & Khả năng vận hành
                </td>
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Động cơ & Công suất</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-bold text-slate-800">
                    {CAR_CATALOG[mId].motor_power}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Dung lượng pin khả dụng</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-bold text-emerald-700">
                    {CAR_CATALOG[mId].battery_kwh} kWh
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Tầm hoạt động (chuẩn NEDC)</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-extrabold text-brand-blue">
                    {CAR_CATALOG[mId].range_nedc} km / lần sạc
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Thời gian sạc nhanh (10-70%)</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-bold text-slate-800">
                    {CAR_CATALOG[mId].charging_time}
                  </td>
                ))}
              </tr>

              {/* Category 3: Công nghệ ADAS & Bảo hành */}
              <tr className="bg-slate-50/50">
                <td colSpan={4} className="p-2.5 px-4 font-bold text-slate-700 text-[11px] uppercase tracking-wider bg-slate-100/60">
                  3. An toàn, Trợ lái ADAS & Bảo hành
                </td>
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Hệ thống trợ lái ADAS</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 text-slate-700 font-medium text-[11px]">
                    {CAR_CATALOG[mId].adas}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Chính sách bảo hành xe</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-bold text-indigo-700">
                    {CAR_CATALOG[mId].warranty_years}
                  </td>
                ))}
              </tr>

              {/* Category 4: Dự toán Tài chính & TCO */}
              <tr className="bg-slate-50/50">
                <td colSpan={4} className="p-2.5 px-4 font-bold text-slate-700 text-[11px] uppercase tracking-wider bg-slate-100/60">
                  4. Dự toán Chi phí & TCO 5 năm ({customerInputs.daily_km} km/ngày)
                </td>
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Chi phí lăn bánh Hà Nội</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-extrabold text-slate-900">
                    {formatVND(tcoMap[mId].on_the_road)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Tiền sạc điện ước tính</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-bold text-emerald-700">
                    ~{formatVND(tcoMap[mId].monthly_energy)} / tháng
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 px-4 text-slate-500 font-medium">Tổng chi phí sở hữu 5 năm (TCO)</td>
                {models.map((mId) => (
                  <td key={mId} className="p-3.5 text-center border-l border-slate-100 font-black text-brand-blue text-sm">
                    {formatVND(tcoMap[mId].tco_5y)}
                  </td>
                ))}
              </tr>

              {/* Action Buttons Row */}
              <tr className="bg-slate-50/70">
                <td className="p-4 px-4 font-bold text-slate-800">Chọn xe phù hợp</td>
                {models.map((mId) => (
                  <td key={mId} className="p-4 text-center border-l border-slate-200">
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => selectModel(mId, true)}
                        className="w-full py-2 px-3 rounded-xl bg-brand-blue hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <span>Chọn & Lập dự toán</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          selectModel(mId, false);
                          setTestDriveModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
                      >
                        Đăng ký Lái thử
                      </button>
                    </div>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
