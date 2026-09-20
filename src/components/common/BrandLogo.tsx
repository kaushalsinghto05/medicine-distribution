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
  variant = 'dark',
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Apothecary Register Emblem */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#3D6B52] border border-[#4E8568] flex items-center justify-center text-[#F6F3EC] shadow-xs shrink-0">
        <span className="font-serif font-bold text-lg leading-none">℞</span>
      </div>

      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span className={`font-serif text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-[#F6F3EC]' : 'text-[#1F2E28]'}`}>
            Pharm<span className="text-[#C9A961]">Xpress</span>
          </span>
          {showTag && (
            <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider uppercase rounded border border-[#C9A961]/40 text-[#C9A961] bg-[#C9A961]/10">
              Form 20B/21B Register
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-[#8A8578] block">
          Regulated wholesale trade register
        </span>
      </div>
    </div>
  );
};
