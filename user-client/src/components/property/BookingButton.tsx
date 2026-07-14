'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '../../context/AuthModalContext';
import { isAuthenticated } from '../../services/auth.service';

export default function BookingButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const { openModal } = useAuthModal();

  const handleBookingClick = () => {
    if (isAuthenticated()) {
      router.push(`/requests?propertyId=${propertyId}`);
    } else {
      // If not logged in, open the modal and tell it what to do on success
      openModal(() => {
        router.push(`/requests?propertyId=${propertyId}`);
      });
    }
  };

  return (
    <button 
      onClick={handleBookingClick}
      className="block w-full rounded-xl bg-zinc-900 py-4 text-center font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-primary dark:hover:bg-primary/90"
    >
      Request Booking
    </button>
  );
}
