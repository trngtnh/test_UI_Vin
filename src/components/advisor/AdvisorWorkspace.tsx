'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { QueueTable } from './QueueTable';
import { HITLAuditModal } from './HITLAuditModal';
import { VINFAST_FACILITIES } from '@/lib/catalog';
import { CityId } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import {
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  MapPin,
  RefreshCw,
  Users,
  Car,
  FileCheck2,
  Headset,
} from 'lucide-react';

export const AdvisorWorkspace: React.FC = () => {
  const isAuditScreenOpen = useAppStore((state) => state.advisorAuditScreenOpen);
  const ticket = useAppStore((state) => state.ticket);
  const selectedCity = useAppStore((state) => state.selectedCity) || 'national';
  const setCity = useAppStore((state) => state.setCity);
  const showToast = useAppStore((state) => state.showToast);

  const [activeTab, setActiveTab] = useState<'queue' | 'testdrives' | 'closed'>('queue');

  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;
  const pendingCount = ticket.status === 'pending_approval' ? 1 : 0;
  const recalcCount = ticket.status === 'needs_recalculation' ? 1 : 0;

  const handleRefresh = () => {
    showToast('Đã đồng bộ dữ liệu mới nhất từ Cổng tư vấn O2O Toàn quốc.', 'info');
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-4 flex flex-col gap-4 overflow-y-auto" aria-label="Bàn làm việc tư vấn viên">
      {/* Showroom Command Center Top Strip */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Headset className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Bàn Làm Việc Tư Vấn Viên & Thẩm Định O2O
              </h1>
              <Badge variant="brand" className="bg-blue-50 text-brand-blue border-blue-200">
                Chuyên viên: Lê Văn B (Mã CV: VF-HN-0428)
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Cơ sở phụ trách:</span>
              <strong className="text-slate-800 font-semibold">{currentFacility.showroomName}</strong>
              <span className="text-slate-300">·</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Kết nối Realtime Cổng Khách hàng
              </span>
            </p>
          </div>
        </div>

        {/* Showroom Location Switcher & Refresh */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <CustomSelect
            value={selectedCity}
            onChange={(val) => setCity(val as CityId)}
            options={[
              { value: 'national', label: 'Hệ thống Showroom Toàn quốc' },
              { value: 'hanoi', label: 'VinFast Cầu Giấy (Hà Nội)', badge: 'Trực 24/7' },
              { value: 'hcm', label: 'VinFast Landmark 81 (TP.HCM)' },
              { value: 'danang', label: 'VinFast Ngô Quyền (Đà Nẵng)' },
              { value: 'haiphong', label: 'VinFast Lê Thánh Tông (Hải Phòng)' },
              { value: 'cantho', label: 'VinFast Hưng Lợi (Cần Thơ)' },
            ]}
            icon={<MapPin className="w-3.5 h-3.5 text-slate-500" />}
            size="md"
            variant="subtle"
            aria-label="Chọn địa điểm Showroom"
            dropdownClassName="w-64"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* 4 Elevated KPI Metrics Cards (Origin UI Inspired) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Chờ thẩm định (SLA &lt;15p)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 tabular-nums">{pendingCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">hồ sơ cần duyệt</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-700 font-medium bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 inline-flex items-center gap-1 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Có khách đang chờ trực tuyến</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Lịch lái thử hôm nay</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tabular-nums">3</span>
            <span className="text-[11px] text-slate-400 font-medium">cuộc hẹn tiếp đón</span>
          </div>
          <div className="mt-2 text-[10px] text-blue-700 font-medium bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/60 inline-flex items-center gap-1 self-start">
            <Car className="w-3 h-3 text-brand-blue" />
            <span>2 xe VF 6, 1 xe VF 7 sẵn sàng</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Dự toán đã gửi hôm nay</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 tabular-nums">12</span>
            <span className="text-[11px] text-slate-400 font-medium">bản dự toán TCO</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-700 font-medium bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-flex items-center gap-1 self-start">
            <span>Tổng giá trị: ~9.2 tỷ đồng</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Tỷ lệ phản hồi đúng hạn</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 tabular-nums">98.5%</span>
            <span className="text-[11px] text-slate-400 font-medium">SLA đạt chuẩn</span>
          </div>
          <div className="mt-2 text-[10px] text-indigo-700 font-medium bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-200/60 inline-flex items-center gap-1 self-start">
            <span>Thời gian phản hồi TB: 11 phút</span>
          </div>
        </div>
      </div>

      {/* Main Workspace: Either Full-Screen HITL Audit Screen or Production Queue Table */}
      {isAuditScreenOpen ? <HITLAuditModal /> : <QueueTable activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
};
