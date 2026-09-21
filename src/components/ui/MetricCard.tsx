import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'teal' | 'amber' | 'red' | 'sky' | 'emerald' | 'rose' | 'indigo' | 'purple';
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
  color = 'teal',
  trend,
  subtext,
  onClick,
  className = '',
}) => {
  // Strict 3-color system for dashboard stats:
  // 1. Teal (Brand) -> Neutral / Informational
  // 2. Amber -> Warning (Low stock)
  // 3. Red -> Action Required (Pending returns)
  const resolveColor = (c: string) => {
    switch (c) {
      case 'amber':
        return {
          iconColor: 'text-amber-600',
          accent: 'text-amber-700',
        };
      case 'red':
      case 'rose':
        return {
          iconColor: 'text-red-600',
          accent: 'text-red-700',
        };
      case 'teal':
      case 'sky':
      case 'emerald':
      case 'indigo':
      case 'purple':
      default:
        return {
          iconColor: 'text-[#1A504C]',
          accent: 'text-[#1A504C]',
        };
    }
  };

  const selected = resolveColor(color);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-4 border border-gray-200 transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-[#1A504C]/40 hover:bg-[#F5F8F6]/30' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold text-[#6B7280] truncate">{label}</p>
          <p className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        {/* Flat inline line-icon with NO circular or tinted background */}
        <Icon className={`w-5 h-5 stroke-[2] shrink-0 mt-0.5 ${selected.iconColor}`} />
      </div>

      {(trend || subtext) && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 font-bold ${
                  trend.isPositive ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
              {trend.label && <span className="text-[#6B7280]">{trend.label}</span>}
            </div>
          ) : (
            <span className="text-[#6B7280] text-[11px] truncate">{subtext}</span>
          )}
        </div>
      )}
    </div>
  );
};
