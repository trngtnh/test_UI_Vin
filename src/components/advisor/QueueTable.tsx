'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CAR_CATALOG } from '@/lib/catalog';
import { formatVND } from '@/lib/engine';

export const QueueTable: React.FC = () => {
  const ticket = useAppStore((state) => state.ticket);
  const setAuditScreenOpen = useAppStore((state) => state.setAdvisorAuditScreenOpen);
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const getComputedEstimate = useAppStore((state) => state.getComputedEstimate);

  const activeCar = CAR_CATALOG[selectedModelId || 'VF6'];
  const activeEstimate = getComputedEstimate();
  const tcoDisplay = activeEstimate ? formatVND(activeEstimate.tco_5y) : '742.500.000 đ';

  return (
    <div className="app-card overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Danh sách Hồ sơ Khách hàng tiếp nhận</h3>
          <p className="text-[11px] text-slate-500">
            Chuyên viên kiểm tra thông số, đối chiếu biểu giá và gửi dự toán chính thức cho khách hàng
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold text-[11px]">
              <th className="p-3.5">Mã hồ sơ</th>
              <th className="p-3.5">Khách hàng</th>
              <th className="p-3.5">Mẫu xe & Nhu cầu</th>
              <th className="p-3.5">Dự toán Chi phí 5 năm</th>
              <th className="p-3.5">Biểu giá áp dụng</th>
              <th className="p-3.5">Trạng thái xử lý</th>
              <th className="p-3.5 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            
            {/* Row 1: Active Ticket (#HS-1089) */}
            <tr className="hover:bg-slate-50 transition">
              <td className="p-3.5 font-bold text-slate-900">#{ticket.id}</td>
              <td className="p-3.5">
                <span className="font-semibold text-slate-800 block">Nguyễn Văn A</span>
                <span className="text-[11px] text-slate-400">Cầu Giấy · 30km/ngày · Ở chung cư</span>
              </td>
              <td className="p-3.5">
                <span className="font-bold text-brand-blue">{activeCar.display_name}</span>
              </td>
              <td className="p-3.5 font-bold text-slate-800">{tcoDisplay}</td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Tháng 11/2026
                </span>
              </td>
              <td className="p-3.5">
                {ticket.status === 'approved' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Đã gửi dự toán
                  </span>
                ) : ticket.status === 'needs_recalculation' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    Cần tính lại
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Chờ thẩm định
                  </span>
                )}
              </td>
              <td className="p-3.5 text-right">
                <button
                  onClick={() => setAuditScreenOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-brand-blue hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition"
                >
                  Thẩm định & Phản hồi →
                </button>
              </td>
            </tr>

            {/* Row 2: Expired Catalog Reference Ticket */}
            <tr className="hover:bg-slate-50 transition opacity-80">
              <td className="p-3.5 font-bold text-slate-500">#HS-1084</td>
              <td className="p-3.5">
                <span className="font-semibold text-slate-700 block">Trần Thị C</span>
                <span className="text-[11px] text-slate-400">Hà Đông, Hà Nội</span>
              </td>
              <td className="p-3.5 font-medium text-slate-600">VinFast VF 5 Plus</td>
              <td className="p-3.5 text-slate-600">558.000.000 đ</td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  Biểu giá cũ (Hết hạn)
                </span>
              </td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  Cần cập nhật giá mới
                </span>
              </td>
              <td className="p-3.5 text-right">
                <span className="text-[11px] text-slate-400 italic">Đã thông báo khách</span>
              </td>
            </tr>

            {/* Row 3: Completed Ticket */}
            <tr className="hover:bg-slate-50 transition opacity-70">
              <td className="p-3.5 font-bold text-slate-500">#HS-1075</td>
              <td className="p-3.5">
                <span className="font-semibold text-slate-700 block">Hoàng Minh D</span>
                <span className="text-[11px] text-slate-400">Tây Hồ, Hà Nội</span>
              </td>
              <td className="p-3.5 font-medium text-slate-600">VinFast VF 7 Eco</td>
              <td className="p-3.5 text-slate-600">890.000.000 đ</td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Tháng 11/2026
                </span>
              </td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Đã gửi dự toán
                </span>
              </td>
              <td className="p-3.5 text-right text-slate-400 text-xs">
                Hoàn tất
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};
