'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getCarModelWithVariant, VINFAST_FACILITIES } from '@/lib/catalog';
import { formatVND } from '@/lib/engine';
import { CustomSelect } from '@/components/common/CustomSelect';
import {
  X,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const isProfileModalOpen = useAppStore((state) => state.isProfileModalOpen);
  const setProfileModalOpen = useAppStore((state) => state.setProfileModalOpen);
  const profileActiveTab = useAppStore((state) => state.profileActiveTab);
  const userProfile = useAppStore((state) => state.userProfile);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const ticket = useAppStore((state) => state.ticket);
  const customerInputs = useAppStore((state) => state.customerInputs);
  const selectedVariantIds = useAppStore((state) => state.selectedVariantIds);
  const selectedCity = useAppStore((state) => state.selectedCity) || 'national';
  const proceedToTCO = useAppStore((state) => state.proceedToTCO);
  const showToast = useAppStore((state) => state.showToast);

  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;
  const showroomLabel = selectedCity === 'national' ? 'Showroom VinFast' : currentFacility.showroomName;
  const cityLabel = selectedCity === 'national' ? 'Việt Nam' : currentFacility.cityName;

  const [activeTab, setActiveTab] = useState<'profile' | 'history'>(profileActiveTab || 'history');
  const [formData, setFormData] = useState({ ...userProfile });
  const [isSaved, setIsSaved] = useState(false);

  // Sync tab when prop changes
  React.useEffect(() => {
    if (profileActiveTab) setActiveTab(profileActiveTab);
  }, [profileActiveTab]);

  React.useEffect(() => {
    if (!isProfileModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen, setProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsSaved(true);
    showToast('Đã lưu thông tin tài khoản thành công!', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const registeredCar = ticket.model_id
    ? getCarModelWithVariant(ticket.model_id, selectedVariantIds?.[ticket.model_id])
    : null;
  const downPaymentPercent = Math.round(
    (1 - (ticket.input_snapshot?.loan_ratio ?? customerInputs.loan_ratio)) * 100
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      onClick={() => setProfileModalOpen(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Tài khoản & Lịch sử Đăng ký · VinFast O2O
              </h3>
              <p className="text-[10px] text-slate-500">
                Quản lý hồ sơ cá nhân và theo dõi tình trạng dự toán tại {showroomLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-white border-b border-slate-100 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'history'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Lịch sử đăng ký & Hồ sơ xe</span>
            {ticket.status !== 'draft' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'profile'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Thông tin cá nhân</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: REGISTRATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="font-semibold">Danh sách hồ sơ dự toán & đăng ký xe:</span>
                <span className="text-[11px] text-slate-400">Đồng bộ tức thì với {showroomLabel}</span>
              </div>

              {ticket.status === 'draft' ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700">Chưa có hồ sơ dự toán nào được gửi</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Anh/chị hãy chọn một mẫu xe tại Sảnh chính, tính toán phương án TCO và nhấn &quot;Gửi dự toán đến {showroomLabel}&quot; để lưu hồ sơ tại đây.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs space-y-0">
                  {/* Ticket Header Strip */}
                  <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-brand-blue text-white">
                        #{ticket.id}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        {registeredCar?.display_name || 'VinFast EV'}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {ticket.status === 'approved' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã {showroomLabel} phê duyệt chính thức</span>
                        </span>
                      ) : ticket.status === 'pending_approval' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Chờ {showroomLabel} tiếp nhận & duyệt</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Đã cập nhật thông số mới
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="p-4 space-y-3.5">
                    {/* Key Financial Snapshot */}
                    {ticket.computed_snapshot && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Giá niêm yết:</span>
                          <strong className="text-slate-900 text-xs tabular-nums">
                            {formatVND(ticket.computed_snapshot.car_price)}
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Vốn tự có ({downPaymentPercent}%):</span>
                          <strong className="text-brand-blue text-xs tabular-nums">
                            {formatVND(ticket.computed_snapshot.down_payment)}
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Góp tháng đầu:</span>
                          <strong className="text-emerald-700 text-xs tabular-nums">
                            {formatVND(ticket.computed_snapshot.first_month_payment)}
                          </strong>
                        </div>
                      </div>
                    )}

                    {/* Advisor Approval Info when Approved */}
                    {ticket.status === 'approved' && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-emerald-900 font-bold">
                          <span>Chuyên viên thẩm định: {ticket.approved_by}</span>
                          <span className="text-[10px] text-emerald-700 font-normal">{ticket.approved_at}</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          <strong>Ghi chú cam kết:</strong> {ticket.advisor_notes || `Đã kiểm tra biểu giá, phí lăn bánh ${cityLabel} và chính sách miễn 100% lệ phí trước bạ.`}
                        </p>
                      </div>
                    )}

                    {/* Pending Advisory Info */}
                    {ticket.status === 'pending_approval' && (
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                        <span className="font-bold text-amber-900 block">
                          {showroomLabel} đang xử lý:
                        </span>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Hồ sơ của anh/chị đã được gửi đến hàng chờ của Chuyên viên tư vấn. Khi được duyệt, hệ thống sẽ tự động cập nhật ghi chú cam kết giá và thông báo trên quả chuông.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">
                        Áp dụng biểu giá niêm yết: {ticket.catalog_version}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileModalOpen(false);
                          proceedToTCO(ticket.model_id);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>Xem lại dự toán TCO</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL INFORMATION FORM */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Họ và tên khách hàng:</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-accent focus:outline-hidden transition"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Số điện thoại liên hệ:</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-accent focus:outline-hidden transition"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-accent focus:outline-hidden transition"
                  />
                </div>

                {/* Daily Commute */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Quãng đường di chuyển hàng ngày:</label>
                  <input
                    type="number"
                    value={formData.dailyKm}
                    onChange={(e) => setFormData({ ...formData, dailyKm: parseInt(e.target.value) || 30 })}
                    min="5"
                    max="200"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-accent focus:outline-hidden transition"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Địa chỉ liên hệ ({cityLabel}):</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-accent focus:outline-hidden transition"
                  />
                </div>

                {/* Parking Type */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Vị trí đỗ xe & sạc điện chính:</label>
                  <CustomSelect<'apartment' | 'house'>
                    value={formData.parkingType}
                    onChange={(val) => setFormData({ ...formData, parkingType: val })}
                    options={[
                      { value: 'apartment', label: 'Ở chung cư (Sạc trạm công cộng V-GREEN / Hầm chung cư)' },
                      { value: 'house', label: 'Nhà phố / Có gara riêng (Sạc trụ gia đình qua đêm)' },
                    ]}
                    size="md"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>{isSaved ? 'Đã lưu thay đổi!' : 'Lưu thông tin tài khoản'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
