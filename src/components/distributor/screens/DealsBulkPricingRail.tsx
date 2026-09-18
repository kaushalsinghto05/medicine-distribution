import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';

interface DealsBulkPricingRailProps {
  onSelectMedicine: (med: Medicine) => void;
}

export const DealsBulkPricingRail: React.FC<DealsBulkPricingRailProps> = ({ onSelectMedicine }) => {
  const { distributorMedicines, currentDistributor, tenants } = useStore();

  // Filter medicines that have quantity slabs or discounts or custom overrides configured
  const bulkDeals = distributorMedicines.filter((m) => {
    const hasSlabs = m.pricing?.slabs && m.pricing.slabs.length > 0;
    const hasDiscounts = m.pricing?.discounts && m.pricing.discounts.length > 0;
    const hasDistributorOverride = m.pricing?.distributorOverrides && !!m.pricing.distributorOverrides[currentDistributor.id];
    const isBelowMrp = m.mrp > 0 && m.mrp > m.pricing.standardDistributorPrice;
    return hasSlabs || hasDiscounts || hasDistributorOverride || isBelowMrp;
  }).slice(0, 6); // Top deals

  if (bulkDeals.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-indigo-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-amber-200/80 shadow-xs space-y-3">
      {/* Rail Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Best Bulk Pricing Today
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider border border-amber-200">
                Tiered Margins
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Volume-discounted formulations and manufacturer commercial incentives
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900">
          <span>{bulkDeals.length} active deals</span>
        </span>
      </div>

      {/* Horizontally Scrollable Deal Cards Track */}
      <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-amber-200">
        {bulkDeals.map((med) => {
          const tenant = tenants.find((t) => t.id === med.tenantId);
          const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
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
              className="w-64 sm:w-72 shrink-0 bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Corner Discount Ribbon */}
              {savingsPercent > 0 && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-[10px] px-3 py-1 rounded-bl-xl shadow-xs">
                  {savingsPercent}% OFF
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <div className={`w-2 h-2 rounded-full ${tenant?.logoColor || 'bg-slate-400'}`} />
                  <span className="truncate">{tenant?.shortName}</span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-1">
                    {med.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {med.genericName}
                  </p>
                </div>

                {/* Best Slab Callout */}
                {bestSlab && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/70">
                    <Tag className="w-3 h-3 text-amber-600" />
                    <span>From {formatCurrency(bestSlab.pricePerUnit)} (≥{bestSlab.minQty} {med.packagingUnit}s)</span>
                  </div>
                )}
              </div>

              {/* Bottom Price & Stock Row */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(distributorPrice)}
                    </span>
                    {med.mrp > 0 && (
                      <span className="text-[11px] text-slate-400 line-through">
                        {formatCurrency(med.mrp)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Stock: {totalStock.toLocaleString()}
                  </span>
                </div>

                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
