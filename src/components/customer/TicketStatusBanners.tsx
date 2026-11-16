'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Clock, AlertTriangle, CheckCircle, Car } from 'lucide-react';

export const TicketStatusBanners: React.FC = () => {
  const ticket = useAppStore((state) => state.ticket);
  const setRole = useAppStore((state) => state.setRole);
  const submitTicket = useAppStore((state) => state.submitTicketToAdvisor);
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);

  if (ticket.status === 'draft') return null;

  return (
    <div className="space-y-3">
      {/* 1. Pending Approval Banner */}
      {ticket.status === 'pending_approval' && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 fade-enter">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">
              Đang chờ chuyên viên Showroom thẩm định (Hồ sơ #{ticket.id})
            </span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Dự toán của bạn đã được chuyển tới chuyên viên tư vấn phụ trách tại Showroom VinFast Cầu Giấy. Chuyên viên sẽ đối chiếu chính sách giá và phản hồi sớm nhất.
            </p>
          </div>
          <button
            onClick={() => setRole('advisor')}
            className="px-2.5 py-1 rounded bg-amber-200/60 hover:bg-amber-200 text-amber-900 text-[11px] font-bold shrink-0 transition"
          >
            Xem tiến độ tại Showroom →
          </button>
        </div>
      )}

      {/* 2. Needs Recalculation / Invalidation Banner */}
      {ticket.status === 'needs_recalculation' && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 fade-enter">
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Dữ liệu đã thay đổi — Cần cập nhật lại dự toán</span>
            <p className="text-[11px] text-rose-800 mt-0.5">
              Bạn vừa điều chỉnh thông số di chuyển hoặc phương án vay. Báo giá đã duyệt trước đó không còn hiệu lực. Vui lòng bấm &quot;Gửi lại dự toán&quot; để chuyên viên xác nhận lại phương án mới.
            </p>
          </div>
          <button
            onClick={submitTicket}
            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shrink-0 transition"
          >
            Gửi lại dự toán đã điều chỉnh
          </button>
        </div>
      )}

      {/* 3. Approved Banner */}
      {ticket.status === 'approved' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-2 fade-enter">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Dự toán chính thức đã được Showroom Cầu Giấy phê duyệt
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Đã ký điện tử
            </span>
          </div>

          <p className="text-[11px] text-emerald-800">
            Chuyên viên phê duyệt: <strong>{ticket.approved_by}</strong> lúc {ticket.approved_at} · Biểu giá áp dụng: Tháng 11/2026
          </p>

          {ticket.advisor_notes && (
            <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200 text-emerald-900 text-[11px]">
              <span className="font-semibold block text-slate-700 mb-0.5">Ghi chú từ chuyên viên tư vấn:</span>
              <span>{ticket.advisor_notes}</span>
            </div>
          )}

          <button
            onClick={() => setTestDriveModalOpen(true)}
            className="w-full mt-1 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1 transition"
          >
            <Car className="w-4 h-4" />
            <span>Đăng ký lái thử mẫu xe này</span>
          </button>
        </div>
      )}
    </div>
  );
};
