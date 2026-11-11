'use client';

import React, { useState, useEffect } from 'react';
import type { Property, Booking } from '@shortlet/shared';
import { BookingCalendar3D } from './BookingCalendar3D';
import { GuestSelector } from './GuestSelector';
import { PriceBreakdown } from './PriceBreakdown';
import { WhatsAppFallbackButton } from './WhatsAppFallbackButton';
import { useCameraStore } from '@/lib/store/useCameraStore';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto overflow-y-auto">
      <div className="glass-panel rounded-glass-lg p-6 sm:p-8 max-w-xl w-full my-8 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8">
          <span className="text-[10px] font-bold tracking-widest text-brand-gold uppercase">
            RESERVATION
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            {property.title}
          </h2>
          <p className="text-xs text-white/60">{property.location}</p>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: DATE & GUEST SELECTION */}
        {step === 'SELECT' && (
          <div className="space-y-4">
            <BookingCalendar3D
              property={property}
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
              onUnavailableAlert={(msg) => setErrorMsg(msg)}
            />

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
                className="w-full py-3.5 px-6 rounded-xl bg-brand-gold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow"
              >
                Reserve & Lock Dates
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
        )}

        {/* STEP 2: GUEST DETAILS & CONFIRM */}
        {step === 'DETAILS' && (
          <form onSubmit={handleConfirmSubmit} className="space-y-4">
            {/* Hold Timer Countdown */}
            <div className="p-3 rounded-xl bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-between text-xs">
              <span className="text-white/80">Dates held exclusively for:</span>
              <span className="font-mono font-bold text-brand-gold text-sm animate-pulse">
                {formatTimer(holdTimer)}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Vance"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Special Concierge Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Arrival time, dietary requests, or private transport..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
                />
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
                className="w-1/3 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white/80 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-3 rounded-xl bg-brand-gold hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Stay'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: RESERVATION CONFIRMED */}
        {step === 'CONFIRMED' && activeBooking && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-brand-gold/20 border border-brand-gold text-brand-gold text-2xl flex items-center justify-center mx-auto shadow-glow">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Reservation Confirmed!</h3>
              <p className="text-xs text-white/60 mt-1">
                Your reservation reference code is:
              </p>
              <div className="font-mono text-sm font-bold text-brand-gold tracking-widest mt-1 bg-white/5 py-1 px-3 rounded-lg inline-block">
                {activeBooking.id.substring(0, 8).toUpperCase()}
              </div>
            </div>

            <div className="glass-panel rounded-glass-sm p-4 text-left text-xs text-white/80 space-y-1.5">
              <div>
                <strong>Check-in:</strong> {activeBooking.checkIn.substring(0, 10)}
              </div>
              <div>
                <strong>Check-out:</strong> {activeBooking.checkOut.substring(0, 10)}
              </div>
              <div>
                <strong>Guest:</strong> {activeBooking.guestName}
              </div>
              <div>
                <strong>Total Amount:</strong> ${activeBooking.totalPrice.toLocaleString()}
              </div>
            </div>

            <p className="text-[11px] text-white/50">
              A confirmation receipt and luxury access pass have been dispatched to{' '}
              <span className="text-white">{activeBooking.guestEmail}</span>.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-brand-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-glow"
            >
              Return to Experience
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
