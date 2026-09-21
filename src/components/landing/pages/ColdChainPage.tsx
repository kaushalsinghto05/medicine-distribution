import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { 
  ArrowLeft, 
  Snowflake, 
  Truck, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Pill,
  Thermometer,
  Radio
} from 'lucide-react';
import { MedicineCardNetmeds } from '../../distributor/screens/MedicineCardNetmeds';

export const ColdChainPage: React.FC = () => {
  const { navigateToPage, distributorMedicines } = useStore();

  const coldChainMedicines = distributorMedicines.filter((m) => m.regulatory.isColdChain);

  const activeVehicles = [
    { id: 'UP-70-AT-1024', driver: 'Suresh Yadav', route: 'Prayagraj Central Depot → Civil Lines Pharmacy Corridor', temp: '4.2°C', status: 'In-Transit (Normal)', cutoff: '14:20 PM' },
    { id: 'UP-78-CK-4491', driver: 'Mohd. Imran', route: 'Kanpur Industrial Hub → Mall Road Medical Complex', temp: '3.8°C', status: 'In-Transit (Normal)', cutoff: '15:10 PM' },
    { id: 'UP-32-BN-8820', driver: 'Deepak Sharma', route: 'Lucknow Depot → Hazratganj Wholesale Cluster', temp: '4.5°C', status: 'Dispatched (Normal)', cutoff: '16:00 PM' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateToPage('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F8F6] hover:bg-[#E8F3F1] text-[#1A504C] font-extrabold text-xs transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <span className="text-gray-300">/</span>

          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-blue-600" />
            <h1 className="font-heading font-black text-sm sm:text-base text-[#1A1A1A] tracking-tight">
              Cold-Chain Logistics & Telemetry (2°C – 8°C)
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigateToPage('marketplace')}
          className="px-4 py-2 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          <span>Order Cold-Chain Batches</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Real-time Telemetry Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#1A504C] text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                Live IoT Telemetry Active
              </span>
              <span className="text-blue-200 text-xs">CDSCO Cold-Chain Schedule C/C1 Compliant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight">
              Temperature-Controlled Active Cold Chain
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Every temperature-sensitive injectable, vaccine, and biologic formulation is dispatched in active refrigerated transit with electronic data-logging sensors verified before gate pass generation.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <Thermometer className="w-10 h-10 text-cyan-300 stroke-[1.5]" />
            <div>
              <div className="text-2xl font-black tabular-nums">3.8°C – 4.5°C</div>
              <div className="text-[11px] text-cyan-200 font-bold uppercase tracking-wider">Fleet Current Average</div>
            </div>
          </div>
        </div>

        {/* Live Vehicles Track */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {activeVehicles.map((v) => (
            <div key={v.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-white">{v.id}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {v.temp}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 truncate">{v.route}</p>
              <div className="flex items-center justify-between text-[10px] text-blue-200/80 pt-1 border-t border-white/10">
                <span>Driver: {v.driver}</span>
                <span>{v.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cold Chain Medicines Catalog Rail */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#1A1A1A]">
              Certified Cold-Chain Formulations
            </h3>
            <p className="text-xs text-[#6B7280]">
              Molecules requiring continuous 2°C – 8°C thermal telemetry logging
            </p>
          </div>
          <span className="text-xs font-bold text-[#1A504C]">
            {coldChainMedicines.length} Formulations Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coldChainMedicines.map((med) => (
            <MedicineCardNetmeds
              key={med.id}
              medicine={med}
              onSelectMedicine={() => navigateToPage('marketplace')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
