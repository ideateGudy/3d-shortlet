'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { DayAvailability, Property } from '@shortlet/shared';

interface BookingCalendar3DProps {
  property: Property;
  selectedRange: { checkIn: string | null; checkOut: string | null };
  onRangeChange: (range: { checkIn: string | null; checkOut: string | null }) => void;
  onUnavailableAlert?: (message: string) => void;
}

export function BookingCalendar3D({
  property,
  selectedRange,
  onRangeChange,
  onUnavailableAlert,
}: BookingCalendar3DProps) {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [days, setDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // 3D perspective tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const fetchAvailability = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/properties/${property.id}/availability?month=${currentMonth}`);
      if (!res.ok) throw new Error('Failed to load availability');
      const data = await res.json();
      setDays(data.days || []);
    } catch {
      // Fallback: generate local month days if API not reached yet
      const [yStr, mStr] = currentMonth.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const lastDay = new Date(y, m, 0).getDate();
      const mockDays: DayAvailability[] = [];
      const todayStr = new Date().toISOString().split('T')[0];

      for (let d = 1; d <= lastDay; d++) {
        const dStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        mockDays.push({
          date: dStr,
          status: dStr < todayStr ? 'past' : 'available',
          price: property.pricePerNight,
        });
      }
      setDays(mockDays);
    } finally {
      setLoading(false);
    }
  }, [property.id, property.pricePerNight, currentMonth]);

  // Initial fetch and auto-refresh every 30s + window focus
  useEffect(() => {
    fetchAvailability();
    const interval = setInterval(fetchAvailability, 30000);

    const handleFocus = () => {
      fetchAvailability();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAvailability]);

  // Pointer move tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const maxTilt = 8; // degrees
    const rotateY = (x / (rect.width / 2)) * maxTilt;
    const rotateX = -(y / (rect.height / 2)) * maxTilt;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Month navigation
  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  // Date selection logic
  const handleDateClick = (day: DayAvailability) => {
    if (day.status === 'past' || day.status === 'booked' || day.status === 'blocked') {
      return;
    }

    const { checkIn, checkOut } = selectedRange;

    // Case 1: No check-in selected yet, or both already selected -> set new check-in
    if (!checkIn || (checkIn && checkOut)) {
      onRangeChange({ checkIn: day.date, checkOut: null });
      return;
    }

    // Case 2: check-in is selected, clicking earlier date -> reset check-in to clicked date
    if (checkIn && day.date < checkIn) {
      onRangeChange({ checkIn: day.date, checkOut: null });
      return;
    }

    // Case 3: clicking same date as check-in -> ignore or deselect
    if (checkIn === day.date) {
      return;
    }

    // Case 4: selecting checkOut -> verify range does not span any taken dates!
    const rangeSpanConflict = days.some((d) => {
      return (
        d.date > checkIn &&
        d.date < day.date &&
        (d.status === 'booked' || d.status === 'blocked' || d.status === 'held')
      );
    });

    if (rangeSpanConflict) {
      onUnavailableAlert?.(
        'The selected date range spans unavailable days. Please select continuous available dates.'
      );
      return;
    }

    // Check min / max nights
    const diffDays = Math.round(
      (new Date(day.date).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays < property.minNights) {
      onUnavailableAlert?.(`Minimum stay is ${property.minNights} nights.`);
      return;
    }

    if (diffDays > property.maxNights) {
      onUnavailableAlert?.(`Maximum stay is ${property.maxNights} nights.`);
      return;
    }

    onRangeChange({ checkIn, checkOut: day.date });
  };

  // Month header label formatting
  const monthDate = new Date(`${currentMonth}-01T00:00:00Z`);
  const monthLabel = monthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  // Calculate day offset for 1st day of month (0 = Sun)
  const firstDayWeekday = new Date(`${currentMonth}-01T00:00:00Z`).getUTCDay();

  return (
    <div
      className="perspective-1000 w-full select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="glass-panel rounded-glass-lg p-5 transition-transform duration-200 ease-out preserve-3d"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <div className="text-center">
            <h4 className="text-sm font-semibold tracking-wide text-white uppercase">
              {monthLabel}
            </h4>
            <span className="text-[10px] text-brand-gold tracking-widest uppercase">
              Live Availability
            </span>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 transition-colors"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
            <span key={w} className="text-[11px] font-medium text-white/40">
              {w}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {days.map((day) => {
            const isCheckIn = selectedRange.checkIn === day.date;
            const isCheckOut = selectedRange.checkOut === day.date;
            const inRange =
              selectedRange.checkIn &&
              selectedRange.checkOut &&
              day.date > selectedRange.checkIn &&
              day.date < selectedRange.checkOut;
            const inHoverRange =
              selectedRange.checkIn &&
              !selectedRange.checkOut &&
              hoverDate &&
              day.date > selectedRange.checkIn &&
              day.date <= hoverDate;

            const isAvailable = day.status === 'available';
            const isTaken = day.status === 'booked' || day.status === 'blocked';
            const isHeld = day.status === 'held';
            const isPast = day.status === 'past';

            let cellClass =
              'relative h-10 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all ';

            if (isCheckIn || isCheckOut) {
              cellClass += 'bg-brand-gold text-black font-bold shadow-glow scale-105 z-10';
            } else if (inRange || inHoverRange) {
              cellClass += 'bg-brand-gold/25 text-white border border-brand-gold/40';
            } else if (isAvailable) {
              cellClass += 'bg-white/5 hover:bg-white/20 text-white cursor-pointer hover:border hover:border-white/30';
            } else if (isHeld) {
              cellClass += 'bg-amber-500/10 text-amber-300/60 cursor-not-allowed line-through opacity-70';
            } else if (isTaken) {
              cellClass += 'bg-red-500/10 text-red-300/40 cursor-not-allowed line-through opacity-50';
            } else if (isPast) {
              cellClass += 'text-white/20 cursor-not-allowed opacity-40';
            }

            const dayNumber = parseInt(day.date.split('-')[2], 10);

            return (
              <button
                key={day.date}
                type="button"
                disabled={!isAvailable && !isCheckOut}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoverDate(day.date)}
                onMouseLeave={() => setHoverDate(null)}
                className={cellClass}
              >
                <span>{dayNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-around text-[10px] text-white/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/80" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-gold shadow-glow" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Hold (15m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400/80" />
            <span>Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
