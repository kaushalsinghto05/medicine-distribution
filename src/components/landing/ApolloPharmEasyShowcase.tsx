import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Pill, 
  FlaskConical, 
  Stethoscope, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Tag, 
  ShoppingBag, 
  ArrowRight, 
  ArrowUpRight,
  Info,
  Clock,
  CheckCircle2,
  FileText,
  Snowflake,
  MessageSquare
} from 'lucide-react';

export const ApolloPharmEasyShowcase: React.FC = () => {
  const { navigateToPage, setGlobalSearchQuery, setPortalMode } = useStore();

  const handleCategoryClick = (category: string) => {
    setGlobalSearchQuery(category);
    setPortalMode('distributor');
    navigateToPage('marketplace');
  };

  const categories = [
    { id: 'medicine', label: 'Medicines', discount: 'SAVE 27%', tagClass: 'text-rose-700 bg-rose-50', icon: Pill, color: 'text-sky-600 bg-sky-50' },
    { id: 'antibiotics', label: 'Antibiotics', discount: 'UPTO 35% OFF', tagClass: 'text-emerald-700 bg-emerald-50', icon: FlaskConical, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'critical', label: 'Critical Care', discount: 'DIRECT PTR', tagClass: 'text-indigo-700 bg-indigo-50', icon: Stethoscope, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'substitute', label: 'Generics', discount: 'UPTO 50% OFF', tagClass: 'text-amber-700 bg-amber-50', icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
    { id: 'coldchain', label: 'Cold-Chain', discount: '2°C–8°C LOGS', tagClass: 'text-cyan-700 bg-cyan-50', icon: Snowflake, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'schemes', label: '10+1 Schemes', discount: 'FREE UNITS', tagClass: 'text-teal-700 bg-teal-50', icon: Tag, color: 'text-teal-600 bg-teal-50' },
    { id: 'credit', label: 'Trade Credit', discount: 'NET-30/60', tagClass: 'text-purple-700 bg-purple-50', icon: CreditCard, color: 'text-purple-600 bg-purple-50' },
    { id: 'fleet', label: 'Depot Fleet', discount: '4H DISPATCH', tagClass: 'text-blue-700 bg-blue-50', icon: Truck, color: 'text-blue-600 bg-blue-50' },
    { id: 'valuestore', label: 'Value Store', discount: 'UPTO 40% OFF', tagClass: 'text-rose-700 bg-rose-50', icon: ShoppingBag, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Netmeds / Apollo Info Ticker & Compliance Strip */}
      <div className="bg-[#E8F3F1] border border-[#1A504C]/20 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#1A504C]">
          <Info className="w-4 h-4 shrink-0 font-bold" />
          <span className="font-semibold text-[11px] sm:text-xs">
            <strong>Statutory B2B Compliance:</strong> All wholesale consignments verified under Drugs and Cosmetics Rules 1945 Form 20B/21B.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#1A504C]/90 font-bold shrink-0">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% FEFO Batch Traceability
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            4-Hour Depot Dispatch
          </span>
        </div>
      </div>

      {/* 2. PharmEasy "What are you looking for?" Central Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#1A1A1A] tracking-tight">
              What are you looking for?
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Procure directly from licensed manufacturing units at factory wholesale PTR rates
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateToPage('licenses')}
            className="flex items-center gap-1.5 text-xs font-black text-[#1A504C] hover:text-[#143F3C] transition-colors group self-start sm:self-auto"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Order with Form 20B/21B. VERIFY NOW</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 9 Category Graphic Cards (PharmEasy Pattern) */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.label)}
                className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-[#1A504C]/40 transition-all hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}>
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="font-heading font-bold text-xs text-[#1A1A1A] mt-2.5 group-hover:text-[#1A504C] transition-colors line-clamp-1">
                  {cat.label}
                </span>
                <span className={`mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${cat.tagClass}`}>
                  {cat.discount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Apollo & PharmEasy Rich Promotional Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Banner 1: Apollo Coral Style - Clinical Desk */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D9532F] via-[#E2613C] to-[#B93E1D] text-white p-6 flex flex-col justify-between shadow-md group">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                Clinical Pharmacologist Desk
              </span>
            </div>
            <h3 className="font-heading font-black text-xl sm:text-2xl leading-tight">
              Ask anything about your medicines.
            </h3>
            <p className="text-xs text-white/85 leading-relaxed max-w-xs">
              Get trusted formulation monographs, Schedule H rules, and cold-chain compliance directly from CDSCO specialists.
            </p>
          </div>

          <div className="pt-6 relative z-10">
            <button
              type="button"
              onClick={() => navigateToPage('marketplace')}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#B93E1D] font-black text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span>+ Ask Clinical Desk</span>
              <span className="text-[10px] font-mono bg-[#B93E1D]/10 px-1.5 py-0.5 rounded-full">BETA</span>
            </button>
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute right-4 top-4 text-white/20">
            <Stethoscope className="w-20 h-20 stroke-[1.2]" />
          </div>
        </div>

        {/* Banner 2: PharmEasy Lavender Style - Oncology & Critical Care */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ECE8F7] via-[#F4F1FB] to-[#E3DCF5] text-[#2D2254] p-6 flex flex-col justify-between border border-[#D5CBEF] shadow-md group">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#5E42C2] text-white font-extrabold text-[10px] uppercase tracking-wider">
                Critical Care Support
              </span>
              <span className="text-[10px] font-bold text-[#5E42C2]">Direct Manufacturer</span>
            </div>
            <h3 className="font-heading font-black text-xl sm:text-2xl leading-tight text-[#231747]">
              Here to support critical hospital supply lines.
            </h3>
            <p className="text-xs text-[#524479] leading-relaxed max-w-xs">
              <strong>UPTO 40% OFF</strong> on authentic critical-care injections, antibiotics, and intravenous solutions with 100% FEFO batch allocation.
            </p>
          </div>

          <div className="pt-6 relative z-10">
            <button
              type="button"
              onClick={() => navigateToPage('marketplace')}
              className="px-5 py-2.5 rounded-full bg-[#5E42C2] hover:bg-[#4E34AD] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Order Consignment</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute right-4 top-4 text-[#5E42C2]/15">
            <Pill className="w-20 h-20 stroke-[1.2]" />
          </div>
        </div>

        {/* Banner 3: Apollo Emerald Style - 2°C–8°C Cold-Chain Fleet */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F3835] via-[#1A504C] to-[#113E3B] text-white p-6 flex flex-col justify-between shadow-md group">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#24AEB1] text-[#0A2624] font-black text-[10px] uppercase tracking-wider">
                IoT Telemetry Fleet
              </span>
              <span className="text-[10px] font-mono text-[#24AEB1] font-bold">2°C–8°C Certified</span>
            </div>
            <h3 className="font-heading font-black text-xl sm:text-2xl leading-tight">
              Continuous Reefer Transit Monitoring.
            </h3>
            <p className="text-xs text-white/85 leading-relaxed max-w-xs">
              Real-time temperature telemetry loggers active. Zero-breach cold-chain dispatch across all regional depots in Uttar Pradesh.
            </p>
          </div>

          <div className="pt-6 relative z-10">
            <button
              type="button"
              onClick={() => navigateToPage('coldchain')}
              className="px-5 py-2.5 rounded-full bg-[#24AEB1] hover:bg-[#1DA1A4] text-[#0A2624] font-black text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span>View Telemetry Fleet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute right-4 top-4 text-white/10">
            <Snowflake className="w-20 h-20 stroke-[1.2]" />
          </div>
        </div>

      </div>

      {/* 4. Netmeds Membership & Trade Credit Banner Strip */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1A504C] to-[#0D3835] text-white p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-[#4BE1E4]" />
          </div>
          <div>
            <div className="font-heading font-black text-sm sm:text-base text-white">
              Institutional Wholesale Trade Credit up to ₹15,00,000
            </div>
            <div className="text-xs text-white/80">
              Net-30 and Net-60 institutional payment facilities for verified CDSCO Form 20B/21B wholesale distributors.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateToPage('credit')}
          className="px-5 py-2 rounded-full bg-[#4BE1E4] hover:bg-[#3CD4D7] text-[#0A2624] font-black text-xs transition-all shrink-0 shadow-xs"
        >
          Check Eligibility ➔
        </button>
      </div>
    </div>
  );
};
