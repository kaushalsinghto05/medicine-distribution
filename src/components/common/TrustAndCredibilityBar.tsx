import React from 'react';
import { useStore } from '../../context/StoreContext';
import { PackageCheck, ShieldCheck, Building2, Headphones } from 'lucide-react';

interface TrustAndCredibilityBarProps {
  variant?: 'distributor' | 'manufacturer';
}

export const TrustAndCredibilityBar: React.FC<TrustAndCredibilityBarProps> = ({ variant = 'distributor' }) => {
  const { 
    distributorMedicines, 
    distributorAuthorizedTenants, 
    currentTenant, 
    tenantMedicines, 
    tenantDistributors 
  } = useStore();

  const isMfg = variant === 'manufacturer';

  // Metrics based on variant context
  const skusCount = isMfg ? tenantMedicines.length : distributorMedicines.length;
  const partnersCount = isMfg ? tenantDistributors.length : distributorAuthorizedTenants.length;
  const partnersLabel = isMfg 
    ? (partnersCount === 1 ? 'Active Distributor' : 'Active Distributors')
    : (partnersCount === 1 ? 'Authorized Principal' : 'Authorized Principals');

  return (
    <div className="w-full">
      {/* 4 Cards: Desktop row, Mobile 2x2 grid with soft-tinted backgrounds */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Active Formulations */}
        <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100/80 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:bg-sky-50">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center shrink-0">
            <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-mono leading-none">
              {skusCount}+
            </div>
            <div className="text-[11px] text-slate-600 font-medium truncate mt-1">
              Active Formulations
            </div>
          </div>
        </div>

        {/* Card 2: Order Accuracy / Fulfilment Rate */}
        <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:bg-emerald-50">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-mono leading-none">
              99.5%
            </div>
            <div className="text-[11px] text-slate-600 font-medium truncate mt-1">
              Order Accuracy Rate
            </div>
          </div>
        </div>

        {/* Card 3: Authorized Partners */}
        <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:bg-indigo-50">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/15 text-indigo-700 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-mono leading-none">
              {partnersCount}
            </div>
            <div className="text-[11px] text-slate-600 font-medium truncate mt-1">
              {partnersLabel}
            </div>
          </div>
        </div>

        {/* Card 4: Support & Compliance SLA */}
        <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100/80 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:bg-amber-50">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-mono leading-none">
              24×7
            </div>
            <div className="text-[11px] text-slate-600 font-medium truncate mt-1">
              Pharma Desk Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
