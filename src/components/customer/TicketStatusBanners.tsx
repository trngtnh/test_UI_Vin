'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { VINFAST_FACILITIES } from '@/lib/catalog';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const TicketStatusBanners: React.FC = () => {
  const ticket = useAppStore((state) => state.ticket);
  const selectedCity = useAppStore((state) => state.selectedCity) || 'national';
  const setRole = useAppStore((state) => state.setRole);
  const submitTicket = useAppStore((state) => state.submitTicketToAdvisor);
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);

  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;
  const showroomLabel = selectedCity === 'national' ? 'Showroom VinFast' : currentFacility.showroomName;

  if (ticket.status === 'draft') return null;

  return (
    <div className="space-y-3">
      {/* 1. Pending Approval Banner */}
      {ticket.status === 'pending_approval' && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-2.5 fade-enter flex-wrap sm:flex-nowrap">
          <div className="flex items-start gap-2.5 flex-1">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">
                Đang chờ chuyên viên {showroomLabel} thẩm định (Hồ sơ #{ticket.id})
              </span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Dự toán của bạn đã được chuyển tới chuyên viên tư vấn phụ trách tại {showroomLabel}. Chuyên viên sẽ đối chiếu chính sách giá và phản hồi sớm nhất.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRole('advisor')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-950 text-[11px] font-bold shrink-0 transition cursor-pointer"
          >
            Xem tiến độ tại Showroom ➔
          </button>
        </div>
      )}

      {/* 2. Needs Recalculation / Invalidation Banner */}
      {ticket.status === 'needs_recalculation' && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start justify-between gap-2.5 fade-enter flex-wrap sm:flex-nowrap">
          <div className="flex items-start gap-2.5 flex-1">
            <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Dữ liệu đã thay đổi · Cần cập nhật lại dự toán</span>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Bạn vừa điều chỉnh thông số di chuyển, phiên bản xe hoặc phương án vay. Báo giá trước đó không còn hiệu lực. Vui lòng gửi lại dự toán để chuyên viên xác nhận phương án mới.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={submitTicket}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shrink-0 transition cursor-pointer"
          >
            Gửi lại dự toán mới ➔
          </button>
        </div>
      )}

      {/* 3. Approved Banner */}
      {ticket.status === 'approved' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-2 fade-enter">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Dự toán chính thức đã được {showroomLabel} phê duyệt</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Đã xác thực O2O
            </span>
          </div>

          <p className="text-[11px] text-emerald-800">
            Chuyên viên phê duyệt: <strong>{ticket.approved_by}</strong> lúc {ticket.approved_at} · Biểu giá áp dụng: {ticket.catalog_version}
          </p>

          {ticket.advisor_notes && (
            <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200 text-emerald-900 text-[11px]">
              <span className="font-semibold block text-slate-700 mb-0.5">Ghi chú từ chuyên viên tư vấn:</span>
              <span>{ticket.advisor_notes}</span>
            </div>
          )}

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={() => setTestDriveModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer"
            >
              Đăng ký lái thử mẫu xe này ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
