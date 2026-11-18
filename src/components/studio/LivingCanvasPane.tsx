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
  ALL_VINFAST_VARIANTS,
  VARIANTS_BY_ID,
  UnifiedCarVariant,
} from '@/lib/catalog';
import { ModelId } from '@/types';
import { UrbanChargingWidget } from './UrbanChargingWidget';
import { DynamicArbiterWidget } from './DynamicArbiterWidget';
import { TCOEstimateCard } from '@/components/customer/TCOEstimateCard';
import { CarDetailModal } from '@/components/customer/CarDetailModal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CarVisualSilhouette } from '@/components/common/CarVisualSilhouette';
import {
  CheckCircle2,
  Zap,
  Layers,
  FileText,
  ShieldCheck,
  Gauge,
  ArrowRight,
  ArrowLeft,
  BatteryCharging,
  Clock,
  Sparkles,
  Calendar,
  Send,
  Sliders,
  Check,
  Scale,
  Car,
  RotateCcw,
  Info,
  Search,
  SlidersHorizontal,
  X,
  Filter,
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
  const comparisonVariantIds = useAppStore((state) => state.comparisonVariantIds) || [];
  const toggleComparisonVariant = useAppStore((state) => state.toggleComparisonVariant);

  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;
  const car = CAR_CATALOG[selectedModelId] || CAR_CATALOG.VF6;
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

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden relative">
      {/* =========================================================================
          VIEW 1: SẢNH CHÍNH GIỚI THIỆU XE VINFAST (SHOWROOM HALL) - DEFAULT ON LOAD
          ========================================================================= */}
      {canvasMode === 'hall' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Hall Header Strip */}
          <div className="h-12 px-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                {selectedCity === 'national'
                  ? 'Dải 27 Phiên Bản Xe Điện VinFast Toàn Cầu'
                  : `Dải 27 Xe Điện VinFast · ${currentFacility.cityName}`}
              </h2>
              <span className="text-[10px] font-bold text-brand-blue bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                27 Phiên bản
              </span>
            </div>

            {/* Quick Actions: Open Comparison Pop-up */}
            <div className="flex items-center gap-2">
              <Button
                variant={comparisonVariantIds.length >= 2 ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => openComparisonModal(comparisonVariantIds, comparisonVariantIds.length >= 2 ? 'table' : 'picker')}
                icon={<Scale className="w-3.5 h-3.5" />}
              >
                {comparisonVariantIds.length >= 2
                  ? `So sánh ngay (${comparisonVariantIds.length} xe)`
                  : comparisonVariantIds.length === 1
                  ? 'So sánh (1 xe đã chọn)'
                  : 'So sánh các dòng xe'}
              </Button>
            </div>
          </div>

          {/* TOP STICKY BAR IN HALL: Selected car labels */}
          {comparisonVariantIds.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 shrink-0 shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                  <span>Xe đang chọn ({comparisonVariantIds.length}/3):</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {comparisonVariantIds.map((vId) => {
                    const item = VARIANTS_BY_ID[vId];
                    if (!item) return null;
                    return (
                      <span
                        key={vId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-brand-blue text-white shadow-2xs border border-blue-400/30 animate-in zoom-in-95 duration-150"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{item.display_name}</span>
                        <span className="text-[10px] text-blue-200 tabular-nums">
                          ({(item.price / 1000000).toLocaleString('vi-VN')} tr)
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleComparisonVariant(vId)}
                          className="text-blue-200 hover:text-white ml-0.5 p-0.5 rounded cursor-pointer"
                          title="Bỏ chọn xe này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    [...comparisonVariantIds].forEach((id) => toggleComparisonVariant(id));
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 font-semibold px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Bỏ chọn tất cả
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openComparisonModal(comparisonVariantIds, comparisonVariantIds.length >= 2 ? 'table' : 'picker')}
                  icon={<Scale className="w-3.5 h-3.5" />}
                  className="text-xs h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-sm"
                >
                  {comparisonVariantIds.length >= 2 ? `So sánh ngay (${comparisonVariantIds.length} xe) ➔` : 'Mở bảng chọn đối chiếu'}
                </Button>
              </div>
            </div>
          )}

          {/* Hall Body: Scrollable Car Cards & Multi-Filter Console */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* MULTI-FILTER & SEARCH CONSOLE (OriginUI High-Density Architecture) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-2xs space-y-3">
              {/* Row 1: Search Bar & Primary Category Tabs */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
                {/* Search Box with Clear Button */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên xe, phiên bản, tính năng... (VD: VF 7, Plus, Eco, Van, 7 chỗ, AWD, trần kính)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Primary Category Switcher (Tất cả 27 xe, Du lịch 17 xe, Thương mại 10 xe) */}
                <div className="inline-flex p-1 bg-slate-200/80 rounded-xl gap-1 shrink-0 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      categoryFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả (27 xe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('passenger')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      categoryFilter === 'passenger'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🚗 Xe Du lịch (17 bản)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('commercial')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      categoryFilter === 'commercial'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🚐 Xe Thương mại (10 bản)
                  </button>
                </div>
              </div>

              {/* Row 2: Secondary Price & Seat Filters + Layout View Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                {/* Price & Seat Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Price Segment */}
                  <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold px-2">Giá:</span>
                    <button
                      type="button"
                      onClick={() => setPriceFilter('all')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        priceFilter === 'all' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceFilter('under500')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        priceFilter === 'under500' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      &lt; 500 tr
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceFilter('500to700')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        priceFilter === '500to700' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      500 - 700 tr
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceFilter('700to1000')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        priceFilter === '700to1000' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      700 tr - 1 tỷ
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceFilter('over1000')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        priceFilter === 'over1000' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      &gt; 1 tỷ
                    </button>
                  </div>

                  {/* Seat Filter */}
                  <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold px-2">Chỗ:</span>
                    <button
                      type="button"
                      onClick={() => setSeatFilter('all')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        seatFilter === 'all' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeatFilter('2to4')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        seatFilter === '2to4' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      2 - 4 chỗ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeatFilter('5')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        seatFilter === '5' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      5 chỗ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeatFilter('7plus')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        seatFilter === '7plus' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      7 chỗ & Buýt
                    </button>
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[10px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Đặt lại</span>
                    </button>
                  )}
                </div>

                {/* View Mode Toggle: All 27 Variants vs Grouped by Model */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-bold">
                    Hiển thị <span className="text-brand-blue font-extrabold">{filteredVariants.length}</span> / 27 phiên bản
                  </span>

                  <div className="inline-flex p-0.5 bg-slate-200/80 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setViewLayout('byModel')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        viewLayout === 'byModel'
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Nhóm theo dòng xe kèm nút chọn phiên bản bên trong (Phong cách Tesla)"
                    >
                      Dòng xe & Phiên bản
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewLayout('allVariants')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        viewLayout === 'allVariants'
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Hiển thị độc lập từng phiên bản xe"
                    >
                      Toàn bộ 27 bản
                    </button>
                  </div>
                </div>
              </div>
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
              <div ref={hallCardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVariants.map((item) => {
                  const isCompared = comparisonVariantIds.includes(item.id);
                  const isCoreModel = allCoreModels.includes(item.model_id as ModelId);

                  return (
                    <div
                      key={item.id}
                      className={`hall-car-card rounded-2xl border bg-white transition-[border-color,box-shadow] duration-150 ease-out flex flex-col justify-between overflow-hidden group h-full shadow-xs ${
                        isCompared ? 'border-brand-blue ring-2 ring-blue-100' : 'border-slate-200/90 hover:border-brand-blue/60 hover:shadow-lg'
                      }`}
                    >
                      {/* Top Image & Badge with Dark Luxury Lighting */}
                      <div className="p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2 relative z-10">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="dark" dot pulseDot>
                              {item.badge}
                            </Badge>
                            <span className="text-[10px] font-semibold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700">
                              {item.seats}
                            </span>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                            item.category === 'passenger'
                              ? 'bg-blue-900/60 text-blue-200 border-blue-700/60'
                              : 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60'
                          }`}>
                            {item.category_name}
                          </span>
                        </div>

                        {/* Silhouette Preview */}
                        <div className="h-28 flex items-center justify-center p-1 relative z-10 overflow-hidden">
                          <CarVisualSilhouette modelId={item.model_id} className="w-full h-full max-h-28" />
                        </div>
                      </div>

                      {/* Middle Info Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
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

                        {/* Specs Matrix */}
                        <div className="grid grid-cols-2 gap-px bg-slate-200/80 rounded-xl overflow-hidden border border-slate-200/90 text-[10px]">
                          <div className="bg-slate-50/90 px-2.5 py-1.5 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Tầm chạy:</span>
                            <span className="font-bold text-slate-800">{item.range_nedc} km</span>
                          </div>
                          <div className="bg-slate-50/90 px-2.5 py-1.5 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Pin:</span>
                            <span className="font-bold text-slate-800">{item.battery_kwh} kWh</span>
                          </div>
                          <div className="bg-slate-50/90 px-2.5 py-1.5 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Công suất:</span>
                            <span className="font-bold text-slate-800 truncate" title={item.motor_power}>
                              {item.motor_power.split('(')[0]}
                            </span>
                          </div>
                          <div className="bg-slate-50/90 px-2.5 py-1.5 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Sạc nhanh:</span>
                            <span className="font-bold text-slate-800">{item.charging_time.replace('trong ', '')}</span>
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

                        {/* Action Buttons */}
                        <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            onClick={() => handleOpenCarDetail(item.model_id, item.id)}
                            title="Xem chi tiết thông số kỹ thuật"
                          >
                            Chi tiết
                          </Button>
                          <Button
                            variant={isCompared ? 'primary' : 'secondary'}
                            size="sm"
                            fullWidth
                            onClick={() => {
                              if (!isCompared) {
                                const updated = Array.from(new Set([...comparisonVariantIds, item.id])).slice(0, 3);
                                openComparisonModal(updated, 'picker');
                              } else {
                                toggleComparisonVariant(item.id);
                              }
                            }}
                            icon={
                              isCompared ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3] group-hover:hidden" />
                                  <X className="w-3 h-3 stroke-[3] hidden group-hover:inline text-white" />
                                </>
                              ) : (
                                <Scale className="w-3 h-3" />
                              )
                            }
                            title={isCompared ? 'Nhấn để bỏ chọn phiên bản này' : 'Chọn so sánh phiên bản này'}
                            className={
                              isCompared
                                ? 'group hover:bg-rose-600 hover:border-rose-600 hover:text-white transition-colors'
                                : ''
                            }
                          >
                            {isCompared ? (
                              <>
                                <span className="group-hover:hidden">Đã chọn</span>
                                <span className="hidden group-hover:inline">Bỏ chọn</span>
                              </>
                            ) : (
                              'So sánh'
                            )}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => {
                              const baseModel = (isCoreModel ? item.model_id : 'VF6') as ModelId;
                              selectModel(baseModel, false);
                              selectVariant(baseModel, item.id);
                              setCanvasMode('recommendations');
                              proceedToTCO(baseModel);
                            }}
                            icon={<ArrowRight className="w-3 h-3" />}
                            iconPosition="right"
                            title="Tính TCO & Lập hồ sơ"
                          >
                            TCO
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LAYOUT 2: GROUPED BY MODEL (15 DÒNG XE CỐT LÕI VỚI TRIM SWITCHER BÊN TRONG) */}
            {viewLayout === 'byModel' && groupedModelIds.length > 0 && (
              <div ref={hallCardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {groupedModelIds.map((mId) => {
                  const modelVariants = ALL_VINFAST_VARIANTS.filter((v) => v.model_id === mId);
                  const activeVarId = selectedVariantIds?.[mId as ModelId] || modelVariants[0]?.id;
                  const item = VARIANTS_BY_ID[activeVarId] || modelVariants[0];
                  if (!item) return null;

                  const isCoreModel = allCoreModels.includes(mId as ModelId);
                  const isCompared = comparisonVariantIds.includes(item.id);

                  return (
                    <div
                      key={mId}
                      className={`hall-car-card rounded-2xl border transition-[border-color,box-shadow] duration-150 ease-out flex flex-col justify-between overflow-hidden group h-full shadow-xs ${
                        isCompared
                          ? 'border-brand-blue ring-2 ring-blue-100 bg-white'
                          : 'border-slate-200/90 bg-white hover:border-brand-blue/60 hover:shadow-lg'
                      }`}
                    >
                      {/* Top Image & Badge */}
                      <div className="p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2 relative z-10">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="dark" dot pulseDot>
                              {item.badge}
                            </Badge>
                            <span className="text-[10px] font-semibold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700">
                              {item.seats}
                            </span>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                            item.category === 'passenger'
                              ? 'bg-blue-900/60 text-blue-200 border-blue-700/60'
                              : 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60'
                          }`}>
                            {item.category_name}
                          </span>
                        </div>

                        {/* Silhouette Preview */}
                        <div className="h-32 flex items-center justify-center p-1 relative z-10 overflow-hidden">
                          <CarVisualSilhouette modelId={mId} className="w-full h-full max-h-32" />
                        </div>
                      </div>

                      {/* Middle Info Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
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
                                const isComparedTrim = comparisonVariantIds.includes(v.id);
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectVariant(mId, v.id);
                                    }}
                                    className={`flex-1 py-1.5 px-1 rounded-md text-[10px] font-bold transition-all text-center truncate cursor-pointer flex items-center justify-center gap-1 ${
                                      isCurrent
                                        ? 'bg-white text-brand-blue shadow-2xs font-extrabold ring-1 ring-blue-200'
                                        : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                    title={`${v.version_name} · ${v.price.toLocaleString('vi-VN')} đ`}
                                  >
                                    {isComparedTrim && <Check className="w-2.5 h-2.5 text-brand-blue stroke-[3]" />}
                                    <span>{v.version_name.replace('Bản ', '')}</span>
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

                        {/* Specs Matrix */}
                        <div className="grid grid-cols-2 gap-px bg-slate-200/80 rounded-xl overflow-hidden border border-slate-200/90 text-[10px]">
                          <div className="bg-slate-50/90 px-2.5 py-2 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Tầm chạy:</span>
                            <span className="font-bold text-slate-800">{item.range_nedc} km</span>
                          </div>
                          <div className="bg-slate-50/90 px-2.5 py-2 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Pin:</span>
                            <span className="font-bold text-slate-800">{item.battery_kwh} kWh</span>
                          </div>
                          <div className="bg-slate-50/90 px-2.5 py-2 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Sạc 10-70%:</span>
                            <span className="font-bold text-slate-800">{item.charging_time.replace('trong ', '')}</span>
                          </div>
                          <div className="bg-slate-50/90 px-2.5 py-2 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Bảo hành:</span>
                            <span className="font-bold text-slate-800">{item.warranty_years.split(' hoặc ')[0]}</span>
                          </div>
                        </div>

                        {/* Reason note */}
                        <div
                          title={item.reason_budget}
                          className="min-h-[44px] h-[44px] flex items-center bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/80 leading-relaxed text-[11px] text-slate-700 overflow-hidden shadow-2xs"
                        >
                          <p className="line-clamp-2">{item.reason_budget}</p>
                        </div>

                        {/* Triple Action Buttons */}
                        <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            onClick={() => handleOpenCarDetail(mId, item.id)}
                            title="Xem chi tiết thông số kỹ thuật"
                          >
                            Chi tiết
                          </Button>
                          <Button
                            variant={isCompared ? 'primary' : 'secondary'}
                            size="sm"
                            fullWidth
                            onClick={() => {
                              if (!isCompared) {
                                const updated = Array.from(new Set([...comparisonVariantIds, item.id])).slice(0, 3);
                                openComparisonModal(updated, 'picker');
                              } else {
                                toggleComparisonVariant(item.id);
                              }
                            }}
                            icon={
                              isCompared ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3] group-hover:hidden" />
                                  <X className="w-3 h-3 stroke-[3] hidden group-hover:inline text-white" />
                                </>
                              ) : (
                                <Scale className="w-3 h-3" />
                              )
                            }
                            title={isCompared ? 'Nhấn để bỏ chọn phiên bản này' : 'Chọn so sánh phiên bản này'}
                            className={
                              isCompared
                                ? 'group hover:bg-rose-600 hover:border-rose-600 hover:text-white transition-colors'
                                : ''
                            }
                          >
                            {isCompared ? (
                              <>
                                <span className="group-hover:hidden">Đã chọn</span>
                                <span className="hidden group-hover:inline">Bỏ chọn</span>
                              </>
                            ) : (
                              'So sánh'
                            )}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => {
                              const baseModel = (isCoreModel ? mId : 'VF6') as ModelId;
                              selectModel(baseModel, false);
                              selectVariant(baseModel, item.id);
                              setCanvasMode('recommendations');
                              proceedToTCO(baseModel);
                            }}
                            icon={<ArrowRight className="w-3 h-3" />}
                            iconPosition="right"
                            title="Tính TCO & Lập hồ sơ"
                          >
                            TCO
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FLOATING COMPARISON DOCK WHEN AT LEAST 1 CAR IS SELECTED */}
          {comparisonVariantIds.length > 0 && (
            <div className="mx-4 mb-3 p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Scale className="w-4 h-4 text-brand-blue" />
                  <span className="text-xs font-bold text-white">
                    Đã chọn ({comparisonVariantIds.length}/3):
                  </span>
                </div>
                {comparisonVariantIds.map((vId) => {
                  const item = VARIANTS_BY_ID[vId];
                  if (!item) return null;
                  return (
                    <span
                      key={vId}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 text-slate-100 border border-slate-700 shrink-0"
                    >
                      <span>{item.display_name.replace('VinFast ', '')}</span>
                      <button
                        type="button"
                        onClick={() => toggleComparisonVariant(vId)}
                        className="text-slate-400 hover:text-rose-400 p-0.5 rounded hover:bg-slate-700 cursor-pointer transition-colors"
                        title="Bỏ chọn xe này"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    [...comparisonVariantIds].forEach((id) => toggleComparisonVariant(id));
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 font-semibold px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Bỏ chọn tất cả
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openComparisonModal(comparisonVariantIds, comparisonVariantIds.length >= 2 ? 'table' : 'picker')}
                  icon={<Scale className="w-3.5 h-3.5" />}
                  className="text-xs h-8 px-3.5 bg-brand-blue hover:bg-blue-600 shadow-xs"
                >
                  {comparisonVariantIds.length >= 2 ? 'So sánh ngay' : 'Thêm xe đối chiếu'}
                </Button>
              </div>
            </div>
          )}
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
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed">
                        <strong className="text-slate-900">Tài chính:</strong> {car.reason_budget}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-brand-blue mt-0.5 shrink-0" />
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
                      icon={<Calendar className="w-3.5 h-3.5 text-brand-blue" />}
                    >
                      Lái thử
                    </Button>

                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => openComparisonModal([selectedModelId])}
                      icon={<Scale className="w-3.5 h-3.5 text-brand-blue" />}
                    >
                      So sánh
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => proceedToTCO(selectedModelId)}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                      iconPosition="right"
                    >
                      Chọn xe này & Tính TCO
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
          <div className="h-12 px-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={backToHall}
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Quay lại Sảnh chính
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 hidden sm:inline">Phương án đề xuất tối ưu</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openComparisonModal([selectedModelId])}
                icon={<Scale className="w-3.5 h-3.5" />}
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
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Chốt chọn mẫu xe này & Tính toán TCO 5 năm
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
                          icon={<Scale className="w-3 h-3" />}
                        >
                          So sánh
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          fullWidth
                          onClick={() => proceedToTCO(otherId as ModelId)}
                          icon={<ArrowRight className="w-3 h-3" />}
                          iconPosition="right"
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
          {/* Top Bar with Back Button navigating back to Recommendations */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCanvasMode('recommendations');
                setJourneyStep(2);
              }}
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Quay lại Đề xuất xe
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">
                Dự toán chi phí 5 năm: <strong className="text-slate-900 font-bold">{car.display_name}</strong>
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={backToHall}
              >
                Đổi mẫu xe khác
              </Button>
            </div>
          </div>

          {/* TCO Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <UrbanChargingWidget />
            <TCOEstimateCard />
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
              icon={<Scale className="w-4 h-4" />}
            >
              Mở bảng so sánh pop-up
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
