import { create } from 'zustand';
import {
  ModelId,
  CustomerInputs,
  Ticket,
  Role,
  TCOEstimateResult,
  CustomerViewTab,
  AppNotification,
  JourneyStep,
  CanvasMode,
  CityId,
} from '@/types';
import { CAR_CATALOG, CATALOG_VERSION, VINFAST_FACILITIES } from '@/lib/catalog';
import { calculateDeterministicTCO } from '@/lib/engine';

export interface ToastInfo {
  message: string;
  type: 'success' | 'info' | 'warning';
}

export interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  parkingType: 'apartment' | 'house';
  dailyKm: number;
}

interface AppStoreState {
  currentRole: Role;
  customerTab: CustomerViewTab;
  journeyStep: JourneyStep;
  canvasMode: CanvasMode;
  isChatOpen: boolean;
  selectedModelId: ModelId | null;
  customerInputs: CustomerInputs;
  ticket: Ticket;
  notifications: AppNotification[];
  isNotificationOpen: boolean;
  isTestDriveModalOpen: boolean;
  isSlidersAccordionOpen: boolean;
  advisorAuditScreenOpen: boolean;
  toast: ToastInfo | null;
  userProfile: UserProfile;
  isProfileModalOpen: boolean;
  profileActiveTab: 'profile' | 'history';
  isComparisonModalOpen: boolean;
  comparisonModelIds: ModelId[];
  selectedCity: CityId;

  // Actions
  setRole: (role: Role) => void;
  setCity: (cityId: CityId) => void;
  setCustomerTab: (tab: CustomerViewTab) => void;
  setJourneyStep: (step: JourneyStep) => void;
  setCanvasMode: (mode: CanvasMode) => void;
  backToHall: () => void;
  proceedToTCO: (modelId?: ModelId) => void;
  setProfileModalOpen: (open: boolean, tab?: 'profile' | 'history') => void;
  updateUserProfile: (partial: Partial<UserProfile>) => void;
  openComparisonModal: (models?: ModelId[]) => void;
  closeComparisonModal: () => void;
  toggleComparisonModel: (modelId: ModelId) => void;
  toggleChat: () => void;
  toggleNotificationOpen: () => void;
  markNotificationsAsRead: () => void;
  selectModel: (modelId: ModelId, autoOpenDetail?: boolean) => void;
  updateInputs: (partial: Partial<CustomerInputs>) => void;
  toggleSlidersAccordion: () => void;
  setTestDriveModalOpen: (open: boolean) => void;
  setAdvisorAuditScreenOpen: (open: boolean) => void;
  submitTicketToAdvisor: () => void;
  approveTicket: (advisorNotes: string) => void;
  rejectTicket: (reason: string) => void;
  markTicketNeedsRecalc: (reason: string) => void;
  resetSession: () => void;
  getComputedEstimate: () => TCOEstimateResult | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  clearToast: () => void;
}

const DEFAULT_INPUTS: CustomerInputs = {
  daily_km: 30,
  loan_ratio: 0.7,
  loan_rate: 0.08,
  loan_method: 'decreasing',
  charging_facility: 'vgreen',
  resale_ratio: 0.50,
};

const INITIAL_TICKET: Ticket = {
  id: 'HS-1089',
  model_id: 'VF6',
  catalog_version: CATALOG_VERSION,
  status: 'draft',
  input_snapshot: null,
  computed_snapshot: null,
  approved_by: null,
  approved_at: null,
  advisor_notes: null,
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Biểu giá niêm yết Tháng 11/2026 đã kích hoạt',
    description: 'Chính sách ưu đãi 100% lệ phí trước bạ cho xe điện VinFast đang áp dụng tại Hà Nội.',
    timestamp: 'Hôm nay',
    type: 'info',
    read: true,
  },
];

const DEFAULT_USER_PROFILE: UserProfile = {
  fullName: 'Nguyễn Văn An',
  phone: '0912 345 678',
  email: 'an.nguyen@vinfast-customer.vn',
  address: 'Số 88 Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội',
  parkingType: 'apartment',
  dailyKm: 30,
};

export const useAppStore = create<AppStoreState>((set, get) => ({
  currentRole: 'customer',
  customerTab: 'catalog',
  journeyStep: 1,
  canvasMode: 'hall',
  isChatOpen: true,
  selectedModelId: 'VF6',
  customerInputs: DEFAULT_INPUTS,
  ticket: INITIAL_TICKET,
  notifications: INITIAL_NOTIFICATIONS,
  isNotificationOpen: false,
  isTestDriveModalOpen: false,
  isSlidersAccordionOpen: false,
  advisorAuditScreenOpen: false,
  toast: null,
  userProfile: DEFAULT_USER_PROFILE,
  isProfileModalOpen: false,
  profileActiveTab: 'history',
  isComparisonModalOpen: false,
  comparisonModelIds: [],
  selectedCity: 'national',

  setRole: (role) => set({ currentRole: role }),

  setCity: (cityId) => {
    const facility = VINFAST_FACILITIES[cityId];
    set({ selectedCity: cityId });
    get().showToast(
      cityId === 'national'
        ? 'Đã chuyển về cổng tư vấn VinFast Việt Nam (Toàn quốc).'
        : `Đã kết nối trực tiếp với ${facility.showroomName} (${facility.cityName}).`,
      'info'
    );
  },

  setCustomerTab: (tab) => set({ customerTab: tab }),

  setJourneyStep: (step) => set({ journeyStep: step }),

  setCanvasMode: (mode) => set({ canvasMode: mode }),

  backToHall: () => set({ canvasMode: 'hall', customerTab: 'catalog', journeyStep: 1 }),

  proceedToTCO: (modelId) => {
    if (modelId) {
      set({ selectedModelId: modelId });
    }
    set({ canvasMode: 'tco', journeyStep: 3 });
  },

  setProfileModalOpen: (open, tab = 'history') =>
    set({ isProfileModalOpen: open, profileActiveTab: tab }),

  updateUserProfile: (partial) =>
    set((state) => ({ userProfile: { ...state.userProfile, ...partial } })),

  openComparisonModal: (models) => {
    if (models) {
      set({ comparisonModelIds: models.slice(0, 3), isComparisonModalOpen: true });
    } else {
      set({ comparisonModelIds: [], isComparisonModalOpen: true });
    }
  },

  closeComparisonModal: () => set({ isComparisonModalOpen: false }),

  toggleComparisonModel: (modelId) => {
    const { comparisonModelIds } = get();
    if (comparisonModelIds.includes(modelId)) {
      // User can freely remove any car down to 1 or 0 without any blocking warning
      set({ comparisonModelIds: comparisonModelIds.filter((id) => id !== modelId) });
    } else {
      if (comparisonModelIds.length >= 3) {
        get().showToast('Bảng đối chiếu tối đa 3 mẫu xe cùng lúc. Bạn có thể bỏ bớt 1 xe để thêm xe khác.', 'info');
        return;
      }
      set({ comparisonModelIds: [...comparisonModelIds, modelId] });
    }
  },

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  toggleNotificationOpen: () => set((state) => ({ isNotificationOpen: !state.isNotificationOpen })),

  markNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  selectModel: (modelId, autoOpenDetail = true) => {
    const currentStep = get().journeyStep;
    // If exploring from hall, stay in step 1 (Nhu cầu & Sảnh), do not jump to step 2!
    const nextStep = get().canvasMode === 'hall' || currentStep === 1 ? 1 : Math.max(currentStep, 2);
    set({
      selectedModelId: modelId,
      customerTab: autoOpenDetail ? 'detail' : get().customerTab,
      journeyStep: nextStep as JourneyStep,
      canvasMode: autoOpenDetail ? 'detail' : get().canvasMode,
    });
    get().markTicketNeedsRecalc('Khách hàng đổi mẫu xe lựa chọn');
  },

  updateInputs: (partial) => {
    set((state) => ({
      customerInputs: { ...state.customerInputs, ...partial },
      journeyStep: Math.max(state.journeyStep, 3) as JourneyStep,
    }));
    get().markTicketNeedsRecalc('Khách hàng điều chỉnh thông số di chuyển hoặc phương án vay');
  },

  toggleSlidersAccordion: () => {
    set((state) => ({ isSlidersAccordionOpen: !state.isSlidersAccordionOpen }));
  },

  setTestDriveModalOpen: (open) => set({ isTestDriveModalOpen: open }),

  setAdvisorAuditScreenOpen: (open) => set({ advisorAuditScreenOpen: open }),

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      if (get().toast?.message === message) {
        set({ toast: null });
      }
    }, 4500);
  },

  clearToast: () => set({ toast: null }),

  submitTicketToAdvisor: () => {
    const { selectedModelId, customerInputs } = get();
    if (!selectedModelId) return;

    const car = CAR_CATALOG[selectedModelId];
    const estimate = calculateDeterministicTCO({ car, ...customerInputs });
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const newTicket: Ticket = {
      ...get().ticket,
      model_id: selectedModelId,
      catalog_version: CATALOG_VERSION,
      status: 'pending_approval',
      input_snapshot: { ...customerInputs },
      computed_snapshot: estimate,
    };

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Đã gửi dự toán ${car.display_name} (#${newTicket.id})`,
      description: 'Hồ sơ đang chờ chuyên viên Showroom VinFast Cầu Giấy tiếp nhận & thẩm định.',
      timestamp: nowTime,
      type: 'ticket',
      read: false,
      modelId: selectedModelId,
    };

    set((state) => ({
      ticket: newTicket,
      notifications: [newNotif, ...state.notifications],
      journeyStep: 1, // Reset to step 1 when returned to homepage
      canvasMode: 'hall',
      customerTab: 'catalog',
    }));

    get().showToast(
      `Đã gửi dự toán mã #${newTicket.id} tới Showroom Cầu Giấy! Hệ thống tự động trở về Sảnh chính giới thiệu xe.`,
      'success'
    );
  },

  approveTicket: (advisorNotes) => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const { selectedModelId } = get();
    const carName = selectedModelId ? CAR_CATALOG[selectedModelId].display_name : 'VinFast EV';

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Dự toán ${carName} (#HS-1089) ĐÃ ĐƯỢC PHÊ DUYỆT!`,
      description: `Tư vấn viên Lê Văn B (Showroom Cầu Giấy) đã xác nhận chính sách ưu đãi lăn bánh & gói vay lúc ${nowTime}.`,
      timestamp: nowTime,
      type: 'approval',
      read: false,
      modelId: selectedModelId || 'VF6',
    };

    set((state) => ({
      ticket: {
        ...state.ticket,
        status: 'approved',
        approved_by: 'Lê Văn B (Showroom Cầu Giấy)',
        approved_at: nowTime,
        advisor_notes: advisorNotes,
      },
      notifications: [newNotif, ...state.notifications],
      advisorAuditScreenOpen: false,
      currentRole: 'customer',
      customerTab: 'catalog',
      journeyStep: 1, // Return to homepage / Sảnh chính (Giai đoạn 1/4) so 04 Duyệt O2O is not stuck active
      canvasMode: 'hall',
    }));

    get().showToast(
      'Dự toán đã được Tư vấn viên Showroom phê duyệt thành công! Thông báo đã chuyển đến chuông của Khách hàng.',
      'success'
    );
  },

  rejectTicket: (reason) => {
    set((state) => ({
      ticket: {
        ...state.ticket,
        status: 'rejected',
        advisor_notes: `Từ chối: ${reason}`,
      },
      advisorAuditScreenOpen: false,
    }));

    get().showToast('Đã ghi nhận phản hồi từ chối hồ sơ.', 'warning');
  },

  markTicketNeedsRecalc: (reason) => {
    const { ticket } = get();
    if (ticket.status === 'pending_approval' || ticket.status === 'approved') {
      set((state) => ({
        ticket: {
          ...state.ticket,
          status: 'needs_recalculation',
        },
      }));
    }
  },

  resetSession: () => {
    set({
      currentRole: 'customer',
      customerTab: 'catalog',
      journeyStep: 1,
      canvasMode: 'hall',
      isChatOpen: true,
      selectedModelId: 'VF6',
      customerInputs: DEFAULT_INPUTS,
      ticket: INITIAL_TICKET,
      notifications: INITIAL_NOTIFICATIONS,
      isNotificationOpen: false,
      isTestDriveModalOpen: false,
      isSlidersAccordionOpen: false,
      advisorAuditScreenOpen: false,
      toast: null,
    });
    get().showToast('Đã làm mới phiên tư vấn về trạng thái ban đầu.', 'info');
  },

  getComputedEstimate: () => {
    const { selectedModelId, customerInputs } = get();
    if (!selectedModelId) return null;
    const car = CAR_CATALOG[selectedModelId];
    return calculateDeterministicTCO({ car, ...customerInputs });
  },
}));
