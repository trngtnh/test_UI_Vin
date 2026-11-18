'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAppStore } from '@/store/useAppStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

import {
  ALL_VINFAST_VARIANTS,
  VARIANTS_BY_ID,
  CATALOG_EFFECTIVE_DATE,
  compareTwoVariants,
} from '@/lib/catalog';
import { calculateDeterministicTCO, formatVND } from '@/lib/engine';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CarVisualSilhouette } from '@/components/common/CarVisualSilhouette';
import {
  X,
  Scale,
  Check,
  CheckCircle2,
  BatteryCharging,
  Gauge,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Plus,
  Info,
  Search,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const CarComparisonModal: React.FC = () => {
  const isComparisonModalOpen = useAppStore((state) => state.isComparisonModalOpen);
  const closeComparisonModal = useAppStore((state) => state.closeComparisonModal);
  const comparisonVariantIds = useAppStore((state) => state.comparisonVariantIds);
  const comparisonModelIds = useAppStore((state) => state.comparisonModelIds);
  const toggleComparisonVariant = useAppStore((state) => state.toggleComparisonVariant);
  const setComparisonSlot = useAppStore((state) => state.setComparisonSlot);
  const selectModel = useAppStore((state) => state.selectModel);
  const proceedToTCO = useAppStore((state) => state.proceedToTCO);
  const customerInputs = useAppStore((state) => state.customerInputs);
  const comparisonInitialView = useAppStore((state) => state.comparisonInitialView) || 'picker';

  // View state: 'picker' or 'table'
  const [viewMode, setViewMode] = useState<'picker' | 'table'>('picker');
  const [pickerCategory, setPickerCategory] = useState<'all' | 'passenger' | 'commercial'>('all');
  const [pickerSearch, setPickerSearch] = useState('');
  const [diffViewMode, setDiffViewMode] = useState<'compact' | 'expanded' | 'hidden'>('compact');

  // Normalize selected variant IDs: if comparisonVariantIds has items, use them;
  // otherwise fallback to comparisonModelIds mapped to their default variant (strictly deduplicated & capped at 3)
  const activeVariantIds = useMemo(() => {
    const rawIds =
      comparisonVariantIds && comparisonVariantIds.length > 0
        ? comparisonVariantIds
        : comparisonModelIds && comparisonModelIds.length > 0
        ? comparisonModelIds.map((mId) => {
            const found = ALL_VINFAST_VARIANTS.find((v) => v.model_id === mId);
            return found ? found.id : 'VF6_COMFORT';
          })
        : [];
    return Array.from(new Set(rawIds)).slice(0, 3);
  }, [comparisonVariantIds, comparisonModelIds]);

  // Synchronize viewMode when modal opens: only open in table view if explicitly requested!
  useEffect(() => {
    if (isComparisonModalOpen) {
      if (comparisonInitialView === 'table' && activeVariantIds.length >= 2) {
        setViewMode('table');
      } else {
        setViewMode('picker');
      }
    }
  }, [isComparisonModalOpen, comparisonInitialView]);

  // If user drops below 2 cars while in table view, return to picker
  useEffect(() => {
    if (isComparisonModalOpen && activeVariantIds.length < 2 && viewMode === 'table') {
      setViewMode('picker');
    }
  }, [activeVariantIds.length, isComparisonModalOpen, viewMode]);

  const modalContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (viewMode === 'picker') {
        gsap.from('.picker-car-card', {
          opacity: 0,
          y: 8,
          duration: 0.2,
          stagger: 0.02,
          ease: 'power2.out',
          clearProps: 'all',
        });
      }
    },
    { scope: modalContainerRef, dependencies: [viewMode, pickerCategory, pickerSearch, isComparisonModalOpen] }
  );

  useEffect(() => {
    if (!isComparisonModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeComparisonModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComparisonModalOpen, closeComparisonModal]);

  // Filtered variants for the picker
  const filteredPickerVariants = useMemo(() => {
    return ALL_VINFAST_VARIANTS.filter((v) => {
      if (pickerCategory !== 'all' && v.category !== pickerCategory) {
        return false;
      }
      if (pickerSearch.trim()) {
        const q = pickerSearch.toLowerCase().trim();
        const text = `${v.display_name} ${v.version_name} ${v.model_name} ${v.badge} ${v.features_highlight || ''} ${v.seats}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [pickerCategory, pickerSearch]);

  // Resolved variant objects for compared columns
  const comparedVariants = useMemo(() => {
    return activeVariantIds
      .map((vId) => VARIANTS_BY_ID[vId])
      .filter(Boolean);
  }, [activeVariantIds]);

  // Compute TCO for each compared variant
  const estimates = useMemo(() => {
    if (!isComparisonModalOpen) return {};
    return comparedVariants.reduce((acc, car) => {
      acc[car.id] = calculateDeterministicTCO({
        car: {
          ...car,
          variant_id: car.id,
          generation_id: 'gen-2',
          source: 'VinFast Official',
          image: '',
          model_id: (['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9'].includes(car.model_id) ? car.model_id : 'VF6') as any,
          colors: [],
        },
        ...customerInputs,
      });
      return acc;
    }, {} as Record<string, ReturnType<typeof calculateDeterministicTCO>>);
  }, [comparedVariants, customerInputs, isComparisonModalOpen]);

  // Check if 2 variants are being compared (either same model or different models)
  const sameModelDiff = useMemo(() => {
    return comparedVariants.length >= 2
      ? compareTwoVariants(comparedVariants[0].id, comparedVariants[1].id)
      : null;
  }, [comparedVariants]);

  // Sister variants of the currently selected car (if 1 car is selected)
  const sisterVariants = useMemo(() => {
    if (comparedVariants.length !== 1) return [];
    const current = comparedVariants[0];
    return ALL_VINFAST_VARIANTS.filter(
      (v) => v.model_id === current.model_id && v.id !== current.id
    );
  }, [comparedVariants]);

  const handleSelectCarAndProceed = (vId: string) => {
    const variant = VARIANTS_BY_ID[vId];
    closeComparisonModal();
    if (variant) {
      const baseModelId = (['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9'].includes(variant.model_id)
        ? variant.model_id
        : 'VF6') as any;
      selectModel(baseModelId, false);
      proceedToTCO(baseModelId);
    }
  };

  if (!isComparisonModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 animate-in fade-in duration-150 cursor-pointer"
      onClick={closeComparisonModal}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="h-14 px-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Scale className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-extrabold text-slate-900">
              So sánh các dòng & phiên bản xe VinFast
            </h3>
            <Badge variant={comparedVariants.length >= 2 ? 'success' : 'brand'} dot>
              {comparedVariants.length} / 3 phiên bản được chọn
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'table' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('picker')}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="hidden sm:inline-flex"
              >
                Đổi / Thêm phiên bản
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeComparisonModal}
              aria-label="Đóng bảng so sánh"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* =========================================================================
            STAGE 1: VARIANT PICKER (CHỌN TRONG 27 PHIÊN BẢN, CHO PHÉP CHỌN CÙNG 1 XE)
            ========================================================================= */}
        {viewMode === 'picker' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Guide Step Banner & Filter Strip */}
            <div className="px-5 py-3 bg-blue-50/70 border-b border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {comparedVariants.length === 0 ? '1' : comparedVariants.length === 1 ? '2' : '✓'}
                </span>
                <span className="font-semibold text-slate-800">
                  {comparedVariants.length === 0
                    ? 'Bước 1: Chọn phiên bản xe đầu tiên (có thể chọn 2 bản của cùng 1 dòng xe)'
                    : comparedVariants.length === 1
                    ? 'Bước 2: Chọn thêm 1 phiên bản đối chiếu (cùng dòng hoặc khác dòng xe)'
                    : 'Đã chọn đủ xe: Nhấn nút [So sánh ngay] bên phải hoặc chọn thêm bản thứ 3'}
                </span>
              </div>

              {comparedVariants.length >= 2 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setViewMode('table')}
                  icon={<Scale className="w-3.5 h-3.5" />}
                >
                  So sánh ngay ({comparedVariants.length} xe)
                </Button>
              )}
            </div>

            {/* PINNED SELECTION HEADER BAR IN PICKER: Always visible whenever 1+ cars selected */}
            {comparedVariants.length > 0 && (
              <div className="px-5 py-2.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 shrink-0 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Đang chọn ({comparedVariants.length}/3 xe):</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {comparedVariants.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-brand-blue text-white shadow-2xs border border-blue-400/30 animate-in zoom-in-95 duration-150"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{c.display_name}</span>
                        <span className="text-[10px] text-blue-200 tabular-nums">
                          ({(c.price / 1000000).toLocaleString('vi-VN')} tr)
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleComparisonVariant(c.id)}
                          className="text-blue-200 hover:text-white ml-0.5 p-0.5 rounded cursor-pointer"
                          title="Bỏ chọn xe này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick sister trim compare shortcut or call-to-action */}
                <div className="flex items-center gap-2 shrink-0">
                  {comparedVariants.length === 1 && sisterVariants.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        toggleComparisonVariant(sisterVariants[0].id);
                        setViewMode('table');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-sm cursor-pointer transition-all hover:scale-102"
                      title={`Nhấp để so sánh nhanh với bản cùng dòng: ${sisterVariants[0].display_name}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                      <span>So sánh nhanh với {sisterVariants[0].version_name}</span>
                      <span className="text-[10px] font-bold opacity-80 tabular-nums">
                        ({(sisterVariants[0].price / 1000000).toLocaleString('vi-VN')} tr) ➔
                      </span>
                    </button>
                  )}

                  {comparedVariants.length >= 2 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setViewMode('table')}
                      icon={<Scale className="w-3.5 h-3.5" />}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm"
                    >
                      Xem Bảng So Sánh ({comparedVariants.length} xe) ➔
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Filter and Search Bar for 27 Variants */}
            <div className="px-5 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="inline-flex p-1 bg-slate-200/70 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setPickerCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    pickerCategory === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả (27 xe)
                </button>
                <button
                  type="button"
                  onClick={() => setPickerCategory('passenger')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    pickerCategory === 'passenger'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Xe Du lịch (17 bản)
                </button>
                <button
                  type="button"
                  onClick={() => setPickerCategory('commercial')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    pickerCategory === 'commercial'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Xe Thương mại (10 bản)
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm theo tên bản, VF 7, Plus, Van..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
                {pickerSearch && (
                  <button
                    type="button"
                    onClick={() => setPickerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Visual 27-Variant Grid */}
            <div ref={modalContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredPickerVariants.map((car) => {
                  const isSelected = activeVariantIds.includes(car.id);
                  const isMaxReached = activeVariantIds.length >= 3 && !isSelected;

                  return (
                    <div
                      key={car.id}
                      onClick={() => {
                        if (isSelected) {
                          toggleComparisonVariant(car.id);
                        } else if (!isMaxReached) {
                          toggleComparisonVariant(car.id);
                        }
                      }}
                      className={`picker-car-card min-h-[300px] rounded-2xl p-4 border-2 transition-all duration-150 ease-out flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? 'border-brand-blue bg-blue-50/40 shadow-xs ring-2 ring-blue-100'
                          : isMaxReached
                          ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      {/* Top Row: Segment Badge & Selection Status */}
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{car.badge}</Badge>

                        <div className="flex items-center gap-1.5">
                          {isSelected ? (
                            <Badge variant="brand" className="bg-brand-blue text-white border-transparent">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Đã chọn</span>
                            </Badge>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                isMaxReached
                                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                                  : 'bg-white text-slate-600 border-slate-300 group-hover:border-brand-blue group-hover:text-brand-blue'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isMaxReached ? 'Đã đủ 3 xe' : 'Chọn so sánh'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Official Silhouette Preview */}
                      <div className="h-24 flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform duration-200 overflow-hidden bg-slate-950 rounded-xl border border-slate-800">
                        <CarVisualSilhouette modelId={car.model_id} className="w-full h-full max-h-20" />
                      </div>

                      {/* Name & Pricing */}
                      <div className="space-y-1">
                        <div className="min-h-[36px] flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {car.model_name}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1">
                            {car.version_name}
                          </h4>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-brand-blue tabular-nums whitespace-nowrap">
                            {car.price.toLocaleString('vi-VN')}&nbsp;đ
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            (kèm Pin)
                          </span>
                        </div>
                      </div>

                      {/* 3 Key Spec Badges */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10px] text-slate-600 text-center">
                        <div className="p-1 rounded-lg bg-slate-50 flex flex-col justify-center h-[40px]">
                          <span className="text-slate-400 block text-[9px]">Tầm chạy</span>
                          <strong>{car.range_nedc} km</strong>
                        </div>
                        <div className="p-1 rounded-lg bg-slate-50 flex flex-col justify-center h-[40px]">
                          <span className="text-slate-400 block text-[9px]">Công suất</span>
                          <strong className="truncate">{car.motor_power.split('(')[0]}</strong>
                        </div>
                        <div className="p-1 rounded-lg bg-slate-50 flex flex-col justify-center h-[40px]">
                          <span className="text-slate-400 block text-[9px]">Chỗ ngồi</span>
                          <strong>{car.seats}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FLOATING ACTION BAR IN PICKER WHEN 1+ CARS SELECTED */}
            {comparedVariants.length >= 1 && (
              <div className="p-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 text-white flex items-center justify-between gap-3 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-bold text-slate-300 shrink-0">
                    Đã chọn ({comparedVariants.length}/3 xe):
                  </span>
                  <div className="flex items-center gap-1.5">
                    {comparedVariants.map((car) => (
                      <span
                        key={car.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-white border border-slate-700 shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{car.display_name.replace('VinFast ', '')}</span>
                        <button
                          type="button"
                          onClick={() => toggleComparisonVariant(car.id)}
                          className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                          title="Bỏ phiên bản này"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {comparedVariants.length === 1 && (
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      Chọn thêm ít nhất 1 xe để bắt đầu so sánh
                    </span>
                  )}
                  {comparedVariants.length >= 2 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setViewMode('table')}
                      icon={<Scale className="w-3.5 h-3.5" />}
                      className="bg-brand-blue hover:bg-blue-600 text-xs shrink-0 font-extrabold shadow-sm"
                    >
                      So sánh ngay ({comparedVariants.length} xe) ➔
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STAGE 2: COMPARISON MATRIX TABLE (SO SÁNH 2-3 BẢN, CÓ DIFF HIGHLIGHTER)
            ========================================================================= */}
        {viewMode === 'table' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Switch Bar at top of table */}
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('picker')}
                  icon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Đổi / Thêm phiên bản khác
                </Button>
                <span className="text-[11px] text-slate-400">|</span>
                <span className="text-xs text-slate-600 font-medium">
                  Đang đối chiếu song song {comparedVariants.length} phiên bản:
                </span>
              </div>

              {/* Quick toggle chips & Smart Diff Icon */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* SMART DIFF TOGGLE ICON PILL */}
                {sameModelDiff && (
                  <button
                    type="button"
                    onClick={() => {
                      if (diffViewMode === 'hidden') {
                        setDiffViewMode('compact');
                      } else if (diffViewMode === 'compact') {
                        setDiffViewMode('expanded');
                      } else {
                        setDiffViewMode('compact');
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      diffViewMode !== 'hidden'
                        ? 'bg-blue-100 text-blue-950 border-blue-300 shadow-2xs ring-1 ring-blue-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-brand-blue shadow-2xs'
                    }`}
                    title="Bật/Tắt dải phân tích chênh lệch thông minh"
                  >
                    <Scale className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                    <span>Chênh lệch: +{sameModelDiff.priceDelta.toLocaleString('vi-VN')} đ</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      diffViewMode !== 'hidden' ? 'bg-blue-200/80 text-blue-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {diffViewMode === 'expanded' ? 'Thu gọn' : diffViewMode === 'compact' ? 'Mở rộng' : 'Xem'}
                    </span>
                  </button>
                )}

                {comparedVariants.map((car, idx) => (
                  <span
                    key={car.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-brand-blue" />
                    <span>{car.display_name.replace('VinFast ', '')}</span>
                    <button
                      type="button"
                      onClick={() => toggleComparisonVariant(car.id)}
                      className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                      title="Bỏ phiên bản này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* INTELLIGENT DIFF HIGHLIGHTER: COMPACT 1-LINE MODE (~36px) */}
            {sameModelDiff && diffViewMode === 'compact' && (
              <div className="mx-4 sm:mx-5 mt-2.5 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200/80 shadow-2xs shrink-0 flex items-center justify-between gap-2.5 text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2 overflow-x-auto min-w-0 py-0.5">
                  <div className="w-5 h-5 rounded-md bg-blue-500/10 text-brand-blue flex items-center justify-center shrink-0">
                    <Scale className="w-3 h-3 text-brand-blue" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 truncate">
                    <span className="font-extrabold text-slate-900 whitespace-nowrap">
                      {sameModelDiff.isSameModel ? sameModelDiff.modelName : `${sameModelDiff.variantA.version_name} vs ${sameModelDiff.variantB.version_name}`}:
                    </span>
                    <span className="text-brand-blue font-black whitespace-nowrap">
                      +{sameModelDiff.priceDelta.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-emerald-800 font-bold whitespace-nowrap">
                      {sameModelDiff.rangeDiffText}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-700 font-bold whitespace-nowrap truncate" title={sameModelDiff.motorDiffText}>
                      {sameModelDiff.motorDiffText}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDiffViewMode('expanded')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 transition-colors cursor-pointer"
                    title="Mở rộng chi tiết 4 thẻ so sánh"
                  >
                    <span>Chi tiết 4 mục</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiffViewMode('hidden')}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-blue-100/60 transition-colors cursor-pointer"
                    title="Ẩn dải này (chỉ giữ icon trên thanh công cụ)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* INTELLIGENT DIFF HIGHLIGHTER: EXPANDED 4-CARD MODE (Baoyu Clean Palette) */}
            {sameModelDiff && diffViewMode === 'expanded' && (
              <div className="mx-4 sm:mx-5 mt-2.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 border border-blue-200/90 shadow-2xs shrink-0 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2.5 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600/10 text-brand-blue flex items-center justify-center shrink-0">
                      <Scale className="w-3.5 h-3.5 text-brand-blue" />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {sameModelDiff.isSameModel
                        ? `So sánh nội bộ 2 phiên bản dòng xe ${sameModelDiff.modelName}`
                        : `So sánh đối đầu: ${sameModelDiff.variantA.display_name} vs ${sameModelDiff.variantB.display_name}`}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg bg-white border border-blue-200 text-brand-blue shadow-2xs">
                      {sameModelDiff.priceDelta > 0
                        ? `Chênh lệch: +${sameModelDiff.priceDelta.toLocaleString('vi-VN')} đ (${sameModelDiff.vHigh.version_name})`
                        : 'Cùng mức giá niêm yết'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDiffViewMode('compact')}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 transition-colors cursor-pointer"
                      title="Thu gọn thành 1 dòng"
                    >
                      <span>Thu gọn 1 dòng</span>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiffViewMode('hidden')}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-blue-100/60 transition-colors cursor-pointer"
                      title="Ẩn dải này (chỉ giữ icon trên thanh công cụ)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-stretch text-[11px]">
                  {/* Card 1: Chênh lệch giá niêm yết */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[76px]">
                    <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Chênh lệch giá niêm yết
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-brand-blue bg-blue-50 border border-blue-100">
                        {sameModelDiff.priceDelta > 0 ? `+${sameModelDiff.priceDiffPercent}%` : 'Bằng giá'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-black text-brand-blue tabular-nums whitespace-nowrap">
                        {sameModelDiff.priceDelta > 0 ? `+${sameModelDiff.priceDelta.toLocaleString('vi-VN')} đ` : '0 đ'}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {sameModelDiff.priceDelta > 0
                          ? `${sameModelDiff.vHigh.version_name.startsWith('Bản ') ? sameModelDiff.vHigh.version_name : `Bản ${sameModelDiff.vHigh.version_name}`} cao hơn`
                          : 'Hai bản bằng giá'}
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Động cơ & Công suất */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[76px]">
                    <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Động cơ & Công suất
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sameModelDiff.isSameMotor ? 'text-slate-600 bg-slate-100' : 'text-blue-700 bg-blue-100/80'}`}>
                        {sameModelDiff.isSameMotor ? 'Tương đương' : 'Nâng cấp'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-slate-900 leading-snug truncate" title={sameModelDiff.motorDiffText}>
                        {sameModelDiff.motorDiffText}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {sameModelDiff.isSameMotor ? 'Dẫn động & sức mạnh như nhau' : 'Công suất & lực kéo vượt trội'}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Pin & Tầm chạy */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[76px]">
                    <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Pin & Tầm chạy
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sameModelDiff.rangeDelta > 0 ? 'text-emerald-700 bg-emerald-100/80' : 'text-slate-600 bg-slate-100'}`}>
                        {sameModelDiff.rangeDelta > 0 ? `+${sameModelDiff.rangeDelta} km` : 'Tương đương'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-emerald-800 leading-snug truncate" title={`${sameModelDiff.batteryDiffText} · ${sameModelDiff.rangeDiffText}`}>
                        {sameModelDiff.rangeDiffText}
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium truncate">
                        {sameModelDiff.batteryDiffText}
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Khác biệt trang bị cốt lõi */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[76px]">
                    <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Khác biệt trang bị cốt lõi
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-indigo-700 bg-indigo-50 border border-indigo-100">
                        Trang bị
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 leading-snug line-clamp-3" title={sameModelDiff.coreFeatureDiff}>
                      {sameModelDiff.coreFeatureDiff}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="p-3.5 w-1/4 font-extrabold text-slate-800 text-xs uppercase tracking-wider min-w-[160px] align-middle">
                          Tiêu chí đối chiếu
                        </th>
                        {comparedVariants.map((car, colIndex) => {
                          const siblingVariants = ALL_VINFAST_VARIANTS.filter((v) => v.model_id === car.model_id);
                          return (
                            <th
                              key={car.id}
                              className="p-3.5 text-center border-l border-slate-200 bg-white min-w-[240px] align-middle"
                            >
                              <div className="h-24 flex items-center justify-center p-1 mb-1 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-slate-800 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-slate-900/40 to-transparent pointer-events-none" />
                                <CarVisualSilhouette modelId={car.model_id} className="w-full h-full max-h-20 relative z-10" />
                              </div>

                              <Badge variant="brand" className="mb-1">
                                {car.badge}
                              </Badge>

                              {/* Version Switcher Dropdown on column header */}
                              {siblingVariants.length > 1 && (
                                <div className="my-1.5 flex items-center justify-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                                  {siblingVariants.map((v) => {
                                    const isCurrent = v.id === car.id;
                                    return (
                                      <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => setComparisonSlot(colIndex, v.id)}
                                        className={`flex-1 py-1 px-1 rounded-md text-[9px] font-bold transition-all text-center truncate cursor-pointer ${
                                          isCurrent
                                            ? 'bg-white text-brand-blue shadow-2xs font-extrabold'
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                        title={`${v.version_name} · ${v.price.toLocaleString('vi-VN')} đ`}
                                      >
                                        {v.version_name.replace('Bản ', '')}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">
                                {car.display_name}
                              </h4>
                              <div className="text-base font-black text-brand-blue mt-0.5 tabular-nums whitespace-nowrap">
                                {car.price.toLocaleString('vi-VN')}&nbsp;đ
                              </div>
                              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5 whitespace-nowrap">
                                Miễn 100% lệ phí trước bạ
                              </span>

                              <Button
                                variant="primary"
                                size="sm"
                                fullWidth
                                onClick={() => handleSelectCarAndProceed(car.id)}
                                className="mt-2.5"
                              >
                                Chọn xe & Tính TCO
                              </Button>
                            </th>
                          );
                        })}
                        {comparedVariants.length === 2 && (
                          <th className="p-4 border-l border-slate-200 border-dashed bg-slate-50/50 text-center min-w-[180px] align-middle">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewMode('picker')}
                              icon={<Plus className="w-3.5 h-3.5" />}
                            >
                              Thêm xe thứ 3
                            </Button>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* 1. Kích thước & Không gian */}
                      <tr className="bg-slate-50/60 font-bold text-slate-700">
                        <td
                          colSpan={comparedVariants.length + (comparedVariants.length === 2 ? 2 : 1)}
                          className="py-2 px-3.5 text-[11px] uppercase tracking-wider text-slate-500"
                        >
                          1. Kích thước & Không gian
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Phân khúc xe</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800 align-middle">
                            {car.badge}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Cấu hình chỗ ngồi</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800 align-middle">
                            {car.seats}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Kích thước DxRxC (mm)</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 text-slate-700 align-middle font-medium">
                            {car.dimensions}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Khoảng sáng gầm (mm)</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 text-slate-700 align-middle font-medium">
                            {car.ground_clearance}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>

                      {/* 2. Động cơ & Pin */}
                      <tr className="bg-slate-50/60 font-bold text-slate-700">
                        <td
                          colSpan={comparedVariants.length + (comparedVariants.length === 2 ? 2 : 1)}
                          className="py-2 px-3.5 text-[11px] uppercase tracking-wider text-slate-500"
                        >
                          2. Động cơ, Pin & Tầm vận hành
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Tầm chạy NEDC (km/lần sạc)</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 text-brand-blue font-black text-sm align-middle">
                            {car.range_nedc} km
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Dung lượng Pin (kWh)</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 font-bold text-slate-800 align-middle">
                            {car.battery_kwh} kWh
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Thời gian sạc nhanh 10-70%</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 font-bold text-emerald-700 align-middle">
                            {car.charging_time}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Công suất động cơ</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 text-slate-800 font-bold align-middle text-[11px]">
                            {car.motor_power}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>

                      {/* 3. Công nghệ & An toàn */}
                      <tr className="bg-slate-50/60 font-bold text-slate-700">
                        <td
                          colSpan={comparedVariants.length + (comparedVariants.length === 2 ? 2 : 1)}
                          className="py-2 px-3.5 text-[11px] uppercase tracking-wider text-slate-500"
                        >
                          3. Công nghệ ADAS, Tiện nghi & Bảo hành
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Hệ thống trợ lái & An toàn</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 text-slate-700 align-middle text-[11px] leading-relaxed">
                            {car.adas}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Điểm nhấn phiên bản</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 text-slate-800 font-semibold align-middle text-[11px]">
                            {car.features_highlight || 'Trang bị chính hãng'}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600 align-middle">Chính sách bảo hành xe</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 font-bold text-indigo-700 align-middle">
                            {car.warranty_years}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>

                      {/* 4. Dự toán Chi phí Nuôi xe (TCO 5 năm) */}
                      <tr className="bg-blue-50/70 font-bold text-brand-blue">
                        <td
                          colSpan={comparedVariants.length + (comparedVariants.length === 2 ? 2 : 1)}
                          className="py-2 px-3.5 text-[11px] uppercase tracking-wider text-brand-blue"
                        >
                          4. Dự toán Chi phí Sở hữu 5 năm (TCO)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-700 align-middle">Tổng chi phí 5 năm</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 font-black text-brand-blue text-sm align-middle">
                            {estimates[car.id] ? formatVND(estimates[car.id].tco_5y) : '—'}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-700 align-middle">Tiết kiệm năng lượng so với xe xăng</td>
                        {comparedVariants.map((car) => {
                          const est = estimates[car.id];
                          const ice5yFuel = est ? (est.monthly_km / 100) * 8.0 * 24000 * 60 : 0;
                          const savings5y = est ? Math.max(0, ice5yFuel - est.energy_5y) : 0;
                          return (
                            <td key={car.id} className="p-3 text-center border-l border-slate-100 font-black text-emerald-700 text-xs align-middle">
                              {est ? `Tiết kiệm ~${Math.round(savings5y / 1000000)} triệu` : '—'}
                            </td>
                          );
                        })}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-700 align-middle">Thanh toán tháng đầu (nếu vay)</td>
                        {comparedVariants.map((car) => (
                          <td key={car.id} className="p-3 text-center border-l border-slate-100 text-slate-800 font-semibold align-middle">
                            {estimates[car.id] ? formatVND(estimates[car.id].first_month_payment) : '—'}
                          </td>
                        ))}
                        {comparedVariants.length === 2 && <td className="p-3 border-l border-slate-100 border-dashed bg-slate-50/30"></td>}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500">
                Biểu giá chính hãng VinFast & chính sách ưu đãi 100% lệ phí trước bạ áp dụng {CATALOG_EFFECTIVE_DATE}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('picker')}
                >
                  Đổi phiên bản khác
                </Button>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={closeComparisonModal}
                >
                  Đóng bảng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
