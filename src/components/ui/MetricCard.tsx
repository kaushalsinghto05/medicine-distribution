import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  subtext?: string;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  color = 'indigo',
  trend,
  subtext,
  onClick,
  className = '',
}) => {
  const colorMap = {
    sky: {
      border: 'border-l-4 border-l-sky-500',
      iconBg: 'bg-sky-50 text-sky-600',
      accent: 'text-sky-600',
    },
    emerald: {
      border: 'border-l-4 border-l-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600',
      accent: 'text-emerald-600',
    },
    amber: {
      border: 'border-l-4 border-l-amber-500',
      iconBg: 'bg-amber-50 text-amber-700',
      accent: 'text-amber-700',
    },
    rose: {
      border: 'border-l-4 border-l-rose-500',
      iconBg: 'bg-rose-50 text-rose-600',
      accent: 'text-rose-600',
    },
    indigo: {
      border: 'border-l-4 border-l-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600',
      accent: 'text-indigo-600',
    },
    purple: {
      border: 'border-l-4 border-l-purple-600',
      iconBg: 'bg-purple-50 text-purple-600',
      accent: 'text-purple-600',
    },
  };

  const selected = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-150 ${selected.border} ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${selected.iconBg}`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      {(trend || subtext) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 font-bold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
              {trend.label && <span className="text-slate-400">{trend.label}</span>}
            </div>
          ) : (
            <span className="text-slate-500">{subtext}</span>
          )}
        </div>
      )}
    </div>
  );
};
