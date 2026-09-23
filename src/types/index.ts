// Core Data Models for B2B Medicine Distribution Marketplace

export type Role = 'manufacturer' | 'distributor';

export type PortalMode = 'manufacturer' | 'distributor';

export type AppPage = 
  | 'home' 
  | 'marketplace' 
  | 'pavilion' 
  | 'coldchain' 
  | 'licenses' 
  | 'credit' 
  | 'orders' 
  | 'waste'
  | 'cart';

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
  allowedFulfilmentMethods?: ('direct_shipping' | 'distributor_pickup' | 'logistics_partner')[];
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

export type BatchLifecycleStatus = 
  | 'active'
  | 'near_expiry'
  | 'expired'
  | 'expired_damaged'
  | 'flagged_for_disposal'
  | 'collected_for_disposal'
  | 'disposed'
  | 'recalled';

export type BatchLocation = 
  | 'manufacturer_warehouse'
  | 'with_distributor'
  | 'in_transit_disposal'
  | 'facility_destroyed';

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
  status?: BatchLifecycleStatus;
  lifecycleStatus?: BatchLifecycleStatus;
  location?: BatchLocation;
  recalled?: boolean;
  recallReason?: string;
  flaggedQuantity?: number;
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
  imageUrl?: string; // Product packaging photo / render
  indication?: string; // Plain-English indication, e.g. "Fever, Headache & Body Pain"
  indicationIcon?: string; // Visual icon emoji, e.g. "🩺"
  dosageFormLabel?: string; // Friendly dosage form, e.g. "Tablets", "Syrup", "Injection", "Capsules"
  primaryNeed?: string; // Category for quick illness filter, e.g. "fever", "antibiotic", "bp", "diabetes", etc.
  description: string;
  status: 'draft' | 'published';
  regulatory: RegulatoryCompliance;
  batches: Batch[];
  pricing: PricingConfig;
  rules: OrderingRules;
  createdAt: string;
  updatedAt: string;
}

export interface AddMedicineInput {
  tenantId?: string;
  name: string;
  genericName: string;
  brandName?: string;
  category: MedicineCategory;
  packagingUnit: string;
  packSize: string;
  mrp: number;
  ptrPrice?: number;
  imageUrl?: string;
  description?: string;
  scheduleClassification?: ScheduleClassification;
  rxRequired?: boolean;
  isColdChain?: boolean;
  batchNumber?: string;
  mfgDate?: string;
  expDate?: string;
  initialQuantity?: number;
  minOrderQty?: number;
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

// ----------------------------------------------------
// Waste & Expired Medicine Management Models
// ----------------------------------------------------

export type WastePartnerType = 'standard_logistics' | 'certified_waste_disposal';

export interface WasteDisposalPartner extends LogisticsPartner {
  type: WastePartnerType;
  cpcbLicenseNumber?: string; // Central Pollution Control Board Hazardous Waste License
  destructionMethods?: string[]; // e.g., 'High-temp Incineration', 'Autoclaving & Shredding', 'Chemical Inactivation'
}

export type DisposalRequestStatus = 
  | 'pending'
  | 'pickup_scheduled'
  | 'collected'
  | 'destroyed';

export interface WasteDisposalRequest {
  id: string; // e.g. 'WDR-2026-001'
  tenantId: string;
  batchId: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  packagingUnit: string;
  estimatedLossAmount: number;
  partnerId?: string;
  partnerName?: string;
  pickupScheduledDate?: string;
  status: DisposalRequestStatus;
  notes?: string;
  certificateNumber?: string;
  certificateUrl?: string; // Mock file upload
  certificateUploadedAt?: string;
  createdAt: string;
  completedAt?: string;
  disposalMethod?: string;
}

export type WasteReturnReason = 
  | 'expired'
  | 'damaged_transit'
  | 'near_expiry_return'
  | 'recall';

export type WasteReturnStatus = 
  | 'requested'
  | 'manufacturer_review'
  | 'approved'
  | 'rejected'
  | 'collection_scheduled'
  | 'disposed_credited';

export type WasteCompensationPolicy = 'replace_stock' | 'credit_note' | 'none_recall';

export interface WasteReturnRequest {
  id: string; // e.g. 'WRR-2026-001'
  tenantId: string;
  distributorId: string;
  distributorName: string;
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  packagingUnit: string;
  reason: WasteReturnReason;
  photoEvidenceUrl?: string;
  status: WasteReturnStatus;
  compensationType?: WasteCompensationPolicy;
  creditAmount?: number;
  rejectionReason?: string;
  distributorNotes?: string;
  manufacturerNotes?: string;
  pickupScheduledDate?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type ComplianceActionType = 
  | 'flagged_disposal'
  | 'disposal_partner_assigned'
  | 'collected'
  | 'certificate_issued'
  | 'batch_recalled'
  | 'distributor_waste_credited'
  | 'distributor_waste_reported';

export interface ComplianceLedgerEntry {
  id: string; // e.g. 'CMP-2026-0081'
  timestamp: string;
  tenantId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actionType: ComplianceActionType;
  batchId: string;
  batchNumber: string;
  medicineName: string;
  quantity: number;
  certificateRef?: string;
  notes: string;
  ipAddress?: string;
  hashSignature?: string; // Mock SHA-256 for immutability verification
}

export interface ManufacturerWasteConfig {
  nearExpiryThresholdDays: number; // e.g. 90, 60, 30
  defaultWastePartnerId: string;
  defaultCompensationPolicy: WasteCompensationPolicy;
  requirePhotoEvidence: boolean;
}

// ----------------------------------------------------
// JWT Authentication Models
// ----------------------------------------------------

export type JWTRole = 'manufacturer_admin' | 'manufacturer_staff' | 'distributor';

export interface JWTPayload {
  sub: string; // User ID e.g. 'usr-acme-admin-01'
  email: string;
  name: string;
  role: JWTRole;
  tenantId?: string; // If manufacturer_admin or manufacturer_staff
  distributorId?: string; // If distributor
  authorizedManufacturerIds: string[]; // List of tenantIds permitted to access
  iat: number; // Issued at (Unix timestamp sec)
  exp: number; // Expires at (Unix timestamp sec)
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: JWTPayload;
  isExpired: boolean;
}

export interface B2BSignupInput {
  role: 'distributor' | 'manufacturer';
  companyName: string;
  contactName: string;
  email: string;
  password?: string;
  phone?: string;
  drugLicenseNumber: string; // Form 20B/21B or Form 25/28
  gstin: string;
  state: string;
  city?: string;
}

