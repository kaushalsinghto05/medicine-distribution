import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Activity,
  Award,
  Truck
} from 'lucide-react';

interface HeroSectionProps {
  onOpenLogin?: () => void;
  onExploreCatalog?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenLogin,
  onExploreCatalog,
}) => {
  const { 
    portalMode, 
    setPortalMode, 
    tenants, 
    medicines, 
    distributors, 
    activeTenantId,
    setActiveTenantId,
    currentTenant,
    currentDistributor
  } = useStore();
  const { switchPredefinedUser } = useAuth();

  const totalSKUs = medicines.length;

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800">
      {/* Background Subtle Tech Architectural Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14">
        {/* Top Regulatory Compliance Chip Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 text-xs font-medium shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <span>Form 20B/21B Wholesale Compliant</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CDSCO Schedules H, H1 & X Governed</span>
          </div>

          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 text-xs font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Tenant Batch Segregation</span>
          </div>
        </div>

        {/* Hero Grid: Main Value Statement (Left) + Interactive Live Network Deck (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Authentic Enterprise B2B Pitch */}
          <div className="lg:col-span-7 space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
              Regulated Pharmaceutical Distribution{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400">
                Between Verified Manufacturers & Distributors
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
              Direct B2B supply chain connecting licensed pharmaceutical manufacturers with authorized wholesale distributors. 
              Enforces real-time batch allocation, volume tiered pricing, credit underwriting, and CPCB-compliant expired return logistics.
            </p>

            {/* Persona Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setPortalMode('distributor');
                  if (onExploreCatalog) onExploreCatalog();
                }}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                  portalMode === 'distributor'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-400/40'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Enter Wholesale Marketplace</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={() => {
                  setPortalMode('manufacturer');
                  switchPredefinedUser('usr-acme-admin-01');
                }}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                  portalMode === 'manufacturer'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Manufacturer Workspace</span>
              </button>
            </div>

            {/* Quick Live Operational Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  {tenants.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">GMP Tenants</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  {totalSKUs}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Active Formulations</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  {distributors.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Licensed Distributors</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  100%
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Batch Traceability</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Architecture & Operational Sandbox Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-2xl backdrop-blur-sm space-y-4">
              {/* Header inside card */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Active Governance Engine</span>
                    <span className="text-[10px] text-slate-400">Zero-Overbooking • Tiered Pricing</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LIVE ENGINE
                </span>
              </div>

              {/* Multi-Tenant Quick Switcher preview in Hero */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Select Tenant Context:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tenants.map((t) => {
                    const isSelected = t.id === activeTenantId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTenantId(t.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-sky-950/60 border-sky-500/50 text-white ring-1 ring-sky-500/30'
                            : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold truncate">{t.shortName}</span>
                          <div className={`w-2 h-2 rounded-full ${t.logoColor}`} />
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono truncate block">
                          DL: {t.drugLicenseNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Context Status Details */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Active Tenant Principal:</span>
                  <span className="font-bold text-slate-200">{currentTenant.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Verified Buyer Context:</span>
                  <span className="font-bold text-indigo-300">{currentDistributor.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Authorization Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Wholesale Authorized
                  </span>
                </div>
              </div>

              {/* Verified Platform Safeguards list */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Strict multi-tenant catalog & inventory isolation</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Configurable MOQ, order multiples & monthly caps</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>CPCB Form 6 & certificate-backed waste disposal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
