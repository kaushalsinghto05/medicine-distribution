import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext';
import { Medicine, Batch, CartItem } from '../../../types';
import { formatCurrency, formatDate, getExpiryStatus } from '../../../utils/formatters';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { getMedicineIndication, getFallbackMedicineImage } from '../../../utils/medicineVisuals';
import { 
  AlertCircle, 
  ShoppingCart, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  X, 
  Layers,
  Plus,
  Minus,
  Snowflake,
  Package,
  Thermometer
} from 'lucide-react';
import { Button } from '../../ui/Button';

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
    openLoginModal,
  } = useStore();
  const { isAuthenticated } = useAuth();

  if (!medicine) return null;

  const tenant = tenants.find((t) => t.id === medicine.tenantId);
  const fefoBatches = sortBatchesFEFO(medicine.batches);
  const indication = getMedicineIndication(medicine);
  const imageUrl = medicine.imageUrl || getFallbackMedicineImage(medicine);

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
  const [shakeInput, setShakeInput] = useState(false);

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

  // LIVE RULES VALIDATION
  const validation = validateOrderQuantity(currentDistributor, medicine, quantity);

  // Remaining monthly quota calculation
  const tenantRelation = currentDistributor.authorizedTenants[medicine.tenantId];
  const monthlyLimit = medicine.rules.monthlyLimit || tenantRelation?.monthlyQuantityLimit || 2000;
  const monthlyUsed = tenantRelation?.monthlyQuantityUsed || 0;
  const remainingMonthlyQuota = Math.max(0, monthlyLimit - monthlyUsed);
  const quotaUsedPercent = Math.min(100, Math.round((monthlyUsed / monthlyLimit) * 100));

  const handleStepQuantity = (delta: number) => {
    const step = medicine.rules.orderMultiple || 1;
    setQuantity((prev) => Math.max(0, prev + delta * step));
  };

  const handleAddToCart = () => {
    if (!validation.isValid || !selectedBatch) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 400);
      return;
    }
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

    if (!isAuthenticated) {
      openLoginModal(
        `Please sign in or create your wholesale account to add ${quantity} ${medicine.packagingUnit}s of ${medicine.name} to cart.`,
        item
      );
      onClose();
      return;
    }

    addToCart(item);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 my-auto sm:my-8 space-y-5 max-h-[94vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F3F1] text-[#1A504C] border border-teal-200">
                {tenant?.shortName || 'Manufacturer'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {medicine.regulatory.scheduleClassification}
              </span>
              {medicine.regulatory.isColdChain && (
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                  <Snowflake className="w-3 h-3 text-blue-600" />
                  <span>2°C–8°C Cold Chain</span>
                </span>
              )}
              {medicine.regulatory.rxRequired && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Prescription Rx Required
                </span>
              )}
            </div>
            
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#1A1A1A] tracking-tight">
              {medicine.brandName || medicine.name}
            </h2>
            <p className="text-xs font-medium text-[#6B7280]">
              Molecule: {medicine.genericName} • Pack: {medicine.packSize}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Plain-English "Used for" Banner */}
        <div className={`flex items-center gap-3 p-3.5 rounded-2xl ${indication.badgeBg} border ${indication.badgeBorder} ${indication.badgeText} text-xs font-bold`}>
          <span className="text-2xl shrink-0">{indication.icon}</span>
          <div>
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">Primary Use / Indication:</span>
            <span className="text-sm font-extrabold block">{indication.label}</span>
          </div>
        </div>

        {/* Demo Preset Helper Alert (If test case active) */}
        {presetDemoTarget?.medicineId === medicine.id && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Active Test Scenario Preset</span>
              <p className="mt-0.5">{presetDemoTarget.description}</p>
            </div>
          </div>
        )}

        {/* Two-Column Desktop Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Product Photo & Batches */}
          <div className="space-y-4">
            {/* Real Product Packaging Photo Showcase */}
            <div className="w-full h-52 rounded-2xl overflow-hidden border border-gray-200 relative bg-slate-50 shadow-xs group flex items-center justify-center p-2">
              <img
                src={imageUrl}
                alt={medicine.name}
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = getFallbackMedicineImage(medicine);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-extrabold uppercase tracking-wider text-[10px] bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
                  {medicine.packagingUnit} • {medicine.packSize}
                </span>
                <span className="font-black text-[10px] text-[#4BE1E4] tracking-wide uppercase bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  Authentic Packaging Photo
                </span>
              </div>
            </div>

            {/* Storage Conditions Card */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#4B5563] flex items-start gap-2.5">
              <Thermometer className="w-4 h-4 text-[#1A504C] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1A1A1A] block">Storage Conditions:</span>
                <span className="text-[11px] leading-relaxed">{medicine.regulatory.storageConditions}</span>
              </div>
            </div>

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
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'border-[#1A504C] bg-[#E8F3F1]/50 shadow-xs ring-1 ring-[#1A504C]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{b.batchNumber}</span>
                          {idx === 0 && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              FEFO Freshest
                            </span>
                          )}
                          {b.lifecycleStatus === 'recalled' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300">
                              Recalled
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${expiryStatus.colorClass}`}>
                          {expiryStatus.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 mt-1.5 text-[11px]">
                        <span>Exp: {formatDate(b.expiryDate)}</span>
                        <span>
                          Stock:{' '}
                          <strong className="text-slate-900 font-bold tabular-nums">
                            {b.availableQuantity.toLocaleString()} {medicine.packagingUnit}s
                          </strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Volume Slabs Table */}
            {medicine.pricing.slabs && medicine.pricing.slabs.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Volume Pricing Tiers
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Order Quantity</th>
                        <th className="py-2 px-3">Rate / {medicine.packagingUnit}</th>
                        <th className="py-2 px-3">Discount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {medicine.pricing.slabs.map((s, idx) => {
                        const discountPct = medicine.mrp > 0
                          ? Math.round(((medicine.mrp - s.pricePerUnit) / medicine.mrp) * 100)
                          : 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 tabular-nums">
                              {s.minQty} - {s.maxQty || 'Above'} {medicine.packagingUnit}s
                            </td>
                            <td className="py-2 px-3 font-bold tabular-nums">
                              {formatCurrency(s.pricePerUnit)}
                            </td>
                            <td className="py-2 px-3 font-semibold text-emerald-700 tabular-nums">
                              {discountPct > 0 ? `${discountPct}%` : 'Standard'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Quantity Selector & Live Rules Engine Validator */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                Configure Order Quantity
              </h4>

              {/* Quantity Stepper Input */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Units ({medicine.packagingUnit}s)
                  </label>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    Step: ×{medicine.rules.orderMultiple} • Min: {medicine.rules.minOrderQty}
                  </span>
                </div>

                <div className={`flex items-center gap-2 ${shakeInput ? 'animate-shake' : ''}`}>
                  <button
                    type="button"
                    onClick={() => handleStepQuantity(-1)}
                    disabled={quantity <= (medicine.rules.minOrderQty || 10)}
                    className="w-12 h-12 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 shadow-2xs font-bold"
                    title="Decrease quantity by step"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min={0}
                    step={medicine.rules.orderMultiple || 1}
                    className={`flex-1 text-center text-xl font-black p-2.5 rounded-xl border tabular-nums transition-colors duration-200 outline-hidden ${
                      !validation.isValid
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-emerald-400 bg-white text-emerald-950 focus:border-[#1A504C] focus:ring-2 focus:ring-teal-100'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => handleStepQuantity(1)}
                    className="w-12 h-12 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white flex items-center justify-center shadow-xs font-bold active:scale-95 transition-all"
                    title="Increase quantity by step"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Monthly Quota Mini Progress Bar */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                  <span>Monthly Quota Used</span>
                  <span className="tabular-nums">
                    {monthlyUsed.toLocaleString()} / {monthlyLimit.toLocaleString()} units ({quotaUsedPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      quotaUsedPercent > 90 ? 'bg-rose-500' : quotaUsedPercent > 60 ? 'bg-amber-500' : 'bg-[#1A504C]'
                    }`}
                    style={{ width: `${quotaUsedPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block tabular-nums">
                  Remaining allowance this calendar month: {remainingMonthlyQuota.toLocaleString()} units
                </span>
              </div>

              {/* Live Rule Verification Feedback */}
              {!validation.isValid ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Ordering Rule Requirement Not Met</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  {validation.errors.some((e) => e.includes('multiples')) && (
                    <button
                      onClick={handleSnapToMultiple}
                      className="mt-1 text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Snap to nearest valid multiple
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Quantity Fully Compliant</span>
                    <p className="text-[11px] text-emerald-700">Satisfies MOQ, packaging multiples, and per-order caps.</p>
                  </div>
                </div>
              )}

              {/* Live Running Total Card */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Unit Wholesale Rate:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(validation.effectivePrice)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Standard MRP:</span>
                  <span className="line-through tabular-nums">{formatCurrency(medicine.mrp)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline font-extrabold text-slate-900">
                  <span className="text-xs">Estimated Order Total:</span>
                  <span className="text-xl text-[#1A504C] tabular-nums font-black">
                    {formatCurrency(validation.totalComputedPrice)}
                  </span>
                </div>
              </div>

              {/* Submit Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!validation.isValid || isBatchBlocked}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-sm uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add {quantity} {medicine.packagingUnit}s to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
