import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Search, 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  Play, 
  Pause, 
  Layers, 
  Pill, 
  Package, 
  ShieldCheck, 
  ThermometerSnowflake,
  Activity,
  Maximize2
} from 'lucide-react';

interface PharmacyPavilion3DProps {
  onOpenSearch?: () => void;
  onOpenCart?: () => void;
  onExploreCatalog?: () => void;
}

export const PharmacyPavilion3D: React.FC<PharmacyPavilion3DProps> = ({
  onOpenSearch,
  onOpenCart,
  onExploreCatalog,
}) => {
  const { cart, medicines, currentDistributor } = useStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeScreen, setActiveScreen] = useState<'search' | 'tray' | 'order'>('search');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16; // -8 to +8 deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12; // -6 to +6 deg
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#F0F5F3] via-[#E8F1EE] to-[#DCECE7] border border-[#CBDED8] shadow-lg perspective-1500 group select-none min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-between p-4 sm:p-6"
    >
      {/* 3D Scene Root Container */}
      <div 
        className={`w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out preserve-3d ${
          isPlaying ? 'animate-float-subtle' : ''
        }`}
        style={{
          transform: `rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
        }}
      >
        {/* Soft Architecture Floor Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1A504C08_1px,transparent_1px),linear-gradient(to_bottom,#1A504C08_1px,transparent_1px)] bg-[size:32px_32px] opacity-70 pointer-events-none" />

        {/* Ambient Top Light Spot */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-gradient-to-b from-white/70 to-transparent blur-2xl pointer-events-none" />

        {/* Back Wall with Modern Pharmacy Shelves & Brand Plate */}
        <div className="absolute top-8 sm:top-12 w-[92%] sm:w-[86%] max-w-4xl bg-white/75 backdrop-blur-sm rounded-2xl border border-white/80 p-4 sm:p-6 shadow-sm">
          {/* Brand Plate Above Shelves */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200/70">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#1A504C] text-white flex items-center justify-center text-xs font-black">
                Rx
              </div>
              <span className="font-heading font-extrabold text-xs sm:text-sm tracking-wider uppercase text-[#1A504C]">
                PharmXpress Wholesale Ledger
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Factory Supply Node</span>
            </div>
          </div>

          {/* Shelves Grid with Medicine Bottles & Cartons */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3 pt-3">
            {[
              { code: 'PC', name: 'Paracetamol', type: 'TAB', color: 'border-blue-300 bg-blue-50/80 text-blue-700' },
              { code: 'AZ', name: 'Azithromycin', type: 'TAB', color: 'border-purple-300 bg-purple-50/80 text-purple-700' },
              { code: 'AM', name: 'Amoxyclav', type: 'TAB', color: 'border-emerald-300 bg-emerald-50/80 text-emerald-700' },
              { code: 'PT', name: 'Pantoprazole', type: 'CAP', color: 'border-amber-300 bg-amber-50/80 text-amber-700' },
              { code: 'CF', name: 'Ceftriaxone', type: 'VIAL', color: 'border-rose-300 bg-rose-50/80 text-rose-700' },
              { code: 'MD', name: 'Metformin', type: 'TAB', color: 'border-cyan-300 bg-cyan-50/80 text-cyan-700' },
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`rounded-xl border p-2 sm:p-2.5 flex flex-col items-center justify-between h-20 sm:h-24 ${item.color} shadow-2xs hover:scale-105 transition-transform cursor-pointer group/item`}
                onClick={() => {
                  if (onExploreCatalog) onExploreCatalog();
                }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/90 shadow-2xs flex items-center justify-center font-extrabold text-[11px] sm:text-xs">
                  {item.code}
                </div>
                <div className="text-center w-full">
                  <div className="text-[9px] sm:text-[10px] font-bold truncate max-w-full">
                    {item.name}
                  </div>
                  <div className="text-[8px] uppercase tracking-wider opacity-70">
                    {item.type} • 100% FEFO
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Pharmacy Trade Counter (Biddano Sage Green Counter with Wood Top) */}
        <div className="absolute bottom-6 sm:bottom-10 w-[94%] sm:w-[90%] max-w-4xl z-20">
          {/* Natural Warm Wood Counter Top */}
          <div className="w-full h-4 sm:h-5 bg-gradient-to-r from-[#D7A87E] via-[#E8C29E] to-[#C9996F] rounded-t-xl shadow-md border-t border-[#F2D7BF]" />

          {/* Front Emerald / Deep Teal Counter Front */}
          <div className="w-full bg-[#1A504C] rounded-b-2xl border-x border-b border-[#143F3C] p-3 sm:p-5 shadow-2xl relative">
            {/* Front Architectural Paneling Details */}
            <div className="absolute inset-x-4 top-2 bottom-2 border border-white/10 rounded-xl pointer-events-none" />

            {/* Three Interactive Digital Terminals on Counter */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 relative z-10">
              {/* Terminal 1: SEARCH */}
              <button
                type="button"
                onClick={() => {
                  setActiveScreen('search');
                  if (onOpenSearch) onOpenSearch();
                }}
                className={`text-left rounded-xl p-2.5 sm:p-3 transition-all border ${
                  activeScreen === 'search'
                    ? 'bg-white text-[#1A1A1A] border-white shadow-lg scale-102 ring-2 ring-emerald-400'
                    : 'bg-[#143F3C]/90 text-white/90 border-white/15 hover:bg-[#143F3C] hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${
                    activeScreen === 'search' ? 'text-[#1A504C]' : 'text-emerald-300'
                  }`}>
                    1. SEARCH
                  </span>
                  <Search className="w-3.5 h-3.5" />
                </div>
                <div className="font-heading font-extrabold text-xs sm:text-sm truncate">
                  Explore Formulations
                </div>
                <p className={`text-[9px] sm:text-[10px] truncate mt-0.5 ${
                  activeScreen === 'search' ? 'text-[#6B7280]' : 'text-white/70'
                }`}>
                  {medicines.length} verified molecules
                </p>
              </button>

              {/* Terminal 2: YOUR TRAY */}
              <button
                type="button"
                onClick={() => {
                  setActiveScreen('tray');
                  if (onOpenCart) onOpenCart();
                }}
                className={`text-left rounded-xl p-2.5 sm:p-3 transition-all border ${
                  activeScreen === 'tray'
                    ? 'bg-white text-[#1A1A1A] border-white shadow-lg scale-102 ring-2 ring-emerald-400'
                    : 'bg-[#143F3C]/90 text-white/90 border-white/15 hover:bg-[#143F3C] hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${
                    activeScreen === 'tray' ? 'text-[#1A504C]' : 'text-emerald-300'
                  }`}>
                    2. YOUR TRAY
                  </span>
                  <div className="relative">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full bg-[#EA580C] text-white text-[8px] font-extrabold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-heading font-extrabold text-xs sm:text-sm truncate">
                  Wholesale Cart
                </div>
                <p className={`text-[9px] sm:text-[10px] truncate mt-0.5 ${
                  activeScreen === 'tray' ? 'text-[#6B7280]' : 'text-white/70'
                }`}>
                  {cartCount} items in order tray
                </p>
              </button>

              {/* Terminal 3: PLACE ORDER */}
              <button
                type="button"
                onClick={() => {
                  setActiveScreen('order');
                  if (onExploreCatalog) onExploreCatalog();
                }}
                className={`text-left rounded-xl p-2.5 sm:p-3 transition-all border ${
                  activeScreen === 'order'
                    ? 'bg-white text-[#1A1A1A] border-white shadow-lg scale-102 ring-2 ring-emerald-400'
                    : 'bg-[#143F3C]/90 text-white/90 border-white/15 hover:bg-[#143F3C] hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${
                    activeScreen === 'order' ? 'text-[#1A504C]' : 'text-emerald-300'
                  }`}>
                    3. PLACE ORDER
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="font-heading font-extrabold text-xs sm:text-sm truncate">
                  Direct Dispatch
                </div>
                <p className={`text-[9px] sm:text-[10px] truncate mt-0.5 ${
                  activeScreen === 'order' ? 'text-[#6B7280]' : 'text-white/70'
                }`}>
                  Same-day 4-hour cutoff
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Botanical Touch: Flanking Potted Plants */}
        <div className="hidden md:flex absolute bottom-12 left-4 items-end gap-1 pointer-events-none opacity-85">
          <div className="w-10 h-16 rounded-t-full bg-gradient-to-t from-emerald-800 to-emerald-600 shadow-sm" />
          <div className="w-6 h-10 rounded-t-full bg-emerald-700 shadow-sm -ml-2" />
          <div className="w-8 h-8 rounded-b-lg bg-[#C17A54] border border-[#965532] shadow-md -ml-3" />
        </div>

        <div className="hidden md:flex absolute bottom-12 right-4 items-end gap-1 pointer-events-none opacity-85">
          <div className="w-8 h-8 rounded-b-lg bg-[#C17A54] border border-[#965532] shadow-md -mr-3" />
          <div className="w-6 h-12 rounded-t-full bg-emerald-700 shadow-sm" />
          <div className="w-10 h-18 rounded-t-full bg-gradient-to-t from-emerald-800 to-emerald-600 shadow-sm -ml-2" />
        </div>
      </div>

      {/* Top Floating Pill: "+ Explore the pavilion ↗" (Biddano Pattern) */}
      <div className="relative z-30 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 text-[#1A1A1A] shadow-xs text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#1A504C]" />
          <span>Interactive Trade Counter</span>
        </div>

        <button
          type="button"
          onClick={onExploreCatalog}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-[#1A504C] hover:text-[#143F3C] border border-gray-200/80 shadow-sm hover:shadow transition-all text-xs font-extrabold group/btn active:scale-95"
        >
          <span>+ Explore the pavilion</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </button>
      </div>

      {/* Bottom Subtext & Ambient Play/Pause Controls */}
      <div className="relative z-30 flex items-center justify-between pt-4 text-xs text-[#6B7280]">
        <div className="font-semibold text-[11px] text-[#1A504C] bg-white/80 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/80">
          Factory to pharmacy. Seamlessly.
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-full bg-white/90 hover:bg-white border border-gray-200 text-[#1A1A1A] flex items-center justify-center shadow-2xs transition-colors"
            title={isPlaying ? 'Pause ambient motion' : 'Resume ambient motion'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
          </button>

          <span className="hidden sm:inline text-[11px] font-medium text-[#6B7280]">
            3D Ambient View
          </span>
        </div>
      </div>
    </div>
  );
};
