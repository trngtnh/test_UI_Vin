'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Car, X, ShieldCheck } from 'lucide-react';

export const TestDriveModal: React.FC = () => {
  const isOpen = useAppStore((state) => state.isTestDriveModalOpen);
  const setOpen = useAppStore((state) => state.setTestDriveModalOpen);
  const showToast = useAppStore((state) => state.showToast);

  const [showroom, setShowroom] = useState('Showroom VinFast Cầu Giấy (Hà Nội)');
  const [date, setDate] = useState('2026-11-21');
  const [name, setName] = useState('Nguyễn Văn A');
  const [phone, setPhone] = useState('0912 345 678');
  const [consent, setConsent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      showToast('Vui lòng tích chọn đồng ý xử lý thông tin cá nhân để showroom liên hệ xếp lịch.', 'warning');
      return;
    }

    setOpen(false);
    showToast(
      `Đã gửi yêu cầu lái thử thành công tới ${showroom}! Chuyên viên sẽ liên hệ số điện thoại ${phone} để xác nhận lịch hẹn.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 fade-enter border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Đăng ký Lái thử Trải nghiệm Xe VinFast
              </h3>
              <p className="text-[10px] text-slate-400">Trải nghiệm thực tế công nghệ sạc và trợ lái ADAS</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Showroom tiếp nhận yêu cầu
            </label>
            <select
              value={showroom}
              onChange={(e) => setShowroom(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-accent transition"
            >
              <option value="Showroom VinFast Cầu Giấy (Hà Nội)">
                Showroom VinFast Cầu Giấy (Hà Nội)
              </option>
              <option value="Showroom VinFast Phạm Văn Đồng (Hà Nội)">
                Showroom VinFast Phạm Văn Đồng (Hà Nội)
              </option>
              <option value="Showroom VinFast Smart City (Nam Từ Liêm)">
                Showroom VinFast Smart City (Nam Từ Liêm)
              </option>
              <option value="Showroom VinFast Long Biên (Hà Nội)">
                Showroom VinFast Long Biên (Hà Nội)
              </option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày mong muốn lái thử
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-accent transition"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Khung giờ thuận tiện
              </label>
              <select className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-accent transition">
                <option>Sáng (09:00 - 11:30)</option>
                <option>Chiều (14:00 - 17:00)</option>
                <option>Cuối tuần (Thỏa thuận)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Họ và tên người đăng ký
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-accent transition"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Số điện thoại liên hệ
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-accent transition"
              required
            />
          </div>

          {/* Decree 13 Personal Data Protection Compliance: Un-checked by default */}
          <label className="flex items-start gap-2.5 pt-1 text-slate-600 cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
              required
            />
            <span className="text-[11px] leading-relaxed select-none">
              Tôi đồng ý chia sẻ thông tin liên hệ và nhu cầu xe để Chuyên viên Showroom liên hệ xếp lịch và chuẩn bị xe lái thử (Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân).
            </span>
          </label>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
            >
              Xác nhận gửi yêu cầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
