import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, Batch, CartItem } from '../../../types';
import { formatCurrency, formatDate, getExpiryStatus } from '../../../utils/formatters';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { AlertCircle, ShoppingCart, AlertTriangle } from 'lucide-react';

interface MedicineDetailModalProps {
  medicine: Medicine | null;
  onClose: () => void;
  initialQuantity?: number;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  onClose,
  initialQuantity,
}) => {
  const {
    currentDistributor,
    tenants,
    addToCart,
    presetDemoTarget,
    setPresetDemoTarget,
  } = useStore();

  if (!medicine) return null;

  const tenant = tenants.find((t) => t.id === medicine.tenantId);
  const fefoBatches = sortBatchesFEFO(medicine.batches);

  // Selected batch defaults to first FEFO batch with stock
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    fefoBatches.find((b) => b.availableQuantity > 0)?.id || fefoBatches[0]?.id || ''
  );

  const selectedBatch =
    medicine.batches.find((b) => b.id === selectedBatchId) || fefoBatches[0];

  // Quantity input state (respects presetDemoTarget if present)
  const defaultQty =
    presetDemoTarget?.medicineId === medicine.id && presetDemoTarget.targetQty
      ? presetDemoTarget.targetQty
      : initialQuantity || medicine.rules.minOrderQty || 10;

  const [quantity, setQuantity] = useState<number>(defaultQty);

  // Sync batch and quantity when medicine changes
  useEffect(() => {
    const sorted = sortBatchesFEFO(medicine.batches);
    const defaultBatch = sorted.find((b) => b.availableQuantity > 0)?.id || sorted[0]?.id || '';
    setSelectedBatchId(defaultBatch);

    const targetQ =
      presetDemoTarget?.medicineId === medicine.id && presetDemoTarget.targetQty
        ? presetDemoTarget.targetQty
        : initialQuantity || medicine.rules.minOrderQty || 10;
    setQuantity(targetQ);
  }, [medicine.id, initialQuantity, presetDemoTarget]);

  // LIVE RULES VALIDATION (Section 3.3, 4, 5)
  const validation = validateOrderQuantity(currentDistributor, medicine, quantity);

  // Remaining monthly quota calculation
  const tenantRelation = currentDistributor.authorizedTenants[medicine.tenantId];
  const monthlyLimit = medicine.rules.monthlyLimit || tenantRelation?.monthlyQuantityLimit || 2000;
  const monthlyUsed = tenantRelation?.monthlyQuantityUsed || 0;
  const remainingMonthlyQuota = Math.max(0, monthlyLimit - monthlyUsed);

  const handleAddToCart = () => {
    if (!validation.isValid || !selectedBatch) return;
    if (
      selectedBatch.lifecycleStatus === 'recalled' ||
      selectedBatch.lifecycleStatus === 'expired' ||
      selectedBatch.lifecycleStatus === 'expired_damaged'
    ) {
      return;
    }

    const item: CartItem = {
      medicineId: medicine.id,
      tenantId: medicine.tenantId,
      batchId: selectedBatch.id,
      quantity,
      unitPrice: validation.effectivePrice,
      mrp: medicine.mrp,
      packagingUnit: medicine.packagingUnit,
      medicineName: medicine.name,
      genericName: medicine.genericName,
      batchNumber: selectedBatch.batchNumber,
      expiryDate: selectedBatch.expiryDate,
    };

    addToCart(item);
    // Clear demo target if satisfied
    if (presetDemoTarget?.medicineId === medicine.id) {
      setPresetDemoTarget(null);
    }
    onClose();
  };

  const handleSnapToMultiple = () => {
    const multiple = medicine.rules.orderMultiple || 1;
    const snapped = Math.max(
      medicine.rules.minOrderQty,
      Math.round(quantity / multiple) * multiple
    );
    setQuantity(snapped);
  };

  const isBatchBlocked =
    selectedBatch?.lifecycleStatus === 'recalled' ||
    selectedBatch?.lifecycleStatus === 'expired' ||
    selectedBatch?.lifecycleStatus === 'expired_damaged';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 my-auto sm:my-8 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                {tenant?.shortName || 'Manufacturer'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {medicine.regulatory.scheduleClassification}
              </span>
              {medicine.regulatory.rxRequired && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Rx Required
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
              {medicine.name}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Generic: {medicine.genericName} • Pack: {medicine.packSize}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Demo Preset Helper Alert (If test case active) */}
        {presetDemoTarget?.medicineId === medicine.id && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Active Test Scenario Target</span>
              <p className="mt-0.5">{presetDemoTarget.description}</p>
            </div>
          </div>
        )}

        {/* Grid: Batches & Slabs (Left) + Quantity & Live Validator (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Batches & Pricing Tiers */}
          <div className="space-y-4">
            {/* Batch Selection with FEFO Recommendation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Available Batches (FEFO Prioritized)
              </label>
              <div className="space-y-2">
                {fefoBatches.map((b, idx) => {
                  const expiryStatus = getExpiryStatus(b.expiryDate);
                  const isSelected = selectedBatchId === b.id;

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBatchId(b.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-1 ring-sky-400'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{b.batchNumber}</span>
                          {idx === 0 && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              FEFO Best
                            </span>
                          )}
                          {b.lifecycleStatus === 'recalled' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                              Recalled
                            </span>
                          )}
                          {(b.lifecycleStatus === 'expired' || b.lifecycleStatus === 'expired_damaged') && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                              Expired
                            </span>
                          )}
                          {b.lifecycleStatus === 'near_expiry' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                              Near Expiry
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${expiryStatus.bgClass}`}>
                          {expiryStatus.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 mt-2 text-[11px]">
                        <span>Expiry: {formatDate(b.expiryDate)}</span>
                        <span>
                          Available:{' '}
                          <strong className="text-slate-900 font-bold">
                            {b.availableQuantity.toLocaleString()} {b.packagingUnit}s
                          </strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slab Pricing Table */}
            {medicine.pricing.slabs && medicine.pricing.slabs.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Volume Slab Discounts
                </span>
                <div className="space-y-1 text-xs">
                  {medicine.pricing.slabs.map((slab, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-600">
                      <span>
                        {slab.minQty} - {slab.maxQty === Infinity ? 'Above' : slab.maxQty}{' '}
                        {medicine.packagingUnit}s:
                      </span>
                      <span className="font-bold text-sky-700">
                        {formatCurrency(slab.pricePerUnit)} / unit
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quota Progress Bar (Section 3.3, 5 Test Case 2) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Your Monthly Quota</span>
                <span className="font-bold text-slate-900">
                  {remainingMonthlyQuota.toLocaleString()} of {monthlyLimit.toLocaleString()}{' '}
                  {medicine.packagingUnit}s remaining
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (remainingMonthlyQuota / monthlyLimit) * 100)
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500">
                Resets on the 1st of every calendar month per manufacturer allocation.
              </p>
            </div>
          </div>

          {/* Right Column: Quantity Input & Real-Time Rule Validator */}
          <div className="space-y-4">
            {/* Price Header */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                    Your Wholesale Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-extrabold text-sky-900">
                      {formatCurrency(validation.effectivePrice)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      MRP {formatCurrency(medicine.mrp)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Save {Math.round(((medicine.mrp - validation.effectivePrice) / medicine.mrp) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Ordering Policy Badges */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Ordering Conditions
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium">
                  Min Order: <strong>{medicine.rules.minOrderQty}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium">
                  Multiples of: <strong>{medicine.rules.orderMultiple}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium">
                  Max per Order: <strong>{medicine.rules.maxOrderQty}</strong>
                </span>
              </div>
            </div>

            {/* REACTIVE QUANTITY INPUT (Section 3.3 live validation) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-900">
                  Order Quantity ({medicine.packagingUnit}s)
                </label>
                {medicine.rules.orderMultiple > 1 && quantity % medicine.rules.orderMultiple !== 0 && (
                  <button
                    onClick={handleSnapToMultiple}
                    className="text-[10px] font-bold text-sky-600 hover:underline flex items-center gap-0.5"
                  >
                    Snap to multiple of {medicine.rules.orderMultiple}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) =>
                      Math.max(
                        0,
                        prev - (medicine.rules.orderMultiple || 1)
                      )
                    )
                  }
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition-colors text-base"
                >
                  -
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={`flex-1 text-center text-lg font-bold py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                    validation.isValid
                      ? 'border-slate-300 focus:ring-sky-500'
                      : 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500'
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) => prev + (medicine.rules.orderMultiple || 1))
                  }
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition-colors text-base"
                >
                  +
                </button>
              </div>

              {/* INLINE VALIDATION ERRORS & WARNINGS (Prompt Requirement 3.3, 4, 5) */}
              <div className="mt-2 space-y-1.5">
                {validation.errors.map((err, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl animate-in fade-in"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}

                {validation.warnings.map((warn, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Computed Price x Quantity Summary */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Calculated Subtotal:</span>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-slate-900">
                    {formatCurrency(validation.totalComputedPrice)}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    ({quantity} {medicine.packagingUnit}s × {formatCurrency(validation.effectivePrice)})
                  </span>
                </div>
              </div>
            </div>

            {/* ADD TO CART ACTION */}
            <button
              disabled={!validation.isValid || isBatchBlocked}
              onClick={handleAddToCart}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                validation.isValid && !isBatchBlocked
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isBatchBlocked
                ? selectedBatch?.lifecycleStatus === 'recalled'
                  ? 'Recalled Batch — Quarantine Only'
                  : 'Expired Batch — Not for Sale'
                : validation.isValid
                ? `Add ${quantity} ${medicine.packagingUnit}s to Cart`
                : validation.errors[0] || 'Invalid Quantity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
