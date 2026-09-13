import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { MedicineDetailModal } from './MedicineDetailModal';
import { Search, Pill, CheckCircle2, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';

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
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || med.category === selectedCategory;

    const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
    const matchesStock = !inStockOnly || totalStock > 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  // Find unauthorized manufacturers that the distributor is NOT yet approved with
  const unauthorizedTenants = tenants.filter(
    (t) => currentDistributor.authorizedTenants[t.id]?.status !== 'approved'
  );

  return (
    <div className="space-y-6">
      {/* Buyer Header & Authorization Scope */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Distributor Marketplace
            </span>
            <span className="text-xs text-slate-500">
              Authorized with {distributorAuthorizedTenants.length} Manufacturer(s)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{currentDistributor.name}</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Form 20B/21B Wholesale License Verified • Showing catalog filtered strictly to authorized manufacturing principals.
          </p>
        </div>

        {/* Authorized Principals Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {distributorAuthorizedTenants.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <div className={`w-2 h-2 rounded-full ${t.logoColor}`}></div>
              <span className="font-semibold text-slate-800">{t.shortName}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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

      {/* Search & Filtering Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulations by brand name, generic molecule, indication..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Manufacturer Selector Dropdown (Distributor view) */}
          <select
            value={activeDistributorTenantFilter}
            onChange={(e) => setActiveDistributorTenantFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All Authorized Manufacturers</option>
            {distributorAuthorizedTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter Pills & In-Stock Toggle */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>In-Stock Only</span>
          </label>
        </div>
      </div>

      {/* Medicines Product Grid (Mobile + Tablet + Desktop Responsive) */}
      {filteredMedicines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Formulations Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {distributorAuthorizedTenants.length === 0
              ? 'Your distributor account is not authorized with any manufacturer yet. Submit access requests under Account & Licenses.'
              : 'No matching medicines found for the selected search or manufacturer filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const tenant = tenants.find((t) => t.id === med.tenantId);
            const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
            const pricingResult = computeEffectivePrice(med, currentDistributor.id, med.rules.minOrderQty);
            const distributorPrice = pricingResult.effectiveUnitPrice;
            const savingsPercent = med.mrp > 0 ? Math.round(((med.mrp - distributorPrice) / med.mrp) * 100) : 0;

            return (
              <div
                key={med.id}
                onClick={() => setDetailModalMedicine(med)}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Manufacturer & Schedule Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${tenant?.logoColor}`}></div>
                      {tenant?.shortName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {med.regulatory.scheduleClassification}
                    </span>
                  </div>

                  {/* Medicine Name & Formulation */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                      {med.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {med.genericName}
                    </p>
                    <span className="inline-block text-[11px] text-slate-400 mt-1">
                      Pack Size: {med.packSize}
                    </span>
                  </div>

                  {/* Ordering Conditions Badge Hints (Section 3.2 requirement) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Min: {med.rules.minOrderQty} {med.packagingUnit}s
                    </span>
                    {med.rules.orderMultiple > 1 && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        Step: ×{med.rules.orderMultiple}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Max: {med.rules.maxOrderQty}
                    </span>
                  </div>

                  {/* Recalled or Near-Expiry Notice */}
                  {med.batches.some((b) => b.lifecycleStatus === 'recalled') && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>Batch Recall in Progress</span>
                    </div>
                  )}
                  {!med.batches.some((b) => b.lifecycleStatus === 'recalled') &&
                    med.batches.some((b) => b.lifecycleStatus === 'near_expiry') && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold">
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Near-Expiry Lots Available</span>
                      </div>
                    )}
                </div>

                {/* Pricing & Stock Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Your Price vs MRP</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-slate-900">
                        {formatCurrency(distributorPrice)}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(med.mrp)}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {savingsPercent}% Margin
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Available Stock</span>
                    <span className="font-bold text-xs text-slate-900">
                      {totalStock.toLocaleString()} {med.packagingUnit}s
                    </span>
                    <span className="block text-[10px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      Order Now →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModalMedicine && (
        <MedicineDetailModal
          medicine={detailModalMedicine}
          onClose={() => {
            setDetailModalMedicine(null);
            if (presetDemoTarget) setPresetDemoTarget(null);
          }}
        />
      )}
    </div>
  );
};
