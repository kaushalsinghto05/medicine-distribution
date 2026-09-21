import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Store, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Truck,
  ArrowRight,
  Package,
  Users,
  Shield
} from 'lucide-react';

interface HeroSectionProps {
  onOpenLogin?: () => void;
  onExploreCatalog?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
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
    currentDistributor,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useStore();
  const { switchPredefinedUser } = useAuth();

  const [selectedHub, setSelectedHub] = useState('bhiwandi');

  const totalSKUs = medicines.length;

  const distributionHubs = [
    { id: 'bhiwandi', name: 'Bhiwandi Central Depot', state: 'Maharashtra', transit: 'Same-day dispatch', cutoff: '5:30 PM' },
    { id: 'lucknow', name: 'Lucknow Transport Nagar Depot', state: 'Uttar Pradesh', transit: '24–48h priority transit', cutoff: '4:00 PM' },
    { id: 'baddi', name: 'Baddi Industrial Logistics Park', state: 'Himachal Pradesh', transit: 'Direct factory manifest', cutoff: '2:00 PM' },
    { id: 'ahmedabad', name: 'Ahmedabad GIDC Depot', state: 'Gujarat', transit: 'Next-day express transit', cutoff: '6:00 PM' },
  ];

  const activeHubData = distributionHubs.find(h => h.id === selectedHub) || distributionHubs[0];

  const sampleMolecules = [
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
    const element = document.getElementById('marketplace-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMoleculeClick = (molecule: string) => {
    setGlobalSearchQuery(molecule);
    setPortalMode('distributor');
    if (onExploreCatalog) onExploreCatalog();
    const element = document.getElementById('marketplace-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#F5F8F6] via-white to-white text-[#1A1A1A] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Compliance Trust Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#E8F3F1] text-[#1A504C] font-bold text-[10px] uppercase tracking-wider">
              CDSCO Verified
            </span>
            <span className="text-[#6B7280]">
              Drugs and Cosmetics Act, 1940 & Rules 1945 Compliant
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#6B7280] text-xs">
            <span className="flex items-center gap-1 font-semibold text-[#1A504C]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Form 20B/21B Verified Network
            </span>
            <span>•</span>
            <span>100% FEFO Batch Allocation</span>
          </div>
        </div>

        {/* Main Content Grid: Left Role Fork & Search + Right Active Trade Manifest */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-6">
          {/* Left Column: Headline & Role Fork */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1A1A1A] leading-[1.15]">
                Order directly from manufacturers you're licensed to trade with
              </h1>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-xl">
                India's regulated B2B pharmaceutical marketplace. Transparent manufacturer PTR rates, batch-level FEFO auto-allocation, configurable order quantities, and certified cold-chain logistics.
              </p>
            </div>

            {/* Clear Role-First Fork: Manufacturer vs. Distributor Choice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Panel 1: Manufacturer */}
              <button
                type="button"
                onClick={() => {
                  setPortalMode('manufacturer');
                  switchPredefinedUser('usr-acme-admin-01');
                  const element = document.getElementById('marketplace-content');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`group relative text-left rounded-2xl p-5 border transition-all cursor-pointer overflow-hidden ${
                  portalMode === 'manufacturer'
                    ? 'bg-white border-[#1A504C] ring-2 ring-[#1A504C]/20 shadow-md'
                    : 'bg-white border-gray-200 hover:border-[#1A504C]/50 hover:shadow-sm'
                }`}
              >
                {/* Thin left color bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1A504C]" />

                <div className="pl-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#1A504C] font-bold uppercase tracking-wider">
                      Manufacturing Principal
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F3F1] text-[#1A504C]">
                      Form 25 / 28
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 stroke-[2]" />
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A1A] group-hover:text-[#1A504C] transition-colors">
                      I manufacture medicine
                    </h2>
                  </div>

                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    List your formulations, set trade rules, manage your distributor network
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#1A504C]">
                    <span>Open Manufacturer Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </button>

              {/* Panel 2: Distributor */}
              <button
                type="button"
                onClick={() => {
                  setPortalMode('distributor');
                  if (onExploreCatalog) onExploreCatalog();
                  const element = document.getElementById('marketplace-content');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`group relative text-left rounded-2xl p-5 border transition-all cursor-pointer overflow-hidden ${
                  portalMode === 'distributor'
                    ? 'bg-white border-[#1A504C] ring-2 ring-[#1A504C]/20 shadow-md'
                    : 'bg-white border-gray-200 hover:border-[#1A504C]/50 hover:shadow-sm'
                }`}
              >
                {/* Thin left color bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1A504C]" />

                <div className="pl-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#1A504C] font-bold uppercase tracking-wider">
                      Wholesale Stockist
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F3F1] text-[#1A504C]">
                      Form 20B / 21B
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4 stroke-[2]" />
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A1A] group-hover:text-[#1A504C] transition-colors">
                      I distribute medicine
                    </h2>
                  </div>

                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Order from manufacturers you're licensed to trade with, track batches and dispatch
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#1A504C]">
                    <span>Explore Wholesale Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Formulation Search Input */}
            <div className="space-y-2 pt-1">
              <form onSubmit={handleSearchSubmit} className="flex items-stretch rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xs focus-within:border-[#1A504C] focus-within:ring-2 focus-within:ring-[#1A504C]/15 transition-all">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    placeholder="Search formulations by brand, molecule (e.g. Paracetamol), or principal..."
                    className="w-full bg-transparent pl-10 pr-3 py-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#6B7280] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#1A504C] hover:bg-[#143F3C] text-white font-bold text-xs transition-colors shrink-0"
                >
                  Search Catalog
                </button>
              </form>

              {/* Sample molecules quick tags */}
              <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs text-[#6B7280]">
                <span className="font-semibold text-gray-400">Popular:</span>
                {sampleMolecules.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMoleculeClick(m)}
                    className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-[#E8F3F1] hover:text-[#1A504C] transition-colors whitespace-nowrap text-[11px] font-medium"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Section KPI Metrics: Clean Light Retail Trust Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-gray-200">
              <div className="p-3 rounded-xl bg-[#F5F8F6] border border-gray-100">
                <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
                  {tenants.length}
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  GMP Principals
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F8F6] border border-gray-100">
                <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
                  {totalSKUs}+
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  Active SKUs
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F8F6] border border-gray-100">
                <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
                  {distributors.length}
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  Licensed Stockists
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#E8F3F1] border border-teal-100">
                <div className="text-xl sm:text-2xl font-extrabold text-[#1A504C] tabular-nums">
                  100%
                </div>
                <div className="text-xs text-[#1A504C] mt-0.5 font-medium">
                  FEFO Traceability
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean White Active Trade Manifest Card & Hubs */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Active Trade Manifest Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs relative overflow-hidden space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Active Trade Relationship
                  </span>
                  <div className="text-lg font-bold text-[#1A1A1A] mt-0.5">
                    {currentTenant.name}
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-[#E8F3F1] text-[#1A504C] text-[10px] font-bold border border-[#1A504C]/20">
                  Form 20B/21B Verified
                </div>
              </div>

              {/* Manifest Specifications */}
              <div className="border-t border-b border-gray-100 py-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Manufacturer Licence:</span>
                  <span className="text-[#1A1A1A] font-bold">{currentTenant.drugLicenseNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Authorized Buyer:</span>
                  <span className="text-[#1A504C] font-bold">{currentDistributor.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Buyer Form 20B:</span>
                  <span className="text-[#1A1A1A]">{currentDistributor.licenses?.form20B || currentDistributor.gstin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Statutory Compliance:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Schedule H/H1 Authorized</span>
                </div>
              </div>

              {/* Switch Manufacturer Principal Quick Buttons */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-[#6B7280] block">
                  Select Manufacturing Principal:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {tenants.map((t) => {
                    const isSelected = t.id === activeTenantId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTenantId(t.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#E8F3F1] border-[#1A504C] text-[#1A504C] font-bold shadow-2xs'
                            : 'bg-gray-50 border-gray-200 text-[#1A1A1A] hover:bg-white'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="text-xs font-bold truncate">{t.shortName}</div>
                          <div className="text-[10px] text-[#6B7280] truncate">{t.drugLicenseNumber}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1A504C] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Regional Fulfillment Depots Selector */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#1A504C]" />
                  <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                    Regional Fulfillment Depots
                  </h3>
                </div>
                <span className="text-[11px] text-[#1A504C] font-bold">
                  {activeHubData.cutoff} Cutoff
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {distributionHubs.map((hub) => {
                  const isSelected = hub.id === selectedHub;
                  return (
                    <button
                      key={hub.id}
                      onClick={() => setSelectedHub(hub.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#E8F3F1] border-[#1A504C] text-[#1A504C] font-bold'
                          : 'bg-gray-50 border-gray-200 text-[#1A1A1A] hover:bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{hub.name.split(' ')[0]} Hub</div>
                      <div className="text-[10px] text-[#6B7280]">{hub.state}</div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-xl bg-[#F5F8F6] border border-gray-100 flex items-center justify-between text-xs text-[#6B7280]">
                <span>Status: <strong className="text-[#1A1A1A]">{activeHubData.transit}</strong></span>
                <span className="font-semibold text-[#1A504C]">Tamper-Proof FEFO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
