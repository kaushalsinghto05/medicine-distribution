import React from 'react';
import { useStore } from '../../context/StoreContext';
import { PackageCheck, ShieldCheck, Building2, Headphones, FileCheck } from 'lucide-react';

interface TrustAndCredibilityBarProps {
  variant?: 'distributor' | 'manufacturer';
}

export const TrustAndCredibilityBar: React.FC<TrustAndCredibilityBarProps> = ({ variant = 'distributor' }) => {
  const { 
    distributorMedicines, 
    distributorAuthorizedTenants, 
    tenantMedicines, 
    tenantDistributors 
  } = useStore();

  const isMfg = variant === 'manufacturer';

  // Metrics based on variant context
  const skusCount = isMfg ? tenantMedicines.length : distributorMedicines.length;
  const partnersCount = isMfg ? tenantDistributors.length : distributorAuthorizedTenants.length;
  const partnersLabel = isMfg 
    ? (partnersCount === 1 ? 'Active distributor' : 'Active distributors')
    : (partnersCount === 1 ? 'Authorized principal' : 'Authorized principals');

  return (
    <div className="w-full bg-[#FCFBF8] border border-[#E2DDD2] rounded-xl p-3 sm:p-4 shadow-2xs">
      {/* 4 Manifest Metric Cells: Desktop 4-col row with subtle dividers, Mobile 2x2 grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-0 md:divide-x md:divide-[#E5E0D5]">
        {/* Cell 1: Active Formulations */}
        <div className="flex items-center gap-3 px-2 sm:px-4">
          <PackageCheck className="w-5 h-5 text-[#3D6B52] shrink-0 stroke-[1.75]" />
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-serif font-bold text-[#1F2E28] tracking-tight leading-none">
              {skusCount}+
            </div>
            <div className="text-[11px] text-[#8A8578] font-sans truncate mt-1">
              Active formulations
            </div>
          </div>
        </div>

        {/* Cell 2: Order Accuracy / Fulfilment Rate */}
        <div className="flex items-center gap-3 px-2 sm:px-4">
          <ShieldCheck className="w-5 h-5 text-[#3D6B52] shrink-0 stroke-[1.75]" />
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-mono font-bold text-[#1F2E28] tracking-tight leading-none">
              99.5%
            </div>
            <div className="text-[11px] text-[#8A8578] font-sans truncate mt-1">
              Order accuracy rate
            </div>
          </div>
        </div>

        {/* Cell 3: Authorized Partners */}
        <div className="flex items-center gap-3 px-2 sm:px-4">
          <Building2 className="w-5 h-5 text-[#3D6B52] shrink-0 stroke-[1.75]" />
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-serif font-bold text-[#1F2E28] tracking-tight leading-none">
              {partnersCount}
            </div>
            <div className="text-[11px] text-[#8A8578] font-sans truncate mt-1">
              {partnersLabel}
            </div>
          </div>
        </div>

        {/* Cell 4: Support & Compliance SLA */}
        <div className="flex items-center gap-3 px-2 sm:px-4">
          <Headphones className="w-5 h-5 text-[#3D6B52] shrink-0 stroke-[1.75]" />
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-mono font-bold text-[#1F2E28] tracking-tight leading-none">
              24×7
            </div>
            <div className="text-[11px] text-[#8A8578] font-sans truncate mt-1">
              Pharma desk support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
