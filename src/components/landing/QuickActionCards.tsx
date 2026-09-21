import React from 'react';
import { 
  Pill, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  Building2, 
  Layers, 
  Clock,
  Sparkles
} from 'lucide-react';

import { useStore } from '../../context/StoreContext';

interface QuickActionCardsProps {
  onExploreCatalog?: () => void;
  onOpenLicenses?: () => void;
}

export const QuickActionCards: React.FC<QuickActionCardsProps> = () => {
  const { navigateToPage } = useStore();

  const actions = [
    {
      title: 'Direct Manufacturer PTR',
      subtitle: 'Wholesale margins up to 35% with direct factory slab pricing',
      icon: Pill,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionLabel: 'EXPLORE CATALOG',
      onClick: () => navigateToPage('marketplace'),
      tag: 'Save up to 35%',
      tagColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Cold-Chain Telemetry (2°C–8°C)',
      subtitle: 'IoT-monitored active thermal transit with digital temperature manifests',
      icon: Truck,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
      actionLabel: 'COLD-CHAIN FLEET',
      onClick: () => navigateToPage('coldchain'),
      tag: 'Monitored FEFO',
      tagColor: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'CDSCO Form 20B/21B Network',
      subtitle: 'Statutory verified wholesale network preventing counterfeit medicines',
      icon: ShieldCheck,
      iconBg: 'bg-teal-50 text-[#1A504C] border-teal-200',
      actionLabel: 'VERIFY LICENSES',
      onClick: () => navigateToPage('licenses'),
      tag: '100% Compliant',
      tagColor: 'bg-teal-100 text-teal-800',
    },
    {
      title: 'Wholesale Trade Credit',
      subtitle: 'Net-30 & Net-60 institutional credit facility for verified stockists',
      icon: CreditCard,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
      actionLabel: 'CREDIT FACILITY',
      onClick: () => navigateToPage('credit'),
      tag: 'Institutional Terms',
      tagColor: 'bg-amber-100 text-amber-800',
    },
  ];

  const trustStats = [
    { label: 'Network Fulfillment Depots', value: '100+', subtext: 'Across Indian States' },
    { label: 'Active Trade Formulations', value: '500+', subtext: 'CDSCO Registered' },
    { label: 'Batch-Level Allocation', value: '100%', subtext: 'Strict FEFO Compliance' },
    { label: 'Depot Dispatch Cutoff', value: '4 Hours', subtext: 'Same-Day Fast Route' },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Feature Cards Grid (Apollo / Medkart Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <div
              key={idx}
              onClick={act.onClick}
              className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#1A504C] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${act.iconBg} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${act.tagColor}`}>
                    {act.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#1A504C] transition-colors leading-snug">
                    {act.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed line-clamp-2">
                    {act.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1A504C]">
                <span>{act.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Network Scale Strip (Medkart Pattern) */}
      <div className="bg-[#F5F8F6] rounded-2xl p-5 border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
        {trustStats.map((stat, idx) => (
          <div key={idx} className={`pt-3 sm:pt-0 ${idx > 0 ? 'sm:pl-5' : ''}`}>
            <div className="text-2xl sm:text-3xl font-heading font-black text-[#1A1A1A] tabular-nums tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs font-bold text-[#1A504C] mt-0.5">
              {stat.label}
            </div>
            <div className="text-[11px] text-[#6B7280]">
              {stat.subtext}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
