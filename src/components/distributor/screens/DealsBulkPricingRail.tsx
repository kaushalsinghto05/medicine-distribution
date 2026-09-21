import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, CartItem } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { getMedicineVisual } from '../../../utils/medicineVisuals';
import { 
  Clock, 
  Flame, 
  Plus, 
  CheckCircle2, 
  Pill,
  Sparkles,
  Truck,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

interface DealsBulkPricingRailProps {
  onSelectMedicine: (med: Medicine) => void;
}

export const DealsBulkPricingRail: React.FC<DealsBulkPricingRailProps> = ({ onSelectMedicine }) => {
  const { distributorMedicines, currentDistributor, tenants, addToCart, addToast } = useStore();

  // Netmeds Live Countdown Timer (Img 3)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const bulkDeals = distributorMedicines.filter((m) => {
    const hasSlabs = m.pricing?.slabs && m.pricing.slabs.length > 0;
    const hasDiscounts = m.pricing?.discounts && m.pricing.discounts.length > 0;
    const hasDistributorOverride = m.pricing?.distributorOverrides && !!m.pricing.distributorOverrides[currentDistributor.id];
    const isBelowMrp = m.mrp > 0 && m.mrp > m.pricing.standardDistributorPrice;
    return hasSlabs || hasDiscounts || hasDistributorOverride || isBelowMrp;
  }).slice(0, 6);

  if (bulkDeals.length === 0) return null;

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

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-[#F5F8F6] rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
      {/* Netmeds Deal of the Day Header & Live Countdown (Img 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-base sm:text-lg text-[#1A1A1A] tracking-tight">
                Deal Of The Day
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#EA580C] text-white uppercase tracking-wider">
                Special PTR
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Direct manufacturer volume tier rates, order multiples, and PTR trade discounts
            </p>
          </div>
        </div>

        {/* Live Countdown Ticker Pill (Netmeds Pattern) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#1A1A1A] self-start sm:self-auto shadow-2xs">
          <Clock className="w-4 h-4 text-[#EA580C]" />
          <span className="text-[#6B7280]">Ends in:</span>
          <span className="font-mono font-black text-[#EA580C] tabular-nums tracking-wider">
            {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
          </span>
        </div>
      </div>

      {/* Horizontally Scrollable Deal Cards Track (Netmeds & Truemeds Style) */}
      <div className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-200">
        {bulkDeals.map((med) => {
          const tenant = tenants.find((t) => t.id === med.tenantId);
          const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
          const fefoBatches = sortBatchesFEFO(med.batches);
          const activeBatch = fefoBatches.find((b) => b.availableQuantity > 0) || fefoBatches[0];
          const pricingResult = computeEffectivePrice(med, currentDistributor.id, med.rules.minOrderQty);
          const distributorPrice = pricingResult.effectiveUnitPrice;
          const savingsPercent = med.mrp > 0 ? Math.round(((med.mrp - distributorPrice) / med.mrp) * 100) : 0;
          const visual = getMedicineVisual(med);
          const FormulationIcon = visual.icon;

          const hasSlabs = !!(med.pricing?.slabs && med.pricing.slabs.length > 0);
          const hasMultiples = med.rules.orderMultiple > 1;

          return (
            <div
              key={`deal-${med.id}`}
              onClick={() => onSelectMedicine(med)}
              className="w-68 sm:w-72 shrink-0 bg-white rounded-2xl p-4 border border-gray-200 hover:border-[#1A504C] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Product Visual Area with Monogram & Netmeds Floating '+' Button */}
                <div className={`w-full h-32 rounded-xl ${visual.bgColor} border ${visual.borderColor} flex items-center justify-center relative overflow-hidden transition-colors`}>
                  <FormulationIcon className={`w-16 h-16 ${visual.textColor} opacity-15 absolute -right-2 -bottom-2 pointer-events-none`} />

                  {/* Monogram Tile */}
                  <div className="flex flex-col items-center justify-center z-10">
                    <div className={`w-12 h-12 rounded-xl bg-white/90 border ${visual.borderColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      <span className={`text-lg font-black tracking-wider ${visual.textColor}`}>
                        {visual.monogram}
                      </span>
                    </div>
                    <span className={`text-[10px] font-extrabold mt-1 tracking-wider uppercase ${visual.textColor}`}>
                      {visual.dosageForm}
                    </span>
                  </div>
                  
                  {/* Top-Left: Truemeds-Style Green Discount Tag */}
                  {savingsPercent > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-emerald-700 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-2xs z-10">
                      {savingsPercent}% OFF
                    </div>
                  )}

                  {/* Manufacturer Pill: Bottom Left */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/95 backdrop-blur-2xs border border-gray-200 text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1 z-10 shadow-2xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${tenant?.logoColor || 'bg-gray-400'}`} />
                    <span className="truncate max-w-[90px]">{tenant?.shortName}</span>
                  </div>

                  {/* Bottom-Right: Netmeds Floating Circular '+' Quick-Add Button */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, med)}
                    disabled={totalStock <= 0}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#1A504C] hover:bg-[#143F3C] disabled:bg-gray-300 text-white flex items-center justify-center shadow-md active:scale-95 group/btn z-20 transition-all"
                    title={`Add MOQ (${med.rules.minOrderQty} units) to order tray`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5] transition-transform group-hover/btn:rotate-90" />
                  </button>
                </div>

                {/* Product Name & Molecule Subtext */}
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A] group-hover:text-[#1A504C] transition-colors line-clamp-1 leading-snug">
                    {med.name}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] truncate mt-0.5 font-medium">
                    {med.genericName}
                  </p>
                </div>

                {/* Truemeds Price Block: Strikethrough MRP + Bold Price */}
                <div>
                  {med.mrp > 0 && (
                    <span className="text-xs text-gray-400 line-through tabular-nums font-medium block">
                      MRP {formatCurrency(med.mrp)}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                    <span className="text-xl font-black text-[#1A1A1A] tabular-nums">
                      {formatCurrency(distributorPrice)}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#1A504C] uppercase bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
                      PTR
                    </span>
                    {savingsPercent > 0 && (
                      <span className="text-xs font-bold text-emerald-700">
                        ({savingsPercent}% off)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">
                    + 12% GST ITC Eligible • 🚚 4h Dispatch
                  </span>
                </div>

                {/* Subordinated B2B Specs Row */}
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-1 text-[10px] text-[#6B7280]">
                  <div>
                    <span className="text-gray-400 block font-medium">Pack:</span>
                    <span className="font-bold text-[#1A1A1A] truncate block">{med.packSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Batch (FEFO):</span>
                    <span className="font-bold text-[#1A1A1A] truncate block">{activeBatch?.batchNumber || 'LOT-NEW'}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-gray-400 block font-medium">Stock:</span>
                    <span className={`font-bold tabular-nums ${totalStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {totalStock} {med.packagingUnit}s
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-gray-400 block font-medium">Expiry:</span>
                    <span className="font-bold text-[#1A1A1A]">
                      {activeBatch?.expiryDate ? formatDate(activeBatch.expiryDate) : 'Valid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Row: Inspect Batches + ADD Button */}
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMedicine(med);
                  }}
                  className="flex-1 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#1A1A1A] font-bold text-xs transition-colors text-center"
                >
                  Inspect
                </button>

                <button
                  onClick={(e) => handleQuickAdd(e, med)}
                  disabled={totalStock <= 0}
                  className="px-4 py-1.5 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-xs uppercase transition-colors flex items-center gap-1 shadow-xs active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>ADD</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
