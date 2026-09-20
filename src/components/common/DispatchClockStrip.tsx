import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DispatchClockStripProps {
  cutoffTimeStr?: string; // default "17:30"
}

export const DispatchClockStrip: React.FC<DispatchClockStripProps> = ({ cutoffTimeStr = '17:30' }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isPassed: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  const [urgencyRatio, setUrgencyRatio] = useState(0); // 0 (morning) to 1 (at cutoff)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [cutoffHours, cutoffMinutes] = cutoffTimeStr.split(':').map(Number);
      
      const cutoff = new Date();
      cutoff.setHours(cutoffHours, cutoffMinutes, 0, 0);

      // Total daily window: 9:00 AM (start) to 5:30 PM (cutoff) = 8.5 hours (510 minutes)
      const dayStart = new Date();
      dayStart.setHours(9, 0, 0, 0);

      const diffMs = cutoff.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPassed: true });
        setUrgencyRatio(1);
      } else {
        const totalWindowMs = cutoff.getTime() - dayStart.getTime();
        const elapsedMs = Math.max(0, now.getTime() - dayStart.getTime());
        const ratio = Math.min(1, Math.max(0, elapsedMs / totalWindowMs));
        setUrgencyRatio(ratio);

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isPassed: false });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [cutoffTimeStr]);

  // Determine urgency color:
  // Green (#3D6B52) when > 2 hours, transitions to Rust Red (#B54A32) when < 1 hour
  const totalMinutesLeft = timeLeft.hours * 60 + timeLeft.minutes;
  const isUrgent = totalMinutesLeft < 90 && !timeLeft.isPassed;
  const isCritical = totalMinutesLeft < 30 || timeLeft.isPassed;

  const barColor = isCritical ? '#B54A32' : isUrgent ? '#C9A961' : '#3D6B52';

  return (
    <div className="bg-[#1F2E28] text-[#F6F3EC] border-b border-[#2C3E36] px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Left: Purpose Statement & Working Register Notice */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono">
            <span 
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: isCritical ? '#B54A32' : '#3D6B52' }}
            />
            <span className="text-[#8A8578] uppercase text-[10px] tracking-wider font-semibold">
              Dispatch manifest clock
            </span>
          </div>

          <span className="hidden md:inline text-[#2C3E36]">|</span>

          <p className="text-[#F6F3EC]/90 text-[11px] sm:text-xs">
            {timeLeft.isPassed ? (
              <span>Same-day cutoff closed at 5:30 PM. Orders now queue for tomorrow morning's warehouse manifest.</span>
            ) : (
              <span>Orders confirmed before <strong>5:30 PM</strong> dispatch same-day with signed Form 20B/21B invoice.</span>
            )}
          </p>
        </div>

        {/* Right: The Live Urgency Meter & Countdown */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" style={{ color: barColor }} />
            <span className="font-mono text-[11px] font-bold tracking-tight">
              {timeLeft.isPassed ? (
                <span className="text-[#B54A32]">Manifest closed for today</span>
              ) : (
                <>
                  <span className="text-white text-sm">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[#8A8578] text-[10px] font-normal ml-1">until cutoff</span>
                </>
              )}
            </span>
          </div>

          {/* Depleting progress bar toward 5:30 PM */}
          <div className="w-24 sm:w-32 bg-[#2C3E36] h-1.5 rounded-full overflow-hidden shrink-0">
            <div 
              className="h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ 
                width: `${Math.round(urgencyRatio * 100)}%`,
                backgroundColor: barColor 
              }}
              title={`${Math.round(urgencyRatio * 100)}% of today's dispatch window elapsed`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
