import { CarModel, CustomerInputs, TCOEstimateResult } from '@/types';
import { CATALOG_VERSION } from './catalog';

export const REGISTRATION_FEES_HANOI = 24540000;
export const VGREEN_RATE_PER_KWH = 3858;
export const HOME_RATE_PER_KWH = 3200;
export const MAINTENANCE_5Y = 15000000;
export const LOAN_TENURE_MONTHS = 60;

export interface ComputeInputs extends CustomerInputs {
  car: CarModel;
}

/**
 * Pure deterministic calculation engine for 5-Year Total Cost of Ownership (CALC01 - CALC06)
 * PRD Gate 1 compliance: No LLM approximation, arithmetic continuity, exact banking formulas.
 */
export function calculateDeterministicTCO(inputs: ComputeInputs): TCOEstimateResult {
  const { car, daily_km, loan_ratio, loan_rate, loan_method, charging_facility } = inputs;
  const resale_ratio = inputs.resale_ratio ?? 0.50;

  const carPrice = car.price;
  const onTheRoad = carPrice + REGISTRATION_FEES_HANOI;

  const monthlyKm = daily_km * 30;
  const monthlyKwh = (monthlyKm * car.consumption_kwh_100km) / 100;
  const unitRate = charging_facility === 'home' ? HOME_RATE_PER_KWH : VGREEN_RATE_PER_KWH;
  const monthlyEnergy = Math.round(monthlyKwh * unitRate);
  const energy5y = monthlyEnergy * 60;

  const safeUsableRange = car.range_real * 0.85;
  const chargeFreqDays = Math.max(1, Math.round(safeUsableRange / daily_km));

  const loanAmount = Math.round(carPrice * loan_ratio);
  const downPayment = carPrice - loanAmount;

  let firstMonthPayment = 0;
  let totalInterest = 0;

  if (loan_ratio > 0) {
    if (loan_method === 'annuity') {
      // CALC01: Fixed annuity PMT formula
      const rMonth = loan_rate / 12;
      const pmt = Math.round(
        (loanAmount * rMonth) / (1 - Math.pow(1 + rMonth, -LOAN_TENURE_MONTHS))
      );
      firstMonthPayment = pmt;
      totalInterest = Math.round(pmt * LOAN_TENURE_MONTHS - loanAmount);
    } else {
      // CALC02: Equal principal, decreasing interest
      const monthlyPrincipal = loanAmount / LOAN_TENURE_MONTHS;
      const firstMonthInterest = loanAmount * (loan_rate / 12);
      firstMonthPayment = Math.round(monthlyPrincipal + firstMonthInterest);
      // Arithmetic progression sum: Loan * (r/12) * (n + 1) / 2
      totalInterest = Math.round(
        loanAmount * (loan_rate / 12) * ((LOAN_TENURE_MONTHS + 1) / 2)
      );
    }
  }

  const resaleValue = Math.round(carPrice * resale_ratio);
  const tco5y = Math.round(
    carPrice + REGISTRATION_FEES_HANOI + energy5y + MAINTENANCE_5Y + totalInterest - resaleValue
  );

  return {
    car_price: carPrice,
    registration_fees: REGISTRATION_FEES_HANOI,
    on_the_road: onTheRoad,
    monthly_km: monthlyKm,
    monthly_energy: monthlyEnergy,
    energy_5y: energy5y,
    charge_freq_days: chargeFreqDays,
    maintenance_5y: MAINTENANCE_5Y,
    loan_amount: loanAmount,
    down_payment: downPayment,
    first_month_payment: firstMonthPayment,
    total_interest: totalInterest,
    resale_value: resaleValue,
    tco_5y: tco5y,
    catalog_version: CATALOG_VERSION,
  };
}

export function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}
