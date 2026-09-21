import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Building2, Headphones, Award, CheckCircle2 } from 'lucide-react';

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

  const skusCount = isMfg ? tenantMedicines.length : distributorMedicines.length;
  const partnersCount = isMfg ? tenantDistributors.length : distributorAuthorizedTenants.length;
  const partnersLabel = isMfg 
    ? (partnersCount === 1 ? 'Authorized Stockist' : 'Authorized Stockists')
    : (partnersCount === 1 ? 'GMP Principal' : 'GMP Principals');

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-2xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {/* Metric 1: Verified Principals */}
        <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-4">
          <div className="w-11 h-11 rounded-2xl bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight tabular-nums">
              {partnersCount}+
            </div>
            <div className="text-xs text-[#6B7280] font-medium truncate mt-0.5">
              {partnersLabel}
            </div>
          </div>
        </div>

        {/* Metric 2: Traceability & Order Accuracy */}
        <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-4">
          <div className="w-11 h-11 rounded-2xl bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight tabular-nums">
              100%
            </div>
            <div className="text-xs text-[#6B7280] font-medium truncate mt-0.5">
              FEFO Traceability
            </div>
          </div>
        </div>

        {/* Metric 3: Active Formulations */}
        <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-4">
          <div className="w-11 h-11 rounded-2xl bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight tabular-nums">
              {skusCount}+
            </div>
            <div className="text-xs text-[#6B7280] font-medium truncate mt-0.5">
              Form 20B/21B Formulations
            </div>
          </div>
        </div>

        {/* Metric 4: Dedicated Pharma Support */}
        <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-4">
          <div className="w-11 h-11 rounded-2xl bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight tabular-nums">
              24×7
            </div>
            <div className="text-xs text-[#6B7280] font-medium truncate mt-0.5">
              Pharma Desk Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
