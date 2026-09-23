import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { BrowseMedicinesScreen } from './BrowseMedicinesScreen';
import { 
  ArrowLeft, 
  Store, 
  Plus, 
  Truck, 
  ShieldCheck, 
  Snowflake, 
  Award, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const { navigateToPage, currentDistributor, setIsAddMedicineModalOpen } = useStore();

  return (
    <div className="relative min-h-screen bg-medical-mesh overflow-hidden">
      {/* Background Feature Orbs & Floating Glows */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-gradient-to-br from-[#4BE1E4]/12 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-[#1A504C]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating Ambient Pharmaceutical Micro-Badges */}
      <div className="hidden xl:block absolute top-28 right-8 z-0 pointer-events-none animate-float-subtle opacity-70">
        <div className="px-3 py-1.5 rounded-full bg-white/90 border border-emerald-200 text-emerald-800 text-[11px] font-black shadow-sm flex items-center gap-1.5 backdrop-blur-xs">
          <span>💊</span>
          <span>100% Verified Fresh Batches</span>
        </div>
      </div>
      <div className="hidden xl:block absolute top-72 left-6 z-0 pointer-events-none animate-float-subtle opacity-70" style={{ animationDelay: '2s' }}>
        <div className="px-3 py-1.5 rounded-full bg-white/90 border border-blue-200 text-blue-800 text-[11px] font-black shadow-sm flex items-center gap-1.5 backdrop-blur-xs">
          <Snowflake className="w-3.5 h-3.5 text-blue-600" />
          <span>Cold-Chain 2°C–8°C Monitored</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Top Breadcrumb & Return to Home Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-gray-200 shadow-sm">
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
              <div className="w-7 h-7 rounded-lg bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-heading font-black text-sm sm:text-base text-[#1A1A1A] tracking-tight">
                  B2B Wholesale Medicine Marketplace
                </h1>
                <p className="text-[10px] text-[#6B7280] font-medium hidden sm:block">
                  Live verified catalog with real pack photos and manufacturer pricing
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

            <span className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E8F3F1] text-[#1A504C] font-extrabold text-xs border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentDistributor.name}</span>
            </span>
          </div>
        </div>

        {/* Friendly 3-Step Buying Guide Banner (Makes it so simple for anyone to understand) */}
        <div className="bg-gradient-to-r from-white via-teal-50/40 to-white rounded-3xl p-4 sm:p-5 border border-teal-100 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-teal-100">
            {/* Step 1 */}
            <div className="flex items-start gap-3 pt-2 md:pt-0">
              <div className="w-8 h-8 rounded-full bg-[#1A504C] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                1
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-[#1A1A1A]">Pick Medicine & Check Picture</h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Clear photos, dosage indications, and direct manufacturer PTR rates with up to 35% savings.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 pt-3 md:pt-0 md:pl-4">
              <div className="w-8 h-8 rounded-full bg-[#1A504C] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                2
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-[#1A1A1A]">Instant Sign-In or Guest Preview</h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Form 20B/21B CDSCO verified network or 1-click test personas for instant evaluation.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 pt-3 md:pt-0 md:pl-4">
              <div className="w-8 h-8 rounded-full bg-[#1A504C] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                3
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-[#1A1A1A]">4-Hour Express Dispatch</h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Auto-allocated freshest FEFO batches delivered directly to your pharmacy shelf.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Marketplace Catalog Grid */}
        <BrowseMedicinesScreen />
      </div>
    </div>
  );
};
