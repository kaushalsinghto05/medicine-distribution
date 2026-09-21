import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { PharmacyPavilion3D } from '../PharmacyPavilion3D';
import { 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Pill,
  Clock,
  Activity
} from 'lucide-react';

export const PavilionShowcasePage: React.FC = () => {
  const { navigateToPage, medicines, tenants } = useStore();

  const fulfillmentMatrix = [
    { name: 'Prayagraj Central Depot', state: 'Uttar Pradesh', cutoff: '04:00 PM', transit: '4h Express Same-Day', status: 'Optimal' },
    { name: 'Kanpur Industrial Logistics Park', state: 'Uttar Pradesh', cutoff: '06:00 PM', transit: 'Next-Morning Delivery', status: 'Optimal' },
    { name: 'Lucknow Transport Nagar Hub', state: 'Uttar Pradesh', cutoff: '05:30 PM', transit: 'Same-Day Express', status: 'Optimal' },
    { name: 'Varanasi Regional Depot', state: 'Uttar Pradesh', cutoff: '03:30 PM', transit: 'Next-Day Transit', status: 'Optimal' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb Bar */}
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
            <Sparkles className="w-4 h-4 text-[#1A504C]" />
            <h1 className="font-heading font-black text-sm sm:text-base text-[#1A1A1A] tracking-tight">
              3D Virtual Pharmacy Trade Counter Pavilion
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigateToPage('marketplace')}
          className="px-4 py-2 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          <span>Start Wholesale Order</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main 3D Pavilion Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-6">
        <PharmacyPavilion3D
          onOpenSearch={() => navigateToPage('marketplace')}
          onOpenCart={() => {
            const btn = document.querySelector('[data-cart-button]') as HTMLElement;
            if (btn) btn.click();
          }}
          onExploreCatalog={() => navigateToPage('marketplace')}
        />

        {/* Feature Explanations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-gray-100">
          <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-gray-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#1A504C] flex items-center justify-center font-black text-xs">
                01
              </div>
              <h3 className="font-heading font-bold text-sm text-[#1A1A1A]">
                Direct Factory Inventory
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Every bottle and blister carton shown on the pavilion shelves represents live, verified stock allocated directly from GMP manufacturers ({tenants.length} approved principals).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-gray-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                02
              </div>
              <h3 className="font-heading font-bold text-sm text-[#1A1A1A]">
                100% FEFO Batch Allocation
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Automatic First-Expiry First-Out algorithmic locking guarantees you receive batches with verified shelf life and certified Certificate of Analysis (COA).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-gray-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                03
              </div>
              <h3 className="font-heading font-bold text-sm text-[#1A1A1A]">
                Cold-Chain Monitored Telemetry
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Active refrigerated dispatch containers maintaining 2°C to 8°C throughout transit from regional fulfillment hubs with GPS data loggers.
            </p>
          </div>
        </div>

        {/* Regional Fulfillment Hub Matrix */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1A504C]" />
              <h3 className="font-heading font-bold text-sm text-[#1A1A1A]">
                Regional Logistics Depots & Dispatch Cutoffs
              </h3>
            </div>
            <span className="text-xs text-[#6B7280]">
              State Regulatory Corridor (UP)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {fulfillmentMatrix.map((hub, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A1A] truncate">{hub.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] text-[#6B7280]">Cutoff: <strong className="text-[#1A1A1A]">{hub.cutoff} Today</strong></div>
                <div className="text-[11px] text-emerald-700 font-bold">{hub.transit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
