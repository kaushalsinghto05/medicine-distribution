import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine } from '../../../types';
import { getExpiryStatus } from '../../../utils/formatters';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { MedicineDetailModal } from './MedicineDetailModal';
import { DealsBulkPricingRail } from './DealsBulkPricingRail';
import { MedicineCardNetmeds } from './MedicineCardNetmeds';
import { TrustAndCredibilityBar } from '../../common/TrustAndCredibilityBar';
import { CuratedTreatmentsRail } from '../../landing/CuratedTreatmentsRail';
import { PopularManufacturerBrands } from '../../landing/PopularManufacturerBrands';
import { EmptyState } from '../../ui/EmptyState';
import { 
  Pill, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  HeartPulse, 
  Droplet, 
  Apple, 
  ShieldCheck, 
  Layers, 
  Tag, 
  Sparkles,
  MapPin, 
  Building2, 
  Snowflake, 
  Flame, 
  Percent, 
  Lock, 
  Clock,
  Plus
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
    addToast,
    globalSearchQuery,
    setGlobalSearchQuery,
    setIsAddMedicineModalOpen,
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

  return (
    <div className="space-y-6">
      {/* 1. Trust & Credibility Stats Strip */}
      <TrustAndCredibilityBar variant="distributor" />

      {/* 2. Biddano-Inspired Delivery Hub & Trade Discount Basis Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Regional Fulfillment Depot Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F5F8F6] border border-gray-200">
            <MapPin className="w-4 h-4 text-[#1A504C] shrink-0" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
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
              className="text-xs font-extrabold text-[#1A1A1A] bg-transparent focus:outline-none cursor-pointer pr-1"
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
            <span className="text-emerald-700 font-bold">{currentHubObj.transit}</span>
          </div>
        </div>

        {/* Right: Biddano-Style Discount Basis Toggle: PTR vs MRP */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
            Discount Basis:
          </span>
          <div className="inline-flex rounded-xl p-0.5 bg-[#F5F8F6] border border-gray-200">
            <button
              onClick={() => setDiscountBasis('PTR')}
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
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
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                discountBasis === 'MRP'
                  ? 'bg-[#1A504C] text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
              title="Maximum Retail Price margin comparison"
            >
              MRP (Margin)
            </button>
          </div>
          <span className="hidden md:inline text-[11px] text-[#6B7280] font-medium">
            Live GST 12% ITC
          </span>
        </div>
      </div>

      {/* 3. Apollo Popular Manufacturer Brands Showcase */}
      <PopularManufacturerBrands
        onSelectPrincipal={(tenantId) => setActiveDistributorTenantFilter(tenantId)}
      />

      {/* 4. Deals of the Day & Bulk Pricing Rail */}
      <DealsBulkPricingRail onSelectMedicine={(med) => setDetailModalMedicine(med)} />

      {/* 5. Netmeds & Truemeds Curated Treatment Formulations Rail */}
      <CuratedTreatmentsRail onSelectCategory={(cat) => setSelectedCategory(cat)} />

      {/* 6. Shop by Category: Circular Icon Rail */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-base text-[#1A1A1A] tracking-tight">
            Shop Formulations by Molecule Classification
          </h3>
          <span className="text-xs text-[#6B7280] font-medium">
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

      {/* 7. Smart Collection Pills & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Smart Collection Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCollection('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeCollection === 'all'
                  ? 'bg-[#1A504C] text-white shadow-2xs'
                  : 'bg-[#F5F8F6] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A1A]'
              }`}
            >
              All Formulations
            </button>
            <button
              onClick={() => setActiveCollection('schemes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeCollection === 'fefo'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-[#F5F8F6] text-teal-700 hover:bg-teal-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Fresh FEFO (&gt;6 Mo.)</span>
            </button>
          </div>

          {/* In-Stock Only & Add Medicine Buttons */}
          <div className="flex items-center gap-2.5">
            <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer select-none px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-100">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#1A504C] focus:ring-[#1A504C]"
              />
              <span>In-Stock Only</span>
            </label>

            <button
              type="button"
              onClick={() => setIsAddMedicineModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1A504C] to-[#123E3A] hover:from-[#143F3C] hover:to-[#0A2624] text-white text-xs font-black shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0"
              title="Add a new pharmaceutical formulation with real packaging photo"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Medicine & Picture</span>
            </button>
          </div>
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
        <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-gray-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#6B7280] shrink-0" />
            <span className="text-[#6B7280]">
              <strong className="text-[#1A1A1A]">B2B Tenant Isolation Active:</strong> Catalogs and wholesale pricing from{' '}
              <strong className="text-[#1A1A1A]">{unauthorizedTenants.map((t) => t.shortName).join(', ')}</strong>{' '}
              remain strictly isolated until your Form 20B/21B wholesale license access request is approved.
            </span>
          </div>
        </div>
      )}

      {/* 8. Truemeds & Netmeds Style Medicine Cards Grid */}
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
          {filteredMedicines.map((med) => (
            <MedicineCardNetmeds
              key={med.id}
              medicine={med}
              onSelectMedicine={(m) => setDetailModalMedicine(m)}
              discountBasis={discountBasis}
            />
          ))}
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
