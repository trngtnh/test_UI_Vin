'use client';

import React, { useState, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAppStore } from '@/store/useAppStore';
import {
  CAR_CATALOG,
  CATALOG_EFFECTIVE_DATE,
  VINFAST_FACILITIES,
  getCarModelWithVariant,
  formatShortTrimLabel,
  ALL_VINFAST_VARIANTS,
  VARIANTS_BY_ID,
  UnifiedCarVariant,
} from '@/lib/catalog';
import { ModelId } from '@/types';
import { UrbanChargingWidget } from './UrbanChargingWidget';
import { TCOEstimateCard } from '@/components/customer/TCOEstimateCard';
import { TicketStatusBanners } from '@/components/customer/TicketStatusBanners';
import { CarDetailModal } from '@/components/customer/CarDetailModal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { CarVisualSilhouette } from '@/components/common/CarVisualSilhouette';
import {
  ArrowLeft,
  RotateCcw,
  Info,
  Search,
  X,
  Scale,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

export const LivingCanvasPane: React.FC = () => {
  const selectedModelId = useAppStore((state) => state.selectedModelId) || 'VF6';
  const selectModel = useAppStore((state) => state.selectModel);
  const canvasMode = useAppStore((state) => state.canvasMode);
  const setCanvasMode = useAppStore((state) => state.setCanvasMode);
  const setJourneyStep = useAppStore((state) => state.setJourneyStep);
  const backToHall = useAppStore((state) => state.backToHall);
  const proceedToTCO = useAppStore((state) => state.proceedToTCO);
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);
  const openComparisonModal = useAppStore((state) => state.openComparisonModal);
  const selectedCity = useAppStore((state) => state.selectedCity) || 'national';
  const selectedVariantIds = useAppStore((state) => state.selectedVariantIds);
  const selectVariant = useAppStore((state) => state.selectVariant);

  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;
  const car = getCarModelWithVariant(selectedModelId, selectedVariantIds?.[selectedModelId]);
  const allCoreModels: ModelId[] = ['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9'];

  // Detail View State
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Multi-Filter & Search State for 27-Vehicle Lineup
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'passenger' | 'commercial'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under500' | '500to700' | '700to1000' | 'over1000'>('all');
  const [seatFilter, setSeatFilter] = useState<'all' | '2to4' | '5' | '7plus'>('all');
  const [viewLayout, setViewLayout] = useState<'byModel' | 'allVariants'>('byModel');

  // Pop-up Detail Modal State
  const [detailModalModelId, setDetailModalModelId] = useState<ModelId | string | null>(null);
  const [detailModalVariantId, setDetailModalVariantId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenCarDetail = (mId: ModelId | string, vId?: string) => {
    setDetailModalModelId(mId);
    setDetailModalVariantId(vId || null);
    setIsDetailModalOpen(true);
  };

  const currentColor = car?.colors[selectedColorIndex] || car?.colors[0] || { name: 'Trắng', hex: '#fff' };

  // Filter the full 27-vehicle catalog
  const filteredVariants = useMemo(() => {
    return ALL_VINFAST_VARIANTS.filter((v) => {
      // 1. Category Filter
      if (categoryFilter !== 'all' && v.category !== categoryFilter) {
        return false;
      }
      // 2. Price Filter
      if (priceFilter === 'under500' && v.price >= 500000000) return false;
      if (priceFilter === '500to700' && (v.price < 500000000 || v.price > 700000000)) return false;
      if (priceFilter === '700to1000' && (v.price < 700000000 || v.price > 1000000000)) return false;
      if (priceFilter === 'over1000' && v.price <= 1000000000) return false;

      // 3. Seat Filter
      if (seatFilter === '2to4' && v.seats_count > 4) return false;
      if (seatFilter === '5' && v.seats_count !== 5) return false;
      if (seatFilter === '7plus' && v.seats_count < 7) return false;

      // 4. Free-text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const text = `${v.display_name} ${v.version_name} ${v.model_name} ${v.badge} ${v.features_highlight || ''} ${v.adas} ${v.seats} ${v.drivetrain || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [categoryFilter, priceFilter, seatFilter, searchQuery]);

  // Grouped by model for 'byModel' view
  const groupedModelIds = useMemo(() => {
    const set = new Set<string>();
    filteredVariants.forEach((v) => set.add(v.model_id));
    return Array.from(set);
  }, [filteredVariants]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || priceFilter !== 'all' || seatFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setPriceFilter('all');
    setSeatFilter('all');
  };

  const hallCardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (canvasMode === 'hall') {
        gsap.from('.hall-car-card', {
          opacity: 0,
          y: 10,
          duration: 0.22,
          stagger: 0.02,
          ease: 'power2.out',
          clearProps: 'all',
        });
      }
    },
    { scope: hallCardsRef, dependencies: [categoryFilter, priceFilter, seatFilter, searchQuery, viewLayout, canvasMode] }
  );

  /** Shared top studio banner for showcase cards with single-line non-wrapping badges. */
  const renderCardTopBanner = (item: UnifiedCarVariant, silhouetteModelId: string, heightClass: string) => (
    <div className="p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-slate-900/40 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <Badge variant="dark" dot pulseDot className="truncate max-w-[175px]">
          {item.badge}
        </Badge>
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${
            item.category === 'passenger'
              ? 'bg-slate-800/90 text-slate-200 border-slate-700'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800/70'
          }`}
        >
          {item.seats.replace(' ngồi', '')}
        </span>
      </div>

      <div className={`${heightClass} flex items-center justify-center p-1 relative z-10 overflow-hidden`}>
        <CarVisualSilhouette modelId={silhouetteModelId} className={`w-full h-full max-${heightClass}`} />
      </div>
    </div>
  );

  /** Shared 2-button footer for outer showcase cards: Detail preview vs TCO conversion (comparison lives in dedicated modal). */
  const renderHallCardActions = (detailModelId: string, item: UnifiedCarVariant) => {
    return (
      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenCarDetail(detailModelId, item.id)}
          className="shrink-0 px-3"
          title="Xem chi tiết thông số kỹ thuật"
        >
          Chi tiết
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            const targetModel = detailModelId as ModelId;
            selectModel(targetModel, false);
            selectVariant(targetModel, item.id);
            proceedToTCO(targetModel);
          }}
          className="flex-1 bg-brand-blue hover:bg-blue-600 shadow-2xs font-extrabold text-xs whitespace-nowrap"
          title="Dự toán chi phí & Tính TCO"
        >
          Tính TCO ➔
        </Button>
      </div>
    );
  };

  /** Interactive 3-stage breadcrumb navigation for inner customer decision screens. */
  const renderSubViewStepper = (activeStage: 'recommendations' | 'tco') => (
    <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200/90 shadow-2xs gap-1 text-xs">
      <button
        type="button"
        onClick={backToHall}
        className="px-2.5 py-1 rounded-lg font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 whitespace-nowrap"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>1. Sảnh xe (27 bản)</span>
      </button>
      <span className="text-slate-300 select-none">/</span>
      <button
        type="button"
        onClick={() => {
          setCanvasMode('recommendations');
          setJourneyStep(2);
        }}
        className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
          activeStage === 'recommendations'
            ? 'bg-brand-blue text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        2. Đánh giá phương án
      </button>
      <span className="text-slate-300 select-none">/</span>
      <button
        type="button"
        onClick={() => proceedToTCO(selectedModelId)}
        className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
          activeStage === 'tco'
            ? 'bg-brand-blue text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        3. Dự toán TCO 5 năm
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden relative">
      {/* =========================================================================
          VIEW 1: SẢNH CHÍNH GIỚI THIỆU XE VINFAST (SHOWROOM HALL) - DEFAULT ON LOAD
          ========================================================================= */}
      {canvasMode === 'hall' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Hall Header Strip */}
          <div className="h-12 px-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                {selectedCity === 'national'
                  ? 'Dải Xe Điện VinFast Toàn Cầu'
                  : `Dải Xe Điện VinFast · ${currentFacility.cityName}`}
              </h2>
              <span className="text-[10px] font-bold text-brand-blue bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 tabular-nums">
                {hasActiveFilters ? `${filteredVariants.length} / 27 bản` : '27 Phiên bản'}
              </span>
            </div>

            {/* Right Controls: View Layout Switcher & Dedicated Comparison Pop-up */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:inline-flex p-0.5 bg-slate-200/80 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewLayout('byModel')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    viewLayout === 'byModel'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Gộp theo 15 dòng xe kèm nút chuyển phiên bản bên trong"
                >
                  Theo dòng xe
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('allVariants')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    viewLayout === 'allVariants'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Hiển thị tách rời toàn bộ 27 phiên bản"
                >
                  Tách 27 bản
                </button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => openComparisonModal([], 'picker')}
                title="Mở bảng so sánh 2 đến 3 mẫu xe VinFast"
              >
                So sánh các dòng xe
              </Button>
            </div>
          </div>

          {/* Hall Body: Scrollable Car Cards & Compact Single-Row Filter Bar */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <TicketStatusBanners />
            
            {/* SINGLE-ROW UNIFIED FILTER BAR (Search + 3 Logical Dropdowns) */}
            <div className="p-2.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-2">
              {/* Search Box with Clear Button */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm tên xe, phiên bản, tính năng (VD: VF 7, Plus, AWD...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 min-h-[34px] rounded-xl border border-slate-200/90 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdown 1: Loại xe (Category) */}
              <CustomSelect<'all' | 'passenger' | 'commercial'>
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                options={[
                  { value: 'all', label: 'Loại xe: Tất cả', badge: '27 bản' },
                  { value: 'passenger', label: 'Xe Du lịch', badge: '17 bản' },
                  { value: 'commercial', label: 'Xe Thương mại', badge: '10 bản' },
                ]}
                size="sm"
                className="w-full sm:w-[156px]"
                triggerClassName="min-h-[34px] rounded-xl"
                dropdownClassName="w-52"
                aria-label="Lọc theo phân류 loại xe"
              />

              {/* Dropdown 2: Tầm giá (Price) */}
              <CustomSelect<'all' | 'under500' | '500to700' | '700to1000' | 'over1000'>
                value={priceFilter}
                onChange={(val) => setPriceFilter(val)}
                options={[
                  { value: 'all', label: 'Mức giá: Tất cả' },
                  { value: 'under500', label: 'Giá: Dưới 500 triệu' },
                  { value: '500to700', label: 'Giá: 500 - 700 triệu' },
                  { value: '700to1000', label: 'Giá: 700 tr - 1 tỷ' },
                  { value: 'over1000', label: 'Giá: Trên 1 tỷ' },
                ]}
                size="sm"
                className="w-[calc(50%-4px)] sm:w-[152px]"
                triggerClassName="min-h-[34px] rounded-xl"
                dropdownClassName="w-48"
                aria-label="Lọc theo khoảng giá"
              />

              {/* Dropdown 3: Số chỗ (Seats) */}
              <CustomSelect<'all' | '2to4' | '5' | '7plus'>
                value={seatFilter}
                onChange={(val) => setSeatFilter(val)}
                options={[
                  { value: 'all', label: 'Số chỗ: Tất cả' },
                  { value: '2to4', label: 'Chỗ: 2 - 4 chỗ' },
                  { value: '5', label: 'Chỗ: 5 chỗ' },
                  { value: '7plus', label: 'Chỗ: 7 chỗ & Buýt' },
                ]}
                size="sm"
                className="w-[calc(50%-4px)] sm:w-[144px]"
                triggerClassName="min-h-[34px] rounded-xl"
                dropdownClassName="w-48"
                align="right"
                aria-label="Lọc theo số chỗ ngồi"
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-2.5 py-1.5 min-h-[34px] rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-[11px] font-bold text-slate-600 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer shadow-2xs shrink-0"
                  title="Đặt lại toàn bộ bộ lọc"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>

            {/* EMPTY STATE */}
            {filteredVariants.length === 0 && (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">
                  Không tìm thấy phiên bản xe phù hợp với bộ lọc
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy thử gõ từ khóa khác (ví dụ: &quot;VF 7&quot;, &quot;Plus&quot;, &quot;Eco&quot;, &quot;Van&quot;) hoặc đặt lại bộ lọc để xem toàn bộ 27 phiên bản xe VinFast.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters} icon={<RotateCcw className="w-3.5 h-3.5" />}>
                  Đặt lại tất cả bộ lọc
                </Button>
              </div>
            )}

            {/* LAYOUT 1: ALL 27 VARIANTS GRID (MỖI PHIÊN BẢN LÀ 1 THẺ ĐỘC LẬP) */}
            {viewLayout === 'allVariants' && filteredVariants.length > 0 && (
              <div ref={hallCardsRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVariants.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="hall-car-card rounded-2xl border border-slate-200/90 bg-white hover:border-brand-blue/60 hover:shadow-lg transition-[border-color,box-shadow] duration-150 ease-out flex flex-col justify-between overflow-hidden group h-full shadow-xs"
                    >
                      {renderCardTopBanner(item, item.model_id, 'h-28')}

                      {/* Middle Info Body */}
                      <div key={`variant-body-${item.id}`} className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white animate-in fade-in duration-200">
                        {/* Title & Version */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {item.model_name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {item.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1">
                            {item.display_name}
                          </h3>

                          {/* Price & Savings Badge (Zero line-wrapping) */}
                          <div className="flex items-baseline justify-between gap-1 flex-wrap pt-0.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-brand-blue tabular-nums whitespace-nowrap">
                                {item.price.toLocaleString('vi-VN')}&nbsp;đ
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">(kèm pin)</span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                              Tiết kiệm ~{Math.round(item.price * 0.1 / 1000000)}&nbsp;tr trước&nbsp;bạ
                            </span>
                          </div>
                        </div>

                        {/* Bento Metric Tiles (Baoyu Visual Chunking) */}
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                            <span className="text-[10px] font-semibold text-slate-400">Tầm chạy NEDC</span>
                            <span className="text-xs font-black text-slate-900 tabular-nums mt-0.5">
                              {item.range_nedc} <span className="text-[10px] font-bold text-slate-400">km</span>
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                            <span className="text-[10px] font-semibold text-slate-400">Dung lượng Pin</span>
                            <span className="text-xs font-black text-slate-900 tabular-nums mt-0.5">
                              {item.battery_kwh} <span className="text-[10px] font-bold text-slate-400">kWh</span>
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                            <span className="text-[10px] font-semibold text-slate-400">Công suất động cơ</span>
                            <span className="text-xs font-black text-slate-900 tabular-nums mt-0.5 truncate" title={item.motor_power}>
                              {item.motor_power.split('(')[0].trim()}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                            <span className="text-[10px] font-semibold text-slate-400">Sạc nhanh 10-70%</span>
                            <span className="text-xs font-black text-slate-900 tabular-nums mt-0.5 truncate" title={item.charging_time}>
                              {item.charging_time.replace('trong ', '')}
                            </span>
                          </div>
                        </div>

                        {/* Reason / Highlight Note */}
                        <div
                          title={item.features_highlight || item.reason_budget}
                          className="min-h-[40px] h-[40px] flex items-center bg-blue-50/60 p-2 rounded-xl border border-blue-100/80 leading-relaxed text-[11px] text-slate-700 overflow-hidden shadow-2xs"
                        >
                          <p className="line-clamp-2">
                            <strong>{item.version_name}:</strong> {item.features_highlight || item.reason_budget}
                          </p>
                        </div>

                        {renderHallCardActions(item.model_id, item)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LAYOUT 2: GROUPED BY MODEL (15 DÒNG XE CỐT LÕI VỚI TRIM SWITCHER BÊN TRONG) */}
            {viewLayout === 'byModel' && groupedModelIds.length > 0 && (
              <div ref={hallCardsRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedModelIds.map((mId) => {
                  const modelVariants = ALL_VINFAST_VARIANTS.filter((v) => v.model_id === mId);
                  const activeVarId = selectedVariantIds?.[mId as ModelId] || modelVariants[0]?.id;
                  const item = VARIANTS_BY_ID[activeVarId] || modelVariants[0];
                  if (!item) return null;

                  return (
                    <div
                      key={mId}
                      className="hall-car-card rounded-2xl border border-slate-200/90 bg-white hover:border-brand-blue/60 hover:shadow-lg transition-[border-color,box-shadow] duration-150 ease-out flex flex-col justify-between overflow-hidden group h-full shadow-xs"
                    >
                      {renderCardTopBanner(item, mId, 'h-32')}

                      {/* Middle Info Body */}
                      <div key={`variant-body-${item.id}`} className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white animate-in fade-in duration-200">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1">
                              {item.model_name}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {modelVariants.length} phiên bản
                            </span>
                          </div>

                          {/* Interactive Trim / Variant Selector (Tesla UX) */}
                          {modelVariants.length > 1 && (
                            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
                              {modelVariants.map((v) => {
                                const isCurrent = activeVarId === v.id;
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectVariant(mId, v.id);
                                    }}
                                    className={`flex-1 py-1.5 px-1 rounded-md text-[10px] font-bold transition-all text-center truncate cursor-pointer flex items-center justify-center ${
                                      isCurrent
                                        ? 'bg-white text-brand-blue shadow-2xs font-extrabold ring-1 ring-blue-200'
                                        : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                    title={`${v.version_name} · ${v.price.toLocaleString('vi-VN')} đ`}
                                  >
                                    <span>{formatShortTrimLabel(v.version_name)}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-0.5">
                            <span className="truncate">{item.version_name}</span>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">{item.status}</span>
                          </div>

                          <div className="flex items-baseline justify-between gap-1 flex-wrap pt-0.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-brand-blue tabular-nums whitespace-nowrap">
                                {item.price.toLocaleString('vi-VN')}&nbsp;đ
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">(kèm pin)</span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                              Tiết kiệm ~{Math.round(item.price * 0.1 / 1000000)}&nbsp;tr trước&nbsp;bạ
                            </span>
                          </div>
                        </div>

                        {/* Bento Metric Tiles (Baoyu Visual Chunking) */}
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                            <span className="text-[10px] font-semibold text-slate-400">Tầm chạy NEDC</span>
                            <span className="text-xs font-black text-slate-900 tabular-nums mt-0.5">
                              {item.range_nedc} <span className="text-[10px] font-bold text-slate-400">km</span>
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                            <span className="text-[10px] font-semibold text-slate-400">Dung lượng Pin</span>
                            <span className="text-xs font-black text-slate-900 tabular-nums mt-0.5">
                              {item.battery_kwh} <span className="text-[10px] font-bold text-slate-400">kWh</span>
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                            <span className="text-[10px] font-semibold text-slate-400">Sạc nhanh 10-70%</span>
                            <span className="text-xs font-black text-slate-900 tabular-nums mt-0.5 truncate" title={item.charging_time}>
                              {item.charging_time.replace('trong ', '')}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                            <span className="text-[10px] font-semibold text-slate-400">Bảo hành chính hãng</span>
                            <span className="text-xs font-black text-slate-900 tabular-nums mt-0.5 truncate">
                              {item.warranty_years ? item.warranty_years.split(' hoặc ')[0] : '7 năm'}
                            </span>
                          </div>
                        </div>

                        {/* Reason note */}
                        <div
                          title={item.reason_budget}
                          className="min-h-[44px] h-[44px] flex items-center bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/80 leading-relaxed text-[11px] text-slate-700 overflow-hidden shadow-2xs"
                        >
                          <p className="line-clamp-2">{item.reason_budget}</p>
                        </div>

                        {renderHallCardActions(mId, item)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

{/* =========================================================================
          VIEW 2: CHI TIẾT XE ĐƠN LẺ ĐƯỢC CHỌN (DETAIL STAGE - CLEAN STATIC)
          ========================================================================= */}
      {canvasMode === 'detail' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Bar with Back to Hall Button & Model Tabs */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={backToHall}
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Quay lại Sảnh chính
            </Button>

            {/* Model Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
              {allCoreModels.map((mId) => {
                const m = CAR_CATALOG[mId];
                const isActive = mId === selectedModelId;
                return (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => {
                      selectModel(mId, true);
                      setSelectedColorIndex(0);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 shrink-0 active:scale-[0.98] ${
                      isActive
                        ? 'bg-brand-blue text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{m.display_name.replace('VinFast ', '')}</span>
                    <span className={`text-[10px] tabular-nums ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      ~{Math.round(m.price / 1000000)} tr
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Vehicle Hero Stage */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border border-slate-200/90 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Left: Official Static Photo Container & Color Swatches */}
                <div className="md:col-span-6 space-y-3">
                  <div className="relative h-64 sm:h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-6 flex items-center justify-center border border-slate-800 shadow-md overflow-hidden group">
                    <CarVisualSilhouette modelId={selectedModelId} colorHex={currentColor.hex} className="w-full h-full max-h-56" />
                  </div>

                  {/* Exterior Paint Swatches */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[11px] font-medium text-slate-700 flex items-center gap-2">
                      <span>Màu sơn ngoại thất:</span>
                      <strong className="text-slate-900 font-bold">{currentColor.name}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {car.colors.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColorIndex(idx)}
                          title={c.name}
                          className={`w-6 h-6 rounded-full border transition-all duration-150 cursor-pointer ${
                            selectedColorIndex === idx
                              ? 'scale-125 shadow-md ring-2 ring-brand-blue border-white ring-offset-1'
                              : 'border-slate-300 hover:scale-110 opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Personalized Reasoning */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Biểu giá Niêm yết Chính hãng · Áp dụng {CATALOG_EFFECTIVE_DATE}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {car.display_name}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-brand-blue tabular-nums whitespace-nowrap">
                        {car.price.toLocaleString('vi-VN')}&nbsp;đ
                      </span>
                      <span className="text-[11px] text-slate-500 whitespace-nowrap">(kèm Pin & Sạc)</span>
                    </div>
                  </div>

                  {/* 2 AI Reasons */}
                  <div className="space-y-2 text-xs text-slate-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/90">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed">
                        <strong className="text-slate-900">Tài chính:</strong> {car.reason_budget}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed">
                        <strong className="text-slate-900">Vận hành:</strong> {car.reason_charging}
                      </p>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Kích thước (DxRxC)</span>
                      <strong className="text-slate-800 text-[11px]">{car.dimensions}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Động cơ & Công suất</span>
                      <strong className="text-slate-800 text-[11px]">{car.motor_power}</strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setTestDriveModalOpen(true)}
                    >
                      Lái thử
                    </Button>

                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => openComparisonModal([selectedModelId])}
                    >
                      So sánh
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => proceedToTCO(selectedModelId)}
                    >
                      Chọn xe này & Tính TCO ➔
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Urban Charging Preview */}
            <UrbanChargingWidget />
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: XE ĐỀ XUẤT TỪ AI AGENT (RECOMMENDATIONS & COMPARISON)
          ========================================================================= */}
      {canvasMode === 'recommendations' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Bar */}
          <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2 shrink-0">
            {renderSubViewStepper('recommendations')}

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openComparisonModal([selectedModelId])}
              >
                So sánh dòng xe
              </Button>
            </div>
          </div>

          {/* Recommendations Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Primary Matched Car Showcase */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 border-2 border-brand-accent shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="dark" dot pulseDot>
                  MẪU XE KHỚP NHẤT VỚI NHU CẦU
                </Badge>
                <span className="text-xs font-bold text-slate-500">
                  {car.badge} · {car.seats}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Left Info */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{car.display_name}</h3>
                    <div className="text-2xl font-black text-brand-blue tabular-nums mt-0.5 whitespace-nowrap">
                      {car.price.toLocaleString('vi-VN')}&nbsp;đ
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white/95 p-3 rounded-xl border border-blue-100 shadow-2xs">
                    <strong className="text-slate-900">Đánh giá của AI:</strong> {car.reason_budget} {car.reason_charging}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Tầm chạy an toàn (85% DoD)</span>
                      <strong className="text-emerald-700">{Math.round(car.range_real * 0.85)} km / lần sạc</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Sạc nhanh 10-70%</span>
                      <strong className="text-slate-800">{car.charging_time}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Static Photo & Details Action */}
                <div className="md:col-span-6 flex flex-col items-center justify-center space-y-2">
                  <div className="w-full h-48 sm:h-52 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 flex items-center justify-center border border-slate-800 shadow-md overflow-hidden group">
                    <CarVisualSilhouette modelId={selectedModelId} colorHex={currentColor.hex} className="w-full h-full max-h-40" />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleOpenCarDetail(selectedModelId)}
                  >
                    Xem chi tiết thông số kỹ thuật xe
                  </Button>
                </div>
              </div>

              {/* Main Recommendation CTA */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => proceedToTCO(selectedModelId)}
              >
                Chốt chọn mẫu xe này & Tính toán TCO 5 năm ➔
              </Button>
            </div>

            {/* Other 2 Models to Compare */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2.5">
                Hoặc xem xét thêm 2 lựa chọn đối chiếu cùng phân khúc:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  selectedModelId === 'VF3' ? ['VF5', 'VF6'] :
                  selectedModelId === 'VF5' ? ['VF3', 'VF6'] :
                  selectedModelId === 'VF6' ? ['VF5', 'VF7'] :
                  selectedModelId === 'VF7' ? ['VF6', 'VF8'] :
                  selectedModelId === 'VF8' ? ['VF7', 'VF9'] :
                  ['VF7', 'VF8']
                ).map((otherId) => {
                  const otherCar = CAR_CATALOG[otherId as ModelId];
                  if (!otherCar) return null;
                  return (
                    <div
                      key={otherId}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="brand">{otherCar.badge}</Badge>
                          <span className="text-[10px] text-slate-400 font-medium">{otherCar.seats}</span>
                        </div>

                        <div className="relative group/tooltip">
                          <button
                            type="button"
                            className="p-1 rounded-full text-slate-400 hover:text-brand-blue hover:bg-blue-50 transition"
                            aria-label="Lý do đối chiếu"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-30 pointer-events-none animate-in fade-in duration-150 leading-relaxed">
                            <p className="font-bold text-blue-300 mb-1">Lý do đối chiếu:</p>
                            <p>{otherCar.reason_budget}</p>
                            <p className="mt-1 text-slate-300">{otherCar.reason_charging}</p>
                          </div>
                        </div>
                      </div>

                      {/* Official Vehicle Image */}
                      <div className="h-28 flex items-center justify-center bg-slate-950 rounded-xl p-1 border border-slate-800 overflow-hidden">
                        <CarVisualSilhouette modelId={otherId as ModelId} className="w-full h-full max-h-24" />
                      </div>

                      <div className="flex items-baseline justify-between">
                        <h5 className="text-xs font-bold text-slate-900">{otherCar.display_name}</h5>
                        <span className="text-xs font-extrabold text-brand-blue tabular-nums whitespace-nowrap">
                          {otherCar.price.toLocaleString('vi-VN')}&nbsp;đ
                        </span>
                      </div>

                      {/* Triple Buttons */}
                      <div className="pt-1.5 grid grid-cols-3 gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          fullWidth
                          onClick={() => handleOpenCarDetail(otherId as ModelId)}
                        >
                          Chi tiết
                        </Button>
                        <Button
                          variant="secondary"
                          size="xs"
                          fullWidth
                          onClick={() => openComparisonModal([selectedModelId, otherId as ModelId])}
                        >
                          So sánh
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          fullWidth
                          onClick={() => proceedToTCO(otherId as ModelId)}
                        >
                          Chọn TCO
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: BẢNG TÍNH TOÁN TCO & CHI PHÍ NUÔI XE 5 NĂM (TCO WORKBENCH)
          ========================================================================= */}
      {canvasMode === 'tco' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Bar with 3-Stage Stepper & Active Vehicle Info */}
          <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2 shrink-0">
            {renderSubViewStepper('tco')}

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 hidden xl:inline">
                Đang tính: <strong className="text-slate-900 font-bold">{car.display_name}</strong>
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openComparisonModal([selectedModelId])}
              >
                So sánh dòng xe
              </Button>
            </div>
          </div>

          {/* TCO Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <TicketStatusBanners />
            <UrbanChargingWidget />
            <TCOEstimateCard
              onOpenCarDetail={() =>
                handleOpenCarDetail(selectedModelId, selectedVariantIds?.[selectedModelId])
              }
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: MA TRẬN TRỌNG TÀI ĐỐI ĐẦU 3 MẪU XE (AI ARBITER)
          ========================================================================= */}
      {canvasMode === 'arbiter' && (
        <div className="flex flex-col h-full overflow-hidden items-center justify-center p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center shadow-2xs border border-blue-100">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Bảng So sánh Đa mẫu xe VinFast</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Hệ thống hỗ trợ đối chiếu chi tiết 2 hoặc 3 mẫu xe trong bảng so sánh pop-up tương tác.
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <Button
              variant="primary"
              size="md"
              onClick={() => openComparisonModal(['VF5', 'VF6', 'VF7'])}
            >
              Mở bảng so sánh pop-up ➔
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={backToHall}
            >
              Về Sảnh chính
            </Button>
          </div>
        </div>
      )}

      {/* Universal Car Detail Pop-up Modal */}
      <CarDetailModal
        modelId={detailModalModelId}
        variantId={detailModalVariantId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onVariantChange={(vId) => setDetailModalVariantId(vId)}
        onSelectAndProceed={(mId) => {
          setIsDetailModalOpen(false);
          proceedToTCO(mId);
        }}
      />
    </div>
  );
};
