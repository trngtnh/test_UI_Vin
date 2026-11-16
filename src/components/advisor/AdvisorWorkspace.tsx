'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { QueueTable } from './QueueTable';
import { HITLAuditModal } from './HITLAuditModal';

export const AdvisorWorkspace: React.FC = () => {
  const isAuditScreenOpen = useAppStore((state) => state.advisorAuditScreenOpen);
  const ticket = useAppStore((state) => state.ticket);

  const pendingCount = ticket.status === 'pending_approval' ? 1 : 0;
  const recalcCount = ticket.status === 'needs_recalculation' ? 1 : 0;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6" aria-label="Bàn làm việc tư vấn viên">
      {/* Top Banner & Quick Metrics */}
      <div className="app-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-brand-blue">
        <div>
          <h2 className="text-base font-bold text-slate-900">Hàng đợi Yêu cầu Tư vấn & Dự toán</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chuyên viên tư vấn phụ trách: <strong className="text-slate-800">Lê Văn B (Showroom VinFast Cầu Giấy)</strong>
          </p>
        </div>

        {/* Queue Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center min-w-[90px]">
            <span className="text-[10px] text-amber-700 font-semibold block">Chờ thẩm định</span>
            <span className="text-base font-extrabold text-amber-900">{pendingCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center min-w-[90px]">
            <span className="text-[10px] text-emerald-700 font-semibold block">Đã gửi hôm nay</span>
            <span className="text-base font-extrabold text-emerald-900">12</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-center min-w-[90px]">
            <span className="text-[10px] text-rose-700 font-semibold block">Cần cập nhật</span>
            <span className="text-base font-extrabold text-rose-900">{recalcCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-center min-w-[110px]">
            <span className="text-[10px] text-brand-blue font-semibold block">Thời gian phản hồi</span>
            <span className="text-base font-extrabold text-brand-blue">~15 phút</span>
          </div>
        </div>
      </div>

      {/* Main View: Either Queue Table or Full-Screen HITL Audit Screen */}
      {isAuditScreenOpen ? <HITLAuditModal /> : <QueueTable />}
    </div>
  );
};
