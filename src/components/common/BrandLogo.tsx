import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTag?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTag = true,
  className = '',
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Tile: Deep Apollo Teal Tile with Clean Medical Emblem */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1A504C] flex items-center justify-center text-white shadow-xs shrink-0">
        <span className="font-bold text-lg tracking-tight leading-none">℞</span>
      </div>

      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>
            Pharm<span className="text-[#1A504C]">Xpress</span>
          </span>
          {showTag && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-[#E8F3F1] text-[#1A504C]">
              B2B Wholesale
            </span>
          )}
        </div>
        <span className={`text-[11px] font-medium block ${isDark ? 'text-gray-300' : 'text-[#6B7280]'}`}>
          Regulated Wholesale Medicine Network
        </span>
      </div>
    </div>
  );
};
