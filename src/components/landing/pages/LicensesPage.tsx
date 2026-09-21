import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Lock, 
  FileText, 
  ArrowRight,
  UploadCloud,
  Clock
} from 'lucide-react';
import { AccountScreen } from '../../distributor/screens/AccountScreen';

export const LicensesPage: React.FC = () => {
  const { navigateToPage, currentDistributor } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumbs */}
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
            <ShieldCheck className="w-4 h-4 text-[#1A504C]" />
            <h1 className="font-heading font-black text-sm sm:text-base text-[#1A1A1A] tracking-tight">
              Statutory Licenses & CDSCO Network Verification
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigateToPage('marketplace')}
          className="px-4 py-2 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          <span>Open Marketplace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Embed Complete Verified Account & Statutory License Ledger */}
      <AccountScreen />
    </div>
  );
};
