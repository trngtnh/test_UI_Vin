export type ModelId =
  | 'VF2'
  | 'VF3'
  | 'VF5'
  | 'VF6'
  | 'VF7'
  | 'VF8'
  | 'VF9'
  | 'VF_MPV7'
  | 'VF_WILD'
  | 'MINIO_GREEN'
  | 'HERIO_GREEN'
  | 'NERIO_GREEN'
  | 'LIMO_GREEN'
  | 'EC_VAN'
  | 'EBUS_6';

export type CityId = 'national' | 'hanoi' | 'hcm' | 'danang' | 'haiphong' | 'cantho';

export interface ShowroomFacility {
  id: string;
  cityId: CityId;
  cityName: string;
  showroomName: string;
  address: string;
  hotline: string;
  plateFee: number;
}

export interface CarColor {
  name: string;
  hex: string;
}

export interface CarVariant {
  id: string;
  name: string;
  price: number;
  battery_kwh: number;
  range_nedc: number;
  range_real: number;
  motor_power: string;
  charging_time: string;
  drivetrain?: string;
  badge?: string;
  features_highlight?: string;
}

export type VehicleCategory = 'passenger' | 'commercial';

export interface UnifiedCarVariant {
  id: string;
  model_id: string;
  category: VehicleCategory;
  category_name: string;
  model_name: string;
  version_name: string;
  display_name: string;
  badge: string;
  price: number;
  seats: string;
  seats_count: number;
  range_nedc: number;
  range_real: number;
  battery_kwh: number;
  consumption_kwh_100km: number;
  warranty_years: string;
  dimensions: string;
  wheelbase: string;
  ground_clearance: string;
  motor_power: string;
  charging_time: string;
  adas: string;
  status: string;
  reason_budget: string;
  reason_charging: string;
  colors?: CarColor[];
  features_highlight?: string;
  drivetrain?: string;
}

export interface CarModel {
  model_id: ModelId;
  generation_id: string;
  variant_id: string;
  display_name: string;
  badge: string;
  price: number;
  seats: string;
  range_nedc: number;
  range_real: number;
  battery_kwh: number;
  consumption_kwh_100km: number;
  warranty_years: string;
  source: string;
  image: string;
  reason_budget: string;
  reason_charging: string;
  // Deep Automotive Specs for VinFast-style Showcase & Comparison
  dimensions: string;
  wheelbase: string;
  motor_power: string;
  charging_time: string;
  ground_clearance: string;
  adas: string;
  colors: CarColor[];
  variants?: CarVariant[];
}

export type LoanMethod = 'decreasing' | 'annuity';
export type ChargingFacility = 'vgreen' | 'home';

export interface CustomerInputs {
  daily_km: number;
  loan_ratio: number;
  loan_rate: number;
  loan_method: LoanMethod;
  charging_facility: ChargingFacility;
  resale_ratio: number;
}

export interface TCOEstimateResult {
  car_price: number;
  registration_fees: number;
  on_the_road: number;
  monthly_km: number;
  monthly_energy: number;
  energy_5y: number;
  charge_freq_days: number;
  maintenance_5y: number;
  loan_amount: number;
  down_payment: number;
  first_month_payment: number;
  total_interest: number;
  resale_value: number;
  tco_5y: number;
  catalog_version: string;
}

export type TicketStatus = 'draft' | 'pending_approval' | 'needs_recalculation' | 'approved' | 'rejected';

export interface Ticket {
  id: string;
  model_id: ModelId;
  catalog_version: string;
  status: TicketStatus;
  input_snapshot: CustomerInputs | null;
  computed_snapshot: TCOEstimateResult | null;
  approved_by: string | null;
  approved_at: string | null;
  advisor_notes: string | null;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'approval' | 'ticket' | 'info';
  read: boolean;
  modelId?: ModelId;
}

export interface TestDriveRequest {
  showroom: string;
  preferred_date: string;
  preferred_time: string;
  customer_name: string;
  customer_phone: string;
  consent: boolean;
}

export type Role = 'customer' | 'advisor';
export type CustomerViewTab = 'catalog' | 'detail' | 'compare';
export type JourneyStep = 1 | 2 | 3 | 4;
export type CanvasMode = 'hall' | 'detail' | 'recommendations' | 'tco' | 'arbiter';
