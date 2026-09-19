import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, CartItem } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { MedicineDetailModal } from './MedicineDetailModal';
import { DealsBulkPricingRail } from './DealsBulkPricingRail';
import { TrustAndCredibilityBar } from '../../common/TrustAndCredibilityBar';
import { EmptyState } from '../../ui/EmptyState';
import { Button } from '../../ui/Button';
import { 
  Search, 
  Pill, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Plus, 
  Tag, 
  HeartPulse, 
  Activity, 
  Sparkles, 
  Droplet, 
  Apple, 
  ShieldCheck, 
  Ruler, 
  Box, 
  Calendar,
  Syringe,
  MapPin,
  Truck,
  Award,
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

  // Visual Category Definitions with Representative Icons
  const categoryDefinitions = [
    { name: 'All', icon: Sparkles },
    { name: 'Antibiotics', icon: Pill },
    { name: 'Analgesics & Antipyretics', icon: Activity },
    { name: 'Cardiovascular', icon: HeartPulse },
    { name: 'Gastrointestinal', icon: Droplet },
    { name: 'Respiratory', icon: ShieldCheck },
    { name: 'Antidiabetic', icon: Layers },
    { name: 'Dermatological', icon: Tag },
    { name: 'Nutritional & Vitamins', icon: Apple },
  ];

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Antibiotics':
        return { bg: 'from-teal-500/15 via-emerald-500/10 to-teal-500/5', icon: Pill, text: 'text-teal-700' };
      case 'Analgesics & Antipyretics':
        return { bg: 'from-sky-500/15 via-blue-500/10 to-indigo-500/5', icon: Activity, text: 'text-sky-700' };
      case 'Cardiovascular':
        return { bg: 'from-rose-500/15 via-pink-500/10 to-red-500/5', icon: HeartPulse, text: 'text-rose-700' };
      case 'Gastrointestinal':
        return { bg: 'from-cyan-500/15 via-blue-500/10 to-sky-500/5', icon: Droplet, text: 'text-cyan-700' };
      case 'Respiratory':
        return { bg: 'from-indigo-500/15 via-purple-500/10 to-indigo-500/5', icon: ShieldCheck, text: 'text-indigo-700' };
      case 'Nutritional & Vitamins':
        return { bg: 'from-amber-500/15 via-orange-500/10 to-yellow-500/5', icon: Apple, text: 'text-amber-700' };
      default:
        return { bg: 'from-indigo-500/15 via-sky-500/10 to-slate-500/5', icon: Pill, text: 'text-indigo-700' };
    }
  };

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

  // Direct "Add" Quick Action with full rule validation
  const handleQuickAdd = (e: React.MouseEvent, med: Medicine) => {
    e.stopPropagation(); // Prevent modal opening

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

  return (
    <div className="space-y-6">
      {/* 1. Trust & Credibility Stats Strip */}
      <TrustAndCredibilityBar variant="distributor" />

      {/* Regional Sourcing & Express Fulfillment Banner (Retailio & Biddano Hub Pattern) */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-teal-700/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-teal-300">
                Hub Fulfillment Active
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                24h Express Transit
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Fulfillment from <strong>Bhiwandi Central Depot (MH)</strong> & <strong>Lucknow Depot (UP)</strong> • Tamper-evident FEFO dispatches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Same-Day Cutoff: <strong>5:30 PM</strong></span>
        </div>
      </div>

      {/* Buyer Header & Authorization Scope (IndiaMart Wholesaler Verified Profile Pattern) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Verified Wholesale Buyer
            </span>
            <span className="text-xs text-slate-500">
              Authorized with {distributorAuthorizedTenants.length} Manufacturing Principal(s)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            {currentDistributor.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Form 20B/21B Wholesale License Verified
            </span>
            <span>•</span>
            <span className="font-mono text-slate-500">GSTIN: {currentDistributor.gstin}</span>
            <span>•</span>
            <span className="text-slate-500">{currentDistributor.city}, {currentDistributor.state}</span>
          </div>
        </div>

        {/* Authorized Principals Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {distributorAuthorizedTenants.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-2xs"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${t.logoColor}`}></div>
              <span className="font-bold text-slate-800">{t.shortName}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Unauthorized Manufacturer Alert Banner (Demonstrates tenant isolation) */}
      {unauthorizedTenants.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0" />
            <span className="text-slate-600">
              <strong>Multi-Tenancy Isolation Notice:</strong> You are not currently authorized with{' '}
              <strong className="text-slate-900">
                {unauthorizedTenants.map((t) => t.shortName).join(', ')}
              </strong>
              . Their catalog, batches, and wholesale rates remain completely segregated.
            </span>
          </div>
        </div>
      )}

      {/* 4. Deals / Best Bulk Pricing Highlights Rail (Biddano & Medimny Deals of the Day) */}
      <DealsBulkPricingRail onSelectMedicine={(med) => setDetailModalMedicine(med)} />

      {/* Search & Category Filter Section */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulations by brand name, generic molecule (e.g. Paracetamol), composition..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            />
          </div>

          {/* Manufacturer Selector Dropdown */}
          <select
            value={activeDistributorTenantFilter}
            onChange={(e) => setActiveDistributorTenantFilter(e.target.value)}
            className="text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
          >
            <option value="all">All Authorized Manufacturers</option>
            {distributorAuthorizedTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none sm:px-2 py-2 sm:py-0">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>In-Stock Only</span>
          </label>
        </div>

        {/* Category Navigation: Horizontally scrollable chip rail with edge fade gradient */}
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-slate-200">
            {categoryDefinitions.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;

              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>

      {/* Redesigned Product Card Grid (Retailio, Biddano & IndiaMart Pharma Profile Style) */}
      {filteredMedicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Formulations Found"
          description={
            distributorAuthorizedTenants.length === 0
              ? 'Your distributor account is not authorized with any manufacturer yet. Submit access requests under Account & Licenses.'
              : 'No matching medicines found for your search criteria or manufacturer filter. Try clearing filters.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
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
            const theme = getCategoryTheme(med.category);
            const CategoryIcon = theme.icon;

            return (
              <div
                key={med.id}
                onClick={() => setDetailModalMedicine(med)}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/90 hover:border-teal-500 hover:shadow-card transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Corner Bulk Discount Ribbon */}
                {savingsPercent > 0 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-black text-[10px] px-3 py-1 rounded-bl-xl shadow-xs tracking-wider">
                    {savingsPercent}% OFF
                  </div>
                )}

                <div className="space-y-3">
                  {/* Manufacturer & Schedule Header (IndiaMart Verified Vendor Seal) */}
                  <div className="flex items-center justify-between gap-2 pr-14">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${tenant?.logoColor || 'bg-slate-400'}`}></div>
                      <span className="truncate">{tenant?.shortName}</span>
                      <span title="Verified Direct Principal">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                      {med.regulatory.scheduleClassification}
                    </span>
                  </div>

                  {/* Visual Category Gradient Tile with Icon */}
                  <div className={`w-full h-20 rounded-2xl bg-gradient-to-br ${theme.bg} border border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-200`}>
                    <CategoryIcon className={`w-8 h-8 ${theme.text} opacity-70 stroke-[1.5]`} />
                    <span className="absolute bottom-2 left-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {med.category}
                    </span>
                  </div>

                  {/* Medicine Name & Generic Composition Line (Indian B2B pharma hallmark) */}
                  <div>
                    <h3 className="font-black text-slate-900 text-base group-hover:text-teal-700 transition-colors leading-snug">
                      {med.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-600 font-medium line-clamp-1">
                      <span className="text-slate-400">Molecule:</span>
                      <span className="font-semibold text-slate-800">{med.genericName}</span>
                    </div>
                  </div>

                  {/* 4-Box Spec Grid (Biddano & Retailio pattern) */}
                  <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-50/90 border border-slate-200/70 text-[10px]">
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-white border border-slate-100">
                      <span className="text-slate-400 font-medium">MRP:</span>
                      <span className="font-bold text-slate-700 tabular-nums">{formatCurrency(med.mrp)}</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-white border border-slate-100">
                      <span className="text-slate-400 font-medium">Batch:</span>
                      <span className="font-bold text-slate-700 font-mono truncate max-w-[65px]">
                        {activeBatch?.batchNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-white border border-slate-100">
                      <span className="text-slate-400 font-medium">PKG:</span>
                      <span className="font-bold text-slate-700 truncate max-w-[65px]">{med.packSize}</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-white border border-slate-100">
                      <span className="text-slate-400 font-medium">Stock:</span>
                      <span className={`font-bold tabular-nums ${totalStock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {totalStock} {med.packagingUnit}s
                      </span>
                    </div>
                  </div>

                  {/* Price Block: MRP strikethrough + Prominent Distributor Rate */}
                  <div className="bg-teal-50/50 rounded-xl p-3 border border-teal-100/80">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                          Wholesale Net Rate
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xl font-black text-slate-900 tracking-tight tabular-nums">
                            {formatCurrency(distributorPrice)}
                          </span>
                          {med.mrp > 0 && (
                            <span className="text-xs text-slate-400 line-through font-medium tabular-nums">
                              {formatCurrency(med.mrp)}
                            </span>
                          )}
                        </div>
                      </div>

                      {savingsPercent > 0 && (
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 tabular-nums">
                            {savingsPercent}% Margin
                          </span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">+ 12% GST</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ordering Conditions: Single Compact Row */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/70 border border-slate-200/70 text-[10px] text-slate-600 font-medium tabular-nums">
                    <Ruler className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-semibold text-slate-700">Rules:</span>
                    <span>Min {med.rules.minOrderQty}</span>
                    <span>•</span>
                    {med.rules.orderMultiple > 1 && (
                      <>
                        <span>Step ×{med.rules.orderMultiple}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>Max {med.rules.maxOrderQty} {med.packagingUnit}s</span>
                  </div>

                  {/* Recalled Notice */}
                  {med.batches.some((b) => b.lifecycleStatus === 'recalled') && (
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Batch Recall in Effect for this SKU</span>
                    </div>
                  )}
                </div>

                {/* Card Action Row: Configure Specs vs Quick Add */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailModalMedicine(med);
                    }}
                    className="flex-1 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors text-center"
                  >
                    View Batches & FEFO
                  </button>

                  <button
                    onClick={(e) => handleQuickAdd(e, med)}
                    disabled={totalStock <= 0}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-2xs transition-all duration-150 flex items-center gap-1 active:scale-95 group/btn"
                    title={`Add MOQ (${med.rules.minOrderQty || 10} units) to Cart`}
                  >
                    <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
                    <span>Add</span>
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
