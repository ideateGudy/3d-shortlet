'use client';

import React from 'react';

interface WhatsAppFallbackButtonProps {
  propertyTitle: string;
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  childrenCount: number;
  totalPrice?: number;
}

export function WhatsAppFallbackButton({
  propertyTitle,
  checkIn,
  checkOut,
  adults,
  childrenCount,
  totalPrice,
}: WhatsAppFallbackButtonProps) {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

  const totalGuests = adults + childrenCount;
  let message = `Hello! I would like to inquire about reserving *${propertyTitle}*.`;

  if (checkIn && checkOut) {
    message += `\n• Dates: ${checkIn} to ${checkOut}`;
    message += `\n• Guests: ${totalGuests} (${adults} Adults, ${childrenCount} Children)`;
    if (totalPrice) {
      message += `\n• Estimated Total: $${totalPrice.toLocaleString()}`;
    }
  }

  const encodedUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={encodedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/20 text-xs font-semibold text-[var(--text-primary)] tracking-wide transition-all shadow-lg hover:border-brand-gold"
    >
      <span className="text-emerald-500 dark:text-emerald-400 font-bold">WhatsApp Concierge Direct</span>
      <span className="text-xs">↗</span>
    </a>
  );
}
