import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShieldCheck, 
  Building2, 
  Store, 
  RotateCcw, 
  MapPin, 
  Phone, 
  Mail, 
  ThermometerSnowflake, 
  FileCheck2, 
  AlertCircle 
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface FooterSectionProps {
  onOpenLogin?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = () => {
  const { setPortalMode, setActiveTenantId, setActiveDistributorId, tenants, distributors } = useStore();

  return (
    <footer className="relative bg-[#F9FAFB] text-[#1A1A1A] text-xs border-t border-gray-200">
      {/* Upper Footer: Regulatory Compliance Cards (Apollo / PharmEasy Light Style) */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F8F6] border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <h4 className="font-bold text-sm text-[#1A1A1A]">CDSCO Form 20B/21B</h4>
              </div>
              <p className="text-[#6B7280] text-xs leading-relaxed">
                Wholesale drug licenses strictly verified against state licensing authority registers before commercial checkout.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F8F6] border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center shrink-0">
                  <ThermometerSnowflake className="w-5 h-5 stroke-[2]" />
                </div>
                <h4 className="font-bold text-sm text-[#1A1A1A]">Cold Chain 2°C – 8°C</h4>
              </div>
              <p className="text-[#6B7280] text-xs leading-relaxed">
                Validated thermal packaging with continuous temperature data logger telemetry for biologics, insulins & vaccines.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F8F6] border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 stroke-[2]" />
                </div>
                <h4 className="font-bold text-sm text-[#1A1A1A]">CPCB Form 6 Manifest</h4>
              </div>
              <p className="text-[#6B7280] text-xs leading-relaxed">
                Certified bio-hazardous waste destruction manifests and CPCB-authorized TSDF incinerator tracking for expired SKUs.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F8F6] border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F3F1] text-[#1A504C] flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5 stroke-[2]" />
                </div>
                <h4 className="font-bold text-sm text-[#1A1A1A]">100% Tax Invoiced</h4>
              </div>
              <p className="text-[#6B7280] text-xs leading-relaxed">
                Automated GST E-Way bill generation with synchronized Input Tax Credit (ITC) reconciliation for institutional buyers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo size="md" variant="light" />

            <p className="text-[#6B7280] text-xs leading-relaxed max-w-sm">
              India's leading regulated multi-tenant B2B pharmaceutical marketplace connecting licensed medicine manufacturers directly with authorized wholesale distributors and hospital networks.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2.5 text-[#1A1A1A]">
                <Phone className="w-4 h-4 text-[#1A504C] shrink-0" />
                <span>Wholesale Desk: <strong className="font-bold">1800-266-PHARMA</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-[#1A1A1A]">
                <Mail className="w-4 h-4 text-[#1A504C] shrink-0" />
                <span>Order Inquiries: <strong className="text-[#1A504C]">orders@pharmxpress.in</strong></span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[#1A1A1A]">ISO 9001:2015</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[#1A1A1A]">WHO-GMP</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[#1A1A1A]">CDSCO Schedule-M</span>
            </div>
          </div>

          {/* Column 2: Regional Fulfillment Depots */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-xs text-[#1A1A1A] uppercase tracking-wider pb-1 border-b border-gray-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1A504C]" />
              <span>Regional Fulfillment Hubs</span>
            </h4>
            
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-0.5">
                <div className="font-bold text-[#1A1A1A] text-xs">Lucknow Central Depot (UP)</div>
                <div className="text-[11px] text-[#6B7280]">Transport Nagar Industrial Area, Lucknow - 226012</div>
                <div className="text-[#1A504C] text-[10px] font-bold pt-0.5">Priority 24h Transit: UP West & UP East</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-0.5">
                <div className="font-bold text-[#1A1A1A] text-xs">Bhiwandi Central DC (MH)</div>
                <div className="text-[11px] text-[#6B7280]">Mankoli Logistics Park, Bhiwandi, Thane - 421302</div>
                <div className="text-[#1A504C] text-[10px] font-bold pt-0.5">Same-Day Express: Western Zone</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-0.5">
                <div className="font-bold text-[#1A1A1A] text-xs">Baddi Pharma Cluster (HP)</div>
                <div className="text-[11px] text-[#6B7280]">Phase-1 Industrial Area, Baddi, Solan - 173205</div>
                <div className="text-blue-700 text-[10px] font-bold pt-0.5">Primary Manufacturing Dispatch Facility</div>
              </div>
            </div>
          </div>

          {/* Column 3: Active Principals & Portals */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-xs text-[#1A1A1A] uppercase tracking-wider pb-1 border-b border-gray-200">
              Active Principals
            </h4>
            
            <ul className="space-y-2">
              {tenants.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setActiveTenantId(t.id);
                      setPortalMode('manufacturer');
                    }}
                    className="hover:text-[#1A504C] transition-colors text-left flex items-start gap-2 group w-full"
                  >
                    <span className={`w-2 h-2 rounded-full ${t.logoColor} mt-1 shrink-0`} />
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1A504C] truncate">{t.shortName}</div>
                      <div className="text-[10px] text-[#6B7280]">{t.drugLicenseNumber}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-gray-200">
              <h5 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Platform Portals</h5>
              <div className="space-y-2">
                <button
                  onClick={() => setPortalMode('distributor')}
                  className="hover:text-[#1A504C] transition-colors flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]"
                >
                  <Store className="w-3.5 h-3.5 text-[#1A504C]" />
                  <span>Distributor Portal</span>
                </button>
                <button
                  onClick={() => setPortalMode('manufacturer')}
                  className="hover:text-[#1A504C] transition-colors flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#1A504C]" />
                  <span>Manufacturer Operations</span>
                </button>
              </div>
            </div>
          </div>

          {/* Column 4: Verified Distributors */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-xs text-[#1A1A1A] uppercase tracking-wider pb-1 border-b border-gray-200">
              Verified Stockists
            </h4>
            
            <ul className="space-y-2.5">
              {distributors.map((d) => (
                <li key={d.id} className="p-2.5 rounded-xl bg-white border border-gray-200">
                  <button
                    onClick={() => {
                      setActiveDistributorId(d.id);
                      setPortalMode('distributor');
                    }}
                    className="hover:text-[#1A504C] transition-colors text-left w-full block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1A1A1A] text-xs truncate">{d.name}</span>
                      <span className="text-[10px] text-[#6B7280]">({d.city})</span>
                    </div>
                    <div className="text-[10px] text-[#6B7280] mt-0.5 truncate">
                      DL: {d.licenses?.form20B || d.gstin}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Regulatory Statutory Disclaimer */}
        <div className="mt-8 pt-4 border-t border-gray-200 bg-white rounded-2xl p-4 sm:p-5 text-[11px] text-[#6B7280] leading-relaxed space-y-1.5 border border-gray-200">
          <div className="flex items-center gap-2 font-bold text-[#1A1A1A]">
            <AlertCircle className="w-4 h-4 text-[#EA580C] shrink-0" />
            <span>Statutory Pharmaceutical Wholesale Compliance Disclaimer</span>
          </div>
          <p>
            PharmXpress is a restricted B2B pharmaceutical marketplace intended exclusively for licensed entities. Sale, purchase, and distribution of medicines falling under Schedules H, H1, and X are strictly governed by the Drugs and Cosmetics Act, 1940 and the Drugs and Cosmetics Rules, 1945. Possession of valid wholesale drug licenses under Form 20B and Form 21B is mandatory for commercial transactions.
          </p>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <p>© 2026 PharmXpress B2B Platform • Pan-India Regulated Pharmaceutical Distribution Network</p>
          <div className="flex items-center gap-3">
            <span>Form 20B/21B Compliant</span>
            <span>•</span>
            <span>CDSCO Schedule M</span>
            <span>•</span>
            <span>CPCB TSDF Form 6</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
