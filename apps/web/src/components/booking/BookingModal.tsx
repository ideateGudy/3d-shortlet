'use client';

import React, { useState, useEffect } from 'react';
import type { Property, Booking } from '@shortlet/shared';
import { BookingCalendar3D } from './BookingCalendar3D';
import { GuestSelector } from './GuestSelector';
import { PriceBreakdown } from './PriceBreakdown';
import { WhatsAppFallbackButton } from './WhatsAppFallbackButton';
import { useCameraStore } from '@/lib/store/useCameraStore';
import { Calendar, Clock, ShieldCheck, X } from 'lucide-react';

interface BookingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ property, isOpen, onClose }: BookingModalProps) {
  const [selectedRange, setSelectedRange] = useState<{
    checkIn: string | null;
    checkOut: string | null;
  }>({ checkIn: null, checkOut: null });

  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);

  // Form states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Flow states
  const [step, setStep] = useState<'SELECT' | 'DETAILS' | 'CONFIRMED'>('SELECT');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [holdTimer, setHoldTimer] = useState<number>(15 * 60); // 15 mins in seconds
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger camera mode 'VANTAGE' when booking modal opens, and restore 'IMMERSIVE' when closed
  useEffect(() => {
    if (isOpen) {
      useCameraStore.getState().setMode('VANTAGE');
    } else {
      useCameraStore.getState().setMode('IMMERSIVE');
      // Reset state on close
      setStep('SELECT');
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Countdown timer for pending hold
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'DETAILS' && holdTimer > 0) {
      interval = setInterval(() => {
        setHoldTimer((prev) => {
          if (prev <= 1) {
            setErrorMsg('Your 15-minute reservation hold has expired. Please select dates again.');
            setStep('SELECT');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, holdTimer]);

  if (!isOpen) return null;

  const handleHoldSubmit = async () => {
    if (!selectedRange.checkIn || !selectedRange.checkOut) {
      setErrorMsg('Please select both check-in and check-out dates.');
      return;
    }

    setErrorMsg(null);
    setStep('DETAILS');
    setHoldTimer(15 * 60);
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMsg('Please fill in your name, email, and phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      // 1. Create Hold Lock
      const holdRes = await fetch(`${apiUrl}/bookings/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn: selectedRange.checkIn,
          checkOut: selectedRange.checkOut,
          adults,
          children: childrenCount,
          guestName,
          guestEmail,
          guestPhone,
          notes,
        }),
      });

      if (!holdRes.ok) {
        const errorData = await holdRes.json();
        throw new Error(errorData.message || 'The selected dates are no longer available.');
      }

      const holdData = await holdRes.json();

      // 2. Confirm Booking
      const confirmRes = await fetch(`${apiUrl}/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: holdData.id }),
      });

      if (!confirmRes.ok) {
        throw new Error('Failed to confirm reservation.');
      }

      const confirmedData = await confirmRes.json();
      setActiveBooking(confirmedData);
      setStep('CONFIRMED');
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const nightsCount =
    selectedRange.checkIn && selectedRange.checkOut
      ? Math.max(
          1,
          Math.round(
            (new Date(selectedRange.checkOut).getTime() -
              new Date(selectedRange.checkIn).getTime()) /
              (1000 * 3600 * 24)
          )
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md pointer-events-auto overflow-y-auto">
      <div className="glass-panel rounded-glass-lg p-5 sm:p-7 max-w-5xl w-full my-auto text-[var(--text-primary)] relative shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-10 border-b border-black/10 dark:border-white/10 pb-3 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-brand-gold uppercase">
                RESERVATION PORTAL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
              <span className="text-[10px] text-[var(--text-muted)] tracking-wider">
                VANTAGE OVERVIEW ACTIVE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-0.5">
              {property.title}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{property.location}</p>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-700 dark:text-red-200 text-xs flex items-center gap-2 shrink-0">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Content Area with Internal Scroll */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* STEP 1: DATE & GUEST SELECTION (RESPONSIVE SPLIT VIEW) */}
          {step === 'SELECT' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 3D Perspective Calendar (7 cols on desktop) */}
              <div className="lg:col-span-7 space-y-3">
                <BookingCalendar3D
                  property={property}
                  selectedRange={selectedRange}
                  onRangeChange={setSelectedRange}
                  onUnavailableAlert={(msg) => setErrorMsg(msg)}
                />

                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>
                    Select check-in then check-out. Booking dates are locked via double-booking exclusion constraints.
                  </span>
                </div>
              </div>

              {/* Right Column: Guests, Breakdown & Actions (5 cols on desktop) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Selected Dates Display Card */}
                <div className="glass-panel rounded-xl p-3.5 border border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-gold" />
                    <div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase">Dates</div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {selectedRange.checkIn || 'Select In'} → {selectedRange.checkOut || 'Select Out'}
                      </div>
                    </div>
                  </div>
                  {nightsCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-brand-gold/20 text-brand-gold font-mono font-bold text-[11px]">
                      {nightsCount} {nightsCount === 1 ? 'night' : 'nights'}
                    </span>
                  )}
                </div>

                <GuestSelector
                  adults={adults}
                  childrenCount={childrenCount}
                  maxGuests={property.maxGuests}
                  onChange={(counts) => {
                    setAdults(counts.adults);
                    setChildrenCount(counts.children);
                  }}
                />

                <PriceBreakdown
                  pricePerNight={property.pricePerNight}
                  cleaningFee={property.cleaningFee}
                  checkIn={selectedRange.checkIn}
                  checkOut={selectedRange.checkOut}
                />

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    disabled={!selectedRange.checkIn || !selectedRange.checkOut}
                    onClick={handleHoldSubmit}
                    className="w-full py-3.5 px-6 rounded-xl bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow flex items-center justify-center gap-2"
                  >
                    <span>Reserve & Lock Dates (15m Hold)</span>
                    <span>→</span>
                  </button>

                  <WhatsAppFallbackButton
                    propertyTitle={property.title}
                    checkIn={selectedRange.checkIn}
                    checkOut={selectedRange.checkOut}
                    adults={adults}
                    childrenCount={childrenCount}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GUEST DETAILS & CONFIRM */}
          {step === 'DETAILS' && (
            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              {/* Hold Timer Countdown */}
              <div className="p-3.5 rounded-xl bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-gold animate-spin" />
                  <span className="text-[var(--text-primary)] font-medium">Dates held exclusively for your checkout:</span>
                </div>
                <span className="font-mono font-bold text-brand-gold text-sm">
                  {formatTimer(holdTimer)}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form Fields (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Johnathan Vance"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                      Special Concierge Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Arrival time, dietary requests, or private transport..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>
                </div>

                {/* Right Column: Breakdown & Submit (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="glass-panel rounded-xl p-4 border border-black/10 dark:border-white/10 space-y-2 text-xs">
                    <div className="text-[10px] uppercase font-bold text-brand-gold">
                      Reservation Summary
                    </div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{property.title}</div>
                    <div className="text-[var(--text-secondary)]">
                      {selectedRange.checkIn} → {selectedRange.checkOut} ({nightsCount} nights)
                    </div>
                    <div className="text-[var(--text-secondary)]">
                      Guests: {adults} Adults{childrenCount > 0 ? `, ${childrenCount} Children` : ''}
                    </div>
                  </div>

                  <PriceBreakdown
                    pricePerNight={property.pricePerNight}
                    cleaningFee={property.cleaningFee}
                    checkIn={selectedRange.checkIn}
                    checkOut={selectedRange.checkOut}
                  />

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('SELECT')}
                      className="w-1/3 py-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-semibold text-[var(--text-secondary)] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-2/3 py-3 rounded-xl bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow"
                    >
                      {isSubmitting ? 'Confirming...' : 'Confirm Stay'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: RESERVATION CONFIRMED */}
          {step === 'CONFIRMED' && activeBooking && (
            <div className="text-center py-6 sm:py-8 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-full bg-brand-gold/20 border border-brand-gold text-brand-gold text-2xl flex items-center justify-center mx-auto shadow-glow">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Reservation Confirmed!</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Your reservation reference code is:
                </p>
                <div className="font-mono text-sm font-bold text-brand-gold tracking-widest mt-1.5 bg-black/5 dark:bg-white/5 py-1.5 px-4 rounded-lg inline-block border border-brand-gold/30">
                  {activeBooking.id.substring(0, 8).toUpperCase()}
                </div>
              </div>

              <div className="glass-panel rounded-glass-sm p-4 text-left text-xs text-[var(--text-primary)] space-y-2 border border-black/10 dark:border-white/10">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Residence:</span>
                  <span className="font-semibold">{property.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Check-in:</span>
                  <span className="font-semibold">{activeBooking.checkIn.substring(0, 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Check-out:</span>
                  <span className="font-semibold">{activeBooking.checkOut.substring(0, 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Guest:</span>
                  <span className="font-semibold">{activeBooking.guestName}</span>
                </div>
                <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-2 text-brand-gold font-bold">
                  <span>Total Amount:</span>
                  <span>${activeBooking.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-muted)]">
                A confirmation receipt and luxury access pass have been dispatched to{' '}
                <span className="font-medium text-[var(--text-primary)]">{activeBooking.guestEmail}</span>.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-brand-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-glow"
              >
                Return to Experience
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
