import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, CartItem } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
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
  Activity,
  HeartPulse,
  Droplet,
  ShieldCheck,
  Layers,
  Sparkles
} from 'lucide-react';

interface DealsBulkPricingRailProps {
  onSelectMedicine: (med: Medicine) => void;
}

export const DealsBulkPricingRail: React.FC<DealsBulkPricingRailProps> = ({ onSelectMedicine }) => {
  const { distributorMedicines, currentDistributor, tenants, addToCart, addToast } = useStore();

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Antibiotics': return Pill;
      case 'Analgesics & Antipyretics': return Activity;
      case 'Cardiovascular': return HeartPulse;
      case 'Gastrointestinal': return Droplet;
      case 'Respiratory': return ShieldCheck;
      default: return Layers;
    }
  };

  return (
    <div className="bg-[#F5F8F6] rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
      {/* Rail Header: Deals of the Day pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#1A1A1A] tracking-tight">
                Deals of the Day & Bulk Schemes
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EA580C] text-white uppercase">
                Special PTR
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Direct manufacturer volume tier rates and PTR discounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-[#1A1A1A] self-start sm:self-auto shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Refreshed daily at 09:00 AM</span>
        </div>
      </div>

      {/* Horizontally Scrollable Deal Cards Track */}
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

          return (
            <div
              key={`deal-${med.id}`}
              onClick={() => onSelectMedicine(med)}
              className="w-68 sm:w-72 shrink-0 bg-white rounded-xl p-4 border border-gray-200 hover:border-[#1A504C] hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Product Visual Area with Distinct Monogram, Dosage Form & Formulation Watermark */}
                <div className={`w-full h-28 rounded-xl ${visual.bgColor} border ${visual.borderColor} flex items-center justify-center relative overflow-hidden transition-colors`}>
                  {/* Formulation subtle watermark */}
                  <FormulationIcon className={`w-14 h-14 ${visual.textColor} opacity-15 absolute -right-2 -bottom-2 pointer-events-none`} />

                  {/* Distinct 2-Letter Monogram Tile + Dosage Form */}
                  <div className="flex flex-col items-center justify-center z-10">
                    <div className={`w-10 h-10 rounded-lg bg-white/80 border ${visual.borderColor} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}>
                      <span className={`text-base font-extrabold tracking-wider ${visual.textColor}`}>
                        {visual.monogram}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold mt-1 tracking-wider uppercase ${visual.textColor}`}>
                      {visual.dosageForm}
                    </span>
                  </div>
                  
                  {/* Warm Discount Tag: Top Right Corner */}
                  {savingsPercent > 0 && (
                    <div className="absolute top-2 right-2 bg-[#EA580C] text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow-xs z-10">
                      {savingsPercent}% OFF
                    </div>
                  )}

                  {/* Manufacturer Pill: Bottom Left Corner */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/95 backdrop-blur-2xs border border-gray-200 text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1 z-10 shadow-2xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${tenant?.logoColor || 'bg-gray-400'}`} />
                    <span className="truncate max-w-[90px]">{tenant?.shortName}</span>
                  </div>
                </div>

                {/* Product Name & Molecule Subtext */}
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] group-hover:text-[#1A504C] transition-colors line-clamp-1 leading-snug">
                    {med.name}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                    {med.genericName}
                  </p>
                </div>

                {/* Retail Price Block: "₹145 ₹210 (31% off)" on a single line */}
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl font-extrabold text-[#1A1A1A] tabular-nums">
                      {formatCurrency(distributorPrice)}
                    </span>
                    {med.mrp > 0 && (
                      <span className="text-xs text-gray-400 line-through tabular-nums">
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
                    + 12% GST Credit Eligible
                  </span>
                </div>

                {/* Subordinated B2B Specs Row: Batch, Pack Size, Stock, MOQ */}
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-1 text-[10px] text-[#6B7280]">
                  <div>
                    <span className="text-gray-400 block">Pack:</span>
                    <span className="font-semibold text-[#1A1A1A] truncate block">{med.packSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Batch:</span>
                    <span className="font-semibold text-[#1A1A1A] truncate block">{activeBatch?.batchNumber || 'LOT-NEW'}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-gray-400 block">Stock:</span>
                    <span className={`font-bold tabular-nums ${totalStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {totalStock} {med.packagingUnit}s
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-gray-400 block">Min Qty:</span>
                    <span className="font-semibold text-[#1A1A1A]">{med.rules.minOrderQty} units</span>
                  </div>
                </div>
              </div>

              {/* Retail-Grade ADD Button */}
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#1A504C]">
                  Direct PTR
                </span>

                <button
                  onClick={(e) => handleQuickAdd(e, med)}
                  disabled={totalStock <= 0}
                  className="px-4 py-1.5 rounded-lg bg-[#1A504C] hover:bg-[#143F3C] disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-xs uppercase transition-colors flex items-center gap-1 shadow-xs active:scale-95 shrink-0"
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
