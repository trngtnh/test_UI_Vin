'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG } from '@/lib/catalog';
import { calculateDeterministicTCO, formatVND } from '@/lib/engine';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CarVisualSilhouette } from '@/components/common/CarVisualSilhouette';
import { CustomSelect } from '@/components/common/CustomSelect';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Check,
  ShieldCheck,
  Zap,
  Building,
  User,
  Phone,
  Sparkles,
  CreditCard,
  FileCheck2,
} from 'lucide-react';

export const HITLAuditModal: React.FC = () => {
  const ticket = useAppStore((state) => state.ticket);
  const userProfile = useAppStore((state) => state.userProfile);
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

  const handleApplyVietcombank = () => {
    setRate(8.0);
    setDownpayRatio(0.2);
    setIsRecalcDone(true);
    showToast('Đã áp dụng gói vay Vietcombank: Lãi suất 8.0%/năm, vốn tự có 20%.', 'info');
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
    <div className="flex flex-col gap-4 animate-in fade-in duration-150">
      {/* Back Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAuditScreenOpen(false)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Quay lại Danh sách Hồ sơ
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="brand" className="bg-blue-50 text-brand-blue border-blue-200">
            Phiên làm việc: #{ticket.id}
          </Badge>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Khách hàng: <strong className="text-slate-800">{userProfile.fullName || 'Nguyễn Văn A'}</strong>
          </span>
        </div>
      </div>

      {/* Main Inspection Cockpit */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Cockpit Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Thẩm Định Hồ Sơ Dự Toán #{ticket.id}
              </h2>
              <Badge variant="success" dot>
                Dữ liệu đồng bộ trực tiếp
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Khách hàng: <strong className="text-slate-800">{userProfile.fullName || 'Nguyễn Văn A'}</strong> ({userProfile.phone || '0988 123 456'}) · {userProfile.address || 'Cầu Giấy, Hà Nội'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              Trạng thái: {ticket.status === 'approved' ? 'Đã duyệt' : 'Chờ thẩm định'}
            </span>
          </div>
        </div>

        {/* 2-Column Inspection Workspace */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customer Inputs & Vehicle Showcase (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Vehicle Card Showcase */}
            <div className="rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-4 text-white space-y-3 shadow-md overflow-hidden">
              <div className="flex items-center justify-between">
                <Badge variant="dark" dot pulseDot>
                  {car.badge}
                </Badge>
                <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                  {car.seats}
                </span>
              </div>

              <div className="h-28 flex items-center justify-center p-1 overflow-hidden">
                <CarVisualSilhouette modelId={selectedModelId || 'VF6'} className="w-full h-full max-h-28" />
              </div>

              <div className="border-t border-slate-800 pt-2 flex items-baseline justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">{car.display_name}</h3>
                  <span className="text-[10px] text-slate-400">Kèm pin & bộ sạc chính hãng</span>
                </div>
                <span className="text-base font-black text-blue-400 tabular-nums whitespace-nowrap">
                  {car.price.toLocaleString('vi-VN')}&nbsp;đ
                </span>
              </div>
            </div>

            {/* Customer Inputs Snapshot */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nhu cầu di chuyển của khách
              </span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Cự ly trung bình:</span>
                  <strong className="text-slate-900">{customerInputs.daily_km} km / ngày</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Hạ tầng sạc pin:</span>
                  <strong className="text-slate-900">
                    {customerInputs.charging_facility === 'home'
                      ? 'Sạc tại nhà riêng'
                      : 'Trạm sạc V-GREEN toàn quốc'}
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Khu vực đăng ký:</span>
                  <strong className="text-slate-900">Hà Nội (Khu vực 1)</strong>
                </div>
              </div>
            </div>

            {/* MANDATORY 3-ITEM CHECKLIST (HITL Compliance) */}
            <div className="rounded-xl bg-blue-50/50 border border-blue-200/80 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-brand-blue" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quy trình Kiểm định Bắt buộc:
                </h4>
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-brand-blue cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={checkPrice}
                    onChange={(e) => setCheckPrice(e.target.checked)}
                    className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong>1. Biểu giá niêm yết:</strong> Khớp biểu giá Tháng 11/2026 kèm pin và bộ sạc.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-brand-blue cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={checkFees}
                    onChange={(e) => setCheckFees(e.target.checked)}
                    className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong>2. Miễn 100% trước bạ:</strong> Áp dụng chính sách Nghị định 10/2022/NĐ-CP (tiết kiệm ~{Math.round(car.price * 0.1 / 1000000)} tr).
                  </span>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-brand-blue cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={checkBank}
                    onChange={(e) => setCheckBank(e.target.checked)}
                    className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong>3. Điều kiện tín dụng:</strong> Khách đáp ứng điều kiện sơ bộ của ngân hàng đối tác.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Advisor Financial Optimization (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Tối ưu Tham số Vay & Thu hồi 5 năm
                </h4>
                <p className="text-[11px] text-slate-500">
                  Điều chỉnh gói vay và tính toán lại tức thì trước khi xuất bản dự toán
                </p>
              </div>

              {/* Bank Preset Quick Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyTechcombank}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-brand-blue hover:bg-blue-100 border border-blue-200 transition"
                >
                  Techcombank 8.5%
                </button>
                <button
                  type="button"
                  onClick={handleApplyVietcombank}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition"
                >
                  Vietcombank 8.0%
                </button>
              </div>
            </div>

            {/* Inputs Form Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giá xuất hóa đơn (VNĐ)</label>
                <input
                  type="text"
                  value={car.price.toLocaleString('vi-VN')}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tỷ lệ vốn tự có (%)</label>
                <CustomSelect<number>
                  value={downpayRatio}
                  onChange={(val) => {
                    setDownpayRatio(val);
                    setIsRecalcDone(false);
                  }}
                  options={[
                    { value: 0.2, label: '20% (Khách trả trước 20%)' },
                    { value: 0.3, label: '30% (Khách trả trước 30%)' },
                    { value: 0.5, label: '50% (Khách trả trước 50%)' },
                    { value: 1.0, label: '100% (Mua thẳng không vay)' },
                  ]}
                  size="md"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lãi suất vay ngân hàng (%/năm)</label>
                <input
                  type="number"
                  value={rate}
                  step={0.1}
                  onChange={(e) => {
                    setRate(parseFloat(e.target.value));
                    setIsRecalcDone(false);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tỷ lệ thu hồi sau 5 năm (%)</label>
                <input
                  type="number"
                  value={resaleRatio}
                  step={5}
                  onChange={(e) => {
                    setResaleRatio(parseFloat(e.target.value));
                    setIsRecalcDone(false);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Recalculate Action Strip */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculate}
                icon={<RefreshCw className="w-3.5 h-3.5 text-brand-blue" />}
              >
                Tính toán lại dự toán
              </Button>
              {isRecalcDone && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Số liệu đã cập nhật khớp mới nhất
                </span>
              )}
            </div>

            {/* Real-time Calculation Result Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Tiền trả tháng đầu:</span>
                <span className="text-sm font-black text-slate-900 block tabular-nums">
                  {formatVND(currentResult.first_month_payment)}
                </span>
                <span className="text-[9px] text-slate-400">Gốc đều + lãi dư nợ</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Tổng lãi vay 5 năm:</span>
                <span className="text-sm font-black text-slate-900 block tabular-nums">
                  {formatVND(currentResult.total_interest)}
                </span>
                <span className="text-[9px] text-slate-400">Kỳ hạn 60 tháng</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Tổng chi phí TCO 5 năm:</span>
                <span className="text-sm font-black text-brand-blue block tabular-nums">
                  {formatVND(currentResult.tco_5y)}
                </span>
                <span className="text-[9px] text-slate-400">Đã trừ giá bán lại</span>
              </div>
            </div>

            {/* Advisor Note Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-900">
                Lời nhắn & Ưu đãi đặc biệt gửi kèm cho Khách hàng:
              </label>
              <textarea
                rows={3}
                value={advisorNote}
                onChange={(e) => setAdvisorNote(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-blue focus:outline-hidden"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={handleReject}
              >
                Từ chối & Yêu cầu bổ sung
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleApprove}
                disabled={!canApprove}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Phê duyệt & Gửi dự toán chính thức
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
