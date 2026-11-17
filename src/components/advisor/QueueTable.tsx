'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG } from '@/lib/catalog';
import { formatVND } from '@/lib/engine';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CarVisualSilhouette } from '@/components/common/CarVisualSilhouette';
import { CustomSelect } from '@/components/common/CustomSelect';
import {
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Car,
  User,
  Phone,
  MapPin,
  FileText,
  Sparkles,
} from 'lucide-react';

interface QueueTableProps {
  activeTab?: 'queue' | 'testdrives' | 'closed';
  setActiveTab?: (tab: 'queue' | 'testdrives' | 'closed') => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({
  activeTab = 'queue',
  setActiveTab,
}) => {
  const ticket = useAppStore((state) => state.ticket);
  const userProfile = useAppStore((state) => state.userProfile);
  const setAuditScreenOpen = useAppStore((state) => state.setAdvisorAuditScreenOpen);
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const getComputedEstimate = useAppStore((state) => state.getComputedEstimate);
  const showToast = useAppStore((state) => state.showToast);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'needs_recalc' | 'approved'>('all');

  const activeCar = CAR_CATALOG[selectedModelId || 'VF6'];
  const activeEstimate = getComputedEstimate();
  const tcoDisplay = activeEstimate ? formatVND(activeEstimate.tco_5y) : '484.695.473 đ';

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Table Navigation & Filter Bar */}
      <div className="p-4 border-b border-slate-200/90 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-200/80 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab?.('queue')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-[background-color,color] duration-150 active:scale-[0.98] ${
              activeTab === 'queue'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hồ sơ Dự toán O2O (3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab?.('testdrives')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-[background-color,color] duration-150 active:scale-[0.98] ${
              activeTab === 'testdrives'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lịch hẹn Lái thử (3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab?.('closed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-[background-color,color] duration-150 active:scale-[0.98] ${
              activeTab === 'closed'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hồ sơ Đã hoàn tất (1)
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm khách hàng, SĐT, mã #HS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-brand-blue"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as any)}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'pending', label: 'Chờ thẩm định', badge: 'SLA <15p' },
              { value: 'needs_recalc', label: 'Cần tính lại' },
              { value: 'approved', label: 'Đã duyệt' },
            ]}
            icon={<Filter className="w-3.5 h-3.5 text-slate-500" />}
            size="sm"
            variant="default"
            align="right"
            dropdownClassName="w-48"
          />
        </div>
      </div>

      {/* =========================================================================
          TAB 1: HỒ SƠ DỰ TOÁN O2O (CHÍNH)
          ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="p-3.5 pl-4">Mã hồ sơ</th>
                <th className="p-3.5">Khách hàng</th>
                <th className="p-3.5 min-w-[200px]">Mẫu xe quan tâm</th>
                <th className="p-3.5">Dự toán TCO 5 năm</th>
                <th className="p-3.5">Biểu giá</th>
                <th className="p-3.5">Trạng thái xử lý</th>
                <th className="p-3.5 pr-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {/* Row 1: Active Interactive Ticket (#HS-1089) */}
              <tr className="hover:bg-blue-50/40 transition-colors group">
                <td className="p-3.5 pl-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 group-hover:text-brand-blue transition-colors">
                      #{ticket.id}
                    </span>
                    <Badge variant="brand" className="text-[9px] px-1.5 py-0 bg-blue-100/70 text-brand-blue border-transparent">
                      Live O2O
                    </Badge>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Vừa nhận 5 phút trước</span>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-brand-blue font-black flex items-center justify-center text-xs shrink-0">
                      {(userProfile.fullName || 'Nguyễn Văn A')
                        .split(' ')
                        .map((w) => w[0])
                        .slice(-2)
                        .join('')}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {userProfile.fullName || 'Nguyễn Văn A'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {userProfile.phone || '0988 123 456'} · Cầu Giấy, Hà Nội
                      </span>
                    </div>
                  </div>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-9 bg-slate-950 rounded-lg p-0.5 flex items-center justify-center border border-slate-800 shrink-0 overflow-hidden">
                      <CarVisualSilhouette modelId={selectedModelId || 'VF6'} className="w-full h-full max-h-8" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block group-hover:text-brand-blue transition-colors">
                        {activeCar.display_name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {activeCar.badge} · {activeCar.seats}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="p-3.5">
                  <span className="font-black text-brand-blue text-xs block tabular-nums">
                    {tcoDisplay}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Vay 70% · 60 tháng</span>
                </td>

                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Tháng 11/2026
                  </span>
                </td>

                <td className="p-3.5">
                  {ticket.status === 'approved' ? (
                    <Badge variant="success" dot>
                      Đã gửi dự toán
                    </Badge>
                  ) : ticket.status === 'needs_recalculation' ? (
                    <Badge variant="destructive" dot>
                      Cần tính lại
                    </Badge>
                  ) : (
                    <Badge variant="brand" dot pulseDot className="bg-amber-50 text-amber-800 border-amber-200">
                      Chờ thẩm định
                    </Badge>
                  )}
                </td>

                <td className="p-3.5 pr-4 text-right">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAuditScreenOpen(true)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    iconPosition="right"
                  >
                    Thẩm định ngay
                  </Button>
                </td>
              </tr>

              {/* Row 2: Expired Catalog Reference Ticket (#HS-1084) */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3.5 pl-4">
                  <span className="font-bold text-slate-700">#HS-1084</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">35 phút trước</span>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                      TC
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Trần Thị C</span>
                      <span className="text-[11px] text-slate-400">0912 345 678 · Hà Đông, Hà Nội</span>
                    </div>
                  </div>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-9 bg-slate-950 rounded-lg p-0.5 flex items-center justify-center border border-slate-800 shrink-0 overflow-hidden">
                      <CarVisualSilhouette modelId="VF5" className="w-full h-full max-h-8" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block">VinFast VF 5 Plus</span>
                      <span className="text-[10px] text-slate-400">A-SUV Đô thị · 5 chỗ</span>
                    </div>
                  </div>
                </td>

                <td className="p-3.5">
                  <span className="font-bold text-slate-700 block tabular-nums">412.500.000 đ</span>
                  <span className="text-[10px] text-slate-400">Vay 50%</span>
                </td>

                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    Biểu giá cũ
                  </span>
                </td>

                <td className="p-3.5">
                  <Badge variant="destructive" dot>
                    Cần cập nhật giá mới
                  </Badge>
                </td>

                <td className="p-3.5 pr-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      showToast('Đã gửi thông báo yêu cầu khách hàng làm mới biểu giá Tháng 11/2026.', 'info');
                    }}
                  >
                    Báo khách hàng
                  </Button>
                </td>
              </tr>

              {/* Row 3: Completed Ticket (#HS-1075) */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3.5 pl-4">
                  <span className="font-bold text-slate-700">#HS-1075</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">2 giờ trước</span>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                      HD
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Hoàng Minh D</span>
                      <span className="text-[11px] text-slate-400">0977 888 999 · Tây Hồ, Hà Nội</span>
                    </div>
                  </div>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-9 bg-slate-950 rounded-lg p-0.5 flex items-center justify-center border border-slate-800 shrink-0 overflow-hidden">
                      <CarVisualSilhouette modelId="VF7" className="w-full h-full max-h-8" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block">VinFast VF 7 Eco</span>
                      <span className="text-[10px] text-slate-400">C-SUV Đẳng cấp · 5 chỗ</span>
                    </div>
                  </div>
                </td>

                <td className="p-3.5">
                  <span className="font-bold text-slate-700 block tabular-nums">542.800.000 đ</span>
                  <span className="text-[10px] text-slate-400">Vay Techcombank 70%</span>
                </td>

                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Tháng 11/2026
                  </span>
                </td>

                <td className="p-3.5">
                  <Badge variant="success" dot>
                    Đã gửi dự toán
                  </Badge>
                </td>

                <td className="p-3.5 pr-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      showToast('Hồ sơ #HS-1075 đã được phê duyệt và hoàn tất thủ tục.', 'info');
                    }}
                  >
                    Xem lưu trữ
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LỊCH HẸN LÁI THỬ TẠI SHOWROOM
          ========================================================================= */}
      {activeTab === 'testdrives' && (
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Danh sách Khách hàng Đặt lịch Lái thử Hôm nay
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">3 cuộc hẹn tiếp đón</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Appointment 1 */}
            <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="brand" dot pulseDot>14:00 Hôm nay</Badge>
                <span className="text-[10px] text-slate-400 font-medium">Biển: 30K-889.21</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Phạm Quốc T</h4>
                <p className="text-xs text-slate-500">0936 888 777 · Lái thử VinFast VF 6</p>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">Xe đã sẵn sàng tại cửa số 2</span>
                <Button variant="outline" size="xs">Xác nhận đón tiếp</Button>
              </div>
            </div>

            {/* Appointment 2 */}
            <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="dark" dot>15:30 Hôm nay</Badge>
                <span className="text-[10px] text-slate-400 font-medium">Biển: 30K-912.45</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Ngô Hải Đ</h4>
                <p className="text-xs text-slate-500">0904 112 233 · Lái thử VinFast VF 7 Eco</p>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-blue-700 font-semibold">Đang rửa xe & sạc pin 100%</span>
                <Button variant="outline" size="xs">Xác nhận đón tiếp</Button>
              </div>
            </div>

            {/* Appointment 3 */}
            <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="dark" dot>16:45 Hôm nay</Badge>
                <span className="text-[10px] text-slate-400 font-medium">Biển: 30K-765.12</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Vũ Minh K</h4>
                <p className="text-xs text-slate-500">0983 555 666 · Lái thử VinFast VF 3</p>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Khách mang theo GPLX B2</span>
                <Button variant="outline" size="xs">Xác nhận đón tiếp</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HỒ SƠ ĐÃ HOÀN TẤT
          ========================================================================= */}
      {activeTab === 'closed' && (
        <div className="p-5 text-center text-xs text-slate-500 py-8">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Hồ sơ #HS-1075 đã hoàn tất bàn giao dự toán</h4>
          <p className="text-slate-400 text-xs mt-1">Khách hàng đã tải bản PDF dự toán chi phí 5 năm chính thức và đặt cọc 50 triệu.</p>
        </div>
      )}

      {/* Table Footer Summary Bar */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Biểu giá niêm yết áp dụng: <strong>Tháng 11/2026 chính hãng</strong></span>
        </span>
        <span>Hỗ trợ kỹ thuật nội bộ VinFast Showroom: <strong>1900 23 23 89 (Nhánh 2)</strong></span>
      </div>
    </div>
  );
};
