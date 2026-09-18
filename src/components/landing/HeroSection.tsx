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
  Sparkles,
  Award,
  Truck,
  TrendingUp,
  FileCheck2,
  Lock
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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800">
      {/* Dynamic ambient glow & radial backdrop */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Micro-dot grid mesh for premium SaaS texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
        {/* Top Trust & Regulation Ribbon */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-sky-400 text-xs font-semibold shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <span>Form 20B/21B Wholesale Compliant</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CDSCO Schedules H, H1 & X</span>
          </div>

          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Isolated Multi-Tenant Architecture</span>
          </div>
        </div>

        {/* Main Grid: Left Headline + Right Live Interactive Enterprise Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Authentic Enterprise B2B Pitch */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
                Healthcare Supply Chain Infrastructure
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                Regulated Medicine Distribution{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400">
                  Direct From Manufacturers
                </span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
              PharmXpress enables licensed wholesale distributors to transact directly with approved pharmaceutical manufacturers with guaranteed batch-level FEFO reservation, automated volume discount tiers, and compliant returns.
            </p>

            {/* Action Buttons: Primary & Secondary */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setPortalMode('distributor');
                  if (onExploreCatalog) onExploreCatalog();
                }}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                  portalMode === 'distributor'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Explore Medicine Catalog</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={() => {
                  setPortalMode('manufacturer');
                  switchPredefinedUser('usr-acme-admin-01');
                }}
                className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                  portalMode === 'manufacturer'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Manufacturer Workspace</span>
              </button>
            </div>

            {/* Live Operational Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-2xs">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  {tenants.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">GMP Tenants</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-2xs">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  {totalSKUs}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Formulations</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-2xs">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  {distributors.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Distributors</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-2xs">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  100%
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Batch Traceability</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Live Interactive Context Card */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
              {/* Header inside card */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Activity className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Multi-Tenant Context Terminal</span>
                    <span className="text-[10px] text-slate-400">FEFO Engine • Negative Stock Lock</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              </div>

              {/* Multi-Tenant Switcher */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Active Principal:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {tenants.map((t) => {
                    const isSelected = t.id === activeTenantId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTenantId(t.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-sky-950/70 border-sky-500/60 text-white shadow-md shadow-sky-500/10'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold truncate">{t.shortName}</span>
                          <div className={`w-2.5 h-2.5 rounded-full ${t.logoColor}`} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono truncate block">
                          DL: {t.drugLicenseNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Context Status Details */}
              <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Selected Manufacturer:</span>
                  <span className="font-bold text-slate-200">{currentTenant.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Logged Wholesale Buyer:</span>
                  <span className="font-bold text-indigo-300">{currentDistributor.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Commercial Standing:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Authorized
                  </span>
                </div>
              </div>

              {/* Platform Safeguards */}
              <div className="space-y-2 pt-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Deterministic FEFO batch order deduction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Enforced MOQ, pack multiples & monthly quotas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>CPCB Form 6 & certified reverse waste disposal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
