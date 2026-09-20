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
    <footer className="relative bg-[#1F2E28] text-[#A8B5AF] text-xs selection:bg-[#3D6B52] selection:text-white border-t border-[#2C3E36]">
      {/* Upper Footer: Regulatory Compliance Manifest Cards */}
      <div className="border-b border-[#2C3E36] bg-[#1A2621]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="p-4 sm:p-5 rounded-lg bg-[#22332C] border border-[#2D423A]">
              <div className="flex items-center gap-3 mb-2.5">
                <ShieldCheck className="w-5 h-5 text-[#C9A961] stroke-[1.75]" />
                <h4 className="text-white font-serif font-bold text-sm">CDSCO Form 20B/21B</h4>
              </div>
              <p className="text-[#A8B5AF] text-xs leading-relaxed font-sans">
                Wholesale drug licenses verified against state regulatory registers before catalog access or dispatch manifest issuance.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 sm:p-5 rounded-lg bg-[#22332C] border border-[#2D423A]">
              <div className="flex items-center gap-3 mb-2.5">
                <ThermometerSnowflake className="w-5 h-5 text-[#A8C9B3] stroke-[1.75]" />
                <h4 className="text-white font-serif font-bold text-sm">Cold chain 2°C – 8°C</h4>
              </div>
              <p className="text-[#A8B5AF] text-xs leading-relaxed font-sans">
                Validated thermal packing with continuous data logger telemetry for biologics, insulins, and temperature-sensitive formulations.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 sm:p-5 rounded-lg bg-[#22332C] border border-[#2D423A]">
              <div className="flex items-center gap-3 mb-2.5">
                <RotateCcw className="w-5 h-5 text-[#B54A32] stroke-[1.75]" />
                <h4 className="text-white font-serif font-bold text-sm">CPCB Form 6 waste manifest</h4>
              </div>
              <p className="text-[#A8B5AF] text-xs leading-relaxed font-sans">
                Statutory bio-hazardous waste tracking and authorized TSDF incinerator destruction certificates for recalled or expired batches.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 sm:p-5 rounded-lg bg-[#22332C] border border-[#2D423A]">
              <div className="flex items-center gap-3 mb-2.5">
                <FileCheck2 className="w-5 h-5 text-[#C9A961] stroke-[1.75]" />
                <h4 className="text-white font-serif font-bold text-sm">100% Tax invoiced</h4>
              </div>
              <p className="text-[#A8B5AF] text-xs leading-relaxed font-sans">
                Automated GST E-Way bill generation with synchronized input tax credit (ITC) reconciliation for institutional hospital buyers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand Wordmark & Direct Desk Contact */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo size="md" />

            <p className="text-[#A8B5AF] text-xs leading-relaxed max-w-sm font-sans">
              Pan-India regulated wholesale pharmaceutical marketplace connecting licensed pharmaceutical manufacturers directly with verified distributors and hospital networks.
            </p>

            <div className="space-y-2 pt-1 text-xs font-sans">
              <div className="flex items-center gap-2.5 text-[#E2DDD2]">
                <Phone className="w-4 h-4 text-[#C9A961] shrink-0 stroke-[1.75]" />
                <span>Wholesale desk: <strong className="font-mono text-white">1800-266-PHARMA</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-[#E2DDD2]">
                <Mail className="w-4 h-4 text-[#C9A961] shrink-0 stroke-[1.75]" />
                <span>Trade inquiries: <strong className="text-white font-mono">orders@pharmxpress.in</strong></span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="stamp-seal text-[9px] py-0.5 px-2">ISO 9001:2015</span>
              <span className="stamp-seal text-[9px] py-0.5 px-2">WHO-GMP</span>
              <span className="stamp-seal text-[9px] py-0.5 px-2">CDSCO Sched-M</span>
            </div>
          </div>

          {/* Column 2: Regional Hubs */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white font-serif font-bold text-xs pb-1 border-b border-[#2C3E36] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C9A961] stroke-[1.75]" />
              <span>Regional fulfillment hubs</span>
            </h4>
            
            <div className="space-y-3">
              <div className="p-3 rounded bg-[#22332C] border border-[#2D423A] space-y-1">
                <div className="font-serif font-bold text-white text-xs">Lucknow Central Depot (UP)</div>
                <div className="text-[11px] text-[#A8B5AF] font-sans">Transport Nagar Industrial Area, Lucknow - 226012</div>
                <div className="text-[#C9A961] text-[10px] font-mono pt-0.5">Priority 24h delivery: UP West & UP East</div>
              </div>

              <div className="p-3 rounded bg-[#22332C] border border-[#2D423A] space-y-1">
                <div className="font-serif font-bold text-white text-xs">Bhiwandi Central DC (MH)</div>
                <div className="text-[11px] text-[#A8B5AF] font-sans">Mankoli Logistics Park, Bhiwandi, Thane - 421302</div>
                <div className="text-[#C9A961] text-[10px] font-mono pt-0.5">Same-day express dispatch: Western Zone</div>
              </div>

              <div className="p-3 rounded bg-[#22332C] border border-[#2D423A] space-y-1">
                <div className="font-serif font-bold text-white text-xs">Baddi Pharma Cluster (HP)</div>
                <div className="text-[11px] text-[#A8B5AF] font-sans">Phase-1 Industrial Area, Baddi, Solan - 173205</div>
                <div className="text-[#A8C9B3] text-[10px] font-mono pt-0.5">Primary factory dispatch & cold chain DC</div>
              </div>
            </div>
          </div>

          {/* Column 3: Active Principals & Platform Switch */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-white font-serif font-bold text-xs pb-1 border-b border-[#2C3E36]">
              Active principals
            </h4>
            
            <ul className="space-y-2.5">
              {tenants.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setActiveTenantId(t.id);
                      setPortalMode('manufacturer');
                    }}
                    className="hover:text-white transition-colors text-left flex items-start gap-2 group w-full"
                  >
                    <span className={`w-2 h-2 rounded-full ${t.logoColor} mt-1 shrink-0`} />
                    <div>
                      <div className="text-xs font-sans font-medium text-[#E2DDD2] group-hover:text-white truncate">{t.shortName}</div>
                      <div className="text-[10px] text-[#A8B5AF] font-mono">{t.drugLicenseNumber}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <h5 className="text-[11px] font-serif font-bold text-[#A8B5AF] mb-2">Portal manifest</h5>
              <div className="space-y-2">
                <button
                  onClick={() => setPortalMode('distributor')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-[#E2DDD2] text-xs font-sans"
                >
                  <Store className="w-3.5 h-3.5 text-[#3D6B52] stroke-[1.75]" />
                  <span>Distributor portal</span>
                </button>
                <button
                  onClick={() => setPortalMode('manufacturer')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-[#E2DDD2] text-xs font-sans"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#C9A961] stroke-[1.75]" />
                  <span>Manufacturer operations</span>
                </button>
              </div>
            </div>
          </div>

          {/* Column 4: Verified Distributors */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white font-serif font-bold text-xs pb-1 border-b border-[#2C3E36]">
              Verified distributors
            </h4>
            
            <ul className="space-y-2.5">
              {distributors.map((d) => (
                <li key={d.id} className="p-2.5 rounded bg-[#22332C] border border-[#2D423A]">
                  <button
                    onClick={() => {
                      setActiveDistributorId(d.id);
                      setPortalMode('distributor');
                    }}
                    className="hover:text-white transition-colors text-left w-full block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[#E2DDD2] text-xs truncate">{d.name}</span>
                      <span className="text-[10px] text-[#A8B5AF] font-mono">({d.city})</span>
                    </div>
                    <div className="text-[10px] text-[#A8B5AF] font-mono mt-0.5 truncate">
                      DL: {d.licenses?.form20B || d.gstin}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Regulatory Statutory Disclaimer */}
        <div className="mt-10 pt-5 border-t border-[#2C3E36] bg-[#1A2621] rounded-lg p-4 sm:p-5 text-[11px] text-[#A8B5AF] leading-relaxed space-y-1.5 font-sans">
          <div className="flex items-center gap-2 font-serif font-bold text-[#E2DDD2]">
            <AlertCircle className="w-4 h-4 text-[#C9A961] shrink-0 stroke-[1.75]" />
            <span>Statutory pharmaceutical regulation & compliance disclaimer</span>
          </div>
          <p>
            PharmXpress is a restricted B2B pharmaceutical marketplace intended exclusively for licensed entities. Sale, purchase, and distribution of formulations under Schedules H, H1, and X are strictly governed by the Drugs and Cosmetics Act, 1940 and the Drugs and Cosmetics Rules, 1945. Possession of valid wholesale drug licenses under Form 20B and Form 21B is mandatory for commercial transactions.
          </p>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-8 pt-5 border-t border-[#2C3E36] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8A8578] font-sans">
          <p>© 2026 PharmXpress B2B Platform • Pan-India Regulated Pharmaceutical Wholesale Network</p>
          <div className="flex items-center gap-3 text-[#A8B5AF]">
            <span>Form 20B / Form 21B Compliant</span>
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
