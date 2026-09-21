import React, { useState, useMemo } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, CartItem } from '../../../types';
import { formatCurrency, formatDate, getExpiryStatus } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { getMedicineVisual } from '../../../utils/medicineVisuals';
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
  Truck,
  MapPin,
  ChevronDown,
  Building2,
  Snowflake,
  Flame,
  Percent,
  Lock,
  Clock,
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';

const DELIVERY_HUBS = [
  { id: 'hub-1', name: 'Prayagraj Central Depot (UP)', cutoff: '04:00 PM Today', transit: 'Same-Day Dispatch (4h)', tag: 'Fastest' },
  { id: 'hub-2', name: 'Kanpur Industrial Depot (UP)', cutoff: '06:00 PM Today', transit: 'Next-Morning Delivery', tag: 'High Stock' },
  { id: 'hub-3', name: 'Lucknow Capital Hub (UP)', cutoff: '05:30 PM Today', transit: 'Same-Day Express', tag: 'Direct Rail' },
  { id: 'hub-4', name: 'Varanasi Regional Depot (UP)', cutoff: '03:30 PM Today', transit: 'Next-Day Transit', tag: 'Eastern Corridor' },
];

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
  const [selectedHub, setSelectedHub] = useState(DELIVERY_HUBS[0].id);
  const [discountBasis, setDiscountBasis] = useState<'PTR' | 'MRP'>('PTR');
  const [activeCollection, setActiveCollection] = useState<'all' | 'schemes' | 'high_margin' | 'cold_chain' | 'fefo'>('all');
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

  const currentHubObj = DELIVERY_HUBS.find((h) => h.id === selectedHub) || DELIVERY_HUBS[0];

  // Unauthorized principals strictly isolated by tenant authorization
  const unauthorizedTenants = tenants.filter(
    (t) => currentDistributor.authorizedTenants[t.id]?.status !== 'approved'
  );

  // Filter medicines based on search, category, stock, and smart collection
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

    // Smart collection filtering
    let matchesCollection = true;
    const fefoBatches = sortBatchesFEFO(med.batches);
    const activeBatch = fefoBatches.find((b) => b.availableQuantity > 0) || fefoBatches[0];
    const pricingResult = computeEffectivePrice(med, currentDistributor.id, med.rules.minOrderQty);
    const distributorPrice = pricingResult.effectiveUnitPrice;
    const savingsPercent = med.mrp > 0 ? Math.round(((med.mrp - distributorPrice) / med.mrp) * 100) : 0;

    if (activeCollection === 'schemes') {
      const hasSlabs = !!(med.pricing?.slabs && med.pricing.slabs.length > 0);
      const hasDiscounts = !!(med.pricing?.discounts && med.pricing.discounts.length > 0);
      const hasOverrides = !!(med.pricing?.distributorOverrides && med.pricing.distributorOverrides[currentDistributor.id]);
      const hasMultiples = med.rules.orderMultiple > 1;
      matchesCollection = hasSlabs || hasDiscounts || hasOverrides || hasMultiples;
    } else if (activeCollection === 'high_margin') {
      matchesCollection = savingsPercent >= 25;
    } else if (activeCollection === 'cold_chain') {
      matchesCollection = !!med.regulatory.isColdChain;
    } else if (activeCollection === 'fefo') {
      if (!activeBatch?.expiryDate) {
        matchesCollection = true;
      } else {
        const expiry = getExpiryStatus(activeBatch.expiryDate);
        matchesCollection = expiry.status === 'safe' && expiry.daysRemaining > 180;
      }
    }

    return matchesSearch && matchesCat && matchesStock && matchesCollection;
  });

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

  return (
    <div className="space-y-6">
      {/* 1. Trust & Credibility Stats Strip */}
      <TrustAndCredibilityBar variant="distributor" />

      {/* 2. Biddano-Inspired Delivery Hub & Trade Discount Basis Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Regional Fulfillment Depot Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F8F6] border border-gray-200">
            <MapPin className="w-4 h-4 text-[#1A504C] shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Delivery Hub:
            </span>
            <select
              value={selectedHub}
              onChange={(e) => {
                setSelectedHub(e.target.value);
                const hub = DELIVERY_HUBS.find((h) => h.id === e.target.value);
                if (hub) {
                  addToast('info', 'Delivery Hub Switched', `Active inventory routing set to ${hub.name}.`);
                }
              }}
              className="text-xs font-bold text-[#1A1A1A] bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              {DELIVERY_HUBS.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name} ({hub.tag})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#6B7280]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cutoff: <strong className="text-[#1A1A1A]">{currentHubObj.cutoff}</strong></span>
            <span className="text-gray-300">•</span>
            <span className="text-emerald-700 font-medium">{currentHubObj.transit}</span>
          </div>
        </div>

        {/* Right: Biddano-Style Discount Basis Toggle: PTR vs MRP */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Discount Basis:
          </span>
          <div className="inline-flex rounded-lg p-0.5 bg-[#F5F8F6] border border-gray-200">
            <button
              onClick={() => setDiscountBasis('PTR')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                discountBasis === 'PTR'
                  ? 'bg-[#1A504C] text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
              title="Price to Retailer wholesale rate comparison"
            >
              PTR (Wholesale)
            </button>
            <button
              onClick={() => setDiscountBasis('MRP')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                discountBasis === 'MRP'
                  ? 'bg-[#1A504C] text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
              title="Maximum Retail Price margin comparison"
            >
              MRP (Margin)
            </button>
          </div>
          <span className="hidden md:inline text-[11px] text-[#6B7280]">
            Live GST 12% ITC
          </span>
        </div>
      </div>

      {/* 3. MediMny & Retailio Pattern: Authorized Manufacturer Principals Brand Rail */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1A504C]" />
            <h3 className="font-heading font-bold text-sm sm:text-base text-[#1A1A1A] tracking-tight">
              Authorized Pharmaceutical Principals
            </h3>
          </div>
          <span className="text-xs text-[#6B7280]">
            {distributorAuthorizedTenants.length} of {tenants.length} Principals Authorized for your Drug License
          </span>
        </div>

        {/* Horizontal Brand Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200">
          {/* All Principals Option */}
          <button
            onClick={() => setActiveDistributorTenantFilter('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
              activeDistributorTenantFilter === 'all'
                ? 'bg-[#1A504C] text-white border-[#1A504C] shadow-2xs'
                : 'bg-[#F5F8F6] text-[#1A1A1A] border-gray-200 hover:border-[#1A504C]/40 hover:bg-[#E8F3F1]'
            }`}
          >
            <span>All Authorized Principals</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
              activeDistributorTenantFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-[#1A1A1A]'
            }`}>
              {distributorMedicines.length}
            </span>
          </button>

          {/* Authorized Principals */}
          {distributorAuthorizedTenants.map((t) => {
            const isSelected = activeDistributorTenantFilter === t.id;
            const medCount = distributorMedicines.filter((m) => m.tenantId === t.id).length;

            return (
              <button
                key={t.id}
                onClick={() => setActiveDistributorTenantFilter(t.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#1A504C] text-white border-[#1A504C] shadow-2xs'
                    : 'bg-white text-[#1A1A1A] border-gray-200 hover:border-[#1A504C]/40 hover:bg-[#F5F8F6]'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${t.logoColor || 'bg-gray-400'}`} />
                <span className="truncate max-w-[130px]">{t.name}</span>
                <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#6B7280]'
                }`}>
                  {medCount}
                </span>
              </button>
            );
          })}

          {/* Locked / Unauthorized Principals (Tenant Isolation cues) */}
          {unauthorizedTenants.map((t) => (
            <button
              key={`unauth-${t.id}`}
              onClick={() => {
                addToast(
                  'warning',
                  'Wholesale Authorization Required',
                  `Form 20B/21B wholesale license access for ${t.name} is pending approval under Account & Licenses.`
                );
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 bg-gray-50 text-gray-400 border border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-800"
              title="Click to request wholesale Form 20B access"
            >
              <Lock className="w-3 h-3 text-gray-400" />
              <span className="truncate max-w-[110px]">{t.shortName}</span>
              <span className="text-[10px] text-amber-600 font-bold bg-amber-100/70 px-1 rounded">Locked</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Deals of the Day & Bulk Pricing Rail */}
      <DealsBulkPricingRail onSelectMedicine={(med) => setDetailModalMedicine(med)} />

      {/* 5. Shop by Category: Circular Icon Rail */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-[#1A1A1A] tracking-tight">
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

      {/* 6. Smart Collection Pills & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Smart Collection Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCollection('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeCollection === 'all'
                  ? 'bg-[#1A504C] text-white shadow-2xs'
                  : 'bg-[#F5F8F6] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A1A]'
              }`}
            >
              All Formulations
            </button>
            <button
              onClick={() => setActiveCollection('schemes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeCollection === 'schemes'
                  ? 'bg-[#EA580C] text-white shadow-2xs'
                  : 'bg-[#F5F8F6] text-[#EA580C] hover:bg-orange-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Bulk Schemes</span>
            </button>
            <button
              onClick={() => setActiveCollection('high_margin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeCollection === 'high_margin'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-[#F5F8F6] text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>High Margin (≥25%)</span>
            </button>
            <button
              onClick={() => setActiveCollection('cold_chain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeCollection === 'cold_chain'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-[#F5F8F6] text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Cold Chain (2°C-8°C)</span>
            </button>
            <button
              onClick={() => setActiveCollection('fefo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeCollection === 'fefo'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-[#F5F8F6] text-teal-700 hover:bg-teal-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Fresh FEFO (&gt;6 Mo.)</span>
            </button>
          </div>

          {/* In-Stock Only Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] cursor-pointer select-none px-2 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-100">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-[#1A504C] focus:ring-[#1A504C]"
            />
            <span>In-Stock Only</span>
          </label>
        </div>

        {/* Global Search query alert if active */}
        {globalSearchQuery && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-[#6B7280]">
              Filtering for: <strong className="text-[#1A1A1A]">"{globalSearchQuery}"</strong>
            </span>
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="text-[#EA580C] hover:underline font-bold text-xs"
            >
              Clear Search
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

      {/* 7. Retail-Grade Product Cards Grid */}
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
            setActiveCollection('all');
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
            const visual = getMedicineVisual(med);
            const FormulationIcon = visual.icon;
            const expiry = activeBatch?.expiryDate ? getExpiryStatus(activeBatch.expiryDate) : null;

            // Scheme badge detection
            const hasSlabs = !!(med.pricing?.slabs && med.pricing.slabs.length > 0);
            const hasDiscounts = !!(med.pricing?.discounts && med.pricing.discounts.length > 0);
            const hasMultiples = med.rules.orderMultiple > 1;

            return (
              <div
                key={med.id}
                onClick={() => setDetailModalMedicine(med)}
                className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-[#1A504C] hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Product-Image-First Area: Distinct Monogram, Dosage Form & Line Icon */}
                  <div className={`w-full h-32 rounded-xl ${visual.bgColor} border ${visual.borderColor} flex items-center justify-center relative overflow-hidden transition-colors`}>
                    {/* Subtle Formulation Icon Watermark */}
                    <FormulationIcon className={`w-16 h-16 ${visual.textColor} opacity-15 absolute -right-2 -bottom-2 pointer-events-none`} />

                    {/* Distinct 2-Letter Monogram Tile + Dosage Form */}
                    <div className="flex flex-col items-center justify-center z-10">
                      <div className={`w-12 h-12 rounded-xl bg-white/90 border ${visual.borderColor} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}>
                        <span className={`text-lg font-extrabold tracking-wider ${visual.textColor}`}>
                          {visual.monogram}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold mt-1.5 tracking-wider uppercase ${visual.textColor}`}>
                        {visual.dosageForm}
                      </span>
                    </div>

                    {/* Warm Discount / Scheme Badge: Top Right Corner */}
                    {hasSlabs ? (
                      <div className="absolute top-2.5 right-2.5 bg-[#EA580C] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow-xs tracking-wide z-10 flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-white" />
                        <span>SLAB TIER</span>
                      </div>
                    ) : savingsPercent > 0 ? (
                      <div className="absolute top-2.5 right-2.5 bg-[#EA580C] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow-xs tracking-wide z-10">
                        {discountBasis === 'PTR' ? `${savingsPercent}% OFF` : `${savingsPercent}% MARGIN`}
                      </div>
                    ) : null}

                    {/* Schedule & Cold Chain Badge: Top Left Corner */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/95 backdrop-blur-2xs border border-gray-200 text-purple-800 shadow-2xs">
                        {med.regulatory.scheduleClassification}
                      </div>
                      {med.regulatory.isColdChain && (
                        <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50/95 border border-blue-200 text-blue-800 flex items-center gap-1 shadow-2xs">
                          <Snowflake className="w-2.5 h-2.5 text-blue-600" />
                          <span>2°C-8°C</span>
                        </div>
                      )}
                    </div>

                    {/* Manufacturing Principal Tag: Bottom Left */}
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-white/95 backdrop-blur-2xs border border-gray-200 text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1 z-10 shadow-2xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${tenant?.logoColor || 'bg-gray-400'}`} />
                      <span className="truncate max-w-[120px]">{tenant?.shortName}</span>
                    </div>

                    {/* Multiples scheme indicator: Bottom Right */}
                    {hasMultiples && (
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-white/95 backdrop-blur-2xs border border-gray-200 text-[10px] font-bold text-[#1A504C] z-10 shadow-2xs">
                        ×{med.rules.orderMultiple} Multiples
                      </div>
                    )}
                  </div>

                  {/* Product Name & Molecule Composition */}
                  <div>
                    <h3 className="font-heading font-bold text-[#1A1A1A] text-base group-hover:text-[#1A504C] transition-colors line-clamp-2 leading-snug">
                      {med.name}
                    </h3>
                    <p className="text-xs text-[#6B7280] truncate mt-0.5 font-medium">
                      {med.genericName}
                    </p>
                  </div>

                  {/* Biddano Price Block: PTR Wholesale + Strikethrough MRP + Margin */}
                  <div className="pt-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
                        {formatCurrency(distributorPrice)}
                      </span>
                      <span className="text-xs font-bold text-[#1A504C] uppercase tracking-wider bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                        {discountBasis === 'PTR' ? 'PTR Net' : 'Wholesale'}
                      </span>
                      {med.mrp > 0 && (
                        <span className="text-xs text-gray-400 line-through tabular-nums font-normal">
                          {formatCurrency(med.mrp)} MRP
                        </span>
                      )}
                      {savingsPercent > 0 && (
                        <span className="text-xs font-bold text-emerald-700">
                          ({savingsPercent}% {discountBasis === 'PTR' ? 'off' : 'margin'})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6B7280] block mt-0.5">
                      + 12% GST Input Tax Credit Eligible
                    </span>
                  </div>

                  {/* High-Density Subordinated B2B Specs Row */}
                  <div className="rounded-lg bg-[#F5F8F6] border border-gray-200/80 p-2.5 text-[11px] divide-y divide-gray-200/60">
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
                    <div className="grid grid-cols-3 pt-1.5 divide-x divide-gray-200/60">
                      <div className="pr-1.5">
                        <span className="text-[9px] text-[#6B7280] block font-medium uppercase">Stock</span>
                        <span className={`font-bold tabular-nums block ${totalStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {totalStock} {med.packagingUnit}s
                        </span>
                      </div>
                      <div className="px-1.5">
                        <span className="text-[9px] text-[#6B7280] block font-medium uppercase">Expiry</span>
                        <span className="font-bold text-[#1A1A1A] truncate block">
                          {activeBatch?.expiryDate ? formatDate(activeBatch.expiryDate) : 'N/A'}
                        </span>
                      </div>
                      <div className="pl-1.5">
                        <span className="text-[9px] text-[#6B7280] block font-medium uppercase">MOQ</span>
                        <span className="font-bold text-[#1A1A1A] truncate block">
                          Min {med.rules.minOrderQty}
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
                    className="flex-1 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[#1A1A1A] font-bold text-xs transition-colors text-center"
                  >
                    Inspect Batches
                  </button>

                  <button
                    onClick={(e) => handleQuickAdd(e, med)}
                    disabled={totalStock <= 0}
                    className="px-5 py-2 rounded-lg bg-[#1A504C] hover:bg-[#143F3C] disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-xs uppercase shadow-xs transition-all flex items-center gap-1.5 active:scale-95 group/btn shrink-0"
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
