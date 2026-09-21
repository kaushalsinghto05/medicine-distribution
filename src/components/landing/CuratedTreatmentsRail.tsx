import React from 'react';
import { 
  Pill, 
  Activity, 
  HeartPulse, 
  Droplet, 
  Apple, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  ArrowRight,
  Flame,
  Zap,
  Tag
} from 'lucide-react';

interface CuratedTreatmentsRailProps {
  onSelectCategory: (categoryName: string) => void;
}

export const CuratedTreatmentsRail: React.FC<CuratedTreatmentsRailProps> = ({ onSelectCategory }) => {
  const treatments = [
    {
      id: 'cold_flu',
      name: 'Cold & Flu Care',
      category: 'Respiratory',
      monogram: 'CF',
      bgClass: 'bg-rose-50 border-rose-200/80 text-rose-800',
      tag: 'UP TO 30% OFF',
      tagClass: 'bg-rose-100 text-rose-800',
      sample: 'Paracetamol • Cetirizine • Cough Syrups',
      icon: ShieldCheck,
    },
    {
      id: 'pain_relief',
      name: 'Fast Pain Relief',
      category: 'Analgesics & Antipyretics',
      monogram: 'PR',
      bgClass: 'bg-amber-50 border-amber-200/80 text-amber-800',
      tag: 'UP TO 35% OFF',
      tagClass: 'bg-amber-100 text-amber-800',
      sample: 'Paracetamol 650mg • Diclofenac • Tramadol',
      icon: Activity,
    },
    {
      id: 'antibiotics',
      name: 'Antibiotics & Anti-Infectives',
      category: 'Antibiotics',
      monogram: 'AB',
      bgClass: 'bg-emerald-50 border-emerald-200/80 text-emerald-800',
      tag: 'DIRECT PTR',
      tagClass: 'bg-emerald-100 text-emerald-800',
      sample: 'Azithromycin 500mg • Amoxyclav 625mg',
      icon: Pill,
    },
    {
      id: 'gastro',
      name: 'Gastro & Acidity Relief',
      category: 'Gastrointestinal',
      monogram: 'GI',
      bgClass: 'bg-cyan-50 border-cyan-200/80 text-cyan-800',
      tag: 'POPULAR SLAB',
      tagClass: 'bg-cyan-100 text-cyan-800',
      sample: 'Pantoprazole 40mg • Omeprazole • Antacids',
      icon: Droplet,
    },
    {
      id: 'cardiac',
      name: 'Cardiac & Hypertension',
      category: 'Cardiovascular',
      monogram: 'CV',
      bgClass: 'bg-red-50 border-red-200/80 text-red-800',
      tag: 'CRITICAL CARE',
      tagClass: 'bg-red-100 text-red-800',
      sample: 'Telmisartan • Amlodipine • Atorvastatin',
      icon: HeartPulse,
    },
    {
      id: 'diabetes',
      name: 'Diabetic Nutrition & Care',
      category: 'Antidiabetic',
      monogram: 'DM',
      bgClass: 'bg-purple-50 border-purple-200/80 text-purple-800',
      tag: 'UP TO 28% OFF',
      tagClass: 'bg-purple-100 text-purple-800',
      sample: 'Metformin 500mg • Glimepiride • Vildagliptin',
      icon: Layers,
    },
    {
      id: 'vitamins',
      name: 'Vitamins & Multivitamins',
      category: 'Nutritional & Vitamins',
      monogram: 'VT',
      bgClass: 'bg-orange-50 border-orange-200/80 text-orange-800',
      tag: 'FAST MOVING',
      tagClass: 'bg-orange-100 text-orange-800',
      sample: 'Vitamin C • Zincovit • Calcium & D3',
      icon: Apple,
    },
    {
      id: 'dermatology',
      name: 'Skin Relief & Dermatology',
      category: 'Dermatological',
      monogram: 'DM',
      bgClass: 'bg-teal-50 border-teal-200/80 text-teal-800',
      tag: 'TOPICAL CARE',
      tagClass: 'bg-teal-100 text-teal-800',
      sample: 'Candid Dusting • Ointments • Antifungal',
      icon: Tag,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
      {/* Rail Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#1A1A1A] tracking-tight">
              Clinical Formulations by Treatment
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F3F1] text-[#1A504C] uppercase">
              Netmeds & Truemeds Pattern
            </span>
          </div>
          <p className="text-xs text-[#6B7280]">
            Browse wholesale batches grouped by clinical indication and therapeutic care
          </p>
        </div>

        <button
          onClick={() => onSelectCategory('All')}
          className="text-xs font-bold text-[#1A504C] hover:text-[#143F3C] flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View All Categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Scroll Track of Soft-Tinted Pastel Cards */}
      <div className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-200">
        {treatments.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              onClick={() => onSelectCategory(t.category)}
              className={`w-60 sm:w-64 shrink-0 rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-md hover:scale-101 ${t.bgClass}`}
            >
              <div className="space-y-3">
                {/* Header: Monogram & Discount Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center font-heading font-black text-sm group-hover:scale-105 transition-transform">
                    {t.monogram}
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase ${t.tagClass}`}>
                    {t.tag}
                  </span>
                </div>

                {/* Treatment Title */}
                <div>
                  <h4 className="font-heading font-extrabold text-sm sm:text-base leading-snug text-[#1A1A1A] group-hover:text-[#1A504C] transition-colors">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] line-clamp-2 mt-1 leading-relaxed">
                    {t.sample}
                  </p>
                </div>
              </div>

              {/* Bottom Action Hint */}
              <div className="pt-3 mt-2 border-t border-black/5 flex items-center justify-between text-xs font-bold">
                <span className="text-[11px] text-[#1A504C]">Browse Formulations</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#1A504C] transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
