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
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/90 text-xs selection:bg-teal-600 selection:text-white">
      {/* Upper Footer: Pillars of Pharma Compliance Cards (Kunal Pharma & Orange Biotech UP style) */}
      <div className="border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 transition-colors">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="text-white font-bold text-sm">CDSCO & Form 20B/21B</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Wholesale drug licenses strictly verified before catalog viewing or scheduled formulation checkout.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                  <ThermometerSnowflake className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="text-white font-bold text-sm">Cold Chain 2°C - 8°C</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Validated thermal packaging with continuous temperature data logger telemetry for biologics & insulins.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                  <RotateCcw className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="text-white font-bold text-sm">CPCB TSDF Waste Logistics</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Form 6 bio-hazardous waste manifests and CPCB-authorized incinerator destruction certificates.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                  <FileCheck2 className="w-5 h-5 stroke-[2.2]" />
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

      {/* Main Footer Links & Regional Network Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Desks */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
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

            {/* Helpline and Chemist Desk */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Wholesale Chemist Desk: <strong>1800-266-PHARMA</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Orders & Reconciliation: <strong className="text-teal-400">orders@pharmxpress.in</strong></span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">ISO 9001:2015</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">WHO-GMP</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">CDSCO Sched-M</span>
            </div>
          </div>

          {/* Regional Depots & Hubs (Orange Biotech UP & Kunal Pharma Pattern) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Regional Fulfillment Hubs</span>
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="font-bold text-slate-200">Lucknow Central Depot (UP)</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Transport Nagar Industrial Area, Lucknow - 226012</div>
                <div className="text-teal-400 text-[10px] font-semibold mt-1">Priority 24h Delivery: UP West & UP East</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="font-bold text-slate-200">Bhiwandi Central DC (MH)</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Mankoli Logistics Park, Bhiwandi, Thane - 421302</div>
                <div className="text-teal-400 text-[10px] font-semibold mt-1">Same-Day Express Dispatch: Western Zone</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="font-bold text-slate-200">Baddi Pharma Cluster (HP)</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Phase-1 Industrial Area, Baddi, Solan - 173205</div>
                <div className="text-sky-400 text-[10px] font-semibold mt-1">Direct Factory Dispatches & Cold Chain Hub</div>
              </div>
            </div>
          </div>

          {/* Active Manufacturers */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Manufacturing Principals</h4>
            <ul className="space-y-2 text-xs">
              {tenants.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setActiveTenantId(t.id);
                      setPortalMode('manufacturer');
                    }}
                    className="hover:text-teal-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <span className={`w-2 h-2 rounded-full ${t.logoColor}`} />
                    <span className="truncate text-slate-300 font-medium">{t.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="pt-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Platform Portals</h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setPortalMode('distributor')}
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <Store className="w-3.5 h-3.5 text-teal-400" />
                  <span>Distributor Marketplace</span>
                </button>
                <button
                  onClick={() => setPortalMode('manufacturer')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Manufacturer Operations</span>
                </button>
              </div>
            </div>
          </div>

          {/* Wholesale Authorized Distributors */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Approved Distributors</h4>
            <ul className="space-y-2 text-xs">
              {distributors.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => {
                      setActiveDistributorId(d.id);
                      setPortalMode('distributor');
                    }}
                    className="hover:text-teal-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span className="truncate text-slate-300 font-medium">{d.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({d.city})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Regulatory Statutory Disclaimer (Drugs & Cosmetics Act) */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 bg-slate-900/40 rounded-2xl p-4 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Statutory Pharmaceutical Regulation & Compliance Disclaimer</span>
          </div>
          <p>
            PharmXpress is a restricted B2B pharmaceutical marketplace intended exclusively for licensed entities. Sale, purchase, and distribution of medicines falling under Schedules H, H1, and X are strictly governed by the Drugs and Cosmetics Act, 1940 and the Drugs and Cosmetics Rules, 1945. Possession of valid wholesale drug licenses under Form 20B and Form 21B is mandatory for commercial transactions.
          </p>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
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
