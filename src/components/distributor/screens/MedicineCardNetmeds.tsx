import React from 'react';
import { Medicine, CartItem } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency, formatDate, getExpiryStatus } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { getMedicineVisual } from '../../../utils/medicineVisuals';
import { 
  Plus, 
  AlertTriangle, 
  Flame, 
  Snowflake, 
  Truck, 
  ChevronRight, 
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

interface MedicineCardNetmedsProps {
  medicine: Medicine;
  onSelectMedicine: (med: Medicine) => void;
  discountBasis?: 'PTR' | 'MRP';
}

export const MedicineCardNetmeds: React.FC<MedicineCardNetmedsProps> = ({
  medicine: med,
  onSelectMedicine,
  discountBasis = 'PTR',
}) => {
  const { currentDistributor, tenants, addToCart, addToast } = useStore();

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

  const hasSlabs = !!(med.pricing?.slabs && med.pricing.slabs.length > 0);
  const hasMultiples = med.rules.orderMultiple > 1;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    const qty = med.rules.minOrderQty || 10;
    const validation = validateOrderQuantity(currentDistributor, med, qty);

    if (!validation.isValid) {
      addToast('info', 'Configuration Required', validation.errors[0] || 'Please specify valid batch or quantity.');
      onSelectMedicine(med);
      return;
    }

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
    <div
      onClick={() => onSelectMedicine(med)}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 hover:border-[#1A504C] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      <div className="space-y-3">
        {/* Pack Visual Container (Netmeds / Truemeds Pattern) */}
        <div className={`w-full h-36 rounded-xl ${visual.bgColor} border ${visual.borderColor} flex items-center justify-center relative overflow-hidden transition-colors`}>
          {/* Subtle Formulation Icon Watermark */}
          <FormulationIcon className={`w-20 h-20 ${visual.textColor} opacity-15 absolute -right-3 -bottom-3 pointer-events-none`} />

          {/* Top-Left: Truemeds-Style Green Discount Pill Tag */}
          {hasSlabs ? (
            <div className="absolute top-2.5 left-2.5 bg-[#EA580C] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md shadow-2xs tracking-wide z-10 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-white" />
              <span>SLAB TIER</span>
            </div>
          ) : savingsPercent > 0 ? (
            <div className="absolute top-2.5 left-2.5 bg-emerald-700 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-2xs tracking-wide z-10">
              {discountBasis === 'PTR' ? `${savingsPercent}% OFF` : `${savingsPercent}% MARGIN`}
            </div>
          ) : null}

          {/* Top-Right: Regulatory Badges */}
          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white/95 backdrop-blur-2xs border border-gray-200 text-purple-800 shadow-2xs">
              {med.regulatory.scheduleClassification}
            </span>
            {med.regulatory.isColdChain && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50/95 border border-blue-200 text-blue-800 flex items-center gap-1 shadow-2xs">
                <Snowflake className="w-2.5 h-2.5 text-blue-600" />
                <span>2°C-8°C</span>
              </span>
            )}
          </div>

          {/* Center Monogram Tile + Dosage Form */}
          <div className="flex flex-col items-center justify-center z-10">
            <div className={`w-14 h-14 rounded-2xl bg-white/95 border ${visual.borderColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
              <span className={`text-xl font-black tracking-wider ${visual.textColor}`}>
                {visual.monogram}
              </span>
            </div>
            <span className={`text-[10px] font-extrabold mt-1.5 tracking-wider uppercase ${visual.textColor}`}>
              {visual.dosageForm}
            </span>
          </div>

          {/* Bottom-Left: Manufacturer Principal Tag */}
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-white/95 backdrop-blur-2xs border border-gray-200 text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1 z-10 shadow-2xs">
            <div className={`w-1.5 h-1.5 rounded-full ${tenant?.logoColor || 'bg-gray-400'}`} />
            <span className="truncate max-w-[110px]">{tenant?.shortName}</span>
          </div>

          {/* Bottom-Right: Netmeds-Style Floating Circular '+' Quick-Add Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={totalStock <= 0}
            className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-[#1A504C] hover:bg-[#143F3C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md active:scale-95 group/add z-20 transition-all"
            title={`Quick add MOQ (${med.rules.minOrderQty} units) to order tray`}
          >
            <Plus className="w-5 h-5 stroke-[2.5] transition-transform group-hover/add:rotate-90" />
          </button>
        </div>

        {/* Product Details: Name & Molecule */}
        <div>
          <h3 className="font-heading font-extrabold text-[#1A1A1A] text-sm sm:text-base group-hover:text-[#1A504C] transition-colors line-clamp-2 leading-snug">
            {med.name}
          </h3>
          <p className="text-xs text-[#6B7280] truncate mt-0.5 font-medium">
            {med.genericName}
          </p>
        </div>

        {/* Truemeds & Netmeds Price Display Block */}
        <div className="pt-1">
          {med.mrp > 0 && (
            <div className="text-xs text-gray-400 line-through tabular-nums font-medium">
              MRP {formatCurrency(med.mrp)}
            </div>
          )}
          <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-[#1A1A1A] tabular-nums">
              {formatCurrency(distributorPrice)}
            </span>
            <span className="text-[10px] font-extrabold text-[#1A504C] uppercase tracking-wider bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
              {discountBasis === 'PTR' ? 'PTR Net' : 'Wholesale'}
            </span>
            {savingsPercent > 0 && (
              <span className="text-xs font-bold text-emerald-700">
                ({savingsPercent}% off)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280] mt-1">
            <Truck className="w-3 h-3 text-[#1A504C]" />
            <span>Same-Day Dispatch (4h)</span>
            <span>•</span>
            <span>12% GST ITC</span>
          </div>
        </div>

        {/* Subordinated B2B Specs Row */}
        <div className="rounded-xl bg-[#F5F8F6] border border-gray-200/80 p-2.5 text-[11px] divide-y divide-gray-200/60">
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
            <div className="pr-1">
              <span className="text-[9px] text-[#6B7280] block font-medium uppercase">Stock</span>
              <span className={`font-bold tabular-nums block ${totalStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {totalStock} {med.packagingUnit}s
              </span>
            </div>
            <div className="px-1">
              <span className="text-[9px] text-[#6B7280] block font-medium uppercase">Expiry</span>
              <span className="font-bold text-[#1A1A1A] truncate block">
                {activeBatch?.expiryDate ? formatDate(activeBatch.expiryDate) : 'N/A'}
              </span>
            </div>
            <div className="pl-1">
              <span className="text-[9px] text-[#6B7280] block font-medium uppercase">MOQ</span>
              <span className="font-bold text-[#1A1A1A] truncate block">
                Min {med.rules.minOrderQty}{hasMultiples ? ` • ×${med.rules.orderMultiple}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Truemeds-Style Branded Substitute / Generic Savings Banner */}
        <div className="p-2 rounded-lg bg-purple-50 border border-purple-200/80 text-purple-900 text-[11px] font-bold flex items-center justify-between hover:bg-purple-100/70 transition-colors">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-purple-700 shrink-0" />
            <span className="truncate">Save up to 40% with Generic Equivalent</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-purple-700 shrink-0" />
        </div>

        {/* Recalled Notice */}
        {isRecalled && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Batch Recall in Effect for this SKU</span>
          </div>
        )}
      </div>

      {/* Card Action Row: Inspect Batches & ADD */}
      <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectMedicine(med);
          }}
          className="flex-1 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#1A1A1A] font-bold text-xs transition-colors text-center"
        >
          Inspect Batches
        </button>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={totalStock <= 0}
          className="px-5 py-2 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-xs uppercase shadow-xs transition-all flex items-center gap-1.5 active:scale-95 group/btn shrink-0"
          title={`Add MOQ (${med.rules.minOrderQty || 10} units) to Cart`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>ADD</span>
        </button>
      </div>
    </div>
  );
};
