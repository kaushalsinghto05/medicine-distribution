// Core Data Models for B2B Medicine Distribution Marketplace

export type Role = 'manufacturer' | 'distributor';

export type PortalMode = 'manufacturer' | 'distributor';

export interface Tenant {
  id: string; // e.g. 'mfg-acme'
  name: string; // e.g. 'Acme Pharma Ltd'
  shortName: string;
  tagline: string;
  logoColor: string;
  drugLicenseNumber: string; // Indian DL No. e.g. 'DL-MH-2024-00192'
  gstin: string; // Indian GSTIN e.g. '27AABCA1234F1Z5'
  panNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  state: string;
  allowedPaymentTerms: ('online' | 'credit')[];
  defaultCreditPeriodDays: number;
  minOrderValueDefault: number;
}

export type DistributorApprovalStatus = 'approved' | 'pending' | 'suspended' | 'rejected';

export interface AuthorizedTenantRelation {
  tenantId: string;
  status: DistributorApprovalStatus;
  approvedAt?: string;
  rejectionReason?: string;
  suspensionReason?: string;
  assignedCreditDays: number; // e.g. 30 or 60 days
  creditLimit: number; // ₹ limit
  creditUsed: number; // ₹ currently outstanding
  monthlyQuantityLimit: number; // monthly quota across all or specific medicines
  monthlyQuantityUsed: number; // current month used
}

export interface DistributorLicense {
  form20B: string; // Wholesale drug license for non-specified drugs
  form21B: string; // Wholesale drug license for Schedule C and C(1)
  validFrom: string;
  validTo: string;
  verified: boolean;
  documentPlaceholderUrl?: string;
}

export interface Distributor {
  id: string; // e.g. 'dist-medplus'
  name: string; // 'MedPlus Logistics & Distribution'
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  panNumber: string;
  accountStatus: 'active' | 'inactive' | 'suspended';
  licenses: DistributorLicense;
  authorizedTenants: Record<string, AuthorizedTenantRelation>; // keyed by tenantId
}

export type MedicineCategory = 
  | 'Antibiotics'
  | 'Analgesics & Antipyretics'
  | 'Cardiovascular'
  | 'Gastrointestinal'
  | 'Respiratory'
  | 'Antidiabetic'
  | 'Dermatological'
  | 'Nutritional & Vitamins';

export type ScheduleClassification = 'OTC' | 'Schedule H' | 'Schedule H1' | 'Schedule X';

export interface RegulatoryCompliance {
  scheduleClassification: ScheduleClassification;
  rxRequired: boolean;
  drugLicenseNumber: string; // Manufacturing drug license
  composition: string;
  storageConditions: string;
  isColdChain: boolean;
  isRestrictedSale: boolean;
  standardPackagingUnit: string; // strip, box, vial, ampoule, bottle
}

export interface Batch {
  id: string;
  medicineId: string;
  tenantId: string;
  batchNumber: string;
  manufacturingDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  initialQuantity: number;
  availableQuantity: number;
  packagingUnit: string;
  mrp: number; // Maximum Retail Price in ₹
  costPrice: number; // ₹
}

export interface SlabPrice {
  minQty: number;
  maxQty: number; // inclusive or Infinity
  pricePerUnit: number;
}

export interface DiscountRule {
  id: string;
  type: 'percentage' | 'flat';
  value: number; // e.g. 5 for 5% or 50 for ₹50
  description: string;
  validUntil: string;
}

export interface PricingConfig {
  medicineId: string;
  tenantId: string;
  standardDistributorPrice: number; // ₹ per unit
  distributorOverrides: Record<string, number>; // distributorId -> price
  slabs: SlabPrice[];
  discounts: DiscountRule[];
}

export type ShortageBehavior = 'reject' | 'partial' | 'backorder';

export interface OrderingRules {
  medicineId: string;
  tenantId: string;
  distributorId?: string; // if overridden for specific distributor
  minOrderQty: number;
  maxOrderQty: number;
  maxDistributorCap: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  orderMultiple: number; // e.g. multiples of 10
  shortageBehavior: ShortageBehavior;
  distributorEligibility: {
    approvalRequired: boolean;
    licenseVerifiedRequired: boolean;
    activeAccountOnly: boolean;
    restrictedScheduleAllowed: boolean;
  };
  applicablePaymentTerms: ('online' | 'credit')[];
  creditTermsDays: number;
}

export interface Medicine {
  id: string;
  tenantId: string;
  name: string;
  genericName: string;
  brandName: string;
  category: MedicineCategory;
  packagingUnit: string; // strip, box, vial, bottle, etc.
  packSize: string; // e.g. '10 x 10 Tablets' or '100ml'
  mrp: number;
  description: string;
  status: 'draft' | 'published';
  regulatory: RegulatoryCompliance;
  batches: Batch[];
  pricing: PricingConfig;
  rules: OrderingRules;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  medicineId: string;
  medicineName: string;
  genericName: string;
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  packagingUnit: string;
  requestedQuantity: number;
  fulfilledQuantity: number;
  backorderedQuantity: number;
  unitMrp: number;
  unitPrice: number; // Distributor price applied
  subtotal: number;
  shortageFulfillment: 'full' | 'partial' | 'backorder';
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note: string;
  updatedBy: string; // Role or actor name
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  actor: string;
  batchId?: string;
  quantityDelta?: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. 'ORD-2026-0041'
  tenantId: string;
  distributorId: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: 'online' | 'credit';
  paymentStatus: 'paid' | 'credit_agreed' | 'pending';
  creditDueDate?: string;
  fulfilmentMethod: 'direct_shipping' | 'distributor_pickup' | 'logistics_partner';
  logisticsPartnerId?: string;
  logisticsPartnerName?: string;
  trackingReference?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  deliveryDate?: string;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  auditTrail: AuditTrailEntry[];
  appliedRuleSummary?: string;
  cancellationReason?: string;
  returnReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnRequestItem {
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  packagingUnit: string;
  reason: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  tenantId: string;
  distributorId: string;
  distributorName: string;
  items: ReturnRequestItem[];
  type: 'cancellation' | 'return';
  distributorNote: string;
  status: 'pending' | 'approved' | 'rejected';
  manufacturerResponseNote?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface LogisticsPartner {
  id: string;
  tenantId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  coverageArea: string;
  active: boolean;
}

export interface CartItem {
  medicineId: string;
  tenantId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  packagingUnit: string;
  medicineName: string;
  genericName: string;
  batchNumber: string;
  expiryDate: string;
}

export interface RuleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  ruleSummary: string;
  effectivePrice: number;
  totalComputedPrice: number;
  remainingMonthlyQuota: number;
  isEligible: boolean;
  eligibilityIssues: string[];
}
