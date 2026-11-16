'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG, CATALOG_EFFECTIVE_DATE } from '@/lib/catalog';
import { ModelId } from '@/types';
import { calculateDeterministicTCO, formatVND } from '@/lib/engine';
import {
  X,
  Scale,
  Check,
  CheckCircle2,
  BatteryCharging,
  Gauge,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Plus,
  Info,
} from 'lucide-react';

export const CarComparisonModal: React.FC = () => {
  const isComparisonModalOpen = useAppStore((state) => state.isComparisonModalOpen);
  const closeComparisonModal = useAppStore((state) => state.closeComparisonModal);
  const comparisonModelIds = useAppStore((state) => state.comparisonModelIds);
  const toggleComparisonModel = useAppStore((state) => state.toggleComparisonModel);
  const proceedToTCO = useAppStore((state) => state.proceedToTCO);
  const selectModel = useAppStore((state) => state.selectModel);
  const customerInputs = useAppStore((state) => state.customerInputs);

  // View state: 'picker' (danh sách chọn xe trực quan) hoặc 'table' (bảng ma trận so sánh chi tiết)
  const [viewMode, setViewMode] = useState<'picker' | 'table'>('picker');

  // Full VinFast EV Lineup
  const allAvailableModels: ModelId[] = ['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9'];

  // Đồng bộ viewMode khi modal mở ra hoặc khi số lượng xe thay đổi
  useEffect(() => {
    if (isComparisonModalOpen) {
      if (comparisonModelIds.length >= 2) {
        setViewMode('table');
      } else {
        setViewMode('picker');
      }
    }
  }, [isComparisonModalOpen]);

  // Nếu đang ở màn hình table mà bỏ chọn xe xuống dưới 2 xe, tự động quay lại picker
  useEffect(() => {
    if (isComparisonModalOpen && comparisonModelIds.length < 2 && viewMode === 'table') {
      setViewMode('picker');
    }
  }, [comparisonModelIds.length, isComparisonModalOpen, viewMode]);

  if (!isComparisonModalOpen) return null;

  // Tính toán chỉ số tài chính TCO cho các xe đã chọn
  const estimates = comparisonModelIds.reduce((acc, mId) => {
    const car = CAR_CATALOG[mId];
    if (car) {
      acc[mId] = calculateDeterministicTCO({ car, ...customerInputs });
    }
    return acc;
  }, {} as Record<ModelId, ReturnType<typeof calculateDeterministicTCO>>);

  const handleSelectCarAndProceed = (mId: ModelId) => {
    closeComparisonModal();
    selectModel(mId, false);
    proceedToTCO(mId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Bảng So sánh Đa mẫu xe VinFast
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  comparisonModelIds.length >= 2
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-100 text-brand-blue border-blue-200'
                }`}>
                  {comparisonModelIds.length} / 3 xe được chọn
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {viewMode === 'picker'
                  ? 'Chọn từ 2 đến 3 mẫu xe trong danh sách bên dưới để bắt đầu đối chiếu thông số & chi phí'
                  : 'Đối chiếu trực tiếp thông số kích thước, động cơ, pin và chi phí sử dụng 5 năm'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'table' && (
              <button
                type="button"
                onClick={() => setViewMode('picker')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-brand-blue bg-white text-slate-700 hover:text-brand-blue text-xs font-bold transition shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Đổi / Thêm xe</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeComparisonModal}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
              aria-label="Đóng bảng so sánh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            STAGE 1: CAR PICKER (LIST XE ĐỂ CHỌN 1 XE -> CHỌN THÊM XE THỨ 2 -> SO SÁNH)
            ========================================================================= */}
        {viewMode === 'picker' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Guide Step Banner */}
            <div className="px-5 py-3 bg-blue-50/70 border-b border-blue-100/80 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {comparisonModelIds.length === 0 ? '1' : comparisonModelIds.length === 1 ? '2' : '✓'}
                </span>
                <span className="font-semibold text-slate-800">
                  {comparisonModelIds.length === 0
                    ? 'Bước 1: Nhấp chọn mẫu xe đầu tiên bạn quan tâm'
                    : comparisonModelIds.length === 1
                    ? 'Bước 2: Nhấp chọn thêm 1 mẫu xe đối chiếu (hoặc chọn tối đa 3 xe)'
                    : 'Đã chọn đủ xe: Bạn có thể nhấn [So sánh ngay] hoặc chọn thêm mẫu xe thứ 3'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                Tích trực tiếp vào thẻ xe bên dưới
              </span>
            </div>

            {/* Visual 6-Car Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {allAvailableModels.map((mId) => {
                  const car = CAR_CATALOG[mId];
                  const isSelected = comparisonModelIds.includes(mId);
                  const isMaxReached = comparisonModelIds.length >= 3 && !isSelected;

                  return (
                    <div
                      key={mId}
                      onClick={() => {
                        if (!isMaxReached) {
                          toggleComparisonModel(mId);
                        }
                      }}
                      className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'border-brand-blue bg-blue-50/50 shadow-sm ring-2 ring-blue-100 cursor-pointer'
                          : isMaxReached
                          ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-brand-blue hover:shadow-md cursor-pointer'
                      }`}
                    >
                      {/* Top Row: Segment Badge & Selection Status */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {car.badge}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-blue text-white text-[10px] font-bold shadow-2xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Đã chọn</span>
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              isMaxReached
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-white text-slate-600 border-slate-300 group-hover:border-brand-blue group-hover:text-brand-blue'
                            }`}>
                              <Plus className="w-3 h-3" />
                              <span>{isMaxReached ? 'Đã đủ 3 xe' : 'Chọn xe này'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Vector Silhouette Visual Preview */}
                      <div className="h-28 flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform duration-200">
                        <svg
                          viewBox="0 0 420 180"
                          className="w-full max-h-24 drop-shadow-xs"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <linearGradient id={`picker-grad-${mId}`} x1="0%" y1="0%" x2="100%" y2="80%">
                              <stop offset="0%" stopColor={car.colors[0]?.hex || '#2563EB'} stopOpacity="0.95" />
                              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <ellipse cx="210" cy="162" rx="160" ry="8" fill="#0f172a" fillOpacity="0.2" />
                          <path
                            d="M 45 130 C 50 100, 75 90, 110 82 C 145 74, 180 50, 240 50 C 295 50, 325 72, 355 92 C 380 98, 395 110, 395 130 C 395 142, 385 146, 360 146 C 350 126, 320 126, 310 146 L 140 146 C 130 126, 100 126, 90 146 Z"
                            fill={`url(#picker-grad-${mId})`}
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

                      {/* Name & Pricing */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-blue transition-colors">
                          {car.display_name}
                        </h4>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-brand-blue tabular-nums">
                            {car.price.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">(kèm Pin & Sạc)</span>
                        </div>
                      </div>

                      {/* 3 Key Spec Badges */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10px] text-slate-600 text-center">
                        <div className="p-1 rounded bg-slate-50">
                          <span className="text-slate-400 block text-[9px]">Tầm chạy</span>
                          <strong>{car.range_nedc} km</strong>
                        </div>
                        <div className="p-1 rounded bg-slate-50">
                          <span className="text-slate-400 block text-[9px]">Chỗ ngồi</span>
                          <strong>{car.seats.replace(' chỗ ngồi', ' chỗ')}</strong>
                        </div>
                        <div className="p-1 rounded bg-slate-50">
                          <span className="text-slate-400 block text-[9px]">Pin</span>
                          <strong>{car.battery_kwh} kWh</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status & Action Bar (Dòng thông báo & Nút so sánh) */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              {/* Dynamic Notification Message */}
              <div className="flex items-center gap-2.5 text-xs text-slate-700 w-full sm:w-auto">
                {comparisonModelIds.length === 0 && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Chưa có dòng xe nào được chọn. Hãy nhấp chọn mẫu xe đầu tiên trong danh sách trên.</span>
                  </div>
                )}

                {comparisonModelIds.length === 1 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span>
                      Đang chọn: <strong className="text-brand-blue font-extrabold">{CAR_CATALOG[comparisonModelIds[0]]?.display_name}</strong> (1/3 xe). Vui lòng chọn thêm ít nhất 1 xe nữa để so sánh.
                    </span>
                  </div>
                )}

                {comparisonModelIds.length === 2 && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Đang chọn: <strong className="text-slate-900 font-bold">{CAR_CATALOG[comparisonModelIds[0]]?.display_name}</strong> và <strong className="text-slate-900 font-bold">{CAR_CATALOG[comparisonModelIds[1]]?.display_name}</strong> (2/3 xe).
                    </span>
                  </div>
                )}

                {comparisonModelIds.length === 3 && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Đã chọn tối đa 3 xe: <strong className="text-slate-900 font-bold">{CAR_CATALOG[comparisonModelIds[0]]?.display_name}</strong>, <strong className="text-slate-900 font-bold">{CAR_CATALOG[comparisonModelIds[1]]?.display_name}</strong>, <strong className="text-slate-900 font-bold">{CAR_CATALOG[comparisonModelIds[2]]?.display_name}</strong>.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={closeComparisonModal}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                >
                  Đóng
                </button>

                {comparisonModelIds.length === 0 && (
                  <button
                    type="button"
                    disabled
                    className="py-2.5 px-5 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed"
                  >
                    Vui lòng chọn từ 2 xe
                  </button>
                )}

                {comparisonModelIds.length === 1 && (
                  <button
                    type="button"
                    disabled
                    className="py-2.5 px-5 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed"
                  >
                    Chọn thêm 1 xe nữa
                  </button>
                )}

                {comparisonModelIds.length === 2 && (
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className="py-2.5 px-5 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 animate-in zoom-in-95 group"
                  >
                    <span>So sánh 2 xe này ngay</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {comparisonModelIds.length === 3 && (
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className="py-2.5 px-5 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 animate-in zoom-in-95 group"
                  >
                    <span>Xem bảng so sánh 3 xe</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 2: COMPARISON MATRIX TABLE VIEW (HIỂN THỊ KHI ĐÃ CHỌN TỪ 2 XE TRỞ LÊN)
            ========================================================================= */}
        {viewMode === 'table' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Switch Bar at top of table */}
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('picker')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-300 hover:border-brand-blue bg-white text-slate-700 hover:text-brand-blue text-xs font-bold transition shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Đổi / Thêm mẫu xe khác</span>
                </button>
                <span className="text-[11px] text-slate-400">|</span>
                <span className="text-xs text-slate-600 font-medium">
                  Đang đối chiếu song song {comparisonModelIds.length} dòng xe:
                </span>
              </div>

              {/* Quick toggle chips */}
              <div className="flex items-center gap-1 flex-wrap">
                {allAvailableModels.map((mId) => {
                  const car = CAR_CATALOG[mId];
                  const isSelected = comparisonModelIds.includes(mId);
                  return (
                    <button
                      key={mId}
                      type="button"
                      onClick={() => toggleComparisonModel(mId)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border ${
                        isSelected
                          ? 'bg-brand-blue text-white border-blue-700 shadow-2xs'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-xs flex items-center justify-center text-[7px] ${
                        isSelected ? 'bg-white text-brand-blue' : 'border border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                      </div>
                      <span>{car.display_name.replace('VinFast ', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="p-3.5 w-1/4 font-extrabold text-slate-800 text-xs uppercase tracking-wider min-w-[160px]">
                          Tiêu chí đối chiếu
                        </th>
                        {comparisonModelIds.map((mId) => {
                          const car = CAR_CATALOG[mId];
                          return (
                            <th
                              key={mId}
                              className="p-3.5 text-center border-l border-slate-200 bg-white min-w-[220px]"
                            >
                              <div className="h-24 flex items-center justify-center p-1 mb-1">
                                <svg
                                  viewBox="0 0 420 180"
                                  className="w-full max-h-20 drop-shadow-xs"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <defs>
                                    <linearGradient id={`cmp-table-grad-${mId}`} x1="0%" y1="0%" x2="100%" y2="80%">
                                      <stop offset="0%" stopColor={car.colors[0]?.hex || '#2563EB'} stopOpacity="0.95" />
                                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                                    </linearGradient>
                                  </defs>
                                  <ellipse cx="210" cy="162" rx="160" ry="8" fill="#0f172a" fillOpacity="0.2" />
                                  <path
                                    d="M 45 130 C 50 100, 75 90, 110 82 C 145 74, 180 50, 240 50 C 295 50, 325 72, 355 92 C 380 98, 395 110, 395 130 C 395 142, 385 146, 360 146 C 350 126, 320 126, 310 146 L 140 146 C 130 126, 100 126, 90 146 Z"
                                    fill={`url(#cmp-table-grad-${mId})`}
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

                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-brand-blue mb-1">
                                {car.badge}
                              </span>
                              <h4 className="font-extrabold text-slate-900 text-sm">
                                {car.display_name}
                              </h4>
                              <div className="text-base font-black text-brand-blue mt-0.5 tabular-nums">
                                {car.price.toLocaleString('vi-VN')} đ
                              </div>
                              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                                Miễn 100% lệ phí trước bạ
                              </span>

                              <button
                                type="button"
                                onClick={() => handleSelectCarAndProceed(mId)}
                                className="mt-2.5 w-full py-2 px-3 rounded-xl bg-brand-blue hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                              >
                                <span>Chọn xe & Tính TCO</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </th>
                          );
                        })}

                        {/* If 2 cars selected, show a column to add 3rd car */}
                        {comparisonModelIds.length === 2 && (
                          <th className="p-3.5 text-center border-l border-slate-200 border-dashed bg-slate-50/50 min-w-[200px]">
                            <button
                              type="button"
                              onClick={() => setViewMode('picker')}
                              className="h-full w-full flex flex-col items-center justify-center p-4 space-y-2 hover:bg-slate-100/80 rounded-xl transition cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-700">
                                Thêm xe thứ 3
                              </span>
                              <p className="text-[10px] text-slate-400">
                                Nhấp để chọn thêm 1 mẫu xe đối chiếu
                              </p>
                            </button>
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {/* GROUP 1: KÍCH THƯỚC & KHUNG GẦM */}
                      <tr className="bg-slate-50/70">
                        <td
                          colSpan={comparisonModelIds.length + 1 + (comparisonModelIds.length === 2 ? 1 : 0)}
                          className="p-2.5 px-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider bg-slate-100/70"
                        >
                          1. Kích thước & Khoang hành khách
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Kích thước (D x R x C)</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800">
                            {CAR_CATALOG[mId].dimensions}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Chiều dài cơ sở (khoang chân)</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800">
                            {CAR_CATALOG[mId].wheelbase}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Khoảng sáng gầm xe</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800">
                            {CAR_CATALOG[mId].ground_clearance}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Số chỗ ngồi</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800">
                            {CAR_CATALOG[mId].seats}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>

                      {/* GROUP 2: ĐỘNG CƠ, PIN & TẦM CHẠY */}
                      <tr className="bg-slate-50/70">
                        <td
                          colSpan={comparisonModelIds.length + 1 + (comparisonModelIds.length === 2 ? 1 : 0)}
                          className="p-2.5 px-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider bg-slate-100/70"
                        >
                          2. Động cơ, Pin & Tầm vận hành
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Công suất động cơ</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800">
                            {CAR_CATALOG[mId].motor_power}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Dung lượng Pin khả dụng</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-extrabold text-emerald-700">
                            {CAR_CATALOG[mId].battery_kwh} kWh
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Tầm chạy chuẩn NEDC / WLTP</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-extrabold text-brand-blue">
                            {CAR_CATALOG[mId].range_nedc} km / lần sạc
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Tầm an toàn thực tế (85% DoD)</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800">
                            {Math.round(CAR_CATALOG[mId].range_real * 0.85)} km
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Thời gian sạc nhanh 10-70%</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-amber-700">
                            {CAR_CATALOG[mId].charging_time}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>

                      {/* GROUP 3: AN TOÀN & BẢO HÀNH */}
                      <tr className="bg-slate-50/70">
                        <td
                          colSpan={comparisonModelIds.length + 1 + (comparisonModelIds.length === 2 ? 1 : 0)}
                          className="p-2.5 px-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider bg-slate-100/70"
                        >
                          3. An toàn, Trợ lái & Bảo hành
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Trợ lái thông minh ADAS</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 text-slate-700 font-medium text-[11px] leading-relaxed">
                            {CAR_CATALOG[mId].adas}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Thời hạn bảo hành chính hãng</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-indigo-700">
                            {CAR_CATALOG[mId].warranty_years}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>

                      {/* GROUP 4: TÀI CHÍNH & CHI PHÍ NUÔI XE */}
                      <tr className="bg-slate-50/70">
                        <td
                          colSpan={comparisonModelIds.length + 1 + (comparisonModelIds.length === 2 ? 1 : 0)}
                          className="p-2.5 px-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider bg-slate-100/70"
                        >
                          4. Dự toán Chi phí & Tiền sạc ({customerInputs.daily_km} km/ngày)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Chi phí lăn bánh tạm tính</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-extrabold text-slate-900 tabular-nums">
                            {estimates[mId] ? formatVND(estimates[mId].on_the_road) : '—'}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Tiền điện sạc xe / tháng</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-black text-emerald-700 tabular-nums">
                            {estimates[mId] ? `~${formatVND(estimates[mId].monthly_energy)}` : '—'}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Vốn tự có tối thiểu (30%)</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-brand-blue tabular-nums">
                            {estimates[mId] ? formatVND(estimates[mId].down_payment) : '—'}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 px-4 text-slate-600 font-medium">Góp tháng đầu (vay 70%, 5 năm)</td>
                        {comparisonModelIds.map((mId) => (
                          <td key={mId} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800 tabular-nums">
                            {estimates[mId] ? formatVND(estimates[mId].first_month_payment) : '—'}
                          </td>
                        ))}
                        {comparisonModelIds.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500">
                Biểu giá chính hãng VinFast & chính sách ưu đãi 100% lệ phí trước bạ áp dụng {CATALOG_EFFECTIVE_DATE}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('picker')}
                  className="py-2 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                >
                  Đổi mẫu xe khác
                </button>
                <button
                  type="button"
                  onClick={closeComparisonModal}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs"
                >
                  Đóng bảng
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
