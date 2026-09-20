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
    // Frame 1: soft fade in (450ms)
    const fadeInTimer = setTimeout(() => {
      setOpacity(1);
    }, 50);

    // Frame 2: hold (~850ms), then begin smooth cross-fade out (500ms)
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, 1400);

    // Frame 3: fully unmount from DOM
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, 1900);

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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1F2E28] cursor-pointer select-none transition-opacity duration-500 ease-out"
      style={{ opacity }}
      role="banner"
      aria-label="PharmXpress Title Plate"
    >
      {/* Centered Title Plate Card */}
      <div className="flex flex-col items-center text-center px-6 max-w-lg">
        {/* Apothecary ℞ Mark Emblem (4-6x normal header size) */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#16221E] border border-[#3D6B52]/60 flex items-center justify-center mb-6 shadow-2xl relative">
          {/* Subtle inner hairline border */}
          <div className="absolute inset-1.5 rounded-xl border border-[#C9A961]/30 pointer-events-none" />
          <span className="font-serif text-4xl sm:text-5xl font-bold text-[#C9A961] tracking-normal select-none">
            ℞
          </span>
        </div>

        {/* Wordmark in Source Serif 4 */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F6F3EC]">
          PharmXpress
        </h1>

        {/* Small Tagline in IBM Plex Mono */}
        <p className="font-mono text-xs sm:text-sm text-[#8A8578] uppercase tracking-[0.2em] mt-3.5">
          Regulated wholesale trade register
        </p>

        {/* Discreet skip hint */}
        <span className="text-[10px] font-mono text-[#8A8578]/50 mt-10">
          Click anywhere to enter
        </span>
      </div>
    </div>
  );
};
