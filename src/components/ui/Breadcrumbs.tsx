import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center gap-1.5 text-xs text-slate-500 font-medium ${className}`} aria-label="Breadcrumb">
      <span className="flex items-center gap-1 text-slate-400">
        <Home className="w-3.5 h-3.5" />
      </span>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            {isLast || !item.onClick ? (
              <span className={`truncate max-w-[150px] sm:max-w-xs ${isLast ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-indigo-600 transition-colors truncate max-w-[150px] sm:max-w-xs"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
