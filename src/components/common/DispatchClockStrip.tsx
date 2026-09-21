import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Zap } from 'lucide-react';

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

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [cutoffHours, cutoffMinutes] = cutoffTimeStr.split(':').map(Number);
      
      const cutoff = new Date();
      cutoff.setHours(cutoffHours, cutoffMinutes, 0, 0);

      const diffMs = cutoff.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPassed: true });
      } else {
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

  const totalMinutesLeft = timeLeft.hours * 60 + timeLeft.minutes;
  const isUrgent = totalMinutesLeft < 60 && !timeLeft.isPassed;

  return (
    <div className="bg-[#F5F8F6] text-[#1A1A1A] border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Dispatch Commitment */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="flex items-center gap-1 font-bold text-[#1A504C]">
            <Zap className="w-3.5 h-3.5 text-[#1A504C] fill-[#1A504C]" />
            Same-Day Dispatch Cutoff: 5:30 PM
          </span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span className="text-[#6B7280] hidden sm:inline">
            Direct warehouse dispatches across licensed state wholesale depots
          </span>
        </div>

        {/* Right: Live Remaining Countdown */}
        <div className="flex items-center gap-2">
          <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-[#EA580C]' : 'text-[#1A504C]'}`} />
          <span className="text-[#6B7280]">
            {timeLeft.isPassed ? (
              <span className="font-semibold text-gray-500">Cutoff reached • Queued for tomorrow 09:00 AM</span>
            ) : (
              <span>
                Time remaining:{' '}
                <strong className={`tabular-nums font-bold ${isUrgent ? 'text-[#EA580C]' : 'text-[#1A504C]'}`}>
                  {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </strong>
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
