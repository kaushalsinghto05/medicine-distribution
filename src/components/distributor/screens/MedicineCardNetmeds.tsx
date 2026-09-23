import React from 'react';
import { Medicine, CartItem } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency, formatDate, getExpiryStatus } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { getMedicineVisual, getMedicineIndication, getFallbackMedicineImage } from '../../../utils/medicineVisuals';
import { 
  Plus, 
  AlertTriangle, 
  Flame, 
  Snowflake, 
  Truck, 
  ChevronRight, 
  Sparkles,
  ShieldCheck,
  Check,
  Package,
  Info
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
  const { currentDistributor, tenants, addToCart, addToast, openLoginModal } = useStore();
  const { isAuthenticated } = useAuth();

  const tenant = tenants.find((t) => t.id === med.tenantId);
  const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
  const fefoBatches = sortBatchesFEFO(med.batches);
  const activeBatch = fefoBatches.find((b) => b.availableQuantity > 0) || fefoBatches[0];
  const pricingResult = computeEffectivePrice(med, currentDistributor.id, med.rules.minOrderQty);
  const distributorPrice = pricingResult.effectiveUnitPrice;
  const savingsPercent = med.mrp > 0 ? Math.round(((med.mrp - distributorPrice) / med.mrp) * 100) : 0;
  const isRecalled = med.batches.some((b) => b.lifecycleStatus === 'recalled');
  
  const visual = getMedicineVisual(med);
  const indication = getMedicineIndication(med);
  const imageUrl = med.imageUrl || getFallbackMedicineImage(med);
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

    if (!isAuthenticated) {
      openLoginModal(
        `Sign in or create your wholesale account to add ${qty} ${med.packagingUnit}s of ${med.name} to cart.`,
        item
      );
      return;
    }

    addToCart(item);
    addToast('success', 'Added to Cart', `Added ${qty} ${med.packagingUnit}s of ${med.name} at ${formatCurrency(validation.effectivePrice)}/unit.`);
  };

  return (
    <div
      onClick={() => onSelectMedicine(med)}
      className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 hover:border-[#1A504C] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      <div className="space-y-3.5">
        {/* 1. Large Crisp Packaging Photograph Container */}
        <div className="w-full h-48 rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-50/70 border border-gray-200/90 relative overflow-hidden flex items-center justify-center p-2.5">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={med.name}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 shadow-2xs"
              onError={(e) => {
                e.currentTarget.src = getFallbackMedicineImage(med);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <Package className="w-12 h-12 text-[#1A504C]/40 mb-1" />
              <span className="text-xs font-bold text-[#1A504C]">{med.name}</span>
            </div>
          )}

          {/* Floating Top-Left: Green Savings Badge */}
          {savingsPercent > 0 && (
            <div className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-[11px] px-2.5 py-1 rounded-lg shadow-sm tracking-wide z-10 flex items-center gap-1">
              <span>{savingsPercent}% OFF</span>
            </div>
          )}

          {/* Floating Top-Right: Category & Cold-Chain Badges */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white/95 backdrop-blur-xs border border-gray-200 text-purple-800 shadow-2xs">
              {med.regulatory.scheduleClassification}
            </span>
            {med.regulatory.isColdChain && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-600 text-white flex items-center gap-1 shadow-sm">
                <Snowflake className="w-3 h-3 text-white fill-white" />
                <span>2°C–8°C Cold Chain</span>
              </span>
            )}
          </div>

          {/* Floating Bottom-Left: Friendly Dosage Form Label */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <span>{indication.icon}</span>
            <span>{indication.formLabel}</span>
          </div>

          {/* Floating Bottom-Right: Manufacturer Pill */}
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-white/95 backdrop-blur-xs border border-gray-200 text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1.5 shadow-2xs">
            <div className={`w-2 h-2 rounded-full ${tenant?.logoColor || 'bg-teal-500'}`} />
            <span className="truncate max-w-[100px]">{tenant?.shortName}</span>
          </div>
        </div>

        {/* 2. Medicine Identity: Name & Molecule */}
        <div className="space-y-1">
          <h3 className="font-heading font-black text-[#1A1A1A] text-base group-hover:text-[#1A504C] transition-colors line-clamp-1 leading-snug">
            {med.brandName || med.name}
          </h3>
          <p className="text-xs text-[#6B7280] truncate font-medium">
            {med.name} • {med.genericName}
          </p>
        </div>

        {/* 3. Plain-English "Used for" Indication Badge (Easy for anyone to understand!) */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${indication.badgeBg} border ${indication.badgeBorder} ${indication.badgeText} text-xs font-extrabold shadow-2xs`}>
          <span className="text-base shrink-0">{indication.icon}</span>
          <div className="truncate">
            <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider leading-none">Used For:</span>
            <span className="truncate block mt-0.5">{indication.label}</span>
          </div>
        </div>

        {/* 4. Pack Size & Stock / Fresh Batch Indicator */}
        <div className="flex items-center justify-between text-xs py-1 border-y border-gray-100 text-[#4B5563]">
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#1A504C]" />
            <span className="font-semibold">{med.packSize}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{totalStock > 0 ? `In Stock (${totalStock})` : 'Out of Stock'}</span>
          </div>
        </div>

        {/* 5. Clear Pricing Block */}
        <div className="pt-0.5">
          {med.mrp > 0 && (
            <div className="text-xs text-gray-400 line-through tabular-nums font-medium">
              MRP: {formatCurrency(med.mrp)}
            </div>
          )}
          <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
            <span className="text-2xl font-black text-[#1A1A1A] tabular-nums tracking-tight">
              {formatCurrency(distributorPrice)}
            </span>
            <span className="text-[10px] font-black text-[#1A504C] uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              Wholesale Rate
            </span>
            {savingsPercent > 0 && (
              <span className="text-xs font-bold text-emerald-700">
                (Save {savingsPercent}%)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-1.5">
            <Truck className="w-3.5 h-3.5 text-[#1A504C]" />
            <span>Express 4-Hour Dispatch</span>
            <span>•</span>
            <span>Min Qty: {med.rules.minOrderQty}</span>
          </div>
        </div>

        {/* Recalled Notice if applicable */}
        {isRecalled && (
          <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Batch Recall Alert in Effect</span>
          </div>
        )}
      </div>

      {/* 6. Friendly, Prominent Action Buttons */}
      <div className="pt-3.5 mt-3.5 border-t border-gray-100 flex items-center gap-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectMedicine(med);
          }}
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#1A1A1A] font-bold text-xs transition-colors text-center shadow-2xs"
        >
          Details
        </button>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={totalStock <= 0}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-xs uppercase shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 group/btn"
          title={`Add ${med.rules.minOrderQty || 10} units to Cart`}
        >
          <Plus className="w-4 h-4 stroke-[3] group-hover/btn:rotate-90 transition-transform" />
          <span>+ Add to Cart</span>
        </button>
      </div>
    </div>
  );
};
