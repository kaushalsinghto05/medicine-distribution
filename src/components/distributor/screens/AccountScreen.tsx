import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatDate } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { ShieldCheck, Send } from 'lucide-react';

export const AccountScreen: React.FC = () => {
  const { currentDistributor, tenants, requestAccessToTenant } = useStore();

  const [targetTenantId, setTargetTenantId] = useState<string>(tenants[0]?.id || '');
  const [form20BInput, setForm20BInput] = useState(currentDistributor.licenses.form20B);
  const [form21BInput, setForm21BInput] = useState(currentDistributor.licenses.form21B);

  useEffect(() => {
    setForm20BInput(currentDistributor.licenses.form20B);
    setForm21BInput(currentDistributor.licenses.form21B);
  }, [currentDistributor.id, currentDistributor.licenses.form20B, currentDistributor.licenses.form21B]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestAccessToTenant(targetTenantId, form20BInput, form21BInput);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Account & Regulatory Credentials</h1>
        <p className="text-xs text-slate-500">
          Wholesale Drug Licenses (Form 20B & 21B), GSTIN, and principal manufacturer authorizations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Firm Details & Current Authorizations */}
        <div className="md:col-span-2 space-y-6">
          {/* Firm Meta */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Wholesale Firm Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Registered Entity</span>
                <span className="font-bold text-slate-900 text-sm">{currentDistributor.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Authorized Officer</span>
                <span className="font-semibold text-slate-800">{currentDistributor.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">GSTIN</span>
                <span className="font-mono font-bold text-slate-800">{currentDistributor.gstin}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">PAN</span>
                <span className="font-mono font-bold text-slate-800">{currentDistributor.panNumber}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Operating Facility Address</span>
                <span className="text-slate-700">
                  {currentDistributor.address}, {currentDistributor.city}, {currentDistributor.state} -{' '}
                  {currentDistributor.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Wholesale Licenses Form 20B & 21B */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                State Drug Control Wholesale Licenses
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Form 20B Wholesale License</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                  {currentDistributor.licenses.form20B}
                </span>
                <span className="text-[10px] text-slate-400">Non-Schedule C/C1 Wholesale</span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block">Form 21B Wholesale License</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                  {currentDistributor.licenses.form21B}
                </span>
                <span className="text-[10px] text-slate-400">Schedule C & C1 Formulations</span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500">
                  License Validity: <strong>{formatDate(currentDistributor.licenses.validFrom)}</strong> to{' '}
                  <strong>{formatDate(currentDistributor.licenses.validTo)}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified Active
                </span>
              </div>
            </div>
          </div>

          {/* Manufacturer Principal Authorizations List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Manufacturer Principal Authorizations
            </h3>

            <div className="space-y-3">
              {tenants.map((t) => {
                const relation = currentDistributor.authorizedTenants[t.id];
                const status = relation?.status || 'unregistered';

                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${t.logoColor}`}></div>
                        <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t.tagline} • DL: {t.drugLicenseNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} size="sm" />
                      {status === 'approved' && (
                        <span className="text-[11px] text-slate-600 font-medium">
                          Quota: {relation?.monthlyQuantityUsed.toLocaleString()} /{' '}
                          {relation?.monthlyQuantityLimit.toLocaleString()} units
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Request Access Form (Section 3.1) */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs sticky top-24">
            <div className="flex items-center gap-2 text-indigo-900">
              <Send className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Request Manufacturer Access
              </h3>
            </div>

            <p className="text-slate-500 leading-relaxed">
              Submit your wholesale credentials to another manufacturing principal to unlock their product catalog.
            </p>

            <form onSubmit={handleRequestSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Manufacturer Principal
                </label>
                <select
                  value={targetTenantId}
                  onChange={(e) => setTargetTenantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Form 20B License Number
                </label>
                <input
                  type="text"
                  required
                  value={form20BInput}
                  onChange={(e) => setForm20BInput(e.target.value)}
                  className="w-full font-mono px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Form 21B License Number
                </label>
                <input
                  type="text"
                  required
                  value={form21BInput}
                  onChange={(e) => setForm21BInput(e.target.value)}
                  className="w-full font-mono px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <span className="font-semibold text-slate-700 block">Required Document:</span>
                <span>Wholesale affidavit scanned PDF (attached automatically from vault).</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Submit Access Application
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
