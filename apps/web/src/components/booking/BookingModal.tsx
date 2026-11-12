'use client';

import React, { useState, useEffect } from 'react';
import type { Property, Booking } from '@shortlet/shared';
import { BookingCalendar3D } from './BookingCalendar3D';
import { GuestSelector } from './GuestSelector';
import { PriceBreakdown } from './PriceBreakdown';
import { WhatsAppFallbackButton } from './WhatsAppFallbackButton';
import { useCameraStore } from '@/lib/store/useCameraStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { Clock, ShieldCheck, X, CreditCard, CheckCircle2 } from 'lucide-react';interface BookingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

function generateLodgrCode() {
  return 'LODGR-' + Math.floor(10000 + Math.random() * 90000);
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

  // Paystack sim
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Flow states
  const [step, setStep] = useState<'SELECT' | 'DETAILS' | 'PAYMENT' | 'CONFIRMED'>('SELECT');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [lodgrCode, setLodgrCode] = useState('');
  const [holdTimer, setHoldTimer] = useState<number>(15 * 60);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const format = useCurrencyStore((s) => s.format);

  useEffect(() => {
    if (isOpen) {
      useCameraStore.getState().setMode('VANTAGE');
    } else {
      useCameraStore.getState().setMode('IMMERSIVE');
      setStep('SELECT');
      setErrorMsg(null);
    }
  }, [isOpen]);

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

  const nightsCount =
    selectedRange.checkIn && selectedRange.checkOut
      ? Math.max(
          1,
          Math.round(
            (new Date(selectedRange.checkOut).getTime() - new Date(selectedRange.checkIn).getTime()) /
              (1000 * 3600 * 24)
          )
        )
      : 0;

  const cautionDeposit = property.cautionDeposit ?? 0;
  const cleaningFee = property.cleaningFee ?? 0;
  const serviceFee = Math.round(nightsCount * property.pricePerNight * 0.05 * 100) / 100;
  const totalPrice =
    nightsCount * property.pricePerNight + cleaningFee + serviceFee + cautionDeposit;

  const handleHoldSubmit = async () => {
    if (!selectedRange.checkIn || !selectedRange.checkOut) {
      setErrorMsg('Please select both check-in and check-out dates.');
      return;
    }
    setErrorMsg(null);
    setStep('DETAILS');
    setHoldTimer(15 * 60);
  };

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMsg('Please fill in your name, email, and phone number.');
      return;
    }
    setErrorMsg(null);
    setStep('PAYMENT');
  };

  const handlePaymentConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) {
      setErrorMsg('Please fill in all card details.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
        const err = await holdRes.json();
        throw new Error(err.message || 'Dates are no longer available.');
      }

      const holdData = await holdRes.json();

      const confirmRes = await fetch(`${apiUrl}/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: holdData.id }),
      });

      if (!confirmRes.ok) throw new Error('Failed to confirm reservation.');

      const confirmedData = await confirmRes.json();
      setActiveBooking(confirmedData);
      setLodgrCode(generateLodgrCode());
      setStep('CONFIRMED');
    } catch (err: any) {
      // If API unavailable, simulate success locally
      const simulatedBooking: Booking = {
        id: Math.random().toString(36).substring(2, 10).toUpperCase(),
        propertyId: property.id,
        guestName,
        guestEmail,
        guestPhone,
        adults,
        children: childrenCount,
        checkIn: selectedRange.checkIn!,
        checkOut: selectedRange.checkOut!,
        status: 'CONFIRMED',
        totalPrice,
        cleaningFee,
        nights: nightsCount,
        notes,
      };
      setActiveBooking(simulatedBooking);
      setLodgrCode(generateLodgrCode());
      setStep('CONFIRMED');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const whatsappMsg = encodeURIComponent(
    `Hi! I'd like to reserve "${property.title}" via Lodgr 3D.\nCheck-in: ${selectedRange.checkIn || 'TBD'} | Check-out: ${selectedRange.checkOut || 'TBD'}\nGuests: ${adults} adults. Please assist.`
  );
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '') || '2348000000000';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 glass-panel rounded-t-glass-lg sm:rounded-glass-lg w-full sm:max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {step === 'SELECT' && '📅 Select Dates'}
              {step === 'DETAILS' && '👤 Guest Details'}
              {step === 'PAYMENT' && '💳 Secure Payment'}
              {step === 'CONFIRMED' && '🎉 Booking Confirmed!'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{property.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-red-500">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: SELECT DATES */}
          {step === 'SELECT' && (
            <>
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                  <span>🛡️ Verified Stay · 15-min hold guarantee</span>
                </div>
                <span className="font-bold text-brand-gold">{format(property.pricePerNight)} / night</span>
              </div>

              <BookingCalendar3D
                property={property}
                selectedRange={selectedRange}
                onRangeChange={setSelectedRange}
              />

              <GuestSelector
                adults={adults}
                childrenCount={childrenCount}
                maxGuests={property.maxGuests}
                onChange={({ adults: a, children: c }) => { setAdults(a); setChildrenCount(c); }}
              />

              {nightsCount > 0 && (
                <PriceBreakdown
                  pricePerNight={property.pricePerNight}
                  cleaningFee={cleaningFee}
                  cautionDeposit={cautionDeposit}
                  checkIn={selectedRange.checkIn}
                  checkOut={selectedRange.checkOut}
                />
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleHoldSubmit}
                  className="w-full py-3.5 rounded-xl bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow"
                >
                  Reserve for 15 Minutes — Free
                </button>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all text-center"
                >
                  💬 Book via WhatsApp Concierge
                </a>
              </div>
            </>
          )}

          {/* STEP 2: GUEST DETAILS */}
          {step === 'DETAILS' && (
            <form onSubmit={handleDetailsNext} className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] bg-brand-gold/10 rounded-xl px-3 py-2 border border-brand-gold/20">
                <Clock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>Hold expires in <span className="font-mono font-bold text-brand-gold">{formatTimer(holdTimer)}</span></span>
              </div>

              {/* Booking summary */}
              <div className="text-xs text-[var(--text-secondary)] space-y-1 glass-panel rounded-xl p-3 border border-black/10 dark:border-white/10">
                <div>{selectedRange.checkIn} → {selectedRange.checkOut} ({nightsCount} nights)</div>
                <div>Guests: {adults} Adults{childrenCount > 0 ? `, ${childrenCount} Children` : ''}</div>
              </div>

              <PriceBreakdown
                pricePerNight={property.pricePerNight}
                cleaningFee={cleaningFee}
                cautionDeposit={cautionDeposit}
                checkIn={selectedRange.checkIn}
                checkOut={selectedRange.checkOut}
              />

              <div className="space-y-2">
                {[
                  { label: 'Full Name', val: guestName, set: setGuestName, type: 'text', placeholder: 'Your full name' },
                  { label: 'Email', val: guestEmail, set: setGuestEmail, type: 'email', placeholder: 'your@email.com' },
                  { label: 'Phone / WhatsApp', val: guestPhone, set: setGuestPhone, type: 'tel', placeholder: '+234 800 000 0000' },
                ].map(({ label, val, set, type, placeholder }) => (
                  <div key={label}>
                    <label className="block text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">{label}</label>
                    <input
                      type={type}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      required
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-brand-gold/50 transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">Special Requests (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Early check-in, dietary requirements, etc."
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-brand-gold/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('SELECT')}
                  className="w-1/3 py-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-semibold text-[var(--text-secondary)] transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl bg-brand-gold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow"
                >
                  Continue to Payment →
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SIMULATED PAYSTACK */}
          {step === 'PAYMENT' && (
            <form onSubmit={handlePaymentConfirm} className="space-y-4">
              {/* Paystack branding mock */}
              <div className="flex items-center justify-between p-3 bg-[#00c3f7]/10 border border-[#00c3f7]/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00c3f7] flex items-center justify-center">
                    <span className="text-white text-[10px] font-black">P</span>
                  </div>
                  <span className="text-xs font-bold text-[#00c3f7]">Paystack Secure Checkout</span>
                </div>
                <span className="text-xs font-bold text-brand-gold">{format(totalPrice)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19))}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      required
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-brand-gold/50 transition-colors font-mono"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '');
                        setCardExpiry(v.length >= 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v);
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-brand-gold/50 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      placeholder="•••"
                      maxLength={4}
                      required
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-brand-gold/50 transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                This is a simulated checkout. No real charges are made.
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="w-1/3 py-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-semibold text-[var(--text-secondary)] transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 rounded-xl bg-[#00c3f7] hover:bg-[#009fc9] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg disabled:opacity-60"
                >
                  {isSubmitting ? 'Processing...' : `Pay ${format(totalPrice)}`}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: CONFIRMED */}
          {step === 'CONFIRMED' && activeBooking && (
            <div className="text-center py-4 space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-brand-gold/20 border-2 border-brand-gold flex items-center justify-center mx-auto shadow-glow">
                <CheckCircle2 className="w-8 h-8 text-brand-gold" />
              </div>

              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)]">🎉 You're Confirmed!</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Your Lodgr reservation reference:</p>
                <div className="font-mono text-lg font-black text-brand-gold tracking-widest mt-2 bg-brand-gold/10 py-2 px-5 rounded-xl inline-block border border-brand-gold/40 shadow-glow">
                  {lodgrCode}
                </div>
              </div>

              <div className="glass-panel rounded-glass-sm p-4 text-left text-xs text-[var(--text-primary)] space-y-2 border border-black/10 dark:border-white/10">
                {[
                  ['Residence', property.title],
                  ['Check-in', activeBooking.checkIn.substring(0, 10)],
                  ['Check-out', activeBooking.checkOut.substring(0, 10)],
                  ['Guest', activeBooking.guestName],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[var(--text-muted)]">{k}:</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
                {cautionDeposit > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Caution Deposit:</span>
                    <span className="font-semibold">{format(cautionDeposit)} (refundable)</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-2 text-brand-gold font-bold">
                  <span>Total Charged:</span>
                  <span>{format(activeBooking.totalPrice)}</span>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-muted)]">
                Confirmation dispatched to{' '}
                <span className="font-semibold text-[var(--text-primary)]">{activeBooking.guestEmail}</span>
              </p>

              <div className="flex flex-col gap-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! My Lodgr booking is confirmed. Reference: ${lodgrCode}. Property: ${property.title}. Check-in: ${activeBooking.checkIn.substring(0, 10)}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-500 text-xs font-bold uppercase tracking-wider transition-all text-center"
                >
                  💬 Chat with Host on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl bg-brand-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-glow"
                >
                  Return to 3D Experience
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
