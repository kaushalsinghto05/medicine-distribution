import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { BrowseMedicinesScreen } from './BrowseMedicinesScreen';
import { ArrowLeft, Home, ShieldCheck, MapPin, Store, Plus } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const { navigateToPage, currentDistributor, setIsAddMedicineModalOpen } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Return to Home Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateToPage('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F8F6] hover:bg-[#E8F3F1] text-[#1A504C] font-extrabold text-xs transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <span className="text-gray-300">/</span>

          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#1A504C]" />
            <h1 className="font-heading font-black text-sm sm:text-base text-[#1A1A1A] tracking-tight">
              B2B Wholesale Marketplace
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setIsAddMedicineModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white text-xs font-black shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Add Medicine & Picture</span>
          </button>

          <span className="px-2.5 py-1 rounded-full bg-[#E8F3F1] text-[#1A504C] font-extrabold text-[10px] uppercase">
            Live Wholesale Rates
          </span>
          <span className="text-[#6B7280] hidden md:inline">
            Logged in as: <strong className="text-[#1A1A1A]">{currentDistributor.name}</strong>
          </span>
        </div>
      </div>

      {/* Main Marketplace Catalog Grid */}
      <BrowseMedicinesScreen />
    </div>
  );
};
