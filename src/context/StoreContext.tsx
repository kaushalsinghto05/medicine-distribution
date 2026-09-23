import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Tenant,
  Distributor,
  Medicine,
  Batch,
  Order,
  OrderStatus,
  ReturnRequest,
  LogisticsPartner,
  CartItem,
  PortalMode,
  AppPage,
  PricingConfig,
  OrderingRules,
  DistributorApprovalStatus,
  AuditTrailEntry,
  WasteDisposalPartner,
  WasteDisposalRequest,
  WasteReturnRequest,
  ComplianceLedgerEntry,
  ManufacturerWasteConfig,
  AddMedicineInput,
  B2BSignupInput,
} from '../types';
import {
  SEED_TENANTS,
  SEED_DISTRIBUTORS,
  SEED_MEDICINES,
  SEED_ORDERS,
  SEED_RETURN_REQUESTS,
  SEED_LOGISTICS_PARTNERS,
  SEED_WASTE_PARTNERS,
  SEED_WASTE_DISPOSAL_REQUESTS,
  SEED_WASTE_RETURN_REQUESTS,
  SEED_COMPLIANCE_LEDGER,
  SEED_WASTE_CONFIGS,
} from '../data/seedData';
import { deductBatchInventory, restockBatchInventory } from '../engine/inventoryEngine';
import { validateOrderQuantity } from '../engine/rulesEngine';
import { computeEffectivePrice } from '../engine/pricingEngine';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

interface StoreContextType {
  // Navigation & Role Context
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;
  navigateToPage: (page: AppPage) => void;
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  activeTenantId: string;
  setActiveTenantId: (id: string) => void;
  activeDistributorId: string;
  setActiveDistributorId: (id: string) => void;
  activeDistributorTenantFilter: string; // 'all' or specific tenantId for distributor marketplace
  setActiveDistributorTenantFilter: (id: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  isAddMedicineModalOpen: boolean;
  setIsAddMedicineModalOpen: (open: boolean) => void;
  addNewMedicine: (input: AddMedicineInput) => Medicine;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginPromptMessage: string;
  setLoginPromptMessage: (msg: string) => void;
  openLoginModal: (message?: string, pendingItem?: CartItem) => void;
  pendingAddToCartItem: CartItem | null;
  setPendingAddToCartItem: (item: CartItem | null) => void;
  registerNewDistributor: (input: B2BSignupInput) => Distributor;
  registerNewTenant: (input: B2BSignupInput) => Tenant;

  // Active Entities
  currentTenant: Tenant;
  currentDistributor: Distributor;

  // Raw State Data
  tenants: Tenant[];
  distributors: Distributor[];
  medicines: Medicine[];
  orders: Order[];
  returnRequests: ReturnRequest[];
  logisticsPartners: LogisticsPartner[];
  cart: CartItem[];
  toasts: ToastMessage[];

  // Waste Management State
  wastePartners: WasteDisposalPartner[];
  wasteDisposalRequests: WasteDisposalRequest[];
  wasteReturnRequests: WasteReturnRequest[];
  complianceLedger: ComplianceLedgerEntry[];
  wasteConfigs: Record<string, ManufacturerWasteConfig>;

  // Tenant Isolation Scoped Data
  tenantMedicines: Medicine[];
  tenantOrders: Order[];
  tenantDistributors: Distributor[];
  tenantReturnRequests: ReturnRequest[];
  tenantLogisticsPartners: LogisticsPartner[];
  tenantWastePartners: WasteDisposalPartner[];
  tenantWasteDisposalRequests: WasteDisposalRequest[];
  tenantWasteReturnRequests: WasteReturnRequest[];
  tenantComplianceLedger: ComplianceLedgerEntry[];
  currentTenantWasteConfig: ManufacturerWasteConfig;

  // Distributor Isolation Scoped Data
  distributorAuthorizedTenants: Tenant[];
  distributorMedicines: Medicine[]; // STRICT: only authorized manufacturers!
  distributorOrders: Order[];
  distributorReturnRequests: ReturnRequest[];
  distributorWasteRequests: WasteReturnRequest[];

  // Notification Toast Actions
  addToast: (type: ToastMessage['type'], title: string, description?: string) => void;
  removeToast: (id: string) => void;

  // Manufacturer Management Actions
  createMedicine: (newMed: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicine: (updatedMed: Medicine) => void;
  addBatch: (medicineId: string, batchData: Omit<Batch, 'id' | 'medicineId' | 'tenantId'>) => void;
  publishMedicine: (medicineId: string) => { success: boolean; checklistErrors: string[] };
  updatePricing: (medicineId: string, pricingConfig: PricingConfig) => void;
  updateRules: (medicineId: string, rules: OrderingRules) => void;
  approveDistributor: (distributorId: string, tenantId: string, creditDays?: number, creditLimit?: number) => void;
  rejectDistributor: (distributorId: string, tenantId: string, reason: string) => void;
  suspendDistributor: (distributorId: string, tenantId: string, reason: string) => void;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    logistics?: { partnerId?: string; trackingRef?: string }
  ) => void;
  approveReturnRequest: (requestId: string, note?: string) => void;
  rejectReturnRequest: (requestId: string, note?: string) => void;
  addLogisticsPartner: (partnerData: Omit<LogisticsPartner, 'id' | 'tenantId'>) => void;

  // Waste Management Actions
  raiseDisposalRequest: (params: {
    batchId: string;
    medicineId: string;
    quantity: number;
    partnerId: string;
    scheduledDate: string;
    disposalMethod?: string;
    notes?: string;
  }) => void;
  scheduleDisposalPickup: (requestId: string, pickupDate: string, partnerId: string) => void;
  completeDisposalWithCertificate: (params: {
    requestId: string;
    certificateNumber: string;
    certificateFileMockName?: string;
    notes?: string;
  }) => void;
  triggerBatchRecall: (params: {
    batchId: string;
    medicineId: string;
    recallReason: string;
  }) => void;
  approveDistributorWasteReturn: (params: {
    requestId: string;
    compensationType: 'replace_stock' | 'credit_note' | 'none_recall';
    creditAmount?: number;
    notes?: string;
  }) => void;
  rejectDistributorWasteReturn: (requestId: string, reason: string) => void;
  updateWasteConfig: (tenantId: string, config: Partial<ManufacturerWasteConfig>) => void;

  // Distributor Actions
  requestAccessToTenant: (tenantId: string, form20B: string, form21B: string) => void;
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (medicineId: string, batchId: string, quantity: number) => void;
  removeFromCart: (medicineId: string, batchId: string) => void;
  clearCart: () => void;
  checkoutOrder: (params: {
    tenantId: string;
    items: CartItem[];
    paymentMethod: 'online' | 'credit';
    fulfilmentMethod: 'direct_shipping' | 'distributor_pickup' | 'logistics_partner';
  }) => Order | null;
  createReturnRequest: (
    orderId: string,
    type: 'cancellation' | 'return',
    items: { medicineId: string; batchId: string; quantity: number; reason: string }[],
    distributorNote: string
  ) => void;
  createDistributorWasteRequest: (params: {
    tenantId: string;
    medicineId: string;
    batchId: string;
    batchNumber: string;
    quantity: number;
    packagingUnit: string;
    reason: 'expired' | 'damaged_transit' | 'near_expiry_return' | 'recall';
    photoEvidenceUrl?: string;
    distributorNotes?: string;
  }) => void;

  // System Helpers
  resetToSeedData: () => void;
  presetDemoTarget: {
    medicineId?: string;
    targetQty?: number;
    description?: string;
  } | null;
  setPresetDemoTarget: (target: { medicineId?: string; targetQty?: number; description?: string } | null) => void;
}


const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'pharma_b2b_v2_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage`, e);
  }
}

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation States
  const [activePage, setActivePage] = useState<AppPage>(() =>
    loadFromStorage<AppPage>('activePage', 'home')
  );
  const [portalMode, setPortalModeState] = useState<PortalMode>(() =>
    loadFromStorage<PortalMode>('portalMode', 'distributor')
  );

  const setPortalMode = (mode: PortalMode) => {
    setPortalModeState(mode);
    saveToStorage('portalMode', mode);
  };

  const navigateToPage = (page: AppPage) => {
    setActivePage(page);
    saveToStorage('activePage', page);
    // Any customer-facing page navigation switches back to distributor wholesale view
    setPortalMode('distributor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [activeTenantId, setActiveTenantId] = useState<string>(() =>
    loadFromStorage<string>('activeTenantId', 'mfg-acme')
  );
  const [activeDistributorId, setActiveDistributorId] = useState<string>(() =>
    loadFromStorage<string>('activeDistributorId', 'dist-medplus')
  );
  const [activeDistributorTenantFilter, setActiveDistributorTenantFilter] = useState<string>('all');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState<string>('');
  const [pendingAddToCartItem, setPendingAddToCartItem] = useState<CartItem | null>(null);

  const openLoginModal = (message?: string, pendingItem?: CartItem) => {
    setLoginPromptMessage(message || 'Please log in to your B2B wholesale account to continue.');
    if (pendingItem) {
      setPendingAddToCartItem(pendingItem);
    }
    setIsLoginModalOpen(true);
  };

  // Interactive Test Preset Helper
  const [presetDemoTarget, setPresetDemoTarget] = useState<{
    medicineId?: string;
    targetQty?: number;
    description?: string;
  } | null>(null);

  // Entities State
  const [tenants, setTenants] = useState<Tenant[]>(() =>
    loadFromStorage<Tenant[]>('tenants', SEED_TENANTS)
  );
  const [distributors, setDistributors] = useState<Distributor[]>(() =>
    loadFromStorage<Distributor[]>('distributors', SEED_DISTRIBUTORS)
  );
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const stored = loadFromStorage<Medicine[]>('medicines', SEED_MEDICINES);
    if (stored && Array.isArray(stored)) {
      const storedIds = new Set(stored.map((m) => m.id));
      const missing = SEED_MEDICINES.filter((m) => !storedIds.has(m.id));
      // Also update existing seed medicines if they lack indication/picture
      const updated = stored.map((item) => {
        const seed = SEED_MEDICINES.find((s) => s.id === item.id);
        if (seed && (!item.indication || !item.imageUrl)) {
          return { ...item, indication: seed.indication, indicationIcon: seed.indicationIcon, dosageFormLabel: seed.dosageFormLabel, primaryNeed: seed.primaryNeed, imageUrl: item.imageUrl || seed.imageUrl };
        }
        return item;
      });
      return [...updated, ...missing];
    }
    return SEED_MEDICINES;
  });
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage<Order[]>('orders', SEED_ORDERS)
  );
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>(() =>
    loadFromStorage<ReturnRequest[]>('returnRequests', SEED_RETURN_REQUESTS)
  );
  const [logisticsPartners, setLogisticsPartners] = useState<LogisticsPartner[]>(() =>
    loadFromStorage<LogisticsPartner[]>('logisticsPartners', SEED_LOGISTICS_PARTNERS)
  );
  const [wastePartners, setWastePartners] = useState<WasteDisposalPartner[]>(() =>
    loadFromStorage<WasteDisposalPartner[]>('wastePartners', SEED_WASTE_PARTNERS)
  );
  const [wasteDisposalRequests, setWasteDisposalRequests] = useState<WasteDisposalRequest[]>(() =>
    loadFromStorage<WasteDisposalRequest[]>('wasteDisposalRequests', SEED_WASTE_DISPOSAL_REQUESTS)
  );
  const [wasteReturnRequests, setWasteReturnRequests] = useState<WasteReturnRequest[]>(() =>
    loadFromStorage<WasteReturnRequest[]>('wasteReturnRequests', SEED_WASTE_RETURN_REQUESTS)
  );
  const [complianceLedger, setComplianceLedger] = useState<ComplianceLedgerEntry[]>(() =>
    loadFromStorage<ComplianceLedgerEntry[]>('complianceLedger', SEED_COMPLIANCE_LEDGER)
  );
  const [wasteConfigs, setWasteConfigs] = useState<Record<string, ManufacturerWasteConfig>>(() =>
    loadFromStorage<Record<string, ManufacturerWasteConfig>>('wasteConfigs', SEED_WASTE_CONFIGS)
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>('cart', [])
  );

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to LocalStorage
  useEffect(() => saveToStorage('portalMode', portalMode), [portalMode]);
  useEffect(() => saveToStorage('activeTenantId', activeTenantId), [activeTenantId]);
  useEffect(() => saveToStorage('activeDistributorId', activeDistributorId), [activeDistributorId]);
  useEffect(() => saveToStorage('tenants', tenants), [tenants]);
  useEffect(() => saveToStorage('distributors', distributors), [distributors]);
  useEffect(() => saveToStorage('medicines', medicines), [medicines]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('returnRequests', returnRequests), [returnRequests]);
  useEffect(() => saveToStorage('logisticsPartners', logisticsPartners), [logisticsPartners]);
  useEffect(() => saveToStorage('wastePartners', wastePartners), [wastePartners]);
  useEffect(() => saveToStorage('wasteDisposalRequests', wasteDisposalRequests), [wasteDisposalRequests]);
  useEffect(() => saveToStorage('wasteReturnRequests', wasteReturnRequests), [wasteReturnRequests]);
  useEffect(() => saveToStorage('complianceLedger', complianceLedger), [complianceLedger]);
  useEffect(() => saveToStorage('wasteConfigs', wasteConfigs), [wasteConfigs]);
  useEffect(() => saveToStorage('cart', cart), [cart]);

  // Current Entities
  const currentTenant = useMemo(() => {
    return tenants.find((t) => t.id === activeTenantId) || tenants[0];
  }, [tenants, activeTenantId]);

  const currentDistributor = useMemo(() => {
    return distributors.find((d) => d.id === activeDistributorId) || distributors[0];
  }, [distributors, activeDistributorId]);

  // --- STRICT TENANT ISOLATION SCOPES (Manufacturer) ---
  const tenantMedicines = useMemo(() => {
    return medicines.filter((m) => m.tenantId === activeTenantId);
  }, [medicines, activeTenantId]);

  const tenantOrders = useMemo(() => {
    return orders.filter((o) => o.tenantId === activeTenantId);
  }, [orders, activeTenantId]);

  const tenantDistributors = useMemo(() => {
    return distributors.filter((d) => d.authorizedTenants[activeTenantId] !== undefined);
  }, [distributors, activeTenantId]);

  const tenantReturnRequests = useMemo(() => {
    return returnRequests.filter((r) => r.tenantId === activeTenantId);
  }, [returnRequests, activeTenantId]);

  const tenantLogisticsPartners = useMemo(() => {
    return logisticsPartners.filter((lp) => lp.tenantId === activeTenantId);
  }, [logisticsPartners, activeTenantId]);

  const tenantWastePartners = useMemo(() => {
    return wastePartners.filter((wp) => wp.tenantId === activeTenantId);
  }, [wastePartners, activeTenantId]);

  const tenantWasteDisposalRequests = useMemo(() => {
    return wasteDisposalRequests.filter((wdr) => wdr.tenantId === activeTenantId);
  }, [wasteDisposalRequests, activeTenantId]);

  const tenantWasteReturnRequests = useMemo(() => {
    return wasteReturnRequests.filter((wrr) => wrr.tenantId === activeTenantId);
  }, [wasteReturnRequests, activeTenantId]);

  const tenantComplianceLedger = useMemo(() => {
    return complianceLedger.filter((entry) => entry.tenantId === activeTenantId);
  }, [complianceLedger, activeTenantId]);

  const currentTenantWasteConfig = useMemo(() => {
    return wasteConfigs[activeTenantId] || {
      nearExpiryThresholdDays: 60,
      defaultWastePartnerId: tenantWastePartners[0]?.id || '',
      defaultCompensationPolicy: 'credit_note',
      requirePhotoEvidence: true,
    };
  }, [wasteConfigs, activeTenantId, tenantWastePartners]);

  // --- STRICT DISTRIBUTOR ISOLATION SCOPES (Marketplace) ---
  const distributorAuthorizedTenants = useMemo(() => {
    const authTenantIds = Object.entries(currentDistributor.authorizedTenants)
      .filter(([_, rel]) => rel.status === 'approved')
      .map(([tId]) => tId);
    return tenants.filter((t) => authTenantIds.includes(t.id));
  }, [tenants, currentDistributor]);

  // HARD MULTI-TENANCY RULE: Distributor ONLY sees medicines from approved manufacturers!
  const distributorMedicines = useMemo(() => {
    const authorizedTenantIds = Object.entries(currentDistributor.authorizedTenants)
      .filter(([_, rel]) => rel.status === 'approved')
      .map(([tId]) => tId);

    return medicines.filter((m) => {
      // Must belong to an authorized manufacturer
      if (!authorizedTenantIds.includes(m.tenantId)) return false;
      // Must be published
      if (m.status !== 'published') return false;
      // Filter by selected manufacturer if not 'all'
      if (activeDistributorTenantFilter !== 'all' && m.tenantId !== activeDistributorTenantFilter) {
        return false;
      }
      return true;
    });
  }, [medicines, currentDistributor, activeDistributorTenantFilter]);

  const distributorOrders = useMemo(() => {
    return orders.filter((o) => o.distributorId === activeDistributorId);
  }, [orders, activeDistributorId]);

  const distributorReturnRequests = useMemo(() => {
    return returnRequests.filter((r) => r.distributorId === activeDistributorId);
  }, [returnRequests, activeDistributorId]);

  const distributorWasteRequests = useMemo(() => {
    return wasteReturnRequests.filter((w) => w.distributorId === activeDistributorId);
  }, [wasteReturnRequests, activeDistributorId]);

  // --- MANUFACTURER ACTIONS ---
  const createMedicine = (newMed: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const created: Medicine = {
      ...newMed,
      id,
      tenantId: activeTenantId,
      createdAt: now,
      updatedAt: now,
    };
    setMedicines((prev) => [created, ...prev]);
    addToast('success', 'Medicine Added', `${created.name} was successfully created as Draft.`);
  };

  const addNewMedicine = (input: AddMedicineInput): Medicine => {
    const tenantId = input.tenantId || activeTenantId || 'mfg-acme';
    const medId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const batchNumber = input.batchNumber?.trim() || `BAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const mfgDate = input.mfgDate || '2026-03-01';
    const expDate = input.expDate || '2028-06-30';
    const initialQty = input.initialQuantity || 5000;
    const ptrPrice = input.ptrPrice || Math.round(input.mrp * 0.7);

    const initialBatch: Batch = {
      id: batchId,
      medicineId: medId,
      tenantId,
      batchNumber,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      initialQuantity: initialQty,
      availableQuantity: initialQty,
      packagingUnit: input.packagingUnit || 'strip',
      mrp: input.mrp,
      costPrice: Math.round(ptrPrice * 0.8),
      status: 'active',
      lifecycleStatus: 'active',
      location: 'manufacturer_warehouse',
    };

    const targetTenant = tenants.find((t) => t.id === tenantId) || currentTenant;

    const created: Medicine = {
      id: medId,
      tenantId,
      name: input.name,
      genericName: input.genericName,
      brandName: input.brandName || input.name,
      category: input.category,
      packagingUnit: input.packagingUnit || 'strip',
      packSize: input.packSize || '10 x 10 Tablets',
      mrp: input.mrp,
      imageUrl: input.imageUrl,
      description: input.description || `${input.name} (${input.genericName}) manufactured under strict WHO-GMP compliance.`,
      status: 'published',
      regulatory: {
        scheduleClassification: input.scheduleClassification || 'Schedule H',
        rxRequired: input.rxRequired ?? true,
        drugLicenseNumber: targetTenant.drugLicenseNumber,
        composition: `${input.genericName} pharmaceutical grade formulation`,
        storageConditions: input.isColdChain ? 'Store between 2°C to 8°C. Do not freeze.' : 'Store below 25°C in a dry place',
        isColdChain: input.isColdChain ?? false,
        isRestrictedSale: false,
        standardPackagingUnit: input.packagingUnit || 'strip',
      },
      batches: [initialBatch],
      pricing: {
        medicineId: medId,
        tenantId,
        standardDistributorPrice: ptrPrice,
        distributorOverrides: {},
        slabs: [
          { minQty: (input.minOrderQty || 10) * 5, maxQty: (input.minOrderQty || 10) * 10, pricePerUnit: Math.round(ptrPrice * 0.95) },
          { minQty: (input.minOrderQty || 10) * 10 + 1, maxQty: Infinity, pricePerUnit: Math.round(ptrPrice * 0.9) },
        ],
        discounts: [],
      },
      rules: {
        medicineId: medId,
        tenantId,
        minOrderQty: input.minOrderQty || 10,
        orderMultiple: 10,
        maxOrderQty: 1000,
        maxDistributorCap: 5000,
        dailyLimit: 1000,
        weeklyLimit: 2500,
        monthlyLimit: 5000,
        shortageBehavior: 'reject',
        distributorEligibility: {
          approvalRequired: true,
          licenseVerifiedRequired: true,
          activeAccountOnly: true,
          restrictedScheduleAllowed: false,
        },
        applicablePaymentTerms: ['online', 'credit'],
        creditTermsDays: 30,
      },
      createdAt: now,
      updatedAt: now,
    };

    setMedicines((prev) => [created, ...prev]);
    addToast('success', 'Medicine Added to Marketplace', `${created.name} (${created.packSize}) has been registered with ${initialQty} units in Batch ${batchNumber}.`);
    return created;
  };

  const registerNewDistributor = (input: B2BSignupInput): Distributor => {
    const distId = `dist-${Date.now()}`;
    const newDist: Distributor = {
      id: distId,
      name: input.companyName,
      contactPerson: input.contactName,
      email: input.email,
      phone: input.phone || '+91 98765 43210',
      gstin: input.gstin || '27AABCA1234F1Z5',
      panNumber: 'AAAPL' + Math.floor(1000 + Math.random() * 9000) + 'K',
      address: `${input.city || 'Central Wholesale Market'}, ${input.state || 'Maharashtra'}`,
      state: input.state || 'Maharashtra',
      city: input.city || 'Mumbai Metro',
      pincode: '400001',
      accountStatus: 'active',
      licenses: {
        form20B: input.drugLicenseNumber || '20B-MH-MZ1-2026-999',
        form21B: (input.drugLicenseNumber || '20B-MH-MZ1-2026-999').replace('20B', '21B'),
        validFrom: '2024-01-01',
        validTo: '2029-12-31',
        verified: true,
      },
      authorizedTenants: {
        'mfg-acme': {
          tenantId: 'mfg-acme',
          status: 'approved',
          assignedCreditDays: 30,
          creditLimit: 500000,
          creditUsed: 0,
          monthlyQuantityLimit: 5000,
          monthlyQuantityUsed: 0,
        },
        'mfg-vitalis': {
          tenantId: 'mfg-vitalis',
          status: 'approved',
          assignedCreditDays: 30,
          creditLimit: 500000,
          creditUsed: 0,
          monthlyQuantityLimit: 5000,
          monthlyQuantityUsed: 0,
        },
      },
    };

    setDistributors((prev) => [newDist, ...prev]);
    setActiveDistributorId(distId);
    setPortalMode('distributor');
    addToast('success', 'B2B Wholesale Account Created', `Registered ${newDist.name} with CDSCO Form 20B/21B wholesale license.`);
    return newDist;
  };

  const registerNewTenant = (input: B2BSignupInput): Tenant => {
    const tenantId = `mfg-${Date.now()}`;
    const newTenant: Tenant = {
      id: tenantId,
      name: input.companyName,
      shortName: input.companyName.split(' ')[0] || 'PharmaMfg',
      tagline: 'Precision Formulations & B2B Manufacturing',
      logoColor: 'bg-emerald-700',
      drugLicenseNumber: input.drugLicenseNumber || 'MFG-MH-2026-0044',
      gstin: input.gstin || '27AABCM9876F1Z2',
      panNumber: 'AABCP' + Math.floor(1000 + Math.random() * 9000) + 'L',
      contactEmail: input.email,
      contactPhone: input.phone || '+91 98765 00000',
      address: `${input.city || 'Pharma Industrial Park'}, ${input.state || 'Maharashtra'}`,
      state: input.state || 'Maharashtra',
      allowedPaymentTerms: ['online', 'credit'],
      allowedFulfilmentMethods: ['direct_shipping', 'distributor_pickup', 'logistics_partner'],
      defaultCreditPeriodDays: 30,
      minOrderValueDefault: 10000,
    };

    setTenants((prev) => [newTenant, ...prev]);
    setActiveTenantId(tenantId);
    setPortalMode('manufacturer');
    addToast('success', 'Manufacturing Principal Registered', `Welcome ${newTenant.name}. Manufacturing portal active.`);
    return newTenant;
  };

  const updateMedicine = (updatedMed: Medicine) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === updatedMed.id
          ? { ...updatedMed, tenantId: activeTenantId, updatedAt: new Date().toISOString() }
          : m
      )
    );
    addToast('success', 'Medicine Updated', `Changes to ${updatedMed.name} saved.`);
  };

  const addBatch = (medicineId: string, batchData: Omit<Batch, 'id' | 'medicineId' | 'tenantId'>) => {
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBatch: Batch = {
      ...batchData,
      id: batchId,
      medicineId,
      tenantId: activeTenantId,
    };

    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== medicineId) return m;
        return {
          ...m,
          batches: [...m.batches, newBatch],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('success', 'Batch Added', `Batch ${newBatch.batchNumber} added with ${newBatch.availableQuantity} ${newBatch.packagingUnit}s.`);
  };

  const publishMedicine = (medicineId: string) => {
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return { success: false, checklistErrors: ['Medicine not found'] };

    const errors: string[] = [];
    if (!med.batches || med.batches.length === 0) {
      errors.push('At least one batch with manufacturing and expiry dates must be added.');
    }
    if (!med.pricing || med.pricing.standardDistributorPrice <= 0) {
      errors.push('Standard distributor price must be configured and greater than ₹0.');
    }
    if (!med.rules || med.rules.minOrderQty <= 0) {
      errors.push('Ordering rules (MOQ, multiples) must be configured.');
    }

    if (errors.length > 0) {
      addToast('error', 'Cannot Publish Medicine', errors[0]);
      return { success: false, checklistErrors: errors };
    }

    setMedicines((prev) =>
      prev.map((m) => (m.id === medicineId ? { ...m, status: 'published', updatedAt: new Date().toISOString() } : m))
    );
    addToast('success', 'Medicine Published', `${med.name} is now visible to authorized distributors.`);
    return { success: true, checklistErrors: [] };
  };

  const updatePricing = (medicineId: string, pricingConfig: PricingConfig) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === medicineId ? { ...m, pricing: pricingConfig, updatedAt: new Date().toISOString() } : m))
    );
    addToast('success', 'Pricing Updated', 'Pricing tiers, overrides, and discounts updated.');
  };

  const updateRules = (medicineId: string, rules: OrderingRules) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === medicineId ? { ...m, rules, updatedAt: new Date().toISOString() } : m))
    );
    addToast('success', 'Rules Updated', 'Ordering rules and distributor policies updated.');
  };

  const approveDistributor = (
    distributorId: string,
    tenantId: string,
    creditDays: number = 30,
    creditLimit: number = 500000
  ) => {
    setDistributors((prev) =>
      prev.map((d) => {
        if (d.id !== distributorId) return d;
        const currentRel = d.authorizedTenants[tenantId] || {
          tenantId,
          status: 'pending',
          assignedCreditDays: creditDays,
          creditLimit,
          creditUsed: 0,
          monthlyQuantityLimit: 2000,
          monthlyQuantityUsed: 0,
        };
        return {
          ...d,
          authorizedTenants: {
            ...d.authorizedTenants,
            [tenantId]: {
              ...currentRel,
              status: 'approved',
              approvedAt: new Date().toISOString(),
              assignedCreditDays: creditDays,
              creditLimit,
              rejectionReason: undefined,
              suspensionReason: undefined,
            },
          },
        };
      })
    );
    addToast('success', 'Distributor Approved', 'Distributor granted purchasing rights.');
  };

  const rejectDistributor = (distributorId: string, tenantId: string, reason: string) => {
    setDistributors((prev) =>
      prev.map((d) => {
        if (d.id !== distributorId) return d;
        const currentRel = d.authorizedTenants[tenantId];
        return {
          ...d,
          authorizedTenants: {
            ...d.authorizedTenants,
            [tenantId]: {
              ...(currentRel || {
                tenantId,
                assignedCreditDays: 0,
                creditLimit: 0,
                creditUsed: 0,
                monthlyQuantityLimit: 0,
                monthlyQuantityUsed: 0,
              }),
              status: 'rejected',
              rejectionReason: reason,
            },
          },
        };
      })
    );
    addToast('warning', 'Distributor Rejected', `Access denied: ${reason}`);
  };

  const suspendDistributor = (distributorId: string, tenantId: string, reason: string) => {
    setDistributors((prev) =>
      prev.map((d) => {
        if (d.id !== distributorId) return d;
        const currentRel = d.authorizedTenants[tenantId];
        if (!currentRel) return d;
        return {
          ...d,
          authorizedTenants: {
            ...d.authorizedTenants,
            [tenantId]: {
              ...currentRel,
              status: 'suspended',
              suspensionReason: reason,
            },
          },
        };
      })
    );
    addToast('warning', 'Distributor Suspended', `Account suspended: ${reason}`);
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    logistics?: { partnerId?: string; trackingRef?: string }
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const partner = logistics?.partnerId
          ? logisticsPartners.find((lp) => lp.id === logistics.partnerId)
          : undefined;

        const now = new Date().toISOString();
        const historyEntry = {
          status: newStatus,
          timestamp: now,
          note: note || `Status transitioned to ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
          updatedBy: `${currentTenant.shortName} Operations`,
        };

        const auditEntry: AuditTrailEntry = {
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          action: `STATUS_${newStatus.toUpperCase()}`,
          details: `Order status moved to ${newStatus}. ${note || ''}`,
          actor: `${currentTenant.shortName} Team`,
        };

        return {
          ...ord,
          status: newStatus,
          logisticsPartnerId: logistics?.partnerId || ord.logisticsPartnerId,
          logisticsPartnerName: partner?.name || ord.logisticsPartnerName,
          trackingReference: logistics?.trackingRef || ord.trackingReference,
          dispatchDate: newStatus === 'dispatched' ? now : ord.dispatchDate,
          deliveryDate: newStatus === 'delivered' ? now : ord.deliveryDate,
          statusHistory: [...ord.statusHistory, historyEntry],
          auditTrail: [...ord.auditTrail, auditEntry],
          updatedAt: now,
        };
      })
    );
    addToast('success', 'Order Updated', `Order status changed to ${newStatus.replace(/_/g, ' ').toUpperCase()}.`);
  };

  // Restock when manufacturer approves cancellation/return request!
  const approveReturnRequest = (requestId: string, note?: string) => {
    const req = returnRequests.find((r) => r.id === requestId);
    if (!req) return;

    // 1. Restock inventory
    const { updatedMedicines, auditLogs } = restockBatchInventory(medicines, req, `${currentTenant.shortName} Admin`);
    setMedicines(updatedMedicines);

    // 2. Decrement distributor used quota (restoring quota)
    setDistributors((prev) =>
      prev.map((d) => {
        if (d.id !== req.distributorId) return d;
        const rel = d.authorizedTenants[req.tenantId];
        if (!rel) return d;

        const totalReturnedQty = req.items.reduce((sum, it) => sum + it.quantity, 0);
        return {
          ...d,
          authorizedTenants: {
            ...d.authorizedTenants,
            [req.tenantId]: {
              ...rel,
              monthlyQuantityUsed: Math.max(0, rel.monthlyQuantityUsed - totalReturnedQty),
            },
          },
        };
      })
    );

    // 3. Mark return request approved
    const now = new Date().toISOString();
    setReturnRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              manufacturerResponseNote: note || 'Approved and inventory successfully restocked into active batch.',
              resolvedAt: now,
              resolvedBy: `${currentTenant.shortName} QA/Returns Desk`,
            }
          : r
      )
    );

    // 4. Update the related order status to 'returned' or 'cancelled'
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== req.orderId) return ord;
        const targetStatus: OrderStatus = req.type === 'cancellation' ? 'cancelled' : 'returned';
        return {
          ...ord,
          status: targetStatus,
          statusHistory: [
            ...ord.statusHistory,
            {
              status: targetStatus,
              timestamp: now,
              note: `Return/Cancellation request ${req.id} approved by manufacturer. Stock restored.`,
              updatedBy: `${currentTenant.shortName} Admin`,
            },
          ],
          auditTrail: [...ord.auditTrail, ...auditLogs],
          updatedAt: now,
        };
      })
    );

    addToast(
      'success',
      'Request Approved & Restocked',
      `Inventory has been automatically returned to batch stock and quota restored.`
    );
  };

  const rejectReturnRequest = (requestId: string, note?: string) => {
    const now = new Date().toISOString();
    setReturnRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              manufacturerResponseNote: note || 'Request rejected by manufacturer after physical compliance check.',
              resolvedAt: now,
              resolvedBy: `${currentTenant.shortName} Desk`,
            }
          : r
      )
    );
    addToast('warning', 'Request Rejected', 'The return/cancellation request was rejected.');
  };

  const addLogisticsPartner = (partnerData: Omit<LogisticsPartner, 'id' | 'tenantId'>) => {
    const newPartner: LogisticsPartner = {
      ...partnerData,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId: activeTenantId,
    };
    setLogisticsPartners((prev) => [...prev, newPartner]);
    addToast('success', 'Carrier Partner Added', `${newPartner.name} added to approved freight roster.`);
  };

  // --- WASTE & EXPIRED MEDICINE MANAGEMENT ACTIONS ---
  const raiseDisposalRequest = (params: {
    batchId: string;
    medicineId: string;
    quantity: number;
    partnerId: string;
    scheduledDate: string;
    disposalMethod?: string;
    notes?: string;
  }) => {
    const targetMed = medicines.find((m) => m.id === params.medicineId);
    const targetBatch = targetMed?.batches.find((b) => b.id === params.batchId);
    if (!targetMed || !targetBatch) {
      addToast('error', 'Batch Not Found', 'Could not locate medicine or batch to raise disposal request.');
      return;
    }

    const partner = wastePartners.find((wp) => wp.id === params.partnerId);
    const partnerName = partner?.name || 'Authorized CPCB Disposal Agency';
    const requestId = `WDR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const estimatedLoss = params.quantity * (targetBatch.costPrice || targetBatch.mrp * 0.5);

    const newRequest: WasteDisposalRequest = {
      id: requestId,
      tenantId: activeTenantId,
      batchId: targetBatch.id,
      medicineId: targetMed.id,
      medicineName: targetMed.name,
      batchNumber: targetBatch.batchNumber,
      quantity: params.quantity,
      packagingUnit: targetBatch.packagingUnit,
      estimatedLossAmount: estimatedLoss,
      partnerId: params.partnerId,
      partnerName,
      pickupScheduledDate: params.scheduledDate,
      status: 'pickup_scheduled',
      notes: params.notes || 'Quarantined stock scheduled for bio-medical hazardous waste pickup.',
      createdAt: now,
      disposalMethod: params.disposalMethod || 'High-temp Incineration (1100°C)',
    };

    // Update batch status to flagged_for_disposal and deduct from available quantity if still present
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== params.medicineId) return m;
        return {
          ...m,
          batches: m.batches.map((b) => {
            if (b.id !== params.batchId) return b;
            return {
              ...b,
              status: 'flagged_for_disposal',
              availableQuantity: Math.max(0, b.availableQuantity - params.quantity),
              flaggedQuantity: (b.flaggedQuantity || 0) + params.quantity,
            };
          }),
        };
      })
    );

    setWasteDisposalRequests((prev) => [newRequest, ...prev]);

    // Append to immutable compliance ledger
    const ledgerEntry: ComplianceLedgerEntry = {
      id: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: now,
      tenantId: activeTenantId,
      actorId: 'usr-acme-admin-01',
      actorName: `${currentTenant.shortName} Authorized Officer`,
      actorRole: 'manufacturer_admin',
      actionType: 'flagged_disposal',
      batchId: targetBatch.id,
      batchNumber: targetBatch.batchNumber,
      medicineName: targetMed.name,
      quantity: params.quantity,
      notes: `Disposal request ${requestId} created. Assigned partner: ${partnerName}. Scheduled for ${params.scheduledDate}.`,
      ipAddress: '192.168.1.104',
      hashSignature: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    setComplianceLedger((prev) => [ledgerEntry, ...prev]);
    addToast('success', 'Disposal Request Scheduled', `Request ${requestId} assigned to ${partnerName}.`);
  };

  const scheduleDisposalPickup = (requestId: string, pickupDate: string, partnerId: string) => {
    const partner = wastePartners.find((wp) => wp.id === partnerId);
    setWasteDisposalRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          partnerId,
          partnerName: partner?.name || r.partnerName,
          pickupScheduledDate: pickupDate,
          status: 'pickup_scheduled',
        };
      })
    );
    addToast('info', 'Pickup Rescheduled', `Pickup date updated to ${pickupDate}.`);
  };

  const completeDisposalWithCertificate = (params: {
    requestId: string;
    certificateNumber: string;
    certificateFileMockName?: string;
    notes?: string;
  }) => {
    const targetReq = wasteDisposalRequests.find((r) => r.id === params.requestId);
    if (!targetReq) return;

    const now = new Date().toISOString();
    const certNumber = params.certificateNumber.trim() || `COD-${currentTenant.shortName.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    setWasteDisposalRequests((prev) =>
      prev.map((r) => {
        if (r.id !== params.requestId) return r;
        return {
          ...r,
          status: 'destroyed',
          certificateNumber: certNumber,
          certificateUrl: params.certificateFileMockName || 'certificate-of-destruction.pdf',
          certificateUploadedAt: now,
          completedAt: now,
          notes: params.notes || r.notes,
        };
      })
    );

    // Update batch to disposed
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== targetReq.medicineId) return m;
        return {
          ...m,
          batches: m.batches.map((b) => {
            if (b.id !== targetReq.batchId) return b;
            return {
              ...b,
              status: 'disposed',
              location: 'facility_destroyed',
              flaggedQuantity: 0,
            };
          }),
        };
      })
    );

    // Immutable compliance ledger entry
    const ledgerEntry: ComplianceLedgerEntry = {
      id: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: now,
      tenantId: activeTenantId,
      actorId: 'usr-acme-admin-01',
      actorName: `${currentTenant.shortName} Authorized Officer`,
      actorRole: 'manufacturer_admin',
      actionType: 'certificate_issued',
      batchId: targetReq.batchId,
      batchNumber: targetReq.batchNumber,
      medicineName: targetReq.medicineName,
      quantity: targetReq.quantity,
      certificateRef: certNumber,
      notes: `Certificate of Destruction ${certNumber} verified & sealed into regulatory audit ledger. Physical destruction confirmed.`,
      ipAddress: '192.168.1.104',
      hashSignature: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    setComplianceLedger((prev) => [ledgerEntry, ...prev]);
    addToast('success', 'Disposal Certified', `Certificate of Destruction #${certNumber} linked to immutable audit trail.`);
  };

  const triggerBatchRecall = (params: {
    batchId: string;
    medicineId: string;
    recallReason: string;
  }) => {
    const targetMed = medicines.find((m) => m.id === params.medicineId);
    const targetBatch = targetMed?.batches.find((b) => b.id === params.batchId);
    if (!targetMed || !targetBatch) {
      addToast('error', 'Batch Not Found', 'Target batch for recall was not found.');
      return;
    }

    const now = new Date().toISOString();

    // 1. Mark batch as recalled and 0 out available stock
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== params.medicineId) return m;
        return {
          ...m,
          batches: m.batches.map((b) => {
            if (b.id !== params.batchId) return b;
            return {
              ...b,
              status: 'recalled',
              recalled: true,
              recallReason: params.recallReason,
              availableQuantity: 0,
              flaggedQuantity: (b.flaggedQuantity || 0) + b.availableQuantity,
            };
          }),
        };
      })
    );

    // 2. Find all distributors who received this batch in fulfilled orders
    const affectedOrders = orders.filter(
      (o) =>
        o.tenantId === activeTenantId &&
        o.status !== 'cancelled' &&
        o.items.some((it) => it.batchId === params.batchId)
    );

    const autoRequests: WasteReturnRequest[] = [];
    const notifiedDistributorIds = new Set<string>();

    affectedOrders.forEach((ord) => {
      const lineItem = ord.items.find((it) => it.batchId === params.batchId);
      if (!lineItem) return;

      const dist = distributors.find((d) => d.id === ord.distributorId);
      notifiedDistributorIds.add(ord.distributorId);

      autoRequests.push({
        id: `WRR-2026-${Math.floor(100 + Math.random() * 900)}`,
        tenantId: activeTenantId,
        distributorId: ord.distributorId,
        distributorName: dist?.name || ord.distributorId,
        medicineId: targetMed.id,
        medicineName: targetMed.name,
        batchId: targetBatch.id,
        batchNumber: targetBatch.batchNumber,
        quantity: lineItem.fulfilledQuantity,
        packagingUnit: targetBatch.packagingUnit,
        reason: 'recall',
        status: 'approved',
        compensationType: 'none_recall',
        distributorNotes: `Auto-generated mandatory recall request for order ${ord.orderNumber}. Reason: ${params.recallReason}`,
        manufacturerNotes: 'Manufacturer mandatory batch recall. Quarantined for immediate carrier collection.',
        createdAt: now,
        resolvedAt: now,
      });
    });

    if (autoRequests.length > 0) {
      setWasteReturnRequests((prev) => [...autoRequests, ...prev]);
    }

    // 3. Compliance Ledger Entry
    const ledgerEntry: ComplianceLedgerEntry = {
      id: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: now,
      tenantId: activeTenantId,
      actorId: 'usr-acme-admin-01',
      actorName: `${currentTenant.shortName} Admin`,
      actorRole: 'manufacturer_admin',
      actionType: 'batch_recalled',
      batchId: targetBatch.id,
      batchNumber: targetBatch.batchNumber,
      medicineName: targetMed.name,
      quantity: targetBatch.initialQuantity,
      notes: `Batch Recall Alert triggered: "${params.recallReason}". Broadcast sent to ${notifiedDistributorIds.size} holding distributor(s).`,
      ipAddress: '192.168.1.104',
      hashSignature: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    setComplianceLedger((prev) => [ledgerEntry, ...prev]);

    addToast(
      'error',
      'Batch Recall Broadcasted',
      `Batch ${targetBatch.batchNumber} recalled. ${notifiedDistributorIds.size} distributors notified and return requests generated.`
    );
  };

  const approveDistributorWasteReturn = (params: {
    requestId: string;
    compensationType: 'replace_stock' | 'credit_note' | 'none_recall';
    creditAmount?: number;
    notes?: string;
  }) => {
    const target = wasteReturnRequests.find((r) => r.id === params.requestId);
    if (!target) return;

    const now = new Date().toISOString();

    setWasteReturnRequests((prev) =>
      prev.map((r) => {
        if (r.id !== params.requestId) return r;
        return {
          ...r,
          status: 'disposed_credited',
          compensationType: params.compensationType,
          creditAmount: params.creditAmount || (params.compensationType === 'credit_note' ? target.quantity * 85 : 0),
          manufacturerNotes: params.notes || `Approved with policy: ${params.compensationType.replace(/_/g, ' ')}.`,
          resolvedAt: now,
        };
      })
    );

    // Ledger entry
    const ledgerEntry: ComplianceLedgerEntry = {
      id: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: now,
      tenantId: activeTenantId,
      actorId: 'usr-acme-admin-01',
      actorName: `${currentTenant.shortName} Admin`,
      actorRole: 'manufacturer_admin',
      actionType: 'distributor_waste_credited',
      batchId: target.batchId,
      batchNumber: target.batchNumber,
      medicineName: target.medicineName,
      quantity: target.quantity,
      notes: `Approved distributor waste return ${target.id} from ${target.distributorName}. Compensation: ${params.compensationType}.`,
      ipAddress: '192.168.1.104',
      hashSignature: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    setComplianceLedger((prev) => [ledgerEntry, ...prev]);
    addToast('success', 'Waste Return Approved', `Request ${target.id} approved (${params.compensationType.replace(/_/g, ' ')}).`);
  };

  const rejectDistributorWasteReturn = (requestId: string, reason: string) => {
    const now = new Date().toISOString();
    setWasteReturnRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: 'rejected',
          rejectionReason: reason,
          resolvedAt: now,
        };
      })
    );
    addToast('warning', 'Waste Request Rejected', `Request ${requestId} rejected: ${reason}`);
  };

  const updateWasteConfig = (tenantId: string, config: Partial<ManufacturerWasteConfig>) => {
    setWasteConfigs((prev) => {
      const existing = prev[tenantId] || {
        nearExpiryThresholdDays: 60,
        defaultWastePartnerId: '',
        defaultCompensationPolicy: 'credit_note',
        requirePhotoEvidence: true,
      };
      return {
        ...prev,
        [tenantId]: { ...existing, ...config },
      };
    });
    addToast('success', 'Policy Settings Saved', 'Waste governance policies updated.');
  };

  const createDistributorWasteRequest = (params: {
    tenantId: string;
    medicineId: string;
    batchId: string;
    batchNumber: string;
    quantity: number;
    packagingUnit: string;
    reason: 'expired' | 'damaged_transit' | 'near_expiry_return' | 'recall';
    photoEvidenceUrl?: string;
    distributorNotes?: string;
  }) => {
    const med = medicines.find((m) => m.id === params.medicineId);
    const requestId = `WRR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newReq: WasteReturnRequest = {
      id: requestId,
      tenantId: params.tenantId,
      distributorId: activeDistributorId,
      distributorName: currentDistributor.name,
      medicineId: params.medicineId,
      medicineName: med?.name || 'Pharmaceutical Item',
      batchId: params.batchId,
      batchNumber: params.batchNumber,
      quantity: params.quantity,
      packagingUnit: params.packagingUnit,
      reason: params.reason,
      photoEvidenceUrl: params.photoEvidenceUrl || 'evidence-photo.jpg',
      status: 'requested',
      distributorNotes: params.distributorNotes,
      createdAt: now,
    };

    setWasteReturnRequests((prev) => [newReq, ...prev]);

    // Add entry to compliance ledger
    const ledgerEntry: ComplianceLedgerEntry = {
      id: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: now,
      tenantId: params.tenantId,
      actorId: activeDistributorId,
      actorName: currentDistributor.name,
      actorRole: 'distributor',
      actionType: 'distributor_waste_reported',
      batchId: params.batchId,
      batchNumber: params.batchNumber,
      medicineName: med?.name || 'Pharmaceutical Item',
      quantity: params.quantity,
      notes: `Distributor reported ${params.quantity} units for ${params.reason.replace(/_/g, ' ')}. Evidence photo attached.`,
      ipAddress: '192.168.1.104',
      hashSignature: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    setComplianceLedger((prev) => [ledgerEntry, ...prev]);
    addToast('success', 'Return Request Filed', `Waste Return Request ${requestId} submitted to manufacturer.`);
  };

  // --- DISTRIBUTOR ACTIONS ---
  const requestAccessToTenant = (tenantId: string, form20B: string, form21B: string) => {
    setDistributors((prev) =>
      prev.map((d) => {
        if (d.id !== activeDistributorId) return d;
        return {
          ...d,
          licenses: {
            ...d.licenses,
            form20B: form20B || d.licenses.form20B,
            form21B: form21B || d.licenses.form21B,
          },
          authorizedTenants: {
            ...d.authorizedTenants,
            [tenantId]: {
              tenantId,
              status: 'pending',
              assignedCreditDays: 30,
              creditLimit: 0,
              creditUsed: 0,
              monthlyQuantityLimit: 1000,
              monthlyQuantityUsed: 0,
            },
          },
        };
      })
    );
    addToast(
      'info',
      'Access Requisition Submitted',
      'Your wholesale drug licenses were submitted for manufacturer compliance approval.'
    );
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.medicineId === item.medicineId && ci.batchId === item.batchId);
      if (existing) {
        const newQty = existing.quantity + item.quantity;
        const med = medicines.find((m) => m.id === item.medicineId);
        const effectivePrice = med
          ? computeEffectivePrice(med, currentDistributor.id, newQty).effectiveUnitPrice
          : item.unitPrice;
        return prev.map((ci) =>
          ci.medicineId === item.medicineId && ci.batchId === item.batchId
            ? { ...ci, quantity: newQty, unitPrice: effectivePrice }
            : ci
        );
      }
      return [...prev, item];
    });
    addToast('success', 'Added to Cart', `${item.quantity} ${item.packagingUnit}s of ${item.medicineName}`);
  };

  const updateCartQuantity = (medicineId: string, batchId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId, batchId);
      return;
    }
    const med = medicines.find((m) => m.id === medicineId);
    setCart((prev) =>
      prev.map((ci) => {
        if (ci.medicineId === medicineId && ci.batchId === batchId) {
          const effectivePrice = med
            ? computeEffectivePrice(med, currentDistributor.id, quantity).effectiveUnitPrice
            : ci.unitPrice;
          return { ...ci, quantity, unitPrice: effectivePrice };
        }
        return ci;
      })
    );
  };

  const removeFromCart = (medicineId: string, batchId: string) => {
    setCart((prev) => prev.filter((ci) => !(ci.medicineId === medicineId && ci.batchId === batchId)));
  };

  const clearCart = () => {
    setCart([]);
  };

  /**
   * CHECKOUT ORDER
   * Atomic inventory deduction, zero-negative guarantee, quota update, and order record creation.
   */
  const checkoutOrder = ({
    tenantId,
    items,
    paymentMethod,
    fulfilmentMethod,
  }: {
    tenantId: string;
    items: CartItem[];
    paymentMethod: 'online' | 'credit';
    fulfilmentMethod: 'direct_shipping' | 'distributor_pickup' | 'logistics_partner';
  }): Order | null => {
    const distributor = currentDistributor;
    const now = new Date().toISOString();
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Re-validate all items against latest stock and rules
    for (const item of items) {
      const med = medicines.find((m) => m.id === item.medicineId);
      if (!med) {
        addToast('error', 'Checkout Error', `Medicine ${item.medicineName} no longer exists.`);
        return null;
      }
      const validation = validateOrderQuantity(distributor, med, item.quantity);
      if (!validation.isValid) {
        addToast('error', 'Validation Failed at Checkout', validation.errors[0]);
        return null;
      }
    }

    // Build Order Items
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const lineSubtotal = item.unitPrice * item.quantity;
      subtotal += lineSubtotal;
      return {
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        genericName: item.genericName,
        batchId: item.batchId,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        packagingUnit: item.packagingUnit,
        requestedQuantity: item.quantity,
        fulfilledQuantity: item.quantity, // Atomic allocation
        backorderedQuantity: 0,
        unitMrp: item.mrp,
        unitPrice: item.unitPrice,
        subtotal: lineSubtotal,
        shortageFulfillment: 'full' as const,
      };
    });

    const gstAmount = Math.round(subtotal * 0.12); // Standard 12% GST on pharmaceuticals
    const totalAmount = subtotal + gstAmount;

    // 1. ATOMIC INVENTORY DEDUCTION (Guarantees no negative stock)
    const { updatedMedicines, auditLogs } = deductBatchInventory(
      medicines,
      orderItems,
      orderNumber,
      `${distributor.name} Procurement`
    );
    setMedicines(updatedMedicines);

    // 2. UPDATE DISTRIBUTOR MONTHLY QUOTA AND CREDIT (Test Case 2: 10,000 -> 9,500; Quota: 2,000 -> 1,500)
    const totalQuantityBought = items.reduce((sum, it) => sum + it.quantity, 0);
    setDistributors((prev) =>
      prev.map((d) => {
        if (d.id !== distributor.id) return d;
        const rel = d.authorizedTenants[tenantId];
        if (!rel) return d;

        return {
          ...d,
          authorizedTenants: {
            ...d.authorizedTenants,
            [tenantId]: {
              ...rel,
              monthlyQuantityUsed: rel.monthlyQuantityUsed + totalQuantityBought,
              creditUsed: paymentMethod === 'credit' ? rel.creditUsed + totalAmount : rel.creditUsed,
            },
          },
        };
      })
    );

    // 3. CREATE ORDER
    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderNumber,
      tenantId,
      distributorId: distributor.id,
      items: orderItems,
      subtotal,
      discountTotal: 0,
      gstAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'credit_agreed',
      creditDueDate:
        paymentMethod === 'credit'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined,
      fulfilmentMethod,
      status: paymentMethod === 'online' ? 'confirmed' : 'new',
      statusHistory: [
        {
          status: paymentMethod === 'online' ? 'confirmed' : 'new',
          timestamp: now,
          note:
            paymentMethod === 'online'
              ? 'Order placed with instant online payment verification'
              : 'Order placed under Net 30 Credit Terms',
          updatedBy: `${distributor.name} Checkout`,
        },
      ],
      auditTrail: [
        {
          id: `audit-${Date.now()}-created`,
          timestamp: now,
          action: 'ORDER_CREATED',
          details: `Order ${orderNumber} created for ${totalQuantityBought} units total. Value: ₹${totalAmount.toLocaleString()}.`,
          actor: `${distributor.name} Checkout`,
        },
        ...auditLogs,
      ],
      appliedRuleSummary: `Authorized order: ${totalQuantityBought} units allocated under strict FEFO.`,
      createdAt: now,
      updatedAt: now,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Remove bought items from cart
    setCart((prev) => prev.filter((ci) => ci.tenantId !== tenantId));

    addToast(
      'success',
      'Order Placed Successfully!',
      `Order #${orderNumber} created. Inventory deducted and quota updated.`
    );

    return newOrder;
  };

  const createReturnRequest = (
    orderId: string,
    type: 'cancellation' | 'return',
    items: { medicineId: string; batchId: string; quantity: number; reason: string }[],
    distributorNote: string
  ) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    const reqId = `ret-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const returnItems = items.map((it) => {
      const orderItem = ord.items.find((oi) => oi.batchId === it.batchId);
      return {
        medicineId: it.medicineId,
        medicineName: orderItem?.medicineName || 'Medicine',
        batchId: it.batchId,
        batchNumber: orderItem?.batchNumber || 'Batch',
        quantity: it.quantity,
        packagingUnit: orderItem?.packagingUnit || 'strip',
        reason: it.reason,
      };
    });

    const newRequest: ReturnRequest = {
      id: reqId,
      orderId,
      orderNumber: ord.orderNumber,
      tenantId: ord.tenantId,
      distributorId: currentDistributor.id,
      distributorName: currentDistributor.name,
      type,
      items: returnItems,
      distributorNote,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setReturnRequests((prev) => [newRequest, ...prev]);
    addToast(
      'info',
      `${type === 'cancellation' ? 'Cancellation' : 'Return'} Request Submitted`,
      'Request forwarded to manufacturer admin queue for inspection and stock credit.'
    );
  };

  const resetToSeedData = () => {
    localStorage.clear();
    setTenants(SEED_TENANTS);
    setDistributors(SEED_DISTRIBUTORS);
    setMedicines(SEED_MEDICINES);
    setOrders(SEED_ORDERS);
    setReturnRequests(SEED_RETURN_REQUESTS);
    setLogisticsPartners(SEED_LOGISTICS_PARTNERS);
    setWastePartners(SEED_WASTE_PARTNERS);
    setWasteDisposalRequests(SEED_WASTE_DISPOSAL_REQUESTS);
    setWasteReturnRequests(SEED_WASTE_RETURN_REQUESTS);
    setComplianceLedger(SEED_COMPLIANCE_LEDGER);
    setWasteConfigs(SEED_WASTE_CONFIGS);
    setCart([]);
    setActiveTenantId('mfg-acme');
    setActiveDistributorId('dist-medplus');
    setPortalMode('manufacturer');
    setPresetDemoTarget(null);
    addToast('success', 'Reset Complete', 'System state restored to reference baseline seed data.');
  };

  return (
    <StoreContext.Provider
      value={{
        portalMode,
        setPortalMode,
        activeTenantId,
        setActiveTenantId,
        activeDistributorId,
        setActiveDistributorId,
        activeDistributorTenantFilter,
        setActiveDistributorTenantFilter,
        currentTenant,
        currentDistributor,
        tenants,
        distributors,
        medicines,
        orders,
        returnRequests,
        logisticsPartners,
        wastePartners,
        wasteDisposalRequests,
        wasteReturnRequests,
        complianceLedger,
        wasteConfigs,
        cart,
        toasts,
        tenantMedicines,
        tenantOrders,
        tenantDistributors,
        tenantReturnRequests,
        tenantLogisticsPartners,
        tenantWastePartners,
        tenantWasteDisposalRequests,
        tenantWasteReturnRequests,
        tenantComplianceLedger,
        currentTenantWasteConfig,
        distributorAuthorizedTenants,
        distributorMedicines,
        distributorOrders,
        distributorReturnRequests,
        distributorWasteRequests,
        addToast,
        removeToast,
        createMedicine,
        updateMedicine,
        addBatch,
        publishMedicine,
        updatePricing,
        updateRules,
        approveDistributor,
        rejectDistributor,
        suspendDistributor,
        updateOrderStatus,
        approveReturnRequest,
        rejectReturnRequest,
        addLogisticsPartner,
        raiseDisposalRequest,
        scheduleDisposalPickup,
        completeDisposalWithCertificate,
        triggerBatchRecall,
        approveDistributorWasteReturn,
        rejectDistributorWasteReturn,
        updateWasteConfig,
        createDistributorWasteRequest,
        requestAccessToTenant,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        checkoutOrder,
        createReturnRequest,
        resetToSeedData,
        presetDemoTarget,
        setPresetDemoTarget,
        globalSearchQuery,
        setGlobalSearchQuery,
        isAddMedicineModalOpen,
        setIsAddMedicineModalOpen,
        addNewMedicine,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginPromptMessage,
        setLoginPromptMessage,
        openLoginModal,
        pendingAddToCartItem,
        setPendingAddToCartItem,
        registerNewDistributor,
        registerNewTenant,
        activePage,
        setActivePage,
        navigateToPage,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
