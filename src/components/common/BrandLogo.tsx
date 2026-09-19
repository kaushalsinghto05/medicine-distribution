import React from 'react';
import { Activity } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTag?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTag = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    lg: 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-sm font-bold',
    md: 'text-base sm:text-lg font-extrabold',
    lg: 'text-xl sm:text-2xl font-black',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${iconSizes[size]} bg-gradient-to-br from-sky-600 via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0`}
      >
        <Activity className="w-5 h-5 stroke-[2.4]" />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`${textSizes[size]} text-slate-900 tracking-tight`}>
            Pharm<span className="text-indigo-600">Xpress</span>
          </span>
          {showTag && (
            <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              B2B Marketplace
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 block font-medium">
          Regulated Distribution Network
        </span>
      </div>
    </div>
  );
};
