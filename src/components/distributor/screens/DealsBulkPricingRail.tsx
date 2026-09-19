import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, CartItem } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { 
  Sparkles, 
  ArrowRight, 
  Tag, 
  Plus, 
  Clock, 
  Percent, 
  CheckCircle2, 
  Package, 
  Box, 
  Layers,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface DealsBulkPricingRailProps {
  onSelectMedicine: (med: Medicine) => void;
}

export const DealsBulkPricingRail: React.FC<DealsBulkPricingRailProps> = ({ onSelectMedicine }) => {
  const { distributorMedicines, currentDistributor, tenants, addToCart, addToast } = useStore();

  // Filter medicines that have quantity slabs or discounts or custom overrides configured
  const bulkDeals = distributorMedicines.filter((m) => {
    const hasSlabs = m.pricing?.slabs && m.pricing.slabs.length > 0;
    const hasDiscounts = m.pricing?.discounts && m.pricing.discounts.length > 0;
    const hasDistributorOverride = m.pricing?.distributorOverrides && !!m.pricing.distributorOverrides[currentDistributor.id];
    const isBelowMrp = m.mrp > 0 && m.mrp > m.pricing.standardDistributorPrice;
    return hasSlabs || hasDiscounts || hasDistributorOverride || isBelowMrp;
  }).slice(0, 6); // Top deals

  if (bulkDeals.length === 0) return null;

  // Direct quick addition to cart
  const handleQuickAdd = (e: React.MouseEvent, med: Medicine) => {
    e.stopPropagation();

    const qty = med.rules.minOrderQty || 10;
    const validation = validateOrderQuantity(currentDistributor, med, qty);

    if (!validation.isValid) {
      addToast('info', 'Configuration Required', validation.errors[0] || 'Please specify valid batch or quantity.');
      onSelectMedicine(med);
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
      onSelectMedicine(med);
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
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-teal-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-amber-300/80 shadow-xs space-y-3.5 animate-fade-slide">
      {/* Rail Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Flame className="w-5 h-5 text-white stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Deals of the Day & Bulk Schemes
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-600 text-white uppercase tracking-wider shadow-2xs">
                UP TO 40% MARGIN
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              High-velocity formulations with direct manufacturer volume slabs & special PTR schemes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-amber-200 text-amber-900 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600 stroke-[1.75]" />
            <span>Refreshed Daily at 9:00 AM</span>
          </div>
        </div>
      </div>

      {/* Horizontally Scrollable Deal Cards Track */}
      <div className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-amber-200">
        {bulkDeals.map((med) => {
          const tenant = tenants.find((t) => t.id === med.tenantId);
          const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
          const fefoBatches = sortBatchesFEFO(med.batches);
          const activeBatch = fefoBatches.find((b) => b.availableQuantity > 0) || fefoBatches[0];
          const pricingResult = computeEffectivePrice(med, currentDistributor.id, med.rules.minOrderQty);
          const distributorPrice = pricingResult.effectiveUnitPrice;
          const savingsPercent = med.mrp > 0 ? Math.round(((med.mrp - distributorPrice) / med.mrp) * 100) : 0;

          // Check if best slab exists
          const bestSlab = med.pricing?.slabs && med.pricing.slabs.length > 0
            ? [...med.pricing.slabs].sort((a, b) => a.pricePerUnit - b.pricePerUnit)[0]
            : null;

          return (
            <div
              key={`deal-${med.id}`}
              onClick={() => onSelectMedicine(med)}
              className="w-72 sm:w-80 shrink-0 bg-white rounded-2xl sm:rounded-3xl p-4 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-150 ease-out cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Corner Discount Ribbon (Orange strictly for deals/urgency badges) */}
              {savingsPercent > 0 && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-[10px] px-3 py-1 rounded-bl-xl shadow-xs tracking-wider">
                  {savingsPercent}% OFF
                </div>
              )}

              <div className="space-y-2.5">
                {/* Manufacturer & Schedule */}
                <div className="flex items-center justify-between gap-1.5 pr-12">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                    <div className={`w-2 h-2 rounded-full ${tenant?.logoColor || 'bg-slate-400'}`} />
                    <span className="truncate">{tenant?.shortName}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {med.regulatory.scheduleClassification}
                  </span>
                </div>

                {/* Medicine Brand & Molecule Line */}
                <div>
                  <h4 className="font-black text-slate-900 text-sm group-hover:text-teal-700 transition-colors line-clamp-1">
                    {med.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5">
                    {med.genericName}
                  </p>
                </div>

                {/* 4-Grid Spec Block (Clean soft card with subtle internal hairlines, NO spreadsheet boxes) */}
                <div className="rounded-xl bg-slate-50/90 border border-slate-200/60 p-2 text-[10px] divide-y divide-slate-200/50">
                  <div className="grid grid-cols-2 pb-1.5 divide-x divide-slate-200/50">
                    <div className="pr-2">
                      <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider block">MRP</span>
                      <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(med.mrp)}</span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider block">Batch</span>
                      <span className="font-bold text-slate-800 font-mono truncate block max-w-[70px]">
                        {activeBatch?.batchNumber || 'LOT-NEW'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 pt-1.5 divide-x divide-slate-200/50">
                    <div className="pr-2">
                      <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider block">Packaging</span>
                      <span className="font-bold text-slate-800 truncate block max-w-[70px]">{med.packSize}</span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider block">Stock</span>
                      <span className={`font-bold tabular-nums block ${totalStock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {totalStock} {med.packagingUnit}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Best Slab Callout Banner */}
                {bestSlab ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200">
                    <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[1.75]" />
                    <span className="truncate">
                      Tier Rate: <strong>{formatCurrency(bestSlab.pricePerUnit)}</strong> at ≥{bestSlab.minQty} {med.packagingUnit}s
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 text-[11px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[1.75]" />
                    <span className="truncate">Direct Wholesale Net Pricing</span>
                  </div>
                )}
              </div>

              {/* Bottom Price Block & Action Button (Item 2 & 4: Unified Teal Button & High-Contrast Price Hierarchy) */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                    Wholesale Net
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                      {formatCurrency(distributorPrice)}
                    </span>
                    {med.mrp > 0 && (
                      <span className="text-xs text-slate-400 line-through font-normal tabular-nums">
                        {formatCurrency(med.mrp)}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium block mt-1">
                    + 12% GST Credit Eligible
                  </span>
                </div>

                {/* Unified Vibrant Teal Add Button (No Orange on Clickable Buttons) */}
                <button
                  onClick={(e) => handleQuickAdd(e, med)}
                  disabled={totalStock <= 0}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 active:scale-95 shrink-0"
                  title={`Quick Add MOQ (${med.rules.minOrderQty} units) to Cart`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
