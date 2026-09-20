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
  FileText, 
  ShieldCheck, 
  AlertCircle 
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
  };

  const handleMoleculeClick = (molecule: string) => {
    setHeroSearch(molecule);
    setPortalMode('distributor');
    if (onExploreCatalog) onExploreCatalog();
  };

  return (
    <section className="bg-[#1F2E28] text-[#F6F3EC] border-b border-[#2C3E36]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Working Register Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#2C3E36]/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#8A8578] uppercase text-[10px] tracking-wider">
              Statutory register:
            </span>
            <span className="font-mono text-[#C9A961] font-semibold">
              Drugs and Cosmetics Act, 1940 (Rules 1945)
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-[#8A8578]">
            <span>Form 20B wholesale licence required</span>
            <span>•</span>
            <span>Batch-level FEFO reservation</span>
          </div>
        </div>

        {/* Main Content Grid: Left Working Tool + Right Manifest & Hub Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-8">
          {/* Left Column: Purpose & Search Register */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F6F3EC] leading-[1.15]">
                Order directly from manufacturers you're licensed to trade with
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#8A8578] leading-relaxed max-w-xl font-normal">
                B2B pharmaceutical trade register. Transparent wholesale net rates, batch-level FEFO auto-allocation, configurable minimum order quantities, and certified reverse waste logistics.
              </p>
            </div>

            {/* Plain working register search */}
            <div className="space-y-2 pt-1">
              <form onSubmit={handleSearchSubmit} className="flex items-stretch rounded-lg overflow-hidden border border-[#2C3E36] bg-[#16221E] focus-within:border-[#3D6B52]">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-[#8A8578] absolute left-3.5" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search register by generic molecule, brand name, or principal..."
                    className="w-full bg-transparent pl-10 pr-3 py-3 text-xs sm:text-sm text-[#F6F3EC] placeholder-[#8A8578] outline-none font-sans"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#3D6B52] hover:bg-[#4E8568] text-[#F6F3EC] font-sans font-semibold text-xs transition-colors shrink-0"
                >
                  Search register
                </button>
              </form>

              {/* Sample molecules for scanability */}
              <div className="flex items-center gap-2 pt-1 overflow-x-auto text-[11px] font-mono text-[#8A8578]">
                <span className="text-[#8A8578]">Reference molecules:</span>
                {sampleMolecules.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMoleculeClick(m)}
                    className="hover:text-[#F6F3EC] underline underline-offset-2 decoration-[#2C3E36] hover:decoration-[#3D6B52] transition-colors whitespace-nowrap"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Explicit Labels, NO arrow glyphs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setPortalMode('distributor');
                  if (onExploreCatalog) onExploreCatalog();
                }}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs sm:text-sm font-sans font-semibold transition-colors ${
                  portalMode === 'distributor'
                    ? 'bg-[#3D6B52] hover:bg-[#4E8568] text-[#F6F3EC]'
                    : 'bg-[#3D6B52] hover:bg-[#4E8568] text-[#F6F3EC]'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Explore medicine register</span>
              </button>

              <button
                onClick={() => {
                  setPortalMode('manufacturer');
                  switchPredefinedUser('usr-acme-admin-01');
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs sm:text-sm font-sans font-semibold border border-[#2C3E36] bg-[#16221E] hover:border-[#3D6B52] text-[#F6F3EC] transition-colors"
              >
                <Building2 className="w-4 h-4 text-[#C9A961]" />
                <span>Manufacturer operations</span>
              </button>
            </div>

            {/* Section 3 KPI Numbers: Serif Numerals, Caps-Free Sentence Case, NO Icon-in-Circle */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#2C3E36]">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#F6F3EC] tabular-nums">
                  {tenants.length}
                </div>
                <div className="font-sans text-xs text-[#8A8578] mt-0.5">
                  GMP manufacturing tenants
                </div>
              </div>

              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#F6F3EC] tabular-nums">
                  {totalSKUs}
                </div>
                <div className="font-sans text-xs text-[#8A8578] mt-0.5">
                  Registered formulations
                </div>
              </div>

              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#F6F3EC] tabular-nums">
                  {distributors.length}
                </div>
                <div className="font-sans text-xs text-[#8A8578] mt-0.5">
                  Authorized wholesale stockists
                </div>
              </div>

              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3D6B52] tabular-nums">
                  100%
                </div>
                <div className="font-sans text-xs text-[#8A8578] mt-0.5">
                  FEFO batch reservation
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ledger-Style Hub Selector & Stamped Manifest Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Stamped Trade Manifest Card */}
            <div className="bg-[#16221E] rounded-lg border border-[#2C3E36] p-4 sm:p-5 relative overflow-hidden space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] text-[#8A8578] uppercase tracking-wider block">
                    Active trade manifest
                  </span>
                  <div className="font-serif text-base font-bold text-[#F6F3EC] mt-0.5">
                    {currentTenant.name}
                  </div>
                </div>

                {/* Authentic Stamped Seal (Rotated 2-4 deg, aged-brass gold) */}
                <div className="stamp-seal">
                  <span>Form 20B/21B Verified</span>
                </div>
              </div>

              {/* Manifest Specifications Table */}
              <div className="border-t border-b border-[#2C3E36] py-2.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8A8578]">Manufacturer licence:</span>
                  <span className="text-[#F6F3EC] font-semibold">{currentTenant.drugLicenseNumber}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8A8578]">Authorized buyer:</span>
                  <span className="text-[#3D6B52] font-semibold">{currentDistributor.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8A8578]">Buyer Form 20B:</span>
                  <span className="text-[#F6F3EC]">{currentDistributor.licenses?.form20B || currentDistributor.gstin}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8A8578]">Statutory status:</span>
                  <span className="text-[#C9A961] font-semibold">Approved for Schedule H/H1</span>
                </div>
              </div>

              {/* Principal Selection Rows */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-[#8A8578] block">
                  Select manufacturing principal:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {tenants.map((t) => {
                    const isSelected = t.id === activeTenantId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTenantId(t.id)}
                        className={`p-2 rounded text-left border text-xs transition-colors ${
                          isSelected
                            ? 'bg-[#1F2E28] border-[#C9A961] text-[#F6F3EC]'
                            : 'bg-[#16221E] border-[#2C3E36] text-[#8A8578] hover:border-[#4E8568]'
                        }`}
                      >
                        <div className="font-serif font-semibold truncate text-[#F6F3EC]">{t.shortName}</div>
                        <div className="font-mono text-[10px] text-[#8A8578] truncate">{t.drugLicenseNumber}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Ledger-Style Hub Selector (Rows, NOT tiles) */}
            <div className="bg-[#16221E] rounded-lg border border-[#2C3E36] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#8A8578] uppercase tracking-wider">
                  Regional fulfillment depots
                </span>
                <span className="font-mono text-[11px] text-[#C9A961]">
                  Cutoff: {activeHubData.cutoff}
                </span>
              </div>

              {/* Rows with dotted leaders */}
              <div className="divide-y divide-[#2C3E36] text-xs">
                {distributionHubs.map((hub) => {
                  const isSelected = hub.id === selectedHub;
                  return (
                    <div
                      key={hub.id}
                      onClick={() => setSelectedHub(hub.id)}
                      className={`py-2.5 px-2 flex items-center justify-between cursor-pointer rounded transition-colors ${
                        isSelected ? 'bg-[#1F2E28] text-[#F6F3EC]' : 'text-[#8A8578] hover:text-[#F6F3EC]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#3D6B52]' : 'bg-[#2C3E36]'}`} />
                        <span className={`font-serif text-xs truncate ${isSelected ? 'text-[#F6F3EC] font-bold' : 'text-[#8A8578]'}`}>
                          {hub.name}
                        </span>
                      </div>

                      {/* Dotted Leader Line */}
                      <div className="flex-1 mx-2 border-b border-dotted border-[#2C3E36] hidden sm:block" />

                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className={isSelected ? 'text-[#3D6B52] font-semibold' : 'text-[#8A8578]'}>
                          {hub.transit}
                        </span>
                        <span className="text-[#8A8578]">›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
