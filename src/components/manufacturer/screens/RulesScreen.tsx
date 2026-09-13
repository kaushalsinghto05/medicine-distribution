import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { OrderingRules, ShortageBehavior } from '../../../types';
import { generateRuleSummary } from '../../../engine/rulesEngine';
import {
  ShieldAlert,
  Sliders,
  AlertCircle,
  CreditCard,
  FileCheck,
} from 'lucide-react';

export const RulesScreen: React.FC = () => {
  const { currentTenant, tenantMedicines, updateRules, addToast } = useStore();

  const [selectedMedicineId, setSelectedMedicineId] = useState<string>(
    tenantMedicines[0]?.id || ''
  );

  const selectedMed = tenantMedicines.find((m) => m.id === selectedMedicineId) || tenantMedicines[0];

  // Editable rules state
  const [minOrderQty, setMinOrderQty] = useState<number>(selectedMed?.rules.minOrderQty || 10);
  const [orderMultiple, setOrderMultiple] = useState<number>(selectedMed?.rules.orderMultiple || 10);
  const [maxOrderQty, setMaxOrderQty] = useState<number>(selectedMed?.rules.maxOrderQty || 500);
  const [maxDistributorCap, setMaxDistributorCap] = useState<number>(
    selectedMed?.rules.maxDistributorCap || 2500
  );
  const [monthlyLimit, setMonthlyLimit] = useState<number>(selectedMed?.rules.monthlyLimit || 2000);
  const [dailyLimit, setDailyLimit] = useState<number>(selectedMed?.rules.dailyLimit || 1000);
  const [weeklyLimit, setWeeklyLimit] = useState<number>(selectedMed?.rules.weeklyLimit || 1500);
  const [shortageBehavior, setShortageBehavior] = useState<ShortageBehavior>(
    selectedMed?.rules.shortageBehavior || 'reject'
  );
  const [allowOnline, setAllowOnline] = useState<boolean>(
    selectedMed?.rules.applicablePaymentTerms.includes('online') ?? true
  );
  const [allowCredit, setAllowCredit] = useState<boolean>(
    selectedMed?.rules.applicablePaymentTerms.includes('credit') ?? true
  );
  const [creditDays, setCreditDays] = useState<number>(selectedMed?.rules.creditTermsDays || 30);
  const [licenseRequired, setLicenseRequired] = useState<boolean>(
    selectedMed?.rules.distributorEligibility.licenseVerifiedRequired ?? true
  );

  // Sync state when selected medicine or tenant changes
  useEffect(() => {
    if (tenantMedicines.length > 0) {
      const exists = tenantMedicines.some((m) => m.id === selectedMedicineId);
      const targetMed = exists
        ? tenantMedicines.find((m) => m.id === selectedMedicineId)!
        : tenantMedicines[0];
      setSelectedMedicineId(targetMed.id);
      setMinOrderQty(targetMed.rules.minOrderQty);
      setOrderMultiple(targetMed.rules.orderMultiple);
      setMaxOrderQty(targetMed.rules.maxOrderQty);
      setMaxDistributorCap(targetMed.rules.maxDistributorCap);
      setMonthlyLimit(targetMed.rules.monthlyLimit);
      setDailyLimit(targetMed.rules.dailyLimit);
      setWeeklyLimit(targetMed.rules.weeklyLimit);
      setShortageBehavior(targetMed.rules.shortageBehavior);
      setAllowOnline(targetMed.rules.applicablePaymentTerms.includes('online'));
      setAllowCredit(targetMed.rules.applicablePaymentTerms.includes('credit'));
      setCreditDays(targetMed.rules.creditTermsDays || 30);
      setLicenseRequired(targetMed.rules.distributorEligibility.licenseVerifiedRequired);
    }
  }, [currentTenant.id, tenantMedicines]);

  // Sync state when selected medicine changes
  const handleSelectMedicine = (medId: string) => {
    setSelectedMedicineId(medId);
    const med = tenantMedicines.find((m) => m.id === medId);
    if (med) {
      setMinOrderQty(med.rules.minOrderQty);
      setOrderMultiple(med.rules.orderMultiple);
      setMaxOrderQty(med.rules.maxOrderQty);
      setMaxDistributorCap(med.rules.maxDistributorCap);
      setMonthlyLimit(med.rules.monthlyLimit);
      setDailyLimit(med.rules.dailyLimit);
      setWeeklyLimit(med.rules.weeklyLimit);
      setShortageBehavior(med.rules.shortageBehavior);
      setAllowOnline(med.rules.applicablePaymentTerms.includes('online'));
      setAllowCredit(med.rules.applicablePaymentTerms.includes('credit'));
      setCreditDays(med.rules.creditTermsDays || 30);
      setLicenseRequired(med.rules.distributorEligibility.licenseVerifiedRequired);
    }
  };

  const handleSaveRules = () => {
    if (!selectedMed) return;

    const paymentTerms: ('online' | 'credit')[] = [];
    if (allowOnline) paymentTerms.push('online');
    if (allowCredit) paymentTerms.push('credit');

    if (paymentTerms.length === 0) {
      addToast('error', 'Rule Error', 'At least one payment method (Online or Credit) must be enabled.');
      return;
    }

    const updated: OrderingRules = {
      medicineId: selectedMed.id,
      tenantId: currentTenant.id,
      minOrderQty,
      orderMultiple,
      maxOrderQty,
      maxDistributorCap,
      dailyLimit,
      weeklyLimit,
      monthlyLimit,
      shortageBehavior,
      applicablePaymentTerms: paymentTerms,
      creditTermsDays: creditDays,
      distributorEligibility: {
        approvalRequired: true,
        licenseVerifiedRequired: licenseRequired,
        activeAccountOnly: true,
        restrictedScheduleAllowed: selectedMed.regulatory.scheduleClassification !== 'Schedule X',
      },
    };

    updateRules(selectedMed.id, updated);
  };

  if (!selectedMed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500">
        No medicines in catalog for {currentTenant.name}. Please add a medicine to configure ordering rules.
      </div>
    );
  }

  // Construct current preview rules for plain-language card
  const previewRules: OrderingRules = {
    medicineId: selectedMed.id,
    tenantId: currentTenant.id,
    minOrderQty,
    orderMultiple,
    maxOrderQty,
    maxDistributorCap,
    dailyLimit,
    weeklyLimit,
    monthlyLimit,
    shortageBehavior,
    applicablePaymentTerms: [
      ...(allowOnline ? ['online' as const] : []),
      ...(allowCredit ? ['credit' as const] : []),
    ],
    creditTermsDays: creditDays,
    distributorEligibility: {
      approvalRequired: true,
      licenseVerifiedRequired: licenseRequired,
      activeAccountOnly: true,
      restrictedScheduleAllowed: selectedMed.regulatory.scheduleClassification !== 'Schedule X',
    },
  };

  const plainLanguageSummary = generateRuleSummary(
    previewRules,
    'All Authorized Distributors',
    selectedMed.packagingUnit
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ordering Rules & Policy Engine</h1>
          <p className="text-xs text-slate-500">
            Enforce MOQ, order multiples, monthly quotas, shortage behaviors, and payment term restrictions for {currentTenant.shortName}.
          </p>
        </div>

        <button
          onClick={handleSaveRules}
          className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          Save Ordering Rules
        </button>
      </div>

      {/* Plain Language Summary Card (Prompt Section 2.4 requirement) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-sky-900 mb-1.5">
          <FileCheck className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Active Plain-Language Rule Summary
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-900 italic">
          "{plainLanguageSummary}"
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          This summary is automatically rendered for distributors on the marketplace product detail page and cart checkout.
        </p>
      </div>

      {/* Formulation Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
          Target Medicine Formulation:
        </label>
        <select
          value={selectedMedicineId}
          onChange={(e) => handleSelectMedicine(e.target.value)}
          className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none flex-1"
        >
          {tenantMedicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.genericName}) — Pack: {m.packagingUnit}
            </option>
          ))}
        </select>
      </div>

      {/* Rules Config Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Quantity & Multiples Constraints */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Sliders className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Order Boundaries & Multiples
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Order Quantity (MOQ)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={minOrderQty}
                  onChange={(e) => setMinOrderQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <span className="text-slate-500 shrink-0 font-medium">
                  {selectedMed.packagingUnit}s
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Orders below this quantity are rejected (Test Case 4 baseline: 10 strips).
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Order Multiples (Step Size)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={orderMultiple}
                  onChange={(e) => setOrderMultiple(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <span className="text-slate-500 shrink-0 font-medium">
                  {selectedMed.packagingUnit}s
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enforces shipper carton quantities (Test Case 3 baseline: multiples of 10).
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maximum Allowed Quantity per Order
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={maxOrderQty}
                  onChange={(e) => setMaxOrderQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <span className="text-slate-500 shrink-0 font-medium">
                  {selectedMed.packagingUnit}s
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Prevents hoarding (Test Case 1 baseline: max 500 strips/order).
              </p>
            </div>
          </div>
        </div>

        {/* Panel 2: Quota & Purchase Limits */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldAlert className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Distributor Quotas & Frequency Caps
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Monthly Purchase Limit per Distributor
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <span className="text-slate-500 shrink-0 font-medium">
                  {selectedMed.packagingUnit}s / month
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enforced on distributor purchase volume (Test Case 2 baseline: 2,000 strips/month).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Daily Cap</label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Weekly Cap</label>
                <input
                  type="number"
                  value={weeklyLimit}
                  onChange={(e) => setWeeklyLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Overall Distributor Lifetime Cap
              </label>
              <input
                type="number"
                value={maxDistributorCap}
                onChange={(e) => setMaxDistributorCap(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Stock Shortage Behavior */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Stock Shortage Behavior Policy
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            Determines checkout behavior if order quantity exceeds currently available batch inventory:
          </p>

          <div className="space-y-2 text-xs">
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                shortageBehavior === 'reject'
                  ? 'border-rose-300 bg-rose-50/50 text-rose-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="shortage"
                value="reject"
                checked={shortageBehavior === 'reject'}
                onChange={() => setShortageBehavior('reject')}
                className="mt-0.5 text-rose-600"
              />
              <div>
                <span className="font-bold block">Reject Order</span>
                <span className="text-[11px] text-slate-500">
                  Block purchase until production batch stock is replenished. (Acme Paracetamol default).
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                shortageBehavior === 'partial'
                  ? 'border-amber-300 bg-amber-50/50 text-amber-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="shortage"
                value="partial"
                checked={shortageBehavior === 'partial'}
                onChange={() => setShortageBehavior('partial')}
                className="mt-0.5 text-amber-600"
              />
              <div>
                <span className="font-bold block">Allow Available Quantity Only (Partial Fulfilment)</span>
                <span className="text-[11px] text-slate-500">
                  Bill and dispatch whatever is physically available; cancel the unfulfilled remainder.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                shortageBehavior === 'backorder'
                  ? 'border-sky-300 bg-sky-50/50 text-sky-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="shortage"
                value="backorder"
                checked={shortageBehavior === 'backorder'}
                onChange={() => setShortageBehavior('backorder')}
                className="mt-0.5 text-sky-600"
              />
              <div>
                <span className="font-bold block">Backorder Remaining Quantity</span>
                <span className="text-[11px] text-slate-500">
                  Dispatch available stock now and create a backorder backlog for the next batch release.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Panel 4: Payment Terms & Compliance Eligibility */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <CreditCard className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Payment Terms & Commercial Clearance
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="block font-semibold text-slate-700">Permitted Payment Methods</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowOnline}
                  onChange={(e) => setAllowOnline(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="font-medium text-slate-800">
                  Online Payment Gateway (Instant UPI / NetBanking / NEFT)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCredit}
                  onChange={(e) => setAllowCredit(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="font-medium text-slate-800">
                  Credit Terms (Pay later on invoice agreed credit line)
                </span>
              </label>
            </div>

            {allowCredit && (
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Credit Window (Days)
                </label>
                <select
                  value={creditDays}
                  onChange={(e) => setCreditDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value={15}>Net 15 Days</option>
                  <option value={30}>Net 30 Days (Standard Pharma Wholesale)</option>
                  <option value={45}>Net 45 Days</option>
                  <option value={60}>Net 60 Days</option>
                </select>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={licenseRequired}
                  onChange={(e) => setLicenseRequired(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="font-medium text-slate-800">
                  Require Regulatory Form 20B/21B Wholesale License Verification
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
