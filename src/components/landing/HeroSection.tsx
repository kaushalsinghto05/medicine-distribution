import React, { useState } from 'react';
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
  Lock,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  ThermometerSnowflake,
  Shield,
  HelpCircle
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

  const [selectedHub, setSelectedHub] = useState('bhiwandi');
  const [heroSearch, setHeroSearch] = useState('');

  const totalSKUs = medicines.length;

  const distributionHubs = [
    { id: 'bhiwandi', name: 'Bhiwandi Central DC', state: 'Maharashtra', delivery: 'Same-Day Dispatch', cutoff: '5:30 PM' },
    { id: 'lucknow', name: 'Lucknow Transport Nagar Depot', state: 'Uttar Pradesh', delivery: '24-48h Delivery', cutoff: '4:00 PM' },
    { id: 'baddi', name: 'Baddi Industrial Logistics Park', state: 'Himachal Pradesh', delivery: 'Direct Factory Dispatch', cutoff: '2:00 PM' },
    { id: 'ahmedabad', name: 'Ahmedabad GIDC Depot', state: 'Gujarat', delivery: 'Next-Day Express', cutoff: '6:00 PM' },
  ];

  const activeHubData = distributionHubs.find(h => h.id === selectedHub) || distributionHubs[0];

  const trendingMolecules = [
    'Paracetamol 650mg',
    'Amoxyclav 625mg',
    'Pantoprazole 40mg',
    'Azithromycin 500mg',
    'Ceftriaxone 1g Inj'
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPortalMode('distributor');
    if (onExploreCatalog) onExploreCatalog();
  };

  const handleMoleculeClick = (molecule: string) => {
    setHeroSearch(molecule);
    setPortalMode('distributor');
    if (onExploreCatalog) onExploreCatalog();
  };

  return (
    <div className="relative bg-slate-950 text-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Micro-dot grid mesh */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
          {/* Top Regulatory Trust Badges (Non-duplicative, distinctive credentials) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-teal-400 text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span>CDSCO Form 20B/21B Wholesale Verified</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
              <span>WHO-GMP & ISO 9001:2015 Principals</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-400 stroke-[1.75]" />
              <span>Cold Chain Monitored (2°C - 8°C)</span>
            </div>

            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 text-indigo-400 stroke-[1.75]" />
              <span>Isolated Multi-Tenant Architecture</span>
            </div>
          </div>

          {/* Main Grid: Left B2B Marketplace Pitch & Search + Right Hub & Multi-Tenant Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-950/80 border border-teal-800/80 text-teal-300 text-[11px] font-bold uppercase tracking-wider">
                  <Truck className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Pan-India B2B Pharmaceutical Supply Chain</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                  Direct Medicine Procurement{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-sky-300 to-indigo-400">
                    From Licensed Manufacturers
                  </span>
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
                Connecting wholesale distributors and institutional pharmacies with certified pharmaceutical manufacturers. Transparent net PTR rates, guaranteed batch-level FEFO allocation, automated volume schemes, and certified CPCB returns.
              </p>

              {/* High-Contrast Live Search Box */}
              <div className="pt-1">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 stroke-[1.75] absolute left-4 top-3.5" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="Search by brand name, generic molecule (e.g. Paracetamol), manufacturer..."
                      className="w-full text-xs sm:text-sm pl-11 pr-4 py-3.5 rounded-l-2xl border border-r-0 border-slate-700 bg-slate-900/90 text-white placeholder-slate-400 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 sm:px-7 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-r-2xl transition-all flex items-center gap-1.5 shadow-lg shadow-teal-600/20 shrink-0 active:scale-[0.98]"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4 stroke-[2] hidden sm:inline" />
                  </button>
                </form>

                {/* Trending Molecules Chips */}
                <div className="flex items-center gap-1.5 pt-2.5 overflow-x-auto text-[11px] text-slate-400 scrollbar-none">
                  <span className="font-semibold text-slate-400 shrink-0">Trending:</span>
                  {trendingMolecules.map((mol) => (
                    <button
                      key={mol}
                      onClick={() => handleMoleculeClick(mol)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-teal-300 transition-colors whitespace-nowrap shrink-0"
                    >
                      {mol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Unified Primary Action Color */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setPortalMode('distributor');
                    if (onExploreCatalog) onExploreCatalog();
                  }}
                  className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                    portalMode === 'distributor'
                      ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/30'
                      : 'bg-teal-600 hover:bg-teal-500 text-white'
                  }`}
                >
                  <Store className="w-4 h-4 stroke-[1.75]" />
                  <span>Explore Distributor Marketplace</span>
                  <ArrowRight className="w-4 h-4 stroke-[2] ml-0.5" />
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
                  <Building2 className="w-4 h-4 text-sky-400 stroke-[1.75]" />
                  <span>Manufacturer Workspace</span>
                </button>
              </div>

              {/* Live Operational Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
                <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                    {tenants.length}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">GMP Tenants</div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                    {totalSKUs}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Formulations</div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                    {distributors.length}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Distributors</div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums">
                    100%
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">FEFO Traceability</div>
                </div>
              </div>
            </div>

            {/* Right Column: Refined Dark Gradient Panel (Item 11) */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl p-5 sm:p-6 border border-slate-800/90 shadow-2xl space-y-4">
                {/* Header inside card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                      <MapPin className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Regional Fulfillment Depot</span>
                      <span className="text-[10px] text-slate-400">{activeHubData.name} ({activeHubData.state})</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    DISPATCH READY
                  </span>
                </div>

                {/* Hub Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Select Regional Fulfillment Hub:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {distributionHubs.map((hub) => {
                      const isSelected = hub.id === selectedHub;
                      return (
                        <button
                          key={hub.id}
                          type="button"
                          onClick={() => setSelectedHub(hub.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-teal-950/70 border-teal-500 text-white shadow-md shadow-teal-500/10'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{hub.name.split(' ')[0]} Hub</div>
                          <div className="text-[10px] text-teal-400 font-medium truncate">{hub.delivery}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Standardized Cutoff Badge (Item 14: Identical to marketplace banner) */}
                  <div className="pt-1 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-400 stroke-[1.75]" />
                      <span>Same-Day Dispatch Cutoff: <strong className="font-mono text-amber-200">5:30 PM</strong></span>
                    </div>
                    <span className="text-emerald-400 font-semibold text-xs font-mono">100% In-Stock</span>
                  </div>
                </div>

                {/* Multi-Tenant Switcher */}
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Pharmaceutical Principal:
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
                <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Selected Manufacturer:</span>
                    <span className="font-bold text-slate-200">{currentTenant.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Authenticated Buyer:</span>
                    <span className="font-bold text-teal-300">{currentDistributor.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Form 20B/21B Status:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.75]" />
                      Verified & Authorized
                    </span>
                  </div>
                </div>

                {/* Platform Safeguards */}
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 stroke-[1.75]" />
                    <span>Deterministic batch-level FEFO auto-reservation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 stroke-[1.75]" />
                    <span>Configurable MOQ, step multiples & quota checks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 stroke-[1.75]" />
                    <span>CPCB Form 6 & certified hazardous waste destruction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seamless Dark-to-Light Transition Bridge (Fixes Item 1 Theme Inconsistency) */}
      <div className="h-10 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-50 border-b border-slate-200/60 pointer-events-none" />
    </div>
  );
};
