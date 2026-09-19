import React from 'react';

interface PharmaPatternProps {
  className?: string;
  opacity?: number;
}

export const PharmaPattern: React.FC<PharmaPatternProps> = ({ className = '', opacity = 0.03 }) => {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <pattern id="pharma-grid-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Subtle capsule contour */}
          <rect x="15" y="15" width="22" height="10" rx="5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="26" y1="15" x2="26" y2="25" stroke="currentColor" strokeWidth="1.2" />
          {/* Subtle molecular network connection */}
          <circle cx="60" cy="20" r="3" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="70" cy="55" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="45" cy="65" r="3.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="60" y1="20" x2="70" y2="55" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="70" y1="55" x2="45" y2="65" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
          {/* Subtle medical cross */}
          <path d="M20 55h8m-4-4v8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pharma-grid-pattern)" />
    </svg>
  );
};
