'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG } from '@/lib/catalog';
import { calculateDeterministicTCO, formatVND } from '@/lib/engine';
import { ArrowLeft, RefreshCw, CheckCircle, Check } from 'lucide-react';

export const HITLAuditModal: React.FC = () => {
  const ticket = useAppStore((state) => state.ticket);
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const customerInputs = useAppStore((state) => state.customerInputs);
  const approveTicket = useAppStore((state) => state.approveTicket);
  const rejectTicket = useAppStore((state) => state.rejectTicket);
  const setAuditScreenOpen = useAppStore((state) => state.setAdvisorAuditScreenOpen);
  const showToast = useAppStore((state) => state.showToast);

  const car = CAR_CATALOG[selectedModelId || 'VF6'];

  // Local state for advisor adjustments
  const [downpayRatio, setDownpayRatio] = useState(0.3);
  const [rate, setRate] = useState(8.0);
  const [resaleRatio, setResaleRatio] = useState(50);
  const [advisorNote, setAdvisorNote] = useState(
    'Showroom VinFast Cầu Giấy đang có sẵn xe giao ngay trong tuần, hỗ trợ làm thủ tục vay Techcombank trong 24h và tặng kèm gói thảm sàn chính hãng.'
  );

  // Mandatory 3-item checklist state
  const [checkPrice, setCheckPrice] = useState(false);
  const [checkFees, setCheckFees] = useState(false);
  const [checkBank, setCheckBank] = useState(false);
  const [isRecalcDone, setIsRecalcDone] = useState(true);

  // Compute live advisor estimate
  const currentResult = calculateDeterministicTCO({
    car,
    daily_km: customerInputs.daily_km,
    loan_ratio: Math.round((1 - downpayRatio) * 10) / 10,
    loan_rate: rate / 100,
    loan_method: 'decreasing',
    charging_facility: customerInputs.charging_facility,
    resale_ratio: resaleRatio / 100,
  });

  const canApprove = checkPrice && checkFees && checkBank && isRecalcDone;

  const handleApplyTechcombank = () => {
    setRate(8.5);
    setDownpayRatio(0.3);
    setIsRecalcDone(true);
    showToast('Đã áp dụng gói vay ưu đãi Techcombank: Lãi suất 8.5%/năm, vốn tự có 30%.', 'info');
  };

  const handleRecalculate = () => {
    setIsRecalcDone(true);
    showToast('Đã tính toán lại dự toán theo các tham số mới.', 'info');
  };

  const handleApprove = () => {
    if (!canApprove) {
      showToast('Vui lòng kiểm tra và xác nhận đủ 3 bước trong Quy trình Kiểm định Nghiệp vụ trước khi phê duyệt.', 'warning');
      return;
    }
    approveTicket(advisorNote);
  };

  const handleReject = () => {
    const reason = 'Cần khách hàng bổ sung sao kê thu nhập 3 tháng gần nhất để hoàn thiện hồ sơ vay.';
    rejectTicket(reason);
  };

  return (
    <div className="flex flex-col gap-5 fade-enter">
      {/* Back Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setAuditScreenOpen(false)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách Hồ sơ</span>
        </button>
        <span className="text-xs text-slate-500">
          Mã phiên làm việc: <strong className="text-slate-800">#{ticket.id}</strong>
        </span>
      </div>

      {/* Main Inspection Card */}
      <div className="app-card overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Thẩm định Hồ sơ Dự toán #{ticket.id}
              </h3>
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Trích xuất dữ liệu: Khớp nhu cầu khách hàng gửi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Khách hàng: <strong>Nguyễn Văn A</strong> · Cầu Giấy, Hà Nội · Tiếp nhận từ Cổng tư vấn trực tuyến
            </p>
          </div>
        </div>

        {/* 2-Column Inspection Workspace */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Customer Inputs & Checklist (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                1. Thông tin Nhu cầu & Dự toán của Khách hàng
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân sách dự kiến:</span>
                  <span className="font-bold text-slate-900">700.000.000 đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thói quen di chuyển:</span>
                  <span className="font-bold text-slate-900">{customerInputs.daily_km} km/ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Điểm sạc pin:</span>
                  <span className="font-bold text-slate-900">
                    {customerInputs.charging_facility === 'home'
                      ? 'Sạc tại nhà riêng'
                      : 'Trạm sạc V-GREEN (Chung cư)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Proposed Vehicle */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 text-xs">
              <span className="text-[11px] font-semibold text-brand-blue block mb-1">
                Mẫu xe khách chọn:
              </span>
              <div className="font-bold text-slate-900 text-sm">{car.display_name}</div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Khớp ngân sách trần và cự ly di chuyển đô thị.
              </p>
            </div>

            {/* MANDATORY CHECKLIST */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Quy trình Kiểm định Nghiệp vụ (Bắt buộc xác nhận trước khi phê duyệt):
              </h4>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checkPrice}
                  onChange={(e) => setCheckPrice(e.target.checked)}
                  className="mt-0.5 rounded text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  <strong>Giá niêm yết & Gói pin:</strong> Xác nhận giá xuất hóa đơn đã bao gồm pin và thuế VAT theo đúng biểu giá chính hãng đang có hiệu lực.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checkFees}
                  onChange={(e) => setCheckFees(e.target.checked)}
                  className="mt-0.5 rounded text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  <strong>Chi phí lăn bánh Hà Nội:</strong> Đã áp dụng ưu đãi 100% lệ phí trước bạ ô tô điện và dự toán đầy đủ chi phí đăng ký biển số, đăng kiểm, bảo trì đường bộ.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checkBank}
                  onChange={(e) => setCheckBank(e.target.checked)}
                  className="mt-0.5 rounded text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  <strong>Phương án Vay trả góp:</strong> Khách hàng đáp ứng điều kiện hạn mức vay ngân hàng đối tác và phù hợp điều kiện tín dụng CIC sơ bộ.
                </span>
              </label>
            </div>

          </div>

          {/* Right Column: Advisor Financial Optimization (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Thẩm định & Tối ưu Phương án Tài chính
                </h4>
                <button
                  type="button"
                  onClick={handleApplyTechcombank}
                  className="text-[11px] font-semibold text-brand-accent hover:underline"
                >
                  + Gợi ý gói vay Techcombank: Lãi suất 8.5%/năm
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Hệ thống tự động tính toán lại tức thì theo công thức tài chính ngân hàng chuẩn
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Giá xuất hóa đơn (VNĐ)</label>
                <input
                  type="text"
                  value={car.price.toLocaleString('vi-VN')}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tỷ lệ vốn tự có (%)</label>
                <select
                  value={downpayRatio}
                  onChange={(e) => {
                    setDownpayRatio(parseFloat(e.target.value));
                    setIsRecalcDone(false);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
                >
                  <option value={0.2}>20% (Khách trả trước 20%)</option>
                  <option value={0.3}>30% (Khách trả trước 30%)</option>
                  <option value={0.5}>50% (Khách trả trước 50%)</option>
                  <option value={1.0}>100% (Mua thẳng không vay)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Lãi suất vay ngân hàng (%/năm)</label>
                <input
                  type="number"
                  value={rate}
                  step={0.1}
                  onChange={(e) => {
                    setRate(parseFloat(e.target.value));
                    setIsRecalcDone(false);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tỷ lệ thu hồi sau 5 năm (%)</label>
                <input
                  type="number"
                  value={resaleRatio}
                  step={5}
                  onChange={(e) => {
                    setResaleRatio(parseFloat(e.target.value));
                    setIsRecalcDone(false);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>
            </div>

            {/* Recalculate Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRecalculate}
                className="px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tính toán lại Dự toán</span>
              </button>
              {isRecalcDone && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Số liệu đã khớp mới nhất
                </span>
              )}
            </div>

            {/* Real-time Calculation Result Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Tiền trả tháng đầu:</span>
                <span className="text-sm font-extrabold text-slate-900 block">
                  {formatVND(currentResult.first_month_payment)}
                </span>
                <span className="text-[9px] text-slate-400">Gốc đều + lãi dư nợ</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Tổng lãi vay 5 năm:</span>
                <span className="text-sm font-extrabold text-slate-900 block">
                  {formatVND(currentResult.total_interest)}
                </span>
                <span className="text-[9px] text-slate-400">Kỳ hạn 60 tháng</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Tổng chi phí sở hữu 5 năm:</span>
                <span className="text-sm font-extrabold text-brand-blue block">
                  {formatVND(currentResult.tco_5y)}
                </span>
                <span className="text-[9px] text-slate-400">Đã trừ giá trị bán lại</span>
              </div>
            </div>

            {/* Advisor Note Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Lời nhắn & Ưu đãi đặc biệt gửi kèm cho Khách hàng:
              </label>
              <textarea
                rows={2}
                value={advisorNote}
                onChange={(e) => setAdvisorNote(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-accent focus:outline-hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
              >
                Từ chối & Yêu cầu bổ sung thông tin
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={!canApprove}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Phê duyệt & Gửi dự toán chính thức</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
