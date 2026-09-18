import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Activity, 
  ShieldCheck, 
  Building2, 
  Store, 
  FileCheck2, 
  RotateCcw, 
  Layers, 
  ExternalLink,
  Lock,
  HeartHandshake
} from 'lucide-react';

interface FooterSectionProps {
  onOpenLogin?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onOpenLogin }) => {
  const { setPortalMode, setActiveTenantId, setActiveDistributorId, tenants, distributors } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs selection:bg-sky-600 selection:text-white">
      {/* Upper Footer: Pillars of Pharma Compliance Grid */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">CDSCO & Form 20B/21B</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Strict drug licensing verification. Unlicensed distributors cannot view wholesale rates or place scheduled orders.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Isolated Multi-Tenancy</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Independent tenant databases, pricing schedules, distributor authorizations, and ERP stock sync per manufacturer.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">CPCB Hazardous Waste</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Reverse logistics for expired & recalled medicines with Form 6 manifest tracking and TSDF destruction certificates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">JWT Role-Based Access</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Cryptographically verified JWT personas for manufacturer admins, sales reps, and distributor purchasing agents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight text-lg">PharmXpress</span>
                <span className="ml-2 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-sky-950 border border-sky-800 text-sky-400">
                  B2B
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Enterprise pharmaceutical marketplace engine powering manufacturer-to-distributor commerce with full regulatory compliance, FEFO batch accounting, and automated returns.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">ISO 9001:2015</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">WHO-GMP Compliant</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">21 CFR Part 11 Audit Trail</span>
            </div>
          </div>

          {/* Quick Portal Switcher Column */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setPortalMode('distributor')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Distributor Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPortalMode('manufacturer')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Manufacturer Portal</span>
                </button>
              </li>
              {onOpenLogin && (
                <li>
                  <button
                    onClick={onOpenLogin}
                    className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>JWT Persona Switcher</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Active Manufacturers Context */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Manufacturers</h4>
            <ul className="space-y-2 text-xs">
              {tenants.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setActiveTenantId(t.id);
                      setPortalMode('manufacturer');
                    }}
                    className="hover:text-sky-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${t.logoColor}`} />
                    <span className="truncate">{t.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Distributors Network Context */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Authorized Distributors</h4>
            <ul className="space-y-2 text-xs">
              {distributors.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => {
                      setActiveDistributorId(d.id);
                      setPortalMode('distributor');
                    }}
                    className="hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="truncate">{d.name}</span>
                    <span className="text-[10px] text-slate-600 font-mono">({d.city})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 PharmXpress B2B Platform • Multi-Tenant Pharmaceutical Distribution System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400 flex-wrap">
            <span>Schedule H / H1 Regulated</span>
            <span>•</span>
            <span>Form 20B/21B Wholesale Compliance</span>
            <span>•</span>
            <span>CPCB TSDF Hazardous Protocols</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
