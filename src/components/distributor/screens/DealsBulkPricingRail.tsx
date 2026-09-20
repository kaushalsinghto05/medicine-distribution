import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, CartItem } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { 
  Clock, 
  Tag, 
  Plus, 
  CheckCircle2, 
  FileSpreadsheet
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
      addToast('info', 'Configuration required', validation.errors[0] || 'Please specify valid batch or quantity.');
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
      addToast('error', 'Batch unavailable', 'No eligible active batch found with sufficient quantity.');
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
    addToast('success', 'Added to order', `Added ${qty} ${med.packagingUnit}s of ${med.name} at ${formatCurrency(validation.effectivePrice)}/unit.`);
  };

  return (
    <div className="bg-[#FCFBF8] rounded-xl p-4 sm:p-5 border border-[#E2DDD2] shadow-2xs space-y-4">
      {/* Rail Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E0D5]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3D6B52]/10 text-[#3D6B52] flex items-center justify-center shrink-0 border border-[#3D6B52]/20">
            <FileSpreadsheet className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif font-bold text-[#1F2E28] tracking-tight">
                Volume pricing & scheme register
              </h3>
              <span className="stamp-seal text-[10px] py-0.5 px-2">
                Special PTR Slabs
              </span>
            </div>
            <p className="text-xs text-[#8A8578] font-sans">
              Formulations with direct manufacturer volume tiers and authorized scheme rates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#8A8578] font-mono self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-[#3D6B52] stroke-[1.75]" />
          <span>Refreshed daily at 09:00 IST</span>
        </div>
      </div>

      {/* Horizontally Scrollable Deal Cards Track */}
      <div className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-[#E2DDD2]">
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
              className="w-72 sm:w-80 shrink-0 bg-white rounded-lg p-4 border border-[#E2DDD2] hover:border-[#3D6B52]/40 shadow-2xs transition-colors cursor-pointer flex flex-col justify-between group relative overflow-hidden pl-4"
            >
              {/* Thin left-edge indicator bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3D6B52]" />

              <div className="space-y-2.5">
                {/* Manufacturer & Schedule */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-sans text-[#1F2E28]">
                    <div className={`w-2 h-2 rounded-full ${tenant?.logoColor || 'bg-slate-400'}`} />
                    <span className="font-semibold truncate">{tenant?.shortName}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#8A8578] bg-[#F6F3EC] border border-[#E2DDD2]">
                    {med.regulatory.scheduleClassification}
                  </span>
                </div>

                {/* Medicine Brand & Molecule */}
                <div>
                  <h4 className="font-serif font-bold text-[#1F2E28] text-sm group-hover:text-[#3D6B52] transition-colors line-clamp-1">
                    {med.name}
                  </h4>
                  <p className="text-[11px] text-[#8A8578] truncate font-sans mt-0.5">
                    {med.genericName}
                  </p>
                </div>

                {/* Ledger Register Specs Block */}
                <div className="rounded border border-[#E5E0D5] bg-[#FCFBF8] p-2 text-[10px] divide-y divide-[#E5E0D5]">
                  <div className="grid grid-cols-2 pb-1.5 divide-x divide-[#E5E0D5]">
                    <div className="pr-2">
                      <span className="text-[9px] text-[#8A8578] block">MRP</span>
                      <span className="font-serif font-bold text-[#1F2E28] tabular-nums">{formatCurrency(med.mrp)}</span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[9px] text-[#8A8578] block">Batch (FEFO)</span>
                      <span className="font-mono font-medium text-[#1F2E28] truncate block max-w-[80px]">
                        {activeBatch?.batchNumber || 'LOT-NEW'}
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

                {/* Tier Slab Callout */}
                {bestSlab ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F6F3EC] text-[#1F2E28] text-[11px] border border-[#E2DDD2]">
                    <Tag className="w-3.5 h-3.5 text-[#3D6B52] shrink-0 stroke-[1.75]" />
                    <span className="truncate font-sans">
                      Tier rate: <strong className="font-serif font-bold text-[#1F2E28]">{formatCurrency(bestSlab.pricePerUnit)}</strong> at ≥<span className="font-mono">{bestSlab.minQty}</span> {med.packagingUnit}s
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3D6B52]/5 text-[#3D6B52] text-[11px] border border-[#3D6B52]/20 font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B52] shrink-0 stroke-[1.75]" />
                    <span className="truncate font-medium">Direct wholesale net pricing</span>
                  </div>
                )}
              </div>

              {/* Bottom Price Block & Plain Active-Voice Button */}
              <div className="pt-3 mt-3 border-t border-[#E5E0D5] flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-[#8A8578] font-sans block">
                    Wholesale net
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-[#1F2E28] tracking-tight tabular-nums">
                      {formatCurrency(distributorPrice)}
                    </span>
                    {med.mrp > 0 && (
                      <span className="text-xs text-[#8A8578] line-through font-serif tabular-nums">
                        {formatCurrency(med.mrp)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8A8578] font-sans block mt-0.5">
                    + 12% GST credit eligible
                  </span>
                </div>

                <button
                  onClick={(e) => handleQuickAdd(e, med)}
                  disabled={totalStock <= 0}
                  className="px-3.5 py-2 rounded bg-[#3D6B52] hover:bg-[#2F523E] disabled:bg-[#E5E0D5] disabled:text-[#8A8578] text-white font-sans font-semibold text-xs transition-colors flex items-center gap-1.5 active:scale-95 shrink-0"
                  title={`Add minimum order quantity (${med.rules.minOrderQty} units) to order`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Add to order</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
