'use client';

import React, { useState, useEffect } from 'react';
import {
  CAR_CATALOG,
  CATALOG_EFFECTIVE_DATE,
  getCarModelWithVariant,
  ALL_VINFAST_VARIANTS,
  VARIANTS_BY_ID,
} from '@/lib/catalog';
import { ModelId } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CarVisualSilhouette } from '@/components/common/CarVisualSilhouette';
import {
  X,
  BatteryCharging,
  Zap,
  ShieldCheck,
  Clock,
  Gauge,
  Calendar,
  ArrowRight,
  Scale,
  CheckCircle2,
} from 'lucide-react';

interface CarDetailModalProps {
  modelId?: ModelId | string | null;
  variantId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onVariantChange?: (variantId: string) => void;
  onSelectAndProceed?: (modelId: ModelId) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  modelId,
  variantId,
  isOpen,
  onClose,
  onVariantChange,
  onSelectAndProceed,
}) => {
  const setTestDriveModalOpen = useAppStore((state) => state.setTestDriveModalOpen);
  const openComparisonModal = useAppStore((state) => state.openComparisonModal);
  const selectedVariantIds = useAppStore((state) => state.selectedVariantIds);
  const selectVariant = useAppStore((state) => state.selectVariant);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Local state for actively selected variant inside the modal to support instant switching
  const [currentVariantId, setCurrentVariantId] = useState<string | null>(null);
  const prevOpenRef = React.useRef(false);
  const prevModelIdRef = React.useRef(modelId);

  useEffect(() => {
    // Only re-initialize when modal transitions from closed to open, or when modelId changes from outside
    if (isOpen && (!prevOpenRef.current || prevModelIdRef.current !== modelId)) {
      const initialVarId =
        variantId ||
        (modelId ? selectedVariantIds?.[modelId] : null) ||
        (modelId && CAR_CATALOG[modelId as ModelId]?.variants?.[0]?.id) ||
        (modelId && ALL_VINFAST_VARIANTS.find((v) => v.model_id === modelId)?.id) ||
        'VF6_COMFORT';
      setCurrentVariantId(initialVarId);
    }
    prevOpenRef.current = isOpen;
    prevModelIdRef.current = modelId;
  }, [isOpen, modelId, variantId, selectedVariantIds]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || (!modelId && !variantId)) return null;

  const activeVariantId = currentVariantId || variantId || (modelId ? selectedVariantIds?.[modelId] : null) || 'VF6_COMFORT';
  const targetVariant = VARIANTS_BY_ID[activeVariantId] || (variantId ? VARIANTS_BY_ID[variantId] : null);
  const resolvedModelId = (targetVariant ? targetVariant.model_id : (modelId || 'VF6')) as ModelId;

  // Available variants for this model
  const availableVariants = ALL_VINFAST_VARIANTS.filter((v) => v.model_id === resolvedModelId).map((v) => ({
    id: v.id,
    name: v.version_name,
    price: v.price,
    battery_kwh: v.battery_kwh,
    range_nedc: v.range_nedc,
    range_real: v.range_real,
    motor_power: v.motor_power,
    charging_time: v.charging_time,
    badge: v.badge,
  }));

  // If it's one of the 6 core catalog cars
  const catalogCar = CAR_CATALOG[resolvedModelId];

  const rawCar = catalogCar
    ? getCarModelWithVariant(resolvedModelId, activeVariantId)
    : targetVariant
    ? {
        model_id: resolvedModelId,
        generation_id: 'gen-2',
        variant_id: targetVariant.id,
        display_name: targetVariant.display_name,
        badge: targetVariant.badge,
        price: targetVariant.price,
        seats: targetVariant.seats,
        range_nedc: targetVariant.range_nedc,
        range_real: targetVariant.range_real,
        battery_kwh: targetVariant.battery_kwh,
        consumption_kwh_100km: targetVariant.consumption_kwh_100km,
        warranty_years: targetVariant.warranty_years,
        source: 'VinFast Official',
        image: '',
        reason_budget: targetVariant.reason_budget,
        reason_charging: targetVariant.reason_charging,
        dimensions: targetVariant.dimensions,
        wheelbase: targetVariant.wheelbase,
        motor_power: targetVariant.motor_power,
        charging_time: targetVariant.charging_time,
        ground_clearance: targetVariant.ground_clearance,
        adas: targetVariant.adas,
        colors: [
          { name: 'Trắng Brahminy White', hex: '#F8FAFC' },
          { name: 'Xanh VinFast Blue', hex: '#2563EB' },
          { name: 'Đen Jet Black', hex: '#0F172A' },
        ],
        variants: availableVariants,
      }
    : CAR_CATALOG.VF6;

  const car = {
    ...rawCar,
    ...(targetVariant
      ? {
          variant_id: targetVariant.id,
          display_name: targetVariant.display_name || rawCar.display_name,
          badge: targetVariant.badge || rawCar.badge,
          price: targetVariant.price || rawCar.price,
          seats: targetVariant.seats || rawCar.seats,
          range_nedc: targetVariant.range_nedc || rawCar.range_nedc,
          range_real: targetVariant.range_real || rawCar.range_real,
          battery_kwh: targetVariant.battery_kwh || rawCar.battery_kwh,
          consumption_kwh_100km: targetVariant.consumption_kwh_100km || rawCar.consumption_kwh_100km,
          warranty_years: targetVariant.warranty_years || rawCar.warranty_years,
          reason_budget: targetVariant.reason_budget || rawCar.reason_budget,
          reason_charging: targetVariant.reason_charging || rawCar.reason_charging,
          dimensions: targetVariant.dimensions || rawCar.dimensions,
          wheelbase: targetVariant.wheelbase || rawCar.wheelbase,
          motor_power: targetVariant.motor_power || rawCar.motor_power,
          charging_time: targetVariant.charging_time || rawCar.charging_time,
          ground_clearance: targetVariant.ground_clearance || rawCar.ground_clearance,
          adas: targetVariant.adas || rawCar.adas,
        }
      : {}),
    variants: availableVariants,
  };

  const currentColor = car.colors[selectedColorIndex] || car.colors[0];

  const handleVariantSwitch = (newVariantId: string) => {
    setCurrentVariantId(newVariantId);
    onVariantChange?.(newVariantId);
    selectVariant(resolvedModelId, newVariantId);
  };

  const handleOpenComparison = () => {
    selectVariant(resolvedModelId, activeVariantId);
    onClose();
    openComparisonModal([activeVariantId], 'picker');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 animate-in fade-in duration-150 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Badge variant="dark" dot pulseDot>
              {car.badge}
            </Badge>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Chi tiết Thông số · {car.display_name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenComparison}
              icon={<Scale className="w-3.5 h-3.5 text-brand-blue" />}
              className="hidden sm:inline-flex"
            >
              So sánh dòng xe
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Top Section: Static Vehicle Showcase & Pricing Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left Column: Official Static Photo Container & Exterior Color Swatches */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
              <div className="relative h-64 sm:h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-6 flex items-center justify-center border border-slate-800 shadow-md overflow-hidden group">
                <CarVisualSilhouette modelId={car.model_id || resolvedModelId} colorHex={currentColor.hex} className="w-full h-full max-h-56" />
              </div>

              {/* Exterior Color Swatches */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[11px] font-medium text-slate-700 flex items-center gap-2">
                  <span>Màu sắc ngoại thất:</span>
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

            {/* Right Column: Pricing & Official Assessment Notes */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
              
              {/* Variant / Trim Selector (Version Switcher for 27-version Catalog) */}
              {availableVariants.length > 1 && (
                <div className="p-3 rounded-2xl bg-slate-100/90 border border-slate-200/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Chọn Phiên bản trang bị ({availableVariants.length} bản)
                    </span>
                    <span className="text-[10px] font-bold text-brand-blue">
                      {availableVariants.find((v) => v.id === activeVariantId)?.badge || 'Chính hãng'}
                    </span>
                  </div>
                  <div className={`grid gap-1.5 ${availableVariants.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {availableVariants.map((v) => {
                      const isSelected = activeVariantId === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleVariantSwitch(v.id)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white border-brand-blue ring-2 ring-brand-blue/15 shadow-2xs text-brand-blue'
                              : 'bg-white/70 border-slate-200/80 hover:bg-white text-slate-700'
                          }`}
                        >
                          <div className="text-[11px] font-black truncate">{v.name}</div>
                          <div className="text-[11px] font-extrabold tabular-nums mt-0.5">
                            {v.price.toLocaleString('vi-VN')}&nbsp;đ
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price & Registration Exemption Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Giá Niêm yết Kèm Pin · Áp dụng {CATALOG_EFFECTIVE_DATE}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
                    Tiết kiệm ~{Math.round(car.price * 0.1 / 1000000)}&nbsp;tr trước&nbsp;bạ
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-brand-blue tabular-nums tracking-tight whitespace-nowrap">
                    {car.price.toLocaleString('vi-VN')}&nbsp;đ
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Đã bao gồm VAT & pin kèm bộ sạc chính hãng</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/70 pt-2">
                  {car.reason_budget}
                </p>
              </div>

              {/* Operation & Charging AI Note */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-brand-blue">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold">Thói quen sạc & Vận hành</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {car.reason_charging}
                </p>
              </div>

              {/* Official Catalog Tech Chips (Zero Hallucinated Features) */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5 text-slate-700">
                  <Zap className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                  <span>Trạm sạc <strong>V-GREEN toàn quốc</strong></span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Bảo hành <strong>{car.warranty_years}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Flagship Performance Metrics Strip (Baoyu Harmonized Palette) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between h-[84px]">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-semibold">Tầm chạy NEDC</span>
                <BatteryCharging className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <strong className="text-lg font-black text-slate-900 tabular-nums">
                {car.range_nedc} <span className="text-xs font-bold text-slate-500">km</span>
              </strong>
              <span className="text-[9px] text-slate-500 mt-0.5">Tiêu chuẩn thử nghiệm</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between h-[84px]">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-semibold">Sạc nhanh 10-70%</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <strong className="text-lg font-black text-slate-900 tabular-nums truncate">
                {car.charging_time.replace('trong ', '')}
              </strong>
              <span className="text-[9px] text-slate-500 mt-0.5">Trụ siêu nhanh V-GREEN</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between h-[84px]">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-semibold">Công suất động cơ</span>
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <strong className="text-sm font-black text-slate-900 truncate" title={car.motor_power}>
                {car.motor_power.split('(')[0]}
              </strong>
              <span className="text-[9px] text-slate-500 mt-0.5">Mô-men xoắn tức thì</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between h-[84px]">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-semibold">Dung lượng Pin</span>
                <Zap className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <strong className="text-lg font-black text-slate-900 tabular-nums">
                {car.battery_kwh} <span className="text-xs font-bold text-slate-500">kWh</span>
              </strong>
              <span className="text-[9px] text-slate-500 mt-0.5">Chống nước ngập IP67</span>
            </div>
          </div>

          {/* Full Technical Specifications Matrix */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Bảng thông số kỹ thuật tiêu chuẩn nhà sản xuất</span>
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
              <div className="h-[58px] p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">Kích thước (DxRxC)</span>
                <strong className="text-slate-900 text-xs">{car.dimensions}</strong>
              </div>
              <div className="h-[58px] p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">Chiều dài cơ sở</span>
                <strong className="text-slate-900 text-xs">{car.wheelbase}</strong>
              </div>
              <div className="h-[58px] p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">Cấu hình chỗ ngồi</span>
                <strong className="text-slate-900 text-xs">{car.seats}</strong>
              </div>
              <div className="h-[58px] p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">Khoảng sáng gầm</span>
                <strong className="text-slate-900 text-xs">{car.ground_clearance}</strong>
              </div>
              <div className="h-[58px] p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">Hệ thống an toàn & ADAS</span>
                <strong className="text-indigo-700 text-[11px] truncate" title={car.adas}>{car.adas}</strong>
              </div>
              <div className="h-[58px] p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">Mức tiêu thụ năng lượng</span>
                <strong className="text-emerald-700 text-xs">{car.consumption_kwh_100km} kWh / 100km</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-4 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                onClose();
                setTestDriveModalOpen(true);
              }}
              icon={<Calendar className="w-3.5 h-3.5 text-brand-blue" />}
            >
              Đăng ký Lái thử
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleOpenComparison}
              icon={<Scale className="w-3.5 h-3.5 text-brand-blue" />}
            >
              So sánh dòng xe
            </Button>
          </div>

          {onSelectAndProceed && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                selectVariant(resolvedModelId, activeVariantId);
                onClose();
                onSelectAndProceed(resolvedModelId);
              }}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Chốt chọn mẫu xe này & Tính TCO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
