import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, CartItem } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { MedicineDetailModal } from './MedicineDetailModal';
import { DealsBulkPricingRail } from './DealsBulkPricingRail';
import { TrustAndCredibilityBar } from '../../common/TrustAndCredibilityBar';
import { EmptyState } from '../../ui/EmptyState';
import { 
  Search, 
  Pill, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Plus, 
  Truck,
  Building2,
  FileText
} from 'lucide-react';

export const BrowseMedicinesScreen: React.FC = () => {
  const {
    currentDistributor,
    tenants,
    distributorAuthorizedTenants,
    distributorMedicines, // STRICT: already hard-filtered to only authorized manufacturers!
    activeDistributorTenantFilter,
    setActiveDistributorTenantFilter,
    presetDemoTarget,
    setPresetDemoTarget,
    addToCart,
    addToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [detailModalMedicine, setDetailModalMedicine] = useState<Medicine | null>(null);

  // Auto-open modal if preset demo target is active
  React.useEffect(() => {
    if (presetDemoTarget?.medicineId) {
      const targetMed = distributorMedicines.find((m) => m.id === presetDemoTarget.medicineId);
      if (targetMed) {
        setDetailModalMedicine(targetMed);
      }
    }
  }, [presetDemoTarget, distributorMedicines]);

  // Visual Category Definitions
  const categories = [
    'All',
    'Antibiotics',
    'Analgesics & Antipyretics',
    'Cardiovascular',
    'Gastrointestinal',
    'Respiratory',
    'Antidiabetic',
    'Dermatological',
    'Nutritional & Vitamins',
  ];

  const filteredMedicines = distributorMedicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.regulatory.composition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || med.category === selectedCategory;

    const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
    const matchesStock = !inStockOnly || totalStock > 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  // Find unauthorized manufacturers that the distributor is NOT yet approved with
  const unauthorizedTenants = tenants.filter(
    (t) => currentDistributor.authorizedTenants[t.id]?.status !== 'approved'
  );

  // Direct "Add to order" Quick Action with full rule validation
  const handleQuickAdd = (e: React.MouseEvent, med: Medicine) => {
    e.stopPropagation();

    const qty = med.rules.minOrderQty || 10;
    const validation = validateOrderQuantity(currentDistributor, med, qty);

    if (!validation.isValid) {
      addToast('info', 'Configuration required', validation.errors[0] || 'Please specify valid batch or quantity.');
      setDetailModalMedicine(med);
      return;
    }

    const fefoBatches = sortBatchesFEFO(med.batches);
    const validBatch = fefoBatches.find(
      (b) => b.availableQuantity >= qty &&
      b.lifecycleStatus !== 'recalled' &&
      b.lifecycleStatus !== 'expired' &&
      b.lifecycleStatus !== 'expired_damaged'
    );

    if (!validBatch) {
      addToast('error', 'Batch unavailable', 'No eligible active batch found with sufficient quantity.');
      setDetailModalMedicine(med);
      return;
    }

    const item: CartItem = {
      medicineId: med.id,
      tenantId: med.tenantId,
      batchId: validBatch.id,
      quantity: qty,
      unitPrice: validation.effectivePrice,
      mrp: med.mrp,
      packagingUnit: med.packagingUnit,
      medicineName: med.name,
      genericName: med.genericName,
      batchNumber: validBatch.batchNumber,
      expiryDate: validBatch.expiryDate,
    };

    addToCart(item);
    addToast('success', 'Added to order', `Added ${qty} ${med.packagingUnit}s of ${med.name} at ${formatCurrency(validation.effectivePrice)}/unit.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Trust & Credibility Stats Strip */}
      <TrustAndCredibilityBar variant="distributor" />

      {/* Regional Sourcing & Express Fulfillment Banner */}
      <div className="bg-[#1F2E28] text-white rounded-xl p-4 sm:p-5 border border-[#2C3E36] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3D6B52]/20 text-[#A8C9B3] flex items-center justify-center shrink-0 border border-[#3D6B52]/40">
            <Truck className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans font-semibold text-[#A8C9B3]">
                Regional fulfillment hubs active
              </span>
              <span className="stamp-seal text-[9px] py-0 px-1.5 border-[#C9A961] text-[#C9A961]">
                24h Transit
              </span>
            </div>
            <p className="text-xs text-[#E2DDD2]/80 mt-0.5 font-sans">
              Direct dispatch from Bhiwandi Central Depot (MH) & Lucknow Central Depot (UP) with tamper-evident batch manifests.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#2A3C34] border border-[#384F45] text-xs font-mono text-[#E2DDD2] self-start sm:self-auto">
          <span className="text-[#C9A961]">Cutoff:</span>
          <strong className="text-white">17:30 IST</strong>
        </div>
      </div>

      {/* Buyer Header & Authorization Manifest */}
      <div className="bg-[#FCFBF8] rounded-xl p-5 sm:p-6 border border-[#E2DDD2] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="stamp-seal text-[10px]">
              Form 20B/21B Verified
            </span>
            <span className="text-xs text-[#8A8578] font-sans">
              Authorized with {distributorAuthorizedTenants.length} {distributorAuthorizedTenants.length === 1 ? 'manufacturing principal' : 'manufacturing principals'}
            </span>
          </div>

          <h1 className="text-2xl font-serif font-bold text-[#1F2E28] mt-1 tracking-tight">
            {currentDistributor.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 text-xs text-[#8A8578] font-mono">
            <span>GSTIN: <strong className="text-[#1F2E28]">{currentDistributor.gstin}</strong></span>
            <span>•</span>
            <span>DL: <strong className="text-[#1F2E28]">{currentDistributor.licenses?.form20B || 'DL-MH-20B-99823'}</strong></span>
            <span>•</span>
            <span className="font-sans text-[#1F2E28]">{currentDistributor.city}, {currentDistributor.state}</span>
          </div>
        </div>

        {/* Authorized Principals Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {distributorAuthorizedTenants.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E2DDD2] text-xs shadow-2xs"
            >
              <div className={`w-2 h-2 rounded-full ${t.logoColor}`} />
              <span className="font-sans font-medium text-[#1F2E28]">{t.shortName}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B52] stroke-[1.75]" />
            </div>
          ))}
        </div>
      </div>

      {/* Unauthorized Manufacturer Notice (Demonstrates tenant isolation) */}
      {unauthorizedTenants.length > 0 && (
        <div className="p-3.5 rounded-lg bg-[#FCFBF8] border border-[#E2DDD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#8A8578] shrink-0 stroke-[1.75]" />
            <span className="text-[#8A8578] font-sans">
              <strong className="text-[#1F2E28]">Multi-tenancy segregation:</strong> You are not currently authorized with{' '}
              <strong className="text-[#1F2E28]">
                {unauthorizedTenants.map((t) => t.shortName).join(', ')}
              </strong>
              . Their batch records, catalog, and wholesale rate contracts remain strictly isolated.
            </span>
          </div>
        </div>
      )}

      {/* 4. Deals / Volume Schemes Register Rail */}
      <DealsBulkPricingRail onSelectMedicine={(med) => setDetailModalMedicine(med)} />

      {/* Search & Category Filter Section */}
      <div className="bg-[#FCFBF8] p-4 sm:p-5 rounded-xl border border-[#E2DDD2] shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A8578] stroke-[1.75] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name, generic molecule (e.g. Paracetamol), or therapeutic composition..."
              className="w-full text-xs font-sans pl-9 pr-3.5 py-2.5 rounded-lg border border-[#E2DDD2] bg-white focus:outline-none focus:border-[#3D6B52] transition-colors"
            />
          </div>

          {/* Manufacturer Selector Dropdown */}
          <select
            value={activeDistributorTenantFilter}
            onChange={(e) => setActiveDistributorTenantFilter(e.target.value)}
            className="text-xs font-sans px-3.5 py-2.5 rounded-lg border border-[#E2DDD2] bg-white focus:outline-none focus:border-[#3D6B52] transition-colors"
          >
            <option value="all">All authorized manufacturers</option>
            {distributorAuthorizedTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs font-sans text-[#1F2E28] cursor-pointer select-none sm:px-2 py-2 sm:py-0">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-[#3D6B52] focus:ring-[#3D6B52]"
            />
            <span>In-stock only</span>
          </label>
        </div>

        {/* Category Navigation Tabs */}
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-[#E2DDD2]">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#1F2E28] text-white font-medium'
                      : 'bg-white text-[#1F2E28] border border-[#E2DDD2] hover:bg-[#F6F3EC]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Redesigned Manifest Product Grid */}
      {filteredMedicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No formulations found"
          description={
            distributorAuthorizedTenants.length === 0
              ? 'Your distributor account is not authorized with any manufacturer yet. Submit access requests under Account & Licenses.'
              : 'No matching medicines found for your search criteria or manufacturer filter. Try clearing filters.'
          }
          actionLabel="Clear filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setInStockOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((med) => {
            const tenant = tenants.find((t) => t.id === med.tenantId);
            const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
            const fefoBatches = sortBatchesFEFO(med.batches);
            const activeBatch = fefoBatches.find((b) => b.availableQuantity > 0) || fefoBatches[0];
            const pricingResult = computeEffectivePrice(med, currentDistributor.id, med.rules.minOrderQty);
            const distributorPrice = pricingResult.effectiveUnitPrice;
            const savingsPercent = med.mrp > 0 ? Math.round(((med.mrp - distributorPrice) / med.mrp) * 100) : 0;
            const isRecalled = med.batches.some((b) => b.lifecycleStatus === 'recalled');
            const isScheduleH = med.regulatory.scheduleClassification.includes('H');

            return (
              <div
                key={med.id}
                onClick={() => setDetailModalMedicine(med)}
                className="bg-white rounded-lg p-4 border border-[#E2DDD2] hover:border-[#3D6B52]/40 shadow-2xs transition-colors cursor-pointer group flex flex-col justify-between relative overflow-hidden pl-4"
              >
                {/* Thin left-edge status bar */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isRecalled
                      ? 'bg-[#B54A32]'
                      : totalStock <= 0
                      ? 'bg-[#8A8578]'
                      : isScheduleH
                      ? 'bg-[#C9A961]'
                      : 'bg-[#3D6B52]'
                  }`} 
                />

                <div className="space-y-3">
                  {/* Manufacturer & Schedule Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-sans text-[#1F2E28] flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${tenant?.logoColor || 'bg-slate-400'}`} />
                      <span className="font-semibold truncate">{tenant?.shortName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B52] shrink-0 stroke-[1.75]" />
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#8A8578] bg-[#F6F3EC] border border-[#E2DDD2] shrink-0">
                      {med.regulatory.scheduleClassification}
                    </span>
                  </div>

                  {/* Medicine Name & Molecule Line */}
                  <div>
                    <h3 className="font-serif font-bold text-[#1F2E28] text-base group-hover:text-[#3D6B52] transition-colors leading-snug">
                      {med.name}
                    </h3>
                    <div className="mt-0.5 text-xs text-[#8A8578] font-sans line-clamp-1">
                      <span>Molecule: </span>
                      <span className="text-[#1F2E28] font-medium">{med.genericName}</span>
                    </div>
                  </div>

                  {/* Register Specs Block */}
                  <div className="rounded border border-[#E5E0D5] bg-[#FCFBF8] p-2 text-[10px] divide-y divide-[#E5E0D5]">
                    <div className="grid grid-cols-2 pb-1.5 divide-x divide-[#E5E0D5]">
                      <div className="pr-2">
                        <span className="text-[9px] text-[#8A8578] block">MRP</span>
                        <span className="font-serif font-bold text-[#1F2E28] tabular-nums">{formatCurrency(med.mrp)}</span>
                      </div>
                      <div className="pl-2">
                        <span className="text-[9px] text-[#8A8578] block">Batch (FEFO)</span>
                        <span className="font-mono font-medium text-[#1F2E28] truncate block max-w-[80px]">
                          {activeBatch?.batchNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 pt-1.5 divide-x divide-[#E5E0D5]">
                      <div className="pr-2">
                        <span className="text-[9px] text-[#8A8578] block">Pack size</span>
                        <span className="font-mono text-[#1F2E28] truncate block max-w-[80px]">{med.packSize}</span>
                      </div>
                      <div className="pl-2">
                        <span className="text-[9px] text-[#8A8578] block">Available</span>
                        <span className={`font-mono font-semibold tabular-nums block ${totalStock > 0 ? 'text-[#3D6B52]' : 'text-[#B54A32]'}`}>
                          {totalStock} {med.packagingUnit}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rate Block */}
                  <div className="bg-[#FCFBF8] rounded-lg p-2.5 border border-[#E2DDD2]">
                    <div>
                      <span className="text-[10px] text-[#8A8578] font-sans block">
                        Wholesale net rate
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-serif font-bold text-[#1F2E28] tracking-tight tabular-nums">
                          {formatCurrency(distributorPrice)}
                        </span>
                        {med.mrp > 0 && (
                          <span className="text-xs text-[#8A8578] line-through font-serif tabular-nums">
                            {formatCurrency(med.mrp)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-[#E5E0D5] flex items-center justify-between text-[10px]">
                      <span className="text-[#8A8578] font-sans">
                        + 12% GST credit eligible
                      </span>
                      {savingsPercent > 0 && (
                        <span className="font-mono font-semibold text-[#3D6B52] tabular-nums">
                          {savingsPercent}% margin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ordering Conditions */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F6F3EC] text-[10px] text-[#8A8578] font-mono">
                    <span className="text-[#1F2E28]">Rules:</span>
                    <span>Min {med.rules.minOrderQty}</span>
                    {med.rules.orderMultiple > 1 && <span>• Mult ×{med.rules.orderMultiple}</span>}
                    <span>• Max {med.rules.maxOrderQty} {med.packagingUnit}s</span>
                  </div>

                  {/* Recalled Notice */}
                  {isRecalled && (
                    <div className="p-2 rounded bg-[#B54A32]/10 border border-[#B54A32]/20 text-[#B54A32] text-[10px] font-sans font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#B54A32] shrink-0 stroke-[1.75]" />
                      <span>Batch recall in effect for this SKU</span>
                    </div>
                  )}
                </div>

                {/* Card Action Row */}
                <div className="pt-3 mt-3 border-t border-[#E5E0D5] flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailModalMedicine(med);
                    }}
                    className="flex-1 py-2 rounded border border-[#E2DDD2] bg-white hover:bg-[#F6F3EC] text-[#1F2E28] font-sans font-medium text-xs transition-colors text-center"
                  >
                    Inspect batches
                  </button>

                  <button
                    onClick={(e) => handleQuickAdd(e, med)}
                    disabled={totalStock <= 0}
                    className="px-3.5 py-2 rounded bg-[#3D6B52] hover:bg-[#2F523E] disabled:bg-[#E5E0D5] disabled:text-[#8A8578] text-white font-sans font-semibold text-xs transition-colors flex items-center gap-1.5 active:scale-95 group/btn"
                    title={`Add minimum order quantity (${med.rules.minOrderQty || 10} units) to order`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Add to order</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Medicine Detail Modal */}
      {detailModalMedicine && (
        <MedicineDetailModal
          medicine={detailModalMedicine}
          onClose={() => {
            setDetailModalMedicine(null);
            setPresetDemoTarget(null);
          }}
        />
      )}
    </div>
  );
};
