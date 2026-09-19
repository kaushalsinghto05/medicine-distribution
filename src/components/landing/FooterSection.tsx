import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Activity, 
  ShieldCheck, 
  Building2, 
  Store, 
  RotateCcw, 
  Layers, 
  Lock,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Truck,
  ThermometerSnowflake,
  FileCheck2,
  AlertCircle
} from 'lucide-react';

interface FooterSectionProps {
  onOpenLogin?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onOpenLogin }) => {
  const { setPortalMode, setActiveTenantId, setActiveDistributorId, tenants, distributors } = useStore();

  return (
    <footer className="relative bg-slate-950 text-slate-400 text-xs selection:bg-teal-600 selection:text-white">
      {/* Item 1: Smooth Light-to-Dark Transition Bridge from Marketplace into Dark Compliance Band */}
      <div className="h-12 bg-gradient-to-b from-slate-50 via-slate-200/60 to-slate-950 border-t border-slate-200/80 pointer-events-none" />

      {/* Upper Footer: Pillars of Pharma Compliance Cards */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all duration-150 group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 transition-colors">
                  <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h4 className="text-white font-bold text-sm">CDSCO & Form 20B/21B</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Wholesale drug licenses strictly verified before catalog viewing or scheduled formulation checkout.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all duration-150 group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                  <ThermometerSnowflake className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h4 className="text-white font-bold text-sm">Cold Chain 2°C - 8°C</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Validated thermal packaging with continuous temperature data logger telemetry for biologics & insulins.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-150 group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                  <RotateCcw className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h4 className="text-white font-bold text-sm">CPCB TSDF Waste Logistics</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Form 6 bio-hazardous waste manifests and CPCB-authorized incinerator destruction certificates.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all duration-150 group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                  <FileCheck2 className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h4 className="text-white font-bold text-sm">100% Tax Invoiced</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                GST E-Way bill generation with automated input tax credit (ITC) reconciliation for institutional buyers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer: Item 7 Restyled as Clean 4-Column Layout with Generous Line-Height & Contrast */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand & Direct Desk Contact (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 via-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-black text-white tracking-tight text-lg">PharmXpress</span>
                <span className="ml-2 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-teal-950 border border-teal-800 text-teal-300">
                  B2B
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              India's regulated multi-tenant B2B pharmaceutical marketplace connecting licensed medicine manufacturers directly with authorized wholesale distributors and hospital networks.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-teal-400 shrink-0 stroke-[1.75]" />
                <span>Wholesale Desk: <strong className="text-white font-mono">1800-266-PHARMA</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-teal-400 shrink-0 stroke-[1.75]" />
                <span>Order Inquiries: <strong className="text-teal-400">orders@pharmxpress.in</strong></span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">ISO 9001:2015</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">WHO-GMP</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">CDSCO Sched-M</span>
            </div>
          </div>

          {/* Column 2: Regional Depots with Bold Titles and Muted Addresses (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800/80">
              <MapPin className="w-3.5 h-3.5 text-teal-400 stroke-[1.75]" />
              <span>Regional Fulfillment Hubs</span>
            </h4>
            
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 space-y-1">
                <div className="font-bold text-slate-100 text-xs">Lucknow Central Depot (UP)</div>
                <div className="text-[11px] text-slate-400 leading-snug">Transport Nagar Industrial Area, Lucknow - 226012</div>
                <div className="text-teal-400 text-[10px] font-semibold pt-0.5">Priority 24h Delivery: UP West & UP East</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 space-y-1">
                <div className="font-bold text-slate-100 text-xs">Bhiwandi Central DC (MH)</div>
                <div className="text-[11px] text-slate-400 leading-snug">Mankoli Logistics Park, Bhiwandi, Thane - 421302</div>
                <div className="text-teal-400 text-[10px] font-semibold pt-0.5">Same-Day Express: Western Zone</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 space-y-1">
                <div className="font-bold text-slate-100 text-xs">Baddi Pharma Cluster (HP)</div>
                <div className="text-[11px] text-slate-400 leading-snug">Phase-1 Industrial Area, Baddi, Solan - 173205</div>
                <div className="text-sky-400 text-[10px] font-semibold pt-0.5">Factory Dispatches & Cold Chain Facility</div>
              </div>
            </div>
          </div>

          {/* Column 3: Manufacturing Principals & Platform Portals (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-800/80">
              Active Principals
            </h4>
            
            <ul className="space-y-2.5">
              {tenants.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setActiveTenantId(t.id);
                      setPortalMode('manufacturer');
                    }}
                    className="hover:text-teal-400 transition-colors text-left flex items-start gap-2 group w-full"
                  >
                    <span className={`w-2 h-2 rounded-full ${t.logoColor} mt-1 shrink-0`} />
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">{t.shortName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{t.drugLicenseNumber}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Access</h5>
              <div className="space-y-2">
                <button
                  onClick={() => setPortalMode('distributor')}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1.5 text-slate-300 text-xs font-medium"
                >
                  <Store className="w-3.5 h-3.5 text-teal-400 stroke-[1.75]" />
                  <span>Distributor Portal</span>
                </button>
                <button
                  onClick={() => setPortalMode('manufacturer')}
                  className="hover:text-sky-300 transition-colors flex items-center gap-1.5 text-slate-300 text-xs font-medium"
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-400 stroke-[1.75]" />
                  <span>Manufacturer Operations</span>
                </button>
              </div>
            </div>
          </div>

          {/* Column 4: Authorized Wholesale Distributors (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-800/80">
              Verified Distributors
            </h4>
            
            <ul className="space-y-3">
              {distributors.map((d) => (
                <li key={d.id} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                  <button
                    onClick={() => {
                      setActiveDistributorId(d.id);
                      setPortalMode('distributor');
                    }}
                    className="hover:text-teal-400 transition-colors text-left w-full block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-xs truncate">{d.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({d.city})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      DL: {d.licenses?.form20B || d.gstin}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Regulatory Statutory Disclaimer */}
        <div className="mt-10 pt-5 border-t border-slate-800/80 bg-slate-900/40 rounded-2xl p-4 sm:p-5 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 stroke-[1.75]" />
            <span>Statutory Pharmaceutical Regulation & Compliance Disclaimer</span>
          </div>
          <p>
            PharmXpress is a restricted B2B pharmaceutical marketplace intended exclusively for licensed entities. Sale, purchase, and distribution of medicines falling under Schedules H, H1, and X are strictly governed by the Drugs and Cosmetics Act, 1940 and the Drugs and Cosmetics Rules, 1945. Possession of valid wholesale drug licenses under Form 20B and Form 21B is mandatory for commercial transactions.
          </p>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 PharmXpress B2B Platform • Pan-India Regulated Pharmaceutical Distribution Network</p>
          <div className="flex items-center gap-3 text-slate-400 flex-wrap">
            <span>Form 20B/21B Compliant</span>
            <span>•</span>
            <span>CDSCO Schedule M & WHO-GMP</span>
            <span>•</span>
            <span>CPCB TSDF Hazardous Protocols</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
