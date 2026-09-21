import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Store, 
  ArrowRight, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { PharmacyPavilion3D } from './PharmacyPavilion3D';
import { HeroOmnibar } from './HeroOmnibar';
import { QuickActionCards } from './QuickActionCards';
import { CuratedTreatmentsRail } from './CuratedTreatmentsRail';
import { PopularManufacturerBrands } from './PopularManufacturerBrands';

interface HeroSectionProps {
  onOpenLogin?: () => void;
  onExploreCatalog?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCatalog,
}) => {
  const { 
    portalMode, 
    setPortalMode, 
    currentTenant, 
    currentDistributor,
    setActiveDistributorTenantFilter,
    navigateToPage
  } = useStore();
  const { switchPredefinedUser } = useAuth();

  const handleStartOrder = () => {
    setPortalMode('distributor');
    navigateToPage('marketplace');
    if (onExploreCatalog) onExploreCatalog();
  };

  const handleSelectTreatmentCategory = (_category: string) => {
    setPortalMode('distributor');
    navigateToPage('marketplace');
    if (onExploreCatalog) onExploreCatalog();
  };

  const handleSelectPrincipal = (tenantId: string) => {
    setActiveDistributorTenantFilter(tenantId);
    setPortalMode('distributor');
    navigateToPage('marketplace');
    if (onExploreCatalog) onExploreCatalog();
  };

  return (
    <section className="bg-gradient-to-b from-[#F5F8F6] via-white to-[#F9FBFA] text-[#1A1A1A] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-14">
        
        {/* Compliance Trust Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F3F1] text-[#1A504C] font-extrabold text-[10px] uppercase tracking-wider">
              CDSCO Verified
            </span>
            <span className="text-[#6B7280]">
              Drugs and Cosmetics Act, 1940 & Rules 1945 Compliant Wholesale Registry
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#6B7280] text-xs">
            <span className="flex items-center gap-1 font-semibold text-[#1A504C]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Form 20B/21B Verified Network
            </span>
            <span>•</span>
            <span className="font-semibold text-[#1A1A1A]">100% FEFO Allocation</span>
          </div>
        </div>

        {/* Biddano-Style Hero Stage: Left Headline & Roles + Right 3D Interactive Pavilion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Biddano Two-Tone Headline & Direct Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#1A504C] block">
                Connected Healthcare. Every Day.
              </span>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1A1A] leading-[1.08]">
                Better stocked.<br />
                <span className="text-[#1A504C]">Better care.</span>
              </h1>
              
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-xl">
                A world of healthcare, connected. Everything your pharmacy needs, within reach. Direct manufacturer wholesale PTR rates, batch-level FEFO auto-allocation, and certified cold-chain logistics.
              </p>
            </div>

            {/* Biddano CTAs: Start your order + Step inside */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={handleStartOrder}
                className="px-7 py-3.5 rounded-full bg-[#1A504C] hover:bg-[#143F3C] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 group active:scale-95"
              >
                <span>Start your order</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                type="button"
                onClick={handleStartOrder}
                className="px-4 py-3.5 text-sm font-extrabold text-[#1A1A1A] hover:text-[#1A504C] transition-colors flex items-center gap-2 group"
              >
                <span>Step inside</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Quick Role-Selection Moment (Manufacturer vs Distributor) */}
            <div className="pt-4 border-t border-gray-200/80">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
                Choose Trading Portal:
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* Wholesale Stockist Choice */}
                <button
                  type="button"
                  onClick={() => {
                    setPortalMode('distributor');
                    handleStartOrder();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    portalMode === 'distributor'
                      ? 'bg-white border-[#1A504C] ring-2 ring-[#1A504C]/20 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-[#6B7280] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1A1A1A]">
                    <Store className="w-3.5 h-3.5 text-[#1A504C]" />
                    <span>I distribute medicine</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">
                    Form 20B/21B Wholesale Buyer
                  </div>
                </button>

                {/* Manufacturing Principal Choice */}
                <button
                  type="button"
                  onClick={() => {
                    setPortalMode('manufacturer');
                    switchPredefinedUser('usr-acme-admin-01');
                    const element = document.getElementById('marketplace-content');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    portalMode === 'manufacturer'
                      ? 'bg-white border-[#1A504C] ring-2 ring-[#1A504C]/20 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-[#6B7280] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1A1A1A]">
                    <Building2 className="w-3.5 h-3.5 text-[#1A504C]" />
                    <span>I manufacture medicine</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">
                    Form 25/28 Principal Seller
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Biddano 3D Virtual Pharmacy Pavilion */}
          <div className="lg:col-span-6">
            <PharmacyPavilion3D 
              onOpenSearch={handleStartOrder}
              onOpenCart={() => {
                setPortalMode('distributor');
                const cartBtn = document.querySelector('[data-cart-button]') as HTMLElement;
                if (cartBtn) cartBtn.click();
              }}
              onExploreCatalog={() => navigateToPage('pavilion')}
            />
          </div>
        </div>

        {/* Biddano Floating Omnibar pinned at base of Hero Stage */}
        <div className="pt-2">
          <HeroOmnibar onSearchSubmit={handleStartOrder} />
        </div>

        {/* Apollo & Medkart Quick Action Feature Cards & Trust Metrics */}
        <div>
          <QuickActionCards onExploreCatalog={handleStartOrder} />
        </div>

        {/* Apollo Popular Manufacturer Brands Showcase */}
        <div>
          <PopularManufacturerBrands onSelectPrincipal={handleSelectPrincipal} />
        </div>

        {/* Netmeds & Truemeds Curated Treatment Formulations Rail */}
        <div>
          <CuratedTreatmentsRail onSelectCategory={handleSelectTreatmentCategory} />
        </div>

      </div>
    </section>
  );
};
