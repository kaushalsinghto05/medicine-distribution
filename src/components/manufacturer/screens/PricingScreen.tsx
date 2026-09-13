import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, SlabPrice, DiscountRule } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import {
  Tag,
  Layers,
  Plus,
  Trash2,
  Calculator,
  Percent,
} from 'lucide-react';

export const PricingScreen: React.FC = () => {
  const { currentTenant, tenantMedicines, tenantDistributors, updatePricing, addToast } = useStore();

  const [selectedMedicineId, setSelectedMedicineId] = useState<string>(
    tenantMedicines[0]?.id || ''
  );

  const selectedMed = tenantMedicines.find((m) => m.id === selectedMedicineId) || tenantMedicines[0];

  // Editable fields for selected medicine
  const [standardPrice, setStandardPrice] = useState<number>(
    selectedMed?.pricing.standardDistributorPrice || 85
  );
  const [overrides, setOverrides] = useState<Record<string, number>>(
    selectedMed?.pricing.distributorOverrides || {}
  );
  const [slabs, setSlabs] = useState<SlabPrice[]>(selectedMed?.pricing.slabs || []);
  const [discounts, setDiscounts] = useState<DiscountRule[]>(selectedMed?.pricing.discounts || []);

  // Sync state when selected medicine or tenant changes
  useEffect(() => {
    if (tenantMedicines.length > 0) {
      const exists = tenantMedicines.some((m) => m.id === selectedMedicineId);
      const targetMed = exists
        ? tenantMedicines.find((m) => m.id === selectedMedicineId)!
        : tenantMedicines[0];
      setSelectedMedicineId(targetMed.id);
      setStandardPrice(targetMed.pricing.standardDistributorPrice);
      setOverrides(targetMed.pricing.distributorOverrides || {});
      setSlabs(targetMed.pricing.slabs || []);
      setDiscounts(targetMed.pricing.discounts || []);
    }
  }, [currentTenant.id, tenantMedicines]);

  // Sync state when selected medicine changes via dropdown
  const handleSelectMedicine = (medId: string) => {
    setSelectedMedicineId(medId);
    const med = tenantMedicines.find((m) => m.id === medId);
    if (med) {
      setStandardPrice(med.pricing.standardDistributorPrice);
      setOverrides(med.pricing.distributorOverrides || {});
      setSlabs(med.pricing.slabs || []);
      setDiscounts(med.pricing.discounts || []);
    }
  };

  // Live Simulator States
  const [simDistributorId, setSimDistributorId] = useState<string>(
    tenantDistributors[0]?.id || ''
  );
  const [simQuantity, setSimQuantity] = useState<number>(50);

  useEffect(() => {
    if (tenantDistributors.length > 0) {
      const exists = tenantDistributors.some((d) => d.id === simDistributorId);
      if (!exists) {
        setSimDistributorId(tenantDistributors[0].id);
      }
    }
  }, [currentTenant.id, tenantDistributors]);

  // Compute live simulated price
  const simResult = selectedMed
    ? computeEffectivePrice(
        {
          ...selectedMed,
          pricing: {
            medicineId: selectedMed.id,
            tenantId: currentTenant.id,
            standardDistributorPrice: standardPrice,
            distributorOverrides: overrides,
            slabs,
            discounts,
          },
        },
        simDistributorId,
        simQuantity
      )
    : null;

  // Slabs Management
  const [newSlabMin, setNewSlabMin] = useState<number>(10);
  const [newSlabMax, setNewSlabMax] = useState<number>(100);
  const [newSlabPrice, setNewSlabPrice] = useState<number>(80);

  const handleAddSlab = () => {
    if (newSlabMin <= 0 || newSlabPrice <= 0 || newSlabMax < newSlabMin) {
      addToast('error', 'Invalid Slab', 'Check slab min/max quantities and price.');
      return;
    }
    setSlabs((prev) => [...prev, { minQty: newSlabMin, maxQty: newSlabMax, pricePerUnit: newSlabPrice }]);
    setNewSlabMin(newSlabMax + 1);
    setNewSlabMax(newSlabMax + 200);
    setNewSlabPrice(Math.max(1, newSlabPrice - 5));
  };

  const handleRemoveSlab = (index: number) => {
    setSlabs((prev) => prev.filter((_, i) => i !== index));
  };

  // Override Management
  const [overrideDistId, setOverrideDistId] = useState<string>(tenantDistributors[0]?.id || '');
  const [overridePriceInput, setOverridePriceInput] = useState<number>(80);

  const handleAddOverride = () => {
    if (!overrideDistId || overridePriceInput <= 0) return;
    setOverrides((prev) => ({ ...prev, [overrideDistId]: overridePriceInput }));
    addToast('success', 'Override Added', 'Custom price saved for distributor.');
  };

  const handleRemoveOverride = (distId: string) => {
    setOverrides((prev) => {
      const copy = { ...prev };
      delete copy[distId];
      return copy;
    });
  };

  const handleSavePricing = () => {
    if (!selectedMed) return;
    updatePricing(selectedMed.id, {
      medicineId: selectedMed.id,
      tenantId: currentTenant.id,
      standardDistributorPrice: standardPrice,
      distributorOverrides: overrides,
      slabs,
      discounts,
    });
  };

  if (!selectedMed) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">No medicines in catalog. Create one first.</p>
      </div>
    );
  }

  const marginPct =
    selectedMed.mrp > 0
      ? Math.round(((selectedMed.mrp - standardPrice) / selectedMed.mrp) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Commercial Pricing & Slabs</h1>
          <p className="text-xs text-slate-500">
            Configure wholesale price, tiered quantity slabs, distributor-specific contracts, and live simulator for {currentTenant.shortName}.
          </p>
        </div>

        <button
          onClick={handleSavePricing}
          className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          Save Commercial Changes
        </button>
      </div>

      {/* Medicine Selector Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
          Configuring Formulation:
        </label>
        <select
          value={selectedMedicineId}
          onChange={(e) => handleSelectMedicine(e.target.value)}
          className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none flex-1"
        >
          {tenantMedicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.genericName}) — MRP {formatCurrency(m.mrp)}
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid: Pricing Config + Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pricing Setup */}
        <div className="lg:col-span-2 space-y-6">
          {/* Base Wholesale Price & Margin Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Tag className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Standard Distributor Base Price
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Maximum Retail Price (MRP)
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(selectedMed.mrp)}
                </div>
                <span className="text-[10px] text-slate-400">Printed on packaging</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Distributor Price (₹)
                </label>
                <div className="mt-1 flex items-center">
                  <span className="text-sm font-bold text-slate-400 mr-1">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={standardPrice}
                    onChange={(e) => setStandardPrice(Number(e.target.value))}
                    className="w-28 text-xl font-bold text-sky-700 bg-white px-2 py-1 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400">per {selectedMed.packagingUnit}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Distributor Margin
                </span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  {marginPct}%
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">
                  {formatCurrency(selectedMed.mrp - standardPrice)} profit/unit
                </span>
              </div>
            </div>
          </div>

          {/* Slab / Quantity-Based Tier Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Layers className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Quantity Slab Pricing (Volume Discounts)
                </h3>
              </div>
              <span className="text-xs text-slate-500">Auto-applies when order hits quantity bracket</span>
            </div>

            {slabs.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                No quantity tiers configured yet. Standard wholesale rate applies to all quantities.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3 text-left">Min Qty</th>
                      <th className="py-2 px-3 text-left">Max Qty</th>
                      <th className="py-2 px-3 text-left">Price per Unit (₹)</th>
                      <th className="py-2 px-3 text-left">Margin</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slabs.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{s.minQty}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {s.maxQty === Infinity ? 'Unlimited' : s.maxQty}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-sky-700">{formatCurrency(s.pricePerUnit)}</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-medium">
                          {Math.round(((selectedMed.mrp - s.pricePerUnit) / selectedMed.mrp) * 100)}%
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRemoveSlab(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Slab Mini-Form */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">From:</span>
                <input
                  type="number"
                  value={newSlabMin}
                  onChange={(e) => setNewSlabMin(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center"
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">To:</span>
                <input
                  type="number"
                  value={newSlabMax}
                  onChange={(e) => setNewSlabMax(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center"
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">Rate: ₹</span>
                <input
                  type="number"
                  value={newSlabPrice}
                  onChange={(e) => setNewSlabPrice(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-sky-700"
                />
              </div>

              <button
                onClick={handleAddSlab}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center gap-1 ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Slab
              </button>
            </div>
          </div>

          {/* Distributor-Specific Custom Price Overrides */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Percent className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Distributor-Specific Price Overrides
                </h3>
              </div>
              <span className="text-xs text-slate-500">Contract pricing locked for specific buyers</span>
            </div>

            {Object.keys(overrides).length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                No distributor overrides assigned. All approved distributors receive standard pricing.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {Object.entries(overrides).map(([distId, customPrice]) => {
                  const dist = tenantDistributors.find((d) => d.id === distId);

                  return (
                    <div key={distId} className="p-3 flex items-center justify-between text-xs bg-white">
                      <div>
                        <span className="font-bold text-slate-900">{dist?.name || distId}</span>
                        <span className="text-slate-400 block text-[10px]">
                          {dist?.city}, {dist?.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sky-700 text-sm">{formatCurrency(customPrice)}</span>
                        <button
                          onClick={() => handleRemoveOverride(distId)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Override Selector */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <select
                value={overrideDistId}
                onChange={(e) => setOverrideDistId(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg flex-1"
              >
                {tenantDistributors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">Rate: ₹</span>
                <input
                  type="number"
                  value={overridePriceInput}
                  onChange={(e) => setOverridePriceInput(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-sky-700"
                />
              </div>

              <button
                onClick={handleAddOverride}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Assign Override
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Pricing Preview Simulator (Section 2.3 requirement) */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-sky-800 space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-200">
                  Live Pricing Simulator
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Real-Time
              </span>
            </div>

            <p className="text-xs text-sky-200/80 leading-relaxed">
              Verify what a distributor actually sees and gets billed for any custom purchase quantity.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-sky-200 mb-1">
                  Target Distributor
                </label>
                <select
                  value={simDistributorId}
                  onChange={(e) => setSimDistributorId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-800/90 text-white border border-slate-700 focus:ring-2 focus:ring-sky-400 outline-none"
                >
                  {tenantDistributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sky-200 mb-1">
                  Sample Order Quantity ({selectedMed.packagingUnit}s)
                </label>
                <input
                  type="number"
                  min="1"
                  value={simQuantity}
                  onChange={(e) => setSimQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-800/90 text-white border border-slate-700 focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>
            </div>

            {/* Simulated Output Card */}
            {simResult && (
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Base MRP:</span>
                  <span className="font-semibold">{formatCurrency(selectedMed.mrp)}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Applied Rule:</span>
                  <span className="font-medium text-sky-300">
                    {simResult.overridePrice !== undefined
                      ? 'Custom Distributor Override'
                      : simResult.slabApplied
                      ? `Slab (${simResult.slabApplied.minQty}${simResult.slabApplied.maxQty === Infinity ? '+' : `-${simResult.slabApplied.maxQty}`} units)`
                      : 'Standard Wholesale Rate'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Effective Unit Price:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatCurrency(simResult.effectiveUnitPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Distributor Margin:</span>
                  <span className="font-bold text-emerald-400">
                    {simResult.marginPercent}% ({formatCurrency(selectedMed.mrp - simResult.effectiveUnitPrice)}/unit)
                  </span>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-white">Gross Billed Subtotal:</span>
                    <span className="font-extrabold text-sky-400 text-base">
                      {formatCurrency(simResult.totalSubtotal)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Buyer saves {formatCurrency(simResult.totalSavings)} vs retail value.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
