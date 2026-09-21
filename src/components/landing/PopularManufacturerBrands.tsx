import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Building2, CheckCircle2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

interface PopularManufacturerBrandsProps {
  onSelectPrincipal?: (tenantId: string) => void;
}

export const PopularManufacturerBrands: React.FC<PopularManufacturerBrandsProps> = ({
  onSelectPrincipal,
}) => {
  const { 
    tenants, 
    distributorAuthorizedTenants, 
    activeDistributorTenantFilter,
    setActiveDistributorTenantFilter,
    setPortalMode,
    addToast,
    navigateToPage
  } = useStore();

  const brandDiscounts: Record<string, { archText: string; discountText: string }> = {
    'mfg-acme': { archText: 'DIRECT FACTORY', discountText: 'UP TO 30% OFF' },
    'mfg-apex': { archText: 'VOLUME SLABS', discountText: 'UP TO 35% OFF' },
    'mfg-biopharma': { archText: '10+1 ACTIVE', discountText: 'SPECIAL SCHEMES' },
    'mfg-curis': { archText: 'COLD CHAIN', discountText: 'DIRECT PTR RATES' },
  };

  const handleBrandClick = (tenantId: string, isAuthorized: boolean, tenantName: string) => {
    if (!isAuthorized) {
      addToast(
        'warning',
        'Form 20B Verification Required',
        `Wholesale authorization for ${tenantName} is pending under Account & Licenses.`
      );
      return;
    }
    setActiveDistributorTenantFilter(tenantId);
    setPortalMode('distributor');
    navigateToPage('marketplace');
    if (onSelectPrincipal) onSelectPrincipal(tenantId);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#1A1A1A] tracking-tight">
              Popular Manufacturer Principals
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F3F1] text-[#1A504C] uppercase">
              Apollo Brands Pattern
            </span>
          </div>
          <p className="text-xs text-[#6B7280]">
            Direct GMP manufacturing units offering verified wholesale PTR tier rates
          </p>
        </div>

        <button
          onClick={() => {
            setActiveDistributorTenantFilter('all');
            const el = document.getElementById('marketplace-content');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs font-bold text-[#1A504C] hover:text-[#143F3C] flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View All Principals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Brand Cards with Bottom Curved Discount Arches (Apollo Pattern) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
        {tenants.map((t) => {
          const isAuthorized = distributorAuthorizedTenants.some(at => at.id === t.id);
          const isSelected = activeDistributorTenantFilter === t.id;
          const scheme = brandDiscounts[t.id] || { archText: 'FACTORY PTR', discountText: 'UP TO 25% OFF' };

          return (
            <div
              key={t.id}
              onClick={() => handleBrandClick(t.id, isAuthorized, t.name)}
              className={`flex flex-col items-center cursor-pointer group transition-transform duration-200 ${
                !isAuthorized ? 'opacity-70 hover:opacity-100' : 'hover:-translate-y-1'
              }`}
            >
              {/* Card Container with Curved Dark Green Arch at the Bottom */}
              <div className={`w-full h-36 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between items-center pt-5 shadow-2xs ${
                isSelected
                  ? 'bg-emerald-50 border-[#1A504C] ring-2 ring-[#1A504C]/30 shadow-md'
                  : 'bg-gradient-to-b from-[#F7FAF8] to-[#EEF5F2] border-gray-200 group-hover:border-[#1A504C]/40 group-hover:shadow-sm'
              }`}>
                {/* Brand Monogram Emblem */}
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-gray-200/80 flex items-center justify-center relative">
                  <div className={`w-3.5 h-3.5 rounded-full ${t.logoColor || 'bg-[#1A504C]'} absolute -top-1 -right-1 ring-2 ring-white`} />
                  <span className="font-heading font-black text-base text-[#1A504C]">
                    {t.shortName.slice(0, 2).toUpperCase()}
                  </span>
                </div>

                {/* Subtitle / License */}
                <div className="text-center px-2">
                  <span className="text-[10px] font-bold text-[#6B7280] block truncate">
                    {t.drugLicenseNumber}
                  </span>
                </div>

                {/* Apollo's Curved Dark Green Bottom Arch with Discount Tag */}
                <div className="w-full relative">
                  {/* Curved Arch SVG Background */}
                  <div className={`w-full pt-3 pb-2 text-center transition-colors ${
                    isAuthorized ? 'bg-[#1A504C] text-white' : 'bg-gray-600 text-gray-200'
                  }`}>
                    {/* Subtle arch curve shape on top edge */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />
                    
                    <span className="text-[9px] font-black uppercase tracking-wider block leading-none">
                      {isAuthorized ? scheme.archText : 'FORM 20B LOCK'}
                    </span>
                    <span className="text-[11px] font-extrabold tracking-tight block mt-0.5 leading-tight">
                      {isAuthorized ? scheme.discountText : 'Request Access'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand Name Below Card */}
              <div className="mt-2 text-center flex items-center justify-center gap-1">
                <span className={`text-xs font-extrabold transition-colors truncate max-w-[150px] ${
                  isSelected ? 'text-[#1A504C]' : 'text-[#1A1A1A] group-hover:text-[#1A504C]'
                }`}>
                  {t.name}
                </span>
                {isAuthorized ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
