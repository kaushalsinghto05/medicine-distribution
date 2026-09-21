import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MapPin, Search, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';

const REGIONAL_DEPOTS = [
  { id: 'bhiwandi', name: 'Prayagraj – Central Depot (UP)', cutoff: '04:00 PM', transit: 'Same-Day 4h' },
  { id: 'kanpur', name: 'Kanpur Industrial Depot (UP)', cutoff: '06:00 PM', transit: 'Next-Morning' },
  { id: 'lucknow', name: 'Lucknow Capital Hub (UP)', cutoff: '05:30 PM', transit: 'Same-Day Express' },
  { id: 'varanasi', name: 'Varanasi Regional Depot (UP)', cutoff: '03:30 PM', transit: 'Next-Day Transit' },
];

const SUGGESTED_MOLECULES = [
  'Paracetamol 650mg',
  'Amoxyclav 625mg',
  'Azithromycin 500mg',
  'Pantoprazole 40mg',
  'Ceftriaxone 1g Inj',
];

interface HeroOmnibarProps {
  onSearchSubmit?: () => void;
}

export const HeroOmnibar: React.FC<HeroOmnibarProps> = ({ onSearchSubmit }) => {
  const { 
    globalSearchQuery, 
    setGlobalSearchQuery, 
    setPortalMode,
    addToast 
  } = useStore();

  const [selectedDepot, setSelectedDepot] = useState(REGIONAL_DEPOTS[0].id);
  const [discountBasis, setDiscountBasis] = useState<'PTR' | 'MRP'>('PTR');

  const activeDepot = REGIONAL_DEPOTS.find(d => d.id === selectedDepot) || REGIONAL_DEPOTS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPortalMode('distributor');
    if (onSearchSubmit) onSearchSubmit();
    const el = document.getElementById('marketplace-content');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMoleculeClick = (molecule: string) => {
    setGlobalSearchQuery(molecule);
    setPortalMode('distributor');
    if (onSearchSubmit) onSearchSubmit();
    const el = document.getElementById('marketplace-content');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-2.5">
      {/* Main Floating Omnibar Pill */}
      <div className="bg-white rounded-2xl sm:rounded-full border border-gray-200/90 shadow-xl p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center gap-2 transition-all focus-within:border-[#1A504C] focus-within:ring-4 focus-within:ring-[#1A504C]/10">
        {/* Left: Location & Serving Area Dropdown */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-full bg-[#F5F8F6] border border-gray-200/80 text-xs shrink-0">
          <MapPin className="w-4 h-4 text-[#1A504C] shrink-0" />
          <div className="flex items-center gap-1">
            <select
              value={selectedDepot}
              onChange={(e) => {
                setSelectedDepot(e.target.value);
                const depot = REGIONAL_DEPOTS.find(d => d.id === e.target.value);
                if (depot) {
                  addToast('info', 'Serving Area Updated', `Fulfillment routed to ${depot.name}.`);
                }
              }}
              className="bg-transparent font-bold text-[#1A1A1A] text-xs focus:outline-none cursor-pointer pr-1"
            >
              {REGIONAL_DEPOTS.map((depot) => (
                <option key={depot.id} value={depot.id}>
                  {depot.name}
                </option>
              ))}
            </select>
          </div>
          <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Center: Search Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center px-2">
          <Search className="w-4 h-4 text-[#6B7280] mr-2.5 shrink-0" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search medicines, brands, molecules or composition..."
            className="w-full bg-transparent text-xs sm:text-sm text-[#1A1A1A] placeholder-[#6B7280] focus:outline-none"
          />
        </form>

        {/* Right: Submit Arrow & PTR/MRP Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2 px-1 sm:px-2 pt-1 sm:pt-0">
          {/* PTR | MRP Toggle Pills */}
          <div className="inline-flex rounded-lg sm:rounded-full p-0.5 bg-[#F5F8F6] border border-gray-200">
            <button
              type="button"
              onClick={() => setDiscountBasis('PTR')}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md sm:rounded-full transition-all ${
                discountBasis === 'PTR'
                  ? 'bg-[#1A504C] text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              PTR
            </button>
            <button
              type="button"
              onClick={() => setDiscountBasis('MRP')}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md sm:rounded-full transition-all ${
                discountBasis === 'MRP'
                  ? 'bg-[#1A504C] text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              MRP
            </button>
          </div>

          {/* Circle Action Arrow Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-10 h-10 rounded-full bg-[#1A504C] hover:bg-[#143F3C] text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all"
            title="Search Catalog"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Suggested Molecules Quick Tags & Live Dispatch Cutoff */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[#6B7280]">
          <span className="font-semibold text-gray-400 shrink-0">Popular:</span>
          {SUGGESTED_MOLECULES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleMoleculeClick(m)}
              className="px-2.5 py-0.5 rounded-full bg-white border border-gray-200/70 hover:border-[#1A504C] hover:bg-[#E8F3F1] hover:text-[#1A504C] transition-colors whitespace-nowrap text-[11px] font-medium text-[#1A1A1A] shadow-2xs"
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] shrink-0 self-end sm:self-auto">
          <span>Cutoff: <strong className="text-[#1A1A1A]">{activeDepot.cutoff} Today</strong></span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">{activeDepot.transit}</span>
        </div>
      </div>
    </div>
  );
};
