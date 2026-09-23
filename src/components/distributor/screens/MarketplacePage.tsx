import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { BrowseMedicinesScreen } from './BrowseMedicinesScreen';
import { 
  ArrowLeft, 
  Store, 
  Plus, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const { navigateToPage, currentDistributor, setIsAddMedicineModalOpen } = useStore();

  return (
    <div className="min-h-screen bg-medical-mesh pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Breadcrumb & Return to Home Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateToPage('home')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5F8F6] hover:bg-[#E8F3F1] text-[#1A504C] font-black text-xs transition-colors border border-gray-200 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <span className="text-gray-300">/</span>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-heading font-black text-sm sm:text-base text-[#1A1A1A] tracking-tight">
                  B2B Wholesale Medicine Marketplace
                </h1>
                <p className="text-[11px] text-[#6B7280] font-medium hidden sm:block">
                  Verified formulations with real packaging photos & direct manufacturer PTR rates
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => setIsAddMedicineModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Medicine & Picture</span>
            </button>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F3F1] text-[#1A504C] font-extrabold text-xs border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentDistributor.name}</span>
            </span>
          </div>
        </div>

        {/* Compact 3-Step Trust Strip (Clear & simple, no clutter) */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-teal-100 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#1A504C] text-white flex items-center justify-center font-black text-[11px] shrink-0">
                1
              </div>
              <span className="text-[#1A1A1A] font-bold">Pick Medicine & Check Pack Photo</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#1A504C] text-white flex items-center justify-center font-black text-[11px] shrink-0">
                2
              </div>
              <span className="text-[#1A1A1A] font-bold">Instant Sign-In or Guest Preview</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#1A504C] text-white flex items-center justify-center font-black text-[11px] shrink-0">
                3
              </div>
              <span className="text-[#1A1A1A] font-bold">4-Hour Express Medical Dispatch</span>
            </div>
          </div>
        </div>

        {/* Main Marketplace Catalog Grid */}
        <BrowseMedicinesScreen />
      </div>
    </div>
  );
};
