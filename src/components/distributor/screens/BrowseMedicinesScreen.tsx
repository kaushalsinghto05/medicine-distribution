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
  Activity, 
  HeartPulse, 
  Droplet, 
  Apple, 
  ShieldCheck, 
  Layers, 
  Tag, 
  Sparkles,
  Info,
  Truck
} from 'lucide-react';

export const BrowseMedicinesScreen: React.FC = () => {
  const {
    currentDistributor,
    tenants,
    distributorAuthorizedTenants,
    distributorMedicines, // STRICT: already hard-filtered to authorized manufacturers!
    activeDistributorTenantFilter,
    setActiveDistributorTenantFilter,
    presetDemoTarget,
    setPresetDemoTarget,
    addToCart,
    addToast,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useStore();

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

  // Visual Category Definitions with Representative Icons
  const categoryDefinitions = [
    { name: 'All', icon: Sparkles, color: 'bg-teal-50 text-[#1A504C]' },
    { name: 'Antibiotics', icon: Pill, color: 'bg-emerald-50 text-emerald-700' },
    { name: 'Analgesics & Antipyretics', icon: Activity, color: 'bg-blue-50 text-blue-700' },
    { name: 'Cardiovascular', icon: HeartPulse, color: 'bg-rose-50 text-rose-700' },
    { name: 'Gastrointestinal', icon: Droplet, color: 'bg-amber-50 text-amber-700' },
    { name: 'Respiratory', icon: ShieldCheck, color: 'bg-indigo-50 text-indigo-700' },
    { name: 'Antidiabetic', icon: Layers, color: 'bg-cyan-50 text-cyan-700' },
    { name: 'Dermatological', icon: Tag, color: 'bg-purple-50 text-purple-700' },
    { name: 'Nutritional & Vitamins', icon: Apple, color: 'bg-orange-50 text-orange-700' },
  ];

  const filteredMedicines = distributorMedicines.filter((med) => {
    const query = globalSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      med.name.toLowerCase().includes(query) ||
      med.genericName.toLowerCase().includes(query) ||
      med.regulatory.composition.toLowerCase().includes(query);
    const matchesCat = selectedCategory === 'All' || med.category === selectedCategory;

    const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
    const matchesStock = !inStockOnly || totalStock > 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  const unauthorizedTenants = tenants.filter(
    (t) => currentDistributor.authorizedTenants[t.id]?.status !== 'approved'
  );

  const handleQuickAdd = (e: React.MouseEvent, med: Medicine) => {
    e.stopPropagation();

    const qty = med.rules.minOrderQty || 10;
    const validation = validateOrderQuantity(currentDistributor, med, qty);

    if (!validation.isValid) {
      addToast('info', 'Configuration Required', validation.errors[0] || 'Please specify valid batch or quantity.');
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
      addToast('error', 'Batch Unavailable', 'No eligible active batch found with sufficient quantity.');
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
    addToast('success', 'Added to Cart', `Added ${qty} ${med.packagingUnit}s of ${med.name} at ${formatCurrency(validation.effectivePrice)}/unit.`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Antibiotics': return Pill;
      case 'Analgesics & Antipyretics': return Activity;
      case 'Cardiovascular': return HeartPulse;
      case 'Gastrointestinal': return Droplet;
      case 'Respiratory': return ShieldCheck;
      case 'Antidiabetic': return Layers;
      case 'Dermatological': return Tag;
      case 'Nutritional & Vitamins': return Apple;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Trust & Credibility Stats Strip */}
      <TrustAndCredibilityBar variant="distributor" />

      {/* 2. Deals of the Day & Bulk Pricing Rail */}
      <DealsBulkPricingRail onSelectMedicine={(med) => setDetailModalMedicine(med)} />

      {/* 3. Shop by Category: Circular Icon Rail (Apollo / PharmEasy Pattern) */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#1A1A1A] tracking-tight">
            Shop Formulations by Category
          </h3>
          <span className="text-xs text-[#6B7280]">
            {filteredMedicines.length} Formulations Available
          </span>
        </div>

        {/* Circular Category Buttons */}
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-200">
          {categoryDefinitions.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#1A504C] text-white shadow-md ring-2 ring-[#1A504C] ring-offset-2 scale-105'
                      : 'bg-[#F5F8F6] text-[#1A504C] group-hover:bg-[#E8F3F1] group-hover:scale-102 border border-gray-200'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[1.75]" />
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-semibold text-center max-w-[84px] line-clamp-1 leading-tight ${
                    isSelected ? 'text-[#1A504C] font-extrabold' : 'text-[#6B7280] group-hover:text-[#1A1A1A]'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter & In-Stock Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <select
            value={activeDistributorTenantFilter}
            onChange={(e) => setActiveDistributorTenantFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-[#F5F8F6] text-[#1A1A1A] focus:outline-none focus:border-[#1A504C]"
          >
            <option value="all">All Authorized Principals</option>
            {distributorAuthorizedTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] cursor-pointer select-none px-2 py-1.5 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-[#1A504C] focus:ring-[#1A504C]"
            />
            <span>In-Stock Only</span>
          </label>
        </div>

        {globalSearchQuery && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B7280]">
              Filtering for: <strong className="text-[#1A1A1A]">"{globalSearchQuery}"</strong>
            </span>
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="text-[#EA580C] hover:underline font-bold text-xs"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Multi-Tenancy Isolation Alert */}
      {unauthorizedTenants.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#F5F8F6] border border-gray-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#6B7280] shrink-0" />
            <span className="text-[#6B7280]">
              <strong className="text-[#1A1A1A]">B2B Tenant Isolation Active:</strong> Catalogs and wholesale pricing from{' '}
              <strong className="text-[#1A1A1A]">{unauthorizedTenants.map((t) => t.shortName).join(', ')}</strong>{' '}
              remain strictly isolated until your Form 20B/21B wholesale license access request is approved.
            </span>
          </div>
        </div>
      )}

      {/* 5. Retail-Grade Product Cards Grid */}
      {filteredMedicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Formulations Found"
          description={
            distributorAuthorizedTenants.length === 0
              ? 'Your distributor account is not authorized with any manufacturer yet. Submit access requests under Account & Licenses.'
              : 'No matching medicines found for your search criteria or filters. Try clearing search filters.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setGlobalSearchQuery('');
            setSelectedCategory('All');
            setInStockOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const tenant = tenants.find((t) => t.id === med.tenantId);
            const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
            const fefoBatches = sortBatchesFEFO(med.batches);
            const activeBatch = fefoBatches.find((b) => b.availableQuantity > 0) || fefoBatches[0];
            const pricingResult = computeEffectivePrice(med, currentDistributor.id, med.rules.minOrderQty);
            const distributorPrice = pricingResult.effectiveUnitPrice;
            const savingsPercent = med.mrp > 0 ? Math.round(((med.mrp - distributorPrice) / med.mrp) * 100) : 0;
            const isRecalled = med.batches.some((b) => b.lifecycleStatus === 'recalled');
            const CategoryIcon = getCategoryIcon(med.category);

            return (
              <div
                key={med.id}
                onClick={() => setDetailModalMedicine(med)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 hover:border-[#1A504C] hover:shadow-lg transition-all duration-150 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Product-Image-First Area: Soft pastel category placeholder tile */}
                  <div className="w-full h-36 rounded-xl bg-[#F5F8F6] border border-gray-100 flex items-center justify-center relative overflow-hidden">
                    <CategoryIcon className="w-12 h-12 text-[#1A504C]/60 group-hover:scale-110 transition-transform duration-200" />

                    {/* Warm Discount Badge: Top Right Corner */}
                    {savingsPercent > 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-[#EA580C] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow-xs tracking-wide">
                        {savingsPercent}% OFF
                      </div>
                    )}

                    {/* Schedule Badge: Top Left Corner */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 backdrop-blur-2xs border border-gray-200 text-purple-800">
                      {med.regulatory.scheduleClassification}
                    </div>

                    {/* Manufacturing Principal Tag: Bottom Left */}
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-white/90 backdrop-blur-2xs border border-gray-200 text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${tenant?.logoColor || 'bg-gray-400'}`} />
                      <span className="truncate max-w-[120px]">{tenant?.shortName}</span>
                    </div>
                  </div>

                  {/* Product Name & Molecule Composition */}
                  <div>
                    <h3 className="font-extrabold text-[#1A1A1A] text-base group-hover:text-[#1A504C] transition-colors line-clamp-2 leading-snug">
                      {med.name}
                    </h3>
                    <p className="text-xs text-[#6B7280] truncate mt-0.5 font-medium">
                      {med.genericName}
                    </p>
                  </div>

                  {/* Retail Price Block: "₹145 ₹210 (31% off)" on a single line */}
                  <div className="pt-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
                        {formatCurrency(distributorPrice)}
                      </span>
                      {med.mrp > 0 && (
                        <span className="text-xs text-gray-400 line-through tabular-nums font-normal">
                          {formatCurrency(med.mrp)}
                        </span>
                      )}
                      {savingsPercent > 0 && (
                        <span className="text-xs font-bold text-emerald-700">
                          ({savingsPercent}% off)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6B7280] block mt-0.5">
                      + 12% GST Input Tax Credit Eligible
                    </span>
                  </div>

                  {/* Compact Subordinated B2B Specs Row */}
                  <div className="rounded-xl bg-[#F5F8F6] border border-gray-100 p-2.5 text-[11px] divide-y divide-gray-200/60">
                    <div className="grid grid-cols-2 pb-1.5 divide-x divide-gray-200/60">
                      <div className="pr-2">
                        <span className="text-[9px] text-[#6B7280] block font-medium uppercase">Pack</span>
                        <span className="font-bold text-[#1A1A1A] truncate block">{med.packSize}</span>
                      </div>
                      <div className="pl-2">
                        <span className="text-[9px] text-[#6B7280] block font-medium uppercase">Batch (FEFO)</span>
                        <span className="font-bold text-[#1A1A1A] truncate block">{activeBatch?.batchNumber || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 pt-1.5 divide-x divide-gray-200/60">
                      <div className="pr-2">
                        <span className="text-[9px] text-[#6B7280] block font-medium uppercase">Stock</span>
                        <span className={`font-bold tabular-nums block ${totalStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {totalStock} {med.packagingUnit}s
                        </span>
                      </div>
                      <div className="pl-2">
                        <span className="text-[9px] text-[#6B7280] block font-medium uppercase">MOQ Rules</span>
                        <span className="font-bold text-[#1A1A1A] truncate block">
                          Min {med.rules.minOrderQty}{med.rules.orderMultiple > 1 ? ` • ×${med.rules.orderMultiple}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recalled Notice */}
                  {isRecalled && (
                    <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Batch Recall in Effect for this SKU</span>
                    </div>
                  )}
                </div>

                {/* Card Action Row: Retail "ADD" button */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailModalMedicine(med);
                    }}
                    className="flex-1 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#1A1A1A] font-bold text-xs transition-colors text-center"
                  >
                    Inspect Batches
                  </button>

                  <button
                    onClick={(e) => handleQuickAdd(e, med)}
                    disabled={totalStock <= 0}
                    className="px-5 py-2 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-xs uppercase shadow-xs transition-all flex items-center gap-1.5 active:scale-95 group/btn shrink-0"
                    title={`Add MOQ (${med.rules.minOrderQty || 10} units) to Cart`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>ADD</span>
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
