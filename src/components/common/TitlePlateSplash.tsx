import React, { useEffect, useState } from 'react';

interface TitlePlateSplashProps {
  onDismiss?: () => void;
}

export const TitlePlateSplash: React.FC<TitlePlateSplashProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // 1. Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(false);
      if (onDismiss) onDismiss();
      return;
    }

    // 2. Check if already shown this session
    const hasShown = sessionStorage.getItem('pharmxpress_title_plate_shown');
    if (hasShown) {
      setIsVisible(false);
      if (onDismiss) onDismiss();
      return;
    }

    // Mark as shown immediately so any reload or nav won't replay
    sessionStorage.setItem('pharmxpress_title_plate_shown', 'true');

    // 3. Calm title plate sequence:
    // Frame 1: soft fade in (400ms)
    const fadeInTimer = setTimeout(() => {
      setOpacity(1);
    }, 40);

    // Frame 2: hold (~850ms), then begin smooth cross-fade out (450ms)
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, 1300);

    // Frame 3: fully unmount from DOM
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, 1800);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, [onDismiss]);

  // Instant dismissal on any user click, tap, or key press
  const handleInstantDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = () => {
      handleInstantDismiss();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      onClick={handleInstantDismiss}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white cursor-pointer select-none transition-opacity duration-500 ease-out"
      style={{ opacity }}
      role="banner"
      aria-label="PharmXpress Title Plate"
    >
      {/* Centered Brand Moment (Apollo / Retail Style) */}
      <div className="flex flex-col items-center text-center px-6 max-w-lg">
        {/* Deep Apollo Teal Emblem (4-6x normal header size) */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#1A504C] flex items-center justify-center mb-6 shadow-xl relative">
          <span className="text-4xl sm:text-5xl font-extrabold text-white leading-none select-none">
            ℞
          </span>
        </div>

        {/* Wordmark in Bold Sans-Serif */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1A1A1A]">
          Pharm<span className="text-[#1A504C]">Xpress</span>
        </h1>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-[#6B7280] font-bold uppercase tracking-[0.2em] mt-3">
          Regulated Wholesale Trade Platform
        </p>

        {/* Subtle skip hint */}
        <span className="text-[11px] text-gray-400 mt-8">
          Click anywhere to enter
        </span>
      </div>
    </div>
  );
};
