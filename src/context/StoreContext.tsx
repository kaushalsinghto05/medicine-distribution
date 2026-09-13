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
  PricingConfig,
  OrderingRules,
  DistributorApprovalStatus,
  AuditTrailEntry,
} from '../types';
import {
  SEED_TENANTS,
  SEED_DISTRIBUTORS,
  SEED_MEDICINES,
  SEED_ORDERS,
  SEED_RETURN_REQUESTS,
  SEED_LOGISTICS_PARTNERS,
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
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  activeTenantId: string;
  setActiveTenantId: (id: string) => void;
  activeDistributorId: string;
  setActiveDistributorId: (id: string) => void;
  activeDistributorTenantFilter: string; // 'all' or specific tenantId for distributor marketplace
  setActiveDistributorTenantFilter: (id: string) => void;

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

  // Tenant Isolation Scoped Data
  tenantMedicines: Medicine[];
  tenantOrders: Order[];
  tenantDistributors: Distributor[];
  tenantReturnRequests: ReturnRequest[];
  tenantLogisticsPartners: LogisticsPartner[];

  // Distributor Isolation Scoped Data
  distributorAuthorizedTenants: Tenant[];
  distributorMedicines: Medicine[]; // STRICT: only authorized manufacturers!
  distributorOrders: Order[];
  distributorReturnRequests: ReturnRequest[];

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
  const [portalMode, setPortalMode] = useState<PortalMode>(() =>
    loadFromStorage<PortalMode>('portalMode', 'manufacturer')
  );
  const [activeTenantId, setActiveTenantId] = useState<string>(() =>
    loadFromStorage<string>('activeTenantId', 'mfg-acme')
  );
  const [activeDistributorId, setActiveDistributorId] = useState<string>(() =>
    loadFromStorage<string>('activeDistributorId', 'dist-medplus')
  );
  const [activeDistributorTenantFilter, setActiveDistributorTenantFilter] = useState<string>('all');

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
  const [medicines, setMedicines] = useState<Medicine[]>(() =>
    loadFromStorage<Medicine[]>('medicines', SEED_MEDICINES)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage<Order[]>('orders', SEED_ORDERS)
  );
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>(() =>
    loadFromStorage<ReturnRequest[]>('returnRequests', SEED_RETURN_REQUESTS)
  );
  const [logisticsPartners, setLogisticsPartners] = useState<LogisticsPartner[]>(() =>
    loadFromStorage<LogisticsPartner[]>('logisticsPartners', SEED_LOGISTICS_PARTNERS)
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
        cart,
        toasts,
        tenantMedicines,
        tenantOrders,
        tenantDistributors,
        tenantReturnRequests,
        tenantLogisticsPartners,
        distributorAuthorizedTenants,
        distributorMedicines,
        distributorOrders,
        distributorReturnRequests,
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
